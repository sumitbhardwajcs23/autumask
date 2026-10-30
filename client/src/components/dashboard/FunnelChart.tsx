import React, { useState } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';

interface FunnelStep {
  stage: string;
  count: number;
  color: string;
}

interface FunnelChartProps {
  data?: FunnelStep[];
  title?: string;
  subtitle?: string;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ 
  data, 
  title = 'Enquiries to Admission Funnel', 
  subtitle = 'End-to-end conversion pipeline' 
}) => {
  const [timeRange, setTimeRange] = useState('Last 30 Days');

  const defaultData: FunnelStep[] = [
    { stage: 'New Enquiries', count: 248, color: '#10b981' },
    { stage: 'Qualified Leads', count: 186, color: '#38bdf8' },
    { stage: 'Interested', count: 112, color: '#3b82f6' },
    { stage: 'Demo Booked', count: 74, color: '#818cf8' },
    { stage: 'Demo Attended', count: 52, color: '#f472b6' },
    { stage: 'Admissions', count: 28, color: '#fb923c' },
  ];

  const steps = data || defaultData;
  const maxVal = Math.max(...steps.map(s => s.count), 250);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="relative">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs">
            <span>{timeRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Funnel Bar Chart */}
      <div className="h-52 flex items-end justify-between gap-3 px-2 pt-6 pb-2">
        {steps.map((step, idx) => {
          const heightPercent = Math.round((step.count / maxVal) * 100);
          const prevCount = idx > 0 ? steps[idx - 1].count : null;
          const dropOffRate = prevCount ? Math.round((step.count / prevCount) * 100) : null;

          return (
            <div key={step.stage} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip on hover */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1 shadow-md z-10 whitespace-nowrap">
                {step.stage}: <span className="font-bold">{step.count}</span>
                {dropOffRate && ` (${dropOffRate}% of prev)`}
              </div>

              {/* Number Label */}
              <span className="text-sm font-extrabold text-slate-800 mb-2 font-['Outfit'] group-hover:text-emerald-600 transition-colors">
                {step.count}
              </span>

              {/* The Bar */}
              <div className="w-full max-w-[52px] bg-slate-100 rounded-t-xl overflow-hidden flex items-end">
                <div
                  className="w-full rounded-t-xl transition-all duration-700 group-hover:brightness-110 shadow-xs"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: step.color,
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Labels */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3.5 px-1 text-center">
        {steps.map((step) => (
          <div key={step.stage} className="flex-1">
            <p className="text-xs font-semibold text-slate-600 leading-tight truncate" title={step.stage}>
              {step.stage}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
