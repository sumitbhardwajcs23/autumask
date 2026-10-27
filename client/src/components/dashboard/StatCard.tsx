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
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-card-hover transition-all duration-300 flex items-center justify-between group">
      <div className="flex items-center gap-4">
        {/* Icon Container */}
        <div className={`w-14 h-14 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shadow-sm`}>
          <Icon className="w-7 h-7" />
        </div>

        {/* Content */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1">{title}</p>
          <div className="flex items-baseline gap-2.5">
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight font-['Outfit']">
              {value}
            </h3>
            <div className="flex items-center text-[11px] font-bold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{trend}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{trendLabel}</p>
        </div>
      </div>
    </div>
  );
};
