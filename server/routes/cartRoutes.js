import express from 'express';
import { db } from '../config/db.js';
import { optionalAuth, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. Get current customer's cart
router.get('/', optionalAuth, (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.query.sessionId;
    if (!userId) {
      return res.json({ items: [], subtotal: 0, total: 0 });
    }

    const cart = db.carts.findOne({ userId }) || {
      userId,
      items: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      status: 'active'
    };

    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cart', error: err.message });
  }
});

// 2. Sync / Update Cart (Emits real-time Live Cart update to Admin Dashboard)
router.post('/sync', optionalAuth, (req, res) => {
  try {
    const { items, subtotal, discount, couponApplied, deliveryFee, total, status, sessionId, guestInfo } = req.body;

    const userId = req.user ? req.user._id : (sessionId || 'guest-' + Date.now());
    const customerName = req.user ? req.user.fullName : (guestInfo?.name || 'Browsing Guest');
    const customerPhone = req.user ? req.user.mobile : (guestInfo?.phone || 'Not provided');
    const customerEmail = req.user ? req.user.email : (guestInfo?.email || '');

    const existingCart = db.carts.findOne({ userId });

    const cartData = {
      userId,
      customerName,
      customerPhone,
      customerEmail,
      items: items || [],
      subtotal: Number(subtotal || 0),
      discount: Number(discount || 0),
      couponApplied: couponApplied || '',
      deliveryFee: Number(deliveryFee || 0),
      total: Number(total || 0),
      status: status || (items && items.length > 0 ? 'active' : 'empty'),
      lastActivityAt: new Date().toISOString()
    };

    let savedCart;
    if (existingCart) {
      savedCart = db.carts.updateById(existingCart._id, cartData);
    } else {
      savedCart = db.carts.insertOne(cartData);
    }

    // Real-time broadcast to Admin Live Cart dashboard!
    if (req.io) {
      req.io.emit('liveCartUpdated', {
        cart: savedCart,
        action: 'sync',
        timestamp: new Date().toISOString()
      });
    }

    res.json({ message: 'Cart synced', cart: savedCart });
  } catch (err) {
    console.error('Cart sync error:', err);
    res.status(500).json({ message: 'Failed to sync cart', error: err.message });
  }
});

// 3. Clear Cart (After order placed)
router.post('/clear', optionalAuth, (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.body.sessionId;
    if (userId) {
      const existing = db.carts.findOne({ userId });
      if (existing) {
        db.carts.updateById(existing._id, {
          items: [],
          subtotal: 0,
          discount: 0,
          couponApplied: '',
          total: 0,
          status: 'checked_out',
          lastActivityAt: new Date().toISOString()
        });

        if (req.io) {
          req.io.emit('liveCartUpdated', {
            cartId: existing._id,
            action: 'checked_out',
            userId,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear cart', error: err.message });
  }
});

// 4. Admin Live Cart Monitoring: Fetch all carts with active items or abandoned status
router.get('/admin/live', verifyAdmin, (req, res) => {
  try {
    const allCarts = db.carts.find();
    const now = Date.now();

    // Enrich carts with abandonment status if inactive > 15 mins
    const enriched = allCarts
      .filter(c => c.items && c.items.length > 0)
      .map(c => {
        const lastAct = new Date(c.lastActivityAt || c.updatedAt || c.createdAt).getTime();
        const diffMinutes = Math.round((now - lastAct) / 60000);
        let dynamicStatus = c.status;

        if (c.status !== 'checked_out') {
          if (diffMinutes > 15) {
            dynamicStatus = 'abandoned';
          } else if (c.status === 'in_checkout') {
            dynamicStatus = 'in_checkout';
          } else {
            dynamicStatus = 'active';
          }
        }

        return {
          ...c,
          inactivityMinutes: diffMinutes,
          computedStatus: dynamicStatus
        };
      })
      .sort((a, b) => new Date(b.lastActivityAt || 0) - new Date(a.lastActivityAt || 0));

    res.json({
      totalActiveCarts: enriched.filter(c => c.computedStatus === 'active' || c.computedStatus === 'in_checkout').length,
      totalAbandonedCarts: enriched.filter(c => c.computedStatus === 'abandoned').length,
      carts: enriched
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve live carts', error: err.message });
  }
});

export default router;
