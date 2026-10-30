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
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-card-hover transition-all duration-300 flex items-center justify-between group">
      <div className="flex items-center gap-4.5">
        {/* Icon Container */}
        <div className={`w-16 h-16 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shadow-sm shrink-0`}>
          <Icon className="w-8 h-8" />
        </div>

        {/* Content */}
        <div>
          <p className="text-sm font-bold text-slate-500 mb-1">{title}</p>
          <div className="flex items-baseline gap-2.5">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">
              {value}
            </h3>
            <div className="flex items-center text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
              <ArrowUpRight className="w-4 h-4 mr-0.5" />
              <span>{trend}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">{trendLabel}</p>
        </div>
      </div>
    </div>
  );
};
