import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  Gift
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    discount,
    coupon,
    total,
    applyCoupon,
    removeCoupon
  } = useCart();

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState({ text: '', isError: false });
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponInput;
    if (!code.trim()) return;

    setApplying(true);
    setCouponMsg({ text: '', isError: false });

    const res = await applyCoupon(code.trim().toUpperCase());
    setApplying(false);

    if (res.success) {
      setCouponMsg({ text: res.message, isError: false });
      setCouponInput('');
    } else {
      setCouponMsg({ text: res.message, isError: true });
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-[#FFF3E7] flex items-center justify-center mx-auto text-4xl shadow-inner border border-[#EEDDC9]">
          🧁
        </div>
        <h2 className="font-serif font-bold text-3xl text-[#3D2314]">Your Bakery Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-[#7B4B29] max-w-md mx-auto">
          Treat yourself or a loved one to our fresh homemade cupcakes, cookies, brownies, and chocolates!
        </p>
        <Link
          to="/menu"
          className="btn-primary text-xs !py-3 !px-8 inline-flex items-center gap-2 shadow-md mt-4"
        >
          <ShoppingBag className="w-4 h-4 text-[#FAD2E1]" />
          <span>Explore Fresh Bakes</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/menu"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B4B29] hover:text-[#3D2314]"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Continue Shopping</span>
      </Link>

      <div className="flex items-baseline justify-between border-b border-[#F5EBE1] pb-4">
        <h1 className="font-serif font-bold text-3xl text-[#3D2314]">Your Treat Cart</h1>
        <span className="text-xs font-semibold text-[#7B4B29]">
          {items.reduce((sum, i) => sum + i.quantity, 0)} items in total
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item, index) => (
            <div
              key={`${item.productId}-${index}`}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EEDDC9] shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              {/* Product Info */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-[#F5EBE1] flex-shrink-0"
                />
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#D68C98] block">
                    {item.category || 'Bakery Item'}
                  </span>
                  <h3 className="font-serif font-bold text-base text-[#3D2314]">
                    {item.name}
                  </h3>
                  <p className="text-xs font-bold text-[#5C3419]">
                    ₹{item.price} each
                  </p>

                  {/* Custom selections if custom box */}
                  {item.boxSelections && (
                    <div className="text-[11px] text-[#7B4B29] bg-[#FFF9F2] p-2 rounded-xl border border-[#EEDDC9]">
                      <p className="font-semibold text-[#3D2314]">Includes:</p>
                      <p>{item.boxSelections.treats?.join(', ')}</p>
                      {item.boxSelections.giftNote && (
                        <p className="italic text-[#A78A7F] mt-0.5">"{item.boxSelections.giftNote}"</p>
                      )}
                    </div>
                  )}

                  {item.customNotes && (
                    <p className="text-[11px] text-[#A78A7F] italic">Note: {item.customNotes}</p>
                  )}
                </div>
              </div>

              {/* Quantity Stepper & Price */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-[#F5EBE1]">
                <div className="flex items-center bg-[#FFF9F2] border border-[#EEDDC9] rounded-full p-1 shadow-xs">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1, index)}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#FFF3E7] text-[#3D2314] transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-xs text-[#3D2314]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1, index)}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#FFF3E7] text-[#3D2314] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <span className="font-bold text-base text-[#3D2314]">
                    ₹{item.price * item.quantity}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.productId, index)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                  title="Remove from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* FIRST30 Prompt Card if not applied */}
          {!coupon && (
            <div className="bg-[#FFF3E7] border border-[#EEDDC9] p-4 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Tag className="w-5 h-5 text-[#D68C98]" />
                <div>
                  <p className="text-xs font-bold text-[#3D2314]">First order at Trio Treats?</p>
                  <p className="text-[11px] text-[#7B4B29]">Use coupon code <strong>FIRST30</strong> for flat ₹30 OFF!</p>
                </div>
              </div>
              <button
                onClick={() => handleApplyCoupon('FIRST30')}
                className="btn-pink text-xs !py-1.5 !px-3 font-bold"
              >
                Apply FIRST30
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#EEDDC9] shadow-soft space-y-6">
            <h2 className="font-serif font-bold text-xl text-[#3D2314]">Bill Details</h2>

            {/* Coupon Code Input */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1.5">
                Have a Promo Code?
              </label>

              {coupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-bold">{coupon.code} Applied</p>
                      <p className="text-[11px]">₹{coupon.discount} discount saved</p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter FIRST30"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl px-3 py-2 uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    disabled={applying || !couponInput.trim()}
                    className="btn-primary text-xs !py-2 !px-4 disabled:opacity-50"
                  >
                    {applying ? 'Checking...' : 'Apply'}
                  </button>
                </div>
              )}

              {couponMsg.text && (
                <p className={`text-[11px] mt-1.5 font-medium ${couponMsg.isError ? 'text-red-600' : 'text-emerald-700'}`}>
                  {couponMsg.text}
                </p>
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-3 text-xs text-[#5C3419] border-t border-b border-[#F5EBE1] py-4">
              <div className="flex justify-between">
                <span>Item Subtotal</span>
                <span className="font-semibold text-[#3D2314]">₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Coupon Discount ({coupon?.code})
                  </span>
                  <span>- ₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE (Above ₹300)</span>
                  ) : (
                    <span className="font-semibold text-[#3D2314]">₹{deliveryFee}</span>
                  )}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-[11px] uppercase font-bold text-[#A78A7F] block">To Pay</span>
                <span className="font-bold text-2xl text-[#3D2314]">₹{total}</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md">
                Savings: ₹{discount + (subtotal >= 300 ? 40 : 0)}
              </span>
            </div>

            {/* Proceed Button */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full btn-primary text-xs sm:text-sm !py-3.5 flex items-center justify-center gap-2 shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#FAD2E1]" />
            </button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#A78A7F]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7B4B29]" />
              <span>Safe & Secure Artisanal Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
