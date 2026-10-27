import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Clock, 
  User, 
  RefreshCw, 
  Search, 
  Filter, 
  Activity, 
  CheckCircle2, 
  Lock,
  Tag
} from 'lucide-react';
import { AuditLogItem, UserRole } from '../../types';
import { auditLogsApi } from '../../services/api';

interface AuditLogsViewProps {
  userRole?: UserRole;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ userRole = 'admin' }) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await auditLogsApi.list();
      if (res.logs) {
        setLogs(res.logs);
      }
    } catch (err: any) {
      console.warn('Failed to load audit logs:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAction = actionFilter === 'all' || log.action.toLowerCase().includes(actionFilter.toLowerCase());
    return matchSearch && matchAction;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 p-0.5 shadow-md flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight font-['Outfit'] flex items-center gap-2">
                Workspace Audit Trail & Security Logs
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                  Immutable Record
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Track all administrative actions, permission overrides, campaign launches, and authentication events.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadLogs}
          className="p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by actor, action, or resource..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Action Filter:</span>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="all">All Actions</option>
            <option value="permission">Permissions & Overrides</option>
            <option value="role">Roles Modified</option>
            <option value="campaign">Broadcast Campaigns</option>
            <option value="workflow">Workflow Changes</option>
            <option value="support">Support Grants</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Target Resource</th>
              <th className="py-3 px-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length > 0 ? (
              filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                        {log.actorName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{log.actorName}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{log.actorRole}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-medium">{log.resourceType}</div>
                    {log.resourceId && (
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs">
                        {log.resourceId}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-semibold">No audit logs matching current filter</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
