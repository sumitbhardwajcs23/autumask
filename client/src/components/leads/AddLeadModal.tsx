import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Lead } from '../../types';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Partial<Lead>) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  onAddLead,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [course, setCourse] = useState('JEE Main & Advanced');
  const [classGrade, setClassGrade] = useState('Class 12');
  const [batch, setBatch] = useState('Morning Batch');
  const [city, setCity] = useState('');
  const [source, setSource] = useState('Direct Chat');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onAddLead({
      contactName: name,
      phone,
      course,
      classGrade,
      preferredBatch: batch,
      city: city || 'Delhi NCR',
      source,
      status: 'NEW',
      score: 70,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Add Prospective Student Lead</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Student / Parent Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aryan Dixit"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">WhatsApp Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 00000"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Exam</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none"
              >
                <option value="JEE Main & Advanced">JEE Main & Advanced</option>
                <option value="JEE Dropper Batch">JEE Dropper Batch</option>
                <option value="NEET Medical">NEET Medical</option>
                <option value="Class 11 Foundation">Class 11 Foundation</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Lead Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none"
              >
                <option value="Website">Website</option>
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="Instagram">Instagram</option>
                <option value="Direct Chat">Direct Chat</option>
                <option value="Reference">Reference</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Class Grade</label>
              <input
                type="text"
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                placeholder="Class 11 / 12"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Jaipur"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
            >
              Save Lead to CRM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
