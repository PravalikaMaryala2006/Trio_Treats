import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Search,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { api } from '../../utils/api';

const ALL_STATUSES = [
  'Order Placed',
  'Payment Successful',
  'Order Accepted',
  'Preparing Your Treats',
  'Ready for Delivery',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/admin/all?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await api.patch(`/orders/${orderId}/status`, { orderStatus: newStatus });
      if (res.order) {
        setOrders(prev => prev.map(o => (o.orderId === orderId || o._id === orderId) ? res.order : o));
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleWhatsAppUpdate = (order) => {
    const text = encodeURIComponent(
`🍰 *TRIO TREATS - ORDER STATUS UPDATE* 🍰
Order ID: #${order.orderId}
Hello ${order.customer.name}!
Your order status has been updated to: *${order.orderStatus}* ✨

Items: ${order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
Total: ₹${order.totalAmount}
Delivery to: ${order.deliveryAddress.houseNo}, ${order.deliveryAddress.area}, ${order.deliveryAddress.city}

Track your order anytime: ${window.location.origin}/order-confirmation/${order.orderId}
Thank you for ordering with Trio Treats! "A Little Bite of Happiness"`
    );
    window.open(`https://wa.me/91${order.customer.phone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEDDC9] pb-6">
        <div>
          <h1 className="font-serif font-bold text-3xl text-[#3D2314]">
            Kitchen & Order Management
          </h1>
          <p className="text-xs text-[#7B4B29]">
            Manage incoming bakery orders, dispatch treats, and notify customers in real-time.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search Order ID, name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-white border border-[#EEDDC9] rounded-full pl-9 pr-4 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
          />
          <Search className="w-4 h-4 text-[#7B4B29] absolute left-3 top-3 pointer-events-none" />
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['All', 'Order Accepted', 'Preparing Your Treats', 'Ready for Delivery', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-xs ${
              statusFilter.toLowerCase() === st.toLowerCase()
                ? 'bg-[#3D2314] text-white'
                : 'bg-white text-[#3D2314] border border-[#EEDDC9] hover:bg-[#FFF3E7]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3D2314]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EEDDC9] space-y-3">
          <Package className="w-12 h-12 text-[#D68C98] mx-auto" />
          <h3 className="font-serif font-bold text-lg text-[#3D2314]">No Orders Found</h3>
          <p className="text-xs text-[#7B4B29]">No bakery orders match your current filter.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const isUpdating = updatingId === (order.orderId || order._id);

            return (
              <div
                key={order._id || order.orderId}
                className="bg-white rounded-3xl p-6 border border-[#EEDDC9] shadow-soft space-y-4 hover:border-[#D68C98] transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F5EBE1] pb-3 gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#3D2314]">
                      #{order.orderId}
                    </span>
                    <span className="text-[11px] text-[#A78A7F]">
                      {new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                      {order.paymentStatus?.toUpperCase()} • {order.paymentMethod || 'Online'}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#7B4B29]">Kitchen Status:</span>
                    <select
                      value={order.orderStatus}
                      disabled={isUpdating}
                      onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                      className="text-xs font-bold bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl px-3 py-1.5 text-[#3D2314] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                    >
                      {ALL_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleWhatsAppUpdate(order)}
                      className="p-1.5 rounded-xl bg-[#25D366] text-white hover:bg-[#20ba5a] transition-colors"
                      title="Send WhatsApp Status Update to Customer"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                    </button>
                  </div>
                </div>

                {/* Main Content Grid: Customer & Items */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Customer & Address Details */}
                  <div className="md:col-span-5 space-y-3 bg-[#FFF9F2] p-4 rounded-2xl border border-[#F5EBE1] text-xs">
                    <div>
                      <h4 className="font-bold text-[#3D2314] text-sm flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#D68C98]" />
                        {order.customer.name} (+91 {order.customer.phone})
                      </h4>
                      {order.customer.email && (
                        <p className="text-[11px] text-[#A78A7F]">{order.customer.email}</p>
                      )}
                    </div>

                    <div className="space-y-0.5 text-[#5C3419]">
                      <p className="font-semibold text-[#3D2314] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#D68C98]" />
                        Delivery Address:
                      </p>
                      <p>{order.deliveryAddress.houseNo}, {order.deliveryAddress.street}</p>
                      <p>{order.deliveryAddress.area}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}</p>
                      {order.deliveryAddress.landmark && (
                        <p className="text-[#A78A7F]">Landmark: {order.deliveryAddress.landmark}</p>
                      )}
                      {order.deliveryAddress.instructions && (
                        <p className="text-[#A78A7F] italic">Notes: "{order.deliveryAddress.instructions}"</p>
                      )}
                    </div>

                    {order.deliveryAddress.coordinates && (
                      <a
                        href={`https://www.google.com/maps?q=${order.deliveryAddress.coordinates.lat},${order.deliveryAddress.coordinates.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D68C98] hover:underline pt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View GPS Door Location on Map</span>
                      </a>
                    )}

                    {order.isSurpriseGift && (
                      <div className="p-2 bg-pink-100 rounded-lg text-[11px] text-pink-900">
                        🎁 <strong>Surprise Gift for:</strong> {order.recipientName}<br />
                        {order.personalizedMessage && <span>"{order.personalizedMessage}"</span>}
                      </div>
                    )}
                  </div>

                  {/* Ordered Items List */}
                  <div className="md:col-span-7 space-y-3">
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-[#F5EBE1] bg-white text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <p className="font-bold text-[#3D2314]">{item.name}</p>
                              <p className="text-[11px] text-[#7B4B29]">Qty: <strong>{item.quantity}</strong> × ₹{item.price}</p>
                              {item.boxSelections && (
                                <p className="text-[10px] text-[#A78A7F]">Custom Box Treats: {item.boxSelections.treats?.join(', ')}</p>
                              )}
                            </div>
                          </div>
                          <span className="font-bold text-[#3D2314]">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Financial Breakdown */}
                    <div className="pt-2 border-t border-[#F5EBE1] flex items-center justify-between text-xs">
                      <span className="text-[#7B4B29]">
                        Subtotal: ₹{order.subtotal} {order.discount > 0 && `| Discount: -₹${order.discount} (${order.couponCode})`} | Delivery: ₹{order.deliveryFee}
                      </span>
                      <div className="text-right">
                        <span className="text-xs text-[#A78A7F] mr-1">Total Paid:</span>
                        <span className="font-bold text-base text-[#3D2314]">₹{order.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
