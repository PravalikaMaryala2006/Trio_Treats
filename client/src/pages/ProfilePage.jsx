import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Trash2, Plus, ShieldCheck, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function ProfilePage() {
  const { user, deleteAddress, saveAddress } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [msg, setMsg] = useState('');

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    houseNo: '',
    street: '',
    area: '',
    city: 'Hyderabad',
    pincode: '',
    landmark: '',
    instructions: ''
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/me', { fullName, email });
      setMsg('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Update failed');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await saveAddress(newAddr);
      setIsAddingAddress(false);
      setNewAddr({ houseNo: '', street: '', area: '', city: 'Hyderabad', pincode: '', landmark: '', instructions: '' });
    } catch (err) {
      alert(err.message || 'Failed to save address');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-[#F5EBE1] pb-4">
        <h1 className="font-serif font-bold text-3xl text-[#3D2314]">Customer Profile & Addresses</h1>
        <p className="text-xs text-[#7B4B29] mt-0.5">Manage your account information and saved delivery doorsteps</p>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Account Info */}
        <div className="bg-white rounded-3xl p-6 border border-[#EEDDC9] shadow-soft space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAD2E1] flex items-center justify-center text-[#3D2314] font-serif font-bold text-2xl mx-auto shadow-sm">
            {user?.fullName?.charAt(0) || 'U'}
          </div>

          <div className="text-center">
            <h2 className="font-serif font-bold text-lg text-[#3D2314]">{user?.fullName}</h2>
            <p className="text-xs text-[#7B4B29]">{user?.mobile}</p>
            <span className="inline-block mt-2 bg-[#FFF3E7] text-[#5C3419] border border-[#EEDDC9] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              Trio Treats Patron
            </span>
          </div>

          <div className="pt-4 border-t border-[#F5EBE1] space-y-3 text-xs text-[#5C3419]">
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#7B4B29]" />
              <span>+91 {user?.mobile}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#7B4B29]" />
              <span>{user?.email}</span>
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>FIRST30 Status: {user?.usedFirst30Coupon ? 'Redeemed' : 'Eligible'}</span>
            </p>
          </div>
        </div>

        {/* Right: Saved Addresses */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#EEDDC9] shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#3D2314] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D68C98]" />
                Saved Delivery Addresses ({user?.savedAddresses?.length || 0})
              </h3>
              <button
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                className="btn-pink text-xs !py-1.5 !px-3 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingAddress ? 'Cancel' : 'Add New'}</span>
              </button>
            </div>

            {/* Add Address Form */}
            {isAddingAddress && (
              <form onSubmit={handleAddAddress} className="bg-[#FFF9F2] p-4 rounded-2xl border border-[#EEDDC9] space-y-3 text-xs">
                <h4 className="font-bold text-[#3D2314]">New Delivery Doorstep</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="House / Flat No."
                    value={newAddr.houseNo}
                    onChange={(e) => setNewAddr({ ...newAddr, houseNo: e.target.value })}
                    className="p-2 bg-white rounded-lg border border-[#EEDDC9]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street / Colony"
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    className="p-2 bg-white rounded-lg border border-[#EEDDC9]"
                  />
                  <input
                    type="text"
                    placeholder="Area"
                    value={newAddr.area}
                    onChange={(e) => setNewAddr({ ...newAddr, area: e.target.value })}
                    className="p-2 bg-white rounded-lg border border-[#EEDDC9]"
                  />
                  <input
                    type="text"
                    placeholder="PIN Code"
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="p-2 bg-white rounded-lg border border-[#EEDDC9]"
                  />
                </div>
                <button type="submit" className="btn-primary !py-2 !px-4 text-xs">
                  Save Address
                </button>
              </form>
            )}

            {/* List */}
            <div className="space-y-3">
              {(!user?.savedAddresses || user.savedAddresses.length === 0) ? (
                <p className="text-xs text-[#7B4B29] py-4 text-center">
                  No saved addresses yet. Addresses you use during checkout will appear here!
                </p>
              ) : (
                user.savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#F5EBE1] flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-bold text-xs text-[#3D2314]">{addr.name || user.fullName}</p>
                      <p className="text-xs text-[#5C3419] mt-0.5">
                        {addr.houseNo}, {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
                      </p>
                      {addr.landmark && (
                        <p className="text-[10px] text-[#A78A7F]">Landmark: {addr.landmark}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-white"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
