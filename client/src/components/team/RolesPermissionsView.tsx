import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Crown, 
  Lock, 
  Plus, 
  Check, 
  X, 
  AlertTriangle, 
  UserCheck, 
  UserX, 
  Sliders, 
  Eye, 
  Edit3, 
  Trash2, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  FileText, 
  Key, 
  Database,
  ArrowRight,
  Info
} from 'lucide-react';
import { User, UserRole, CustomRole, PermissionItem, UserPermissionOverride, ResourceAccessScope } from '../../types';
import { permissionsApi, teamApi } from '../../services/api';

interface RolesPermissionsViewProps {
  currentUserRole?: UserRole;
  currentUserId?: string;
  onRefreshTeam?: () => void;
}

export const RolesPermissionsView: React.FC<RolesPermissionsViewProps> = ({
  currentUserRole = 'owner',
  currentUserId = 'usr-owner-01',
  onRefreshTeam,
}) => {
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'ROLES_MATRIX' | 'SCOPES'>('MEMBERS');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Core Data
  const [team, setTeam] = useState<User[]>([]);
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [permissionModules, setPermissionModules] = useState<Record<string, string[]>>({});
  const [permissionRegistry, setPermissionRegistry] = useState<PermissionItem[]>([]);
  const [searchMember, setSearchMember] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  // Member Permission Overrides Modal State
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [memberOverrides, setMemberOverrides] = useState<UserPermissionOverride[]>([]);
  const [memberScope, setMemberScope] = useState<'all' | 'assigned_only'>('all');
  const [memberAssignedRole, setMemberAssignedRole] = useState<UserRole>('agent');
  const [memberCustomRoleId, setMemberCustomRoleId] = useState<string>('');
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [savingOverrides, setSavingOverrides] = useState(false);

  // Custom Role Drawer/Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [roleColor, setRoleColor] = useState('#10b981');
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [savingRole, setSavingRole] = useState(false);

  const isOwner = currentUserRole === 'owner';

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [regRes, rolesRes, teamRes] = await Promise.all([
        permissionsApi.getRegistry().catch(() => ({ modules: {}, permissions: [], count: 0 })),
        permissionsApi.listRoles().catch(() => ({ roles: [] })),
        teamApi.list().catch(() => ({ team: [] })),
      ]);

      if (regRes.modules) setPermissionModules(regRes.modules);
      if (regRes.permissions) setPermissionRegistry(regRes.permissions);
      if (rolesRes.roles) setRoles(rolesRes.roles);
      if (teamRes.team) setTeam(teamRes.team);
    } catch (err) {
      console.error('Failed to load permissions data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Member Overrides Modal
  const handleOpenMemberOverrides = async (member: User) => {
    setSelectedMember(member);
    setMemberAssignedRole(member.role);
    setMemberCustomRoleId(member.customRoleId || '');
    setIsOverrideModalOpen(true);

    try {
      const res = await permissionsApi.getMemberPermissions(member.id);
      if (res.overrides) setMemberOverrides(res.overrides);
      if (res.resourceScope) setMemberScope(res.resourceScope.scope);
      if (res.role) setMemberAssignedRole(res.role as UserRole);
      if (res.customRole) setMemberCustomRoleId(res.customRole.id);
    } catch (err: any) {
      console.warn('Failed to fetch detailed member overrides:', err?.message);
    }
  };

  // Toggle explicit grant or deny
  const handleToggleOverride = (permKey: string, currentStatus: 'granted' | 'denied' | 'default') => {
    setMemberOverrides(prev => {
      const filtered = prev.filter(o => o.permissionKey !== permKey);
      if (currentStatus === 'default') {
        // Switch to explicit GRANT
        return [...filtered, { permissionKey: permKey, granted: true }];
      } else if (currentStatus === 'granted') {
        // Switch to explicit DENY
        return [...filtered, { permissionKey: permKey, granted: false }];
      } else {
        // Switch back to Default (inherit from role)
        return filtered;
      }
    });
  };

  // Save Member Overrides
  const handleSaveMemberOverrides = async () => {
    if (!selectedMember) return;
    setSavingOverrides(true);

    try {
      const grants = memberOverrides.filter(o => o.granted).map(o => o.permissionKey);
      const denies = memberOverrides.filter(o => !o.granted).map(o => o.permissionKey);

      await permissionsApi.updateMemberPermissions(selectedMember.id, {
        role: memberAssignedRole,
        customRoleId: memberCustomRoleId ? memberCustomRoleId : null,
        grants,
        denies,
        resourceScope: { scope: memberScope },
      });

      showNotice(`Successfully updated security policy for ${selectedMember.fullName}!`);
      setIsOverrideModalOpen(false);
      loadData();
      if (onRefreshTeam) onRefreshTeam();
    } catch (err: any) {
      alert(`Failed to save permission policy: ${err?.message || 'Server error'}`);
    } finally {
      setSavingOverrides(false);
    }
  };

  // Suspend or Activate Member
  const handleToggleSuspension = async (member: User) => {
    const isSuspended = member.status === 'SUSPENDED';
    const actionWord = isSuspended ? 'reactivate' : 'suspend';
    if (!confirm(`Are you sure you want to ${actionWord} ${member.fullName}? ${!isSuspended ? 'All their active sessions and API permissions will be revoked immediately.' : ''}`)) return;

    try {
      const res = await permissionsApi.suspendMember(member.id, !isSuspended);
      showNotice(res.message);
      setTeam(prev => prev.map(m => m.id === member.id ? { ...m, status: res.status } : m));
    } catch (err: any) {
      alert(`Cannot update suspension state: ${err?.message || 'Server error'}`);
    }
  };

  // Open Role Modal (New or Edit)
  const handleOpenRoleModal = (roleToEdit?: CustomRole) => {
    if (roleToEdit) {
      setEditingRole(roleToEdit);
      setRoleName(roleToEdit.name);
      setRoleDesc(roleToEdit.description || '');
      setRoleColor(roleToEdit.color || '#10b981');
      setRolePermissions([...roleToEdit.permissions]);
    } else {
      setEditingRole(null);
      setRoleName('');
      setRoleDesc('');
      setRoleColor('#6366f1');
      setRolePermissions([]);
    }
    setIsRoleModalOpen(true);
  };

  // Toggle permission in role editor
  const handleToggleRolePermission = (permKey: string) => {
    setRolePermissions(prev => 
      prev.includes(permKey) ? prev.filter(k => k !== permKey) : [...prev, permKey]
    );
  };

  // Select all in a module
  const handleSelectAllInModule = (moduleKey: string) => {
    const modulePerms = permissionModules[moduleKey] || [];
    const allSelected = modulePerms.every(k => rolePermissions.includes(k));

    if (allSelected) {
      setRolePermissions(prev => prev.filter(k => !modulePerms.includes(k)));
    } else {
      setRolePermissions(prev => Array.from(new Set([...prev, ...modulePerms])));
    }
  };

  // Save Role
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    setSavingRole(true);
    try {
      if (editingRole) {
        await permissionsApi.updateRole(editingRole.id, {
          name: roleName.trim(),
          description: roleDesc.trim(),
          permissions: rolePermissions,
          color: roleColor,
        });
        showNotice(`Updated role "${roleName}" successfully.`);
      } else {
        await permissionsApi.createRole({
          name: roleName.trim(),
          description: roleDesc.trim(),
          permissions: rolePermissions,
          color: roleColor,
        });
        showNotice(`Created new role "${roleName}".`);
      }
      setIsRoleModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(`Failed to save role: ${err?.message || 'Server error'}`);
    } finally {
      setSavingRole(false);
    }
  };

  // Delete Role
  const handleDeleteRole = async (roleId: string, roleTitle: string) => {
    if (!confirm(`Are you sure you want to delete role "${roleTitle}"? Team members assigned to this role will revert to their base system role.`)) return;
    try {
      await permissionsApi.deleteRole(roleId);
      showNotice(`Role "${roleTitle}" deleted.`);
      loadData();
    } catch (err: any) {
      alert(`Cannot delete role: ${err?.message || 'Server error'}`);
    }
  };

  const filteredTeam = team.filter(m => {
    const matchSearch = m.fullName.toLowerCase().includes(searchMember.toLowerCase()) || 
                        m.email.toLowerCase().includes(searchMember.toLowerCase());
    const matchRole = selectedRoleFilter === 'all' || m.role === selectedRoleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="w-full px-6 sm:px-8 lg:px-10 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-['Outfit'] flex items-center gap-3">
                Roles & Granular Permissions
                <span className="text-xs font-black bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                  PBAC Engine
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 mt-1.5 font-normal">
                Configure role templates, member-specific overrides, and assigned-only conversation scopes.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {actionNotice && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{actionNotice}</span>
            </div>
          )}

          {isOwner && (
            <button
              onClick={() => handleOpenRoleModal()}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Role</span>
            </button>
          )}

          <button
            onClick={loadData}
            className="p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('MEMBERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'MEMBERS'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Team Members & Overrides ({team.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ROLES_MATRIX')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ROLES_MATRIX'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Custom Roles & Matrix ({roles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SCOPES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'SCOPES'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Resource Access Scopes</span>
        </button>
      </div>

      {/* Tab 1: Team Members & Granular Overrides */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by counsellor name or email..."
                value={searchMember}
                onChange={e => setSearchMember(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium">Filter Role:</span>
              <select
                value={selectedRoleFilter}
                onChange={e => setSelectedRoleFilter(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50 font-medium text-slate-700"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="agent">Agent / Counsellor</option>
                <option value="analyst">Analyst</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Base System Role</th>
                  <th className="py-3 px-4">Custom Role</th>
                  <th className="py-3 px-4">Conversation Scope</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeam.map(member => {
                  const isMemberOwner = member.role === 'owner';
                  const isSuspended = member.status === 'SUSPENDED';

                  return (
                    <tr key={member.id} className={`hover:bg-slate-50/50 transition-colors ${isSuspended ? 'bg-rose-50/30' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isMemberOwner 
                              ? 'bg-amber-100 text-amber-700 border border-amber-300' 
                              : isSuspended
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}>
                            {isMemberOwner ? <Crown className="w-4 h-4 text-amber-600" /> : member.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              {member.fullName}
                              {member.id === currentUserId && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">You</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{member.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          member.role === 'owner' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          member.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          member.role === 'manager' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                          member.role === 'analyst' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {member.role}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {member.customRoleName ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                            <Sparkles className="w-3 h-3 text-violet-500" />
                            {member.customRoleName}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">None (Default)</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          member.role === 'agent' 
                            ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {member.role === 'agent' ? '🔒 Assigned Only' : '🌐 All Workspace'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                            <UserX className="w-3 h-3" />
                            Suspended (Revoked)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isOwner && !isMemberOwner && (
                            <>
                              <button
                                onClick={() => handleOpenMemberOverrides(member)}
                                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors"
                                title="Edit granular permission overrides"
                              >
                                <Sliders className="w-3 h-3 text-slate-500" />
                                <span>Edit Overrides</span>
                              </button>

                              <button
                                onClick={() => handleToggleSuspension(member)}
                                className={`p-1.5 rounded-lg border text-[11px] transition-colors ${
                                  isSuspended 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                                }`}
                                title={isSuspended ? 'Reactivate Account' : 'Instant Revocation & Suspend'}
                              >
                                {isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                              </button>
                            </>
                          )}
                          {!isOwner && (
                            <span className="text-[10px] text-slate-400 italic">Owner managed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Custom Roles & Permission Matrix */}
      {activeTab === 'ROLES_MATRIX' && (
        <div className="space-y-6">
          {/* Roles Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800 font-['Outfit']">
                Active Custom Roles ({roles.length})
              </h2>
              <span className="text-[11px] text-slate-400">
                Custom roles define bundled permissions assignable to multiple employees
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map(r => (
                <div key={r.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: r.color || '#10b981' }} 
                        />
                        <h3 className="font-bold text-slate-800 text-sm font-['Outfit']">
                          {r.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                        {r.permissions.length} perms
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                      {r.description || 'No description provided.'}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3 max-h-20 overflow-y-auto">
                      {r.permissions.slice(0, 5).map(p => (
                        <span key={p} className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">
                          {p.split('.').slice(1).join('.')}
                        </span>
                      ))}
                      {r.permissions.length > 5 && (
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                          +{r.permissions.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {isOwner && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenRoleModal(r)}
                        className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 rounded hover:bg-slate-50 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3 text-slate-400" />
                        Edit Role
                      </button>
                      <button
                        onClick={() => handleDeleteRole(r.id, r.name)}
                        className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded hover:bg-rose-50 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Complete 17-Module Permission Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-['Outfit'] flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  Granular Permission Registry (17 Security Modules)
                </h3>
                <p className="text-xs text-slate-500">
                  Every action in AutoMask is enforced at the controller level with fail-closed RBAC policies.
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                Total Keys: {permissionRegistry.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(permissionModules).map(([modName, keys]) => {
                const isSupportModule = modName === 'support_grants';

                return (
                  <div key={modName} className={`rounded-xl p-3.5 border ${
                    isSupportModule 
                      ? 'bg-amber-50/60 border-amber-200' 
                      : 'bg-slate-50/60 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isSupportModule ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                          {modName.replace('_', ' ')}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {keys.length} actions
                      </span>
                    </div>

                    {isSupportModule && (
                      <p className="text-[10px] text-amber-700 bg-amber-100/60 p-1.5 rounded-lg mb-2 flex items-center gap-1 font-medium">
                        <Lock className="w-3 h-3 shrink-0" />
                        SRS Line 615: Strictly Owner-only grant isolation.
                      </p>
                    )}

                    <div className="space-y-1">
                      {keys.map(k => {
                        const item = permissionRegistry.find(p => p.key === k);
                        return (
                          <div key={k} className="flex items-center justify-between text-[11px] py-0.5 border-b border-slate-100/80 last:border-0">
                            <span className="font-mono text-slate-700 truncate" title={k}>
                              {k.split('.').slice(1).join('.')}
                            </span>
                            <span className="text-[9px] text-slate-400 capitalize">
                              {item?.action || 'execute'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Resource Scopes */}
      {activeTab === 'SCOPES' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 font-['Outfit'] mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              Resource-Level Access Scoping (Assigned vs All)
            </h3>
            <p className="text-xs text-slate-500 mb-4 max-w-2xl leading-relaxed">
              When an employee is configured with <strong className="text-slate-800">Assigned Only</strong> scope, they cannot see or reply to WhatsApp conversations belonging to other team members. The backend strictly filters database queries and blocks unauthorized conversation IDs at the HTTP controller level.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    🌐
                  </div>
                  <h4 className="font-bold text-xs text-emerald-950 font-['Outfit']">
                    Scope: All Workspace Resources
                  </h4>
                </div>
                <p className="text-xs text-emerald-800 mb-3 leading-relaxed">
                  Default for Owners, Admins, and Managers. Allows full visibility across all coaching batches, student chats, leads, and analytics.
                </p>
                <div className="text-[11px] text-emerald-700 bg-white/80 p-2 rounded-lg border border-emerald-200 font-mono">
                  GET /api/v1/conversations → Returns all active workspace conversations.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                    🔒
                  </div>
                  <h4 className="font-bold text-xs text-amber-950 font-['Outfit']">
                    Scope: Assigned Only (Least Privilege)
                  </h4>
                </div>
                <p className="text-xs text-amber-800 mb-3 leading-relaxed">
                  Standard for Counsellor / Agent accounts. Prevents lead theft and student privacy leaks across counselling counselors.
                </p>
                <div className="text-[11px] text-amber-800 bg-white/80 p-2 rounded-lg border border-amber-200 font-mono">
                  GET /api/v1/conversations → Strictly filtered to assigned_to = user.id.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Overrides Modal */}
      {isOverrideModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-['Outfit']">
                    Member Security Policy: {selectedMember.fullName}
                  </h3>
                  <p className="text-[11px] text-slate-500">{selectedMember.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Base System Role</label>
                  <select
                    value={memberAssignedRole}
                    onChange={e => setMemberAssignedRole(e.target.value as UserRole)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white font-medium"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="agent">Agent / Counsellor</option>
                    <option value="analyst">Analyst</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Custom Role Template</label>
                  <select
                    value={memberCustomRoleId}
                    onChange={e => setMemberCustomRoleId(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white font-medium"
                  >
                    <option value="">None (Base Role Only)</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resource Scope Selection */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-1">Conversation Visibility Scope</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      value="all"
                      checked={memberScope === 'all'}
                      onChange={() => setMemberScope('all')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>🌐 All Conversations</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      value="assigned_only"
                      checked={memberScope === 'assigned_only'}
                      onChange={() => setMemberScope('assigned_only')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>🔒 Assigned Only (Restricted to My Chats)</span>
                  </label>
                </div>
              </div>

              {/* Granular Permission Overrides Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    Fine-Grained Permission Overrides (Explicit Grant vs Deny)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Cycle: Inherit → <span className="text-emerald-600 font-bold">GRANT</span> → <span className="text-rose-600 font-bold">DENY</span>
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {permissionRegistry
                    .filter(p => p.module !== 'support_grants') // Exclude support grants (Owner only per SRS Line 615)
                    .map(perm => {
                      const override = memberOverrides.find(o => o.permissionKey === perm.key);
                      const status = !override ? 'default' : override.granted ? 'granted' : 'denied';

                      return (
                        <div key={perm.key} className="p-2.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                          <div className="min-w-0 pr-3">
                            <div className="font-mono text-xs font-semibold text-slate-800 truncate">
                              {perm.key}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {perm.description}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleOverride(perm.key, status)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                                status === 'granted'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : status === 'denied'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {status === 'granted' ? '✓ Grant' : status === 'denied' ? '✗ Deny' : 'Inherit'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOverrideModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveMemberOverrides}
                disabled={savingOverrides}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                {savingOverrides && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Security Policy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Creator / Editor Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-['Outfit']">
                    {editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Custom Role'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Select permissions to bundle into this reusable role template.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Role Name</label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={e => setRoleName(e.target.value)}
                    placeholder="e.g. Senior Admissions Counsellor"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Badge Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={roleColor}
                      onChange={e => setRoleColor(e.target.value)}
                      className="w-8 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-500">{roleColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={roleDesc}
                  onChange={e => setRoleDesc(e.target.value)}
                  placeholder="e.g. Can manage leads, chat with students, and initiate broadcasts."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    Included Permissions ({rolePermissions.length} selected)
                  </label>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {Object.entries(permissionModules)
                    .filter(([mod]) => mod !== 'support_grants') // Exclude support grants
                    .map(([modName, keys]) => {
                      const allSelected = keys.every(k => rolePermissions.includes(k));
                      const someSelected = keys.some(k => rolePermissions.includes(k));

                      return (
                        <div key={modName} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                          <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-100">
                            <span className="text-xs font-bold font-mono text-slate-800 uppercase">
                              {modName.replace('_', ' ')}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSelectAllInModule(modName)}
                              className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold"
                            >
                              {allSelected ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            {keys.map(k => (
                              <label key={k} className="flex items-center gap-1.5 text-[11px] font-mono text-slate-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={rolePermissions.includes(k)}
                                  onChange={() => handleToggleRolePermission(k)}
                                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="truncate">{k.split('.').slice(1).join('.')}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRole}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {savingRole && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingRole ? 'Update Role' : 'Create Role'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
