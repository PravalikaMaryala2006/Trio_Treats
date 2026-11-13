import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBag,
  Star,
  Gift,
  ArrowRight,
  Heart,
  ChevronRight,
  Search,
  Clock,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../utils/api';
import ProductCard from '../components/ProductCard';
import CouponBanner from '../components/CouponBanner';
import BuildBoxModal from '../components/BuildBoxModal';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isBuildBoxOpen, setIsBuildBoxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/products');
        setProducts(res.products || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    }
    loadData();

    // Load recently viewed
    try {
      const rv = localStorage.getItem('trio_treats_recent');
      if (rv) setRecentlyViewed(JSON.parse(rv));
    } catch {}
  }, []);

  const categories = [
    { name: 'All', icon: '🍰' },
    { name: 'Cupcakes', icon: '🧁' },
    { name: 'Cookies', icon: '🍪' },
    { name: 'Chocolates', icon: '🍫' },
    { name: 'Brownies', icon: '🥮' },
    { name: 'Special Treats', icon: '🎁' }
  ];

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const cupcakes = products.filter(p => p.category === 'Cupcakes');
  const cookies = products.filter(p => p.category === 'Cookies');
  const specialTreats = products.filter(p => p.category === 'Special Treats');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF5EA] via-[#FDF8F0] to-[#FDFBF7] pt-8 pb-14 border-b border-[#EEDDC9]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Customer Welcome Greeting */}
              {isAuthenticated && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF3E7] border border-[#EEDDC9] text-xs font-semibold text-[#5C3419] shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Welcome back, <strong>{user?.fullName}</strong>! What's your sweet craving today?</span>
                </div>
              )}

              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FCE4EC] border border-[#FAD2E1] text-[#7B4B29] text-xs font-bold uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#D68C98]" />
                Artisanal Homemade Bakehouse
              </div>

              {/* Main Headline */}
              <h1 className="font-serif font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#3D2314] leading-[1.15]">
                Freshly Baked with Love,{' '}
                <span className="italic text-[#7B4B29] font-hand block sm:inline mt-1">
                  "A Little Bite of Happiness"
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#7B4B29] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Indulge in handcrafted cupcakes, melt-in-the-mouth European butter cookies, single-origin dark chocolates, and fudgy triple-chocolate brownies. Prepared in small artisanal batches and delivered warm & fresh to your doorstep.
              </p>

              {/* Hero Search Bar (Swiggy / Zomato style) */}
              <form onSubmit={handleSearch} className="max-w-lg mx-auto lg:mx-0 relative">
                <div className="relative flex items-center shadow-warm rounded-full bg-white border-2 border-[#EEDDC9] p-1.5 focus-within:border-[#3D2314] transition-all">
                  <Search className="w-5 h-5 text-[#7B4B29] ml-3" />
                  <input
                    type="text"
                    placeholder="What are you craving today? (Cupcakes, Brownies...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs sm:text-sm text-[#3D2314] px-3 py-2 bg-transparent focus:outline-none placeholder:text-[#A78A7F]"
                  />
                  <button
                    type="submit"
                    className="btn-primary text-xs !py-2.5 !px-5 whitespace-nowrap shadow-sm"
                  >
                    Search Treats
                  </button>
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link to="/menu" className="btn-primary text-xs !py-3 !px-7 flex items-center gap-2 shadow-md">
                  <ShoppingBag className="w-4 h-4 text-[#FAD2E1]" />
                  <span>Order Fresh Treats</span>
                </Link>

                <button
                  onClick={() => setIsBuildBoxOpen(true)}
                  className="btn-pink text-xs !py-3 !px-6 flex items-center gap-2 shadow-sm hover:scale-102 transition-transform"
                >
                  <Gift className="w-4 h-4 text-[#3D2314]" />
                  <span>Build Your Treat Box</span>
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-[#7B4B29] font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#D68C98]" />
                  30-45 Min Express Delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#D68C98]" />
                  100% Homemade & Pure
                </span>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Decorative glow */}
                <div className="absolute inset-0 bg-[#FAD2E1]/50 rounded-full blur-3xl transform -rotate-6 scale-90 pointer-events-none" />

                {/* Main Featured Showcase */}
                <div className="relative bg-white rounded-3xl p-4 shadow-warm border border-[#EEDDC9]">
                  <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-[#FFF9F2]">
                    <img
                      src="https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80"
                      alt="Trio Treats Signature Bakes"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#EEDDC9] shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#D68C98] uppercase tracking-wider block">Today's Fresh Batch</span>
                        <h4 className="font-serif font-bold text-sm text-[#3D2314]">Belgian Chocolate Cupcakes</h4>
                        <p className="text-xs font-bold text-[#5C3419]">₹80 each</p>
                      </div>
                      <Link
                        to="/menu?category=Cupcakes"
                        className="w-9 h-9 rounded-full bg-[#3D2314] text-white flex items-center justify-center hover:bg-[#5C3419] transition-colors shadow-sm"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Floating floating sticker card */}
                  <div className="absolute -top-4 -left-4 bg-[#FFF9F2] p-2 rounded-2xl shadow-lg border border-[#FAD2E1] flex items-center gap-2 animate-bounce-subtle">
                    <img src="/logo-badge.png" alt="Trio Treats" className="w-10 h-10 rounded-full object-contain" />
                    <div>
                      <p className="font-serif font-bold text-xs text-[#3D2314]">Official Bakery</p>
                      <p className="text-[10px] text-[#7B4B29]">Fresh Everyday ✨</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FIRST ORDER COUPON BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CouponBanner />
      </section>

      {/* 3. CATEGORY SELECTOR TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif font-bold text-2xl text-[#3D2314]">Bakery Categories</h2>
            <p className="text-xs text-[#7B4B29]">Explore our sweet offerings by category</p>
          </div>
          <Link to="/menu" className="text-xs font-bold text-[#5C3419] hover:underline flex items-center gap-1">
            <span>View Full Menu</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-xs ${
                selectedCategory === cat.name
                  ? 'bg-[#3D2314] text-[#FFF9F2] shadow-sm scale-102'
                  : 'bg-white hover:bg-[#FFF3E7] text-[#3D2314] border border-[#EEDDC9]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9B2226]">
              <Sparkles className="w-3.5 h-3.5" />
              Customer Favorites
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#3D2314]">Best Sellers</h2>
          </div>
          <Link
            to="/menu"
            className="text-xs font-bold text-[#5C3419] hover:text-[#3D2314] flex items-center gap-1 bg-[#FFF3E7] px-3.5 py-1.5 rounded-full border border-[#EEDDC9]"
          >
            <span>See All ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onOpenCustomBox={() => setIsBuildBoxOpen(true)}
            />
          ))}
        </div>
      </section>

      {/* 5. INNOVATIVE HIGHLIGHTS BANNER (Build Your Own Box & Surprise Gifts) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Build Your Own Treat Box */}
          <div className="bg-gradient-to-br from-[#FFF3E7] to-[#FCE4EC] rounded-3xl p-6 sm:p-8 border border-[#EEDDC9] flex flex-col justify-between relative overflow-hidden shadow-soft">
            <div className="space-y-3 z-10">
              <span className="bg-[#3D2314] text-[#FAD2E1] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                Interactive Customizer
              </span>
              <h3 className="font-serif font-bold text-2xl text-[#3D2314]">
                Build Your Own Custom Treat Box 🎁
              </h3>
              <p className="text-xs sm:text-sm text-[#7B4B29] leading-relaxed max-w-sm">
                Can't decide? Handpick your favorite cupcakes, chewy cookies, silky chocolates and brownies in a 4, 6 or 12-treat custom gift box!
              </p>
              <button
                onClick={() => setIsBuildBoxOpen(true)}
                className="btn-primary text-xs !py-2.5 !px-6 flex items-center gap-2 mt-4 shadow-sm"
              >
                <Gift className="w-4 h-4 text-[#FAD2E1]" />
                <span>Start Assembling Box (From ₹299)</span>
              </button>
            </div>
            <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-[#FAD2E1]/60 rounded-full blur-xl pointer-events-none" />
          </div>

          {/* Card 2: Surprise Gift Ordering */}
          <div className="bg-gradient-to-br from-[#FFF9F2] to-[#EEDDC9]/50 rounded-3xl p-6 sm:p-8 border border-[#EEDDC9] flex flex-col justify-between relative overflow-hidden shadow-soft">
            <div className="space-y-3 z-10">
              <span className="bg-[#D68C98] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                Surprise Loved Ones
              </span>
              <h3 className="font-serif font-bold text-2xl text-[#3D2314]">
                Send as a Sweet Surprise Gift 💌
              </h3>
              <p className="text-xs sm:text-sm text-[#7B4B29] leading-relaxed max-w-sm">
                Sending to friends or family? Check "Surprise Gift" at checkout! We’ll wrap it with a satin bow, conceal invoice pricing, and include your custom greeting card message.
              </p>
              <Link
                to="/menu?category=Special%20Treats"
                className="btn-pink text-xs !py-2.5 !px-6 flex items-center gap-2 mt-4 shadow-sm inline-flex w-fit"
              >
                <Heart className="w-4 h-4 text-[#3D2314]" />
                <span>Explore Gift Hampers</span>
              </Link>
            </div>
            <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-[#EEDDC9]/80 rounded-full blur-xl pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 6. SPECIAL TREATS (Teddy Pops, Bento Cakes, Customised Cakes) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9B2226]">
              <Sparkles className="w-3.5 h-3.5" />
              Signature Collections
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#3D2314]">Special Treats & Bento Cakes</h2>
          </div>
          <Link to="/menu?category=Special%20Treats" className="text-xs font-bold text-[#5C3419] hover:underline">
            View All Specials →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {specialTreats.slice(0, 4).map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onOpenCustomBox={() => setIsBuildBoxOpen(true)}
            />
          ))}
        </div>
      </section>

      {/* 7. ALL PRODUCTS / CURRENT CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif font-bold text-2xl text-[#3D2314]">
              {selectedCategory === 'All' ? 'Our Fresh Bakes Menu' : `${selectedCategory}`}
            </h2>
            <p className="text-xs text-[#7B4B29]">Showing {filteredProducts.length} delicious bakery treats</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onOpenCustomBox={() => setIsBuildBoxOpen(true)}
            />
          ))}
        </div>
      </section>

      {/* 8. CUSTOMER TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFF9F2] rounded-3xl p-8 border border-[#EEDDC9] text-center">
          <span className="text-xs font-bold text-[#D68C98] uppercase tracking-wider block">Customer Love</span>
          <h2 className="font-serif font-bold text-3xl text-[#3D2314] mt-1">What Our Sweet Lovers Say</h2>
          <p className="text-xs text-[#7B4B29] max-w-lg mx-auto mt-1 mb-8">
            Real feedback from happy customers across town enjoying our homemade treats!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-5 rounded-2xl border border-[#EEDDC9] shadow-xs space-y-2">
              <div className="flex text-[#D4A373]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#3D2314] italic">
                "The Red Velvet Cupcake was simply heavenly! Super moist and the cream cheese frosting wasn't overly sweet. Arrived safely packaged."
              </p>
              <div className="pt-2 border-t border-[#F5EBE1] text-xs font-bold text-[#5C3419]">
                — Sneha Rao, Regular Customer
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EEDDC9] shadow-xs space-y-2">
              <div className="flex text-[#D4A373]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#3D2314] italic">
                "Ordered the Custom Treat Box for my wife's birthday. The handwritten message card and satin ribbon added such a personal touch. 10/10!"
              </p>
              <div className="pt-2 border-t border-[#F5EBE1] text-xs font-bold text-[#5C3419]">
                — Rajesh K., Hyderabad
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EEDDC9] shadow-xs space-y-2">
              <div className="flex text-[#D4A373]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#3D2314] italic">
                "Mini Choco Chip with warm chocolate dip is addictive! Vinith was super responsive on WhatsApp when I wanted custom cupcakes."
              </p>
              <div className="pt-2 border-t border-[#F5EBE1] text-xs font-bold text-[#5C3419]">
                — Pooja Sharma, Bakery Lover
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Build Box Modal */}
      <BuildBoxModal
        isOpen={isBuildBoxOpen}
        onClose={() => setIsBuildBoxOpen(false)}
      />
    </div>
  );
}
