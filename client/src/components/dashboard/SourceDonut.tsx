import React from 'react';

interface SourceItem {
  name: string;
  percentage: number;
  count: number;
  color: string;
}

interface SourceDonutProps {
  sources?: SourceItem[];
  total?: number;
}

export const SourceDonut: React.FC<SourceDonutProps> = ({
  sources,
  total = 248
}) => {
  const defaultSources: SourceItem[] = [
    { name: 'Website', percentage: 32, count: 79, color: '#0284c7' },
    { name: 'Facebook Ads', percentage: 24, count: 60, color: '#2563eb' },
    { name: 'Instagram', percentage: 18, count: 45, color: '#d946ef' },
    { name: 'Direct Chat', percentage: 14, count: 35, color: '#06b6d4' },
    { name: 'Reference', percentage: 8, count: 20, color: '#f97316' },
    { name: 'Others', percentage: 4, count: 9, color: '#64748b' },
  ];

  const items = sources || defaultSources;

  // SVG Donut calculation
  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-slate-800">Lead Sources</h3>
          <p className="text-xs text-slate-500">Attribution across acquisition channels</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 py-2">
        {/* Donut Chart SVG */}
        <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
            {items.map((item) => {
              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += item.percentage;

              return (
                <circle
                  key={item.name}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-slate-800 tracking-tight font-['Outfit']">
              {total}
            </span>
            <span className="text-xs text-slate-400 font-semibold">Total</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 grid grid-cols-1 gap-2.5">
          {items.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs hover:bg-slate-50 p-1.5 rounded-xl transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-slate-700 font-medium text-xs truncate">{item.name}</span>
              </div>
              <span className="font-bold text-slate-800 text-xs font-['Outfit']">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
