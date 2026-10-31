import React from 'react';
import { 
  Phone, 
  Zap, 
  Bot, 
  Users, 
  ChevronRight 
} from 'lucide-react';
import { TabType } from '../../types';

interface QuickStatusCardsProps {
  onNavigate: (tab: TabType) => void;
}

export const QuickStatusCards: React.FC<QuickStatusCardsProps> = ({ onNavigate }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. WhatsApp Number */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-all h-full">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Phone className="w-8 h-8 fill-white/20" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-base sm:text-lg font-black text-slate-900 truncate">WhatsApp Number</h4>
              <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-transform shrink-0" />
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-bold text-emerald-600">Connected</span>
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-1 font-mono truncate">
              +91 98765 43210
            </p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('settings')}
          className="h-11 px-4.5 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50 text-sm font-bold transition-colors shrink-0 cursor-pointer shadow-2xs"
        >
          Manage
        </button>
      </div>

      {/* 2. Automation Rules */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-all h-full">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Zap className="w-8 h-8 fill-white/20" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-base sm:text-lg font-black text-slate-900 truncate">Automation Rules</h4>
              <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-transform shrink-0" />
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-sm font-bold text-slate-800">12 Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span className="text-sm font-semibold text-slate-500">3 Off</span>
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('automation')}
          className="h-11 px-4.5 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50 text-sm font-bold transition-colors shrink-0 cursor-pointer shadow-2xs"
        >
          Rules
        </button>
      </div>

      {/* 3. AI Assistant */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-all h-full">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Bot className="w-8 h-8 fill-white/20" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-base sm:text-lg font-black text-slate-900 truncate">AI Assistant</h4>
              <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-transform shrink-0" />
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-bold text-emerald-600">Active</span>
            </div>
            <p className="text-sm sm:text-base text-slate-700 font-semibold mt-1">
              GPT-4o Omnichannel
            </p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('ai')}
          className="h-11 px-4.5 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50 text-sm font-bold transition-colors shrink-0 cursor-pointer shadow-2xs"
        >
          Setup
        </button>
      </div>

      {/* 4. Team Members */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-all h-full">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-8 h-8 fill-white/20" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-base sm:text-lg font-black text-slate-900 truncate">Team Members</h4>
              <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-transform shrink-0" />
            </div>
            <div className="flex items-center gap-2.5 mt-1.5">
              <span className="text-sm font-bold text-slate-800">5 Staff</span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-bold text-emerald-600">3 Online</span>
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('team')}
          className="h-11 px-4.5 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50 text-sm font-bold transition-colors shrink-0 cursor-pointer shadow-2xs"
        >
          Staff
        </button>
      </div>
    </div>
  );
};
