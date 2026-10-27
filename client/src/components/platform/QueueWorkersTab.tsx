import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Activity, 
  Play, 
  Pause, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Sliders, 
  Clock, 
  Server, 
  Zap,
  Check
} from 'lucide-react';

export interface WorkerInstance {
  id: string;
  name: string;
  description: string;
  status: 'ONLINE' | 'PAUSED' | 'IDLE';
  activeJobs: number;
  completed24h: number;
  failed24h: number;
  concurrency: number;
  avgLatencyMs: number;
}

export const QueueWorkersTab: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [autoScale, setAutoScale] = useState(true);
  const [autoRetryDlq, setAutoRetryDlq] = useState(true);
  const [redisAofSync, setRedisAofSync] = useState(true);
  const [globalConcurrency, setGlobalConcurrency] = useState(10);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [workers, setWorkers] = useState<WorkerInstance[]>([
    {
      id: 'worker-1',
      name: 'Webhook Ingest & Signature Validator',
      description: 'Parses raw Meta Cloud API webhooks, verifies SHA256 HMAC, and deduplicates message IDs',
      status: 'ONLINE',
      activeJobs: 2,
      completed24h: 34120,
      failed24h: 12,
      concurrency: 8,
      avgLatencyMs: 14,
    },
    {
      id: 'worker-2',
      name: 'OpenAI RAG & Embedding Generator',
      description: 'Generates text-embedding-3-small vectors and performs pgvector similarity scoring for Kota curriculum',
      status: 'ONLINE',
      activeJobs: 1,
      completed24h: 8940,
      failed24h: 2,
      concurrency: 4,
      avgLatencyMs: 240,
    },
    {
      id: 'worker-3',
      name: 'Outbound WhatsApp Broadcast Dispatcher',
      description: 'Rate-limited burst dispatcher for approved template notifications and bulk student alerts',
      status: 'ONLINE',
      activeJobs: 4,
      completed24h: 184500,
      failed24h: 45,
      concurrency: 15,
      avgLatencyMs: 38,
    },
    {
      id: 'worker-4',
      name: 'Multi-Step Workflow DAG Processor',
      description: 'Executes condition trees, delay timers, and round-robin counsellor assignment rules',
      status: 'ONLINE',
      activeJobs: 0,
      completed24h: 12890,
      failed24h: 0,
      concurrency: 6,
      avgLatencyMs: 22,
    },
    {
      id: 'worker-5',
      name: 'Daily Analytics & Billing Aggregator',
      description: 'Aggregates tenant message usage, conversation metrics, and updates PostgreSQL usage meters',
      status: 'IDLE',
      activeJobs: 0,
      completed24h: 720,
      failed24h: 0,
      concurrency: 2,
      avgLatencyMs: 110,
    },
  ]);

  const handleToggleWorker = (workerId: string) => {
    setWorkers(prev => prev.map(w => {
      if (w.id === workerId) {
        const nextStatus = w.status === 'ONLINE' ? 'PAUSED' : 'ONLINE';
        showToast(`${w.name} is now ${nextStatus}`);
        return { ...w, status: nextStatus };
      }
      return w;
    }));
  };

  const handlePauseAll = () => {
    setWorkers(prev => prev.map(w => ({ ...w, status: 'PAUSED' })));
    showToast('All BullMQ queue workers have been paused.');
  };

  const handleResumeAll = () => {
    setWorkers(prev => prev.map(w => ({ ...w, status: 'ONLINE' })));
    showToast('All BullMQ queue workers resumed.');
  };

  const handleDrainDlq = () => {
    showToast('Dead-Letter Queue drained. 59 failed jobs queued for re-execution.');
  };

  const handleFlushCompleted = () => {
    showToast('Cleaned up 241,170 completed job keys from Redis memory store.');
  };

  const totalActive = workers.reduce((acc, w) => acc + w.activeJobs, 0);
  const totalCompleted = workers.reduce((acc, w) => acc + w.completed24h, 0);
  const totalFailed = workers.reduce((acc, w) => acc + w.failed24h, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 font-['Outfit']">
                Queue Workers & Background Engine
              </h1>
              <p className="text-xs text-slate-500">
                Distributed BullMQ queue worker cluster processing real-time webhooks, AI embeddings, and mass WhatsApp broadcasts.
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
            onClick={handleResumeAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Resume All</span>
          </button>

          <button
            onClick={handlePauseAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pause All</span>
          </button>

          <button
            onClick={handleDrainDlq}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-amber-50 text-slate-700 hover:text-amber-700 text-xs font-semibold shadow-2xs"
            title="Drain Dead-Letter Queue"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Drain DLQ</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Jobs Now</div>
          <div className="text-2xl font-black text-indigo-600 font-['Outfit']">{totalActive}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Across 5 worker threads</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Completed (24h)</div>
          <div className="text-2xl font-black text-emerald-600 font-['Outfit']">{totalCompleted.toLocaleString()}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">99.98% delivery rate</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Failed / In DLQ</div>
          <div className="text-2xl font-black text-rose-600 font-['Outfit']">{totalFailed}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Auto-retry active</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Execution Latency</div>
          <div className="text-2xl font-black text-slate-900 font-['Outfit']">28 ms</div>
          <p className="text-[10px] text-slate-400 mt-0.5">P95: 54ms</p>
        </div>
      </div>

      {/* Control Switches Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Switch 1: Auto-Scale */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Dynamic Auto-Scaling</h4>
            <p className="text-[11px] text-slate-400">Scale worker threads on queue spikes</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAutoScale(!autoScale);
              showToast(autoScale ? 'Worker auto-scaling disabled' : 'Worker auto-scaling enabled');
            }}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              autoScale ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                autoScale ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Switch 2: DLQ Auto-Retry */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Dead-Letter Auto-Retry</h4>
            <p className="text-[11px] text-slate-400">Exponential backoff for failed jobs</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAutoRetryDlq(!autoRetryDlq);
              showToast(autoRetryDlq ? 'Dead-letter auto-retry paused' : 'Dead-letter auto-retry active');
            }}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              autoRetryDlq ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                autoRetryDlq ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Switch 3: Redis AOF Sync */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Redis AOF Persistence</h4>
            <p className="text-[11px] text-slate-400">Prevent queue loss on restart</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setRedisAofSync(!redisAofSync);
              showToast(redisAofSync ? 'Redis AOF sync set to periodic' : 'Redis AOF sync set to every second');
            }}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              redisAofSync ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                redisAofSync ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Workers List */}
      <div className="space-y-3">
        {workers.map(worker => (
          <div 
            key={worker.id}
            className={`bg-white border rounded-2xl p-5 shadow-2xs transition-all ${
              worker.status === 'ONLINE' ? 'border-slate-200/90' : 'border-amber-200 bg-amber-50/20'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold ${
                  worker.status === 'ONLINE' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Zap className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-slate-900 text-sm">{worker.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      worker.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800' :
                      worker.status === 'IDLE' ? 'bg-slate-100 text-slate-700' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {worker.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{worker.description}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-600">
                    <span>Active: <strong className="text-indigo-600">{worker.activeJobs}</strong></span>
                    <span>•</span>
                    <span>Completed (24h): <strong className="text-emerald-600">{worker.completed24h.toLocaleString()}</strong></span>
                    <span>•</span>
                    <span>Failed: <strong className="text-rose-600">{worker.failed24h}</strong></span>
                    <span>•</span>
                    <span>Concurrency: <strong>{worker.concurrency} concurrent</strong></span>
                    <span>•</span>
                    <span>Avg Latency: <strong>{worker.avgLatencyMs} ms</strong></span>
                  </div>
                </div>
              </div>

              {/* Worker Toggle Switch */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-xs font-semibold text-slate-600">
                  {worker.status === 'ONLINE' ? 'Worker Active' : 'Worker Paused'}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleWorker(worker.id)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    worker.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      worker.status === 'ONLINE' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
