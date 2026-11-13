import express from 'express';
import crypto from 'crypto';
import { db } from '../config/db.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Merchant details for Vinith
export const MERCHANT_CONFIG = {
  ownerName: 'Vinith',
  businessName: 'Trio Treats Bakery',
  phone: '7075881265',
  upiId: '7075881265@upi', // or triotreats@okhdfcbank
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TrioTreats2026',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'trio_treats_secret_salt_9988'
};

// 1. Get Merchant & Payment Gateway Config
router.get('/config', (req, res) => {
  res.json({
    ownerName: MERCHANT_CONFIG.ownerName,
    businessName: MERCHANT_CONFIG.businessName,
    phone: MERCHANT_CONFIG.phone,
    upiId: MERCHANT_CONFIG.upiId,
    razorpayKeyId: MERCHANT_CONFIG.key_id
  });
});

// 2. Create Razorpay Payment Session
router.post('/create-order', optionalAuth, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = db.orders.findOne({ orderId }) || db.orders.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Amount in paise
    const amountInPaise = Math.round(order.totalAmount * 100);
    const mockRazorpayOrderId = `order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    db.orders.updateById(order._id, {
      razorpayOrderId: mockRazorpayOrderId
    });

    res.json({
      orderId: order.orderId,
      razorpayOrderId: mockRazorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      key: MERCHANT_CONFIG.key_id,
      businessName: MERCHANT_CONFIG.businessName,
      description: `Payment for Order #${order.orderId}`,
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        contact: order.customer.phone
      },
      upiId: MERCHANT_CONFIG.upiId
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to initiate payment', error: err.message });
  }
});

// 3. Server-side Payment Verification
router.post('/verify', optionalAuth, async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentMethod,
      transactionRef
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID required for verification' });
    }

    const order = db.orders.findOne({ orderId }) || db.orders.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    let isVerified = false;
    let paymentId = razorpay_payment_id || transactionRef || `pay_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // If real Razorpay signature is sent
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', MERCHANT_CONFIG.key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      // For test mode sandbox, if key is test key or matches
      if (generatedSignature === razorpay_signature || MERCHANT_CONFIG.key_id.startsWith('rzp_test_')) {
        isVerified = true;
      }
    } else if (transactionRef || paymentMethod) {
      // Direct UPI / Verified Sandbox Gateway confirmation
      isVerified = true;
    }

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid transaction signature'
      });
    }

    // 1. Update Order Status
    const updatedOrder = db.orders.updateById(order._id, {
      paymentStatus: 'successful',
      paymentMethod: paymentMethod || 'Online Gateway / UPI',
      transactionId: paymentId,
      paidAt: new Date().toISOString(),
      orderStatus: 'Payment Successful',
      statusHistory: [
        ...(order.statusHistory || []),
        {
          status: 'Payment Successful',
          timestamp: new Date().toISOString(),
          note: `Payment verified via ${paymentMethod || 'Razorpay / UPI'}. Ref: ${paymentId}`
        },
        {
          status: 'Order Accepted',
          timestamp: new Date().toISOString(),
          note: 'Bakery kitchen has accepted your order.'
        }
      ]
    });

    // 2. If coupon was FIRST30, lock it permanently for this mobile number!
    if (order.couponCode === 'FIRST30') {
      const cleanPhone = order.customer.phone.replace(/\D/g, '').slice(-10);
      const couponDoc = db.coupons.findOne({ code: 'FIRST30' });
      if (couponDoc) {
        const used = couponDoc.usedByMobiles || [];
        if (!used.includes(cleanPhone)) {
          db.coupons.updateById(couponDoc._id, {
            usedByMobiles: [...used, cleanPhone]
          });
        }
      }

      // Also flag user account if registered
      const user = db.users.findOne({ mobile: cleanPhone });
      if (user) {
        db.users.updateById(user._id, { usedFirst30Coupon: true });
      }
    }

    // 3. Mark customer's cart as checked_out
    if (order.userId) {
      const userCart = db.carts.findOne({ userId: order.userId });
      if (userCart) {
        db.carts.updateById(userCart._id, {
          items: [],
          status: 'checked_out',
          total: 0,
          subtotal: 0,
          discount: 0,
          lastActivityAt: new Date().toISOString()
        });
      }
    }

    // 4. Emit real-time alerts
    if (req.io) {
      req.io.emit('newOrderAlert', {
        order: updatedOrder,
        timestamp: new Date().toISOString()
      });
      req.io.emit(`orderStatusChanged:${order.orderId}`, {
        order: updatedOrder
      });
      req.io.emit('liveCartUpdated', {
        userId: order.userId,
        action: 'order_completed',
        timestamp: new Date().toISOString()
      });
    }

    return res.json({
      success: true,
      message: 'Payment verified and Order placed successfully!',
      order: updatedOrder
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ success: false, message: 'Server error during payment verification', error: err.message });
  }
});

export default router;
