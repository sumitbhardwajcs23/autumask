import React from 'react';
import { 
  ArrowRight, 
  MessageSquare, 
  GraduationCap, 
  Calendar, 
  CreditCard, 
  Clock 
} from 'lucide-react';
import { AutomationRule } from '../../types';

interface AutomationStatusCardProps {
  rules: AutomationRule[];
  onToggleRule: (ruleId: string) => void;
  onViewAll: () => void;
}

export const AutomationStatusCard: React.FC<AutomationStatusCardProps> = ({
  rules,
  onToggleRule,
  onViewAll,
}) => {
  const getRuleIcon = (idx: number) => {
    switch (idx % 5) {
      case 0:
        return { icon: MessageSquare, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      case 1:
        return { icon: GraduationCap, bg: 'bg-amber-50 text-amber-600 border-amber-100' };
      case 2:
        return { icon: Calendar, bg: 'bg-purple-50 text-purple-600 border-purple-100' };
      case 3:
        return { icon: CreditCard, bg: 'bg-blue-50 text-blue-600 border-blue-100' };
      default:
        return { icon: Clock, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-800">Automation Status</h3>
        <button
          onClick={onViewAll}
          className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Rules Toggle List */}
      <div className="space-y-4">
        {rules.slice(0, 5).map((rule, idx) => {
          const { icon: Icon, bg } = getRuleIcon(idx);

          return (
            <div
              key={rule.id}
              className="flex items-center justify-between py-1.5 hover:bg-slate-50/60 rounded-xl px-2 -mx-2 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${bg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate">
                    {rule.name}
                  </h4>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {rule.description}
                  </p>
                </div>
              </div>

              {/* iOS style toggle switch */}
              <button
                type="button"
                onClick={() => onToggleRule(rule.id)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  rule.enabled ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    rule.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
