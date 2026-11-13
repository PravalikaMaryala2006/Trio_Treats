import express from 'express';
import { db } from '../config/db.js';
import { verifyToken, optionalAuth, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate professional Order ID: TT-YYYY-XXXX
const generateOrderId = () => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TT-2026-${rand}`;
};

// 1. Create Order
router.post('/create', optionalAuth, async (req, res) => {
  try {
    const {
      items,
      deliveryAddress,
      couponCode,
      discount,
      subtotal,
      deliveryFee,
      totalAmount,
      isSurpriseGift,
      recipientName,
      personalizedMessage,
      paymentMethod
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart items cannot be empty' });
    }

    if (!deliveryAddress || !deliveryAddress.houseNo || !deliveryAddress.city) {
      return res.status(400).json({ message: 'Complete delivery address is required' });
    }

    const customerName = deliveryAddress.name || (req.user ? req.user.fullName : 'Valued Customer');
    const customerPhone = deliveryAddress.mobile || (req.user ? req.user.mobile : '');
    const customerEmail = deliveryAddress.email || (req.user ? req.user.email : '');

    if (!customerPhone) {
      return res.status(400).json({ message: 'Customer phone number is required' });
    }

    const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);

    // Calculate/Verify amounts
    const computedSubtotal = items.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);
    let computedDiscount = Number(discount || 0);

    // Check FIRST30 coupon again for safety
    if (couponCode === 'FIRST30') {
      const couponDoc = db.coupons.findOne({ code: 'FIRST30' });
      const usedMobiles = couponDoc?.usedByMobiles || [];
      if (usedMobiles.includes(cleanPhone) || (req.user && req.user.usedFirst30Coupon)) {
        computedDiscount = 0;
      } else {
        computedDiscount = Math.min(30, computedSubtotal);
      }
    }

    // Delivery fee: Free for orders over ₹300, else flat ₹40
    const computedDeliveryFee = computedSubtotal >= 300 ? 0 : 40;
    const finalTotal = Math.max(0, computedSubtotal - computedDiscount + computedDeliveryFee);

    const orderId = generateOrderId();

    const newOrder = db.orders.insertOne({
      orderId,
      userId: req.user ? req.user._id : null,
      customer: {
        name: customerName,
        phone: cleanPhone,
        email: customerEmail
      },
      items,
      subtotal: computedSubtotal,
      discount: computedDiscount,
      couponCode: computedDiscount > 0 ? (couponCode || 'FIRST30') : '',
      deliveryFee: computedDeliveryFee,
      totalAmount: finalTotal,
      deliveryAddress: {
        name: customerName,
        phone: cleanPhone,
        houseNo: deliveryAddress.houseNo || '',
        street: deliveryAddress.street || '',
        area: deliveryAddress.area || '',
        city: deliveryAddress.city || '',
        pincode: deliveryAddress.pincode || '',
        landmark: deliveryAddress.landmark || '',
        instructions: deliveryAddress.instructions || '',
        coordinates: deliveryAddress.coordinates || null
      },
      isSurpriseGift: Boolean(isSurpriseGift),
      recipientName: recipientName || '',
      personalizedMessage: personalizedMessage || '',
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending',
      paymentMethod: paymentMethod || 'Online Gateway',
      orderStatus: 'Order Placed',
      statusHistory: [
        {
          status: 'Order Placed',
          timestamp: new Date().toISOString(),
          note: 'Your sweet treats order has been registered in the bakery system.'
        }
      ]
    });

    // Notify sockets
    if (req.io) {
      req.io.emit('orderCreated', { order: newOrder });
    }

    res.status(201).json({
      message: 'Order initiated',
      order: newOrder
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
});

// 2. Customer: Get my orders
router.get('/my-orders', verifyToken, (req, res) => {
  try {
    const orders = db.orders.find({ userId: req.user._id })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

// 3. Get single order details (Customer or Admin)
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const { id } = req.params;
    const order = db.orders.findOne({ orderId: id }) || db.orders.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order details', error: err.message });
  }
});

// 4. Admin: Get all orders with filter
router.get('/admin/all', verifyAdmin, (req, res) => {
  try {
    const { status, paymentStatus, search } = req.query;
    let orders = db.orders.find();

    if (status && status !== 'All') {
      orders = orders.filter(o => o.orderStatus.toLowerCase() === status.toLowerCase());
    }

    if (paymentStatus && paymentStatus !== 'All') {
      orders = orders.filter(o => o.paymentStatus.toLowerCase() === paymentStatus.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(o =>
        o.orderId.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
      );
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ orders, total: orders.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch admin orders', error: err.message });
  }
});

// 5. Admin: Update order status (Live real-time socket emit to customer!)
router.patch('/:id/status', verifyAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, note } = req.body;

    const validStatuses = [
      'Order Placed',
      'Payment Successful',
      'Order Accepted',
      'Preparing Your Treats',
      'Ready for Delivery',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status value' });
    }

    const order = db.orders.findOne({ orderId: id }) || db.orders.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const statusHistory = [
      ...(order.statusHistory || []),
      {
        status: orderStatus,
        timestamp: new Date().toISOString(),
        note: note || `Order updated to ${orderStatus}`
      }
    ];

    const updated = db.orders.updateById(order._id, {
      orderStatus,
      statusHistory
    });

    // Real-time broadcast to the customer tracking this order!
    if (req.io) {
      req.io.emit(`orderStatusChanged:${order.orderId}`, {
        order: updated,
        orderStatus,
        note
      });
      req.io.emit('adminOrderUpdated', { order: updated });
    }

    res.json({ message: `Order status updated to ${orderStatus}`, order: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status', error: err.message });
  }
});

// 6. Generate WhatsApp Order Notification Format
router.get('/:id/whatsapp-link', (req, res) => {
  try {
    const { id } = req.params;
    const order = db.orders.findOne({ orderId: id }) || db.orders.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const itemsSummary = order.items
      .map(item => `• ${item.name} x${item.quantity} (₹${item.price * item.quantity})`)
      .join('\n');

    const addressStr = `${order.deliveryAddress.houseNo}, ${order.deliveryAddress.street}, ${order.deliveryAddress.area}, ${order.deliveryAddress.city} - ${order.deliveryAddress.pincode}`;

    const text = encodeURIComponent(
`🍰 *NEW ORDER RECEIVED - TRIO TREATS* 🍰
-----------------------------------
*Order ID:* ${order.orderId}
*Customer:* ${order.customer.name}
*Phone:* +91 ${order.customer.phone}
*Date:* ${new Date(order.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}

*ORDER ITEMS:*
${itemsSummary}

*Subtotal:* ₹${order.subtotal}
*Discount:* ₹${order.discount} ${order.couponCode ? `(${order.couponCode})` : ''}
*Delivery:* ₹${order.deliveryFee}
*TOTAL AMOUNT:* ₹${order.totalAmount}

*Payment Status:* ${order.paymentStatus.toUpperCase()} (${order.paymentMethod || 'Online'})
*Order Status:* ${order.orderStatus}

*DELIVERY ADDRESS:*
${addressStr}
${order.deliveryAddress.landmark ? `*Landmark:* ${order.deliveryAddress.landmark}` : ''}
${order.deliveryAddress.instructions ? `*Instructions:* ${order.deliveryAddress.instructions}` : ''}
${order.isSurpriseGift ? `\n🎁 *Surprise Gift for:* ${order.recipientName}` : ''}
${order.personalizedMessage ? `💌 *Greeting Card:* "${order.personalizedMessage}"` : ''}
-----------------------------------
A Little Bite of Happiness ✨`
    );

    const whatsappUrl = `https://wa.me/917075881265?text=${text}`;

    res.json({ whatsappUrl, text: decodeURIComponent(text) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate WhatsApp notification', error: err.message });
  }
});

export default router;
