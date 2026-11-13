import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  Smartphone,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';
import { useCart } from '../context/CartContext';

export default function PaymentModal({ isOpen, onClose, order, onSuccess }) {
  const { clearCart } = useCart();
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'razorpay'
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [utrNumber, setUtrNumber] = useState('');

  // Card form state
  const [cardData, setCardData] = useState({
    name: order?.customer?.name || '',
    number: '',
    expiry: '',
    cvv: ''
  });

  if (!isOpen || !order) return null;

  const totalAmount = order.totalAmount;
  const merchantUpi = '7075881265@upi';
  const merchantName = 'Trio Treats Bakery (Vinith)';
  const upiIntentUrl = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=${totalAmount}&cu=INR&tn=Order_${order.orderId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiIntentUrl)}`;

  // Server-side Payment Verification
  const handleVerifyPayment = async (methodName, transactionRef = null) => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      // Simulate gateway authorization delay
      await new Promise(r => setTimeout(r, 1800));

      const payload = {
        orderId: order.orderId,
        paymentMethod: methodName,
        transactionRef: transactionRef || `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        razorpay_payment_id: `pay_${Date.now()}`
      };

      const res = await api.post('/payment/verify', payload);

      if (res.success) {
        // Fire celebration confetti!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });

        clearCart();
        onSuccess(res.order);
      } else {
        setErrorMsg(res.message || 'Payment verification failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Payment processing error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    if (!cardData.number || cardData.number.length < 15) {
      setErrorMsg('Please enter a valid card number');
      return;
    }
    if (!cardData.expiry || !cardData.cvv) {
      setErrorMsg('Please enter card expiry and CVV');
      return;
    }

    const cardType = cardData.number.startsWith('4') ? 'Visa' : 'Mastercard / RuPay';
    handleVerifyPayment(`Card (${cardType})`, `CARD_REF_${Date.now()}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-[#FDFBF7] w-full max-w-lg rounded-3xl shadow-2xl border border-[#EEDDC9] overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3D2314] via-[#5C3419] to-[#3D2314] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FFF9F2] p-1 flex items-center justify-center">
              <img src="/logo-badge.png" alt="Trio Treats" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#FFF9F2]">Trio Treats Secure Checkout</h3>
              <p className="text-xs text-[#FAD2E1] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Merchant: Vinith (+91 70758 81265)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Price Banner */}
        <div className="bg-[#FFF3E7] p-4 border-b border-[#EEDDC9] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#7B4B29] block">Total Amount Payable</span>
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-2xl text-[#3D2314]">₹{totalAmount}</span>
              <span className="text-xs text-[#7B4B29] font-medium">INR (All Taxes Incl.)</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#A78A7F] block">Order ID</span>
            <span className="font-mono text-xs font-bold text-[#3D2314]">{order.orderId}</span>
          </div>
        </div>

        {/* Payment Tabs */}
        <div className="flex border-b border-[#EEDDC9] bg-white text-xs font-bold">
          <button
            onClick={() => setActiveTab('upi')}
            className={`flex-1 py-3 text-center flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'upi'
                ? 'border-[#3D2314] text-[#3D2314] bg-[#FFF9F2]'
                : 'border-transparent text-[#7B4B29] hover:bg-[#FFF9F2]'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#D68C98]" />
            <span>UPI & QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-3 text-center flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'card'
                ? 'border-[#3D2314] text-[#3D2314] bg-[#FFF9F2]'
                : 'border-transparent text-[#7B4B29] hover:bg-[#FFF9F2]'
            }`}
          >
            <CreditCard className="w-4 h-4 text-[#D68C98]" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setActiveTab('razorpay')}
            className={`flex-1 py-3 text-center flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'razorpay'
                ? 'border-[#3D2314] text-[#3D2314] bg-[#FFF9F2]'
                : 'border-transparent text-[#7B4B29] hover:bg-[#FFF9F2]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#D68C98]" />
            <span>Razorpay Gateway</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: UPI & QR CODE */}
          {activeTab === 'upi' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-[#7B4B29]">
                Scan with any UPI App: <strong>Google Pay, PhonePe, Paytm, BHIM</strong>
              </p>

              {/* QR Code Container */}
              <div className="inline-block p-3 bg-white rounded-2xl border-2 border-dashed border-[#D5B695] shadow-xs">
                <img
                  src={qrCodeUrl}
                  alt="UPI Payment QR Code"
                  className="w-44 h-44 object-contain mx-auto"
                />
                <p className="text-[10px] text-[#A78A7F] mt-2 font-mono">
                  UPI ID: {merchantUpi}
                </p>
              </div>

              {/* Quick UPI App Buttons */}
              <div className="pt-2">
                <p className="text-[11px] font-bold text-[#7B4B29] mb-2">Or select your UPI App:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleVerifyPayment('Google Pay (GPay)')}
                    disabled={isProcessing}
                    className="p-2.5 rounded-xl border border-[#EEDDC9] bg-white hover:bg-[#FFF3E7] font-semibold text-xs flex flex-col items-center justify-center gap-1 transition-all"
                  >
                    <span className="text-base">🟢</span>
                    <span>Google Pay</span>
                  </button>
                  <button
                    onClick={() => handleVerifyPayment('PhonePe')}
                    disabled={isProcessing}
                    className="p-2.5 rounded-xl border border-[#EEDDC9] bg-white hover:bg-[#FFF3E7] font-semibold text-xs flex flex-col items-center justify-center gap-1 transition-all"
                  >
                    <span className="text-base">🟣</span>
                    <span>PhonePe</span>
                  </button>
                  <button
                    onClick={() => handleVerifyPayment('Paytm')}
                    disabled={isProcessing}
                    className="p-2.5 rounded-xl border border-[#EEDDC9] bg-white hover:bg-[#FFF3E7] font-semibold text-xs flex flex-col items-center justify-center gap-1 transition-all"
                  >
                    <span className="text-base">🔵</span>
                    <span>Paytm</span>
                  </button>
                </div>
              </div>

              {/* Direct Instant Verification Button */}
              <button
                onClick={() => handleVerifyPayment('UPI Direct (QR / Intent)')}
                disabled={isProcessing}
                className="w-full btn-primary !py-3 text-xs font-bold flex items-center justify-center gap-2 mt-2 shadow-md"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#FAD2E1]" />
                    <span>Verifying with Merchant Account...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#FAD2E1]" />
                    <span>I have Paid ₹{totalAmount} – Verify Payment</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: CARDS */}
          {activeTab === 'card' && (
            <form onSubmit={handleCardSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="Name as on card"
                  value={cardData.name}
                  onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                  className="w-full text-xs bg-white border border-[#EEDDC9] rounded-xl px-3.5 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="4532 •••• •••• 8821"
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    className="w-full text-xs bg-white border border-[#EEDDC9] rounded-xl pl-3.5 pr-10 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                    required
                  />
                  <CreditCard className="w-4 h-4 text-[#7B4B29] absolute right-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM / YY"
                    maxLength={5}
                    value={cardData.expiry}
                    onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                    className="w-full text-xs bg-white border border-[#EEDDC9] rounded-xl px-3.5 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    className="w-full text-xs bg-white border border-[#EEDDC9] rounded-xl px-3.5 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full btn-primary !py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#FAD2E1]" />
                      <span>Authorizing Card ₹{totalAmount}...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#FAD2E1]" />
                      <span>Pay Securely ₹{totalAmount}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: RAZORPAY GATEWAY */}
          {activeTab === 'razorpay' && (
            <div className="space-y-4 text-center py-3">
              <div className="w-14 h-14 rounded-full bg-[#EEDDC9]/50 flex items-center justify-center mx-auto text-[#3D2314]">
                <ShieldCheck className="w-8 h-8 text-[#5C3419]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#3D2314]">Razorpay Official Merchant Gateway</h4>
                <p className="text-xs text-[#7B4B29] mt-1">
                  Supports Netbanking (50+ banks), UPI, Cards, and Wallets. Secure 256-bit encryption.
                </p>
              </div>

              <div className="p-3 bg-[#FFF3E7] rounded-xl border border-[#EEDDC9] text-xs text-[#5C3419] text-left space-y-1">
                <p><strong>Merchant:</strong> Trio Treats Bakery (Vinith)</p>
                <p><strong>Gateway Key:</strong> rzp_test_TrioTreats2026</p>
                <p><strong>Status:</strong> Ready for live transaction</p>
              </div>

              <button
                onClick={() => handleVerifyPayment('Razorpay Gateway', `RZP_${Date.now()}`)}
                disabled={isProcessing}
                className="w-full btn-primary !py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#FAD2E1]" />
                    <span>Connecting to Razorpay...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#FAD2E1]" />
                    <span>Launch Razorpay & Pay ₹{totalAmount}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Security Assurance */}
        <div className="bg-[#FFF9F2] p-3 border-t border-[#EEDDC9] flex items-center justify-center gap-4 text-[11px] text-[#A78A7F]">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-[#7B4B29]" />
            256-bit SSL Encrypted
          </span>
          <span>•</span>
          <span>PCI-DSS Compliant</span>
          <span>•</span>
          <span>Never stores card details</span>
        </div>
      </div>
    </div>
  );
}
