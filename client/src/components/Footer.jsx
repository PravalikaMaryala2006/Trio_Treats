import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Instagram, Phone, Mail, MapPin, ShieldCheck, Sparkles, Award } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-[#2A170C] text-[#EDE4DC] pt-16 pb-10 border-t border-[#3D2314]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Promise Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-12 border-b border-[#3D2314] text-center">
          <div className="p-4 rounded-2xl bg-[#3D2314]/60 border border-[#5C3419]">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-[#FAD2E1]" />
            <h4 className="font-bold text-sm text-[#FFF9F2]">100% Homemade</h4>
            <p className="text-xs text-[#C29F87] mt-1">Baked fresh with pure love & artisan butter</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#3D2314]/60 border border-[#5C3419]">
            <Award className="w-6 h-6 mx-auto mb-2 text-[#FAD2E1]" />
            <h4 className="font-bold text-sm text-[#FFF9F2]">Premium Ingredients</h4>
            <p className="text-xs text-[#C29F87] mt-1">Real Belgian chocolate & pure vanilla extract</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#3D2314]/60 border border-[#5C3419]">
            <Heart className="w-6 h-6 mx-auto mb-2 text-[#FAD2E1]" />
            <h4 className="font-bold text-sm text-[#FFF9F2]">Eggless & Pure</h4>
            <p className="text-xs text-[#C29F87] mt-1">Hygienic kitchen with strict food safety</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#3D2314]/60 border border-[#5C3419]">
            <Phone className="w-6 h-6 mx-auto mb-2 text-[#FAD2E1]" />
            <h4 className="font-bold text-sm text-[#FFF9F2]">Direct Chef Connect</h4>
            <p className="text-xs text-[#C29F87] mt-1">WhatsApp Vinith for custom orders & treats</p>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="bg-[#FFF9F2] p-3 rounded-2xl inline-block shadow-md">
              <Logo size="sm" showTagline={true} />
            </div>
            <p className="text-xs text-[#C29F87] leading-relaxed">
              Trio Treats is a boutique homemade bakery bringing you artisanal cupcakes, chewy cookies, silky chocolates, and fudgy brownies. Every bite is crafted to deliver pure joy!
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.instagram.com/TRIO_TREATS_03"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#5C3419] flex items-center justify-center text-[#FAD2E1] hover:bg-[#FAD2E1] hover:text-[#3D2314] transition-all"
                title="Follow us on Instagram: @TRIO_TREATS_03"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/917075881265"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#5C3419] flex items-center justify-center text-[#FAD2E1] hover:bg-[#25D366] hover:text-white transition-all"
                title="Chat on WhatsApp: +91 70758 81265"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Bakery Menu */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAD2E1] mb-4 font-sans">
              Our Fresh Bakes
            </h3>
            <ul className="space-y-2.5 text-xs text-[#C29F87]">
              <li><Link to="/menu?category=Cupcakes" className="hover:text-white transition-colors">Cupcakes (Chocolate, Red Velvet, Vanilla)</Link></li>
              <li><Link to="/menu?category=Cookies" className="hover:text-white transition-colors">Cookies (Choco Chip, Butter, Mini Dips)</Link></li>
              <li><Link to="/menu?category=Chocolates" className="hover:text-white transition-colors">Artisanal Chocolates (Dark, Milk, Marble)</Link></li>
              <li><Link to="/menu?category=Brownies" className="hover:text-white transition-colors">Fudgy Triple-Chocolate Brownies</Link></li>
              <li><Link to="/menu?category=Special%20Treats" className="hover:text-white transition-colors">Teddy Pops, Bento Cakes & Gift Hampers</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAD2E1] mb-4 font-sans">
              Customer Support
            </h3>
            <ul className="space-y-2.5 text-xs text-[#C29F87]">
              <li><Link to="/my-orders" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">My Treat Wishlist</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us & Custom Cake Enquiry</Link></li>
              <li><Link to="/admin/login" className="text-[#FAD2E1]/80 hover:text-white transition-colors flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Bakery Owner Login</Link></li>
            </ul>
          </div>

          {/* Bakery Owner & Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAD2E1] mb-4 font-sans">
              Bakehouse & Orders
            </h3>
            <div className="space-y-3 text-xs text-[#C29F87]">
              <p className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#FAD2E1] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Vinith (Owner):</strong><br />
                  <a href="tel:+917075881265" className="hover:text-white">+91 70758 81265</a>
                </span>
              </p>
              <p className="flex items-start gap-2.5">
                <Instagram className="w-4 h-4 text-[#FAD2E1] flex-shrink-0 mt-0.5" />
                <span>
                  Follow on Instagram:<br />
                  <a href="https://www.instagram.com/TRIO_TREATS_03" target="_blank" rel="noreferrer" className="text-[#FAD2E1] hover:underline">
                    @TRIO_TREATS_03
                  </a>
                </span>
              </p>
              <p className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#FAD2E1] flex-shrink-0 mt-0.5" />
                <span>orders@triotreats.com</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 border-t border-[#3D2314] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8F6A52] gap-4">
          <p>© 2026 TRIO TREATS. All Rights Reserved. Made with ❤️ for sweet lovers.</p>
          <div className="flex items-center gap-2">
            <span>Official Tagline:</span>
            <span className="font-hand text-[#FAD2E1] text-base">"A Little Bite of Happiness"</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
