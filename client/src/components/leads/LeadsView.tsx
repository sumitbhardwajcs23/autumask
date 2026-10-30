import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  UserPlus, 
  Phone, 
  Calendar, 
  GraduationCap, 
  CheckCircle2, 
  ChevronDown,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { Lead, LeadStatus, UserRole } from '../../types';
import { leadsApi } from '../../services/api';

interface LeadsViewProps {
  leads: Lead[];
  onUpdateStatus: (leadId: string, newStatus: LeadStatus) => void;
  onOpenAddModal: () => void;
  userRole?: UserRole;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  onUpdateStatus,
  onOpenAddModal,
  userRole = 'admin',
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedLeadForProfile, setSelectedLeadForProfile] = useState<Lead | null>(null);

  const filteredLeads = leads.filter(lead => {
    if (statusFilter !== 'ALL' && lead.status !== statusFilter) return false;
    if (courseFilter !== 'ALL' && !lead.course.includes(courseFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        lead.contactName.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        lead.course.toLowerCase().includes(q) ||
        (lead.city && lead.city.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'QUALIFIED':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'INTERESTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DEMO_BOOKED':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'DEMO_ATTENDED':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'ADMITTED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // Call backend to enforce RBAC and record audit log
      const res = await leadsApi.exportCsv();
      const exportList = res.leads || filteredLeads;

      const headers = ['Name', 'Phone', 'Course', 'Class', 'Batch', 'City', 'Source', 'Status', 'Score'];
      const rows = exportList.map(l => [
        l.contactName,
        l.phone,
        l.course,
        l.classGrade || '',
        l.preferredBatch || '',
        l.city || '',
        l.source,
        l.status,
        l.score
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `automask_leads_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(err.message || 'Export failed: You do not have permission to export leads.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1550px] w-full mx-auto space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight font-['Outfit']">
            Student Leads CRM
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture, qualify and convert student enquiries into verified coaching admissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {userRole === 'agent' ? (
            <button
              disabled
              title="CSV Export restricted to Admin and Owner (SRS Section 3)"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl text-xs font-semibold cursor-not-allowed opacity-70"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV (Admin Only)</span>
            </button>
          ) : (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, phone or city..."
              className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Stages</option>
            <option value="NEW">New Enquiries</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="INTERESTED">Interested</option>
            <option value="DEMO_BOOKED">Demo Booked</option>
            <option value="DEMO_ATTENDED">Demo Attended</option>
            <option value="ADMITTED">Admitted</option>
          </select>

          {/* Course Filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Courses</option>
            <option value="JEE">JEE Programs</option>
            <option value="NEET">NEET Medical</option>
            <option value="Foundation">Foundation</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Phone / WhatsApp</th>
                <th className="py-3 px-4">Course & Class</th>
                <th className="py-3 px-4">Preferred Batch</th>
                <th className="py-3 px-4">Lead Source</th>
                <th className="py-3 px-4">Lead Score</th>
                <th className="py-3 px-4">Pipeline Status</th>
                <th className="py-3 px-4">Assigned Counsellor</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Student Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {lead.contactName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{lead.contactName}</div>
                        <div className="text-[10px] text-slate-400">{lead.city || 'Delhi NCR'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{lead.phone}</span>
                    </div>
                  </td>

                  {/* Course */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{lead.course}</div>
                    <div className="text-[10px] text-slate-400">{lead.classGrade || 'Class 12'}</div>
                  </td>

                  {/* Batch */}
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {lead.preferredBatch || 'Morning Batch'}
                  </td>

                  {/* Source */}
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      {lead.source}
                    </span>
                  </td>

                  {/* Score */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            lead.score >= 80 ? 'bg-emerald-500' : lead.score >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${lead.score}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-slate-700 text-[11px] font-['Outfit']">{lead.score}</span>
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4">
                    <select
                      value={lead.status}
                      onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${getStatusBadge(lead.status)}`}
                    >
                      <option value="NEW">New Enquiry</option>
                      <option value="QUALIFIED">Qualified</option>
                      <option value="INTERESTED">Interested</option>
                      <option value="DEMO_BOOKED">Demo Booked</option>
                      <option value="DEMO_ATTENDED">Demo Attended</option>
                      <option value="ADMITTED">Admitted (Verified)</option>
                      <option value="LOST">Lost / Dropped</option>
                    </select>
                  </td>

                  {/* Assigned Counsellor */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-[10px]">
                        👨‍💼
                      </span>
                      <span className="font-semibold text-slate-800">{lead.assignedToName || 'Dr. Prakash Sharma'}</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedLeadForProfile(lead)}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admission Lead Profile Drawer */}
      {selectedLeadForProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center font-['Outfit']">
                    {selectedLeadForProfile.contactName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{selectedLeadForProfile.contactName}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">{selectedLeadForProfile.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLeadForProfile(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Admission Qualification</div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Course:</span>
                    <strong className="text-emerald-700">{selectedLeadForProfile.course}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Student City / Region:</span>
                    <span className="font-semibold text-slate-800">{selectedLeadForProfile.city || 'Kota, Rajasthan'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Lead Score:</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Score: {selectedLeadForProfile.score || 85}/100 (HIGH INTENT)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Admission Stage:</span>
                    <select
                      value={selectedLeadForProfile.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as LeadStatus;
                        onUpdateStatus(selectedLeadForProfile.id, newStatus);
                        setSelectedLeadForProfile({ ...selectedLeadForProfile, status: newStatus });
                      }}
                      className="bg-white border border-slate-200 text-xs font-bold rounded-lg p-1 text-slate-700"
                    >
                      <option value="NEW">NEW</option>
                      <option value="QUALIFIED">QUALIFIED</option>
                      <option value="INTERESTED">INTERESTED</option>
                      <option value="DEMO_BOOKED">DEMO_BOOKED</option>
                      <option value="DEMO_ATTENDED">DEMO_ATTENDED</option>
                      <option value="ADMITTED">ADMITTED</option>
                      <option value="LOST">LOST</option>
                    </select>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Counsellor:</span>
                    <span className="font-semibold text-slate-800">{selectedLeadForProfile.assignedToName || 'Dr. Prakash Sharma'}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Counselor Notes & Next Steps</div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Student inquiry received for Classroom Droppers batch. Free scholarship test PSAT demo scheduled for Saturday 11:00 AM at Road No. 1 Kota Campus.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => {
                  window.open(`https://wa.me/${selectedLeadForProfile.phone.replace(/[^0-9]/g, '')}`, '_blank');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1.5"
              >
                <span>Initiate Direct WhatsApp Chat</span>
              </button>
              <button
                onClick={() => setSelectedLeadForProfile(null)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
