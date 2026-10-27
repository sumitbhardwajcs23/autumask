import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Smile, 
  Paperclip, 
  Mic, 
  MoreVertical, 
  Phone, 
  Video, 
  ChevronLeft, 
  CheckCheck, 
  Sparkles,
  RefreshCw,
  Lock,
  Bot,
  UserCheck,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { Message, InteractiveButton } from '../../types';
import { whatsappApi } from '../../services/api';

interface WhatsAppPhoneSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onNewMessageSimulated?: (msg: any) => void;
  workspace?: {
    name?: string;
    businessName?: string;
    industry?: string;
    customerTerm?: string;
  };
}

interface SimMessage {
  id: string;
  text: string;
  sender: 'student' | 'bot' | 'agent';
  time: string;
  status: 'sent' | 'delivered' | 'read';
  headerText?: string;
  footerText?: string;
  buttons?: InteractiveButton[];
}

export const WhatsAppPhoneSimulator: React.FC<WhatsAppPhoneSimulatorProps> = ({
  isOpen,
  onClose,
  onNewMessageSimulated,
  workspace,
}) => {
  const [messages, setMessages] = useState<SimMessage[]>([
    {
      id: 'm-0',
      text: 'Namaste Amit! 🙏 Welcome to Prakash Institute. Humare JEE Main & Advanced batches ke admissions open hain. Aap Class 11, 12 ya Dropper batch me interested hain?',
      sender: 'bot',
      time: '10:21 AM',
      status: 'read',
      headerText: '🎓 Prakash Institute Admissions',
      footerText: 'Official Automated Admissions Desk',
      buttons: [
        {
          id: 'btn-jee-enq',
          title: '📚 JEE Dropper Info',
          type: 'QUICK_REPLY',
          payload: 'JEE Dropper Batch details requested.',
        },
        {
          id: 'btn-demo-slot',
          title: '📅 Book Free Demo',
          type: 'QUICK_REPLY',
          payload: 'Trial lecture demo request.',
        },
        {
          id: 'btn-call-faculty',
          title: '📞 Call Counsellor',
          type: 'CALL',
          phoneNumber: '+919876543210',
        },
      ],
    },
    {
      id: 'm-1',
      text: 'JEE dropper batch ki fees kya hai?',
      sender: 'student',
      time: '10:24 AM',
      status: 'read',
    },
    {
      id: 'm-2',
      text: 'Prakash Institute JEE Programs:\n• 1-Year Dropper Batch (Target 2027)\n• Fee: ₹45,000 / year (includes books & test series)\n• Top Rankers Mentorship & Daily DPPs.\nSelect an option below to proceed:',
      sender: 'bot',
      time: '10:24 AM',
      status: 'read',
      headerText: '💰 Fee Structure & Scholarships',
      footerText: 'Instant confirmation on quick button tap',
      buttons: [
        {
          id: 'btn-scholarship',
          title: '🏆 20% Scholarship',
          type: 'QUICK_REPLY',
          payload: 'Scholarship test slot booked for Sunday 10 AM.',
        },
        {
          id: 'btn-brochure',
          title: '📄 Download Syllabus',
          type: 'URL',
          url: 'https://prakashinstitute.edu.in/jee-syllabus.pdf',
        },
      ],
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Book demo class',
    'Hostel facility available hai?',
    'NEET batch kab start hoga?',
    'Scholarship test kab hai?',
    'STOP',
  ];

  const handleButtonClick = (btn: InteractiveButton) => {
    if (btn.type === 'QUICK_REPLY') {
      handleSendMessage(btn.title);
    } else if (btn.type === 'URL') {
      if (btn.url) {
        window.open(btn.url, '_blank', 'noopener,noreferrer');
      }
    } else if (btn.type === 'CALL') {
      if (btn.phoneNumber) {
        window.location.href = `tel:${btn.phoneNumber}`;
      }
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const studentMsgId = `st-${Date.now()}`;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add student message immediately
    setMessages(prev => [
      ...prev,
      {
        id: studentMsgId,
        text: textToSend,
        sender: 'student',
        time: currentTime,
        status: 'read',
      }
    ]);
    setInputText('');
    setIsTyping(true);

    try {
      const data = await whatsappApi.simulate({
        phone: '+91 98112 34567',
        name: 'Amit Raj',
        message: textToSend,
        conversationId: 'conv-01',
      });

      setIsTyping(false);

      if (data?.result?.replyText) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            text: data.result.replyText,
            sender: 'bot',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read',
            headerText: data.result.headerText,
            footerText: data.result.footerText,
            buttons: data.result.buttons,
          }
        ]);
      }

      if (onNewMessageSimulated) {
        onNewMessageSimulated(data);
      }
    } catch (err: any) {
      console.error('Error simulating WhatsApp reply:', err);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          text: `⚠️ API Error: ${err?.message || 'Server connection failed'}`,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent',
        }
      ]);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex items-center justify-end p-4 pointer-events-none">
      <div className="w-[380px] h-[690px] bg-slate-900 rounded-[44px] shadow-2xl p-3 border-4 border-slate-700 pointer-events-auto relative flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Dynamic Island / Camera Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-end pr-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
        </div>

        {/* WhatsApp Mobile Frame Container */}
        <div className="flex-1 bg-[#efeae2] rounded-[34px] overflow-hidden flex flex-col relative border border-slate-800">
          
          {/* Status Bar */}
          <div className="bg-[#075e54] text-white text-[11px] font-semibold px-5 pt-2 pb-1 flex justify-between items-center select-none">
            <span>10:24 AM</span>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* WhatsApp Header */}
          <div className="bg-[#075e54] text-white px-3 py-2 flex items-center justify-between shadow-md select-none">
            <div className="flex items-center gap-2 min-w-0">
              <ChevronLeft className="w-5 h-5 cursor-pointer hover:opacity-80" onClick={onClose} />
              
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold ring-1 ring-white/30 overflow-hidden flex-shrink-0">
                <img 
                  src="/automask-logo.png" 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-bold truncate leading-tight">
                    {workspace?.businessName || workspace?.name || 'AutoMask Business'}
                  </h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-[10px] text-emerald-200 truncate leading-tight">
                  {workspace?.industry ? `${workspace.industry.replace('_', ' ')} • Verified Account` : 'Official Business Account'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-emerald-100">
              <Video className="w-4 h-4 cursor-pointer hover:text-white" />
              <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
              <button onClick={onClose} className="p-1 hover:bg-emerald-800 rounded-full text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar bg-[#efeae2]">
            {/* Encryption notice */}
            <div className="bg-[#ffeecd] text-amber-900 text-[10px] text-center p-2 rounded-lg shadow-xs flex items-center gap-1.5 justify-center">
              <Lock className="w-3 h-3 flex-shrink-0 text-amber-700" />
              <span>Messages are end-to-end encrypted. Grounded AI active.</span>
            </div>

            {/* Date divider */}
            <div className="flex justify-center my-1">
              <span className="bg-white/80 text-slate-500 text-[10px] font-semibold px-2.5 py-0.5 rounded-md shadow-xs">
                TODAY
              </span>
            </div>

            {/* Message Bubbles */}
            {messages.map((m) => {
              const isStudent = m.sender === 'student';

              return (
                <div
                  key={m.id}
                  className={`flex ${isStudent ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-xs relative ${
                      isStudent
                        ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none'
                        : 'bg-white text-slate-900 rounded-tl-none border border-slate-200/50'
                    }`}
                  >
                    {!isStudent && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 mb-1">
                        <Bot className="w-3 h-3" />
                        <span>Prakash AI Assistant</span>
                      </div>
                    )}

                    {/* WhatsApp Header */}
                    {m.headerText && (
                      <div className="font-bold text-[11px] text-slate-900 pb-1 mb-1 border-b border-slate-100">
                        {m.headerText}
                      </div>
                    )}

                    <div className="whitespace-pre-wrap text-[11px] font-normal leading-relaxed">{m.text}</div>

                    {/* WhatsApp Footer */}
                    {m.footerText && (
                      <div className="text-[9.5px] text-slate-400 mt-1 italic">
                        {m.footerText}
                      </div>
                    )}

                    {/* Interactive WhatsApp Buttons */}
                    {m.buttons && m.buttons.length > 0 && (
                      <div className="mt-2 pt-1 border-t border-slate-100 space-y-1">
                        {m.buttons.map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => handleButtonClick(btn)}
                            className="w-full py-1.5 px-2 bg-emerald-50/70 hover:bg-emerald-100 text-[#00a884] rounded-lg text-[11px] font-bold border border-emerald-200/60 flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-[0.98]"
                          >
                            {btn.type === 'URL' && <ExternalLink className="w-3 h-3 text-sky-600" />}
                            {btn.type === 'CALL' && <Phone className="w-3 h-3 text-emerald-600" />}
                            {btn.type === 'QUICK_REPLY' && <MessageSquare className="w-3 h-3 text-emerald-700" />}
                            <span>{btn.title}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400 font-medium">
                      <span>{m.time}</span>
                      {isStudent && (
                        <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 border border-slate-200 shadow-xs flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="text-[10px] text-emerald-600 font-semibold">AutoMask Bot typing</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions chips */}
          <div className="bg-[#f0f2f5] px-2 py-1.5 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 flex-shrink-0">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Try:
            </span>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                className="text-[10px] font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 px-2 py-1 rounded-full border border-slate-200 flex-shrink-0 shadow-xs transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* WhatsApp Message Input Bar */}
          <div className="bg-[#f0f2f5] p-2 flex items-center gap-1.5 border-t border-slate-200">
            <button className="text-slate-500 hover:text-slate-700 p-1">
              <Smile className="w-4 h-4" />
            </button>
            <button className="text-slate-500 hover:text-slate-700 p-1">
              <Paperclip className="w-4 h-4" />
            </button>
            
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type student message..."
              className="flex-1 bg-white text-xs px-3 py-1.5 rounded-full border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 placeholder:text-slate-400"
            />

            {inputText.trim() ? (
              <button
                onClick={() => handleSendMessage()}
                className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#008f6f] transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#008f6f] transition-colors shadow-sm">
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Bottom Home Indicator */}
          <div className="bg-[#f0f2f5] pb-2 flex justify-center">
            <div className="w-24 h-1 bg-slate-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
