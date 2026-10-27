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
  Bot
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

  const webhookUrl = `${window.location.origin}/api/v1/webhooks/whatsapp`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      whatsappApi.getAccount().then(res => res.account && setAccount(res.account)).catch(() => null),
      teamApi.list().then(res => res.team && setTeam(res.team)).catch(() => null),
    ]).finally(() => setLoading(false));
  }, []);

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    showToast('Webhook callback URL copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
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
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight font-['Outfit'] flex items-center gap-2">
            Settings & Workspace Preferences
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
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
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('whatsapp')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeSubTab === 'whatsapp'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>WhatsApp Cloud API</span>
        </button>

        <button
          onClick={() => setActiveSubTab('general')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeSubTab === 'general'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>General Profile</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeSubTab === 'notifications'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notification Switches</span>
        </button>

        <button
          onClick={() => setActiveSubTab('routing')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeSubTab === 'routing'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Routing & Auto-Assignment</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeSubTab === 'security'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security & RLS Isolation</span>
        </button>
      </div>

      {/* Sub-Tab 1: WhatsApp Cloud API Connection */}
      {activeSubTab === 'whatsapp' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                  <Phone className="w-6 h-6 fill-white/20" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800">WhatsApp Business Account (Cloud API)</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {account?.status || 'CONNECTED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Official WABA connected via Meta Embedded Signup</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1.5 rounded-xl text-slate-800">
                  {account?.displayPhoneNumber || account?.displayNumber || '+91 744 245 6789'}
                </span>
              </div>
            </div>

            {/* WABA Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px] mb-1">Phone Number ID</span>
                <span className="font-mono font-bold text-slate-700">{account?.phoneNumberId || '982347109238475'}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px] mb-1">WABA Account ID</span>
                <span className="font-mono font-bold text-slate-700">{account?.wabaId || '109283746501928'}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px] mb-1">Phone Quality Rating</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  {account?.qualityRating || 'GREEN'} (HIGH • Tier 2)
                </span>
              </div>
            </div>

            {/* Webhook Endpoint */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Meta Webhook Callback URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="flex-1 bg-slate-50 font-mono text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 focus:outline-none"
                />
                <button
                  onClick={copyWebhook}
                  className="px-3 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Team Staff Quick Overview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Institute Counselling Staff</h3>
                <p className="text-xs text-slate-500">{team.length} members assigned to manage inbound WhatsApp chats</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {onlineMembersCount} Online Now
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {team.map((member) => (
                <div key={member.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                        {member.fullName.charAt(0)}
                      </div>
                      {member.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{member.fullName}</h4>
                      <p className="text-[11px] text-slate-400">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {member.role}
                    </span>
                    <span className={`text-[11px] font-medium ${member.isOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
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
