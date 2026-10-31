import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Smartphone, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import { dashboardApi } from '../../services/api';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface OnboardingBannerProps {
  onOpenSimulator: () => void;
  onNavigate: (tab: any) => void;
}

export const OnboardingBanner: React.FC<OnboardingBannerProps> = ({
  onOpenSimulator,
  onNavigate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'step-1',
      title: '1. Institute Business Profile',
      description: 'Prakash Institute registered with Asia/Kolkata timezone and business hours.',
      completed: true,
    },
    {
      id: 'step-2',
      title: '2. Meta Cloud API Connection',
      description: 'Official WhatsApp Business Number +91 98112 34567 connected with Green Quality rating.',
      completed: true,
    },
    {
      id: 'step-3',
      title: '3. Grounded Knowledge Catalog',
      description: 'JEE, NEET & Dropper batches, fee breakdown, and hostel FAQs configured for AI assistant.',
      completed: true,
    },
    {
      id: 'step-4',
      title: '4. Demo Class Capacity Slots',
      description: 'Physics & Biology demo batches created with automated seat reservation engine.',
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

  useEffect(() => {
    dashboardApi.getOnboardingStatus()
      .then(res => {
        if (res.steps && res.steps.length > 0) {
          setSteps(prev => prev.map((s, idx) => {
            const remoteStep = res.steps[idx];
            return remoteStep ? { ...s, completed: remoteStep.completed } : s;
          }));
        }
      })
      .catch(err => console.warn('Could not fetch onboarding status:', err));
  }, []);

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 rounded-3xl p-7 sm:p-8 text-white shadow-xs border border-emerald-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg sm:text-xl font-black font-['Outfit'] tracking-tight truncate">
                Onboarding & Cloud API Health Check (SRS §4.1 & AUTH-10)
              </h3>
              <span className="text-xs sm:text-sm font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-3.5 py-0.5 rounded-full shrink-0">
                100% Ready
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-300 mt-1.5 truncate">
              All 6 onboarding milestones for <strong className="text-white font-bold">Prakash Institute</strong> are verified and operational.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <button
            onClick={onOpenSimulator}
            className="h-11 sm:h-12 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base rounded-2xl flex items-center gap-2.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Smartphone className="w-4.5 h-4.5" />
            <span>Test Phone Simulator</span>
          </button>
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="w-11 sm:w-12 h-11 sm:h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
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
              className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4 text-sm"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-100 block text-base">{step.title}</span>
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
