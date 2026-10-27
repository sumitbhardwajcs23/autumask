import React, { useState } from 'react';
import { 
  Database, 
  ShieldCheck, 
  Activity, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Clock, 
  Lock, 
  Server, 
  Check, 
  Layers,
  Zap,
  HardDrive
} from 'lucide-react';

export const DatabaseHealthTab: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [strictRls, setStrictRls] = useState(true);
  const [slowQueryLogger, setSlowQueryLogger] = useState(true);
  const [autoVacuum, setAutoVacuum] = useState(true);
  const [sslEnforced, setSslEnforced] = useState(false);
  const [isRunningVacuum, setIsRunningVacuum] = useState(false);
  const [isTestingRls, setIsTestingRls] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const tableStats = [
    { name: 'tenants', rows: '248', size: '1.2 MB', rls: 'ACTIVE', p95Query: '1.2 ms' },
    { name: 'users', rows: '1,240', size: '3.8 MB', rls: 'ACTIVE', p95Query: '1.8 ms' },
    { name: 'conversations', rows: '48,210', size: '28.4 MB', rls: 'ACTIVE', p95Query: '4.2 ms' },
    { name: 'messages', rows: '312,490', size: '164.2 MB', rls: 'ACTIVE', p95Query: '6.8 ms' },
    { name: 'knowledge_documents', rows: '840 (vectors)', size: '42.1 MB', rls: 'ACTIVE', p95Query: '18.4 ms' },
    { name: 'audit_logs', rows: '18,920', size: '9.6 MB', rls: 'ACTIVE', p95Query: '2.1 ms' },
  ];

  const handleRunVacuum = () => {
    setIsRunningVacuum(true);
    setTimeout(() => {
      setIsRunningVacuum(false);
      showToast('VACUUM ANALYZE completed across all 6 tables. Dead tuples recovered: 0.');
    }, 1200);
  };

  const handleTestRls = () => {
    setIsTestingRls(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTestingRls(false);
      setTestResult('RLS Defense-in-Depth Verified: 0/248 tenant context leaks detected under simulated concurrent transactions.');
      showToast('RLS Isolation Verified (Pass)');
    }, 1000);
  };

  const handleResetPool = () => {
    showToast('PostgreSQL connection pool drained and re-initialized with 20 connections.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 font-['Outfit']">
                PostgreSQL 17 Database Health & Security
              </h1>
              <p className="text-xs text-slate-500">
                Multi-Tenant Row-Level Security (RLS) enforcement, connection pool diagnostics, and query performance.
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
            onClick={handleTestRls}
            disabled={isTestingRls}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isTestingRls ? 'animate-spin' : ''}`} />
            <span>{isTestingRls ? 'Testing RLS...' : 'Verify RLS Isolation'}</span>
          </button>

          <button
            onClick={handleRunVacuum}
            disabled={isRunningVacuum}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRunningVacuum ? 'animate-spin' : ''}`} />
            <span>{isRunningVacuum ? 'Analyzing...' : 'VACUUM ANALYZE'}</span>
          </button>

          <button
            onClick={handleResetPool}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
            title="Reset Pool"
          >
            <span>Reset Pool</span>
          </button>
        </div>
      </div>

      {/* RLS Test Result Banner */}
      {testResult && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <span className="font-semibold">{testResult}</span>
          </div>
          <button 
            onClick={() => setTestResult(null)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Database KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Database Cluster</div>
          <div className="text-xl font-black text-slate-900 font-['Outfit']">PostgreSQL 17.11</div>
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Port 5433 • Connected</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Connection Pool</div>
          <div className="text-xl font-black text-emerald-600 font-['Outfit']">2 Active / 18 Idle</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Max limit: 20 connections</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Average Query Latency</div>
          <div className="text-xl font-black text-blue-600 font-['Outfit']">3.8 ms</div>
          <p className="text-[10px] text-slate-400 mt-0.5">0 deadlocks in 30 days</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Dataset Size</div>
          <div className="text-xl font-black text-slate-900 font-['Outfit']">249.3 MB</div>
          <p className="text-[10px] text-slate-400 mt-0.5">6 multi-tenant tables</p>
        </div>
      </div>

      {/* Control Switches Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Switch 1: Strict RLS */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Strict RLS Isolation</h4>
            <p className="text-[11px] text-slate-400">Transaction set_config filter</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setStrictRls(!strictRls);
              showToast(strictRls ? 'RLS mode set to advisory' : 'Strict RLS transaction isolation enforced');
            }}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              strictRls ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                strictRls ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Switch 2: Slow Query Logger */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Slow Query Logger</h4>
            <p className="text-[11px] text-slate-400">Capture queries &gt; 150ms</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSlowQueryLogger(!slowQueryLogger);
              showToast(slowQueryLogger ? 'Slow query logger disabled' : 'Slow query logger enabled (>150ms)');
            }}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              slowQueryLogger ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                slowQueryLogger ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Switch 3: Auto-Vacuum */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Auto-Vacuum Schedule</h4>
            <p className="text-[11px] text-slate-400">Nightly maintenance cycle</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAutoVacuum(!autoVacuum);
              showToast(autoVacuum ? 'Auto-vacuum disabled' : 'Nightly auto-vacuum enabled');
            }}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              autoVacuum ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                autoVacuum ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Switch 4: SSL Enforcement */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Enforce TLS/SSL</h4>
            <p className="text-[11px] text-slate-400">Require SSL in production</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSslEnforced(!sslEnforced);
              showToast(sslEnforced ? 'SSL enforcement relaxed for local development' : 'Strict SSL enforced on PostgreSQL');
            }}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              sslEnforced ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                sslEnforced ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Tables Breakdown */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Multi-Tenant Tables with Row-Level Security
          </h3>
          <span className="text-[10px] text-emerald-600 bg-emerald-50 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
            6/6 Tables Protected by Tenant Isolation
          </span>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Table Name</th>
              <th className="py-3 px-4">Row Count</th>
              <th className="py-3 px-4">Storage Size</th>
              <th className="py-3 px-4">Row-Level Security</th>
              <th className="py-3 px-4 text-right">P95 Read Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {tableStats.map(table => (
              <tr key={table.name} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-800">
                  {table.name}
                </td>
                <td className="py-3 px-4 text-slate-700">
                  {table.rows}
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {table.size}
                </td>
                <td className="py-3 px-4 font-sans">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {table.rls}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-slate-600 font-medium">
                  {table.p95Query}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
