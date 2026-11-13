import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [username, setUsername] = useState('Vinith_treats');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await adminLogin({ username, password });
      navigate('/admin');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2A170C] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FFFDF9] rounded-3xl border border-[#EEDDC9] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#3D2314] p-8 text-center text-white space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#FFF9F2] p-1 mx-auto shadow-md">
            <img src="/logo-badge.png" alt="Trio Treats" className="w-full h-full object-contain rounded-full" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#FAD2E1] flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Owner & Kitchen Portal
            </span>
            <h2 className="font-serif font-bold text-2xl text-[#FFF9F2] mt-1">TRIO TREATS ADMIN</h2>
            <p className="text-xs text-[#EEDDC9]">Protected control center for Vinith</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                Admin Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Vinith_treats"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl pl-9 pr-3.5 py-3 text-[#3D2314] font-semibold focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                />
                <User className="w-4 h-4 text-[#7B4B29] absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl pl-9 pr-3.5 py-3 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                />
                <Lock className="w-4 h-4 text-[#7B4B29] absolute left-3 top-3.5" />
              </div>
              <p className="text-[10px] text-[#A78A7F] mt-1">
                Default initial password set during setup: <code className="bg-[#FFF3E7] px-1 py-0.5 rounded text-[#3D2314]">Vinith@TrioTreats2026</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-xs !py-3.5 flex items-center justify-center gap-2 shadow-md mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Access Admin Dashboard'}</span>
              <ArrowRight className="w-4 h-4 text-[#FAD2E1]" />
            </button>
          </form>

          <div className="pt-4 border-t border-[#F5EBE1] text-center">
            <Link to="/" className="text-xs text-[#7B4B29] hover:underline font-semibold">
              ← Return to Trio Treats Customer Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
