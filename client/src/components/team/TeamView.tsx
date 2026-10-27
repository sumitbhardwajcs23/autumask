import React, { useState, useEffect } from 'react';
import { 
  Users2, 
  UserPlus, 
  Mail, 
  ShieldCheck, 
  Crown, 
  UserCheck, 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  X,
  Loader2,
  Clock,
  Sparkles,
  Sliders,
  Check
} from 'lucide-react';
import { User, UserRole, TabType } from '../../types';
import { teamApi, permissionsApi } from '../../services/api';
import { ALL_WORKSPACE_TABS, DEFAULT_ROLE_TABS } from '../../utils/permissionRules';

interface TeamViewProps {
  currentUserRole?: UserRole;
  currentUserId?: string;
  onUpdateMemberAllowedTabs?: (memberId: string, allowedTabs: TabType[]) => void;
}

export const TeamView: React.FC<TeamViewProps> = ({
  currentUserRole = 'admin',
  currentUserId = 'user-02',
  onUpdateMemberAllowedTabs,
}) => {
  const [team, setTeam] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'agent'>('agent');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feature Access Modal State (Owner permission controller)
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [targetMemberForAccess, setTargetMemberForAccess] = useState<User | null>(null);
  const [memberAllowedTabs, setMemberAllowedTabs] = useState<TabType[]>([]);
  const [isSavingAccess, setIsSavingAccess] = useState(false);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await teamApi.list();
      if (res.team) {
        setTeam(res.team);
      }
    } catch (err: any) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await teamApi.invite({
        fullName: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      if (res.success && res.user) {
        setTeam(prev => [...prev, res.user]);
        showNotice(`Invitation successfully sent to ${res.user.email}!`);
        setIsInviteModalOpen(false);
        setInviteName('');
        setInviteEmail('');
      }
    } catch (err: any) {
      alert(`Failed to invite team member: ${err.message || 'Server error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, name: string) => {
    try {
      const res = await teamApi.toggleStatus(id);
      if (res.success && res.user) {
        setTeam(prev => prev.map(m => m.id === id ? { ...m, ...res.user } : m));
        showNotice(`Updated ${name}'s availability status.`);
      }
    } catch (err: any) {
      alert(`Cannot toggle status: ${err.message || 'Server error'}`);
    }
  };

  const handleOpenAccessModal = (member: User) => {
    setTargetMemberForAccess(member);
    const initialTabs = member.allowedTabs || DEFAULT_ROLE_TABS[member.role] || DEFAULT_ROLE_TABS.agent;
    setMemberAllowedTabs(initialTabs);
    setIsAccessModalOpen(true);
  };

  const handleToggleTabPermission = (tabId: TabType) => {
    setMemberAllowedTabs(prev => 
      prev.includes(tabId) ? prev.filter(t => t !== tabId) : [...prev, tabId]
    );
  };

  const handleApplyPreset = (presetType: 'agent' | 'marketing' | 'workflow' | 'full') => {
    if (presetType === 'agent') {
      setMemberAllowedTabs(['dashboard', 'inbox', 'leads', 'contacts']);
    } else if (presetType === 'marketing') {
      setMemberAllowedTabs(['dashboard', 'inbox', 'leads', 'contacts', 'broadcast', 'templates', 'analytics']);
    } else if (presetType === 'workflow') {
      setMemberAllowedTabs(['dashboard', 'inbox', 'leads', 'automation', 'ai', 'workflows', 'templates']);
    } else if (presetType === 'full') {
      setMemberAllowedTabs(DEFAULT_ROLE_TABS.admin);
    }
  };

  const handleSaveMemberAccess = async () => {
    if (!targetMemberForAccess) return;
    setIsSavingAccess(true);

    try {
      setTeam(prev => prev.map(m => m.id === targetMemberForAccess.id ? { ...m, allowedTabs: memberAllowedTabs } : m));
      
      if (onUpdateMemberAllowedTabs) {
        onUpdateMemberAllowedTabs(targetMemberForAccess.id, memberAllowedTabs);
      }

      showNotice(`Updated feature permissions for ${targetMemberForAccess.fullName}!`);
      setIsAccessModalOpen(false);
    } catch (err: any) {
      alert(`Failed to save access: ${err.message || 'Server error'}`);
    } finally {
      setIsSavingAccess(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from Prakash Institute?`)) return;

    try {
      const res = await teamApi.delete(id);
      if (res.success) {
        setTeam(prev => prev.filter(m => m.id !== id));
        showNotice(`${name} has been removed from workspace.`);
      }
    } catch (err: any) {
      alert(`Cannot delete member: ${err.message || 'Server error'}`);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
            <Crown className="w-3 h-3 text-amber-500" />
            Owner
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="w-3 h-3 text-indigo-500" />
            Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
            <UserCheck className="w-3 h-3 text-emerald-600" />
            Counsellor / Agent
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight font-['Outfit']">
              Team & Staff Management
            </h1>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Users2 className="w-3 h-3 text-indigo-600" />
              {team.length} Members
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage counsellor seats, access permissions, and live WhatsApp chat routing for Prakash Institute.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTeam()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>

          {currentUserRole === 'agent' ? (
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              🔒 Read-Only for Agents
            </span>
          ) : (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Staff Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* RBAC Reference Box (SRS Section 3) */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Role-Based Access Control (RBAC) Matrix (SRS §3)</span>
          </h2>
          <span className="text-[10px] font-mono text-emerald-400">PostgreSQL Enforced</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
              <Crown className="w-3.5 h-3.5" />
              Owner (Dr. Prakash)
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Full workspace control, subscription billing, Meta API credentials, Support Grants (SRS Line 615), and staff deletion.
            </p>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <div className="font-bold text-indigo-400 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin (Sumit Bhardwaj)
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Manages Automation Rules, Knowledge Base, Demo Slots, Broadcast campaigns, and student assignments.
            </p>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
              <UserCheck className="w-3.5 h-3.5" />
              Agent / Counsellor (Priya)
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Shared WhatsApp Inbox, live student chats, Human Takeover toggle, updating lead status, and student notes.
            </p>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Counsellors & Staff Members ({team.length})</h2>
          <span className="text-xs text-slate-400">3 of 5 seats used in Pro Plan</span>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-xs">Loading team roster...</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {team.map((member) => {
              const isSelf = member.id === currentUserId;
              const isOwner = member.role === 'owner';
              const displayName = member.name || member.fullName || 'Team Member';
              const isMemberActive = member.status === 'ACTIVE' || member.isOnline;

              return (
                <div key={member.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 font-extrabold text-sm flex items-center justify-center font-['Outfit'] border border-indigo-100">
                        {displayName.charAt(0)}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        isMemberActive ? 'bg-emerald-500' : 'bg-slate-300'
                      }`} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-sm">{displayName}</h3>
                        {isSelf && (
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                            You
                          </span>
                        )}
                        {getRoleBadge(member.role)}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{member.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {currentUserRole === 'owner' && !isOwner && (
                      <button
                        onClick={() => handleOpenAccessModal(member)}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 shadow-2xs transition-colors flex items-center gap-1.5"
                        title="Owner controls which features this employee can access"
                      >
                        <Sliders className="w-3 h-3 text-indigo-500" />
                        <span>Configure Access</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleStatus(member.id, displayName)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
                        isMemberActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {isMemberActive ? '🟢 Online' : '⚪ Offline'}
                    </button>

                    {!isOwner && !isSelf && currentUserRole !== 'agent' && (
                      <button
                        onClick={() => handleDelete(member.id, displayName)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feature Access Configuration Modal (Owner Super-Power) */}
      {isAccessModalOpen && targetMemberForAccess && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-['Outfit']">
                    Configure Feature Permissions: {targetMemberForAccess.fullName}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Only checked tabs will be clickable in their sidebar. Unchecked tabs will be disabled with a lock icon.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAccessModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Access Presets */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Quick Role Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('agent')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-slate-700"
                >
                  Standard Counsellor
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('marketing')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-slate-700"
                >
                  Marketing & Broadcast
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('workflow')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 hover:border-purple-400 text-slate-700"
                >
                  Automations & Workflows
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('full')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-slate-700"
                >
                  Full Admin (All Features)
                </button>
              </div>
            </div>

            {/* Feature Checkboxes List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 divide-y divide-slate-100 max-h-72">
              {ALL_WORKSPACE_TABS
                .filter(tab => tab.id !== 'billing' && tab.id !== 'roles') // Billing & Roles are strictly Owner-exclusive
                .map(tab => {
                  const isChecked = memberAllowedTabs.includes(tab.id);

                  return (
                    <label
                      key={tab.id}
                      className={`flex items-start justify-between p-2.5 rounded-xl transition-colors cursor-pointer ${
                        isChecked ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="pr-3">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>{tab.label}</span>
                          {isChecked && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 rounded font-bold">
                              Enabled
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {tab.description}
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleTabPermission(tab.id)}
                        className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                      />
                    </label>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3">
              <span className="text-xs text-slate-500 font-mono">
                {memberAllowedTabs.length} features granted
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAccessModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMemberAccess}
                  disabled={isSavingAccess}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isSavingAccess && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Member Access</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-['Outfit']">Invite Counsellor</h3>
                  <p className="text-[11px] text-slate-500">Add an agent or admin to handle student WhatsApp chats.</p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="rahul@prakashkota.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Workspace Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium bg-slate-50"
                >
                  <option value="agent">Counsellor / Agent (Shared Inbox, Chat, Leads)</option>
                  <option value="admin">Admin (All workflows, Automation, RAG, Slots)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Send Workspace Invite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
