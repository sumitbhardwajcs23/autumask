import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  Award, 
  ArrowUpRight, 
  Calendar, 
  Download, 
  CheckCircle, 
  Sparkles,
  Zap,
  PhoneCall
} from 'lucide-react';
import { UsageQuota } from '../../types';

interface AnalyticsViewProps {
  usage: UsageQuota;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ usage }) => {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('30D');

  // Realistic metrics matching coaching institute performance (Prakash Institute)
  const funnelData = [
    { stage: '1. Inbound Enquiries', count: 248, rate: '100%', color: 'bg-emerald-500', barWidth: '100%' },
    { stage: '2. Qualified Leads', count: 186, rate: '75.0%', color: 'bg-teal-500', barWidth: '75%' },
    { stage: '3. Interested in Batch', count: 112, rate: '45.1%', color: 'bg-blue-500', barWidth: '45%' },
    { stage: '4. Demo Booked', count: 74, rate: '29.8%', color: 'bg-purple-500', barWidth: '30%' },
    { stage: '5. Demo Attended', count: 52, rate: '20.9%', color: 'bg-pink-500', barWidth: '21%' },
    { stage: '6. Confirmed Admissions', count: 28, rate: '11.3%', color: 'bg-amber-500', barWidth: '11%' },
  ];

  const sourceData = [
    { name: 'Website Landing Page', leads: 79, percentage: 32, admissions: 11, color: 'bg-blue-600' },
    { name: 'Facebook & Instagram Ads', leads: 60, percentage: 24, admissions: 7, color: 'bg-indigo-600' },
    { name: 'Instagram Direct DM', leads: 45, percentage: 18, admissions: 4, color: 'bg-pink-600' },
    { name: 'Direct WhatsApp Chat', leads: 35, percentage: 14, admissions: 3, color: 'bg-emerald-600' },
    { name: 'Student Referrals (PSAT)', leads: 20, percentage: 8, admissions: 3, color: 'bg-amber-500' },
    { name: 'Walk-ins & Others', leads: 9, percentage: 4, admissions: 0, color: 'bg-slate-500' },
  ];

  const hourlyVolume = [
    { hour: '8 AM', count: 12 },
    { hour: '10 AM', count: 48 },
    { hour: '12 PM', count: 35 },
    { hour: '2 PM', count: 22 },
    { hour: '4 PM', count: 42 },
    { hour: '6 PM', count: 56 },
    { hour: '8 PM', count: 28 },
    { hour: '10 PM', count: 15 },
  ];

  const maxVolume = Math.max(...hourlyVolume.map(h => h.count));

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Funnel Stage,Count,Conversion Rate\n" + 
      funnelData.map(f => `"${f.stage}",${f.count},"${f.rate}"`).join("\n") +
      "\n\nSource,Leads,Percentage,Admissions\n" +
      sourceData.map(s => `"${s.name}",${s.leads},${s.percentage}%,${s.admissions}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `prakash_institute_analytics_${timeRange.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full px-6 sm:px-8 lg:px-10 py-8 space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-['Outfit'] flex items-center gap-3">
            <span>Institute Conversion & Automation Analytics</span>
            <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              Live Feed
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-1.5 font-normal">
            Track student enquiry velocity, demo show-up rate, and WhatsApp AI bot ROI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['7D', '30D', '90D'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Level Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Enquiries</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 font-['Outfit']">248</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.2% vs last month</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Demo Booking Conversion</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 font-['Outfit']">29.8%</div>
          <div className="flex items-center gap-1 text-[11px] text-purple-600 font-bold mt-1">
            <span>74 Demos Scheduled</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>AI Response Latency</span>
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 font-['Outfit']">1.2s</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
            <CheckCircle className="w-3 h-3" />
            <span>99.8% within 2s SLA</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Confirmed Admissions</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800 font-['Outfit']">28</div>
          <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold mt-1">
            <span>₹12.6L Tuition Revenue</span>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Full Conversion Funnel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Coaching Admission Funnel (SRS §11)</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Stage-by-stage drop-off</span>
          </div>

          <div className="space-y-3 pt-2">
            {funnelData.map((f, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{f.stage}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-800">{f.count}</span>
                    <span className="text-slate-400 text-[10px]">({f.rate})</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`${f.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: f.barWidth }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 mt-4 text-[11px] text-slate-500 flex items-center justify-between">
            <span>💡 <strong>Insight:</strong> 70.3% of students who attended demo converted to paid admission!</span>
          </div>
        </div>

        {/* Right Column: Inbound Traffic & Lead Source Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Attribution & Lead Sources
              </h3>
              <span className="text-xs text-slate-400 font-medium">ROI by Channel</span>
            </div>

            <div className="space-y-3">
              {sourceData.map((src, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${src.color}`}></span>
                    <span className="font-semibold text-slate-700">{src.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-800">{src.leads} leads</span>
                    <span className="text-[10px] text-emerald-600 block">{src.admissions} admitted</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-900 mt-2">
            <span>Top Performing Channel: <strong>Website Landing Page</strong> (11 admissions, 13.9% conversion)</span>
          </div>
        </div>
      </div>

      {/* Hourly Message Volume & Counsellor SLA Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Volume Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Inquiry Traffic by Hour (Peak Times)</span>
            </h3>
            <span className="text-xs text-slate-400">Peak: 10 AM & 6 PM</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
            {hourlyVolume.map((item, i) => {
              const heightPercent = (item.count / maxVolume) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </span>
                  <div 
                    className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition-all"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                    {item.hour}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500">
            Bot auto-responds instantly during peak evening hours when staff is busy counselling demo students.
          </p>
        </div>

        {/* Staff SLA & Human Takeover Benchmark */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-purple-600" />
              <span>Counsellor SLA Benchmark</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-700">Sumit Bhardwaj (Admin)</div>
                  <div className="text-[10px] text-slate-400">Avg First Response Time</div>
                </div>
                <div className="text-right font-mono font-bold text-emerald-600 text-sm">
                  3.4 mins
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-700">Priya Sharma (Agent)</div>
                  <div className="text-[10px] text-slate-400">Avg First Response Time</div>
                </div>
                <div className="text-right font-mono font-bold text-emerald-600 text-sm">
                  4.8 mins
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-700">AutoMask AI Bot (Automated)</div>
                  <div className="text-[10px] text-slate-400">Median Instant Latency</div>
                </div>
                <div className="text-right font-mono font-bold text-blue-600 text-sm">
                  1.2 secs
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400">
            SLA target: &lt; 15 mins human response (100% compliance maintained).
          </div>
        </div>
      </div>
    </div>
  );
};
