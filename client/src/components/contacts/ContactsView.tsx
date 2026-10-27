import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Phone, 
  Tag, 
  ShieldCheck, 
  ShieldAlert, 
  MessageSquare, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  X,
  Loader2,
  UploadCloud,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { Contact, UserRole } from '../../types';
import { contactsApi, contactsImportApi } from '../../services/api';

interface ContactsViewProps {
  contacts: Contact[];
  onSelectContactForChat: (contactPhone: string) => void;
  onRefreshContacts: () => void;
  userRole?: UserRole;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onSelectContactForChat,
  onRefreshContacts,
  userRole = 'admin',
}) => {
  const [search, setSearch] = useState('');
  const [filterOptIn, setFilterOptIn] = useState<'ALL' | 'OPTED_IN' | 'OPTED_OUT'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState(
    'phone,name,tags,optInStatus,notes\n+91 98765 43210,Aarav Sharma,JEE;Dropper,OPTED_IN,Inquired about test series\n+91 98765 43211,Rhea Sen,NEET;Class11,OPTED_IN,Hostel inquiry\n+91 98765 43212,Karan Patel,PSAT-2027,OPTED_OUT,Requested DND\n9811234567,Amit Raj,Existing;JEE,OPTED_IN,Duplicate test'
  );
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<any>(null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+91 ');
  const [newTags, setNewTags] = useState('JEE, High Intent');
  const [newNotes, setNewNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const filteredContacts = contacts.filter(c => {
    if (filterOptIn !== 'ALL' && c.optInStatus !== filterOptIn) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q)) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleToggleOptIn = async (id: string, currentStatus: string) => {
    try {
      await contactsApi.toggleOptIn(id);
      showNotice(`Opt-in status updated`);
      onRefreshContacts();
    } catch (err: any) {
      alert(`Failed to update opt-in: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove contact "${name}"?`)) return;
    try {
      await contactsApi.delete(id);
      showNotice(`Contact "${name}" removed`);
      onRefreshContacts();
    } catch (err: any) {
      alert(`Failed to delete contact: ${err.message}`);
    }
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim() || isSaving) return;
    setIsSaving(true);

    try {
      await contactsApi.create({
        name: newName.trim(),
        phone: newPhone.trim(),
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
        notes: newNotes.trim() || 'Direct WhatsApp Contact',
        optInStatus: 'OPTED_IN',
      });

      setNewName('');
      setNewPhone('+91 ');
      setNewTags('JEE, High Intent');
      setNewNotes('');
      setIsAddModalOpen(false);
      showNotice('New contact successfully created');
      onRefreshContacts();
    } catch (err: any) {
      alert(`Failed to create contact: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportCsv = async () => {
    if (!csvContent.trim() || isImporting) return;
    setIsImporting(true);
    setImportSummary(null);

    try {
      const rows = csvContent.split('\n').filter(r => r.trim().length > 0);
      const parsedContacts: any[] = [];

      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(',').map(c => c.trim());
        if (cols.length >= 2) {
          parsedContacts.push({
            phone: cols[0],
            name: cols[1],
            tags: cols[2] ? cols[2].split(';').map(t => t.trim()) : ['CSV Import'],
            optInStatus: cols[3] || 'OPTED_IN',
            notes: cols[4] || 'Imported via CSV',
          });
        }
      }

      const res = await contactsImportApi.importCsv(JSON.stringify(parsedContacts));
      setImportSummary(res);
      showNotice(`Import complete: ${res.importedCount} added, ${res.skippedDuplicates} duplicates skipped.`);
      onRefreshContacts();
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight font-['Outfit']">
              Contacts & WhatsApp Consent Directory
            </h1>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              {contacts.length} Total Contacts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Meta opt-in consent registry, tag segments, and direct student communication history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {actionNotice && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl animate-in fade-in">
              ✓ {actionNotice}
            </span>
          )}
          <button
            onClick={() => { setImportSummary(null); setIsCsvModalOpen(true); }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-2xs border border-slate-200"
          >
            <UploadCloud className="w-4 h-4 text-slate-500" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Contact</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, course, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setFilterOptIn('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterOptIn === 'ALL' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All ({contacts.length})
            </button>
            <button
              onClick={() => setFilterOptIn('OPTED_IN')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterOptIn === 'OPTED_IN' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Opted In ({contacts.filter(c => c.optInStatus === 'OPTED_IN').length})
            </button>
            <button
              onClick={() => setFilterOptIn('OPTED_OUT')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterOptIn === 'OPTED_OUT' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Opted Out ({contacts.filter(c => c.optInStatus === 'OPTED_OUT').length})
            </button>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Contact / Student</th>
                <th className="py-3 px-4">WhatsApp Number</th>
                <th className="py-3 px-4">Segments & Tags</th>
                <th className="py-3 px-4">Consent Status</th>
                <th className="py-3 px-4">Opt-In Source</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600">No contacts match your filter</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your search query or opt-in filter</p>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block">{contact.name}</span>
                          <span className="text-[10px] text-slate-400 truncate max-w-xs block">{contact.notes || 'No notes'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {contact.phone}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleOptIn(contact.id, contact.optInStatus)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                          contact.optInStatus === 'OPTED_IN'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to toggle consent status"
                      >
                        {contact.optInStatus === 'OPTED_IN' ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Opted In</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>Opted Out (STOP)</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {contact.optInSource}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectContactForChat(contact.phone)}
                          className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"
                          title="Open in WhatsApp Shared Inbox"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Open Chat</span>
                        </button>

                        <button
                          onClick={() => handleDelete(contact.id, contact.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Add WhatsApp Contact</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Meera Kapoor"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="JEE, Class 11, Dropper 2027"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes / Enquiry Context</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Inquired about weekend test series batch"
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Contact</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => {
                setIsCsvModalOpen(false);
                setImportSummary(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Bulk Import Contacts (CSV)</h3>
                <p className="text-xs text-slate-500">Upload or paste comma-separated contacts</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">CSV Data Format (phone,name,tags,optInStatus,notes)</label>
                  <label className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Upload CSV file</span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (typeof event.target?.result === 'string') {
                              setCsvContent(event.target.result);
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <textarea
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  rows={6}
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50 text-slate-700"
                  placeholder="phone,name,tags,optInStatus,notes"
                />
              </div>

              {importSummary && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Import Completed Successfully</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-slate-600">
                    <div>Imported Contacts: <strong className="text-emerald-700">{importSummary.importedCount || 0}</strong></div>
                    <div>Skipped / Duplicates: <strong className="text-amber-700">{importSummary.skippedDuplicates || 0}</strong></div>
                  </div>
                  {importSummary.errors && importSummary.errors.length > 0 && (
                    <div className="text-rose-600 text-[11px] pt-1">
                      Errors encountered: {importSummary.errors.length}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-semibold text-slate-700">Important Notes:</p>
                <p>• Duplicate phone numbers within the workspace are automatically updated rather than duplicated.</p>
                <p>• Tags must be separated by semicolons (e.g. <code>JEE;Dropper</code>).</p>
                <p>• Valid opt-in values: <code>OPTED_IN</code> or <code>OPTED_OUT</code>.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCsvModalOpen(false);
                    setImportSummary(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleImportCsv}
                  disabled={isImporting || !csvContent.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  <span>{isImporting ? 'Importing...' : 'Start Import'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

