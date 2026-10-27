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
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Automation Status</h3>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Rules Toggle List */}
      <div className="space-y-3.5">
        {rules.slice(0, 5).map((rule, idx) => {
          const { icon: Icon, bg } = getRuleIcon(idx);

          return (
            <div
              key={rule.id}
              className="flex items-center justify-between py-1 hover:bg-slate-50/60 rounded-xl px-1.5 -mx-1.5 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${bg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">
                    {rule.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {rule.description}
                  </p>
                </div>
              </div>

              {/* iOS style toggle switch */}
              <button
                type="button"
                onClick={() => onToggleRule(rule.id)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  rule.enabled ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    rule.enabled ? 'translate-x-4' : 'translate-x-0'
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
