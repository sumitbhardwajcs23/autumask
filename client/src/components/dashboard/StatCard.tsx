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
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-card-hover transition-all duration-200 flex items-center justify-between group h-full">
      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
        {/* Icon Container: Generous 16x16 with 8x8 Icon */}
        <div className={`w-16 h-16 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center transition-transform group-hover:scale-105 duration-200 shadow-2xs shrink-0`}>
          <Icon className="w-8 h-8" />
        </div>

        {/* Content: Legible, High-Contrast Typography */}
        <div className="min-w-0">
          <p className="text-sm sm:text-base font-extrabold text-slate-500 mb-1.5 truncate tracking-wide">{title}</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-['Outfit']">
              {value}
            </h3>
            <div className="flex items-center text-sm sm:text-base font-extrabold text-emerald-600">
              <ArrowUpRight className="w-4.5 h-4.5" />
              <span>{trend}</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 truncate font-semibold">{trendLabel}</p>
        </div>
      </div>
    </div>
  );
};
