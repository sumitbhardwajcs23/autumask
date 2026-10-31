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
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 border border-emerald-900/40 shadow-xs relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-1/3 -bottom-16 w-48 h-48 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar: Connection & WABA Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80 relative z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Smartphone className="w-6 h-6" />
            </div>
            {/* Pulsing Green Live Badge */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-xl font-extrabold text-white font-['Outfit'] tracking-tight truncate">
                Meta WhatsApp Cloud API Gateway
              </h2>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE & CONNECTED
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-slate-300 mt-1 font-mono">
              <span className="text-emerald-400 font-bold">+91 98765 01234</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-sans truncate">Official Verified Account (Prakash Institute Kota)</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">v21.0 Graph API</span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons - Standardized h-9 */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="h-9 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-700/60 flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Test WhatsApp webhook delivery and AI response"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Simulator</span>
            </button>
          )}

          {onOpenBroadcast && (
            <button
              onClick={onOpenBroadcast}
              className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>New Broadcast</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('inbox')}
            className="h-9 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-700/60 flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Inbox</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Connectivity Key Metrics: 4 Equal Dimension Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-5 relative z-10">
        {/* Metric 1: Quality Rating */}
        <div className="h-full min-h-[108px] bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-300 text-xs font-semibold">
            <span>Quality Rating</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-['Outfit']">GREEN</span>
            <span className="text-xs text-slate-300 font-medium">High Standing</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>0.01% spam block rate</span>
          </div>
        </div>

        {/* Metric 2: 24h Customer Service Window */}
        <div className="h-full min-h-[108px] bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-300 text-xs font-semibold">
            <span>24h Service Window</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-xl sm:text-2xl font-black text-sky-400 font-['Outfit']">{activeConversationsCount}</span>
            <span className="text-xs text-slate-300 font-medium">Active Sessions</span>
          </div>
          <div className="text-xs text-sky-300 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            <span>Free-form replies allowed</span>
          </div>
        </div>

        {/* Metric 3: Messaging Limit / Tier */}
        <div className="h-full min-h-[108px] bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-300 text-xs font-semibold">
            <span>WABA Messaging Tier</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-['Outfit']">Tier 1</span>
            <span className="text-xs text-slate-300 font-medium">1,000 / 24h</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Meta Cloud API verified limit</span>
          </div>
        </div>

        {/* Metric 4: Webhook Latency & Uptime */}
        <div className="h-full min-h-[108px] bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-300 text-xs font-semibold">
            <span>Webhook Latency</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-['Outfit']">64ms</span>
            <span className="text-xs text-slate-300 font-medium">Real-time</span>
          </div>
          <div className="text-xs text-emerald-300 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>99.98% delivery uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
};
