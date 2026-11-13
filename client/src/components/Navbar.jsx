import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  MapPin,
  ShieldCheck,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../utils/api';

export default function Navbar() {
  const { user, isAuthenticated, logout, isAdminAuthenticated } = useAuth();
  const { totalItemCount, total } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Live search debounced
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.products?.slice(0, 5) || []);
      } catch (e) {
        setSearchResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/menu?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navCategories = [
    { name: 'All Treats', path: '/menu' },
    { name: 'Cupcakes', path: '/menu?category=Cupcakes' },
    { name: 'Cookies', path: '/menu?category=Cookies' },
    { name: 'Chocolates', path: '/menu?category=Chocolates' },
    { name: 'Brownies', path: '/menu?category=Brownies' },
    { name: 'Special Treats', path: '/menu?category=Special%20Treats' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#EEDDC9]/60 shadow-sm transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-[#3D2314] via-[#5C3419] to-[#3D2314] text-[#FFF9F2] text-xs py-1.5 px-4 text-center flex items-center justify-between font-medium">
        <div className="hidden md:flex items-center gap-2 text-[#FAD2E1]">
          <Sparkles className="w-3.5 h-3.5 text-[#FAD2E1] animate-pulse" />
          <span>Handcrafted Homemade Bakery & Artisanal Chocolates</span>
        </div>
        <div className="mx-auto md:mx-0 flex items-center gap-1.5">
          <span>🎉 Use code <strong className="text-[#FAD2E1] bg-white/10 px-1.5 py-0.5 rounded font-mono">FIRST30</strong> for ₹30 OFF your first order!</span>
        </div>
        <div className="hidden lg:flex items-center gap-4 text-[11px] text-[#EEDDC9]">
          <Link to="/contact" className="hover:text-white transition-colors">Help & WhatsApp</Link>
          <span className="text-white/30">|</span>
          <Link
            to={isAdminAuthenticated ? "/admin" : "/admin/login"}
            className="flex items-center gap-1 text-[#FAD2E1] hover:text-white transition-colors"
            title="Owner & Kitchen Dashboard"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Tagline */}
          <Logo size="md" showTagline={true} />

          {/* Search Bar (Swiggy / Zomato style) */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#7B4B29] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="What are you craving today? (e.g. Red Velvet, Brownie...)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="w-full bg-[#FFF9F2] border border-[#EEDDC9] text-[#3D2314] text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FAD2E1] focus:border-[#D5B695] transition-all placeholder:text-[#A78A7F]"
                />
              </div>
            </form>

            {/* Dropdown Results */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-warm border border-[#EEDDC9] overflow-hidden z-50">
                <div className="p-2 border-b border-[#F5EBE1] text-xs font-semibold text-[#7B4B29] uppercase tracking-wider">
                  Suggested Treats
                </div>
                {searchResults.map((item) => (
                  <div
                    key={item._id || item.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate(`/product/${item._id || item.id}`);
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-[#FFF9F2] cursor-pointer transition-colors border-b last:border-b-0 border-[#F5EBE1]"
                  >
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#3D2314] truncate">{item.name}</p>
                      <p className="text-xs text-[#7B4B29]">{item.category} • ₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-full hover:bg-[#FFF3E7] text-[#3D2314] transition-colors"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-[#D68C98] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="flex items-center gap-2.5 bg-[#FFF3E7] hover:bg-[#EEDDC9] text-[#3D2314] px-3.5 py-2 rounded-full transition-all border border-[#EEDDC9] shadow-sm group"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-[#3D2314] group-hover:scale-110 transition-transform" />
                {totalItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#3D2314] text-[#FFF9F2] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItemCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold hidden sm:inline">
                {totalItemCount > 0 ? `₹${total}` : 'Cart'}
              </span>
            </Link>

            {/* Customer Account / Auth */}
            {isAuthenticated ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full hover:bg-[#FFF3E7] text-[#3D2314] border border-[#EEDDC9] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#FAD2E1] flex items-center justify-center text-[#3D2314] font-bold text-xs">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-semibold hidden md:inline truncate max-w-[100px]">
                    {user?.fullName?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#7B4B29]" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-warm border border-[#EEDDC9] py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#F5EBE1]">
                      <p className="text-xs text-[#7B4B29]">Signed in as</p>
                      <p className="text-sm font-bold text-[#3D2314] truncate">{user?.fullName}</p>
                      <p className="text-[11px] text-[#A78A7F]">{user?.mobile}</p>
                    </div>

                    <Link
                      to="/my-orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-[#3D2314] hover:bg-[#FFF9F2] transition-colors"
                    >
                      <Package className="w-4 h-4 text-[#7B4B29]" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-[#3D2314] hover:bg-[#FFF9F2] transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-[#7B4B29]" />
                      <span>Saved Addresses & Profile</span>
                    </Link>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-[#F5EBE1]"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="btn-primary text-xs !py-2 !px-4 flex items-center gap-1.5 whitespace-nowrap shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>Log In / Sign Up</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-[#3D2314] hover:bg-[#FFF3E7] rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Secondary Navigation (Category Bar) */}
        <div className="hidden md:flex items-center justify-between border-t border-[#F5EBE1] py-2 text-xs font-medium">
          <nav className="flex items-center gap-6 text-[#5C3419]">
            {navCategories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                className="hover:text-[#3D2314] hover:underline decoration-[#FAD2E1] underline-offset-8 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/menu?category=Special%20Treats"
              className="text-[#9B2226] font-semibold flex items-center gap-1 hover:underline"
            >
              <span>✨ Build Your Own Box</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#EEDDC9] p-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-[#7B4B29] absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="What are you craving today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFF9F2] border border-[#EEDDC9] text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none"
            />
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {navCategories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 bg-[#FFF9F2] rounded-xl text-[#3D2314] font-medium text-center"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-[#F5EBE1] flex justify-between text-xs text-[#7B4B29]">
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Help & Contact</Link>
            <Link to="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="text-[#3D2314] font-bold">
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
