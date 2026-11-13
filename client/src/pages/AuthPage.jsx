import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: ''
  });

  // Register form state
  const [regData, setRegData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(loginData);
      navigate(redirect);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (regData.password !== regData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (regData.mobile.replace(/\D/g, '').length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      await register(regData);
      navigate(redirect);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#EEDDC9] shadow-warm overflow-hidden">
        {/* Header Branding */}
        <div className="bg-gradient-to-b from-[#FFF5EA] to-[#FFFDF9] p-8 text-center border-b border-[#F5EBE1] space-y-3">
          <div className="flex justify-center">
            <Logo size="lg" showTagline={true} />
          </div>
          <p className="text-xs text-[#7B4B29] max-w-xs mx-auto">
            Sign in to order freshly baked homemade treats, track your orders & unlock exclusive sweet coupons!
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#FFF3E7] p-1 rounded-full border border-[#EEDDC9] mt-4">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                mode === 'login'
                  ? 'bg-[#3D2314] text-white shadow-xs'
                  : 'text-[#7B4B29] hover:text-[#3D2314]'
              }`}
            >
              Customer Log In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                mode === 'register'
                  ? 'bg-[#3D2314] text-white shadow-xs'
                  : 'text-[#7B4B29] hover:text-[#3D2314]'
              }`}
            >
              New Registration
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                  Mobile Number or Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter registered mobile or email"
                    value={loginData.identifier}
                    onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                    className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl pl-9 pr-3.5 py-3 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                  />
                  <Phone className="w-4 h-4 text-[#7B4B29] absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29]">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-[#D68C98] hover:underline font-semibold"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl pl-9 pr-10 py-3 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                  />
                  <Lock className="w-4 h-4 text-[#7B4B29] absolute left-3 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-xs !py-3.5 flex items-center justify-center gap-2 shadow-md mt-2"
              >
                <span>{loading ? 'Logging In...' : 'Log In & Order'}</span>
                <ArrowRight className="w-4 h-4 text-[#FAD2E1]" />
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-[#7B4B29]">First time at Trio Treats? </span>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-xs font-bold text-[#3D2314] hover:underline"
                >
                  Create an Account
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTRATION FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={regData.fullName}
                    onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                    className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl pl-9 pr-3.5 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                  />
                  <User className="w-4 h-4 text-[#7B4B29] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                  Mobile Number (Used for Login & FIRST30 Coupon) *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={regData.mobile}
                    onChange={(e) => setRegData({ ...regData, mobile: e.target.value.replace(/\D/g, '') })}
                    className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl pl-9 pr-3.5 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                  />
                  <Phone className="w-4 h-4 text-[#7B4B29] absolute left-3 top-3 pointer-events-none" />
                </div>
                <span className="text-[10px] text-[#A78A7F] mt-0.5 block">
                  Must be unique. Verified for one-time FIRST30 discount.
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl pl-9 pr-3.5 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                  />
                  <Mail className="w-4 h-4 text-[#7B4B29] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl pl-9 pr-3.5 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                  />
                  <Lock className="w-4 h-4 text-[#7B4B29] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={regData.confirmPassword}
                    onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                    className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl pl-9 pr-3.5 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
                  />
                  <Lock className="w-4 h-4 text-[#7B4B29] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-xs !py-3.5 flex items-center justify-center gap-2 shadow-md mt-2"
              >
                <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
                <Sparkles className="w-4 h-4 text-[#FAD2E1]" />
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-[#7B4B29]">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-bold text-[#3D2314] hover:underline"
                >
                  Log In Here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
