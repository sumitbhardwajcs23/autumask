import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Check, 
  Zap, 
  Users, 
  BarChart2, 
  ShieldCheck, 
  MessageSquare,
  ArrowLeft,
  KeyRound,
  Phone
} from 'lucide-react';
import { authApi } from '../../services/api';
import { User } from '../../types';
import { IndustryType } from '../../config/industries';

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
  // Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  // Step: 'credentials' | 'otp'
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');

  // Form Fields
  const [email, setEmail] = useState('dr.prakash@prakashinstitute.edu.in');
  const [password, setPassword] = useState('AutoMask@2026');
  const [fullName, setFullName] = useState('Dr. Prakash Sharma');
  const [workspaceName, setWorkspaceName] = useState('Prakash Institute Kota');
  const [category, setCategory] = useState<IndustryType>('education');
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

  // 6 Quick Demo Logins
  const demoAccounts: Array<{
    industry: IndustryType;
    name: string;
    workspaceName: string;
    email: string;
    icon: string;
    label: string;
  }> = [
    {
      industry: 'education',
      name: 'Dr. Prakash Sharma',
      workspaceName: 'Prakash Institute Kota',
      email: 'dr.prakash@prakashinstitute.edu.in',
      icon: '🎓',
      label: 'Education',
    },
    {
      industry: 'ecommerce',
      name: 'Neha Gupta',
      workspaceName: 'GlowAura Beauty D2C',
      email: 'neha@glowaura.in',
      icon: '🛍️',
      label: 'D2C E-Com',
    },
    {
      industry: 'real_estate',
      name: 'Vikram Oberoi',
      workspaceName: 'UrbanNest Luxury Realty',
      email: 'vikram@urbannest.com',
      icon: '🏢',
      label: 'Real Estate',
    },
    {
      industry: 'healthcare',
      name: 'Dr. Ananya Roy',
      workspaceName: 'ApexCare Clinic',
      email: 'ananya@apexcare.health',
      icon: '🏥',
      label: 'Healthcare',
    },
    {
      industry: 'services',
      name: 'Karan Singhania',
      workspaceName: 'Stratagem Advisory',
      email: 'karan@stratagem.co',
      icon: '⚙️',
      label: 'Services',
    },
    {
      industry: 'saas',
      name: 'Arjun Malhotra',
      workspaceName: 'ScaleOps Agency',
      email: 'arjun@scaleops.io',
      icon: '🚀',
      label: 'SaaS',
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

  // Google Identity Services (GIS)
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
          console.warn('GIS notice:', e);
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

  const handleSelectDemoUser = (account: typeof demoAccounts[0]) => {
    setEmail(account.email);
    setPassword('AutoMask@2026');
    setFullName(account.name);
    setWorkspaceName(account.workspaceName);
    setCategory(account.industry);
    setAuthMode('signin');
    setStep('credentials');
    setErrorMessage(null);
    setSuccessMessage(`Selected demo: ${account.label} (${account.email})`);
  };

  // Google OAuth Popup / Redirect
  const handleGoogleSignIn = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    setIsGoogleLoading(true);
    setErrorMessage(null);

    const redirectUri = window.location.origin;

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
          error_callback: () => setIsGoogleLoading(false),
        });
        client.requestCode();
        return;
      } catch (err) {
        console.warn('OAuth2 popup fallback:', err);
      }
    }

    try {
      const { url } = await authApi.getGoogleAuthUrl(redirectUri);
      window.location.href = url;
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google OAuth domain mismatch. Please sign in with email + password (or Quick Demo logins).');
      setIsGoogleLoading(false);
    }
  };

  // Step 1: Submit Credentials & Request 6-Digit OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }
    if (authMode === 'signup') {
      if (!fullName.trim() || !workspaceName.trim()) {
        setErrorMessage('Please enter your name and workspace name.');
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
        category,
      });

      if (res?.success) {
        setDemoOtpCode(res.demoOtp || null);
        if (res.demoOtp) {
          setOtp(res.demoOtp);
        }
        setSuccessMessage(res.message || `We sent a 6-digit verification code to ${email.trim()}`);
        setStep('otp');
        setResendCooldown(60);
      } else {
        throw new Error(res?.message || 'Failed to send OTP');
      }
    } catch (err: any) {
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
        throw new Error('Verification failed. Invalid session response.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Incorrect verification code. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
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
        setSuccessMessage('A fresh 6-digit verification code has been sent.');
        setResendCooldown(60);
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col lg:flex-row text-slate-800 font-['Inter'] selection:bg-emerald-500 selection:text-white">
      
      {/* =========================================================================
          LEFT COLUMN: Product Showcase & High-Fidelity Dashboard Mockup (Full Viewport)
          ========================================================================= */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 bg-white border-r border-slate-200/80 p-8 xl:p-12 2xl:p-16 flex-col justify-between overflow-y-auto">
        
        {/* Top Logo */}
        <div 
          onClick={onBackToHome}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <MessageSquare className="w-6 h-6 fill-white/20" />
          </div>
          <span className="font-black text-2xl xl:text-3xl text-slate-900 tracking-tight font-['Outfit']">
            Auto<span className="text-emerald-700">Mask</span>
          </span>
        </div>

        {/* Center Pitch & Mockup */}
        <div className="my-auto py-6 max-w-3xl space-y-7">
          
          {/* Main Headline */}
          <div className="space-y-3.5">
            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] font-['Outfit']">
              Automate Your <br />
              <span className="text-emerald-700">WhatsApp Conversations</span> <br />
              and Grow Faster
            </h1>
            <p className="text-base xl:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl">
              Reply to enquiries and messages automatically, manage multiple staff accounts, and save hours with smart AI automation.
            </p>
          </div>

          {/* 4 Feature Badges in a Row */}
          <div className="grid grid-cols-4 gap-4 py-2 max-w-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 border border-emerald-100/80 shadow-xs flex items-center justify-center text-emerald-700">
                <Zap className="w-7 h-7 fill-emerald-600/20" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 mt-2.5 leading-snug">
                Smart<br />Auto Replies
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 border border-emerald-100/80 shadow-xs flex items-center justify-center text-emerald-700">
                <Users className="w-7 h-7 fill-emerald-600/20" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 mt-2.5 leading-snug">
                Multiple<br />Accounts
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 border border-emerald-100/80 shadow-xs flex items-center justify-center text-emerald-700">
                <BarChart2 className="w-7 h-7" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 mt-2.5 leading-snug">
                Analytics &<br />Insights
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 border border-emerald-100/80 shadow-xs flex items-center justify-center text-emerald-700">
                <ShieldCheck className="w-7 h-7 fill-emerald-600/20" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 mt-2.5 leading-snug">
                Secure<br />& Reliable
              </span>
            </div>
          </div>

          {/* High-Fidelity Product Dashboard Mockup Card */}
          <div className="w-full max-w-2xl xl:max-w-3xl 2xl:max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex select-none pointer-events-none transition-all duration-300">
            {/* Mock Dark Navy Sidebar */}
            <div className="w-44 bg-[#0b131e] text-slate-400 p-4 flex flex-col justify-between shrink-0 border-r border-[#152332]">
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1 py-0.5">
                  <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-white">
                    <MessageSquare className="w-3 h-3 fill-white" />
                  </div>
                  <span className="font-black text-sm text-white font-['Outfit']">AutoMask</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="bg-emerald-600 text-white font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-2 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    <span>Dashboard</span>
                  </div>
                  <div className="px-2.5 py-1.5 text-slate-400 flex items-center gap-2 font-medium">
                    <span>💬</span>
                    <span>Inbox</span>
                  </div>
                  <div className="px-2.5 py-1.5 text-slate-400 flex items-center gap-2 font-medium">
                    <span>⚡</span>
                    <span>Automation</span>
                  </div>
                  <div className="px-2.5 py-1.5 text-slate-400 flex items-center gap-2 font-medium">
                    <span>👥</span>
                    <span>Accounts</span>
                  </div>
                  <div className="px-2.5 py-1.5 text-slate-400 flex items-center gap-2 font-medium">
                    <span>📊</span>
                    <span>Analytics</span>
                  </div>
                  <div className="px-2.5 py-1.5 text-slate-400 flex items-center gap-2 font-medium">
                    <span>📋</span>
                    <span>Templates</span>
                  </div>
                  <div className="px-2.5 py-1.5 text-slate-400 flex items-center gap-2 font-medium">
                    <span>⚙️</span>
                    <span>Settings</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Gateway
                </span>
              </div>
            </div>

            {/* Mock Dashboard Body */}
            <div className="flex-1 bg-white p-5 space-y-4 min-w-0">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <span className="text-sm font-extrabold text-slate-800 font-['Outfit']">Dashboard Overview</span>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-xs text-slate-700 font-medium">
                  <div className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center">
                    S
                  </div>
                  <span>Sumit</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-xs text-slate-400 block font-semibold">Total Replies</span>
                  <div className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] mt-1">12,543</div>
                  <span className="text-xs text-emerald-600 font-bold">↗ +12%</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-xs text-slate-400 block font-semibold">Active Accounts</span>
                  <div className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] mt-1">3</div>
                  <span className="text-xs text-emerald-600 font-bold">+1</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-xs text-slate-400 block font-semibold">New Enquiries</span>
                  <div className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] mt-1">842</div>
                  <span className="text-xs text-emerald-600 font-bold">↗ +18%</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-xs text-slate-400 block font-semibold">Response Rate</span>
                  <div className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] mt-1">98%</div>
                  <span className="text-xs text-emerald-600 font-bold">↗ +5%</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Reply Activity</span>
                  <span className="text-slate-400 font-semibold">Last 30 days ▾</span>
                </div>
                <div className="h-16 flex items-end justify-between gap-1 pt-1">
                  {[28, 45, 60, 35, 75, 50, 65, 40, 85, 95, 70, 80, 55, 65, 90, 100, 75, 60, 85, 70, 90, 85, 65, 95].map((h, idx) => (
                    <div 
                      key={idx}
                      className="flex-1 bg-emerald-600 rounded-t-xs"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Recent Conversations</span>
                  <span className="text-emerald-700 font-bold hover:underline cursor-pointer">View all</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        @
                      </div>
                      <span className="font-bold text-slate-900 truncate">@thefitnesshub</span>
                      <span className="text-slate-500 truncate">Can you share the pricing details?</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-400 text-xs">2m ago</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        @
                      </div>
                      <span className="font-bold text-slate-900 truncate">@neha_sharma</span>
                      <span className="text-slate-500 truncate">Is this batch available in Kota?</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-400 text-xs">8m ago</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Left Bottom Trust Info */}
        <div className="pt-4 border-t border-slate-200/80 text-xs sm:text-sm text-slate-500 flex items-center justify-between shrink-0 font-medium">
          <span>Meta Cloud API Official Partner • 99.98% Uptime SLA</span>
          <span>End-to-End Encrypted</span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT COLUMN: Centered Framed Card Layout (Matches Reference Screenshot)
          ========================================================================= */}
      <div className="w-full lg:w-1/2 xl:w-5/12 min-h-screen bg-[#f8fafc] p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center overflow-y-auto relative">
        
        {/* Top Bar: Mobile Logo + Top-Right Sign Up Toggle */}
        <div className="flex items-center justify-between w-full max-w-[480px] shrink-0 mb-5">
          <div 
            onClick={onBackToHome}
            className="flex lg:hidden items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <MessageSquare className="w-5 h-5 fill-white/20" />
            </div>
            <span className="font-black text-2xl text-slate-900 tracking-tight font-['Outfit']">
              Auto<span className="text-emerald-700">Mask</span>
            </span>
          </div>

          <div className="text-sm sm:text-base text-slate-600 ml-auto font-medium">
            {authMode === 'signin' ? (
              <>
                <span>Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setStep('credentials');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer ml-1"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setStep('credentials');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer ml-1"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>

        {/* Center Main Login Card Form (Elevated Rounded-3xl Card) */}
        <div className="w-full max-w-[480px] bg-white rounded-3xl border border-slate-200/90 shadow-xl p-7 sm:p-8 space-y-5">
          
          {/* Card Header: Prominent Brand + Large Headings */}
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <MessageSquare className="w-5 h-5 fill-white/20" />
              </div>
              <span className="font-black text-2xl sm:text-3xl text-slate-900 tracking-tight font-['Outfit']">
                Auto<span className="text-emerald-700">Mask</span>
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-['Outfit'] tracking-tight leading-tight">
              {step === 'otp'
                ? 'Verify 6-Digit OTP'
                : authMode === 'signin'
                  ? 'Welcome back'
                  : 'Create your account'}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-1.5 font-medium">
              {step === 'otp'
                ? `Enter the code sent to ${email}`
                : authMode === 'signin'
                  ? 'Sign in to your AutoMask account'
                  : 'Start your automated WhatsApp journey today'}
            </p>
          </div>

          {/* Error & Success Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-sm text-rose-700 font-semibold">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-sm text-emerald-800 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="leading-snug">{successMessage}</span>
            </div>
          )}

          {/* STEP 1: CREDENTIALS */}
          {step === 'credentials' && (
            <>
              {/* Official Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
                className="w-full h-12 sm:h-13 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base transition-all shadow-xs flex items-center justify-center gap-3 border border-slate-200 hover:border-slate-300 cursor-pointer disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-slate-500 shrink-0" />
                    <span>Connecting Google...</span>
                  </>
                ) : (
                  <>
                    <svg 
                      className="w-5 h-5 min-w-[20px] min-h-[20px] shrink-0" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24"
                    >
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

              {/* Clean Divider */}
              <div className="relative flex py-0.5 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  OR
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleRequestOtp} className="space-y-4">
                {authMode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                        Industry Vertical
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as IndustryType)}
                        className="w-full h-12 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3.5 text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                      >
                        <option value="education">🎓 Education & Institutes</option>
                        <option value="ecommerce">🛍️ D2C & E-Commerce</option>
                        <option value="real_estate">🏢 Real Estate & Builders</option>
                        <option value="healthcare">🏥 Healthcare & Clinics</option>
                        <option value="services">⚙️ Professional Services</option>
                        <option value="saas">🚀 SaaS & Agencies</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                        Workspace / Company Name
                      </label>
                      <input
                        type="text"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        required
                        placeholder="e.g. Prakash Institute"
                        className="w-full h-12 px-3.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-sm sm:text-base text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder="e.g. Dr. Prakash Sharma"
                        className="w-full h-12 px-3.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-sm sm:text-base text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium placeholder:text-slate-400"
                      />
                    </div>
                  </>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="dr.prakash@prakashinstitute.edu.in"
                      className="w-full h-12 sm:h-13 pl-11 pr-4 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-sm sm:text-base text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Password
                    </label>
                    {authMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setSuccessMessage('Password reset instructions will be emailed to your address.')}
                        className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full h-12 sm:h-13 pl-11 pr-11 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-sm sm:text-base text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      WhatsApp Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full h-12 sm:h-13 pl-11 pr-4 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-sm sm:text-base text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium placeholder:text-slate-400 font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 sm:h-13 mt-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-base font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Sending verification code...</span>
                    </>
                  ) : (
                    <>
                      <span>{authMode === 'signin' ? 'Sign In with OTP' : 'Create Account & Verify OTP'}</span>
                      <ArrowRight className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Logins Section */}
              {authMode === 'signin' && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-400 tracking-wider uppercase text-center mb-2.5">
                    QUICK DEMO LOGINS
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                    {demoAccounts.map((acc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectDemoUser(acc)}
                        className={`h-11 sm:h-12 px-2.5 rounded-xl text-xs sm:text-sm font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate shadow-2xs ${
                          email === acc.email
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                        title={`${acc.name} (${acc.workspaceName})`}
                      >
                        <span className="text-base sm:text-lg shrink-0">{acc.icon}</span>
                        <span className="truncate">{acc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
          {step === 'otp' && (
            <div className="space-y-5">
              {demoOtpCode && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-sm sm:text-base">
                  <span className="text-emerald-900 font-extrabold">Demo OTP Code:</span>
                  <button
                    type="button"
                    onClick={() => setOtp(demoOtpCode)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black text-sm cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{demoOtpCode}</span>
                    <span className="text-xs font-normal opacity-90">(Auto-fill)</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2.5 text-center uppercase tracking-wide">
                    Enter the 6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.5em] font-mono text-2xl sm:text-3xl h-14 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full h-12 sm:h-13 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-base font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Open Dashboard</span>
                      <Check className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to credentials</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className={`font-extrabold cursor-pointer ${
                    resendCooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-emerald-700 hover:underline'
                  }`}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Footer Info: Directly below the card */}
        <div className="mt-5 flex items-center justify-between text-xs sm:text-sm text-slate-400 w-full max-w-[480px] shrink-0 font-medium">
          <span>© 2026 AutoMask Inc.</span>
          <div className="flex items-center gap-3">
            <span className="hover:text-slate-600 cursor-pointer">Privacy</span>
            <span>•</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms</span>
            <span>•</span>
            <button 
              onClick={onNavigateToAdminLogin}
              className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
