import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const phoneNumber = '917075881265'; // Vinith's Trio Treats WhatsApp

  const quickMessages = [
    'Hi Vinith! I would like to enquire about a Customised Birthday Cake 🎂',
    'Hello! What are today’s fresh cupcake and cookie specials? 🧁',
    'Hi Trio Treats! Can I place a bulk / party treat box order? 🎁',
    'Hello! I need help with tracking my order 📦'
  ];

  const handleSend = (text) => {
    const messageToSend = text || customMsg || 'Hello Trio Treats! I have an enquiry.';
    const encoded = encodeURIComponent(messageToSend);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');
    setIsOpen(false);
    setCustomMsg('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Pop-up dialog */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#EEDDC9] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#25D366] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/logo-badge.png"
                  alt="Trio Treats"
                  className="w-10 h-10 rounded-full bg-white p-0.5 object-cover"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                </span>
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Trio Treats Bakehouse</h4>
                <p className="text-[11px] text-white/90">Vinith is typically online • +91 70758 81265</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-[#FDFBF7] space-y-3 max-h-80 overflow-y-auto">
            {/* Intro Bubble */}
            <div className="bg-[#FFF9F2] border border-[#EEDDC9] p-3 rounded-2xl rounded-tl-none shadow-sm text-xs text-[#3D2314] space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-[#5C3419]">
                <Sparkles className="w-3.5 h-3.5 text-[#D68C98]" />
                Welcome to Trio Treats!
              </p>
              <p className="text-[#5C3419]">
                How can we sweeten your day? Tap a quick option below or type a message to chat directly with Vinith on WhatsApp.
              </p>
            </div>

            {/* Quick Option Pills */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A78A7F]">Quick Enquiries:</p>
              {quickMessages.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(msg)}
                  className="w-full text-left text-xs bg-white hover:bg-[#FAD2E1]/30 p-2.5 rounded-xl border border-[#EEDDC9] text-[#3D2314] font-medium transition-all shadow-xs hover:border-[#D68C98]"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-[#F5EBE1] flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-full px-3.5 py-2 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#25D366]"
            />
            <button
              onClick={() => handleSend()}
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white p-2 rounded-full transition-transform hover:scale-105 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        title="Chat with Trio Treats on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
        <span className="text-xs font-bold hidden sm:inline tracking-wide">
          Chat on WhatsApp
        </span>
      </button>
    </div>
  );
}
