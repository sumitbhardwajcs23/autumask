import React, { useState, useEffect } from 'react';
import { 
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
  Check,
  RefreshCw,
  Phone,
  MessageSquare,
  Send,
  Star,
  ExternalLink
} from 'lucide-react';
import { authApi } from '../../services/api';
import { User } from '../../types';
import { IndustryType, INDUSTRIES } from '../../config/industries';

interface UserLoginPageProps {
  onLoginSuccess: (user: User, token: string, workspace?: any) => void;
  onNavigateToAdminLogin: () => void;
  onBackToHome: () => void;
}

interface ShowcaseData {
  tag: string;
  headline: string;
  subheadline: string;
  quote: {
    text: string;
    author: string;
    role: string;
    company: string;
    avatar: string;
  };
  chatMock: {
    customerMsg: string;
    customerTime: string;
    botMsg: string;
    botTime: string;
    actionButtons: string[];
    statBadge: string;
  };
}

const INDUSTRY_SHOWCASE: Record<IndustryType, ShowcaseData> = {
  ecommerce: {
    tag: 'D2C & E-Commerce Brands',
    headline: 'Recover abandoned carts and verify COD orders on autopilot.',
    subheadline: 'Connect Shopify, WooCommerce, or Custom stores. Turn hesitant shoppers into repeat buyers with 1-click WhatsApp checkout discounts.',
    quote: {
      text: "AutoMask recovered ₹4.8 Lakhs in abandoned carts in our first 30 days. The COD confirmation bot alone reduced our RTO rate by 38%.",
      author: 'Neha Gupta',
      role: 'Growth Lead',
      company: 'GlowAura Beauty D2C',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    chatMock: {
      customerMsg: "Hi, I left the vitamin C serum in my cart. Is there any discount code?",
      customerTime: "9:42 AM",
      botMsg: "Hey Neha! 👋 Yes! Here is your 10% instant coupon: GLOW10. Tap below to complete checkout with free express delivery:",
      botTime: "9:42 AM",
      actionButtons: ["🛒 Complete Order (₹1,490)", "📦 View Ingredients"],
      statBadge: "⚡ ₹5.4L recovered this month",
    },
  },
  real_estate: {
    tag: 'Real Estate & Builders',
    headline: 'Qualify property buyers and fill weekend site visits without call spam.',
    subheadline: 'Deliver high-res floor plans instantly, filter inquiries by budget, and let serious buyers pick their preferred viewing slot directly in chat.',
    quote: {
      text: "Our brokers used to chase dead portal leads for days. With AutoMask, buyers qualify their own budget and book Sunday site visits automatically.",
      author: 'Vikram Oberoi',
      role: 'Managing Partner',
      company: 'UrbanNest Luxury Realty',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    },
    chatMock: {
      customerMsg: "Is the 3 BHK corner unit with sea view still available in Tower B?",
      customerTime: "11:15 AM",
      botMsg: "Yes! 2 units remain on floors 14 & 18. Here is the master brochure & payment schedule. Would you like to tour the sample flat this Sunday?",
      botTime: "11:15 AM",
      actionButtons: ["📄 Download 3 BHK Floor Plan", "📍 Book Sunday Site Visit"],
      statBadge: "🏢 58 site visits booked",
    },
  },
  healthcare: {
    tag: 'Clinics & Healthcare',
    headline: 'Eliminate OPD waiting queues and deliver digital lab reports securely.',
    subheadline: 'Patients book doctor consultations, receive smart pre-visit fasting instructions, and download diagnostic reports in seconds.',
    quote: {
      text: "Our clinic reception phones used to ring nonstop. AutoMask now handles 70% of appointment bookings and virtually erased OPD no-shows.",
      author: 'Dr. Ananya Roy',
      role: 'Medical Director',
      company: 'ApexCare Multi-Speciality Clinic',
      avatar: 'https://images.unsplash.com/photo-1594824813501-4475e2a22904?w=150&auto=format&fit=crop&q=80',
    },
    chatMock: {
      customerMsg: "Need an appointment with Dr. Sharma for cardiology checkup.",
      customerTime: "2:04 PM",
      botMsg: "Dr. Sharma has open OPD slots tomorrow at 10:30 AM and 4:15 PM at our Indiranagar center. Which slot suits you best?",
      botTime: "2:04 PM",
      actionButtons: ["🩺 Reserve 10:30 AM Slot", "🩺 Reserve 4:15 PM Slot"],
      statBadge: "🏥 195 OPD consults confirmed",
    },
  },
  education: {
    tag: 'Education & Coaching Institutes',
    headline: 'Turn admission inquiries into confirmed classroom enrollments.',
    subheadline: 'Give students and parents instant answers on syllabus, batch fees, and faculty track records, then book them into live demo lectures.',
    quote: {
      text: "Parents usually inquire late at night after work. AutoMask's admission bot answers syllabus and fee questions 24/7 and enrolls students into free trial seats.",
      author: 'Dr. Prakash Sharma',
      role: 'Founder & Director',
      company: 'Prakash Institute Kota',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    chatMock: {
      customerMsg: "What are the fees for JEE 2027 Dropper Batch and scholarship test details?",
      customerTime: "8:20 PM",
      botMsg: "The 1-year Dropper Pinnacle batch is ₹1,15,000 with up to 40% scholarship on our entrance test. Would you like a seat for the demo class this Saturday?",
      botTime: "8:20 PM",
      actionButtons: ["🎓 Reserve Free Demo Seat", "📥 Download Prospectus PDF"],
      statBadge: "🎓 74 demo seats filled",
    },
  },
  services: {
    tag: 'Legal, CA & Advisory',
    headline: 'High-ticket client intake, document collection, and retainer onboarding.',
    subheadline: 'Replace messy email attachments. Collect KYC and tax documents through WhatsApp, and sync appointments directly to your partner calendar.',
    quote: {
      text: "Chasing clients for GST and incorporation paperwork used to take weeks. With AutoMask, clients upload PDFs directly in WhatsApp and retainers close 3x faster.",
      author: 'Karan Singhania',
      role: 'Senior Managing Partner',
      company: 'Stratagem Advisory',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    chatMock: {
      customerMsg: "We need company incorporation assistance and founder share agreements.",
      customerTime: "10:05 AM",
      botMsg: "Our corporate team specializes in cross-border entity incorporation. Please select a 30-min strategy consultation slot with our partner:",
      botTime: "10:05 AM",
      actionButtons: ["📅 Schedule Strategy Consultation", "📑 View Retainer Scope"],
      statBadge: "⚖️ 46 strategy calls booked",
    },
  },
  saas: {
    tag: 'SaaS & Digital Agencies',
    headline: 'Qualify inbound enterprise leads and book Zoom demos 24 hours a day.',
    subheadline: 'Your 24/7 AI Sales Development Representative (SDR). Ask qualifying budget & team size questions, then drop a Google Meet or Zoom invite.',
    quote: {
      text: "Our speed-to-lead went from 4 hours to under 30 seconds. Inbound prospects get qualified and schedule a Zoom walkthrough before our competitors even reply.",
      author: 'Arjun Malhotra',
      role: 'Head of Growth',
      company: 'ScaleOps Growth Agency',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    chatMock: {
      customerMsg: "We need 50 seats with custom webhook integrations. Can we see a demo?",
      customerTime: "4:50 PM",
      botMsg: "Absolutely! We support custom webhooks, dedicated SLAs, and SSO. Here are our open solutions architecture slots on Zoom for tomorrow:",
      botTime: "4:50 PM",
      actionButtons: ["🎥 Book 20-Min Product Walkthrough", "⚡ Request 14-Day Trial"],
      statBadge: "🚀 68 live demos scheduled",
    },
  },
};

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
    label: string;
  }> = [
    {
      industry: 'education',
      name: 'Dr. Prakash Sharma',
      roleLabel: 'Founder & Director',
      workspaceName: 'Prakash Institute Kota',
      email: 'dr.prakash@prakashinstitute.edu.in',
      icon: '🎓',
      label: 'Education',
    },
    {
      industry: 'ecommerce',
      name: 'Neha Gupta',
      roleLabel: 'Growth Lead',
      workspaceName: 'GlowAura Beauty D2C',
      email: 'neha@glowaura.in',
      icon: '🛍️',
      label: 'D2C Retail',
    },
    {
      industry: 'real_estate',
      name: 'Vikram Oberoi',
      roleLabel: 'Managing Broker',
      workspaceName: 'UrbanNest Luxury Realty',
      email: 'vikram@urbannest.com',
      icon: '🏢',
      label: 'Real Estate',
    },
    {
      industry: 'healthcare',
      name: 'Dr. Ananya Roy',
      roleLabel: 'Medical Director',
      workspaceName: 'ApexCare Clinic',
      email: 'ananya@apexcare.health',
      icon: '🏥',
      label: 'Healthcare',
    },
    {
      industry: 'services',
      name: 'Karan Singhania',
      roleLabel: 'Senior Partner',
      workspaceName: 'Stratagem Advisory',
      email: 'karan@stratagem.co',
      icon: '⚖️',
      label: 'Consulting',
    },
    {
      industry: 'saas',
      name: 'Arjun Malhotra',
      roleLabel: 'Head of Growth',
      workspaceName: 'ScaleOps Agency',
      email: 'arjun@scaleops.io',
      icon: '🚀',
      label: 'SaaS Agency',
    },
  ];

  const currentShowcase = INDUSTRY_SHOWCASE[activeIndustry] || INDUSTRY_SHOWCASE.education;

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
      setErrorMessage('Please enter your work email.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }
    if (authMode === 'signup') {
      if (!fullName.trim() || !workspaceName.trim()) {
        setErrorMessage('Please enter your full name and company name.');
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
          setOtp(res.demoOtp);
        }
        setSuccessMessage(res.message || `We sent a 6-digit verification code to ${email.trim()}`);
        setStep('otp');
        setResendCooldown(60);
      } else {
        throw new Error(res?.message || 'Failed to request OTP');
      }
    } catch (err: any) {
      console.error('Request OTP error:', err);
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Authentication error. Please check your credentials.'
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
        throw new Error('Verification failed. Invalid session returned.');
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
        setSuccessMessage(res.message || 'A fresh verification code has been sent.');
        setResendCooldown(60);
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between font-['Inter'] relative selection:bg-emerald-500 selection:text-white">
      {/* Subtle, refined background grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Top Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md relative z-10">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to overview</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Meta Cloud API Operational</span>
          </div>
          <button
            onClick={onNavigateToAdminLogin}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-400" />
            <span>Platform Admin</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl bg-[#0d121f] border border-slate-800 shadow-2xl overflow-hidden">
          
          {/* ==================================================================== */}
          {/* LEFT COLUMN: Editorial Showcase with Live Chat & Human Testimonial   */}
          {/* ==================================================================== */}
          <div className="lg:col-span-6 bg-[#0a0f1a] p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-800/90 flex flex-col justify-between">
            <div>
              {/* Brand Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-base font-bold text-white tracking-tight font-['Outfit']">
                    AutoMask
                  </div>
                  <div className="text-[11px] text-slate-400">
                    WhatsApp Operating System for Modern Teams
                  </div>
                </div>
              </div>

              {/* 6 Industry Filter Tabs */}
              <div className="mb-6">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Select your business model:
                </div>
                <div className="flex flex-wrap gap-1.5">
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                          isSelected
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/50 shadow-sm'
                            : 'bg-slate-900/60 hover:bg-slate-850 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <span>{ind.icon}</span>
                        <span>{ind.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Human Headline & Description */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] leading-tight mb-3">
                {currentShowcase.headline}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                {currentShowcase.subheadline}
              </p>

              {/* Realistic WhatsApp Chat Conversation Card */}
              <div className="mb-6 rounded-2xl bg-[#0f1726] border border-slate-800 p-4 shadow-inner">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-medium text-slate-300">Live Customer Chat Preview</span>
                  </div>
                  <span className="font-mono text-emerald-400 text-[10px]">
                    {currentShowcase.chatMock.statBadge}
                  </span>
                </div>

                {/* Chat Bubbles */}
                <div className="space-y-3 font-sans">
                  {/* Inbound Customer Message */}
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 bg-slate-800 text-slate-200 text-xs shadow-sm">
                      <p>{currentShowcase.chatMock.customerMsg}</p>
                      <span className="text-[10px] text-slate-400 float-right mt-1 ml-2">
                        {currentShowcase.chatMock.customerTime}
                      </span>
                    </div>
                  </div>

                  {/* Outbound AI Bot Response */}
                  <div className="flex justify-end">
                    <div className="max-w-[88%] rounded-2xl rounded-tr-sm px-3.5 py-2.5 bg-emerald-950/80 border border-emerald-800/50 text-emerald-100 text-xs shadow-sm">
                      <p className="leading-relaxed">{currentShowcase.chatMock.botMsg}</p>
                      
                      {/* Action buttons preview */}
                      <div className="mt-2.5 pt-2 border-t border-emerald-800/40 space-y-1.5">
                        {currentShowcase.chatMock.actionButtons.map((btn, bIdx) => (
                          <div 
                            key={bIdx}
                            className="w-full py-1.5 px-3 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/50 text-[11px] font-semibold text-emerald-200 text-center transition-colors flex items-center justify-center gap-1.5 cursor-default"
                          >
                            <span>{btn}</span>
                          </div>
                        ))}
                      </div>

                      <span className="text-[10px] text-emerald-400/80 float-right mt-1">
                        {currentShowcase.chatMock.botTime} • Delivered
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real Human Testimonial Card */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                <img 
                  src={currentShowcase.quote.avatar} 
                  alt={currentShowcase.quote.author}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0" 
                />
                <div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{currentShowcase.quote.text}"
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="font-bold text-white">{currentShowcase.quote.author}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{currentShowcase.quote.role}, {currentShowcase.quote.company}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Proof Strip */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Official Meta WhatsApp Business Solution Partner</span>
              </span>
              <span className="font-semibold text-emerald-400">99.98% Delivery SLA</span>
            </div>
          </div>

          {/* ==================================================================== */}
          {/* RIGHT COLUMN: Clean, Human-Made Login & Signup Card                  */}
          {/* ==================================================================== */}
          <div className="lg:col-span-6 p-8 lg:p-10 flex flex-col justify-between bg-[#0d121f]">
            <div>
              {/* Header & Mode Switcher */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white font-['Outfit']">
                    {step === 'otp'
                      ? 'Verify Your Code'
                      : authMode === 'signin'
                        ? 'Sign in to your account'
                        : 'Create your workspace'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {step === 'otp'
                      ? `We sent a 6-digit confirmation code to ${email}`
                      : authMode === 'signin'
                        ? 'Welcome back. Enter your credentials or use 1-click Google.'
                        : 'Start with 14 days free. No credit card required.'}
                  </p>
                </div>

                {/* Clean Toggle Link */}
                {step === 'credentials' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                  >
                    {authMode === 'signin' ? 'Create an account' : 'Sign in instead'}
                  </button>
                )}
              </div>

              {/* Error & Success Alerts */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* STEP 1: CREDENTIALS */}
              {step === 'credentials' && (
                <>
                  {/* Google 1-Click Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading || isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-3 border border-slate-200 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                        <span>Connecting to Google...</span>
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
                    <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                      or use your work email
                    </span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  {/* Clean 1-Click Demo Accounts Selector */}
                  {authMode === 'signin' && (
                    <div className="mb-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-slate-300">
                          ⚡ Instant 1-Click Demo Testing:
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          AutoMask@2026
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {agencyDemoAccounts.map((account, idx) => {
                          const isSelected = email === account.email;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectDemoUser(account)}
                              className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-500/20 border-emerald-500 text-white'
                                  : 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs">{account.icon}</span>
                                <span className="text-xs font-semibold truncate">{account.label}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                {account.name.split(' ')[0]}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleRequestOtp} className="space-y-3.5">
                    {authMode === 'signup' && (
                      <>
                        {/* Select Business Vertical */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1.5">
                            Business / Agency Model
                          </label>
                          <select
                            value={signupCategory}
                            onChange={(e) => {
                              const val = e.target.value as IndustryType;
                              setSignupCategory(val);
                              setActiveIndustry(val);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="education">🎓 Education & Coaching Institutes</option>
                            <option value="ecommerce">🛍️ D2C & Retail Brands</option>
                            <option value="real_estate">🏢 Real Estate & Builders</option>
                            <option value="healthcare">🏥 Healthcare & Clinics</option>
                            <option value="services">⚖️ Professional Services (Legal, CA, Advisory)</option>
                            <option value="saas">🚀 SaaS & Tech Agencies</option>
                          </select>
                        </div>

                        {/* Company Name */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Company or Institute Name
                          </label>
                          <input
                            type="text"
                            value={workspaceName}
                            onChange={(e) => setWorkspaceName(e.target.value)}
                            required
                            placeholder="e.g. Acme Technologies"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        {/* Full Name */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Your Full Name
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="e.g. Rahul Sharma"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </>
                    )}

                    {/* Email Field */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Work Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@company.com"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-slate-300">
                          Password
                        </label>
                        {authMode === 'signin' && (
                          <span className="text-[11px] text-slate-400">
                            Demo: <span className="text-emerald-400 font-mono">AutoMask@2026</span>
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder={authMode === 'signup' ? 'Min 8 characters' : 'Enter your password'}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
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
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          WhatsApp Business Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    )}

                    {/* Primary Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Sending 6-digit verification code...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue with 6-Digit OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
              {step === 'otp' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Verification Code Sent</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Please check inbox for <strong className="text-emerald-400 font-mono">{email}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Test OTP Helper */}
                  {demoOtpCode && (
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-emerald-500/30 flex items-center justify-between text-xs">
                      <span className="text-slate-300">Quick Test Code:</span>
                      <button
                        type="button"
                        onClick={() => setOtp(demoOtpCode)}
                        className="px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono font-bold transition-all text-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>{demoOtpCode}</span>
                        <span className="text-[10px] font-sans font-normal text-slate-300">(Click to fill)</span>
                      </button>
                    </div>
                  )}

                  {/* OTP Input Form */}
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Enter 6-Digit Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        required
                        autoFocus
                        placeholder="• • • • • •"
                        className="w-full text-center tracking-[0.8em] font-mono text-xl py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otp.length < 6}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Verifying code...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Open Workspace</span>
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Resend & Back Controls */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setStep('credentials')}
                      className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change email</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isLoading}
                      className={`flex items-center gap-1 font-medium ${
                        resendCooldown > 0 
                          ? 'text-slate-500 cursor-not-allowed' 
                          : 'text-emerald-400 hover:underline cursor-pointer'
                      }`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Security / Privacy Note */}
            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Encrypted via TLS 1.3 • SOC-2 Type II Certified</span>
              <span>Need help? Contact support</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-800/60 bg-[#090d16]">
        © 2026 AutoMask Inc. Built for modern businesses running on WhatsApp.
      </footer>
    </div>
  );
};
