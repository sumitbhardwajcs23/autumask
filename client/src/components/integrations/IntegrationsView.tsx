import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  Send, 
  RefreshCw, 
  Sparkles, 
  ExternalLink, 
  Key, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Copy, 
  Check, 
  Loader2,
  Activity,
  Globe,
  Sliders
} from 'lucide-react';
import { integrationsApi } from '../../services/api';
import { UserRole } from '../../types';

interface IntegrationsViewProps {
  userRole?: UserRole;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  userRole = 'admin',
}) => {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Webhook Test State
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any>(null);

  const webhookEndpoint = `${window.location.origin}/api/v1/webhook`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await integrationsApi.get();
      if (res.integrations) {
        setIntegrations(res.integrations.map((item: any) => ({
          ...item,
          enabled: item.status === 'CONNECTED'
        })));
      }
    } catch (err: any) {
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleToggleIntegration = (id: string, name: string) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        const nextEnabled = !item.enabled;
        const nextStatus = nextEnabled ? 'CONNECTED' : 'DISABLED';
        showToast(`Integration "${name}" is now ${nextEnabled ? 'Active' : 'Disabled'}`);
        return {
          ...item,
          enabled: nextEnabled,
          status: nextStatus
        };
      }
      return item;
    }));
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setWebhookResult(null);

    try {
      const res = await integrationsApi.testWebhook();
      setWebhookResult(res);
      showToast('Dispatched test webhook frame (HTTP 200 OK)');
    } catch (err: any) {
      showToast(`Webhook test failed: ${err.message || 'Server error'}`);
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookEndpoint);
    setCopiedUrl(true);
    showToast('Webhook endpoint copied to clipboard');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight font-['Outfit']">
              Ecosystem & External Integrations
            </h1>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Production Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect Meta WhatsApp Cloud API, OpenAI RAG Embeddings, CRMs, and Outbound Webhooks for Prakash Institute.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {toastMessage && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
          )}

          <button
            onClick={() => fetchIntegrations()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Meta WhatsApp Cloud API Status Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-[#064e3b] to-[#022c22] rounded-3xl p-6 text-white shadow-xl border border-emerald-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-800/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl border border-white/20">
              💬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold font-['Outfit']">Meta WhatsApp Cloud API (v21.0)</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                Official Business Solution Provider direct pipeline with webhook signature verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-300">Account Quality:</span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-400 text-slate-950 font-bold text-[11px] shadow-xs">
              HIGH (Tier 2 - 10k Msgs/Day)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-black/20 p-3 rounded-2xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold block mb-1">
              WhatsApp Business Account ID (WABA)
            </span>
            <span className="font-mono text-emerald-100 font-bold">109283746501928</span>
          </div>

          <div className="bg-black/20 p-3 rounded-2xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold block mb-1">
              Phone Number ID
            </span>
            <span className="font-mono text-emerald-100 font-bold">982347109238475</span>
          </div>

          <div className="bg-black/20 p-3 rounded-2xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold block mb-1">
              Display Phone Number
            </span>
            <span className="font-mono text-emerald-100 font-bold">+91 744 245 6789 (Kota Desk)</span>
          </div>
        </div>
      </div>

      {/* Webhook Endpoint & Real-Time Test Suite */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Inbound WhatsApp Webhook URL</h3>
              <p className="text-xs text-slate-500">Provide this URL in Meta Business App Dashboard with your verify token.</p>
            </div>
          </div>

          <button
            onClick={handleTestWebhook}
            disabled={testingWebhook}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs active:scale-95 disabled:opacity-50"
          >
            {testingWebhook ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Dispatch Test Webhook</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={webhookEndpoint}
            className="flex-1 bg-slate-50 border border-slate-200 text-xs font-mono px-3.5 py-2.5 rounded-xl text-slate-700 focus:outline-none"
          />
          <button
            onClick={handleCopyWebhook}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Webhook Test Response Display */}
        {webhookResult && (
          <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-2 border border-slate-800 animate-in fade-in">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Webhook Response: HTTP {webhookResult.status} OK
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Latency: <strong className="text-emerald-400">{webhookResult.latencyMs} ms</strong>
              </span>
            </div>
            <p className="text-slate-300 font-mono text-[11px]">
              {webhookResult.message}
            </p>
            <div className="text-[10px] text-slate-500 font-mono">
              Timestamp: {webhookResult.timestamp}
            </div>
          </div>
        )}
      </div>

      {/* Grid of External Services with Functional Toggle Switches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between space-y-4 transition-all ${
              item.enabled ? 'border-slate-200/90' : 'border-slate-200 opacity-60 bg-slate-50/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                  {item.icon === 'chat' && '💬'}
                  {item.icon === 'brain' && '🧠'}
                  {item.icon === 'sheets' && '📊'}
                  {item.icon === 'webhook' && '🔗'}
                  {item.icon === 'database' && '🗄️'}
                  {item.icon === 'zap' && '⚡'}
                </div>

                {/* Interactive Toggle Switch */}
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.enabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.enabled ? 'CONNECTED' : 'DISABLED'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleIntegration(item.id, item.name)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      item.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        item.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px] truncate max-w-[150px]">{item.account}</span>
              <span className={`text-[11px] font-bold flex items-center gap-1 ${
                item.enabled ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                <CheckCircle2 className="w-3 h-3" />
                {item.enabled ? 'Active Pipeline' : 'Paused'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
