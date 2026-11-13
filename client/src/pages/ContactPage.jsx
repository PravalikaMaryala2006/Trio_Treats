import React, { useState } from 'react';
import { Phone, Mail, Instagram, MapPin, Send, MessageCircle, Cake, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'Custom Cake',
    date: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = encodeURIComponent(
`🍰 *CUSTOM CAKE / ORDER ENQUIRY - TRIO TREATS* 🍰
Name: ${formData.name}
Phone: +91 ${formData.phone}
Occasion / Type: ${formData.type}
Date Needed: ${formData.date || 'Flexible'}
Message / Theme Details:
"${formData.message}"`
    );
    window.open(`https://wa.me/917075881265?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#D68C98] flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Direct Chef Connect
        </span>
        <h1 className="font-serif font-extrabold text-3xl sm:text-4xl text-[#3D2314]">
          Get in Touch with Trio Treats
        </h1>
        <p className="text-xs sm:text-sm text-[#7B4B29]">
          Have a question about fresh bakes, custom celebration cakes, or bulk orders? Chat directly with owner & baker Vinith!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-[#EEDDC9] shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-xl text-[#3D2314]">Bakery & Owner Details</h3>

            <div className="space-y-4 text-xs text-[#5C3419]">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-[#FFF3E7] text-[#3D2314]">
                  <Phone className="w-5 h-5 text-[#D68C98]" />
                </div>
                <div>
                  <strong className="block text-[#3D2314] text-sm">Vinith (Bakery Owner)</strong>
                  <a href="tel:+917075881265" className="text-[#7B4B29] hover:underline">+91 70758 81265</a>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Available on WhatsApp & Call</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-[#FFF3E7] text-[#3D2314]">
                  <Instagram className="w-5 h-5 text-[#D68C98]" />
                </div>
                <div>
                  <strong className="block text-[#3D2314] text-sm">Instagram Handle</strong>
                  <a
                    href="https://www.instagram.com/TRIO_TREATS_03"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#D68C98] font-bold hover:underline"
                  >
                    @TRIO_TREATS_03
                  </a>
                  <p className="text-[11px] text-[#A78A7F]">Tag us in your sweetest moments!</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-[#FFF3E7] text-[#3D2314]">
                  <Mail className="w-5 h-5 text-[#D68C98]" />
                </div>
                <div>
                  <strong className="block text-[#3D2314] text-sm">Email Address</strong>
                  <span className="text-[#7B4B29]">orders@triotreats.com</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/917075881265"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Open Instant WhatsApp Chat (+91 70758 81265)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Custom Cake Enquiry Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EEDDC9] shadow-soft space-y-5">
          <div>
            <h3 className="font-serif font-bold text-xl text-[#3D2314] flex items-center gap-2">
              <Cake className="w-5 h-5 text-[#D68C98]" />
              Custom Cake & Special Order Enquiry
            </h3>
            <p className="text-xs text-[#7B4B29] mt-0.5">
              Fill this quick form to send your cake theme details straight to Vinith’s WhatsApp
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl px-3.5 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit mobile"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl px-3.5 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                  Date Needed
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl px-3.5 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                Occasion / Treat Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl px-3 py-2.5 text-[#3D2314] font-medium focus:outline-none"
              >
                <option value="Customised Birthday Cake">Customised Birthday Cake</option>
                <option value="Bento Mini Cake">Bento Mini Cake</option>
                <option value="Anniversary / Wedding Cake">Anniversary / Wedding Cake</option>
                <option value="Bulk Treat Boxes / Corporate">Bulk Treat Boxes / Corporate</option>
                <option value="Custom Cupcake Set">Custom Cupcake Set</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                Design, Flavour & Theme Details
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe your desired flavors (e.g. Belgian chocolate truffle), weight (1kg/2kg), colors, or theme..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl p-3 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary text-xs !py-3 flex items-center justify-center gap-2 shadow-md"
            >
              <Send className="w-4 h-4 text-[#FAD2E1]" />
              <span>Send Enquiry to WhatsApp</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
