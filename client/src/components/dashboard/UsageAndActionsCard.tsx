import React from 'react';
import { 
  ArrowRight, 
  Send, 
  Zap, 
  UserPlus, 
  FileText,
  Bot,
  Cog,
  MessageSquare
} from 'lucide-react';
import { UsageQuota, TabType } from '../../types';

interface UsageAndActionsCardProps {
  usage?: UsageQuota;
  onNavigate: (tab: TabType) => void;
  onOpenAddLeadModal: () => void;
  onOpenBroadcastModal: () => void;
}

export const UsageAndActionsCard: React.FC<UsageAndActionsCardProps> = ({
  usage,
  onNavigate,
  onOpenAddLeadModal,
  onOpenBroadcastModal,
}) => {
  const currentUsage: UsageQuota = usage || {
    aiRepliesUsed: 32450,
    aiRepliesLimit: 50000,
    executionsUsed: 12340,
    executionsLimit: 20000,
    templateMessagesUsed: 8920,
    templateMessagesLimit: 15000,
  };

  const aiPercent = Math.round((currentUsage.aiRepliesUsed / currentUsage.aiRepliesLimit) * 100);
  const execPercent = Math.round((currentUsage.executionsUsed / currentUsage.executionsLimit) * 100);
  const tplPercent = Math.round((currentUsage.templateMessagesUsed / currentUsage.templateMessagesLimit) * 100);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
      {/* Top: Usage This Month */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit']">Usage This Month</h3>
          <button
            onClick={() => onNavigate('billing')}
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View Details</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="space-y-4 sm:space-y-5">
          {/* AI Replies */}
          <div>
            <div className="flex items-center justify-between text-sm sm:text-base mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <span className="font-bold text-slate-800">AI Replies</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-slate-500 font-semibold text-xs sm:text-sm">
                  {currentUsage.aiRepliesUsed.toLocaleString()} / {currentUsage.aiRepliesLimit.toLocaleString()}
                </span>
                <span className="font-extrabold text-slate-900 text-sm sm:text-base font-['Outfit']">{aiPercent}%</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${aiPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Automation Executions */}
          <div>
            <div className="flex items-center justify-between text-sm sm:text-base mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Cog className="w-4.5 h-4.5" />
                </div>
                <span className="font-bold text-slate-800">Automation Executions</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-slate-500 font-semibold text-xs sm:text-sm">
                  {currentUsage.executionsUsed.toLocaleString()} / {currentUsage.executionsLimit.toLocaleString()}
                </span>
                <span className="font-extrabold text-slate-900 text-sm sm:text-base font-['Outfit']">{execPercent}%</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${execPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Template Messages */}
          <div>
            <div className="flex items-center justify-between text-sm sm:text-base mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <span className="font-bold text-slate-800">Template Messages</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-slate-500 font-semibold text-xs sm:text-sm">
                  {currentUsage.templateMessagesUsed.toLocaleString()} / {currentUsage.templateMessagesLimit.toLocaleString()}
                </span>
                <span className="font-extrabold text-slate-900 text-sm sm:text-base font-['Outfit']">{tplPercent}%</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${tplPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Quick Actions */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <h4 className="text-sm font-extrabold text-slate-900 mb-3.5 uppercase tracking-wide">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onOpenBroadcastModal}
            className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 hover:border-emerald-500/50 hover:bg-emerald-50/50 text-sm font-bold text-slate-800 hover:text-emerald-700 transition-all group cursor-pointer shadow-2xs"
          >
            <Send className="w-4.5 h-4.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
            <span className="truncate">Send Broadcast</span>
          </button>

          <button
            onClick={() => onNavigate('workflows')}
            className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 hover:border-blue-500/50 hover:bg-blue-50/50 text-sm font-bold text-slate-800 hover:text-blue-700 transition-all group cursor-pointer shadow-2xs"
          >
            <Zap className="w-4.5 h-4.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
            <span className="truncate">Create Workflow</span>
          </button>

          <button
            onClick={onOpenAddLeadModal}
            className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 hover:border-amber-500/50 hover:bg-amber-50/50 text-sm font-bold text-slate-800 hover:text-amber-700 transition-all group cursor-pointer shadow-2xs"
          >
            <UserPlus className="w-4.5 h-4.5 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
            <span className="truncate">Add New Lead</span>
          </button>

          <button
            onClick={() => onNavigate('templates')}
            className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 hover:border-purple-500/50 hover:bg-purple-50/50 text-sm font-bold text-slate-800 hover:text-purple-700 transition-all group cursor-pointer shadow-2xs"
          >
            <FileText className="w-4.5 h-4.5 text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
            <span className="truncate">Manage Templates</span>
          </button>
        </div>
      </div>
    </div>
  );
};
