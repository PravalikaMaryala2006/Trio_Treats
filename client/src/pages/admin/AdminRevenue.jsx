import React, { useState, useEffect } from 'react';
import { IndianRupee, CreditCard, CheckCircle2, Clock, RotateCcw, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { api } from '../../utils/api';

export default function AdminRevenue() {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRevenue() {
      try {
        setLoading(true);
        const res = await api.get('/admin/revenue');
        setRevenueData(res);
      } catch (err) {
        console.error('Failed to load revenue:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRevenue();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3D2314]" />
      </div>
    );
  }

  const { totalSuccessful, pendingCount, refundedCount, dailyChart, transactions } = revenueData || {
    totalSuccessful: 0,
    pendingCount: 0,
    refundedCount: 0,
    dailyChart: [],
    transactions: []
  };

  const maxRevenue = Math.max(...dailyChart.map(d => d.revenue), 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#EEDDC9] pb-6">
        <h1 className="font-serif font-bold text-3xl text-[#3D2314]">
          Payments, Revenue & Financial Logs
        </h1>
        <p className="text-xs text-[#7B4B29] mt-0.5">
          Verified merchant transaction records, daily revenue trends, and gateway logs for Vinith.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#EEDDC9] shadow-soft space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78A7F] block">
              Total Successful Revenue
            </span>
            <span className="font-serif font-bold text-3xl text-[#3D2314]">₹{totalSuccessful}</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Merchant settlements verified
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EEDDC9] shadow-soft space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78A7F] block">
              Pending Transactions
            </span>
            <span className="font-serif font-bold text-3xl text-[#3D2314]">{pendingCount}</span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium">Awaiting UPI / Bank auth</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EEDDC9] shadow-soft space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-gray-50 text-gray-600 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78A7F] block">
              Refunded Orders
            </span>
            <span className="font-serif font-bold text-3xl text-[#3D2314]">{refundedCount}</span>
          </div>
          <p className="text-[11px] text-[#7B4B29]">0% refund rate</p>
        </div>
      </div>

      {/* 7-Day Revenue Trend Bar Chart */}
      <div className="bg-white p-6 rounded-3xl border border-[#EEDDC9] shadow-soft space-y-4">
        <h3 className="font-serif font-bold text-lg text-[#3D2314]">
          Daily Revenue Overview (Past 7 Days)
        </h3>

        <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
          {dailyChart.map((item, idx) => {
            const heightPercent = Math.max(8, (item.revenue / maxRevenue) * 100);
            const dateLabel = new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[11px] font-bold text-[#3D2314] opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{item.revenue}
                </span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[42px] bg-gradient-to-t from-[#3D2314] to-[#7B4B29] group-hover:to-[#D68C98] rounded-xl transition-all shadow-xs"
                />
                <span className="text-[10px] text-[#A78A7F] font-semibold">{dateLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction Log Table */}
      <div className="bg-white rounded-3xl border border-[#EEDDC9] shadow-soft overflow-hidden">
        <div className="p-4 border-b border-[#F5EBE1] font-bold text-xs text-[#3D2314]">
          Complete Transaction & Settlement Log ({transactions.length})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF9F2] text-[#7B4B29] uppercase font-bold text-[10px] tracking-wider border-b border-[#F5EBE1]">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Transaction Ref</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Amount</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EBE1]">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#7B4B29]">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((t, idx) => (
                  <tr key={idx} className="hover:bg-[#FFF9F2] transition-colors">
                    <td className="p-4 font-mono font-bold text-[#3D2314]">#{t.orderId}</td>
                    <td className="p-4">
                      <p className="font-bold text-[#3D2314]">{t.customerName}</p>
                      <p className="text-[10px] text-[#A78A7F]">+91 {t.customerPhone}</p>
                    </td>
                    <td className="p-4 font-medium text-[#5C3419]">{t.paymentMethod}</td>
                    <td className="p-4 font-mono text-[11px] text-[#7B4B29]">{t.transactionId}</td>
                    <td className="p-4 text-[#A78A7F]">
                      {new Date(t.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                    <td className="p-4 font-bold text-sm text-[#3D2314]">₹{t.amount}</td>
                    <td className="p-4 text-right">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                        {t.status.toUpperCase()}
                      </span>
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
