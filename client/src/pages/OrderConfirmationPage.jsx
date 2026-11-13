import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  MessageCircle,
  Package,
  ShoppingBag,
  ArrowRight,
  Share2,
  Printer,
  Sparkles,
  Phone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';
import OrderStatusTracker from '../components/OrderStatusTracker';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [whatsappData, setWhatsappData] = useState(null);

  useEffect(() => {
    // Celebration confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    async function loadOrder() {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        setOrder(res.order);

        // Fetch formatted WhatsApp notification link
        const waRes = await api.get(`/orders/${id}/whatsapp-link`);
        setWhatsappData(waRes);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D2314]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-4">
        <h2 className="font-serif font-bold text-2xl text-[#3D2314]">Order not found</h2>
        <Link to="/menu" className="btn-primary text-xs !py-2 !px-4 mt-4 inline-block">
          Explore Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-3 bg-gradient-to-b from-[#FFF5EA] to-white p-8 rounded-3xl border border-[#EEDDC9] shadow-soft">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-9 h-9" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#9B2226] block">
          Payment Successful & Confirmed!
        </span>
        <h1 className="font-serif font-extrabold text-3xl sm:text-4xl text-[#3D2314]">
          Thank You, {order.customer.name}! 🧁
        </h1>
        <p className="text-xs sm:text-sm text-[#7B4B29] max-w-lg mx-auto">
          Your order has been sent directly to the Trio Treats bakehouse kitchen. Our pastry chefs are preparing your delicious treats!
        </p>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          {whatsappData?.whatsappUrl && (
            <a
              href={whatsappData.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm transition-transform hover:scale-102"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Send Order Confirmation to Bakery WhatsApp</span>
            </a>
          )}

          <button
            onClick={() => window.print()}
            className="bg-white hover:bg-[#FFF9F2] text-[#3D2314] border border-[#EEDDC9] px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-[#7B4B29]" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Real-time Order Status Tracker */}
      <OrderStatusTracker initialOrder={order} />

      {/* Order & Delivery Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Items Summary */}
        <div className="bg-white rounded-3xl p-6 border border-[#EEDDC9] shadow-soft space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#3D2314] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#D68C98]" />
            Ordered Items
          </h3>

          <div className="space-y-3 divide-y divide-[#F5EBE1]">
            {order.items.map((item, i) => (
              <div key={i} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-[#3D2314]">{item.name}</h4>
                    <p className="text-[11px] text-[#7B4B29]">Qty: {item.quantity} × ₹{item.price}</p>
                    {item.boxSelections && (
                      <p className="text-[10px] text-[#A78A7F]">{item.boxSelections.treats?.join(', ')}</p>
                    )}
                  </div>
                </div>
                <span className="font-bold text-[#3D2314]">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#F5EBE1] pt-3 space-y-1.5 text-xs text-[#5C3419]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount ({order.couponCode})</span>
                <span>- ₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>₹{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#3D2314] pt-2 border-t border-[#F5EBE1]">
              <span>Total Paid</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Right: Delivery Address & Payment Ref */}
        <div className="bg-white rounded-3xl p-6 border border-[#EEDDC9] shadow-soft space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#3D2314]">Delivery Information</h3>

          <div className="bg-[#FFF9F2] p-4 rounded-2xl border border-[#EEDDC9] text-xs text-[#5C3419] space-y-1">
            <p className="font-bold text-[#3D2314] text-sm">{order.deliveryAddress.name}</p>
            <p className="text-[#7B4B29] font-medium">+91 {order.deliveryAddress.phone}</p>
            <p className="pt-1">
              {order.deliveryAddress.houseNo}, {order.deliveryAddress.street}
            </p>
            <p>
              {order.deliveryAddress.area}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
            </p>
            {order.deliveryAddress.landmark && (
              <p className="text-[11px] text-[#A78A7F]">Landmark: {order.deliveryAddress.landmark}</p>
            )}
            {order.deliveryAddress.instructions && (
              <p className="text-[11px] text-[#A78A7F] italic">Instructions: {order.deliveryAddress.instructions}</p>
            )}
          </div>

          {/* Payment & Transaction Info */}
          <div className="space-y-2 pt-2 text-xs text-[#7B4B29]">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-semibold text-[#3D2314]">{order.paymentMethod || 'Online Gateway / UPI'}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {order.paymentStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Transaction Ref:</span>
              <span className="font-mono text-[11px] text-[#3D2314]">{order.transactionId || 'TXN_VERIFIED'}</span>
            </div>
          </div>

          {/* Surprise Gift Note if present */}
          {order.isSurpriseGift && (
            <div className="p-3 bg-[#FCE4EC] rounded-2xl border border-[#FAD2E1] text-xs space-y-1">
              <span className="font-bold text-[#9B2226] block">🎁 Surprise Gift Order</span>
              {order.recipientName && <p>For: <strong>{order.recipientName}</strong></p>}
              {order.personalizedMessage && <p className="italic">"{order.personalizedMessage}"</p>}
            </div>
          )}
        </div>
      </div>

      {/* Return Actions */}
      <div className="flex justify-center gap-4 pt-4">
        <Link to="/my-orders" className="btn-primary text-xs !py-3 !px-6 shadow-sm">
          View All My Orders
        </Link>
        <Link to="/menu" className="btn-pink text-xs !py-3 !px-6 shadow-sm">
          Order More Treats
        </Link>
      </div>
    </div>
  );
}
