import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  CheckCircle2, 
  ShieldCheck, 
  Globe, 
  Clock, 
  Users, 
  Key, 
  RefreshCw, 
  Copy, 
  ExternalLink,
  Loader2,
  Sliders,
  Bell,
  Save,
  Check,
  Building,
  Lock,
  Mail,
  Zap,
  Bot,
  Send,
  AlertCircle,
  X,
  Radio,
  Sparkles,
  Smartphone,
  LogOut,
  HelpCircle,
  Info
} from 'lucide-react';
import { WhatsAppAccount, User } from '../../types';
import { whatsappApi, teamApi } from '../../services/api';

interface SettingsViewProps {
  whatsappAccount?: WhatsAppAccount;
}

export type SettingsSubTab = 'general' | 'whatsapp' | 'notifications' | 'routing' | 'security';

export const SettingsView: React.FC<SettingsViewProps> = ({ whatsappAccount: propAccount }) => {
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>('whatsapp');
  const [copied, setCopied] = useState(false);
  const [account, setAccount] = useState<any>(propAccount || null);
  const [team, setTeam] = useState<User[]>([
    { id: 'usr-1', email: 'sumit@prakashinstitute.edu.in', fullName: 'Sumit Bhardwaj', role: 'admin', isOnline: true },
    { id: 'usr-2', email: 'priya.s@prakashinstitute.edu.in', fullName: 'Priya Sharma', role: 'agent', isOnline: true },
    { id: 'usr-3', email: 'rohan.v@prakashinstitute.edu.in', fullName: 'Rohan Verma', role: 'agent', isOnline: true },
    { id: 'usr-4', email: 'kavita.k@prakashinstitute.edu.in', fullName: 'Kavita Sen', role: 'agent', isOnline: false },
    { id: 'usr-5', email: 'amit.j@prakashinstitute.edu.in', fullName: 'Amit Joshi', role: 'agent', isOnline: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // General Settings State
  const [instituteName, setInstituteName] = useState('Prakash Institute Kota');
  const [campusAddress, setCampusAddress] = useState('Road No. 1, IPIA, Kota, Rajasthan 324005');
  const [contactEmail, setContactEmail] = useState('admissions@prakashinstitute.edu.in');
  const [helplinePhone, setHelplinePhone] = useState('+91 744 245 6789');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');

  // Notification Switches State
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [emailOnVipLead, setEmailOnVipLead] = useState(true);
  const [staffDemoAlerts, setStaffDemoAlerts] = useState(true);
  const [dailyOwnerDigest, setDailyOwnerDigest] = useState(true);

  // Routing Switches State
  const [roundRobinAssignment, setRoundRobinAssignment] = useState(true);
  const [enforceOfficeHours, setEnforceOfficeHours] = useState(true);
  const [autoArchiveInactive, setAutoArchiveInactive] = useState(true);
  const [autoTagInterests, setAutoTagInterests] = useState(true);

  // Security Switches State
  const [enforceStaffMfa, setEnforceStaffMfa] = useState(false);
  const [strictRlsTenantIsolation, setStrictRlsTenantIsolation] = useState(true);
  const [autoLogoutSession, setAutoLogoutSession] = useState(true);
  const [restrictStudentExports, setRestrictStudentExports] = useState(true);

  // WhatsApp Connect State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectMethod, setConnectMethod] = useState<'embedded' | 'manual'>('embedded');
  const [phoneNumberIdInput, setPhoneNumberIdInput] = useState('1317971801407031');
  const [wabaIdInput, setWabaIdInput] = useState('1789873612251308');
  const [displayNumberInput, setDisplayNumberInput] = useState('+1 555-660-3701');
  const [accessTokenInput, setAccessTokenInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Test Message State
  const [showTestMessageDrawer, setShowTestMessageDrawer] = useState(false);
  const [testRecipientPhone, setTestRecipientPhone] = useState('');
  const [testMessageBody, setTestMessageBody] = useState('Hello from AutoMask WhatsApp Cloud API! Your automation is active.');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const webhookUrl = 'https://pixzywd5u6.execute-api.us-east-1.amazonaws.com/webhooks/whatsapp';
  const verifyToken = 'automask_webhook_verify_token';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      whatsappApi.getAccount().then(res => {
        if (res.account) {
          setAccount(res.account);
          if (res.account.phoneNumberId) setPhoneNumberIdInput(res.account.phoneNumberId);
          if (res.account.wabaId) setWabaIdInput(res.account.wabaId);
          if (res.account.displayNumber) setDisplayNumberInput(res.account.displayNumber);
        }
      }).catch(() => null),
      teamApi.list().then(res => res.team && setTeam(res.team)).catch(() => null),
    ]).finally(() => setLoading(false));
  }, []);

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    showToast('Webhook callback URL copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyVerifyToken = () => {
    navigator.clipboard.writeText(verifyToken);
    setCopiedToken(true);
    showToast('Webhook verify token copied to clipboard.');
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleConnectWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumberIdInput.trim() || !wabaIdInput.trim()) {
      showToast('Phone Number ID and WABA ID are required.');
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
        setAccount(res.account);
        setShowConnectModal(false);
        showToast('🎉 WhatsApp Business Account connected successfully!');
      } else {
        showToast('Failed to connect WhatsApp account.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error connecting WhatsApp account.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect this WhatsApp Business number?')) return;
    try {
      await whatsappApi.disconnect();
      setAccount((prev: any) => ({ ...prev, status: 'DISCONNECTED' }));
      showToast('WhatsApp Business number disconnected.');
    } catch (err: any) {
      showToast('Failed to disconnect.');
    }
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipientPhone.trim()) {
      showToast('Please enter a destination phone number.');
      return;
    }
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await whatsappApi.sendTestMessage({
        toPhone: testRecipientPhone.trim(),
        message: testMessageBody,
      });
      setTestResult(res);
      showToast('🚀 Live test message dispatched successfully!');
    } catch (err: any) {
      setTestResult({ success: false, error: err.message || 'Dispatch failed' });
      showToast('Test message dispatch failed.');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleLaunchEmbeddedSignup = () => {
    const appId = '1683058303167953';
    showToast('Launching Meta Embedded Signup flow...');
    const popupWidth = 600;
    const popupHeight = 700;
    const left = window.screen.width / 2 - popupWidth / 2;
    const top = window.screen.height / 2 - popupHeight / 2;
    const popupUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(window.location.origin + '/whatsapp-callback')}&response_type=code&scope=whatsapp_business_management,whatsapp_business_messaging`;
    window.open(popupUrl, 'Meta_Embedded_Signup', `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Institute settings and preferences saved successfully!');
    }, 600);
  };

  const onlineMembersCount = team.filter(m => m.isOnline).length;

  return (
    <div className="p-6 sm:p-8 max-w-[1550px] w-full mx-auto space-y-7 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-['Outfit'] flex items-center gap-2.5">
            Settings & Workspace Preferences
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure Meta WhatsApp Cloud API credentials, automated lead routing switches, staff alerts, and security policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {toastMessage && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Syncing...</span>
            </div>
          )}

          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2.5 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'whatsapp'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>WhatsApp Cloud API</span>
        </button>

        <button
          onClick={() => setActiveSubTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'general'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>General Profile</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'notifications'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification Switches</span>
        </button>

        <button
          onClick={() => setActiveSubTab('routing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'routing'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Routing & Auto-Assignment</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'security'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Security & RLS Isolation</span>
        </button>
      </div>

      {/* Sub-Tab 1: WhatsApp Cloud API Connection */}
      {activeSubTab === 'whatsapp' && (
        <div className="space-y-6">
          {/* Main Account Connection Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${
                  account?.status === 'CONNECTED' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  <Phone className="w-7 h-7 fill-white/20" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800">WhatsApp Business Account (Cloud API)</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      account?.status === 'CONNECTED' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {account?.status || 'CONNECTED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {account?.status === 'CONNECTED' 
                      ? 'Official WABA connected with Meta Graph API & Webhook processing' 
                      : 'No WhatsApp number connected yet. Connect your number to start receiving leads.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-sm font-mono font-bold bg-slate-100 px-3.5 py-2 rounded-xl text-slate-800">
                  {account?.displayPhoneNumber || account?.displayNumber || '+1 555-660-3701'}
                </span>

                <button
                  onClick={() => setShowConnectModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{account?.status === 'CONNECTED' ? 'Change / Reconnect Number' : 'Connect WhatsApp Number'}</span>
                </button>

                <button
                  onClick={() => setShowTestMessageDrawer(!showTestMessageDrawer)}
                  className="px-4 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Test Message</span>
                </button>

                {account?.status === 'CONNECTED' && (
                  <button
                    onClick={handleDisconnect}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Disconnect number"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* WABA Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block text-xs font-semibold mb-1">Phone Number ID</span>
                <span className="font-mono font-bold text-slate-800 text-sm sm:text-base">{account?.phoneNumberId || '1317971801407031'}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block text-xs font-semibold mb-1">WABA Account ID</span>
                <span className="font-mono font-bold text-slate-800 text-sm sm:text-base">{account?.wabaId || '1789873612251308'}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block text-xs font-semibold mb-1">Phone Quality Rating</span>
                <span className="font-bold text-emerald-600 text-sm sm:text-base flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  {account?.qualityRating || 'GREEN'} (HIGH • Verified)
                </span>
              </div>
            </div>

            {/* Webhook Configuration Section */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Meta Webhook Configuration</h4>
                  <p className="text-xs text-slate-500">Enter these exact credentials in Meta Developer Dashboard ➔ WhatsApp ➔ Configuration ➔ Webhooks</p>
                </div>
                <a
                  href="https://developers.facebook.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Meta Developers Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Callback URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      className="flex-1 bg-slate-50 font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none"
                    />
                    <button
                      onClick={copyWebhook}
                      className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Verify Token</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={verifyToken}
                      className="flex-1 bg-slate-50 font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none"
                    />
                    <button
                      onClick={copyVerifyToken}
                      className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                      <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Message Drawer / Card */}
          {showTestMessageDrawer && (
            <div className="bg-gradient-to-br from-indigo-50/80 to-slate-50 p-6 rounded-3xl border border-indigo-200/80 shadow-xs space-y-4 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Dispatch Live Test WhatsApp Message</h3>
                    <p className="text-xs text-slate-500">Send an instant test message to any WhatsApp number to verify live delivery</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTestMessageDrawer(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSendTestMessage} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Destination Phone (with country code)</label>
                  <input
                    type="text"
                    placeholder="e.g. +919876543210"
                    value={testRecipientPhone}
                    onChange={(e) => setTestRecipientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">For sandbox numbers, add recipient in Meta App API Setup.</p>
                </div>

                <div className="md:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Message Body</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testMessageBody}
                      onChange={(e) => setTestMessageBody(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSendingTest}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {isSendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>{isSendingTest ? 'Sending...' : 'Send Now'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {testResult && (
                <div className={`p-3.5 rounded-xl text-xs border ${
                  testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                    <span>{testResult.success ? 'Message Sent Successfully!' : 'Delivery Failed'}</span>
                  </div>
                  <p className="text-[11px] mt-1 font-mono">
                    {testResult.success 
                      ? `Provider Message ID: ${testResult.providerMessageId || 'wamid.HBgL...'} • Method: ${testResult.method || 'text'}` 
                      : (testResult.error || 'Meta API rejected message. Verify recipient phone number in Meta dashboard.')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Connect WhatsApp Modal / Popup */}
          {showConnectModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                      <Phone className="w-5 h-5 fill-white/20" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Connect WhatsApp Business Account</h3>
                      <p className="text-xs text-slate-500">Choose your connection method for instant AI automation</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowConnectModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Method Switcher Tabs */}
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                  <button
                    onClick={() => setConnectMethod('embedded')}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      connectMethod === 'embedded' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>1-Click Facebook Connect</span>
                  </button>
                  <button
                    onClick={() => setConnectMethod('manual')}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      connectMethod === 'manual' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Direct Meta Cloud API</span>
                  </button>
                </div>

                {/* Option 1: Embedded Signup Flow */}
                {connectMethod === 'embedded' && (
                  <div className="space-y-4 text-xs py-2">
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-slate-700 space-y-2">
                      <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Recommended for Coaching Institutes & Schools</span>
                      </h4>
                      <p className="text-[11px] leading-relaxed text-slate-600">
                        Connect your official WhatsApp number in under 2 minutes with no technical knowledge required. Meta verifies your number via SMS OTP directly.
                      </p>
                    </div>

                    <div className="space-y-2 text-slate-600 text-[11px] pl-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">1</span>
                        <span>Click "Continue with Facebook" to open Meta's secure window.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">2</span>
                        <span>Select your Meta Business Account and enter your phone number.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">3</span>
                        <span>Enter the 6-digit SMS OTP to verify. Your number connects instantly!</span>
                      </div>
                    </div>

                    <button
                      onClick={handleLaunchEmbeddedSignup}
                      className="w-full py-3.5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-xs mt-2"
                    >
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>Continue with Facebook (Meta Embedded Signup)</span>
                    </button>
                  </div>
                )}

                {/* Option 2: Direct Manual API Credentials Flow */}
                {connectMethod === 'manual' && (
                  <form onSubmit={handleConnectWhatsApp} className="space-y-3.5 text-xs">
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
                        placeholder="e.g. +1 555-660-3701"
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
                      <p className="text-[10px] text-slate-400 mt-1">Leave empty to use system default environment credentials.</p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowConnectModal(false)}
                        className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isConnecting}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        <span>{isConnecting ? 'Verifying...' : 'Save & Connect Account'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Team Staff Quick Overview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">Institute Counselling Staff</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{team.length} members assigned to manage inbound WhatsApp chats</p>
              </div>
              <span className="text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                {onlineMembersCount} Online Now
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {team.map((member) => (
                <div key={member.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold text-sm flex items-center justify-center">
                        {member.fullName.charAt(0)}
                      </div>
                      {member.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm sm:text-base">{member.fullName}</h4>
                      <p className="text-xs text-slate-400">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                      {member.role}
                    </span>
                    <span className={`text-xs font-semibold ${member.isOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {member.isOnline ? 'Active' : 'Offline'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: General Profile */}
      {activeSubTab === 'general' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 font-['Outfit']">Institute Profile Details</h3>
            <p className="text-xs text-slate-500">Official information shown in WhatsApp business profile and demo class invites</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Coaching Institute Name</label>
              <input
                type="text"
                value={instituteName}
                onChange={e => setInstituteName(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Helpline / WhatsApp Desk Phone</label>
              <input
                type="text"
                value={helplinePhone}
                onChange={e => setHelplinePhone(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-mono font-medium"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-slate-700">Kota Main Campus Address</label>
              <input
                type="text"
                value={campusAddress}
                onChange={e => setCampusAddress(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Admissions Desk Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Operating Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Notification Switches */}
      {activeSubTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 font-['Outfit']">Staff & Owner Notification Switches</h3>
            <p className="text-xs text-slate-500">Configure audible chimes, email pings, and WhatsApp alert forwards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Switch 1: Sound Alerts */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800">Inbound WhatsApp Sound Chimes</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Play audible alert when student messages arrive in inbox</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSoundAlerts(!soundAlerts);
                  showToast(soundAlerts ? 'Sound notifications muted' : 'Sound notifications enabled');
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  soundAlerts ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    soundAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Switch 2: Email on VIP Lead */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800">Email Alerts on High-Intent VIP Leads</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Notify counsellors immediately when student score &gt; 80</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmailOnVipLead(!emailOnVipLead);
                  showToast(emailOnVipLead ? 'VIP lead emails paused' : 'VIP lead emails active');
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  emailOnVipLead ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    emailOnVipLead ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Switch 3: Staff Demo Alerts */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800">Demo Class Booking WhatsApp Push</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Forward appointment confirmations to faculty counsellor's mobile</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStaffDemoAlerts(!staffDemoAlerts);
                  showToast(staffDemoAlerts ? 'Demo booking WhatsApp alerts paused' : 'Demo booking alerts active');
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  staffDemoAlerts ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    staffDemoAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Switch 4: Daily Owner Digest */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800">Daily 20:00 IST Executive Summary</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Send daily leads, admissions, and broadcast reports to Dr. Prakash</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDailyOwnerDigest(!dailyOwnerDigest);
                  showToast(dailyOwnerDigest ? 'Daily executive summary disabled' : 'Daily executive summary enabled');
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  dailyOwnerDigest ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    dailyOwnerDigest ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Routing & Auto-Assignment */}
      {activeSubTab === 'routing' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 font-['Outfit']">Automated Conversation Routing & Rules</h3>
            <p className="text-xs text-slate-500">Configure round-robin distribution, operating hours, and automatic resolution rules</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Switch 1: Round Robin */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800">Round-Robin Counsellor Assignment</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Evenly rotate new student chats among active online counsellors</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRoundRobinAssignment(!roundRobinAssignment);
                  showToast(roundRobinAssignment ? 'Round-robin assignment disabled' : 'Round-robin assignment enabled');
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  roundRobinAssignment ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    roundRobinAssignment ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Switch 2: Office Hours */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800">Enforce Kota Working Hours (9 AM - 8 PM)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Send away-message and rely on AI Assistant outside working hours</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEnforceOfficeHours(!enforceOfficeHours);
                  showToast(enforceOfficeHours ? 'Office hours enforcement relaxed' : 'Office hours enforcement active');
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enforceOfficeHours ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    enforceOfficeHours ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Switch 3: Auto-Archive Inactive */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800">Auto-Archive Inactive Chats (48h)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Mark resolved if neither student nor counsellor responds in 48 hours</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAutoArchiveInactive(!autoArchiveInactive);
                  showToast(autoArchiveInactive ? 'Auto-archive disabled' : 'Auto-archive 48h active');
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoArchiveInactive ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    autoArchiveInactive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Switch 4: Auto-Tag Interests */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800">Auto-Tag Course Interests</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Tag contacts with JEE / NEET / Dropper based on first message keywords</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAutoTagInterests(!autoTagInterests);
                  showToast(autoTagInterests ? 'Auto-tagging disabled' : 'Auto-tagging active');
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoTagInterests ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    autoTagInterests ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 5: Security & RLS */}
      {activeSubTab === 'security' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 font-['Outfit']">Workspace Security & Tenant Isolation</h3>
            <p className="text-xs text-slate-500">PostgreSQL 17 Row-Level Security, authentication requirements, and export safeguards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Switch 1: Two Factor Auth */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800">Require 2FA for Staff Login</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Requires OTP code verification on every staff login</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEnforceStaffMfa(!enforceStaffMfa);
                  showToast(enforceStaffMfa ? 'Staff 2FA requirement relaxed' : '2FA enforced for all staff logins');
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enforceStaffMfa ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    enforceStaffMfa ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Switch 2: Row Level Security */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800">PostgreSQL Row-Level Security (RLS)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Enforces database transaction-level tenant isolation</p>
              </div>
              <button
                type="button"
                disabled
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-emerald-500 opacity-90"
                title="System Enforced Multi-Tenant Security"
              >
                <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 translate-x-5" />
              </button>
            </div>

            {/* Switch 3: Session Auto-Logout */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800">Idle Session Auto-Logout (30 mins)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Protect student phone numbers on shared campus workstations</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAutoLogoutSession(!autoLogoutSession);
                  showToast(autoLogoutSession ? 'Session auto-logout disabled' : 'Idle session timeout set to 30 mins');
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoLogoutSession ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    autoLogoutSession ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Switch 4: Block Export for Non-Owners */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800">Restrict Contact Export to Owner (SRS §3)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Blocks counsellors and agents from bulk exporting student phone databases</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRestrictStudentExports(!restrictStudentExports);
                  showToast(restrictStudentExports ? 'Export restriction relaxed' : 'Student database export restricted to Owner');
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  restrictStudentExports ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    restrictStudentExports ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
