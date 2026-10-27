import React, { useState } from 'react';
import { 
  Building2, 
  X, 
  CheckCircle2, 
  Mail, 
  Phone, 
  User, 
  CreditCard, 
  Globe,
  Sliders
} from 'lucide-react';
import { TenantAccountSummary } from '../../types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: (newClient: TenantAccountSummary) => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onClientAdded,
}) => {
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [wabaPhone, setWabaPhone] = useState('+91 ');
  const [planName, setPlanName] = useState<'Starter' | 'Pro' | 'Enterprise'>('Pro');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ownerEmail.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const limitsByPlan = {
        Starter: { msgs: 1000, members: 2 },
        Pro: { msgs: 25000, members: 10 },
        Enterprise: { msgs: 100000, members: 50 },
      };

      const newTenant: TenantAccountSummary = {
        id: slug || `tenant-${Date.now()}`,
        name: name.trim(),
        subdomain: subdomain.trim() || `${slug}.automask.in`,
        category: 'Coaching Institute',
        timezone: 'Asia/Kolkata',
        status: 'ACTIVE',
        planId: planName.toLowerCase(),
        planName: planName,
        planRenewAt: '2026-11-25',
        ownerName: ownerName.trim() || 'Institute Director',
        ownerEmail: ownerEmail.trim(),
        wabaConnected: true,
        wabaPhoneNumber: wabaPhone.trim() || '+91 98112 34567',
        monthlyMessagesUsed: 0,
        monthlyMessagesLimit: limitsByPlan[planName].msgs,
        aiRepliesUsed: 0,
        aiRepliesLimit: limitsByPlan[planName].msgs * 2,
        memberCount: limitsByPlan[planName].members,
        activeTicketsCount: 0,
        createdAt: new Date().toISOString().substring(0, 10),
      };

      onClientAdded(newTenant);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Onboard New Coaching Institute</h3>
              <p className="text-[11px] text-slate-400">Instantly provision workspace, RLS tenant isolation, and WABA credentials</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Institute / Academy Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex IIT Academy Kota"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (!subdomain) {
                  setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') + '.automask.in');
                }
              }}
              className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Subdomain / URL</label>
              <input
                type="text"
                placeholder="apexiit.automask.in"
                value={subdomain}
                onChange={e => setSubdomain(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Initial Subscription Plan</label>
              <select
                value={planName}
                onChange={e => setPlanName(e.target.value as any)}
                className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 cursor-pointer font-medium"
              >
                <option value="Starter">Starter (₹2,999/mo • 1k Msgs)</option>
                <option value="Pro">Pro (₹7,999/mo • 25k Msgs)</option>
                <option value="Enterprise">Enterprise (₹19,999/mo • 100k Msgs)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Owner Full Name *</label>
              <input
                type="text"
                required
                placeholder="Dr. Ramesh Gupta"
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Owner Email Address *</label>
              <input
                type="email"
                required
                placeholder="ramesh@apexiit.edu.in"
                value={ownerEmail}
                onChange={e => setOwnerEmail(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">WhatsApp Business Display Phone *</label>
            <input
              type="text"
              required
              placeholder="+91 98234 56789"
              value={wabaPhone}
              onChange={e => setWabaPhone(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              {isSubmitting ? 'Provisioning...' : 'Provision Client Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
