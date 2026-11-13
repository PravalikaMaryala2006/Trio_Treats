import express from 'express';
import { db } from '../config/db.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// 1. Get active public coupons for banners
router.get('/active', (req, res) => {
  try {
    const coupons = db.coupons.find({ isActive: true });
    res.json({ coupons });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch coupons', error: err.message });
  }
});

// 2. Validate coupon for a customer
router.post('/validate', optionalAuth, (req, res) => {
  try {
    const { code, mobile, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ valid: false, message: 'Please enter a coupon code' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = db.coupons.findOne({ code: cleanCode, isActive: true });

    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Invalid or expired coupon code' });
    }

    const checkMobile = req.user?.mobile || (mobile ? mobile.trim().replace(/\D/g, '').slice(-10) : '');

    if (cleanCode === 'FIRST30') {
      if (!checkMobile) {
        return res.status(400).json({
          valid: false,
          message: 'Please provide or verify your mobile number to apply the FIRST30 coupon.'
        });
      }

      // Check if mobile has already used FIRST30
      const couponDoc = db.coupons.findOne({ code: 'FIRST30' });
      const usedMobiles = couponDoc?.usedByMobiles || [];

      if (usedMobiles.includes(checkMobile)) {
        return res.status(400).json({
          valid: false,
          message: 'FIRST30 coupon has already been redeemed for this mobile number.'
        });
      }

      // Check if customer user object has flag
      if (req.user && req.user.usedFirst30Coupon) {
        return res.status(400).json({
          valid: false,
          message: 'You have already used the FIRST30 welcome discount on a prior order.'
        });
      }

      // Also check orders collection for any completed/successful orders with this mobile and FIRST30
      const priorOrder = db.orders.findOne({
        'customer.phone': checkMobile,
        couponCode: 'FIRST30',
        paymentStatus: 'successful'
      });
      if (priorOrder) {
        return res.status(400).json({
          valid: false,
          message: 'This mobile number already enjoyed the FIRST30 discount.'
        });
      }
    }

    // Check minimum order requirement
    const numSubtotal = Number(subtotal || 0);
    if (coupon.minOrder && numSubtotal < coupon.minOrder) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order value of ₹${coupon.minOrder} required to apply ${cleanCode}`
      });
    }

    const discountAmount = Math.min(coupon.discount, numSubtotal);

    return res.json({
      valid: true,
      code: cleanCode,
      discount: discountAmount,
      message: `Yay! ₹${discountAmount} discount applied successfully with ${cleanCode}!`
    });
  } catch (err) {
    res.status(500).json({ valid: false, message: 'Coupon validation failed', error: err.message });
  }
});

export default router;
