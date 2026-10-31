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
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-card-hover transition-all duration-200 flex items-center justify-between group h-full">
      <div className="flex items-center gap-4 min-w-0">
        {/* Icon Container: Larger 14x14 with 7x7 Icon */}
        <div className={`w-14 h-14 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center transition-transform group-hover:scale-105 duration-200 shadow-2xs shrink-0`}>
          <Icon className="w-7 h-7" />
        </div>

        {/* Content: Legible, High-Contrast Typography */}
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-bold text-slate-500 mb-1 truncate tracking-wide">{title}</p>
          <div className="flex items-baseline gap-2.5">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight font-['Outfit']">
              {value}
            </h3>
            <div className="flex items-center text-xs sm:text-sm font-bold text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
              <span>{trend}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate font-medium">{trendLabel}</p>
        </div>
      </div>
    </div>
  );
};
