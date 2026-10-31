import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Send, 
  Phone, 
  CheckCheck, 
  Clock, 
  User as UserIcon,
  ShieldAlert, 
  Sparkles, 
  Tag, 
  Paperclip,
  CheckCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  MoreVertical,
  Bot,
  Calendar,
  Lock,
  FileText,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  X,
  Sliders,
  ArrowLeft
} from 'lucide-react';
import { Conversation, Message, LeadStatus, User, QuickReply } from '../../types';
import { conversationsApi, leadsApi, ApiError } from '../../services/api';

interface SharedInboxViewProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conv: Conversation) => void;
  onSendMessage: (convId: string, body: string, senderName?: string) => void;
  onToggleTakeover: (convId: string) => void;
  onUpdateLeadStatus: (phone: string, status: LeadStatus) => void;
  currentUser?: User;
}

export const SharedInboxView: React.FC<SharedInboxViewProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onSendMessage,
  onToggleTakeover,
  onUpdateLeadStatus,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'TAKEOVER'>('ALL');
  const [inputText, setInputText] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [isWindowExpiredSimulated, setIsWindowExpiredSimulated] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('demo_reminder_physics');
  const [templateVar, setTemplateVar] = useState('Tomorrow 5:00 PM');
  const [assignedAgent, setAssignedAgent] = useState<string>(currentUser?.fullName || 'Dr. Prakash Sharma');
  const [notesList, setNotesList] = useState<string[]>([
    'Student called on morning helpline inquiring about hostel fees.',
    'Parent requested callback after 6:00 PM.',
  ]);

  // Responsive mobile view state ('LIST' or 'CHAT')
  const [mobileView, setMobileView] = useState<'LIST' | 'CHAT'>('LIST');
  const [isMobileCrmOpen, setIsMobileCrmOpen] = useState(false);

  // Quick Canned Replies State (Audio 5 Requirement)
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([
    {
      id: 'qr-1',
      keyword: '/fees',
      title: 'Course Fee Structure',
      body: 'Namaste! JEE Dropper batch ki annual fees ₹45,000 hai jisme complete study material, weekly tests aur doubt clearing included hai. 2 installments me payment option bhi available hai.',
      category: 'Admissions'
    },
    {
      id: 'qr-2',
      keyword: '/demo',
      title: 'Demo Class Slot',
      body: 'Aap kal sham 5:00 baje Physics demo masterclass attend kar sakte hain Prakash Institute me. Reply CONFIRM to secure your seat.',
      category: 'Bookings'
    },
    {
      id: 'qr-3',
      keyword: '/address',
      title: 'Campus Location & Helpline',
      body: 'Prakash Institute Campus: Plot 42, Knowledge Park, Vigyan Nagar, Kota (Raj) - 324005. Helpline: +91 98765 01234.',
      category: 'General'
    },
    {
      id: 'qr-4',
      keyword: '/hostel',
      title: 'Hostel & Mess Facilities',
      body: 'Hamare campus ke paas verified separate boys aur girls hostels available hain with hygienic 4-time food mess starting at ₹7,500/month. Reply TOUR to visit.',
      category: 'Facilities'
    },
    {
      id: 'qr-5',
      keyword: '/scholarship',
      title: 'PSAT Scholarship Test',
      body: 'Prakash Scholarship Admission Test (PSAT) har Sunday conduct hota hai. 85%+ score karne par tuition fees par up to 40% waiver milta hai.',
      category: 'Scholarship'
    },
    {
      id: 'qr-6',
      keyword: '/timings',
      title: 'Daily Batch Timings',
      body: 'Morning batch timings: 8:00 AM to 1:30 PM. Evening batch timings: 3:00 PM to 8:30 PM. Daily 3 lecture slots with 45-min doubt clearing session.',
      category: 'Academics'
    }
  ]);
  const [quickFilterKeyword, setQuickFilterKeyword] = useState('');
  const [isQuickManagerOpen, setIsQuickManagerOpen] = useState(false);
  const [editingQuickReply, setEditingQuickReply] = useState<QuickReply | null>(null);
  const [qrKeyword, setQrKeyword] = useState('');
  const [qrTitle, setQrTitle] = useState('');
  const [qrBody, setQrBody] = useState('');
  const [qrCategory, setQrCategory] = useState('Admissions');

  const activeConv = selectedConversation || conversations[0];

  // Dynamic thread messages loaded from backend
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [accessedViaGrant, setAccessedViaGrant] = useState(false);

  // Fetch real messages from backend whenever active conversation changes
  const loadMessages = async (convId: string) => {
    if (!convId) return;
    setLoadingMessages(true);
    setMessageError(null);

    try {
      const res = await conversationsApi.getMessages(convId);
      setThreadMessages(res.messages || []);
      setAccessedViaGrant(Boolean(res.accessedViaSupportGrant));
    } catch (err: any) {
      console.error('Failed to load conversation messages:', err);
      setMessageError(err.message || 'Unable to load messages from server');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!activeConv?.id) return;
    loadMessages(activeConv.id);

    // Auto-refresh thread in background so messages sent via simulator appear immediately
    const pollInterval = setInterval(() => {
      conversationsApi.getMessages(activeConv.id)
        .then(res => {
          if (res?.messages && res.messages.length > 0) {
            setThreadMessages(res.messages);
          }
        })
        .catch(() => {});
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [activeConv?.id, activeConv?.lastMessage]);

  const filteredConversations = conversations.filter(c => {
    if (filterType === 'UNREAD' && c.unreadCount === 0) return false;
    if (filterType === 'TAKEOVER' && !c.takeoverActive) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.contactName.toLowerCase().includes(q) || c.phone.includes(q) || c.lastMessage.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSend = async () => {
    if (!inputText.trim() || !activeConv || isSending) return;
    const textToSend = inputText.trim();
    setInputText('');
    setMessageError(null);
    setIsSending(true);

    const activeSenderName = currentUser?.fullName || assignedAgent || 'Counsellor';

    try {
      const res = await conversationsApi.sendMessage(activeConv.id, { 
        body: textToSend,
        senderName: activeSenderName,
      });
      if (res.message) {
        setThreadMessages(prev => [...prev, { ...res.message!, senderName: res.message!.senderName || activeSenderName }]);
      } else {
        const optimisticMsg: Message = {
          id: res.providerMessageId || `msg-${Date.now()}`,
          conversationId: activeConv.id,
          direction: 'OUTBOUND',
          body: textToSend,
          senderType: activeConv.takeoverActive ? 'agent' : 'bot',
          senderName: activeConv.takeoverActive ? activeSenderName : '🤖 AutoMask AI Bot',
          status: 'SENT',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
        };
        setThreadMessages(prev => [...prev, optimisticMsg]);
      }
      onSendMessage(activeConv.id, textToSend, activeSenderName);
    } catch (err: any) {
      console.error('Send message failed:', err);
      const isWindowExpired = err?.data?.errorCode === 'SERVICE_WINDOW_EXPIRED' ||
        err?.message?.includes('SERVICE_WINDOW_EXPIRED') ||
        err?.status === 400;
      
      if (isWindowExpired) {
        setIsWindowExpiredSimulated(true);
      }
      setMessageError(err.message || 'Failed to deliver message via WhatsApp Cloud API');
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenAddQuickReply = () => {
    setEditingQuickReply(null);
    setQrKeyword('');
    setQrTitle('');
    setQrBody('');
    setQrCategory('Admissions');
    setIsQuickManagerOpen(true);
  };

  const handleEditQuickReply = (qr: QuickReply) => {
    setEditingQuickReply(qr);
    setQrKeyword(qr.keyword);
    setQrTitle(qr.title);
    setQrBody(qr.body);
    setQrCategory(qr.category || 'General');
    setIsQuickManagerOpen(true);
  };

  const handleDeleteQuickReply = (id: string) => {
    setQuickReplies(prev => prev.filter(q => q.id !== id));
  };

  const handleSaveQuickReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrKeyword.trim() || !qrTitle.trim() || !qrBody.trim()) {
      alert('Please fill out all shortcut fields (keyword, title, and message body).');
      return;
    }
    const cleanKeyword = qrKeyword.startsWith('/') ? qrKeyword.trim() : `/${qrKeyword.trim()}`;
    
    if (editingQuickReply) {
      setQuickReplies(prev => prev.map(q => q.id === editingQuickReply.id ? {
        ...q,
        keyword: cleanKeyword,
        title: qrTitle.trim(),
        body: qrBody.trim(),
        category: qrCategory,
      } : q));
    } else {
      const newQr: QuickReply = {
        id: `qr-${Date.now()}`,
        keyword: cleanKeyword,
        title: qrTitle.trim(),
        body: qrBody.trim(),
        category: qrCategory,
      };
      setQuickReplies(prev => [...prev, newQr]);
    }

    setEditingQuickReply(null);
    setQrKeyword('');
    setQrTitle('');
    setQrBody('');
  };

  const handleSendTemplateSubmit = async () => {
    if (!activeConv) return;
    setIsSending(true);
    setMessageError(null);

    const activeSenderName = currentUser?.fullName || assignedAgent || 'Counsellor';

    try {
      const res = await conversationsApi.sendMessage(activeConv.id, {
        templateName: selectedTemplate,
        senderName: activeSenderName,
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: activeConv.contactName },
              { type: 'text', text: templateVar },
            ],
          },
        ],
      });

      if (res.message) {
        setThreadMessages(prev => [...prev, { ...res.message!, senderName: res.message!.senderName || activeSenderName }]);
      } else {
        const templateBody = `[Template: ${selectedTemplate}] Sent to ${activeConv.contactName} (${templateVar})`;
        const tplMsg: Message = {
          id: res.providerMessageId || `tpl-${Date.now()}`,
          conversationId: activeConv.id,
          direction: 'OUTBOUND',
          body: templateBody,
          senderType: 'agent',
          senderName: activeSenderName,
          status: 'DELIVERED',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'template',
        };
        setThreadMessages(prev => [...prev, tplMsg]);
      }

      setIsWindowExpiredSimulated(false);
      setIsTemplateModalOpen(false);
    } catch (err: any) {
      console.error('Template send failed:', err);
      setMessageError(err.message || 'Failed to send template message via WhatsApp Cloud API');
    } finally {
      setIsSending(false);
    }
  };

  const handleAddNote = () => {
    if (!internalNote.trim()) return;
    setNotesList(prev => [...prev, internalNote]);
    setInternalNote('');
  };

  return (
    <div className="h-full flex-1 flex overflow-hidden bg-white min-h-0">
      {/* 1. Left: Conversation List (Full width on mobile when in 'LIST' view) */}
      <div className={`w-full md:w-80 lg:w-88 xl:w-96 border-r border-slate-200 flex flex-col h-full bg-slate-50/50 flex-shrink-0 min-h-0 ${
        mobileView === 'CHAT' ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Inbox Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-800 font-['Outfit']">Shared Inbox</h2>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              {conversations.length} Active
            </span>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat or phone..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                filterType === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('UNREAD')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                filterType === 'UNREAD' ? 'bg-emerald-600 text-white' : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilterType('TAKEOVER')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                filterType === 'TAKEOVER' ? 'bg-blue-600 text-white' : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Takeover
            </button>
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
          {filteredConversations.map((conv) => {
            const isSelected = activeConv?.id === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv);
                  setMobileView('CHAT');
                }}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-600 shadow-2xs' : 'hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm sm:text-base font-bold text-slate-900 truncate">{conv.contactName}</span>
                    {conv.takeoverActive && (
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                        Agent
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-medium shrink-0">{conv.lastMessageAt}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs sm:text-sm text-slate-600 truncate flex-1">{conv.lastMessage}</p>
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2.5">
                  <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                    {conv.leadStatus}
                  </span>
                  {conv.leadCourse && (
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {conv.leadCourse}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Middle: Active Chat Window (Full width on mobile when in 'CHAT' view) */}
      {activeConv ? (
        <div className={`flex-1 flex flex-col h-full bg-[#f8fafc] border-r border-slate-200 min-w-0 min-h-0 ${
          mobileView === 'LIST' ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Thread Header */}
          <div className="p-3 sm:p-4.5 bg-white border-b border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
              {/* Mobile Back Button to return to list */}
              <button
                onClick={() => setMobileView('LIST')}
                className="md:hidden p-2 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-1 font-bold shrink-0 cursor-pointer"
                title="Back to conversation list"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </button>

              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-600 text-white font-extrabold text-sm sm:text-base flex items-center justify-center shadow-xs shrink-0">
                {activeConv.contactName.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-lg font-bold text-slate-900 truncate">{activeConv.contactName}</h3>
                  <span className="text-xs text-slate-500 font-mono hidden sm:inline">{activeConv.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-sm text-emerald-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="truncate">WhatsApp Business Cloud API</span>
                </div>
              </div>
            </div>

            {/* Counsellor Takeover Switch & Window Status */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <button
                onClick={() => onToggleTakeover(activeConv.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                  activeConv.takeoverActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {activeConv.takeoverActive ? (
                  <>
                    <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Human Takeover</span>
                    <span className="sm:hidden">Takeover</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                    <span className="hidden sm:inline">Take Over Chat</span>
                    <span className="sm:hidden">Takeover</span>
                  </>
                )}
              </button>

              {/* View CRM Details on Mobile/Tablet */}
              <button
                onClick={() => setIsMobileCrmOpen(true)}
                className="xl:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0 cursor-pointer"
                title="View student profile & notes"
              >
                <UserIcon className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>

          {/* 24-hr Service Window Banner (WA-07, WA-08, WA-09) */}
          <div className={`border-b px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm transition-colors ${
            isWindowExpiredSimulated 
              ? 'bg-rose-50 border-rose-200 text-rose-900' 
              : 'bg-emerald-50 border-emerald-200/80 text-emerald-900'
          }`}>
            <div className="flex items-center gap-2.5 font-medium text-xs sm:text-sm">
              {isWindowExpiredSimulated ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>
                    <strong>24h Service Window Expired:</strong> Free-form messaging blocked by Meta policy. Send an approved template to re-engage.
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Customer Service Window: <strong className="text-emerald-700 font-bold">21h 36m remaining</strong> for free-form replies.
                  </span>
                </>
              )}
            </div>

            {/* Simulation switch for testing compliance */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider hidden sm:inline">Test Window:</span>
              <button
                onClick={() => setIsWindowExpiredSimulated(prev => !prev)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  isWindowExpiredSimulated
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100/50'
                }`}
                title="Toggle between Open and Expired 24-hr window to test Meta compliance"
              >
                {isWindowExpiredSimulated ? '🔴 Expired (Blocked)' : '🟢 Active Window'}
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#f1f5f9]/50 min-h-0">
            {accessedViaGrant && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs sm:text-sm rounded-2xl flex items-center gap-2.5 mb-2 shadow-xs">
                <ShieldAlert className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>
                  <strong>SRS Line 615 Privacy Safeguard:</strong> Message content accessed via active Owner-issued support grant.
                </span>
              </div>
            )}

            {messageError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{messageError}</span>
                </div>
                <button
                  onClick={() => loadMessages(activeConv.id)}
                  className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {loadingMessages ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <span className="text-sm font-semibold">Fetching real conversation history...</span>
              </div>
            ) : threadMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
                <Bot className="w-12 h-12 text-slate-300" />
                <p className="text-base font-bold text-slate-700">No messages in this conversation yet</p>
                <p className="text-xs sm:text-sm text-slate-400">Send an initial reply or template to start chatting.</p>
              </div>
            ) : (
              threadMessages.map((msg) => {
                const isOutbound = msg.direction === 'OUTBOUND';
                const isBot = msg.senderType === 'bot';

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl p-3.5 sm:p-4 text-sm sm:text-base leading-relaxed shadow-xs ${
                        isOutbound
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-xs opacity-85">
                        {isOutbound ? (
                          <span className="font-semibold">{isBot ? '🤖 AutoMask AI Bot' : `👨‍💼 ${msg.senderName || activeConv.assignedToName || assignedAgent || 'Counsellor'}`}</span>
                        ) : (
                          <span className="font-bold text-slate-800">{activeConv.contactName}</span>
                        )}
                        {msg.type === 'template' && (
                          <span className="bg-emerald-700 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                            Meta Template
                          </span>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap font-normal">{msg.body}</p>
                      <div className={`flex items-center justify-end gap-1.5 text-xs mt-1.5 ${isOutbound ? 'text-emerald-100' : 'text-slate-400'}`}>
                        <span>{msg.timestamp}</span>
                        {isOutbound && <CheckCheck className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Canned Replies Bar (Audio 5 Requirement) */}
          {!isWindowExpiredSimulated && (
            <div className="bg-slate-50/95 px-4 py-2.5 border-t border-slate-200 flex items-center gap-2.5 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                Quick:
              </span>

              {/* Keyword Filter */}
              <div className="relative shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={quickFilterKeyword}
                  onChange={(e) => setQuickFilterKeyword(e.target.value)}
                  placeholder="Filter /keyword..."
                  className="pl-8 pr-2.5 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl w-32 focus:outline-none focus:w-44 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Dynamic Shortcut Chips */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {quickReplies
                  .filter(q => !quickFilterKeyword || 
                    q.keyword.toLowerCase().includes(quickFilterKeyword.toLowerCase()) || 
                    q.title.toLowerCase().includes(quickFilterKeyword.toLowerCase()) ||
                    q.body.toLowerCase().includes(quickFilterKeyword.toLowerCase()))
                  .map(q => (
                    <button
                      key={q.id}
                      onClick={() => setInputText(q.body)}
                      title={q.body}
                      className="text-xs sm:text-sm font-semibold bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 shrink-0 shadow-2xs group"
                    >
                      <span className="font-mono text-xs text-emerald-700 font-bold bg-emerald-50 group-hover:bg-emerald-100 px-1.5 py-0.5 rounded-md">
                        {q.keyword}
                      </span>
                      <span>{q.title}</span>
                    </button>
                  ))}
              </div>

              {/* Manage & Add Shortcuts Button */}
              <button
                onClick={handleOpenAddQuickReply}
                className="text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0 shadow-2xs ml-auto"
                title="Create or edit canned responses"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Canned Library</span>
              </button>
            </div>
          )}

          {/* Chat Input or Expired Window Guard */}
          {isWindowExpiredSimulated ? (
            <div className="p-4 sm:p-5 bg-rose-50/50 border-t border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-rose-800 font-medium">
                <Lock className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>
                  Free-form messaging locked. Send a verified Meta template message to restart the 24-hr conversation window.
                </span>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-sm whitespace-nowrap"
              >
                <FileText className="w-4 h-4" />
                <span>Choose Approved Template</span>
              </button>
            </div>
          ) : (
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2.5">
              <button className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={activeConv.takeoverActive ? "Type counsellor reply to student..." : "Type reply (or enable Human Takeover to pause AI)..."}
                className="flex-1 bg-slate-50 border border-slate-200 text-sm sm:text-base px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder:text-slate-400 h-12"
              />
              <button
                onClick={handleSend}
                className="px-5 sm:px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm sm:text-base font-bold flex items-center gap-2 transition-colors shadow-sm h-12 shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-base font-semibold">
          Select a conversation from the list
        </div>
      )}

      {/* 3. Right: Student Contact Card & CRM Details */}
      {activeConv && (
        <div className="hidden xl:flex w-80 2xl:w-88 bg-white flex-col h-full overflow-y-auto p-5 custom-scrollbar flex-shrink-0 min-h-0 border-l border-slate-200">
          <div className="text-center pb-5 border-b border-slate-100">
            <div className="w-20 h-20 rounded-full bg-slate-800 text-white text-2xl font-black flex items-center justify-center mx-auto mb-2.5 shadow-sm font-['Outfit']">
              {activeConv.contactName.charAt(0)}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">{activeConv.contactName}</h3>
            <p className="text-xs sm:text-sm text-slate-500 font-mono mt-0.5">{activeConv.phone}</p>
            <span className="inline-block mt-2.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Opted-In via Inbound Chat
            </span>
          </div>

          {/* CRM Lead Pipeline Status */}
          <div className="py-4.5 border-b border-slate-100 space-y-2.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Lead Pipeline Stage
            </label>
            <select
              value={activeConv.leadStatus}
              onChange={(e) => onUpdateLeadStatus(activeConv.phone, e.target.value as LeadStatus)}
              className="w-full text-sm font-bold p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-11"
            >
              <option value="NEW">🟢 New Enquiry</option>
              <option value="QUALIFIED">🔵 Qualified Lead</option>
              <option value="INTERESTED">🟣 Interested</option>
              <option value="DEMO_BOOKED">📅 Demo Booked</option>
              <option value="DEMO_ATTENDED">🎓 Demo Attended</option>
              <option value="ADMITTED">🏆 Admitted / Converted</option>
              <option value="LOST">⚪ Closed / Lost</option>
            </select>
          </div>

          {/* Student Academic Details */}
          <div className="py-4.5 border-b border-slate-100 space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-slate-500 font-medium">Target Exam:</span>
              <span className="font-bold text-sm sm:text-base text-slate-800">{activeConv.leadCourse || 'JEE Main'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-slate-500 font-medium">City / Location:</span>
              <span className="font-bold text-sm sm:text-base text-slate-800">Delhi NCR</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-slate-500 font-medium">Assigned Agent:</span>
              <select
                value={assignedAgent}
                onChange={(e) => setAssignedAgent(e.target.value)}
                className="text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none"
              >
                <option value="Sumit Bhardwaj">Sumit Bhardwaj (Admin)</option>
                <option value="Priya Sharma">Priya Sharma (Agent)</option>
                <option value="Dr. Prakash Sharma">Dr. Prakash (Owner)</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>
          </div>

          {/* Counsellor Internal Notes */}
          <div className="pt-4.5 space-y-2.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Internal Counsellor Notes
            </label>
            <div className="space-y-2 max-h-44 overflow-y-auto">
              {notesList.map((note, i) => (
                <div key={i} className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl text-xs sm:text-sm text-amber-900 leading-normal flex items-start justify-between gap-2 shadow-2xs">
                  <span>{note}</span>
                  <button
                    onClick={() => setNotesList(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-amber-500 hover:text-amber-800 text-sm font-bold shrink-0 p-0.5"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1.5">
              <input
                type="text"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Add private note..."
                className="flex-1 text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 placeholder:text-slate-400"
              />
              <button
                onClick={handleAddNote}
                className="px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-700 transition-colors shrink-0"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meta Approved Template Modal (WA-08, WA-09) */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  📨
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 font-['Outfit']">
                    Send Meta-Approved WhatsApp Template
                  </h3>
                  <p className="text-xs text-slate-500">
                    Compliant re-engagement for expired 24h customer window (SRS WA-08)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Template Selector */}
            <div className="space-y-3.5">
              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1.5">
                  Choose Template:
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="demo_reminder_physics">demo_reminder_physics (Category: UTILITY)</option>
                  <option value="batch_admission_open">batch_admission_open (Category: MARKETING)</option>
                  <option value="hostel_mess_inquiry">hostel_mess_inquiry (Category: UTILITY)</option>
                </select>
              </div>

              {/* Variable Fields */}
              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs sm:text-sm font-bold text-slate-700 block">Template Parameters:</span>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-500 font-mono">{'{{1}}'} Student Name:</span>
                  <span className="font-bold text-slate-800">{activeConv?.contactName || 'Student'}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-500 font-mono">{'{{2}}'} Session Time:</span>
                  <input
                    type="text"
                    value={templateVar}
                    onChange={(e) => setTemplateVar(e.target.value)}
                    className="w-52 text-xs sm:text-sm px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Template Body Preview */}
              <div className="bg-emerald-50/50 border border-emerald-200/80 p-4 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                <span className="text-xs font-bold text-emerald-800 block mb-1.5 uppercase tracking-wider">
                  Template Preview (Meta Approved):
                </span>
                {selectedTemplate === 'demo_reminder_physics' && (
                  <p>
                    Namaste <strong>{activeConv?.contactName || 'Student'}</strong>! 👋 This is a reminder for your upcoming JEE/NEET Demo Masterclass scheduled for <strong>{templateVar}</strong> at Prakash Institute. Reply CONFIRM to secure your seat.
                  </p>
                )}
                {selectedTemplate === 'batch_admission_open' && (
                  <p>
                    Namaste <strong>{activeConv?.contactName || 'Student'}</strong>! 🎓 Admissions for Prakash Institute 2027 Dropper Batch are now open. Seats are filling fast. Reply FEES or DEMO for details.
                  </p>
                )}
                {selectedTemplate === 'hostel_mess_inquiry' && (
                  <p>
                    Namaste <strong>{activeConv?.contactName || 'Student'}</strong>! 🏢 Details for verified student hostels and hygienic mess facilities near our Kota campus have been updated. Reply YES to schedule a campus tour.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTemplateSubmit}
                disabled={isSending}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                {isSending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Send Template via Cloud API</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Canned Replies Manager Modal (Audio 5 Requirement) */}
      {isQuickManagerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 font-['Outfit']">
                    Canned Replies & Shortcut Library
                  </h3>
                  <p className="text-xs text-slate-500">
                    Create, edit, and manage instant response shortcuts triggered by keywords (e.g. /fees, /demo)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickManagerOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-5 custom-scrollbar">
              {/* Form to Add or Edit */}
              <form onSubmit={handleSaveQuickReply} className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-emerald-600" />
                    {editingQuickReply ? `Edit Shortcut: ${editingQuickReply.keyword}` : 'Add New Canned Shortcut'}
                  </span>
                  {editingQuickReply && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuickReply(null);
                        setQrKeyword('');
                        setQrTitle('');
                        setQrBody('');
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700 font-semibold underline"
                    >
                      Clear / Create New Instead
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Shortcut Keyword *</label>
                    <input
                      type="text"
                      value={qrKeyword}
                      onChange={e => setQrKeyword(e.target.value)}
                      placeholder="/fees, /demo, /hostel"
                      className="w-full text-xs sm:text-sm font-mono p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Short Title *</label>
                    <input
                      type="text"
                      value={qrTitle}
                      onChange={e => setQrTitle(e.target.value)}
                      placeholder="e.g. Fee Structure Breakdown"
                      className="w-full text-xs sm:text-sm p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                    <select
                      value={qrCategory}
                      onChange={e => setQrCategory(e.target.value)}
                      className="w-full text-xs sm:text-sm p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                    >
                      <option value="Admissions">Admissions</option>
                      <option value="Bookings">Bookings / Demo</option>
                      <option value="Academics">Academics</option>
                      <option value="Facilities">Hostel & Facilities</option>
                      <option value="Scholarship">Scholarship & PSAT</option>
                      <option value="General">General / Contact</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Canned Reply Message Body *</label>
                  <textarea
                    rows={3}
                    value={qrBody}
                    onChange={e => setQrBody(e.target.value)}
                    placeholder="Enter the complete response text sent to students when this shortcut is selected..."
                    className="w-full text-xs sm:text-sm p-3 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed text-slate-800 placeholder:text-slate-400 font-medium"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{editingQuickReply ? 'Update Shortcut' : 'Save New Shortcut'}</span>
                  </button>
                </div>
              </form>

              {/* Existing Shortcuts List */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Configured Shortcuts ({quickReplies.length})
                </span>

                <div className="space-y-2.5">
                  {quickReplies.map((qr) => (
                    <div
                      key={qr.id}
                      className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors shadow-2xs"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            {qr.keyword}
                          </span>
                          <span className="text-sm font-bold text-slate-900">{qr.title}</span>
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                            {qr.category || 'General'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {qr.body}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            setInputText(qr.body);
                            setIsQuickManagerOpen(false);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                          title="Insert this reply into the chat message box"
                        >
                          Use in Chat
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditQuickReply(qr)}
                          className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit shortcut"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuickReply(qr.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete shortcut"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsQuickManagerOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile CRM Details Modal / Drawer */}
      {isMobileCrmOpen && activeConv && (
        <div className="fixed inset-0 z-50 xl:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileCrmOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col p-5 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">Student Profile & CRM</h3>
              <button
                onClick={() => setIsMobileCrmOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-slate-800 text-white text-xl font-black flex items-center justify-center mx-auto mb-2 shadow-sm font-['Outfit']">
                {activeConv.contactName.charAt(0)}
              </div>
              <h3 className="text-base font-bold text-slate-900">{activeConv.contactName}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{activeConv.phone}</p>
              <span className="inline-block mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Opted-In via Inbound Chat
              </span>
            </div>

            {/* CRM Lead Pipeline Status */}
            <div className="py-4 border-b border-slate-100 space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Lead Pipeline Stage
              </label>
              <select
                value={activeConv.leadStatus}
                onChange={(e) => onUpdateLeadStatus(activeConv.phone, e.target.value as LeadStatus)}
                className="w-full text-sm font-bold p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-11"
              >
                <option value="NEW">🟢 New Enquiry</option>
                <option value="QUALIFIED">🔵 Qualified Lead</option>
                <option value="INTERESTED">🟣 Interested</option>
                <option value="DEMO_BOOKED">📅 Demo Booked</option>
                <option value="DEMO_ATTENDED">🎓 Demo Attended</option>
                <option value="ADMITTED">🏆 Admitted / Converted</option>
                <option value="LOST">⚪ Closed / Lost</option>
              </select>
            </div>

            {/* Academic Details */}
            <div className="py-4 border-b border-slate-100 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Target Exam:</span>
                <span className="font-bold text-slate-800">{activeConv.leadCourse || 'JEE Main'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">City:</span>
                <span className="font-bold text-slate-800">Delhi NCR</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Agent:</span>
                <span className="font-bold text-slate-800">{assignedAgent}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="pt-4 space-y-2 flex-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Internal Notes
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {notesList.map((note, i) => (
                  <div key={i} className="bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-xl text-xs text-amber-900 leading-normal flex items-start justify-between gap-1 shadow-2xs">
                    <span>{note}</span>
                    <button
                      onClick={() => setNotesList(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-amber-500 hover:text-amber-800 text-xs font-bold p-0.5"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Add note..."
                  className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                />
                <button
                  onClick={handleAddNote}
                  className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors shrink-0"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
