import React from 'react';
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  GraduationCap 
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
  const userName = currentUser?.fullName?.split(' ')?.[0] || 'Dr. Prakash';
  const workspaceTitle = workspace?.name || 'Prakash Institute';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* WhatsApp Cloud API Command Center & Connectivity Status (Audio 4) */}
      <WhatsAppConnectivityHero
        onNavigate={onNavigate}
        onOpenSimulator={onOpenSimulator}
        onOpenBroadcast={onOpenBroadcastModal}
        activeConversationsCount={conversations.filter(c => c.status === 'OPEN').length || 18}
      />

      {/* Guided Onboarding & Health Check Banner (SRS AUTH-10, WA-10) */}
      <OnboardingBanner 
        onOpenSimulator={onOpenSimulator || (() => {})} 
        onNavigate={onNavigate} 
      />

      {/* Welcome Greeting */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2 font-['Outfit']">
          Good Morning, {userName} 👋
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Here's what's happening with your <strong>{workspaceTitle}</strong> WhatsApp automation today.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="New Enquiries"
          value={metrics?.activeEnquiries ?? conversations.filter(c => c.status === 'OPEN').length}
          trend="↑ 12%"
          icon={MessageSquare}
          iconBg="bg-emerald-500"
          iconColor="text-white"
        />
        <StatCard
          title="Qualified Leads"
          value={metrics?.leadsCaptured ?? 186}
          trend="↑ 18%"
          icon={Users}
          iconBg="bg-sky-500"
          iconColor="text-white"
        />
        <StatCard
          title="Demo Booked"
          value={metrics?.demosBooked ?? 74}
          trend="↑ 22%"
          icon={Calendar}
          iconBg="bg-violet-600"
          iconColor="text-white"
        />
        <StatCard
          title="Admissions"
          value={metrics?.admissionsConfirmed ?? 28}
          trend="↑ 27%"
          icon={GraduationCap}
          iconBg="bg-amber-500"
          iconColor="text-white"
        />
      </div>

      {/* Charts Section: Funnel + Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <FunnelChart />
        </div>
        <div className="lg:col-span-5">
          <SourceDonut />
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
