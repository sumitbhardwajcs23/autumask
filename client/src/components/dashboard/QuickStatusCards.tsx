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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
      {/* 1. WhatsApp Number */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-all">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-13 h-13 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Phone className="w-6 h-6 fill-white/20" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-slate-800">WhatsApp Number</h4>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-600">Connected</span>
            </div>
            <p className="text-sm font-extrabold text-slate-800 tracking-tight mt-0.5 font-['Outfit'] truncate">
              +91 98765 43210
            </p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('settings')}
          className="text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
        >
          Manage
        </button>
      </div>

      {/* 2. Automation Rules */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-all">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-13 h-13 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Zap className="w-6 h-6 fill-white/20" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-slate-800">Automation Rules</h4>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform" />
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-xs font-bold text-slate-800">12 Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span className="text-xs font-semibold text-slate-500">3 Inactive</span>
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('automation')}
          className="text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
        >
          View Rules
        </button>
      </div>

      {/* 3. AI Assistant */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-all">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-13 h-13 rounded-2xl bg-cyan-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Bot className="w-6 h-6 fill-white/20" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-slate-800">AI Assistant</h4>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-600">Active</span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Using GPT-4o
            </p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('ai')}
          className="text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
        >
          Configure
        </button>
      </div>

      {/* 4. Team Members */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-all">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-13 h-13 rounded-2xl bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Users className="w-6 h-6 fill-white/20" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-slate-800">Team Members</h4>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-slate-800">5 Members</span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold text-emerald-600">3 Online</span>
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('team')}
          className="text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
        >
          Manage
        </button>
      </div>
    </div>
  );
};
