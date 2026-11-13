import React, { useState } from 'react';
import { X, Sparkles, Plus, Trash2, Check, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function BuildBoxModal({ isOpen, onClose }) {
  const { addToCart } = useCart();

  const boxSizes = [
    { size: 4, name: 'Trio Petite (4 Treats)', price: 299, desc: 'Great for a personal indulgence or quick gift' },
    { size: 6, name: 'Trio Delight (6 Treats)', price: 449, desc: 'Our most popular sharing assortment' },
    { size: 12, name: 'Royal Celebration (12 Treats)', price: 899, desc: 'Luxury party box with custom satin ribbon' },
  ];

  const treatOptions = [
    { id: 't1', name: 'Chocolate Cupcake', type: 'Cupcake', icon: '🧁', price: 80 },
    { id: 't2', name: 'Red Velvet Cupcake', type: 'Cupcake', icon: '🧁', price: 90 },
    { id: 't3', name: 'Vanilla Cupcake', type: 'Cupcake', icon: '🧁', price: 70 },
    { id: 't4', name: 'Choco Chip Cookie', type: 'Cookie', icon: '🍪', price: 55 },
    { id: 't5', name: 'Red Velvet Cookie', type: 'Cookie', icon: '🍪', price: 65 },
    { id: 't6', name: 'Butter Cookie', type: 'Cookie', icon: '🍪', price: 45 },
    { id: 't7', name: 'Chocolate Brownie', type: 'Brownie', icon: '🍫', price: 95 },
    { id: 't8', name: 'Dark Chocolate Bar', type: 'Chocolate', icon: '🍫', price: 150 },
    { id: 't9', name: 'Mix Marble Chocolate', type: 'Chocolate', icon: '🍫', price: 140 },
    { id: 't10', name: 'Teddy Bear Lollipop', type: 'Special', icon: '🍭', price: 120 }
  ];

  const [selectedBox, setSelectedBox] = useState(boxSizes[0]);
  const [selectedTreats, setSelectedTreats] = useState([]);
  const [giftNote, setGiftNote] = useState('');

  if (!isOpen) return null;

  const handleAddTreat = (treat) => {
    if (selectedTreats.length < selectedBox.size) {
      setSelectedTreats([...selectedTreats, treat]);
    }
  };

  const handleRemoveTreat = (index) => {
    setSelectedTreats(selectedTreats.filter((_, idx) => idx !== index));
  };

  const remainingSlots = selectedBox.size - selectedTreats.length;

  const handleAddToCart = () => {
    const customBoxProduct = {
      _id: `custom-box-${Date.now()}`,
      name: `Custom ${selectedBox.name}`,
      category: 'Special Treats',
      price: selectedBox.price,
      weight: `${selectedBox.size} Gourmet Treats`,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    };

    addToCart(
      customBoxProduct,
      1,
      giftNote ? `Gift Note: "${giftNote}"` : '',
      {
        boxSize: selectedBox.size,
        boxTitle: selectedBox.name,
        treats: selectedTreats.map(t => t.name),
        giftNote
      }
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-[#FDFBF7] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#EEDDC9] overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3D2314] via-[#5C3419] to-[#3D2314] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Gift className="w-6 h-6 text-[#FAD2E1]" />
            <div>
              <h3 className="font-serif font-bold text-xl text-[#FFF9F2]">Build Your Own Treat Box</h3>
              <p className="text-xs text-[#EEDDC9]">Pick your favorite cookies, brownies, chocolates & cupcakes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Choose Box Size */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#7B4B29] block mb-2.5">
              1. Choose Your Box Size
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {boxSizes.map((box) => (
                <button
                  key={box.size}
                  onClick={() => {
                    setSelectedBox(box);
                    // Trim treats if larger
                    if (selectedTreats.length > box.size) {
                      setSelectedTreats(selectedTreats.slice(0, box.size));
                    }
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    selectedBox.size === box.size
                      ? 'bg-[#FFF3E7] border-[#3D2314] shadow-sm ring-2 ring-[#3D2314]'
                      : 'bg-white border-[#EEDDC9] hover:border-[#D5B695]'
                  }`}
                >
                  {selectedBox.size === box.size && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#3D2314] text-white flex items-center justify-center text-[10px]">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                  <h4 className="font-bold text-sm text-[#3D2314]">{box.name}</h4>
                  <p className="text-xs text-[#7B4B29] mt-0.5">{box.desc}</p>
                  <p className="font-bold text-base text-[#3D2314] mt-2">₹{box.price}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Visual Box Preview */}
          <div className="bg-[#FFF9F2] p-4 rounded-2xl border border-[#EEDDC9]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#3D2314] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D68C98]" />
                Box Slots ({selectedTreats.length} of {selectedBox.size} Filled)
              </span>
              <span className={`text-xs font-bold ${remainingSlots === 0 ? 'text-emerald-700' : 'text-[#7B4B29]'}`}>
                {remainingSlots === 0 ? '✨ Box is Full & Ready!' : `Select ${remainingSlots} more treats`}
              </span>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {Array.from({ length: selectedBox.size }).map((_, index) => {
                const treat = selectedTreats[index];
                return (
                  <div
                    key={index}
                    className={`h-20 rounded-xl border flex flex-col items-center justify-center p-2 text-center relative transition-all ${
                      treat
                        ? 'bg-white border-[#D68C98] shadow-xs'
                        : 'border-dashed border-[#D5B695] bg-[#F5EBE1]/40'
                    }`}
                  >
                    {treat ? (
                      <>
                        <span className="text-2xl">{treat.icon}</span>
                        <span className="text-[10px] font-bold text-[#3D2314] leading-tight truncate w-full mt-1">
                          {treat.name}
                        </span>
                        <button
                          onClick={() => handleRemoveTreat(index)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600 shadow-xs"
                          title="Remove item"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-[#A78A7F] font-medium">
                        Slot #{index + 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Choose Treats to Add */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#7B4B29] block mb-2.5">
              2. Tap Treats to Fill Your Box
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {treatOptions.map((treat) => (
                <button
                  key={treat.id}
                  onClick={() => handleAddTreat(treat)}
                  disabled={selectedTreats.length >= selectedBox.size}
                  className="flex items-center justify-between p-2.5 bg-white hover:bg-[#FFF3E7] rounded-xl border border-[#EEDDC9] text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{treat.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-[#3D2314] leading-tight">{treat.name}</p>
                      <p className="text-[10px] text-[#7B4B29]">{treat.type}</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#FFF9F2] group-hover:bg-[#3D2314] group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Optional Gift Message */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#7B4B29] block mb-1.5">
              3. Complimentary Greeting Message (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Happy Birthday to my favorite sister! Love, Ananya"
              value={giftNote}
              onChange={(e) => setGiftNote(e.target.value)}
              className="w-full text-xs bg-white border border-[#EEDDC9] rounded-xl px-3.5 py-2.5 text-[#3D2314] focus:outline-none focus:ring-2 focus:ring-[#FAD2E1]"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FFF9F2] border-t border-[#EEDDC9] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#7B4B29] block">Total Box Price</span>
            <span className="font-bold text-xl text-[#3D2314]">₹{selectedBox.price}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#7B4B29] hover:bg-white rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              disabled={selectedTreats.length === 0}
              className="btn-primary text-xs !py-2.5 !px-6 flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#FAD2E1]" />
              <span>Add Box to Cart ({selectedTreats.length}/{selectedBox.size})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
