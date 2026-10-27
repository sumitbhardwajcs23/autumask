import React, { useState } from 'react';
import { 
  Terminal, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  RotateCw, 
  Download, 
  Trash2,
  Clock,
  ShieldCheck,
  Send,
  Sliders,
  Check,
  Copy,
  ChevronRight,
  X
} from 'lucide-react';

export interface WebhookLogEntry {
  id: string;
  timestamp: string;
  event: 'messages' | 'message_deliveries' | 'message_reads' | 'template_status' | 'errors';
  wabaId: string;
  senderPhone: string;
  recipientPhone: string;
  statusCode: number;
  latencyMs: number;
  signatureVerified: boolean;
  rawPayload: any;
  responseBody: string;
}

export const WebhookLogsTab: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | '200' | '401' | '500'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<WebhookLogEntry | null>(null);
  const [isLiveTail, setIsLiveTail] = useState(true);
  const [strictHmac, setStrictHmac] = useState(true);
  const [logFullPayloads, setLogFullPayloads] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [logs, setLogs] = useState<WebhookLogEntry[]>([
    {
      id: 'wh-log-90812',
      timestamp: '2026-10-25 21:20:14',
      event: 'messages',
      wabaId: '109283746501928',
      senderPhone: '+91 98765 43210',
      recipientPhone: '+91 744 245 6789',
      statusCode: 200,
      latencyMs: 42,
      signatureVerified: true,
      rawPayload: {
        object: 'whatsapp_business_account',
        entry: [{
          id: '109283746501928',
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '+91 744 245 6789', phone_number_id: '982347109238475' },
              contacts: [{ profile: { name: 'Aditya Kumar' }, wa_id: '919876543210' }],
              messages: [{
                from: '919876543210',
                id: 'wamid.HBgMOTE5ODc2NTQzMjEwFQIAEhgUM0EBNDgwOTg4MzdBRjNDODkyM0EA',
                timestamp: '1792945214',
                text: { body: 'What are the batch timings for JEE Droppers 2027?' },
                type: 'text'
              }]
            },
            field: 'messages'
          }]
        }]
      },
      responseBody: '{"status":"QUEUED","jobId":"job_91283"}'
    },
    {
      id: 'wh-log-90811',
      timestamp: '2026-10-25 21:18:50',
      event: 'message_deliveries',
      wabaId: '109283746501928',
      senderPhone: '+91 744 245 6789',
      recipientPhone: '+91 98112 87654',
      statusCode: 200,
      latencyMs: 28,
      signatureVerified: true,
      rawPayload: {
        object: 'whatsapp_business_account',
        entry: [{
          changes: [{
            value: {
              statuses: [{ id: 'wamid.HBgMOTE...', status: 'delivered', timestamp: '1792945130' }]
            }
          }]
        }]
      },
      responseBody: '{"status":"PROCESSED"}'
    },
    {
      id: 'wh-log-90810',
      timestamp: '2026-10-25 21:15:22',
      event: 'message_reads',
      wabaId: '109283746501928',
      senderPhone: '+91 744 245 6789',
      recipientPhone: '+91 98223 11223',
      statusCode: 200,
      latencyMs: 19,
      signatureVerified: true,
      rawPayload: {
        object: 'whatsapp_business_account',
        entry: [{
          changes: [{
            value: {
              statuses: [{ id: 'wamid.HBgMOTE...', status: 'read', timestamp: '1792944922' }]
            }
          }]
        }]
      },
      responseBody: '{"status":"PROCESSED"}'
    },
    {
      id: 'wh-log-90809',
      timestamp: '2026-10-25 21:09:41',
      event: 'errors',
      wabaId: '109283746501928',
      senderPhone: '+91 99999 88888',
      recipientPhone: '+91 744 245 6789',
      statusCode: 401,
      latencyMs: 8,
      signatureVerified: false,
      rawPayload: {
        error: 'Invalid HMAC SHA256 Signature header x-hub-signature-256 mismatch'
      },
      responseBody: '{"error":"Unauthorized signature verification failure"}'
    },
    {
      id: 'wh-log-90808',
      timestamp: '2026-10-25 20:54:10',
      event: 'template_status',
      wabaId: '109283746501928',
      senderPhone: 'Meta System',
      recipientPhone: 'Prakash Institute',
      statusCode: 200,
      latencyMs: 65,
      signatureVerified: true,
      rawPayload: {
        event: 'message_template_status_update',
        message_template_name: 'kota_jee_scholarship_admit_card',
        event_status: 'APPROVED'
      },
      responseBody: '{"status":"TEMPLATE_SYNCED"}'
    }
  ]);

  const handleSimulateWebhook = () => {
    const newEntry: WebhookLogEntry = {
      id: `wh-log-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      event: 'messages',
      wabaId: '109283746501928',
      senderPhone: '+91 98101 22334',
      recipientPhone: '+91 744 245 6789',
      statusCode: 200,
      latencyMs: Math.floor(20 + Math.random() * 40),
      signatureVerified: true,
      rawPayload: {
        object: 'whatsapp_business_account',
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '919810122334',
                id: `wamid.SIMULATED_${Date.now()}`,
                text: { body: 'Simulated inquiry: Please send fee structure brochure for NEET batch.' }
              }]
            }
          }]
        }]
      },
      responseBody: '{"status":"QUEUED","pipeline":"INGESTED_TO_BULLMQ"}'
    };

    setLogs(prev => [newEntry, ...prev]);
    showToast('Simulated Meta WhatsApp webhook dispatched successfully!');
  };

  const handleRetryWebhook = (id: string) => {
    setRetryingId(id);
    setTimeout(() => {
      setRetryingId(null);
      setLogs(prev => prev.map(l => l.id === id ? { ...l, statusCode: 200, signatureVerified: true } : l));
      showToast(`Webhook ${id} re-delivered and processed (HTTP 200 OK)`);
    }, 700);
  };

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to purge historical webhook telemetry logs?')) {
      setLogs([]);
      showToast('Webhook telemetry logs cleared.');
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `automask_webhook_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Webhook telemetry logs exported.');
  };

  const filteredLogs = logs.filter(log => {
    if (filterStatus === '200' && log.statusCode !== 200) return false;
    if (filterStatus === '401' && log.statusCode !== 401) return false;
    if (filterStatus === '500' && log.statusCode < 500) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.id.toLowerCase().includes(q) ||
        log.senderPhone.toLowerCase().includes(q) ||
        log.event.toLowerCase().includes(q) ||
        JSON.stringify(log.rawPayload).toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 font-['Outfit']">
                Webhook Logs & Telemetry Inspector
              </h1>
              <p className="text-xs text-slate-500">
                Live stream of Meta WhatsApp Cloud API webhooks with HMAC SHA256 verification status and raw payload tracing.
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
            onClick={handleSimulateWebhook}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Simulate Incoming Webhook</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
            title="Export JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClearLogs}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 shadow-2xs"
            title="Clear Logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Switches & Diagnostics Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Switch 1: Live Polling Tail */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Live Telemetry Tail</h4>
            <p className="text-[11px] text-slate-400">Auto-refresh incoming events</p>
          </div>
          <button
            type="button"
            onClick={() => setIsLiveTail(!isLiveTail)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isLiveTail ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isLiveTail ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Switch 2: Strict HMAC */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Strict SHA256 HMAC</h4>
            <p className="text-[11px] text-slate-400">Reject unsigned webhook frames</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setStrictHmac(!strictHmac);
              showToast(strictHmac ? 'HMAC validation relaxed for sandbox' : 'Strict HMAC validation enforced');
            }}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              strictHmac ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                strictHmac ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Switch 3: Log Full Payloads */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Log Raw JSON Bodies</h4>
            <p className="text-[11px] text-slate-400">Capture complete Meta payload</p>
          </div>
          <button
            type="button"
            onClick={() => setLogFullPayloads(!logFullPayloads)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              logFullPayloads ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                logFullPayloads ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Phone, ID, or payload text..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs rounded-xl pl-9 pr-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-medium self-stretch sm:self-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1 rounded-lg transition-colors ${filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
          >
            All ({logs.length})
          </button>
          <button
            onClick={() => setFilterStatus('200')}
            className={`px-3 py-1 rounded-lg transition-colors ${filterStatus === '200' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
          >
            200 OK
          </button>
          <button
            onClick={() => setFilterStatus('401')}
            className={`px-3 py-1 rounded-lg transition-colors ${filterStatus === '401' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
          >
            401 Invalid
          </button>
          <button
            onClick={() => setFilterStatus('500')}
            className={`px-3 py-1 rounded-lg transition-colors ${filterStatus === '500' ? 'bg-white text-rose-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
          >
            500 Error
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Log ID & Timestamp</th>
              <th className="py-3 px-4">Event Type</th>
              <th className="py-3 px-4">Sender Phone</th>
              <th className="py-3 px-4">Status & HMAC</th>
              <th className="py-3 px-4">Latency</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-800">{log.id}</div>
                  <div className="text-[10px] text-slate-400 font-sans">{log.timestamp}</div>
                </td>

                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-sans uppercase ${
                    log.event === 'messages' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    log.event === 'template_status' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    log.event === 'errors' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {log.event.replace('_', ' ')}
                  </span>
                </td>

                <td className="py-3 px-4 text-slate-700 font-medium">
                  {log.senderPhone}
                </td>

                <td className="py-3 px-4 font-sans">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      log.statusCode === 200 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      log.statusCode === 401 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      HTTP {log.statusCode}
                    </span>
                    {log.signatureVerified ? (
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5" title="HMAC Valid">
                        <ShieldCheck className="w-3 h-3" />
                        Valid
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-0.5" title="HMAC Failed">
                        <AlertTriangle className="w-3 h-3" />
                        Invalid
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-3 px-4 text-slate-600">
                  {log.latencyMs} ms
                </td>

                <td className="py-3 px-4 text-right font-sans">
                  <div className="flex items-center justify-end gap-1.5">
                    {log.statusCode !== 200 && (
                      <button
                        onClick={() => handleRetryWebhook(log.id)}
                        disabled={retryingId === log.id}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <RotateCw className={`w-3 h-3 ${retryingId === log.id ? 'animate-spin' : ''}`} />
                        <span>Retry</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payload Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Webhook Payload Inspector: {selectedLog.id}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Received {selectedLog.timestamp} • Latency {selectedLog.latencyMs}ms
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl overflow-x-auto border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-sans font-bold mb-2">
                  Meta Request Payload:
                </div>
                <pre>{JSON.stringify(selectedLog.rawPayload, null, 2)}</pre>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-800">
                <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block mb-1">
                  API Response Body:
                </span>
                <pre>{selectedLog.responseBody}</pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedLog.rawPayload, null, 2));
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copied Payload!' : 'Copy Payload'}</span>
              </button>

              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
