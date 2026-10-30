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
  Check,
  RefreshCw,
  Phone,
  Layers,
  ChevronRight,
  TrendingUp,
  ShoppingBag
} from 'lucide-react';
import { authApi } from '../../services/api';
import { User } from '../../types';
import { IndustryType, INDUSTRIES, getIndustryConfig } from '../../config/industries';

interface UserLoginPageProps {
  onLoginSuccess: (user: User, token: string, workspace?: any) => void;
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

  // Selected agency vertical for features showcase & registration
  const [activeIndustry, setActiveIndustry] = useState<IndustryType>('education');
  const [signupCategory, setSignupCategory] = useState<IndustryType>('education');

  // Form Fields
  const [email, setEmail] = useState('dr.prakash@prakashinstitute.edu.in');
  const [password, setPassword] = useState('AutoMask@2026');
  const [fullName, setFullName] = useState('Dr. Prakash Sharma');
  const [workspaceName, setWorkspaceName] = useState('Prakash Institute Kota');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otp, setOtp] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // 6 Vertical Demo Accounts
  const agencyDemoAccounts: Array<{
    industry: IndustryType;
    name: string;
    roleLabel: string;
    workspaceName: string;
    email: string;
    icon: string;
    shortTitle: string;
    desc: string;
  }> = [
    {
      industry: 'ecommerce',
      name: 'Neha Gupta',
      roleLabel: 'Growth Head',
      workspaceName: 'GlowAura Beauty D2C',
      email: 'neha@glowaura.in',
      icon: '🛍️',
      shortTitle: 'D2C E-Com',
      desc: 'Shopify recovery & COD bot',
    },
    {
      industry: 'real_estate',
      name: 'Vikram Oberoi',
      roleLabel: 'Managing Broker',
      workspaceName: 'UrbanNest Luxury Realty',
      email: 'vikram@urbannest.com',
      icon: '🏢',
      shortTitle: 'Real Estate',
      desc: 'Brochures & site visits',
    },
    {
      industry: 'healthcare',
      name: 'Dr. Ananya Roy',
      roleLabel: 'Medical Director',
      workspaceName: 'ApexCare Clinic',
      email: 'ananya@apexcare.health',
      icon: '🏥',
      shortTitle: 'Healthcare',
      desc: 'OPD appointments & lab tests',
    },
    {
      industry: 'education',
      name: 'Dr. Prakash Sharma',
      roleLabel: 'Founder & Director',
      workspaceName: 'Prakash Institute Kota',
      email: 'dr.prakash@prakashinstitute.edu.in',
      icon: '🎓',
      shortTitle: 'Education',
      desc: 'Admissions & 24/7 syllabus bot',
    },
    {
      industry: 'services',
      name: 'Karan Singhania',
      roleLabel: 'Senior Partner',
      workspaceName: 'Stratagem Global Advisory',
      email: 'karan@stratagem.co',
      icon: '⚖️',
      shortTitle: 'Legal & CA',
      desc: 'KYC collection & retainers',
    },
    {
      industry: 'saas',
      name: 'Arjun Malhotra',
      roleLabel: 'Head of Growth',
      workspaceName: 'ScaleOps Growth Agency',
      email: 'arjun@scaleops.io',
      icon: '🚀',
      shortTitle: 'SaaS Agency',
      desc: 'AI SDR & product demo calls',
    },
  ];

  const currentIndustryConfig = INDUSTRIES[activeIndustry] || INDUSTRIES.education;

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
          onLoginSuccess(res.user, res.token, res.workspace);
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

  const handleSelectDemoUser = (account: typeof agencyDemoAccounts[0]) => {
    setEmail(account.email);
    setPassword('AutoMask@2026');
    setFullName(account.name);
    setWorkspaceName(account.workspaceName);
    setActiveIndustry(account.industry);
    setSignupCategory(account.industry);
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
                  onLoginSuccess(res.user, res.token, res.workspace);
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
        setErrorMessage('Please provide your full name and company/organization name.');
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
        category: authMode === 'signup' ? signupCategory : activeIndustry,
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
        onLoginSuccess(res.user, res.token, res.workspace);
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
      <header className="px-6 py-4 flex items-center justify-between relative z-10 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-md">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
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
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/50 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            <span>Platform Admin Portal</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* ========================================================= */}
          {/* Left Column: Interactive Multi-Agency Vertical Showcase   */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 p-6 lg:p-9 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
            <div>
              {/* Brand Header */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-md shadow-emerald-500/20">
                    <div className="w-full h-full bg-[#0a0f1d] rounded-[14px] flex items-center justify-center">
                      <Bot className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-white font-['Outfit']">
                      Auto<span className="text-emerald-400">Mask</span>
                    </h1>
                    <p className="text-[10px] text-emerald-400 font-semibold tracking-wide">
                      Enterprise WhatsApp Cloud API & AI SaaS
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {currentIndustryConfig.icon} {currentIndustryConfig.shortLabel}
                </span>
              </div>

              {/* 6-Tab Interactive Industry Selector */}
              <div className="mb-5 p-2 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5 px-1">
                  <Layers className="w-3 h-3 text-emerald-400" />
                  <span>Choose Agency Vertical To Explore Features:</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {(Object.keys(INDUSTRIES) as IndustryType[]).map((indKey) => {
                    const ind = INDUSTRIES[indKey];
                    const isSelected = activeIndustry === indKey;
                    return (
                      <button
                        key={indKey}
                        type="button"
                        onClick={() => {
                          setActiveIndustry(indKey);
                          if (authMode === 'signup') {
                            setSignupCategory(indKey);
                          }
                        }}
                        className={`p-1.5 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 border cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                            : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-slate-800'
                        }`}
                        title={ind.name}
                      >
                        <span className="text-sm">{ind.icon}</span>
                        <span className="truncate max-w-full text-[10px]">{ind.shortLabel.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pitch Headline & Subheadline */}
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] leading-tight mb-2">
                {currentIndustryConfig.heroHeadline}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-5 font-normal">
                {currentIndustryConfig.heroSubheadline}
              </p>

              {/* Dynamic 4 Features for Selected Industry */}
              <div className="space-y-2.5 mb-6">
                {/* Feature 1: Official BSP Engine */}
                <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-emerald-500/30 transition-all">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Official Meta Cloud API (v21.0)</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-mono">Zero-Ban</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Verified templates, 24-hr service window protection, and green-tick eligibility for {currentIndustryConfig.name}.
                    </p>
                  </div>
                </div>

                {/* Feature 2: Dedicated AI Bot Persona */}
                <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-teal-500/30 transition-all">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>24/7 AI: {currentIndustryConfig.botRole}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {currentIndustryConfig.botDescription}
                    </p>
                  </div>
                </div>

                {/* Feature 3 & 4: Specific industry automation workflows */}
                {currentIndustryConfig.features.slice(0, 2).map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-indigo-500/30 transition-all">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{feat.title}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-500/20 text-indigo-400 font-mono">{feat.badge}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sample WhatsApp Customer Triggers */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 mb-5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-teal-400" />
                  <span>Sample {currentIndustryConfig.customerTerm} Inbound Queries Handled Instantly:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentIndustryConfig.quickPrompts.slice(0, 3).map((prompt, pIdx) => (
                    <span
                      key={pIdx}
                      className="px-2.5 py-1 rounded-lg text-[10px] bg-slate-800/70 border border-slate-700/60 text-slate-300"
                    >
                      💬 "{prompt}"
                    </span>
                  ))}
                </div>
              </div>

              {/* Platform Metrics Pills */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-sm font-black text-emerald-400 font-['Outfit']">99.98%</div>
                  <div className="text-[9px] text-slate-400 font-medium">Delivery Rate</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-sm font-black text-teal-400 font-['Outfit']">&lt; 1.2s</div>
                  <div className="text-[9px] text-slate-400 font-medium">AI Latency</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-sm font-black text-white font-['Outfit']">100%</div>
                  <div className="text-[9px] text-slate-400 font-medium">Meta Verified</div>
                </div>
              </div>
            </div>

            {/* Bottom Status Note */}
            <div className="mt-6 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Multi-Tenant PostgreSQL Architecture
              </span>
              <span className="font-mono text-emerald-400/90">v2.4 Production</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* Right Column: Google 1-Click & Email + Password + OTP Auth */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 p-6 lg:p-9 flex flex-col justify-between">
            <div>
              {/* Auth Mode Toggle Tabs (Sign In vs Sign Up) */}
              <div className="flex items-center p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setStep('credentials');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Free Account
                </button>
              </div>

              {/* Title & Description */}
              <div className="mb-5">
                <h3 className="text-xl font-bold text-white font-['Outfit']">
                  {step === 'otp' 
                    ? 'Verify 6-Digit OTP Code' 
                    : authMode === 'signin' 
                      ? 'Welcome Back to AutoMask' 
                      : `Register Your ${currentIndustryConfig.shortLabel} Workspace`}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {step === 'otp'
                    ? `Enter the 6-digit verification code sent to ${email}`
                    : authMode === 'signin'
                      ? 'Sign in with Google or select your agency demo account with 6-digit OTP.'
                      : `Configure your ${currentIndustryConfig.name} workspace with full Meta WhatsApp Cloud API access.`}
                </p>
              </div>

              {/* Error & Success Messages */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/80 rounded-2xl flex items-center gap-3 text-xs text-rose-300 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl flex items-center gap-3 text-xs text-emerald-300 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* STEP 1: CREDENTIALS INPUT */}
              {step === 'credentials' && (
                <>
                  {/* Google Authentication Button */}
                  <div className="mb-5">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading || isLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-3 border border-slate-200 hover:shadow-lg active:scale-98 disabled:opacity-60 cursor-pointer"
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

                    <div className="relative flex py-3 items-center">
                      <div className="flex-grow border-t border-slate-800"></div>
                      <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                        or with agency credentials & verified OTP
                      </span>
                      <div className="flex-grow border-t border-slate-800"></div>
                    </div>
                  </div>

                  {/* 1-Click Fast Credentials for 6 Agency Verticals (Sign In only) */}
                  {authMode === 'signin' && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span>⚡ 1-Click Agency Demo Logins:</span>
                        </label>
                        <span className="text-[10px] text-emerald-400 font-mono">Password: AutoMask@2026</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {agencyDemoAccounts.map((account, idx) => {
                          const isSelected = email === account.email;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectDemoUser(account)}
                              className={`p-2 rounded-xl border text-left transition-all flex flex-col items-start gap-0.5 cursor-pointer ${
                                isSelected 
                                  ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-sm shadow-emerald-500/20' 
                                  : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 w-full">
                                <span className="text-sm">{account.icon}</span>
                                <span className="text-xs font-bold truncate text-white">{account.shortTitle}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 truncate w-full">{account.name}</span>
                              <span className="text-[9px] text-emerald-400 font-mono truncate w-full">{account.workspaceName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Credentials Form */}
                  <form onSubmit={handleRequestOtp} className="space-y-3.5">
                    {authMode === 'signup' && (
                      <>
                        {/* Select Business Vertical */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Select Your Business / Agency Vertical</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2">
                            {(Object.keys(INDUSTRIES) as IndustryType[]).map((indKey) => {
                              const ind = INDUSTRIES[indKey];
                              const isSelected = signupCategory === indKey;
                              return (
                                <button
                                  key={indKey}
                                  type="button"
                                  onClick={() => {
                                    setSignupCategory(indKey);
                                    setActiveIndustry(indKey);
                                  }}
                                  className={`p-2 rounded-xl text-left border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm'
                                      : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/60 text-slate-400'
                                  }`}
                                >
                                  <span>{ind.icon}</span>
                                  <span className="truncate">{ind.shortLabel}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Organization / Workspace Name */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Company / Organization Name</span>
                          </label>
                          <input
                            type="text"
                            value={workspaceName}
                            onChange={(e) => setWorkspaceName(e.target.value)}
                            required
                            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder={`e.g. ${currentIndustryConfig.demoAccount.workspaceName}`}
                          />
                        </div>

                        {/* Full Name */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>Your Full Name</span>
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="e.g. Rahul Verma"
                          />
                        </div>
                      </>
                    )}

                    {/* Email Field */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>Work Email Address</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="name@company.com"
                      />
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
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
                          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder={authMode === 'signup' ? 'Create strong password (min 8 chars)' : 'Enter your password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {authMode === 'signup' && (
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>WhatsApp Business Phone (Optional)</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60 cursor-pointer"
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

              {/* STEP 2: 6-DIGIT OTP CODE VERIFICATION */}
              {step === 'otp' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/60 flex items-start gap-3">
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
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-emerald-500/40 flex items-center justify-between text-xs">
                      <span className="text-slate-300">Quick Test OTP:</span>
                      <button
                        type="button"
                        onClick={() => setOtp(demoOtpCode)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{demoOtpCode}</span>
                        <span className="text-[10px] text-emerald-300 font-sans font-normal">(Click to Fill)</span>
                      </button>
                    </div>
                  )}

                  {/* OTP Form */}
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
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
                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setStep('credentials')}
                      className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
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
            <div className="mt-6 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>256-bit SSL Encrypted • Single Sign-On</span>
              <span>AutoMask Security Guard</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 text-center text-xs text-slate-500 relative z-10 border-t border-slate-900 bg-slate-950/60">
        AutoMask Enterprise WhatsApp Business Automation • Multi-Tenant Protected • All Rights Reserved
      </footer>
    </div>
  );
};
