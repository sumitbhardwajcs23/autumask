import React from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import { Conversation, TabType } from '../../types';

interface RecentConversationsCardProps {
  conversations: Conversation[];
  onSelectConversation: (conv: Conversation) => void;
  onViewAll: () => void;
}

export const RecentConversationsCard: React.FC<RecentConversationsCardProps> = ({
  conversations,
  onSelectConversation,
  onViewAll,
}) => {
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DEMO_BOOKED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'INTERESTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'QUALIFIED':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'NEW': return 'New Lead';
      case 'DEMO_BOOKED': return 'Demo Booked';
      case 'INTERESTED': return 'Interested';
      case 'QUALIFIED': return 'Qualified';
      default: return 'Follow Up';
    }
  };

  const getAvatarBg = (name: string) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-indigo-500', 'bg-amber-500'];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit']">Recent Conversations</h3>
        <button
          onClick={onViewAll}
          className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Conversation list */}
      <div className="divide-y divide-slate-100">
        {conversations.slice(0, 5).map((conv) => {
          const initials = conv.contactName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

          return (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 rounded-2xl px-3 -mx-3 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Avatar with WhatsApp call indicator */}
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full ${getAvatarBg(conv.contactName)} text-white font-bold text-sm flex items-center justify-center shadow-xs`}>
                    {initials}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
                    <Phone className="w-2.5 h-2.5 fill-white" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                      {conv.contactName}
                    </h4>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(conv.leadStatus)}`}>
                      {formatStatus(conv.leadStatus)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 truncate mt-1 font-normal">
                    {conv.lastMessage}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-3">
                <span className="text-xs sm:text-sm text-slate-400 font-semibold">
                  {conv.lastMessageAt}
                </span>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
