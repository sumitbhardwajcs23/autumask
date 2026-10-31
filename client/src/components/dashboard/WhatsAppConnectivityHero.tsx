import React from 'react';
import { 
  Wifi, 
  ShieldCheck, 
  Clock, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ArrowUpRight, 
  Activity, 
  Zap, 
  MessageSquare,
  Smartphone,
  PhoneCall
} from 'lucide-react';
import { TabType } from '../../types';

interface WhatsAppConnectivityHeroProps {
  onNavigate: (tab: TabType) => void;
  onOpenSimulator?: () => void;
  onOpenBroadcast?: () => void;
  activeConversationsCount?: number;
}

export const WhatsAppConnectivityHero: React.FC<WhatsAppConnectivityHeroProps> = ({
  onNavigate,
  onOpenSimulator,
  onOpenBroadcast,
  activeConversationsCount = 24,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-7 sm:p-8 border border-emerald-900/40 shadow-xs relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-1/3 -bottom-16 w-48 h-48 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar: Connection & WABA Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-7 border-b border-slate-800/80 relative z-10">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Smartphone className="w-8 h-8" />
            </div>
            {/* Pulsing Green Live Badge */}
            <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-['Outfit'] tracking-tight truncate">
                Meta WhatsApp Cloud API Gateway
              </h2>
              <span className="text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE & CONNECTED
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-sm sm:text-base text-slate-300 mt-2 font-mono">
              <span className="text-emerald-400 font-bold text-lg sm:text-xl font-mono">+91 98765 01234</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-200 font-sans font-semibold truncate">Official Verified Account (Prakash Institute Kota)</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-sans">v21.0 Graph API</span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 w-full lg:w-auto">
          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="w-full sm:w-auto h-11 sm:h-12 px-4 sm:px-5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-2xl text-sm sm:text-base font-extrabold transition-colors border border-slate-700/70 flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
              title="Test WhatsApp webhook delivery and AI response"
            >
              <Zap className="w-4.5 h-4.5 text-amber-400" />
              <span>Test Simulator</span>
            </button>
          )}

          {onOpenBroadcast && (
            <button
              onClick={onOpenBroadcast}
              className="w-full sm:w-auto h-11 sm:h-12 px-4 sm:px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm sm:text-base font-extrabold transition-all shadow-2xs flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Send className="w-4.5 h-4.5" />
              <span>New Broadcast</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('inbox')}
            className="w-full sm:w-auto h-11 sm:h-12 px-4 sm:px-5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-2xl text-sm sm:text-base font-extrabold transition-colors border border-slate-700/70 flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
          >
            <MessageSquare className="w-4.5 h-4.5 text-emerald-400" />
            <span>Open Inbox</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Connectivity Key Metrics: 4 Equal Dimension Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-7 relative z-10">
        {/* Metric 1: Quality Rating */}
        <div className="h-full min-h-[135px] bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-300 text-sm sm:text-base font-bold">
            <span>Quality Rating</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2.5 my-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-['Outfit']">GREEN</span>
            <span className="text-sm sm:text-base text-slate-300 font-semibold">High Standing</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>0.01% spam block rate</span>
          </div>
        </div>

        {/* Metric 2: 24h Customer Service Window */}
        <div className="h-full min-h-[135px] bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-300 text-sm sm:text-base font-bold">
            <span>24h Service Window</span>
            <Clock className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2.5 my-2">
            <span className="text-3xl sm:text-4xl font-black text-sky-400 font-['Outfit']">{activeConversationsCount}</span>
            <span className="text-sm sm:text-base text-slate-300 font-semibold">Active Sessions</span>
          </div>
          <div className="text-xs sm:text-sm text-sky-300 flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            <span>Free-form replies allowed</span>
          </div>
        </div>

        {/* Metric 3: Messaging Limit / Tier */}
        <div className="h-full min-h-[135px] bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-300 text-sm sm:text-base font-bold">
            <span>WABA Messaging Tier</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2.5 my-2">
            <span className="text-3xl sm:text-4xl font-black text-amber-400 font-['Outfit']">Tier 1</span>
            <span className="text-sm sm:text-base text-slate-300 font-semibold">1,000 / 24h</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Meta Cloud API verified limit</span>
          </div>
        </div>

        {/* Metric 4: Webhook Latency & Uptime */}
        <div className="h-full min-h-[135px] bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-300 text-sm sm:text-base font-bold">
            <span>Webhook Latency</span>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2.5 my-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-['Outfit']">64ms</span>
            <span className="text-sm sm:text-base text-slate-300 font-semibold">Real-time</span>
          </div>
          <div className="text-xs sm:text-sm text-emerald-300 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
            <span>99.98% delivery uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
};
