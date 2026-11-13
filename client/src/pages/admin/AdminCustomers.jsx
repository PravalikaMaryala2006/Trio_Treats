import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, Clock, ShoppingBag, Search, ChevronRight, Package } from 'lucide-react';
import { api } from '../../utils/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const res = await api.get('/admin/customers');
        setCustomers(res.customers || []);
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const filtered = customers.filter(c =>
    (c.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.mobile || '').includes(search) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEDDC9] pb-6">
        <div>
          <h1 className="font-serif font-bold text-3xl text-[#3D2314]">
            Customer Directory & Order History
          </h1>
          <p className="text-xs text-[#7B4B29]">
            View all registered patrons, their login activity, order volumes, and lifetime spent.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-white border border-[#EEDDC9] rounded-full pl-9 pr-4 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
          />
          <Search className="w-4 h-4 text-[#7B4B29] absolute left-3 top-3 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3D2314]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Customer Table */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[#EEDDC9] shadow-soft overflow-hidden">
            <div className="p-4 border-b border-[#F5EBE1] font-bold text-xs text-[#3D2314]">
              Patrons Directory ({filtered.length})
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF9F2] text-[#7B4B29] uppercase font-bold text-[10px] tracking-wider border-b border-[#F5EBE1]">
                  <tr>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Registered</th>
                    <th className="p-4">Last Active</th>
                    <th className="p-4">Orders</th>
                    <th className="p-4">Total Spent</th>
                    <th className="p-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EBE1]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#7B4B29]">
                        No registered customers found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => (
                      <tr
                        key={c._id || c.id}
                        onClick={() => setSelectedCustomer(c)}
                        className={`hover:bg-[#FFF9F2] cursor-pointer transition-colors ${
                          selectedCustomer?._id === c._id ? 'bg-[#FFF3E7]' : ''
                        }`}
                      >
                        <td className="p-4 font-bold text-[#3D2314]">{c.fullName}</td>
                        <td className="p-4">
                          <p className="font-semibold text-[#3D2314]">{c.mobile}</p>
                          <p className="text-[11px] text-[#A78A7F]">{c.email}</p>
                        </td>
                        <td className="p-4 text-[#7B4B29]">
                          {new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="p-4 text-[#7B4B29]">
                          {c.lastLoginAt
                            ? new Date(c.lastLoginAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : 'N/A'}
                        </td>
                        <td className="p-4 font-bold text-[#3D2314]">{c.orderCount || 0}</td>
                        <td className="p-4 font-bold text-emerald-700">₹{c.totalSpent || 0}</td>
                        <td className="p-4 text-right">
                          <ChevronRight className="w-4 h-4 text-[#7B4B29] inline-block" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Detail Drawer */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#EEDDC9] shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#3D2314]">
              Customer Order History
            </h3>

            {selectedCustomer ? (
              <div className="space-y-4">
                <div className="bg-[#FFF9F2] p-4 rounded-2xl border border-[#EEDDC9] space-y-2 text-xs">
                  <h4 className="font-bold text-sm text-[#3D2314]">{selectedCustomer.fullName}</h4>
                  <p className="text-[#5C3419]">Phone: +91 {selectedCustomer.mobile}</p>
                  <p className="text-[#5C3419]">Email: {selectedCustomer.email}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    Lifetime Orders: {selectedCustomer.orderCount} • Spent: ₹{selectedCustomer.totalSpent}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] uppercase font-bold text-[#A78A7F] block">
                    Past Orders ({selectedCustomer.orders?.length || 0})
                  </span>

                  {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) ? (
                    <p className="text-xs text-[#7B4B29] py-3 text-center">No orders placed yet.</p>
                  ) : (
                    selectedCustomer.orders.map((ord) => (
                      <div key={ord._id || ord.orderId} className="p-3 bg-white rounded-xl border border-[#F5EBE1] text-xs space-y-1">
                        <div className="flex justify-between font-bold text-[#3D2314]">
                          <span>#{ord.orderId}</span>
                          <span>₹{ord.totalAmount}</span>
                        </div>
                        <p className="text-[11px] text-[#7B4B29]">
                          {ord.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                        </p>
                        <div className="flex justify-between text-[10px] text-[#A78A7F] pt-1">
                          <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                          <span className="font-bold text-emerald-700">{ord.orderStatus}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#7B4B29] py-8 text-center">
                Click any customer on the left to inspect their order history and past bakery receipts.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
