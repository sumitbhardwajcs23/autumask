import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Trash2,
  Plus
} from 'lucide-react';
import { User } from '../../types';
import { supportGrantsApi } from '../../services/api';

interface SupportGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

interface GrantRecord {
  id: string;
  workspaceId: string;
  grantedByUserId: string;
  targetUserId: string;
  scope: string;
  reason: string;
  createdAt: string;
  expiresAt: string;
  revokedAt?: string | null;
}

export const SupportGrantModal: React.FC<SupportGrantModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [grants, setGrants] = useState<GrantRecord[]>([]);
  const [targetUserId, setTargetUserId] = useState('usr-platform-00');
  const [hoursValid, setHoursValid] = useState('2');
  const [reason, setReason] = useState('Investigating student message webhook delivery delay');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchGrants = async () => {
    try {
      const data = await supportGrantsApi.list();
      if (data.grants) setGrants(data.grants);
    } catch (err: any) {
      console.error('Error fetching grants:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGrants();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleCreateGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      await supportGrantsApi.create({
        targetUserId,
        hoursValid: Number(hoursValid),
        reason,
      });

      setLoading(false);
      setReason('');
      fetchGrants();
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Failed to issue support grant');
    }
  };

  const handleRevokeGrant = async (grantId: string) => {
    try {
      await supportGrantsApi.revoke(grantId);
      fetchGrants();
    } catch (err: any) {
      console.error('Error revoking grant:', err);
      alert(err.message || 'Failed to revoke support grant');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl border border-slate-200 animate-in fade-in duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Support Grant Management (SRS Line 615 Privacy Safeguard)
              </h3>
              <p className="text-[11px] text-slate-500">
                Grant time-boxed, logged access to student message content for technical troubleshooting.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">Strict India DPDP Act & SRS §615 Compliance: </span>
            <span>
              Platform Admins have zero access to student messages by default. Only you (the workspace Owner) can issue an emergency time-boxed grant. All access is logged to the immutable audit trail.
            </span>
          </div>
        </div>

        {/* Create Grant Form */}
        {currentUser.role === 'owner' ? (
          <form onSubmit={handleCreateGrant} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 mb-4 space-y-3">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Issue New Time-Boxed Support Grant
            </h4>

            {errorMsg && (
              <div className="p-2 bg-red-100 text-red-700 text-xs rounded-lg font-medium">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Target Platform Admin</label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
                >
                  <option value="usr-platform-00">AutoMask Support Ops (usr-platform-00)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Mandatory Duration Limit</label>
                <select
                  value={hoursValid}
                  onChange={(e) => setHoursValid(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
                >
                  <option value="1">1 Hour</option>
                  <option value="2">2 Hours (Recommended)</option>
                  <option value="4">4 Hours</option>
                  <option value="24">24 Hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Audit Log Justification / Reason</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Debugging customer service window expiry on conv-01"
                className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                {loading ? 'Authorizing...' : 'Authorize Support Grant'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 mb-3 text-center">
            🔒 Only the workspace <strong>Owner</strong> can issue or revoke support grants. Switch to Owner role to manage grants.
          </div>
        )}

        {/* Active & Historical Grants List */}
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Active & Past Grants ({grants.length})
          </h4>

          {grants.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
              No support grants currently issued. Platform Admin has zero access to message content.
            </div>
          ) : (
            grants.map((grant) => {
              const isExpired = new Date(grant.expiresAt) <= new Date();
              const isRevoked = !!grant.revokedAt;
              const isActive = !isExpired && !isRevoked;

              return (
                <div
                  key={grant.id}
                  className={`p-3 rounded-2xl border transition-all text-xs flex items-center justify-between ${
                    isActive
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">Scope: {grant.scope}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full uppercase ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : isRevoked
                            ? 'bg-red-100 text-red-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isActive ? 'Active' : isRevoked ? 'Revoked' : 'Expired'}
                      </span>
                    </div>

                    <p className="text-slate-600 mt-1 text-[11px]">
                      Reason: <span className="font-medium">{grant.reason}</span>
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                      <span>Expires: {new Date(grant.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>Target: {grant.targetUserId}</span>
                    </div>
                  </div>

                  {isActive && currentUser.role === 'owner' && (
                    <button
                      onClick={() => handleRevokeGrant(grant.id)}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Revoke</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
