import React from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  trend: string;
  trendLabel?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendLabel = 'vs last 7 days',
  icon: Icon,
  iconBg,
  iconColor,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-card-hover transition-all duration-200 flex items-center justify-between group h-full">
      <div className="flex items-center gap-4 min-w-0">
        {/* Icon Container */}
        <div className={`w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center transition-transform group-hover:scale-105 duration-200 shadow-2xs shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 mb-0.5 truncate">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-['Outfit']">
              {value}
            </h3>
            <div className="flex items-center text-xs font-bold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{trend}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{trendLabel}</p>
        </div>
      </div>
    </div>
  );
};
