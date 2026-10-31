import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Calendar, 
  ChevronDown, 
  Smartphone, 
  CheckCircle2, 
  Sparkles, 
  Command, 
  Crown, 
  Shield, 
  Headphones, 
  GlobeLock, 
  Lock, 
  Check, 
  LogOut,
  Menu
} from 'lucide-react';
import { User, UserRole } from '../../types';

interface HeaderProps {
  currentUser: User;
  onRoleChange: (role: UserRole) => void;
  onToggleSimulator: () => void;
  isSimulatorOpen: boolean;
  onOpenSupportGrantModal?: () => void;
  onLogout?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onRoleChange,
  onToggleSimulator,
  isSimulatorOpen,
  onOpenSupportGrantModal,
  onLogout,
  onToggleMobileSidebar,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const availableRoles = [
    {
      role: 'owner' as UserRole,
      title: 'Dr. Prakash Sharma',
      roleLabel: 'Owner (Full Access)',
      icon: Crown,
      color: 'text-amber-500 bg-amber-50 border-amber-200',
      description: 'Manage billing, staff, rules & issue SRS §615 support grants',
    },
    {
      role: 'admin' as UserRole,
      title: 'Sumit Bhardwaj',
      roleLabel: 'Admin (Operations)',
      icon: Shield,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      description: 'Manage rules, knowledge, staff, export CSV (No billing)',
    },
    {
      role: 'agent' as UserRole,
      title: 'Priya Sharma',
      roleLabel: 'Agent (Counsellor)',
      icon: Headphones,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      description: 'Answer inbox chats, leads, bookings (No rules, No billing, No CSV)',
    },
    {
      role: 'platform_admin' as UserRole,
      title: 'AutoMask Support Ops',
      roleLabel: 'Platform Admin',
      icon: GlobeLock,
      color: 'text-red-600 bg-red-50 border-red-200',
      description: 'Tenant metrics only. Message content locked by default (SRS §615)',
    },
  ];

  const currentRoleConfig = availableRoles.find(r => r.role === currentUser.role) || availableRoles[1];
  const CurrentIcon = currentRoleConfig.icon;

  return (
    <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Menu & Search Bar */}
      <div className="flex items-center gap-2.5 sm:gap-4 flex-1 max-w-lg">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative w-full">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search (Ctrl + K)"
            className="w-full h-10 pl-10 pr-12 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 font-medium"
          />
          <div className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 text-xs text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-xs">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Exactly h-10 height for comfortable readability */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Interactive Dev Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(prev => !prev)}
            className="h-10 flex items-center gap-2 px-3 sm:px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all group cursor-pointer"
            title="Switch User Role"
          >
            <div className={`w-5.5 h-5.5 rounded-md flex items-center justify-center border ${currentRoleConfig.color} shrink-0`}>
              <CurrentIcon className="w-3.5 h-3.5" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xs font-bold text-slate-800">
                  {currentRoleConfig.title}
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">
                  {currentUser.role}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform shrink-0" />
          </button>

          {/* Role Dropdown Menu */}
          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Switch Role</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                    Enforced
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Simulate access as specified in the SRS Permissions Matrix.
                </p>
              </div>

              <div className="p-1.5 space-y-1">
                {availableRoles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = r.role === currentUser.role;

                  return (
                    <button
                      key={r.role}
                      onClick={() => {
                        onRoleChange(r.role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                        isSelected ? 'bg-slate-50 border border-slate-200' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center border flex-shrink-0 mt-0.5 ${r.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 truncate">{r.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 block leading-tight">{r.roleLabel}</span>
                        <p className="text-[10px] text-slate-400 leading-tight mt-1">{r.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {currentUser.role === 'owner' && onOpenSupportGrantModal && (
                <div className="p-2 border-t border-slate-100 bg-amber-50/50 rounded-b-2xl">
                  <button
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      onOpenSupportGrantModal();
                    }}
                    className="w-full text-[11px] font-bold text-amber-800 bg-amber-100/70 hover:bg-amber-200/70 py-1.5 px-3 rounded-xl border border-amber-300/50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Manage Support Grants (SRS §615)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interactive WhatsApp Simulator Toggle Button */}
        <button
          onClick={onToggleSimulator}
          className={`h-10 flex items-center gap-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shadow-2xs cursor-pointer shrink-0 ${
            isSimulatorOpen
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/30'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 hover:border-emerald-300'
          }`}
          title="Open WhatsApp Chat Simulator"
        >
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">WhatsApp Simulator</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </button>

        {/* Date Filter (hidden on small mobile) */}
        <div className="hidden md:flex h-10 items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shadow-2xs shrink-0">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Oct 1 – Oct 13, 2026</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Notification Bell */}
        <div className="relative shrink-0">
          <button 
            type="button"
            onClick={() => setIsNotificationsOpen(prev => !prev)}
            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center relative transition-all shadow-2xs group cursor-pointer"
            title="System Notifications"
          >
            <Bell className="w-4.5 h-4.5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white shadow-xs">
              3
            </span>
          </button>

          {/* Notifications Dropdown Drawer */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2.5 z-50 animate-in fade-in duration-150">
              <div className="px-3.5 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 font-['Outfit']">
                  <Bell className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Notifications & Alerts</span>
                </div>
                <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.2 rounded-full border border-rose-200">
                  3 New
                </span>
              </div>

              <div className="p-2 space-y-1.5 text-xs">
                <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 hover:bg-emerald-50 transition-colors">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                    <span>Meta Cloud API Approved</span>
                    <span className="text-[9px] text-slate-400">Just now</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 mt-0.5 leading-tight">
                    Your template was verified and approved for broadcasts.
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-sky-50/60 border border-sky-100 hover:bg-sky-50 transition-colors">
                  <div className="flex items-center justify-between text-[11px] font-bold text-sky-800">
                    <span>Broadcast Delivered</span>
                    <span className="text-[9px] text-slate-400">10m ago</span>
                  </div>
                  <p className="text-[10px] text-sky-700 mt-0.5 leading-tight">
                    Batch broadcast completed with 100% delivery rate.
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span>Opt-Out Protection Safeguard</span>
                    <span className="text-[9px] text-slate-400">1h ago</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    Recipient replied STOP; automatically suppressed from future blasts.
                  </p>
                </div>
              </div>

              <div className="px-3 pt-2 border-t border-slate-100 text-center">
                <button 
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="h-10 flex items-center gap-1.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors shadow-2xs cursor-pointer shrink-0"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-slate-500 hover:text-rose-600 transition-colors" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
};
