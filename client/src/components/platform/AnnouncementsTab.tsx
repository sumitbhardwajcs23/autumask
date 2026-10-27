import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Clock, 
  Radio, 
  X,
  Sliders,
  Bell
} from 'lucide-react';

export interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'MAINTENANCE' | 'CRITICAL';
  target: 'ALL_TENANTS' | 'FREE_TIER' | 'PRO_ENTERPRISE';
  publishedAt: string;
  isActive: boolean;
  dismissible: boolean;
}

export const AnnouncementsTab: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newSeverity, setNewSeverity] = useState<'INFO' | 'MAINTENANCE' | 'CRITICAL'>('INFO');
  const [newTarget, setNewTarget] = useState<'ALL_TENANTS' | 'FREE_TIER' | 'PRO_ENTERPRISE'>('ALL_TENANTS');
  const [newDismissible, setNewDismissible] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([
    {
      id: 'ann-1',
      title: 'Meta WhatsApp Graph API v21.0 Upgrade Complete',
      message: 'All tenant WABA pipelines have been migrated to Meta Graph API v21.0 with zero delivery interruption. Enhanced read receipt latency is now active.',
      severity: 'INFO',
      target: 'ALL_TENANTS',
      publishedAt: '2026-10-24 18:00',
      isActive: true,
      dismissible: true
    },
    {
      id: 'ann-2',
      title: 'Scheduled PostgreSQL Index Optimization (Oct 28, 02:00 IST)',
      message: 'We will be applying hot-reload pgvector index maintenance on Tuesday at 02:00 AM IST. Broadcast jobs scheduled during this 10-minute window will automatically queue without loss.',
      severity: 'MAINTENANCE',
      target: 'ALL_TENANTS',
      publishedAt: '2026-10-23 12:30',
      isActive: true,
      dismissible: true
    },
    {
      id: 'ann-3',
      title: 'Diwali Festive Broadcast Quota Doubled for Pro & Enterprise',
      message: 'Coaching institutes on Pro & Enterprise plans now have 2x free template messages credited for Diwali admission announcements and scholarship campaigns.',
      severity: 'INFO',
      target: 'PRO_ENTERPRISE',
      publishedAt: '2026-10-20 09:15',
      isActive: false,
      dismissible: true
    }
  ]);

  const handleToggleActive = (id: string) => {
    setAnnouncements(prev => prev.map(a => {
      if (a.id === id) {
        const nextState = !a.isActive;
        showToast(`Announcement "${a.title}" is now ${nextState ? 'Active on tenant dashboards' : 'Inactive'}`);
        return { ...a, isActive: nextState };
      }
      return a;
    }));
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete announcement "${title}"?`)) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      showToast(`Announcement deleted.`);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    const newAnnouncement: AnnouncementItem = {
      id: `ann-${Date.now().toString().slice(-4)}`,
      title: newTitle.trim(),
      message: newMessage.trim(),
      severity: newSeverity,
      target: newTarget,
      publishedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isActive: true,
      dismissible: newDismissible
    };

    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewMessage('');
    showToast(`Published announcement "${newAnnouncement.title}"!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 font-['Outfit']">
                Tenant Announcements & Maintenance Banners
              </h1>
              <p className="text-xs text-slate-500">
                Broadcast system notifications, scheduled maintenance warnings, and release announcements to client institute dashboards.
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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Announcement</span>
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3.5">
        {announcements.map(item => (
          <div 
            key={item.id}
            className={`bg-white border rounded-2xl p-5 shadow-2xs transition-all ${
              item.isActive ? 'border-slate-200/90' : 'border-slate-200 bg-slate-50/50 opacity-65'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold ${
                  item.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                  item.severity === 'MAINTENANCE' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                  'bg-blue-50 text-blue-600 border border-blue-200'
                }`}>
                  {item.severity === 'CRITICAL' ? <AlertTriangle className="w-5 h-5" /> :
                   item.severity === 'MAINTENANCE' ? <Clock className="w-5 h-5" /> :
                   <Info className="w-5 h-5" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                      item.severity === 'MAINTENANCE' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600">
                      Target: {item.target.replace('_', ' ')}
                    </span>
                    {item.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        LIVE
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-sans">{item.message}</p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>Published: {item.publishedAt}</span>
                    <span>•</span>
                    <span>{item.dismissible ? 'Student/Staff Dismissible' : 'Persistent Banner'}</span>
                  </div>
                </div>
              </div>

              {/* Action and Switch */}
              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">
                    {item.isActive ? 'Active' : 'Draft'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item.id)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      item.isActive ? 'bg-purple-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        item.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Announcement Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Broadcast Announcement</h3>
                  <p className="text-[11px] text-slate-400">Pushes top banner to client institute workspaces</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Banner Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meta Cloud API WhatsApp Template Update Notice"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Detailed Message Body *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what institute staff and admins need to know..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={e => setNewSeverity(e.target.value as any)}
                    className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="INFO">Information (Blue)</option>
                    <option value="MAINTENANCE">Scheduled Maintenance (Amber)</option>
                    <option value="CRITICAL">Critical Alert (Red)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Audience Scope</label>
                  <select
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value as any)}
                    className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="ALL_TENANTS">All 248 Institute Workspaces</option>
                    <option value="FREE_TIER">Starter / Free Tier Only</option>
                    <option value="PRO_ENTERPRISE">Pro & Enterprise Tiers Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="dismissCheck"
                  checked={newDismissible}
                  onChange={e => setNewDismissible(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="dismissCheck" className="text-slate-600 cursor-pointer">
                  Allow institute admins to dismiss this banner
                </label>
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Publish to Workspaces
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
