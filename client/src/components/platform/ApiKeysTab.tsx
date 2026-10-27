import React, { useState } from 'react';
import { 
  Key, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Sliders,
  RotateCw
} from 'lucide-react';

export interface ApiKeyItem {
  id: string;
  name: string;
  maskedKey: string;
  actualKey: string;
  scope: 'ADMIN_FULL' | 'WEBHOOK_INGEST' | 'AI_READ_ONLY';
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string;
  status: 'ACTIVE' | 'REVOKED';
}

export const ApiKeysTab: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [zeroDowntimeRotation, setZeroDowntimeRotation] = useState(true);
  const [ipWhitelisting, setIpWhitelisting] = useState(false);
  const [visibleKeyIds, setVisibleKeyIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Key Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState<'ADMIN_FULL' | 'WEBHOOK_INGEST' | 'AI_READ_ONLY'>('ADMIN_FULL');
  const [newKeyExpiry, setNewKeyExpiry] = useState('90');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [keys, setKeys] = useState<ApiKeyItem[]>([
    {
      id: 'key-master-prod',
      name: 'AutoMask Platform Super-Admin Key',
      maskedKey: 'automask_live_••••••••••••••••••••••••34f9',
      actualKey: 'automask_live_99a8b7c6d5e4f3a2b1c0987654321034f9',
      scope: 'ADMIN_FULL',
      createdAt: '2026-09-01',
      expiresAt: '2027-09-01 (1 Year)',
      lastUsedAt: 'Just now (from 127.0.0.1)',
      status: 'ACTIVE'
    },
    {
      id: 'key-meta-graph',
      name: 'Meta WhatsApp Cloud Graph API v21.0 Token',
      maskedKey: 'EAAB_••••••••••••••••••••••••waba',
      actualKey: 'EAABwZCe87adBA04928174920481_secure_graph_api_token_waba',
      scope: 'ADMIN_FULL',
      createdAt: '2026-10-15',
      expiresAt: 'Never (System User)',
      lastUsedAt: '4 minutes ago',
      status: 'ACTIVE'
    },
    {
      id: 'key-openai-rag',
      name: 'OpenAI Embeddings & Admissions Counsellor Key',
      maskedKey: 'sk-proj-••••••••••••••••••••••••78b1',
      actualKey: 'sk-proj-992817462104829104819284710928374650192878b1',
      scope: 'AI_READ_ONLY',
      createdAt: '2026-10-10',
      expiresAt: '2027-04-10 (6 Months)',
      lastUsedAt: '12 minutes ago',
      status: 'ACTIVE'
    },
    {
      id: 'key-webhook-internal',
      name: 'Inbound Webhook Verification Ingest Token',
      maskedKey: 'whsec_••••••••••••••••••••••••1092',
      actualKey: 'whsec_automask_webhook_verify_token_prod_1092',
      scope: 'WEBHOOK_INGEST',
      createdAt: '2026-10-20',
      expiresAt: 'Never',
      lastUsedAt: '1 minute ago',
      status: 'ACTIVE'
    }
  ]);

  const toggleVisibility = (id: string) => {
    setVisibleKeyIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Secret key copied to clipboard.');
  };

  const handleRevoke = (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke API Key "${name}"? Any integrated services using this key will immediately receive HTTP 401 Unauthorized.`)) {
      setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'REVOKED' } : k));
      showToast(`Key "${name}" has been revoked.`);
    }
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const newKey: ApiKeyItem = {
      id: `key-${Date.now().toString().slice(-6)}`,
      name: newKeyName.trim(),
      maskedKey: `automask_${newKeyScope.toLowerCase()}_••••••••${randomSuffix}`,
      actualKey: `automask_${newKeyScope.toLowerCase()}_${Date.now()}_${randomSuffix}`,
      scope: newKeyScope,
      createdAt: new Date().toISOString().substring(0, 10),
      expiresAt: `${newKeyExpiry} Days`,
      lastUsedAt: 'Never',
      status: 'ACTIVE'
    };

    setKeys(prev => [newKey, ...prev]);
    setIsCreateModalOpen(false);
    setNewKeyName('');
    showToast(`Created API Key "${newKey.name}"`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 font-['Outfit']">
                API Keys & Secret Credentials
              </h1>
              <p className="text-xs text-slate-500">
                Manage platform service tokens, Meta Cloud API app credentials, and developer SDK access keys.
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
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Key</span>
          </button>
        </div>
      </div>

      {/* Switches Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Switch 1: Zero Downtime Rotation */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Zero-Downtime Key Rotation</h4>
            <p className="text-[11px] text-slate-400">Accept both prior and new keys for a 24-hour grace window</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setZeroDowntimeRotation(!zeroDowntimeRotation);
              showToast(zeroDowntimeRotation ? 'Dual-key rotation grace period disabled' : 'Dual-key rotation grace period active');
            }}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              zeroDowntimeRotation ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                zeroDowntimeRotation ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Switch 2: IP Whitelisting */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Enforce IP Whitelisting</h4>
            <p className="text-[11px] text-slate-400">Restrict Super-Admin API keys to registered enterprise CIDR blocks</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIpWhitelisting(!ipWhitelisting);
              showToast(ipWhitelisting ? 'IP whitelisting relaxed' : 'IP whitelisting enforced for super-admin keys');
            }}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              ipWhitelisting ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                ipWhitelisting ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Keys List */}
      <div className="space-y-3">
        {keys.map(item => {
          const isVisible = !!visibleKeyIds[item.id];
          const displayKey = isVisible ? item.actualKey : item.maskedKey;

          return (
            <div 
              key={item.id}
              className={`bg-white border rounded-2xl p-5 shadow-2xs transition-all ${
                item.status === 'ACTIVE' ? 'border-slate-200/90' : 'border-rose-200 bg-rose-50/20 opacity-70'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold ${
                    item.status === 'ACTIVE' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Key className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase font-mono">
                        {item.scope}
                      </span>
                    </div>

                    {/* Key Box */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs px-3 py-1.5 rounded-xl select-all flex-1 max-w-xl truncate">
                        {displayKey}
                      </div>
                      <button
                        onClick={() => toggleVisibility(item.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        title={isVisible ? 'Hide Key' : 'Reveal Key'}
                      >
                        {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleCopy(item.id, item.actualKey)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Copy Key"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>Created: <strong>{item.createdAt}</strong></span>
                      <span>•</span>
                      <span>Expires: <strong>{item.expiresAt}</strong></span>
                      <span>•</span>
                      <span>Last used: <strong>{item.lastUsedAt}</strong></span>
                    </div>
                  </div>
                </div>

                {item.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleRevoke(item.id, item.name)}
                    className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold self-end sm:self-center"
                  >
                    Revoke Key
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Generate Key Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Generate Platform API Key</h3>
                  <p className="text-[11px] text-slate-400">Scoped programmatic credential</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Key Identifier / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kota Center Ingestion Microservice"
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Permission Scope</label>
                <select
                  value={newKeyScope}
                  onChange={e => setNewKeyScope(e.target.value as any)}
                  className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 cursor-pointer font-medium"
                >
                  <option value="ADMIN_FULL">Full Administrative Access (Read/Write)</option>
                  <option value="WEBHOOK_INGEST">Webhook Ingest Only (Meta Delivery / Message Ingestion)</option>
                  <option value="AI_READ_ONLY">AI Assistant Read-Only (RAG Similarity Queries)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Expiration Duration</label>
                <select
                  value={newKeyExpiry}
                  onChange={e => setNewKeyExpiry(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 cursor-pointer font-medium"
                >
                  <option value="30">30 Days</option>
                  <option value="90">90 Days (Recommended)</option>
                  <option value="365">1 Year</option>
                  <option value="Never">Never</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Create & Activate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
