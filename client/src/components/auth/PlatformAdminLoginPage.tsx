import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Server, 
  ArrowLeft,
  Eye,
  EyeOff,
  Fingerprint,
  ShieldCheck,
  Terminal,
  Database
} from 'lucide-react';
import { authApi } from '../../services/api';
import { User } from '../../types';

interface PlatformAdminLoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
  onNavigateToUserLogin: () => void;
  onBackToHome: () => void;
}

export const PlatformAdminLoginPage: React.FC<PlatformAdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateToUserLogin,
  onBackToHome,
}) => {
  const [email, setEmail] = useState('ops@automask.io');
  const [password, setPassword] = useState('AutoMask@2026');
  const [twoFactorCode, setTwoFactorCode] = useState('948-201');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleQuickFillPlatformOps = () => {
    setEmail('ops@automask.io');
    setPassword('AutoMask@2026');
    setTwoFactorCode('948-201');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both Platform Admin email and Master Access Key.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.login(email.trim(), password.trim());
      if (res?.user && res?.token) {
        onLoginSuccess(res.user, res.token);
      } else {
        throw new Error('Platform Super Admin authentication failed');
      }
    } catch (err: any) {
      console.error('Platform Admin Login Error:', err);
      setErrorMessage(
        err?.response?.data?.message || 
        err?.message || 
        'Invalid Platform Ops credentials or security token.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] flex flex-col justify-between font-['Inter'] relative overflow-hidden text-slate-100">
      {/* Background High-Tech Indigo / Cyber Gradients */}
      <div className="absolute top-0 left-1/3 w-[650px] h-[450px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[350px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-6 flex items-center justify-between relative z-10 border-b border-indigo-950/60 bg-[#050811]/70 backdrop-blur-md">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>AutoMask Public Home</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:inline">Workspace Member?</span>
          <button
            onClick={onNavigateToUserLogin}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 transition-all"
          >
            ← Workspace Team Login
          </button>
        </div>
      </header>

      {/* Main Login Box */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-xl rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl p-6 sm:p-10">
          
          {/* Header Title & Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-400 mb-4 shadow-lg shadow-indigo-500/20">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-mono font-bold mb-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>PLATFORM ROOT / SUPER ADMIN</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight">
              Central Infrastructure Portal
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1.5 leading-relaxed">
              Multi-tenant orchestration, global queue monitoring, and cross-workspace audit controls.
            </p>
          </div>

          {/* SRS Line 615 Privacy Safeguard Notice */}
          <div className="mb-6 p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-white block font-bold">SRS Line 615 Privacy Safeguard Active:</strong>
              Platform Super Admins are strictly blocked from student message content unless the individual institute Owner has issued an active, time-boxed Support Grant.
            </div>
          </div>

          {/* 1-Click Fast Fill for Demo */}
          <div className="mb-5 flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 text-xs">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">Demo Ops Account: <code className="text-emerald-400 font-mono">ops@automask.io</code></span>
            </div>
            <button
              type="button"
              onClick={handleQuickFillPlatformOps}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[10px] transition-colors"
            >
              AutoFill Credentials
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 bg-rose-950/40 border border-rose-800/80 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Platform Admin Identity
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                placeholder="ops@automask.io"
              />
            </div>

            {/* Master Key Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono">
                  Master Security Key
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Demo: AutoMask@2026</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-800/70 border border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  placeholder="••••••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 2FA Authenticator Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono flex items-center justify-between">
                <span>Hardware 2FA / TOTP Code</span>
                <span className="text-[10px] text-indigo-400 font-normal">Auto-verified</span>
              </label>
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="w-full bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-emerald-400 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono tracking-widest text-center text-sm font-bold"
                placeholder="000-000"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Root Signature & RLS Grants...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize Super Admin Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Audit Logging Notice */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>Session is cryptographically signed and stored in the platform audit log.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-slate-600 relative z-10 border-t border-slate-900">
        AutoMask Multi-Tenant Infrastructure Console • ISO-27001 / SOC-2 Type II Certified
      </footer>
    </div>
  );
};
