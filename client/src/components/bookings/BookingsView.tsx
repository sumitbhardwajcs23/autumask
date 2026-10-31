import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Plus, 
  CheckCircle2, 
  Phone, 
  AlertCircle,
  UserCheck,
  X,
  Loader2
} from 'lucide-react';
import { Slot, Appointment } from '../../types';

interface BookingsViewProps {
  slots: Slot[];
  appointments: Appointment[];
  onAddSlot: (slot: Partial<Slot>) => void;
  onBookAppointment?: (data: { slotId: string; studentName: string; phone: string; course?: string }) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  slots,
  appointments,
  onAddSlot,
  onBookAppointment,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState('');
  const [capacity, setCapacity] = useState('20');

  // Book Appointment Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('+91 ');
  const [studentCourse, setStudentCourse] = useState('JEE Advanced 2027');
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startAt.trim()) return;

    onAddSlot({
      title: title.trim(),
      startAt: startAt.trim(),
      capacity: Number(capacity) || 20,
    });

    setTitle('');
    setStartAt('');
    setIsModalOpen(false);
    showNotice('Demo class slot created successfully!');
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId || !studentName.trim() || !studentPhone.trim()) return;

    if (onBookAppointment) {
      onBookAppointment({
        slotId: selectedSlotId,
        studentName: studentName.trim(),
        phone: studentPhone.trim(),
        course: studentCourse,
      });
      showNotice(`Successfully scheduled demo for ${studentName}!`);
    }

    setIsBookModalOpen(false);
    setStudentName('');
    setStudentPhone('+91 ');
  };

  const openBookForSlot = (slotId: string) => {
    setSelectedSlotId(slotId);
    setIsBookModalOpen(true);
  };

  return (
    <div className="w-full px-6 sm:px-8 lg:px-10 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-['Outfit']">
            Demo & Counselling Slot Scheduler
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-1.5 font-normal">
            Built-in capacity-safe scheduling engine for live trial classes and parent counselling (DD-02).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {slots.length > 0 && onBookAppointment && (
            <button
              onClick={() => {
                setSelectedSlotId(slots[0].id);
                setIsBookModalOpen(true);
              }}
              className="flex items-center gap-2 h-11 sm:h-12 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-sm sm:text-base font-extrabold transition-colors shadow-xs"
            >
              <UserCheck className="w-4.5 h-4.5" />
              <span>Schedule Student</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Demo Slot</span>
          </button>
        </div>
      </div>

      {/* Notification notice */}
      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Available Slots */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-emerald-600" />
          Active Demo Slots ({slots.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slots.map((slot) => {
            const fillPercent = Math.round((slot.bookedCount / slot.capacity) * 100);
            const isFull = slot.bookedCount >= slot.capacity;

            return (
              <div
                key={slot.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Live Classroom Demo
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFull ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {isFull ? 'Batch Full' : 'Seats Available'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 mb-1">{slot.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{slot.startAt}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Capacity Booked</span>
                    <span className="font-bold text-slate-800 font-['Outfit']">
                      {slot.bookedCount} / {slot.capacity} ({fillPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFull ? 'bg-red-500' : fillPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>

                  {!isFull && onBookAppointment && (
                    <button
                      onClick={() => openBookForSlot(slot.id)}
                      className="w-full py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register Student</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmed Student Bookings */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Confirmed Student Appointments</h3>
          <span className="text-xs font-semibold text-slate-500">{appointments.length} Scheduled</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {appointments.map((app) => (
            <div key={app.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center">
                  {app.contactName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{app.contactName}</h4>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{app.phone}</span>
                    <span>•</span>
                    <span className="text-slate-600 font-medium">{app.course}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold text-slate-700">{app.startAt}</div>
                  <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>WhatsApp Confirmed</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Demo Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-800 mb-1">Create Demo Class Slot</h3>
            <p className="text-xs text-slate-500 mb-4">Add a new session that the WhatsApp bot can offer to students.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Session Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. NEET Biology Genetics Masterclass"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Date & Timing</label>
                <input
                  type="text"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  placeholder="e.g. Tomorrow, 4:00 PM - 5:15 PM"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Max Student Capacity</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
                >
                  Create Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Student into Slot Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">Register Student for Demo</h3>
              <button onClick={() => setIsBookModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Demo Slot</label>
                <select
                  value={selectedSlotId}
                  onChange={(e) => setSelectedSlotId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50 font-medium"
                  required
                >
                  {slots.map(s => (
                    <option key={s.id} value={s.id} disabled={s.bookedCount >= s.capacity}>
                      {s.title} ({s.startAt}) — {s.capacity - s.bookedCount} seats left
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Aryan Malhotra"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Course / Batch Target</label>
                <input
                  type="text"
                  value={studentCourse}
                  onChange={(e) => setStudentCourse(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
