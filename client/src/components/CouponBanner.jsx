import React, { useState } from 'react';
import { Tag, Sparkles, Copy, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CouponBanner() {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText('FIRST30');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFF3E7] via-[#FCE4EC] to-[#FAD2E1] border border-[#EEDDC9] p-5 sm:p-6 shadow-sm">
      {/* Decorative background shapes */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/40 blur-xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-24 h-24 rounded-full bg-[#F4AEC5]/30 blur-lg pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left text */}
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-[#FAD2E1] flex items-center justify-center flex-shrink-0 text-[#3D2314]">
            <Tag className="w-6 h-6 text-[#D68C98]" />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9B2226]">
              <Sparkles className="w-3.5 h-3.5" />
              Special Welcome Gift
            </div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#3D2314] mt-0.5">
              Enjoy Flat ₹30 OFF On Your First Order!
            </h3>
            <p className="text-xs text-[#7B4B29] mt-0.5">
              Valid once per verified mobile number on gourmet cupcakes, cookies, brownies & chocolates.
            </p>
          </div>
        </div>

        {/* Right coupon badge & action */}
        <div className="flex items-center gap-3">
          <div className="bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-dashed border-[#D68C98] flex items-center gap-2.5 shadow-xs">
            <span className="font-mono font-extrabold text-base tracking-widest text-[#3D2314]">
              FIRST30
            </span>
            <button
              onClick={copyCode}
              className="text-[#7B4B29] hover:text-[#3D2314] p-1 rounded-lg transition-colors"
              title="Copy Coupon Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <Link
            to="/menu"
            className="btn-primary text-xs !py-2.5 !px-5 flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <span>Order Treats</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
