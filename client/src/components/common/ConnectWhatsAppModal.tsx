import React, { useState } from 'react';
import { 
  Phone, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Key, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { WhatsAppAccount } from '../../types';
import { whatsappApi } from '../../services/api';

interface ConnectWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (account: WhatsAppAccount) => void;
  initialAccount?: WhatsAppAccount | null;
}

export const ConnectWhatsAppModal: React.FC<ConnectWhatsAppModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialAccount,
}) => {
  const [connectMethod, setConnectMethod] = useState<'embedded' | 'manual'>('embedded');
  const [phoneNumberIdInput, setPhoneNumberIdInput] = useState(initialAccount?.phoneNumberId || '');
  const [wabaIdInput, setWabaIdInput] = useState(initialAccount?.wabaId || '');
  const [displayNumberInput, setDisplayNumberInput] = useState(initialAccount?.displayNumber || '');
  const [accessTokenInput, setAccessTokenInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!phoneNumberIdInput.trim() || !wabaIdInput.trim()) {
      setErrorMessage('Phone Number ID and WABA ID are required.');
      return;
    }

    setIsConnecting(true);
    try {
      const res = await whatsappApi.connect({
        phoneNumberId: phoneNumberIdInput.trim(),
        wabaId: wabaIdInput.trim(),
        displayNumber: displayNumberInput.trim() || undefined,
        accessToken: accessTokenInput.trim() || undefined,
      });

      if (res.success && res.account) {
        onSuccess(res.account);
        onClose();
      } else {
        setErrorMessage('Failed to connect WhatsApp account. Please check credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error connecting WhatsApp account.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLaunchEmbeddedSignup = () => {
    const appId = '1683058303167953';
    const popupWidth = 600;
    const popupHeight = 700;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;
    
    const popupUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/meta-callback')}&response_type=token&scope=whatsapp_business_management,whatsapp_business_messaging`;
    
    const popup = window.open(
      popupUrl,
      'MetaEmbeddedSignup',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    // If popup blocked or for immediate sandbox testing, fallback prompt
    if (!popup || popup.closed) {
      setConnectMethod('manual');
      setErrorMessage('Popup was blocked by your browser. Please enter your Meta credentials manually below.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 fill-white/20" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit']">
                Connect WhatsApp Business Number
              </h3>
              <p className="text-xs text-slate-500">
                Link your Meta Cloud API account for instant 24/7 AI response automation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setConnectMethod('embedded')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              connectMethod === 'embedded' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>1-Click Meta Login</span>
          </button>
          <button
            type="button"
            onClick={() => setConnectMethod('manual')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              connectMethod === 'manual' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-4 h-4 text-indigo-600" />
            <span>Direct Meta API Keys</span>
          </button>
        </div>

        {/* Option 1: Embedded Signup Flow */}
        {connectMethod === 'embedded' && (
          <div className="space-y-4 text-xs py-1">
            <div className="bg-emerald-50/80 p-4.5 rounded-2xl border border-emerald-100 text-slate-700 space-y-2">
              <h4 className="font-extrabold text-emerald-950 flex items-center gap-2 text-sm font-['Outfit']">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                <span>Recommended Official Meta Flow</span>
              </h4>
              <p className="text-xs leading-relaxed text-slate-600">
                Log in with your Facebook account, select your business, and enter your WhatsApp phone number. Meta sends a 6-digit SMS OTP to verify instantly without manual token copying.
              </p>
            </div>

            <div className="space-y-2.5 text-slate-600 text-xs pl-1">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-black flex items-center justify-center text-xs shrink-0">1</span>
                <span>Click the button below to open Meta's secure embedded onboarding.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-black flex items-center justify-center text-xs shrink-0">2</span>
                <span>Choose your Meta Business Account and register your phone number.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-black flex items-center justify-center text-xs shrink-0">3</span>
                <span>Verify with SMS OTP. Your number links directly to your AutoMask workspace!</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLaunchEmbeddedSignup}
              className="w-full py-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-md text-sm mt-3 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continue with Facebook (Meta Embedded Signup)</span>
            </button>
          </div>
        )}

        {/* Option 2: Direct Manual API Credentials Flow */}
        {connectMethod === 'manual' && (
          <form onSubmit={handleConnect} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Phone Number ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 1317971801407031"
                value={phoneNumberIdInput}
                onChange={(e) => setPhoneNumberIdInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Found in Meta Developer Dashboard ➔ WhatsApp ➔ API Setup.</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                WhatsApp Business Account ID (WABA ID) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 1789873612251308"
                value={wabaIdInput}
                onChange={(e) => setWabaIdInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Display Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={displayNumberInput}
                onChange={(e) => setDisplayNumberInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Meta Permanent Access Token <span className="text-slate-400 font-normal">(Encrypted at rest)</span>
              </label>
              <input
                type="password"
                placeholder="EAAX..."
                value={accessTokenInput}
                onChange={(e) => setAccessTokenInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
              />
              <p className="text-[10px] text-slate-400 mt-1">Optional. System uses configured platform tokens if left empty.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isConnecting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{isConnecting ? 'Verifying...' : 'Save & Connect Number'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

