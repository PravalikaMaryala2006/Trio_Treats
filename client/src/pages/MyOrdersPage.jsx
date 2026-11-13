import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  RotateCcw,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  ShoppingBag
} from 'lucide-react';
import { api } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function MyOrdersPage() {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get('/orders/my-orders');
        setOrders(res.orders || []);
      } catch (err) {
        console.error('Failed to load customer orders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [isAuthenticated]);

  const handleReorder = (order) => {
    order.items.forEach(item => {
      addToCart(
        {
          _id: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          category: item.category
        },
        item.quantity,
        item.customNotes,
        item.boxSelections
      );
    });
    navigate('/cart');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <Package className="w-16 h-16 text-[#D68C98] mx-auto" />
        <h2 className="font-serif font-bold text-2xl text-[#3D2314]">Please Log In to View Orders</h2>
        <p className="text-xs text-[#7B4B29]">Access your order history, live order tracking, and 1-click reordering.</p>
        <Link to="/auth?redirect=/my-orders" className="btn-primary text-xs !py-2.5 !px-6 inline-block">
          Log In to Account
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3D2314]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-[#F5EBE1] pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif font-bold text-3xl text-[#3D2314]">My Bakery Orders</h1>
          <p className="text-xs text-[#7B4B29] mt-0.5">Track live progress or reorder your favorite treats</p>
        </div>
        <Link to="/menu" className="btn-pink text-xs !py-2 !px-4 hidden sm:inline-flex items-center gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>New Order</span>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#EEDDC9] p-8 space-y-3">
          <span className="text-4xl">🍰</span>
          <h3 className="font-serif font-bold text-xl text-[#3D2314]">No Orders Yet</h3>
          <p className="text-xs text-[#7B4B29]">You haven't placed any sweet orders yet. Try our best-selling cupcakes!</p>
          <Link to="/menu" className="btn-primary text-xs !py-2.5 !px-6 inline-block mt-3">
            Explore Menu & Use FIRST30
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isDelivered = order.orderStatus === 'Delivered';
            const isCancelled = order.orderStatus === 'Cancelled';

            return (
              <div
                key={order._id || order.orderId}
                className="bg-white rounded-3xl p-6 border border-[#EEDDC9] shadow-soft space-y-4 hover:border-[#D68C98] transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F5EBE1] pb-3 gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#7B4B29] block">
                      #{order.orderId}
                    </span>
                    <span className="text-[11px] text-[#A78A7F]">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCancelled
                          ? 'bg-red-100 text-red-800'
                          : 'bg-[#FFF3E7] text-[#3D2314] border border-[#EEDDC9] animate-pulse'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-[#FFF9F2] p-2.5 rounded-2xl border border-[#F5EBE1]">
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#3D2314] truncate">{item.name}</p>
                        <p className="text-[10px] text-[#7B4B29]">Qty: {item.quantity} • ₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer with Total and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-[#F5EBE1] gap-3">
                  <div>
                    <span className="text-[11px] text-[#A78A7F] block">Total Amount</span>
                    <span className="font-bold text-lg text-[#3D2314]">₹{order.totalAmount}</span>
                    <span className="text-[11px] text-[#7B4B29] ml-2">({order.paymentMethod || 'Online'})</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleReorder(order)}
                      className="bg-[#FFF3E7] hover:bg-[#EEDDC9] text-[#3D2314] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors border border-[#EEDDC9]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Order Again</span>
                    </button>

                    <Link
                      to={`/order-confirmation/${order.orderId}`}
                      className="btn-primary text-xs !py-2 !px-4 flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Track Order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <a
                      href={`https://wa.me/917075881265?text=Hi%20Vinith!%20I%20am%20checking%20the%20status%20of%20my%20Trio%20Treats%20Order%20%23${order.orderId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full border border-emerald-200 transition-colors"
                      title="Enquire on WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 fill-emerald-600" />
                    </a>
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
