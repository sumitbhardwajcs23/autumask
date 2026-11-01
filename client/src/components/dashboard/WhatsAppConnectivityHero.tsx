import React from 'react';
import { 
  Wifi, 
  ShieldCheck, 
  Clock, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  Zap, 
  MessageSquare,
  Smartphone,
  PhoneCall,
  AlertTriangle,
  ArrowRight,
  Settings,
  Plus
} from 'lucide-react';
import { TabType, WhatsAppAccount } from '../../types';

interface WhatsAppConnectivityHeroProps {
  onNavigate: (tab: TabType) => void;
  onOpenSimulator?: () => void;
  onOpenBroadcast?: () => void;
  onOpenConnectWhatsApp?: () => void;
  whatsappAccount?: WhatsAppAccount | null;
  activeConversationsCount?: number;
}

export const WhatsAppConnectivityHero: React.FC<WhatsAppConnectivityHeroProps> = ({
  onNavigate,
  onOpenSimulator,
  onOpenBroadcast,
  onOpenConnectWhatsApp,
  whatsappAccount,
  activeConversationsCount = 0,
}) => {
  const isConnected = whatsappAccount?.status === 'CONNECTED';
  const displayNumber = whatsappAccount?.displayNumber || '+91 98765 01234';

  // ==========================================
  // 1. UNCONNECTED STATE (Hero with Connect CTA)
  // ==========================================
  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-[#181a20] to-[#261515] text-white rounded-3xl p-7 sm:p-8 border border-rose-900/40 shadow-xs relative overflow-hidden">
        {/* Background Decorative Rings */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-48 h-48 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Bar: Connection Warning & Connect CTA */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-7 border-b border-slate-800/80 relative z-10">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-rose-500 border-2 border-slate-900"></span>
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-['Outfit'] tracking-tight truncate">
                  Meta WhatsApp Cloud API Disconnected
                </h2>
                <span className="text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                  NO NUMBER CONNECTED
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-300 mt-2 font-medium max-w-2xl leading-relaxed">
                Your workspace does not have an active WhatsApp Business number linked yet. Connect your official number to start receiving customer queries, running AI automations, and booking consultations.
              </p>
            </div>
          </div>

          {/* Connect Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 w-full lg:w-auto">
            {onOpenConnectWhatsApp ? (
              <button
                onClick={onOpenConnectWhatsApp}
                className="w-full sm:w-auto h-12 sm:h-13 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 rounded-2xl text-sm sm:text-base font-black transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
              >
                <Zap className="w-5 h-5 fill-slate-950" />
                <span>Connect WhatsApp Number</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('settings')}
                className="w-full sm:w-auto h-12 sm:h-13 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 rounded-2xl text-sm sm:text-base font-black transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Zap className="w-5 h-5 fill-slate-950" />
                <span>Connect WhatsApp Number</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('settings')}
              className="w-full sm:w-auto h-12 sm:h-13 px-5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-2xl text-sm sm:text-base font-extrabold transition-colors border border-slate-700/70 flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
            >
              <Settings className="w-4.5 h-4.5 text-slate-400" />
              <span>Configure in Settings</span>
            </button>
          </div>
        </div>

        {/* 4 Unconnected Status Dimension Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-7 relative z-10">
          <div className="h-full min-h-[125px] bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-slate-300 text-xs sm:text-sm font-bold">
              <span>WhatsApp Number</span>
              <Smartphone className="w-4.5 h-4.5 text-rose-400" />
            </div>
            <div className="my-1.5">
              <span className="text-xl sm:text-2xl font-black text-rose-400 font-['Outfit']">Not Linked</span>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Awaiting Meta WABA Setup</div>
          </div>

          <div className="h-full min-h-[125px] bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-slate-300 text-xs sm:text-sm font-bold">
              <span>Cloud API Gateway</span>
              <Activity className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <div className="my-1.5">
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-['Outfit']">Offline</span>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Inbound Webhook Suspended</div>
          </div>

          <div className="h-full min-h-[125px] bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-slate-300 text-xs sm:text-sm font-bold">
              <span>AI Auto-Reply Bot</span>
              <Zap className="w-4.5 h-4.5 text-slate-400" />
            </div>
            <div className="my-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-300 font-['Outfit']">Standby</span>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Triggers activate on connection</div>
          </div>

          <div className="h-full min-h-[125px] bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-slate-300 text-xs sm:text-sm font-bold">
              <span>Service Status</span>
              <ShieldCheck className="w-4.5 h-4.5 text-slate-400" />
            </div>
            <div className="my-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-300 font-['Outfit']">Action Needed</span>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium">2-minute Meta login setup</div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. CONNECTED STATE (Live & Active)
  // ==========================================
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
              <span className="text-emerald-400 font-bold text-lg sm:text-xl font-mono">{displayNumber}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-200 font-sans font-semibold truncate">Official Verified Account</span>
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
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-['Outfit']">
              {whatsappAccount?.qualityRating || 'GREEN'}
            </span>
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
