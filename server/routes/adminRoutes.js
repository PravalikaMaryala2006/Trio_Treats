import express from 'express';
import { db } from '../config/db.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. Dashboard Overview Analytics
router.get('/overview', verifyAdmin, (req, res) => {
  try {
    const allUsers = db.users.find({ role: 'customer' });
    const allOrders = db.orders.find();
    const allCarts = db.carts.find();

    const todayStr = new Date().toISOString().split('T')[0];

    const todayOrders = allOrders.filter(o => (o.createdAt || '').startsWith(todayStr));

    // Revenue from paid or delivered orders
    const paidOrders = allOrders.filter(o => o.paymentStatus === 'successful');
    const totalRevenue = paidOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
    const todayRevenue = paidOrders
      .filter(o => (o.paidAt || o.createdAt || '').startsWith(todayStr))
      .reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);

    const pendingOrders = allOrders.filter(o =>
      !['Delivered', 'Cancelled'].includes(o.orderStatus)
    ).length;

    const completedOrders = allOrders.filter(o => o.orderStatus === 'Delivered').length;
    const cancelledOrders = allOrders.filter(o => o.orderStatus === 'Cancelled').length;

    // Active & abandoned carts count
    const activeCartsCount = allCarts.filter(c => c.items && c.items.length > 0 && c.status !== 'checked_out').length;

    // Recent 5 orders
    const recentOrders = [...allOrders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      metrics: {
        totalCustomers: allUsers.length,
        totalOrders: allOrders.length,
        todayOrders: todayOrders.length,
        totalRevenue,
        todayRevenue,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        activeCartsCount
      },
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard metrics', error: err.message });
  }
});

// 2. Customer Management (List customers with their orders and login activity)
router.get('/customers', verifyAdmin, (req, res) => {
  try {
    const customers = db.users.find({ role: 'customer' });
    const allOrders = db.orders.find();

    const customerDetails = customers.map(u => {
      const userOrders = allOrders.filter(o => o.userId === u._id || o.customer?.phone === u.mobile);
      const totalSpent = userOrders
        .filter(o => o.paymentStatus === 'successful')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const { password, ...safeUser } = u;
      return {
        ...safeUser,
        orderCount: userOrders.length,
        totalSpent,
        orders: userOrders
      };
    });

    customerDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ customers: customerDetails });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch customer list', error: err.message });
  }
});

// 3. Revenue Analytics & Transaction Log
router.get('/revenue', verifyAdmin, (req, res) => {
  try {
    const orders = db.orders.find();

    const transactions = orders
      .filter(o => o.paymentStatus === 'successful')
      .map(o => ({
        orderId: o.orderId,
        customerName: o.customer.name,
        customerPhone: o.customer.phone,
        amount: o.totalAmount,
        paymentMethod: o.paymentMethod || 'Online Gateway',
        transactionId: o.transactionId || 'N/A',
        date: o.paidAt || o.createdAt,
        status: o.paymentStatus
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Daily breakdown for past 7 days
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      dailyMap[dateKey] = 0;
    }

    transactions.forEach(t => {
      const day = (t.date || '').split('T')[0];
      if (dailyMap[day] !== undefined) {
        dailyMap[day] += Number(t.amount);
      }
    });

    const dailyChart = Object.keys(dailyMap).map(date => ({
      date,
      revenue: dailyMap[date]
    }));

    const totalSuccessful = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const pendingTransactions = orders.filter(o => o.paymentStatus === 'pending');
    const refundedTransactions = orders.filter(o => o.paymentStatus === 'refunded');

    res.json({
      totalSuccessful,
      pendingCount: pendingTransactions.length,
      refundedCount: refundedTransactions.length,
      dailyChart,
      transactions
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch revenue analytics', error: err.message });
  }
});

export default router;
