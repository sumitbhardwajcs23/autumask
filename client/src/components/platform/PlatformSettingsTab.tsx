import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Globe, 
  Mail, 
  Lock, 
  Sliders, 
  RotateCw, 
  Zap, 
  Bot,
  Bell
} from 'lucide-react';

export const PlatformSettingsTab: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Platform General Config
  const [platformName, setPlatformName] = useState('AutoMask SaaS');
  const [supportEmail, setSupportEmail] = useState('support@automask.io');
  const [compliancePhone, setCompliancePhone] = useState('+91 744 245 6789');
  const [defaultTrialDays, setDefaultTrialDays] = useState(14);
  const [maxFreeContacts, setMaxFreeContacts] = useState(500);

  // Platform Master Switches
  const [rateLimitingEnabled, setRateLimitingEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoSuspendDelinquent, setAutoSuspendDelinquent] = useState(true);
  const [enforceMfaStaff, setEnforceMfaStaff] = useState(true);
  const [aiFallbackMode, setAiFallbackMode] = useState(true);
  const [publicSignupEnabled, setPublicSignupEnabled] = useState(true);
  const [autoDailyBackup, setAutoDailyBackup] = useState(true);
  const [logStudentConversations, setLogStudentConversations] = useState(false); // SRS Line 615 Privacy Barrier

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Platform operational settings saved successfully!');
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-sm">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 font-['Outfit']">
                Platform Operations & System Settings
              </h1>
              <p className="text-xs text-slate-500">
                Global runtime switches, WhatsApp throughput thresholds, automated billing policies, and privacy barriers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {toastMessage && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving...' : 'Save System Settings'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Master Operational Switches */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-['Outfit']">Global Platform Runtime Switches</h3>
              <p className="text-xs text-slate-500">Instant toggle controls across all tenant clusters and queue workers</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Live Control Plane
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Switch 1: WhatsApp Rate Limiting */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors">
              <div>
                <h4 className="font-bold text-slate-800">WhatsApp Outbound Rate Limiting</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Enforces 100 msgs/second limit to prevent Meta account ban</p>
              </div>
              <button
                type="button"
                onClick={() => setRateLimitingEnabled(!rateLimitingEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  rateLimitingEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    rateLimitingEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Switch 2: Platform Maintenance Mode */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors">
              <div>
                <h4 className="font-bold text-slate-800">Platform Maintenance Mode</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Locks non-admin users with a 503 maintenance splash</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMaintenanceMode(!maintenanceMode);
                  showToast(maintenanceMode ? 'Maintenance mode deactivated' : '⚠️ Maintenance mode activated');
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  maintenanceMode ? 'bg-rose-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Switch 3: Delinquent Suspension */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors">
              <div>
                <h4 className="font-bold text-slate-800">Auto-Suspend Delinquent Tenants</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Automatically suspend accounts with unpaid invoices &gt; 15 days</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoSuspendDelinquent(!autoSuspendDelinquent)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoSuspendDelinquent ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    autoSuspendDelinquent ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Switch 4: Require Staff MFA */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors">
              <div>
                <h4 className="font-bold text-slate-800">Enforce 2FA for Platform Staff</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Requires TOTP authenticator app verification on login</p>
              </div>
              <button
                type="button"
                onClick={() => setEnforceMfaStaff(!enforceMfaStaff)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enforceMfaStaff ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    enforceMfaStaff ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Switch 5: AI Fallback Escalation */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors">
              <div>
                <h4 className="font-bold text-slate-800">AI Hallucination Escalation</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Auto-escalate to human staff if RAG similarity is below 70%</p>
              </div>
              <button
                type="button"
                onClick={() => setAiFallbackMode(!aiFallbackMode)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  aiFallbackMode ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    aiFallbackMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Switch 6: Public Tenant Registration */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors">
              <div>
                <h4 className="font-bold text-slate-800">Public Tenant Registration</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Allow coaching institutes to self-sign up from the landing page</p>
              </div>
              <button
                type="button"
                onClick={() => setPublicSignupEnabled(!publicSignupEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  publicSignupEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    publicSignupEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Switch 7: SRS Line 615 Privacy Barrier */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors">
              <div>
                <h4 className="font-bold text-slate-800">SRS §615 Super-Admin Privacy Barrier</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Strictly blocks platform staff from student chat text without grant</p>
              </div>
              <button
                type="button"
                disabled
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-indigo-600 opacity-90"
                title="Hardcoded Compliance Requirement (SRS Line 615)"
              >
                <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 translate-x-5" />
              </button>
            </div>

            {/* Switch 8: Auto Daily Backup */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors">
              <div>
                <h4 className="font-bold text-slate-800">Nightly Encrypted Backup (S3)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Export pg_dump snapshots to AWS S3 Mumbai region at 03:00 IST</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoDailyBackup(!autoDailyBackup)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoDailyBackup ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    autoDailyBackup ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* General Identity & Thresholds */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm font-['Outfit']">Identity & Tenant Defaults</h3>
            <p className="text-xs text-slate-500">Default settings applied when a new coaching institute signs up</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Platform Brand Name</label>
              <input
                type="text"
                value={platformName}
                onChange={e => setPlatformName(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Official Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={e => setSupportEmail(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Meta Compliance Phone</label>
              <input
                type="text"
                value={compliancePhone}
                onChange={e => setCompliancePhone(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Default Free Trial Duration (Days)</label>
              <input
                type="number"
                value={defaultTrialDays}
                onChange={e => setDefaultTrialDays(Number(e.target.value))}
                className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Max Free Contacts Limit</label>
              <input
                type="number"
                value={maxFreeContacts}
                onChange={e => setMaxFreeContacts(Number(e.target.value))}
                className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
