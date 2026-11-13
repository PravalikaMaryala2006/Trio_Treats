import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight, CheckCircle2, ChevronLeft, KeyRound } from 'lucide-react';
import { api } from '../utils/api';
import Logo from '../components/Logo';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: enter identifier, 2: enter otp & new pass
  const [identifier, setIdentifier] = useState('');
  const [userId, setUserId] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { identifier });
      setUserId(res.userId);
      setDemoOtp(res.demoOtp);
      setMessage(res.message);
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'No registered account found');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        userId,
        newPassword,
        otp: otpInput
      });
      alert('Password reset successful! You can now log in.');
      navigate('/auth?mode=login');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#EEDDC9] shadow-warm p-8 space-y-6">
        <Link to="/auth" className="inline-flex items-center gap-1 text-xs font-bold text-[#7B4B29] hover:text-[#3D2314]">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#FFF3E7] text-[#3D2314] flex items-center justify-center mx-auto border border-[#EEDDC9]">
            <KeyRound className="w-6 h-6 text-[#D68C98]" />
          </div>
          <h2 className="font-serif font-bold text-2xl text-[#3D2314]">Reset Password</h2>
          <p className="text-xs text-[#7B4B29]">
            Enter your mobile number or email address to verify your account
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl">
            {errorMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                Registered Mobile or Email
              </label>
              <input
                type="text"
                required
                placeholder="Enter 10-digit mobile or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl px-3.5 py-3 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-xs !py-3 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Verifying Account...' : 'Send Verification Code'}</span>
              <ArrowRight className="w-4 h-4 text-[#FAD2E1]" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
              <p>{message}</p>
              {demoOtp && (
                <p className="font-bold mt-1">Verification Code: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300">{demoOtp}</span></p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                Verification Code (OTP)
              </label>
              <input
                type="text"
                required
                placeholder="Enter 4-digit code"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl px-3.5 py-2.5 text-[#3D2314] font-mono tracking-widest text-center focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#7B4B29] block mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Enter new strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs bg-[#FFF9F2] border border-[#EEDDC9] rounded-xl px-3.5 py-2.5 text-[#3D2314] focus:outline-none focus:ring-1 focus:ring-[#3D2314]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-xs !py-3 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Updating Password...' : 'Save New Password & Login'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
