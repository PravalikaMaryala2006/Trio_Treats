import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  User,
  Gift,
  CreditCard,
  Sparkles,
  ChevronLeft,
  Check,
  Plus,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../utils/api';
import MapPicker from '../components/MapPicker';
import PaymentModal from '../components/PaymentModal';

export default function CheckoutPage() {
  const { user, saveAddress } = useAuth();
  const { items, subtotal, deliveryFee, discount, coupon, total } = useCart();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState(user?.savedAddresses || []);
  const [selectedAddressId, setSelectedAddressId] = useState(
    user?.savedAddresses?.length > 0 ? user.savedAddresses[0].id : 'new'
  );

  // Address Form State
  const [addressData, setAddressData] = useState({
    name: user?.fullName || '',
    mobile: user?.mobile || '',
    houseNo: '',
    street: '',
    area: '',
    city: 'Hyderabad',
    pincode: '',
    landmark: '',
    instructions: '',
    coordinates: null
  });

  const [saveForFuture, setSaveForFuture] = useState(true);
  const [isSurpriseGift, setIsSurpriseGift] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [personalizedMessage, setPersonalizedMessage] = useState('');

  // Payment state
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  useEffect(() => {
    if (user?.savedAddresses) {
      setSavedAddresses(user.savedAddresses);
      if (user.savedAddresses.length > 0 && selectedAddressId === 'new') {
        const defaultAddr = user.savedAddresses.find(a => a.isDefault) || user.savedAddresses[0];
        setSelectedAddressId(defaultAddr.id);
        setAddressData({ ...defaultAddr });
      }
    }
  }, [user]);

  const handleSelectSaved = (addr) => {
    setSelectedAddressId(addr.id);
    setAddressData({ ...addr });
  };

  const handleAddNewToggle = () => {
    setSelectedAddressId('new');
    setAddressData({
      name: user?.fullName || '',
      mobile: user?.mobile || '',
      houseNo: '',
      street: '',
      area: '',
      city: 'Hyderabad',
      pincode: '',
      landmark: '',
      instructions: '',
      coordinates: null
    });
  };

  const handleAddressResolvedFromMap = (loc) => {
    setAddressData(prev => ({
      ...prev,
      street: loc.street || prev.street,
      area: loc.area || prev.area,
      city: loc.city || prev.city,
      pincode: loc.pincode || prev.pincode,
      coordinates: { lat: loc.lat, lng: loc.lng }
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!addressData.name || !addressData.mobile || !addressData.houseNo || !addressData.city) {
      setErrorMsg('Please complete all required delivery address fields (House number, Street, City)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save address to user book if chosen
      if (saveForFuture && selectedAddressId === 'new') {
        await saveAddress(addressData);
      }

      // Create Order in backend
      const res = await api.post('/orders/create', {
        items,
        deliveryAddress: addressData,
        couponCode: coupon?.code || '',
        discount,
        subtotal,
        deliveryFee,
        totalAmount: total,
        isSurpriseGift,
        recipientName: isSurpriseGift ? recipientName : '',
        personalizedMessage: isSurpriseGift || personalizedMessage ? personalizedMessage : '',
        paymentMethod: 'Online Gateway'
      });

      if (res.order) {
        setCreatedOrder(res.order);
        setIsPaymentModalOpen(true);
      } else {
        setErrorMsg('Failed to initialize order');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error initiating order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (confirmedOrder) => {
    setIsPaymentModalOpen(false);
    navigate(`/order-confirmation/${confirmedOrder.orderId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/cart"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B4B29] hover:text-[#3D2314]"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Return to Shopping Cart</span>
      </Link>

      <div className="border-b border-[#F5EBE1] pb-4">
        <h1 className="font-serif font-bold text-3xl text-[#3D2314]">Checkout & Delivery Details</h1>
        <p className="text-xs text-[#7B4B29] mt-0.5">Please confirm your bakery delivery address and payment</p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Address & Map */}
        <div className="lg:col-span-8 space-y-6">
          {/* Saved Addresses Selector */}
          {savedAddresses.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-[#EEDDC9] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-[#3D2314] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D68C98]" />
                  Choose Saved Address
                </h3>
                <button
                  type="button"
                  onClick={handleAddNewToggle}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-all ${
                    selectedAddressId === 'new'
                      ? 'bg-[#3D2314] text-[#FFF9F2]'
                      : 'bg-[#FFF3E7] text-[#3D2314] hover:bg-[#EEDDC9]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Enter New Address</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectSaved(addr)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                      selectedAddressId === addr.id
                        ? 'bg-[#FFF3E7] border-[#3D2314] ring-2 ring-[#3D2314]'
                        : 'bg-white border-[#EEDDC9] hover:border-[#D5B695]'
                    }`}
                  >
                    {selectedAddressId === addr.id && (
                      <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#3D2314] text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                    <h4 className="font-bold text-xs text-[#3D2314]">{addr.name}</h4>
                    <p className="text-[11px] text-[#7B4B29] mt-0.5">{addr.mobile}</p>
                    <p className="text-xs text-[#5C3419] mt-1 line-clamp-2">
                      {addr.houseNo}, {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Address Form & GPS Interactive Map */}
          <div className="bg-white rounded-3xl p-6 border border-[#EEDDC9] shadow-soft space-y-5">
            <div>
              <h3 className="font-serif font-bold text-xl text-[#3D2314] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D68C98]" />
                Delivery Address & Door Location
              </h3>
              <p className="text-xs text-[#7B4B29] mt-0.5">
                Pin your doorstep on the interactive map or enter your address below
              </p>
            </div>

            {/* Interactive Map Picker */}
            <MapPicker
              onAddressResolved={handleAddressResolvedFromMap}
              initialCoordinates={addressData.coordinates}
            />

            {/* Address Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                  Recipient Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={addressData.name}
                    onChange={(e) => setAddressData({ ...addressData, name: e.target.value })}
                    className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl pl-8 pr-3 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                  />
                  <User className="w-3.5 h-3.5 text-[#7B4B29] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                  Mobile Number (For Rider & WhatsApp Updates) *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={addressData.mobile}
                    onChange={(e) => setAddressData({ ...addressData, mobile: e.target.value.replace(/\D/g, '') })}
                    className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl pl-8 pr-3 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                  />
                  <Phone className="w-3.5 h-3.5 text-[#7B4B29] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                  House / Flat / Floor No. *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 302, Green Meadows"
                  value={addressData.houseNo}
                  onChange={(e) => setAddressData({ ...addressData, houseNo: e.target.value })}
                  className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl px-3 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                  Street / Building Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5th Cross Road, Jubilee Hills"
                  value={addressData.street}
                  onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                  className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl px-3 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                  Area / Locality
                </label>
                <input
                  type="text"
                  placeholder="e.g. Madhapur / Banjara Hills"
                  value={addressData.area}
                  onChange={(e) => setAddressData({ ...addressData, area: e.target.value })}
                  className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl px-3 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={addressData.city}
                    onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                    className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl px-3 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="500033"
                    value={addressData.pincode}
                    onChange={(e) => setAddressData({ ...addressData, pincode: e.target.value })}
                    className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl px-3 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Opposite City Mall / Near Apollo Hospital"
                  value={addressData.landmark}
                  onChange={(e) => setAddressData({ ...addressData, landmark: e.target.value })}
                  className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl px-3 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                  Rider Delivery Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ring doorbell twice, leave at door..."
                  value={addressData.instructions}
                  onChange={(e) => setAddressData({ ...addressData, instructions: e.target.value })}
                  className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl px-3 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                />
              </div>
            </div>

            {selectedAddressId === 'new' && (
              <label className="flex items-center gap-2 pt-2 cursor-pointer text-xs font-semibold text-[#5C3419]">
                <input
                  type="checkbox"
                  checked={saveForFuture}
                  onChange={(e) => setSaveForFuture(e.target.checked)}
                  className="rounded text-[#3D2314] focus:ring-[#3D2314]"
                />
                <span>Save this address to my profile for future orders</span>
              </label>
            )}
          </div>

          {/* Surprise Gift & Personalised Message Card */}
          <div className="bg-[#FFF9F2] rounded-3xl p-6 border border-[#EEDDC9] shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSurpriseGift}
                  onChange={(e) => setIsSurpriseGift(e.target.checked)}
                  className="rounded text-[#3D2314] focus:ring-[#3D2314] w-4 h-4"
                />
                <span className="font-serif font-bold text-base text-[#3D2314] flex items-center gap-1.5">
                  <Gift className="w-5 h-5 text-[#D68C98]" />
                  This order is a Surprise Gift for someone special!
                </span>
              </label>
            </div>

            {isSurpriseGift && (
              <div className="space-y-3 pt-2 border-t border-[#EEDDC9]">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                    Recipient’s Name
                  </label>
                  <input
                    type="text"
                    placeholder="Who is this surprise gift for?"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full text-xs bg-white border border-[#EEDDC9] rounded-xl px-3.5 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                    Complimentary Greeting Card Message
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Write a sweet message to be printed on a luxury Trio Treats card (e.g. Happy Birthday sweetheart!)..."
                    value={personalizedMessage}
                    onChange={(e) => setPersonalizedMessage(e.target.value)}
                    className="w-full text-xs bg-white border border-[#EEDDC9] rounded-xl p-3 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Pay */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#EEDDC9] shadow-soft space-y-5">
            <h3 className="font-serif font-bold text-xl text-[#3D2314]">Order Summary</h3>

            {/* Mini Items list */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-[#3D2314] truncate max-w-[150px]">{item.name}</p>
                      <p className="text-[10px] text-[#A78A7F]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#3D2314]">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2.5 text-xs text-[#5C3419] border-t border-b border-[#F5EBE1] py-3.5">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span>- ₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
            </div>

            {/* Payable Amount */}
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-[#7B4B29] uppercase">Total Payable</span>
              <span className="font-bold text-2xl text-[#3D2314]">₹{total}</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary text-xs sm:text-sm !py-3.5 flex items-center justify-center gap-2 shadow-md"
            >
              <CreditCard className="w-4 h-4 text-[#FAD2E1]" />
              <span>{isSubmitting ? 'Preparing Order...' : `Proceed to Payment (₹${total})`}</span>
            </button>

            <div className="bg-[#FFF9F2] p-3 rounded-xl border border-[#EEDDC9] text-[11px] text-[#7B4B29] space-y-1">
              <p className="font-semibold text-[#3D2314] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Merchant Payments
              </p>
              <p>UPI, GPay, PhonePe, Paytm, and Cards backed by 256-bit encryption.</p>
            </div>
          </div>
        </div>
      </form>

      {/* Online Payment Modal */}
      {createdOrder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          order={createdOrder}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
