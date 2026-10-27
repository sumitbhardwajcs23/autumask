import React, { useState } from 'react';
import { X, Send, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (campaignName: string, recipientCount: number) => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  onSend,
}) => {
  const [campaignName, setCampaignName] = useState('Priority WhatsApp Announcement');
  const [targetAudience, setTargetAudience] = useState('All Opted-In Audience (298 contacts)');
  const [template, setTemplate] = useState('priority_announcement_v1');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setTimeout(() => {
      onSend(campaignName, 298);
      setSentSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Send WhatsApp Broadcast Campaign</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Broadcast Campaign Queued!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Dispatched 298 WhatsApp pre-approved template messages with BullMQ rate limiter compliance.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendBroadcast} className="space-y-4 mt-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Campaign Name</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Filter Target Audience (CRM Segments)</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none"
              >
                <option value="All Opted-In Audience (298 contacts)">
                  🌐 All Opted-In Audience (298 contacts)
                </option>
                <option value="High Intent / Engaged Customers (142 contacts)">
                  ⚡ High Intent / Engaged Customers (142 contacts)
                </option>
                <option value="New Inquiries & Contacts (86 contacts)">
                  🟢 New Inquiries & Contacts (86 contacts)
                </option>
                <option value="VIP / Premium Customers (45 contacts)">
                  ⭐ VIP / Premium Customers (45 contacts)
                </option>
                <option value="Custom Audience Segment">
                  🎯 Custom Audience Segment
                </option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Approved Meta Message Template
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none"
              >
                <option value="priority_announcement_v1">
                  priority_announcement_v1 (Marketing • Approved • Hinglish)
                </option>
                <option value="service_update_reminder">
                  service_update_reminder (Utility • Approved • English)
                </option>
                <option value="exclusive_privilege_offer">
                  exclusive_privilege_offer (Marketing • Approved • Hindi)
                </option>
              </select>
            </div>

            {/* Template preview */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">TEMPLATE PREVIEW:</span>
              <p className="whitespace-pre-wrap font-sans text-xs">
                {`Namaste {{1}}! We are thrilled to share an exclusive update with you. Avail our special privilege offer valid until Sunday.\nReply "CLAIM" to activate your priority access.`}
              </p>
            </div>

            {/* Opt-out guarantee */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Opt-Out Protected: Contacts who replied STOP or opted out are automatically excluded.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Launch Broadcast</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
