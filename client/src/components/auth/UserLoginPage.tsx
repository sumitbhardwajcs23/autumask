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
  ArrowLeft
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
  const [email, setEmail] = useState('dr.prakash@prakashinstitute.edu.in');
  const [password, setPassword] = useState('AutoMask@2026');
  const [workspaceSlug, setWorkspaceSlug] = useState('prakash-institute-kota');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      desc: 'Full workspace authority, billing, team suspension & audit logs',
    },
    {
      name: 'Sumit Bhardwaj',
      roleLabel: 'Workspace Admin',
      role: 'admin',
      email: 'sumit@prakashinstitute.edu.in',
      icon: '🛡️',
      desc: 'Automation rules, templates, broadcasts & lead export',
    },
    {
      name: 'Priya Sharma',
      roleLabel: 'Admissions Counselor',
      role: 'agent',
      email: 'priya.s@prakashinstitute.edu.in',
      icon: '👨‍💼',
      desc: 'Shared inbox, human takeover & student chats',
    },
    {
      name: 'Ananya Roy',
      roleLabel: 'Senior Counselling Lead',
      role: 'agent',
      email: 'ananya.r@prakashinstitute.edu.in',
      icon: '⭐',
      desc: 'Custom Role: Granted templates.create, Denied contacts.delete',
    },
  ];

  const handleSelectDemoUser = (user: typeof demoUsers[0]) => {
    setEmail(user.email);
    setPassword('AutoMask@2026');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.login(email.trim(), password.trim());
      if (res?.user && res?.token) {
        onLoginSuccess(res.user, res.token);
      } else {
        throw new Error('Login failed: Invalid server credentials response');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(
        err?.response?.data?.message || 
        err?.message || 
        'Invalid email or password. You can also click any 1-Click Team Member below!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
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

  const handleGoogleSignIn = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    setIsGoogleLoading(true);
    setErrorMessage(null);

    const redirectUri = window.location.origin;

    // 1. Prefer Google Identity Services OAuth2 code client (popup)
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
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
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
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

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-between font-['Inter'] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[350px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Bar */}
      <header className="px-6 py-6 flex items-center justify-between relative z-10">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:inline">Platform Super Admin?</span>
          <button
            onClick={onNavigateToAdminLogin}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/50 transition-all flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            <span>Platform Admin Portal</span>
          </button>
        </div>
      </header>

      {/* Main Login Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Left Column: Branding Showcase */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 p-8 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
            <div>
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-md shadow-emerald-500/20">
                  <div className="w-full h-full bg-[#0a0f1d] rounded-[14px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-white font-['Outfit']">
                    Auto<span className="text-emerald-400">Mask</span>
                  </h1>
                  <p className="text-[10px] text-slate-400 font-medium">WhatsApp Cloud API SaaS</p>
                </div>
              </div>

              <h2 className="text-2xl font-black text-white font-['Outfit'] leading-tight mb-3">
                Workspace Team Portal
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Log in to your institute's dedicated WhatsApp automation console with real-time Meta syncing and grounded RAG facts.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-3.5">
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">PostgreSQL RLS Isolation</strong>
                    <span className="text-[11px] text-slate-400">Multi-tenant row-level database security.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="p-1 rounded-lg bg-teal-500/10 text-teal-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Official Meta Cloud API</strong>
                    <span className="text-[11px] text-slate-400">24-hr service window & verified template guards.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Granular RBAC Enforced</strong>
                    <span className="text-[11px] text-slate-400">Owner, Admin & Counselor privilege separation.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status pill */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Meta API Online (v21.0)
              </span>
              <span>v2.4 Production</span>
            </div>
          </div>

          {/* Right Column: Sign In Form & 1-Click Fast Switcher */}
          <div className="lg:col-span-7 p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white font-['Outfit']">Sign In to Your Workspace</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials or continue instantly with your Google account.
              </p>
            </div>

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
                  or sign in with email
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>
            </div>

            {/* 1-Click Team Member Quick Selectors */}
            <div className="mb-6">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                ⚡ 1-Click Demo Team Credentials:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {demoUsers.map((u, idx) => {
                  const isSelected = email === u.email;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectDemoUser(u)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2 ${
                        isSelected 
                          ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-xs' 
                          : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      <span className="text-base">{u.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate text-white">{u.name}</div>
                        <div className="text-[10px] text-emerald-400 font-medium truncate">{u.roleLabel}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/80 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Workspace Slug */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Workspace Organization</span>
                </label>
                <input
                  type="text"
                  value={workspaceSlug}
                  onChange={(e) => setWorkspaceSlug(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  placeholder="e.g. prakash-institute-kota"
                />
              </div>

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
                  <span className="text-[11px] text-emerald-400/80 font-mono">Demo: AutoMask@2026</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Enter your password"
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

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Remember this workspace</span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo password is AutoMask@2026'); }} className="text-emerald-400 hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Authenticating with Meta Cloud Session...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-slate-500 relative z-10">
        AutoMask Enterprise WhatsApp Business Automation • Multi-Tenant Protected
      </footer>
    </div>
  );
};
