import React from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  UserCheck, 
  Sliders, 
  Bot, 
  FileText, 
  GitBranch, 
  Users, 
  Send, 
  BarChart2, 
  Users2, 
  Layers, 
  CreditCard, 
  Settings, 
  ChevronDown, 
  Sparkles,
  Crown,
  Phone,
  Lock,
  ShieldCheck,
  Activity,
  X
} from 'lucide-react';
import { TabType, UserRole, User, Workspace } from '../../types';
import { isTabAccessible } from '../../utils/permissionRules';
import { BUSINESS_SECTORS } from '../../services/industryPacks';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unreadCount?: number;
  userRole?: UserRole;
  currentUser?: User;
  workspace?: Workspace;
  onOpenBusinessProfile?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  unreadCount = 12,
  userRole = 'admin',
  currentUser,
  workspace,
  onOpenBusinessProfile,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const currentBusinessName = workspace?.businessName || workspace?.name || 'Prakash Institute';
  const currentIndustryKey = (workspace?.industry as any) || 'EDUCATION';
  const sectorConfig = (BUSINESS_SECTORS as any)[currentIndustryKey] || BUSINESS_SECTORS.GENERAL;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || 'AM';
  };

  const menuItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox' as TabType, label: 'Inbox', icon: Inbox, badge: unreadCount },
    { id: 'leads' as TabType, label: 'Leads', icon: UserCheck },
    { id: 'automation' as TabType, label: 'Automation', icon: Sliders },
    { id: 'ai' as TabType, label: 'AI Assistant', icon: Bot },
    { id: 'templates' as TabType, label: 'Templates', icon: FileText },
    { id: 'contacts' as TabType, label: 'Contacts', icon: Users },
    { id: 'broadcast' as TabType, label: 'Broadcast', icon: Send },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart2 },
    { id: 'team' as TabType, label: 'Team', icon: Users2 },
    { id: 'roles' as TabType, label: 'Roles & RBAC', icon: ShieldCheck },
    { id: 'integrations' as TabType, label: 'Integrations', icon: Layers },
    { id: 'audit_logs' as TabType, label: 'Audit Trail', icon: Activity },
    { id: 'billing' as TabType, label: 'Billing', icon: CreditCard },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  const renderContent = (isDrawer = false) => (
    <>
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#162230] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-glow flex items-center justify-center overflow-hidden shrink-0">
            <img 
              src="/automask-logo.png" 
              alt="AutoMask Logo" 
              className="w-full h-full object-cover rounded-[10px]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }} 
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl text-white tracking-tight flex items-center gap-0.5 font-['Outfit']">
              Auto<span className="text-emerald-400">mask</span>
            </span>
          </div>
        </div>

        {isDrawer && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Workspace Selector */}
      <div className="p-3">
        <div 
          onClick={onOpenBusinessProfile}
          className="bg-[#121c27] hover:bg-[#162433] transition-colors rounded-xl p-2.5 border border-[#1d2d3e] flex items-center justify-between cursor-pointer group shadow-2xs"
          title="Click to Switch Business Sector or Edit Profile"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30 shrink-0 font-['Outfit']">
              {getInitials(currentBusinessName)}
            </div>
            <div className="truncate text-left">
              <h4 className="text-xs font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                {currentBusinessName}
              </h4>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-emerald-400 font-medium">
                  {sectorConfig.shortName}
                </span>
                <span className="text-[10px] text-slate-500">• Pro</span>
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform shrink-0" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-1 custom-scrollbar-dark">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const isAllowed = isTabAccessible(item.id, currentUser || ({ role: userRole } as any));

          return (
            <button
              key={item.id}
              disabled={!isAllowed}
              onClick={() => {
                if (!isAllowed) return;
                onSelectTab(item.id);
                if (isDrawer && onCloseMobile) {
                  onCloseMobile();
                }
              }}
              title={!isAllowed ? `Access Disabled: Workspace Owner has not granted '${item.label}' access to this team member.` : item.label}
              className={`w-full h-10 flex items-center justify-between px-3 rounded-xl text-xs font-medium transition-all duration-200 group cursor-pointer ${
                !isAllowed
                  ? 'opacity-35 cursor-not-allowed text-slate-600 bg-slate-900/30'
                  : isActive
                  ? 'bg-emerald-600 text-white shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-[#13202e]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  !isAllowed 
                    ? 'text-slate-600' 
                    : isActive 
                    ? 'text-white' 
                    : 'text-slate-400 group-hover:text-emerald-400'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {!isAllowed && (
                  <span className="flex items-center gap-1 text-[9px] bg-slate-900 text-rose-400/90 border border-rose-900/40 px-1.5 py-0.2 rounded font-mono">
                    <Lock className="w-2.5 h-2.5 text-rose-400" />
                    Locked
                  </span>
                )}
                {isAllowed && item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-5 text-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Pro Plan Usage Box */}
      <div className="p-3 border-t border-[#162230] shrink-0">
        <div className="bg-[#121c27] rounded-xl p-3 border border-[#1e2e3f] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 fill-emerald-400/20" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Pro Plan</h5>
                <p className="text-[10px] text-slate-400">Renews on 15 Nov 2026</p>
              </div>
            </div>
          </div>

          <div className="mt-2.5">
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '65%' }}></div>
            </div>
            <div className="flex items-center justify-between text-[10px] mt-1.5 font-medium">
              <span className="text-slate-300 font-semibold">32,450 / 50,000</span>
              <span className="text-emerald-400 font-bold">65%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">AI replies used</p>
          </div>

          <button 
            onClick={() => {
              onSelectTab('billing');
              if (isDrawer && onCloseMobile) onCloseMobile();
            }}
            className="w-full mt-3 py-1.5 px-2.5 rounded-lg bg-[#0e1722] hover:bg-[#162434] text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm group cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Upgrade Plan</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar: fixed 260px, 100vh */}
      <aside className="hidden lg:flex w-[260px] bg-[#0b131e] text-slate-300 flex-col h-screen select-none border-r border-[#192635] flex-shrink-0 z-30">
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-[260px] max-w-[80vw] bg-[#0b131e] text-slate-300 flex flex-col h-full select-none border-r border-[#192635] shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
