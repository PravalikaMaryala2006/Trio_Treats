import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Cake,
  Users,
  CreditCard,
  LogOut,
  Bell,
  ExternalLink,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

export default function AdminLayout() {
  const { admin, adminLogout, isAdminAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAdminAuthenticated, navigate]);

  // Connect to Socket.io for Real-time Admin Notifications
  useEffect(() => {
    const socket = io('/', { transports: ['websocket', 'polling'] });
    socket.emit('joinAdmin');

    socket.on('newOrderAlert', (data) => {
      setNewOrderAlert(data.order);

      // Play soft pleasant sound using AudioContext
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      } catch (e) {}

      // Auto dismiss after 8s
      setTimeout(() => setNewOrderAlert(null), 8000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const navLinks = [
    { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Live Cart Monitor', path: '/admin/live-carts', icon: ShoppingCart, isLive: true },
    { name: 'Order Management', path: '/admin/orders', icon: Package },
    { name: 'Product Management', path: '/admin/products', icon: Cake },
    { name: 'Customer Directory', path: '/admin/customers', icon: Users },
    { name: 'Payments & Revenue', path: '/admin/revenue', icon: CreditCard },
  ];

  if (!isAdminAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col md:flex-row">
      {/* Floating Real-time Order Alert Toast */}
      {newOrderAlert && (
        <div className="fixed top-5 right-5 z-50 bg-[#3D2314] text-white p-4 rounded-2xl shadow-2xl border-2 border-[#FAD2E1] flex items-center gap-3 animate-bounce-subtle max-w-sm">
          <div className="w-10 h-10 rounded-full bg-[#FAD2E1] text-[#3D2314] flex items-center justify-center flex-shrink-0 font-bold">
            🍰
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#FAD2E1] uppercase tracking-wider">🎉 New Bakery Order Received!</p>
            <p className="text-xs font-semibold truncate">#{newOrderAlert.orderId} • ₹{newOrderAlert.totalAmount}</p>
            <p className="text-[11px] text-[#EEDDC9] truncate">{newOrderAlert.customer.name}</p>
          </div>
          <Link
            to="/admin/orders"
            onClick={() => setNewOrderAlert(null)}
            className="text-xs bg-[#FAD2E1] text-[#3D2314] px-2.5 py-1.5 rounded-lg font-bold hover:bg-white"
          >
            View
          </Link>
        </div>
      )}

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#2A170C] text-[#EDE4DC] p-5 justify-between flex-shrink-0 border-r border-[#3D2314]">
        <div className="space-y-6">
          {/* Logo badge */}
          <div className="bg-[#3D2314] p-3 rounded-2xl border border-[#5C3419] flex items-center gap-3">
            <img src="/logo-badge.png" alt="Trio Treats" className="w-10 h-10 rounded-full object-contain bg-[#FFF9F2]" />
            <div>
              <h3 className="font-serif font-bold text-sm text-[#FFF9F2] leading-none">TRIO TREATS</h3>
              <span className="text-[10px] text-[#FAD2E1] font-mono">Owner Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#FAD2E1] text-[#3D2314] shadow-sm font-bold'
                      : 'text-[#C29F87] hover:bg-[#3D2314] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </div>
                  {link.isLive && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="pt-4 border-t border-[#3D2314] space-y-3">
          <div className="px-2">
            <p className="text-[11px] text-[#C29F87]">Signed in as</p>
            <p className="text-xs font-bold text-[#FFF9F2]">{admin?.username || 'Vinith_treats'}</p>
            <p className="text-[10px] text-[#A78A7F]">+91 70758 81265</p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/"
              target="_blank"
              className="flex-1 bg-[#3D2314] hover:bg-[#5C3419] text-[#EDE4DC] py-2 px-3 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              title="Open public website in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Store</span>
            </Link>

            <button
              onClick={() => {
                adminLogout();
                navigate('/admin/login');
              }}
              className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden bg-[#2A170C] text-white p-4 flex items-center justify-between border-b border-[#3D2314]">
        <div className="flex items-center gap-2">
          <img src="/logo-badge.png" alt="Trio Treats" className="w-8 h-8 rounded-full bg-[#FFF9F2]" />
          <span className="font-serif font-bold text-sm">TRIO TREATS ADMIN</span>
        </div>
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-2 text-[#EDE4DC]"
        >
          {isMobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileNavOpen && (
        <div className="md:hidden bg-[#2A170C] p-4 space-y-2 border-b border-[#3D2314]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-[#C29F87] hover:bg-[#3D2314] hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </div>
                {link.isLive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-[#3D2314] flex justify-between text-xs">
            <Link to="/" target="_blank" className="text-[#FAD2E1]">Open Store</Link>
            <button onClick={() => { adminLogout(); navigate('/admin/login'); }} className="text-red-400">
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
