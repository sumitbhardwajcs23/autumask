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
import { Conversation, AutomationRule, UsageQuota, TabType, User, WhatsAppAccount } from '../../types';
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
  whatsappAccount?: WhatsAppAccount | null;
  onOpenConnectWhatsApp?: () => void;
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
  whatsappAccount,
  onOpenConnectWhatsApp,
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
    <div className="w-full px-6 sm:px-8 lg:px-10 py-8 space-y-8">
      {/* WhatsApp Cloud API Command Center & Connectivity Status */}
      <WhatsAppConnectivityHero
        onNavigate={onNavigate}
        onOpenSimulator={onOpenSimulator}
        onOpenBroadcast={onOpenBroadcastModal}
        onOpenConnectWhatsApp={onOpenConnectWhatsApp}
        whatsappAccount={whatsappAccount}
        activeConversationsCount={conversations.filter(c => c.status === 'OPEN').length || 18}
      />

      {/* Guided Onboarding & Health Check Banner */}
      <OnboardingBanner 
        onOpenSimulator={onOpenSimulator || (() => {})} 
        onNavigate={onNavigate} 
        whatsappAccount={whatsappAccount}
        onOpenConnectWhatsApp={onOpenConnectWhatsApp}
      />

      {/* Multi-Industry Agency Customization Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-5">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xs sm:text-sm flex items-center gap-2 border border-emerald-200/70 shadow-2xs">
              <Layers className="w-4.5 h-4.5 text-emerald-600" />
              <span>Agency Customizer:</span>
            </span>
            <span className="text-sm sm:text-base text-slate-600 font-medium">
              Dashboard customized for <strong className="text-slate-900 font-bold">{currentIndustry.name}</strong> ({currentIndustry.customerTerm})
            </span>
          </div>
          <span className="text-xs sm:text-sm text-slate-500 font-medium">
            Active Bot: <strong className="text-emerald-700 font-bold">{currentIndustry.botRole}</strong>
          </span>
        </div>

        {/* 6 Industry Tabs: Strictly Equal Heights & Comfortable Typography */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {(Object.keys(INDUSTRIES) as IndustryType[]).map((indKey) => {
            const ind = INDUSTRIES[indKey];
            const isSelected = selectedIndustry === indKey;
            return (
              <button
                key={indKey}
                type="button"
                onClick={() => setSelectedIndustry(indKey)}
                className={`h-14 px-4 rounded-2xl text-sm sm:text-base transition-all flex items-center justify-center gap-3 border text-center cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-black'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-bold'
                }`}
              >
                <span className="text-xl sm:text-2xl">{ind.icon}</span>
                <span className="truncate">{ind.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Welcome Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3 font-['Outfit']">
            Good Morning, {userName} 👋
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-1.5 font-normal">
            Here's what's happening with your <strong className="text-slate-900 font-bold">{workspaceTitle}</strong> ({currentIndustry.name}) WhatsApp automation today.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="h-11 px-4.5 rounded-2xl text-sm sm:text-base font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-2.5 shadow-2xs">
            <span className="text-xl">{currentIndustry.icon}</span>
            <span>{currentIndustry.customerTerm} Focused</span>
          </span>
        </div>
      </div>

      {/* 4 Stat Cards Customized to the Selected Industry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-7 sm:p-8 border border-slate-800 text-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-2xl">{currentIndustry.icon}</span>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black font-['Outfit']">{currentIndustry.name} Automation Workflows Active</h3>
              <span className="px-3.5 py-1 rounded-lg text-xs sm:text-sm bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                {currentIndustry.botRole}
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-300 font-medium">
              {currentIndustry.tagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={onOpenBroadcastModal}
              className="flex-1 sm:flex-initial h-11 sm:h-12 px-4 sm:px-5 rounded-2xl text-sm sm:text-base font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-2xs flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Sparkles className="w-4.5 h-4.5" />
              <span>{currentIndustry.primaryAction}</span>
            </button>
            <button
              onClick={() => onNavigate('automation')}
              className="flex-1 sm:flex-initial h-11 sm:h-12 px-4 sm:px-5 rounded-2xl text-sm sm:text-base font-extrabold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>View Rules</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          {currentIndustry.features.map((feat, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-white">{feat.title}</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                  {feat.badge}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{feat.desc}</p>
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
      <QuickStatusCards 
        onNavigate={onNavigate} 
        whatsappAccount={whatsappAccount}
        onOpenConnectWhatsApp={onOpenConnectWhatsApp}
      />

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
