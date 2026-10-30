import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Building2, 
  Sparkles,
  Users,
  KeyRound,
  ArrowLeft,
  MessageSquare,
  Zap,
  Calendar,
  Layers,
  Database,
  Check,
  RefreshCw,
  Phone
} from 'lucide-react';
import { authApi } from '../../services/api';
import { User, UserRole } from '../../types';

interface UserLoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
  onNavigateToAdminLogin: () => void;
  onBackToHome: () => void;
}

export const UserLoginPage: React.FC<UserLoginPageProps> = ({
  onLoginSuccess,
  onNavigateToAdminLogin,
  onBackToHome,
}) => {
  // Mode: Sign In vs Create Account
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  // Step: Credentials input vs 6-digit OTP verification
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');

  // Form Fields
  const [email, setEmail] = useState('dr.prakash@prakashinstitute.edu.in');
  const [password, setPassword] = useState('AutoMask@2026');
  const [fullName, setFullName] = useState('Dr. Prakash Sharma');
  const [workspaceName, setWorkspaceName] = useState('Prakash Institute Kota');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otp, setOtp] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Quick One-Click Demo Role Accounts
  const demoUsers: Array<{
    name: string;
    roleLabel: string;
    role: UserRole;
    email: string;
    icon: string;
    desc: string;
  }> = [
    {
      name: 'Dr. Prakash Sharma',
      roleLabel: 'Workspace Owner',
      role: 'owner',
      email: 'dr.prakash@prakashinstitute.edu.in',
      icon: '👑',
      desc: 'Full institute authority, billing, team & audit logs',
    },
    {
      name: 'Sumit Bhardwaj',
      roleLabel: 'Workspace Admin',
      role: 'admin',
      email: 'sumit@prakashinstitute.edu.in',
      icon: '🛡️',
      desc: 'Automation rules, broadcasts & lead export',
    },
    {
      name: 'Priya Sharma',
      roleLabel: 'Admissions Counselor',
      role: 'agent',
      email: 'priya.s@prakashinstitute.edu.in',
      icon: '👨‍💼',
      desc: 'Shared inbox, student chats & 1-click human takeover',
    },
  ];

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Initialize Google Identity Services (GIS)
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

    const handleCredentialResponse = async (response: any) => {
      if (!response?.credential) return;
      setIsGoogleLoading(true);
      setErrorMessage(null);
      try {
        const res = await authApi.loginWithGoogle({ credential: response.credential });
        if (res?.user && res?.token) {
          onLoginSuccess(res.user, res.token);
        } else {
          throw new Error('Google sign-in did not return a valid session.');
        }
      } catch (err: any) {
        console.error('Google credential login error:', err);
        setErrorMessage(err?.response?.data?.message || err?.message || 'Google sign-in failed');
      } finally {
        setIsGoogleLoading(false);
      }
    };

    const initGis = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id && clientId) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
          });
        } catch (e) {
          console.warn('GIS initialize notice:', e);
        }
      }
    };

    initGis();
    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        initGis();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [onLoginSuccess]);

  const handleSelectDemoUser = (user: typeof demoUsers[0]) => {
    setEmail(user.email);
    setPassword('AutoMask@2026');
    setFullName(user.name);
    setAuthMode('signin');
    setStep('credentials');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Google OAuth Popup / Redirect Handler
  const handleGoogleSignIn = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    setIsGoogleLoading(true);
    setErrorMessage(null);

    const redirectUri = window.location.origin;

    // 1. Prefer Google Identity Services OAuth2 code client (popup)
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2 && clientId) {
      try {
        const client = (window as any).google.accounts.oauth2.initCodeClient({
          client_id: clientId,
          scope: 'openid email profile',
          ux_mode: 'popup',
          callback: async (response: any) => {
            if (response.code) {
              try {
                const res = await authApi.loginWithGoogle({
                  code: response.code,
                  redirectUri: 'postmessage',
                });
                if (res?.user && res?.token) {
                  onLoginSuccess(res.user, res.token);
                } else {
                  throw new Error('Google sign-in did not return a valid session.');
                }
              } catch (err: any) {
                setErrorMessage(err?.response?.data?.message || err?.message || 'Google sign-in failed');
              } finally {
                setIsGoogleLoading(false);
              }
            } else if (response.error) {
              setErrorMessage(`Google sign-in cancelled or failed: ${response.error}`);
              setIsGoogleLoading(false);
            }
          },
          error_callback: (err: any) => {
            console.error('Google popup client error:', err);
            setIsGoogleLoading(false);
          },
        });
        client.requestCode();
        return;
      } catch (err) {
        console.warn('OAuth2 code client failed, falling back:', err);
      }
    }

    // 2. Try GIS Prompt
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id && clientId) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            authApi.getGoogleAuthUrl(redirectUri).then(({ url }) => {
              window.location.href = url;
            }).catch(() => {
              setErrorMessage('Failed to launch Google sign-in window.');
              setIsGoogleLoading(false);
            });
          }
        });
        return;
      } catch (err) {
        console.warn('GIS prompt error:', err);
      }
    }

    // 3. Fallback: redirect directly to Google OAuth URL
    try {
      const { url } = await authApi.getGoogleAuthUrl(redirectUri);
      window.location.href = url;
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google sign-in service unavailable.');
      setIsGoogleLoading(false);
    }
  };

  // Step 1: Submit Credentials & Request 6-Digit OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }
    if (authMode === 'signup') {
      if (!fullName.trim() || !workspaceName.trim()) {
        setErrorMessage('Please provide your full name and institute name.');
        return;
      }
      if (password.length < 8) {
        setErrorMessage('Password must be at least 8 characters long.');
        return;
      }
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await authApi.requestOtp({
        email: email.trim(),
        password: password.trim(),
        action: authMode === 'signup' ? 'signup' : 'login',
        fullName: fullName.trim(),
        workspaceName: workspaceName.trim(),
        phone: phone.trim(),
      });

      if (res?.success) {
        setDemoOtpCode(res.demoOtp || null);
        if (res.demoOtp) {
          setOtp(res.demoOtp); // Auto-fill for convenience
        }
        setSuccessMessage(res.message || `A 6-digit verification code has been sent to ${email.trim()}`);
        setStep('otp');
        setResendCooldown(60);
      } else {
        throw new Error(res?.message || 'Failed to request OTP');
      }
    } catch (err: any) {
      console.error('Request OTP error:', err);
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Authentication error. Please check your details.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify 6-Digit OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.verifyOtp({
        email: email.trim(),
        otp: otp.trim(),
      });

      if (res?.user && res?.token) {
        onLoginSuccess(res.user, res.token);
      } else {
        throw new Error('Verification failed. Invalid response from server.');
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Incorrect verification code. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.resendOtp(email.trim());
      if (res?.success) {
        setDemoOtpCode(res.demoOtp || null);
        if (res.demoOtp) {
          setOtp(res.demoOtp);
        }
        setSuccessMessage(res.message || 'A fresh 6-digit verification code has been sent.');
        setResendCooldown(60);
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-between font-['Inter'] relative overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute top-0 right-1/4 w-[650px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[550px] h-[400px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-5 flex items-center justify-between relative z-10 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-md">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home Overview</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Meta WhatsApp API v21.0 Online</span>
          </div>
          <button
            onClick={onNavigateToAdminLogin}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/50 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            <span>Platform Admin Portal</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* ========================================================= */}
          {/* Left Column: Comprehensive Services & Features Showcase */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
            <div>
              {/* Brand Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-md shadow-emerald-500/20">
                  <div className="w-full h-full bg-[#0a0f1d] rounded-[14px] flex items-center justify-center">
                    <Bot className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white font-['Outfit']">
                    Auto<span className="text-emerald-400">Mask</span>
                  </h1>
                  <p className="text-[11px] text-emerald-400 font-semibold tracking-wide">
                    Enterprise WhatsApp Cloud API & AI SaaS
                  </p>
                </div>
              </div>

              {/* Pitch */}
              <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] leading-tight mb-3">
                Scale Student Admissions on WhatsApp With 24/7 AI Automation
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-6 font-normal">
                Everything coaching institutes, EdTech academies, and schools need to capture student leads, answer syllabus queries with AI, and broadcast updates without ban risks.
              </p>

              {/* Complete Services & Features Showcase */}
              <div className="space-y-3.5 mb-8">
                {/* Feature 1 */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-emerald-500/30 transition-all">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Official Meta Cloud API (v21.0)</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-mono">Zero-Ban</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Direct WhatsApp BSP infrastructure with verified templates, 24-hr service window protection, and green-tick eligibility.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-teal-500/30 transition-all">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>24/7 AI Admission Counselor (Grounded RAG)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Instant accurate answers on courses, fee structures, batch timings, and scholarships in English, Hindi & Hinglish.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-cyan-500/30 transition-all">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Multi-Counselor Shared Team Inbox</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Multiple staff members collaborate on 1 WhatsApp number with conversation assignments, internal notes & 1-click human takeover.
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-indigo-500/30 transition-all">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Broadcast Engine & Automated Lead CRM</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Send bulk announcements, demo class bookings, and fee reminders with Kanban pipeline tracking from New to Enrolled.
                    </p>
                  </div>
                </div>
              </div>

              {/* Platform Metrics Pills */}
              <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-800/80 text-center">
                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-base font-black text-emerald-400 font-['Outfit']">99.98%</div>
                  <div className="text-[10px] text-slate-400 font-medium">Delivery Rate</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-base font-black text-teal-400 font-['Outfit']">&lt; 1.2s</div>
                  <div className="text-[10px] text-slate-400 font-medium">AI Response</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-base font-black text-white font-['Outfit']">100%</div>
                  <div className="text-[10px] text-slate-400 font-medium">Meta Compliant</div>
                </div>
              </div>
            </div>

            {/* Bottom Status Note */}
            <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                PostgreSQL RLS Multi-Tenant Protected
              </span>
              <span className="font-mono text-emerald-400/90">v2.4 Production</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* Right Column: Google 1-Click & Email + Password + OTP Auth */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 p-8 lg:p-10 flex flex-col justify-between">
            <div>
              {/* Auth Mode Toggle Tabs (Sign In vs Sign Up) */}
              <div className="flex items-center p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setStep('credentials');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    authMode === 'signin'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In to Workspace
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setStep('credentials');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    authMode === 'signup'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Free Account
                </button>
              </div>

              {/* Title & Description */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white font-['Outfit']">
                  {step === 'otp' 
                    ? 'Verify 6-Digit OTP Code' 
                    : authMode === 'signin' 
                      ? 'Welcome Back to AutoMask' 
                      : 'Register Your Coaching Institute'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {step === 'otp'
                    ? `Enter the 6-digit verification code sent to ${email}`
                    : authMode === 'signin'
                      ? 'Sign in with your Google account or email and 6-digit verification OTP.'
                      : 'Create your dedicated workspace with full Meta WhatsApp Cloud API access.'}
                </p>
              </div>

              {/* Error & Success Messages */}
              {errorMessage && (
                <div className="mb-5 p-3.5 bg-rose-950/40 border border-rose-800/80 rounded-2xl flex items-center gap-3 text-xs text-rose-300 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="mb-5 p-3.5 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl flex items-center gap-3 text-xs text-emerald-300 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* STEP 1: CREDENTIALS INPUT */}
              {step === 'credentials' && (
                <>
                  {/* Google Authentication Button */}
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading || isLoading}
                      className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-3 border border-slate-200 hover:shadow-lg active:scale-98 disabled:opacity-60 cursor-pointer"
                    >
                      {isGoogleLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                          <span>Connecting with Google...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                          <span>Continue with Google</span>
                        </>
                      )}
                    </button>

                    <div className="relative flex py-4 items-center">
                      <div className="flex-grow border-t border-slate-800"></div>
                      <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                        or with email & verified OTP
                      </span>
                      <div className="flex-grow border-t border-slate-800"></div>
                    </div>
                  </div>

                  {/* 1-Click Fast Credentials for Demo Testing (Sign In only) */}
                  {authMode === 'signin' && (
                    <div className="mb-6">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        ⚡ Quick Demo Team Credentials:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {demoUsers.map((u, idx) => {
                          const isSelected = email === u.email;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectDemoUser(u)}
                              className={`p-2 rounded-xl border text-left transition-all flex flex-col items-start gap-1 ${
                                isSelected 
                                  ? 'bg-emerald-500/10 border-emerald-500 text-white' 
                                  : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 w-full">
                                <span className="text-sm">{u.icon}</span>
                                <span className="text-xs font-bold truncate text-white">{u.name.split(' ')[0]}</span>
                              </div>
                              <span className="text-[9px] text-emerald-400 font-medium truncate w-full">{u.roleLabel}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Credentials Form */}
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    {authMode === 'signup' && (
                      <>
                        {/* Institute / Workspace Name */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Coaching Institute / Organization Name</span>
                          </label>
                          <input
                            type="text"
                            value={workspaceName}
                            onChange={(e) => setWorkspaceName(e.target.value)}
                            required
                            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="e.g. Apex IIT Academy"
                          />
                        </div>

                        {/* Full Name */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>Your Full Name</span>
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="e.g. Rahul Verma"
                          />
                        </div>
                      </>
                    )}

                    {/* Email Field */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>Email Address</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="name@institute.edu.in"
                      />
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Password</span>
                        </label>
                        {authMode === 'signin' && (
                          <span className="text-[11px] text-emerald-400/80 font-mono">Demo: AutoMask@2026</span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder={authMode === 'signup' ? 'Create strong password (min 8 chars)' : 'Enter your password'}
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

                    {authMode === 'signup' && (
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>WhatsApp Business Phone (Optional)</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-3 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Sending 6-Digit Verification Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue & Send 6-Digit OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
              {step === 'otp' && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/60 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Two-Factor Authentication Active</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Code delivered to: <strong className="text-emerald-400 font-mono">{email}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Demo OTP Helper Pill */}
                  {demoOtpCode && (
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-emerald-500/40 flex items-center justify-between text-xs">
                      <span className="text-slate-300">Quick Test OTP:</span>
                      <button
                        type="button"
                        onClick={() => setOtp(demoOtpCode)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-mono font-bold transition-all flex items-center gap-1.5"
                      >
                        <span>{demoOtpCode}</span>
                        <span className="text-[10px] text-emerald-300 font-sans font-normal">(Click to Fill)</span>
                      </button>
                    </div>
                  )}

                  {/* OTP Form */}
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">
                        Enter 6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        required
                        autoFocus
                        placeholder="• • • • • •"
                        className="w-full text-center tracking-[1em] font-mono text-xl py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otp.length < 6}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Verifying OTP & Authorizing Session...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify OTP & Launch Dashboard</span>
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Resend & Back controls */}
                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('credentials')}
                      className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change details</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isLoading}
                      className={`flex items-center gap-1 font-semibold ${
                        resendCooldown > 0 
                          ? 'text-slate-500 cursor-not-allowed' 
                          : 'text-emerald-400 hover:underline cursor-pointer'
                      }`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Security Assurance */}
            <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>256-bit SSL Encrypted • Single Sign-On</span>
              <span>AutoMask Security Guard</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-slate-500 relative z-10 border-t border-slate-900 bg-slate-950/60">
        AutoMask Enterprise WhatsApp Business Automation • Multi-Tenant Protected • All Rights Reserved
      </footer>
    </div>
  );
};
