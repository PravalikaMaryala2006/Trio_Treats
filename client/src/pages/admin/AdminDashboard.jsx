import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShoppingBag,
  Clock,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShoppingCart,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { api } from '../../utils/api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverview() {
      try {
        setLoading(true);
        const res = await api.get('/admin/overview');
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard overview:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3D2314]" />
      </div>
    );
  }

  const m = data?.metrics || {
    totalCustomers: 0,
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    activeCartsCount: 0
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEDDC9] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#D68C98] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Kitchen & Store Control Center
          </span>
          <h1 className="font-serif font-bold text-3xl text-[#3D2314] mt-0.5">
            Welcome, Vinith 👋
          </h1>
          <p className="text-xs text-[#7B4B29]">
            Here is your live summary of Trio Treats orders, customer carts, and bakery revenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/live-carts"
            className="btn-pink text-xs !py-2.5 !px-4 flex items-center gap-1.5 shadow-xs"
          >
            <ShoppingCart className="w-4 h-4 text-[#3D2314]" />
            <span>Monitor Live Carts ({m.activeCartsCount})</span>
          </Link>

          <Link
            to="/admin/orders"
            className="btn-primary text-xs !py-2.5 !px-4 flex items-center gap-1.5 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-[#FAD2E1]" />
            <span>Manage Orders</span>
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Customers */}
        <div className="bg-white p-5 rounded-3xl border border-[#EEDDC9] shadow-soft space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF3E7] text-[#3D2314] flex items-center justify-center">
            <Users className="w-5 h-5 text-[#D68C98]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#A78A7F] uppercase tracking-wider block">Total Customers</span>
            <span className="font-serif font-bold text-2xl text-[#3D2314]">{m.totalCustomers}</span>
          </div>
          <p className="text-[10px] text-[#7B4B29]">Registered bakery patrons</p>
        </div>

        {/* Metric 2: Today's Orders */}
        <div className="bg-white p-5 rounded-3xl border border-[#EEDDC9] shadow-soft space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF3E7] text-[#3D2314] flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#D68C98]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#A78A7F] uppercase tracking-wider block">Today's Orders</span>
            <span className="font-serif font-bold text-2xl text-[#3D2314]">{m.todayOrders}</span>
          </div>
          <p className="text-[10px] text-[#7B4B29]">Total lifetime: {m.totalOrders}</p>
        </div>

        {/* Metric 3: Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-[#EEDDC9] shadow-soft space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#A78A7F] uppercase tracking-wider block">Total Revenue</span>
            <span className="font-serif font-bold text-2xl text-[#3D2314]">₹{m.totalRevenue}</span>
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold">Today: ₹{m.todayRevenue}</p>
        </div>

        {/* Metric 4: Pending / Kitchen Orders */}
        <div className="bg-white p-5 rounded-3xl border border-[#EEDDC9] shadow-soft space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#A78A7F] uppercase tracking-wider block">Active Orders</span>
            <span className="font-serif font-bold text-2xl text-[#3D2314]">{m.pendingOrders}</span>
          </div>
          <p className="text-[10px] text-[#7B4B29]">
            {m.completedOrders} Delivered • {m.cancelledOrders} Cancelled
          </p>
        </div>
      </div>

      {/* Live Cart Highlight Card */}
      <div className="bg-gradient-to-r from-[#FFF5EA] via-[#FCE4EC] to-[#FAD2E1] p-6 rounded-3xl border border-[#EEDDC9] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-[#FAD2E1] flex items-center justify-center text-2xl">
            🛒
          </div>
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9B2226]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Real-time Live Monitoring
            </span>
            <h3 className="font-serif font-bold text-xl text-[#3D2314]">
              {m.activeCartsCount} Active Customer Carts Right Now
            </h3>
            <p className="text-xs text-[#7B4B29]">
              See which customers are picking cupcakes, their cart value, and recover abandoned carts!
            </p>
          </div>
        </div>
        <Link to="/admin/live-carts" className="btn-primary text-xs !py-2.5 !px-5 whitespace-nowrap shadow-sm">
          Open Live Cart Board →
        </Link>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-[#EEDDC9] shadow-soft overflow-hidden">
        <div className="p-5 border-b border-[#F5EBE1] flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#3D2314]">Recent Bakery Orders</h3>
            <p className="text-xs text-[#7B4B29]">Latest customer transactions</p>
          </div>
          <Link to="/admin/orders" className="text-xs font-bold text-[#5C3419] hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF9F2] text-[#7B4B29] uppercase font-bold text-[10px] tracking-wider border-b border-[#F5EBE1]">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EBE1]">
              {(!data?.recentOrders || data.recentOrders.length === 0) ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#7B4B29]">
                    No orders placed yet. Orders will appear here live!
                  </td>
                </tr>
              ) : (
                data.recentOrders.map((ord) => (
                  <tr key={ord._id || ord.orderId} className="hover:bg-[#FFFDF9] transition-colors">
                    <td className="p-4 font-mono font-bold text-[#3D2314]">#{ord.orderId}</td>
                    <td className="p-4">
                      <p className="font-bold text-[#3D2314]">{ord.customer.name}</p>
                      <p className="text-[11px] text-[#A78A7F]">{ord.customer.phone}</p>
                    </td>
                    <td className="p-4 text-[#5C3419]">
                      {ord.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="p-4 font-bold text-[#3D2314]">₹{ord.totalAmount}</td>
                    <td className="p-4">
                      <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        {ord.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="bg-[#FFF3E7] text-[#3D2314] font-semibold px-2 py-0.5 rounded-full border border-[#EEDDC9] text-[10px]">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to="/admin/orders"
                        className="text-xs font-bold text-[#D68C98] hover:underline"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
