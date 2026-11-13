import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  ShoppingCart,
  Phone,
  Clock,
  Sparkles,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  User,
  ArrowRight
} from 'lucide-react';
import { api } from '../../utils/api';

export default function AdminLiveCarts() {
  const [carts, setCarts] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'in_checkout' | 'abandoned'
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState(new Date());

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart/admin/live');
      setCarts(res.carts || []);
      setLastSynced(new Date());
    } catch (err) {
      console.error('Failed to fetch live carts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();

    // Socket.io for Real-time push updates
    const socket = io('/', { transports: ['websocket', 'polling'] });
    socket.emit('joinAdmin');

    socket.on('liveCartUpdated', () => {
      // Re-fetch carts automatically on real-time event
      fetchCarts();
    });

    // Also poll every 15 seconds as fallback
    const interval = setInterval(fetchCarts, 15000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const filteredCarts = carts.filter(c => {
    if (filter === 'all') return true;
    return c.computedStatus === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
            Active Browsing
          </span>
        );
      case 'in_checkout':
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            In Checkout
          </span>
        );
      case 'abandoned':
        return (
          <span className="bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            Abandoned Cart
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  const handleSendWhatsAppReminder = (cart) => {
    const cleanPhone = (cart.customerPhone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      alert('Valid customer phone number not provided for this session.');
      return;
    }

    const itemsStr = (cart.items || []).map(i => `${i.name} (x${i.quantity})`).join(', ');
    const msg = encodeURIComponent(
`Hello ${cart.customerName || 'there'}! 🧁
We noticed you selected sweet treats at Trio Treats Bakery:
${itemsStr} (Total: ₹${cart.total})

Complete your order now and enjoy fresh homemade happiness delivered to your door!
Use coupon code: *FIRST30* for flat ₹30 OFF your first order!
Order now: ${window.location.origin}/cart`
    );

    window.open(`https://wa.me/91${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEDDC9] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Real-Time Live Feed
            </span>
          </div>
          <h1 className="font-serif font-bold text-3xl text-[#3D2314] mt-0.5">
            Customer Live Cart Monitoring
          </h1>
          <p className="text-xs text-[#7B4B29]">
            Live tracking of customer shopping bags, cart totals, and abandoned carts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#A78A7F]">
            Last sync: {lastSynced.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchCarts}
            className="p-2 rounded-xl bg-white border border-[#EEDDC9] text-[#3D2314] hover:bg-[#FFF3E7] shadow-xs"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4 text-[#7B4B29]" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
            filter === 'all'
              ? 'bg-[#3D2314] text-white'
              : 'bg-white text-[#3D2314] border border-[#EEDDC9] hover:bg-[#FFF3E7]'
          }`}
        >
          All Carts ({carts.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
            filter === 'active'
              ? 'bg-[#3D2314] text-white'
              : 'bg-white text-emerald-800 border border-[#EEDDC9] hover:bg-[#FFF3E7]'
          }`}
        >
          Active Browsing ({carts.filter(c => c.computedStatus === 'active').length})
        </button>
        <button
          onClick={() => setFilter('in_checkout')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
            filter === 'in_checkout'
              ? 'bg-[#3D2314] text-white'
              : 'bg-white text-amber-800 border border-[#EEDDC9] hover:bg-[#FFF3E7]'
          }`}
        >
          In Checkout ({carts.filter(c => c.computedStatus === 'in_checkout').length})
        </button>
        <button
          onClick={() => setFilter('abandoned')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
            filter === 'abandoned'
              ? 'bg-[#3D2314] text-white'
              : 'bg-white text-red-800 border border-[#EEDDC9] hover:bg-[#FFF3E7]'
          }`}
        >
          Abandoned Carts ({carts.filter(c => c.computedStatus === 'abandoned').length})
        </button>
      </div>

      {/* Carts List Grid */}
      {filteredCarts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EEDDC9] space-y-3">
          <ShoppingCart className="w-12 h-12 text-[#D68C98] mx-auto" />
          <h3 className="font-serif font-bold text-lg text-[#3D2314]">No Carts Found</h3>
          <p className="text-xs text-[#7B4B29]">
            When customers add treats to their bag on the website, they appear here instantly!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCarts.map((cart) => {
            const itemCount = (cart.items || []).reduce((acc, i) => acc + i.quantity, 0);

            return (
              <div
                key={cart._id || cart.userId}
                className="bg-white rounded-3xl p-6 border border-[#EEDDC9] shadow-soft space-y-4 hover:border-[#D68C98] transition-all"
              >
                {/* Header with Customer info & Status */}
                <div className="flex items-start justify-between border-b border-[#F5EBE1] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#3D2314]">{cart.customerName}</h3>
                      {getStatusBadge(cart.computedStatus)}
                    </div>
                    <p className="text-xs text-[#7B4B29] mt-0.5 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#D68C98]" />
                      <span>{cart.customerPhone || 'Phone pending'}</span>
                    </p>
                    {cart.customerEmail && (
                      <p className="text-[11px] text-[#A78A7F]">{cart.customerEmail}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-[#A78A7F] flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {cart.inactivityMinutes !== undefined ? (
                        cart.inactivityMinutes === 0 ? 'Active just now' : `${cart.inactivityMinutes}m ago`
                      ) : 'Recent'}
                    </span>
                    <span className="font-bold text-lg text-[#3D2314] block mt-1">
                      ₹{cart.total}
                    </span>
                  </div>
                </div>

                {/* Items in this customer's cart */}
                <div className="space-y-2">
                  <span className="text-[11px] uppercase font-bold text-[#A78A7F] block">
                    Selected Treats ({itemCount} items)
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {cart.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-[#FFF9F2] border border-[#F5EBE1] text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-bold text-[#3D2314]">{item.name}</p>
                            <p className="text-[10px] text-[#7B4B29]">
                              Qty: <strong>{item.quantity}</strong> • ₹{item.price} each
                            </p>
                            {item.boxSelections && (
                              <p className="text-[10px] text-[#D68C98]">Custom Box Assortment</p>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-[#3D2314]">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cart Subtotal Breakdown */}
                <div className="pt-2 border-t border-[#F5EBE1] flex items-center justify-between text-xs text-[#7B4B29]">
                  <div>
                    <span>Subtotal: ₹{cart.subtotal}</span>
                    {cart.discount > 0 && <span className="ml-2 text-emerald-700">Saved: ₹{cart.discount}</span>}
                  </div>

                  {/* Nudge / WhatsApp action */}
                  {cart.customerPhone && cart.customerPhone.length >= 10 && (
                    <button
                      onClick={() => handleSendWhatsAppReminder(cart)}
                      className="bg-[#25D366] hover:bg-[#20ba5a] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span>WhatsApp Nudge</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
