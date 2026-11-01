import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Smartphone, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck,
  AlertCircle,
  Plus
} from 'lucide-react';
import { dashboardApi } from '../../services/api';
import { WhatsAppAccount } from '../../types';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  actionText?: string;
  action?: () => void;
}

interface OnboardingBannerProps {
  onOpenSimulator: () => void;
  onNavigate: (tab: any) => void;
  whatsappAccount?: WhatsAppAccount | null;
  onOpenConnectWhatsApp?: () => void;
}

export const OnboardingBanner: React.FC<OnboardingBannerProps> = ({
  onOpenSimulator,
  onNavigate,
  whatsappAccount,
  onOpenConnectWhatsApp,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isWaConnected = whatsappAccount?.status === 'CONNECTED';
  const waNumber = whatsappAccount?.displayNumber || '+91 98112 34567';

  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'step-1',
      title: '1. Institute Business Profile',
      description: 'Business profile registered with Asia/Kolkata timezone and operating hours.',
      completed: true,
    },
    {
      id: 'step-2',
      title: '2. Meta Cloud API Connection',
      description: isWaConnected 
        ? `Official WhatsApp Business Number ${waNumber} connected with Green Quality rating.`
        : 'Connect your official WhatsApp Business phone number using Meta Cloud API.',
      completed: isWaConnected,
      actionText: isWaConnected ? undefined : 'Connect Number',
      action: onOpenConnectWhatsApp,
    },
    {
      id: 'step-3',
      title: '3. Grounded Knowledge Catalog',
      description: 'Course syllabus, fee breakdown, and hostel FAQs configured for AI assistant.',
      completed: true,
    },
    {
      id: 'step-4',
      title: '4. Demo Class Capacity Slots',
      description: 'Capacity slots created with automated seat reservation engine.',
      completed: true,
    },
    {
      id: 'step-5',
      title: '5. Prebuilt Automation Rules',
      description: 'Welcome greetings, fee disclosures, demo booking flows, and opt-out handlers active.',
      completed: true,
    },
    {
      id: 'step-6',
      title: '6. End-to-End Inbound Test',
      description: 'Verified with interactive WhatsApp Phone Simulator and decision router.',
      completed: true,
    },
  ]);

  // Update step 2 when whatsappAccount changes
  useEffect(() => {
    setSteps(prev => prev.map(s => {
      if (s.id === 'step-2') {
        return {
          ...s,
          completed: isWaConnected,
          description: isWaConnected 
            ? `Official WhatsApp Business Number ${waNumber} connected with Green Quality rating.`
            : 'Connect your official WhatsApp Business phone number using Meta Cloud API.',
          actionText: isWaConnected ? undefined : 'Connect Number',
          action: onOpenConnectWhatsApp,
        };
      }
      return s;
    }));
  }, [isWaConnected, waNumber, onOpenConnectWhatsApp]);

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className={`rounded-3xl p-7 sm:p-8 text-white shadow-xs border ${
      isWaConnected 
        ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/20'
        : 'bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/60 border-amber-500/30'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
            isWaConnected 
              ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-400' 
              : 'bg-amber-500/20 border border-amber-400/30 text-amber-400'
          }`}>
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg sm:text-xl font-black font-['Outfit'] tracking-tight truncate">
                Onboarding & Cloud API Health Check
              </h3>
              <span className={`text-xs sm:text-sm font-extrabold px-3.5 py-0.5 rounded-full shrink-0 border ${
                progressPercent === 100 
                  ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30' 
                  : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
              }`}>
                {progressPercent === 100 ? '100% Operational' : `${progressPercent}% - Setup In Progress`}
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-300 mt-1.5 truncate">
              {progressPercent === 100 
                ? 'All onboarding milestones are verified and operational.' 
                : 'Connect your WhatsApp number to complete workspace onboarding.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0 mt-1 sm:mt-0">
          {!isWaConnected && onOpenConnectWhatsApp && (
            <button
              onClick={onOpenConnectWhatsApp}
              className="flex-1 sm:flex-initial h-11 sm:h-12 px-4 sm:px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Connect WhatsApp</span>
            </button>
          )}

          <button
            onClick={onOpenSimulator}
            className="flex-1 sm:flex-initial h-11 sm:h-12 px-4 sm:px-5 bg-white/10 hover:bg-white/15 text-white font-extrabold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2.5 transition-colors border border-white/10 shadow-2xs cursor-pointer"
          >
            <Smartphone className="w-4.5 h-4.5" />
            <span>Test Simulator</span>
          </button>

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="w-11 sm:w-12 h-11 sm:h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Toggle Milestone Details"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm sm:text-base text-slate-300 mb-2.5">
          <span className="font-semibold">Milestones Completed: <strong className="text-white font-bold">{completedCount}</strong> of {steps.length}</span>
          <span className="font-mono font-bold text-emerald-400 text-base">{progressPercent}%</span>
        </div>
        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-400 h-full rounded-full transition-all duration-700 shadow-xs" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Expanded Milestone Details */}
      {isExpanded && (
        <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map(step => (
            <div 
              key={step.id} 
              className={`p-5 rounded-2xl border flex items-start gap-4 text-sm ${
                step.completed 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-amber-950/20 border-amber-500/30 ring-1 ring-amber-500/20'
              }`}
            >
              {step.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-100 block text-base truncate">{step.title}</span>
                  {!step.completed && step.actionText && (
                    <button
                      onClick={step.action}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shrink-0 transition-colors cursor-pointer"
                    >
                      {step.actionText}
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
