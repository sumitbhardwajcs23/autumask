import React, { useState } from 'react';
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  GraduationCap,
  ShoppingCart,
  PackageCheck,
  Building2,
  ShieldCheck,
  FileText,
  Activity,
  Briefcase,
  PhoneCall,
  Award,
  Sparkles,
  Target,
  Video,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { StatCard } from './StatCard';
import { FunnelChart } from './FunnelChart';
import { SourceDonut } from './SourceDonut';
import { QuickStatusCards } from './QuickStatusCards';
import { RecentConversationsCard } from './RecentConversationsCard';
import { AutomationStatusCard } from './AutomationStatusCard';
import { UsageAndActionsCard } from './UsageAndActionsCard';
import { OnboardingBanner } from './OnboardingBanner';
import { WhatsAppConnectivityHero } from './WhatsAppConnectivityHero';
import { Conversation, AutomationRule, UsageQuota, TabType, User } from '../../types';
import { IndustryType, INDUSTRIES, getIndustryConfig } from '../../config/industries';

const ICON_MAP: Record<string, any> = {
  ShoppingCart,
  PackageCheck,
  Building2,
  ShieldCheck,
  FileText,
  Activity,
  Briefcase,
  PhoneCall,
  Award,
  Sparkles,
  Target,
  Video,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  MessageSquare,
  Users,
  Calendar,
  GraduationCap,
};

interface DashboardViewProps {
  conversations: Conversation[];
  rules: AutomationRule[];
  usage?: UsageQuota;
  metrics?: {
    totalConversations: number;
    activeEnquiries: number;
    leadsCaptured: number;
    demosBooked: number;
    admissionsConfirmed: number;
    aiHandledPercent: number;
    responseTimeAvgSec: number;
  };
  currentUser?: User;
  workspace?: any;
  onSelectConversation: (conv: Conversation) => void;
  onToggleRule: (ruleId: string) => void;
  onNavigate: (tab: TabType) => void;
  onOpenAddLeadModal: () => void;
  onOpenBroadcastModal: () => void;
  onOpenSimulator?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  conversations,
  rules,
  usage,
  metrics,
  currentUser,
  workspace,
  onSelectConversation,
  onToggleRule,
  onNavigate,
  onOpenAddLeadModal,
  onOpenBroadcastModal,
  onOpenSimulator,
}) => {
  // Active industry vertical mode (D2C, Real Estate, Healthcare, Education, Services, SaaS)
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>(() => {
    return getIndustryConfig(workspace?.category).id;
  });

  const currentIndustry = INDUSTRIES[selectedIndustry] || INDUSTRIES.education;
  const userName = currentUser?.fullName?.split(' ')?.[0] || 'Team Lead';
  const workspaceTitle = workspace?.name || currentIndustry.demoAccount.workspaceName;

  return (
    <div className="p-6 sm:p-8 space-y-7 max-w-[1550px] w-full mx-auto">
      {/* WhatsApp Cloud API Command Center & Connectivity Status */}
      <WhatsAppConnectivityHero
        onNavigate={onNavigate}
        onOpenSimulator={onOpenSimulator}
        onOpenBroadcast={onOpenBroadcastModal}
        activeConversationsCount={conversations.filter(c => c.status === 'OPEN').length || 18}
      />

      {/* Guided Onboarding & Health Check Banner */}
      <OnboardingBanner 
        onOpenSimulator={onOpenSimulator || (() => {})} 
        onNavigate={onNavigate} 
      />

      {/* Multi-Industry Agency Customization Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-emerald-200/60">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Agency Customizer:</span>
            </span>
            <span className="text-xs sm:text-sm text-slate-600 font-medium">
              Dashboard customized for <strong>{currentIndustry.name}</strong> ({currentIndustry.customerTerm})
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Active Bot: <strong className="text-slate-800">{currentIndustry.botRole}</strong>
          </span>
        </div>

        {/* 6 Industry Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {(Object.keys(INDUSTRIES) as IndustryType[]).map((indKey) => {
            const ind = INDUSTRIES[indKey];
            const isSelected = selectedIndustry === indKey;
            return (
              <button
                key={indKey}
                type="button"
                onClick={() => setSelectedIndustry(indKey)}
                className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 border text-center cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                }`}
              >
                <span className="text-base">{ind.icon}</span>
                <span className="truncate">{ind.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Welcome Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5 font-['Outfit']">
            Good Morning, {userName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here's what's happening with your <strong>{workspaceTitle}</strong> ({currentIndustry.name}) WhatsApp automation today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {currentIndustry.icon} {currentIndustry.customerTerm} Focused
          </span>
        </div>
      </div>

      {/* 4 Stat Cards Customized to the Selected Industry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={currentIndustry.metrics.stat1.title}
          value={currentIndustry.metrics.stat1.value}
          trend={currentIndustry.metrics.stat1.trend}
          icon={ICON_MAP[currentIndustry.metrics.stat1.icon] || MessageSquare}
          iconBg={currentIndustry.metrics.stat1.bg}
          iconColor="text-white"
        />
        <StatCard
          title={currentIndustry.metrics.stat2.title}
          value={currentIndustry.metrics.stat2.value}
          trend={currentIndustry.metrics.stat2.trend}
          icon={ICON_MAP[currentIndustry.metrics.stat2.icon] || Users}
          iconBg={currentIndustry.metrics.stat2.bg}
          iconColor="text-white"
        />
        <StatCard
          title={currentIndustry.metrics.stat3.title}
          value={currentIndustry.metrics.stat3.value}
          trend={currentIndustry.metrics.stat3.trend}
          icon={ICON_MAP[currentIndustry.metrics.stat3.icon] || Calendar}
          iconBg={currentIndustry.metrics.stat3.bg}
          iconColor="text-white"
        />
        <StatCard
          title={currentIndustry.metrics.stat4.title}
          value={currentIndustry.metrics.stat4.value}
          trend={currentIndustry.metrics.stat4.trend}
          icon={ICON_MAP[currentIndustry.metrics.stat4.icon] || GraduationCap}
          iconBg={currentIndustry.metrics.stat4.bg}
          iconColor="text-white"
        />
      </div>

      {/* Industry-Specific Capabilities Showcase Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-2xl p-5 border border-slate-800 text-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentIndustry.icon}</span>
              <h3 className="text-sm font-bold font-['Outfit']">{currentIndustry.name} Automation Workflows Active</h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                {currentIndustry.botRole}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {currentIndustry.tagline}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenBroadcastModal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentIndustry.primaryAction}</span>
            </button>
            <button
              onClick={() => onNavigate('automation')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>View Rules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          {currentIndustry.features.map((feat, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">{feat.title}</span>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {feat.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section: Customized Funnel + Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <FunnelChart 
            data={currentIndustry.funnelStages}
            title={currentIndustry.funnelTitle}
            subtitle={currentIndustry.funnelSubtitle}
          />
        </div>
        <div className="lg:col-span-5">
          <SourceDonut 
            sources={currentIndustry.leadSources.map(s => ({
              name: s.source,
              percentage: s.percent,
              count: s.count,
              color: s.color,
            }))}
            total={currentIndustry.leadSources.reduce((acc, s) => acc + s.count, 0)}
          />
        </div>
      </div>

      {/* Quick Status Row */}
      <QuickStatusCards onNavigate={onNavigate} />

      {/* Bottom 3-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <RecentConversationsCard
          conversations={conversations}
          onSelectConversation={(conv) => {
            onSelectConversation(conv);
            onNavigate('inbox');
          }}
          onViewAll={() => onNavigate('inbox')}
        />

        <AutomationStatusCard
          rules={rules}
          onToggleRule={onToggleRule}
          onViewAll={() => onNavigate('automation')}
        />

        <UsageAndActionsCard
          usage={usage}
          onNavigate={onNavigate}
          onOpenAddLeadModal={onOpenAddLeadModal}
          onOpenBroadcastModal={onOpenBroadcastModal}
        />
      </div>
    </div>
  );
};
