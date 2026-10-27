import React, { useState } from 'react';
import { 
  Bot, 
  CheckCheck, 
  ExternalLink, 
  Phone, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare,
  ChevronLeft,
  Video,
  MoreVertical,
  Lock
} from 'lucide-react';
import { InteractiveButton } from '../../types';

interface WhatsAppMessagePreviewProps {
  headerText?: string;
  bodyText: string;
  footerText?: string;
  buttons?: InteractiveButton[];
  instituteName?: string;
  businessName?: string;
  avatarIcon?: string;
  mode?: 'phone' | 'bubble';
  className?: string;
  onButtonClick?: (btn: InteractiveButton) => void;
}

interface SimulatedThreadMessage {
  id: string;
  sender: 'bot' | 'student';
  text: string;
  time: string;
  isInitial?: boolean;
}

export const WhatsAppMessagePreview: React.FC<WhatsAppMessagePreviewProps> = ({
  headerText,
  bodyText,
  footerText,
  buttons = [],
  instituteName,
  businessName,
  avatarIcon,
  mode = 'phone',
  className = '',
  onButtonClick,
}) => {
  const [clickedHistory, setClickedHistory] = useState<SimulatedThreadMessage[]>([]);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const displayName = businessName || instituteName || 'Official Business';
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSimulateButtonClick = (btn: InteractiveButton) => {
    if (onButtonClick) {
      onButtonClick(btn);
    }

    if (btn.type === 'URL') {
      setActiveToast(`🌐 Navigating to URL: ${btn.url || 'https://automask.io'}`);
      setTimeout(() => setActiveToast(null), 3000);
      return;
    }

    if (btn.type === 'CALL') {
      setActiveToast(`📞 Dialing Hotline: ${btn.phoneNumber || '+91 98765 43210'}`);
      setTimeout(() => setActiveToast(null), 3000);
      return;
    }

    // Quick Reply or Workflow Step simulation
    const studentReply: SimulatedThreadMessage = {
      id: `sim-st-${Date.now()}`,
      sender: 'student',
      text: btn.title,
      time: currentTime,
    };

    const botResponseText = btn.payload || `Here is the information for "${btn.title}":\nThank you for contacting ${displayName}! Our executive will assist you immediately.`;

    const botReply: SimulatedThreadMessage = {
      id: `sim-bot-${Date.now() + 1}`,
      sender: 'bot',
      text: botResponseText,
      time: currentTime,
    };

    setClickedHistory(prev => [...prev, studentReply, botReply]);
  };

  const resetSimulation = () => {
    setClickedHistory([]);
    setActiveToast(null);
  };

  const renderBubble = () => (
    <div className="space-y-2">
      {/* Main Bot Message Bubble */}
      <div className="relative max-w-[94%] bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-sm border border-slate-200/80 text-slate-800 animate-in fade-in">
        {/* Subtle speech tail */}
        <div className="absolute -top-[1px] -left-2 w-0 h-0 border-t-[8px] border-t-white border-l-[8px] border-l-transparent"></div>

        {/* Header Text */}
        {headerText && (
          <div className="text-xs font-black text-emerald-800 tracking-tight pb-1.5 mb-1.5 border-b border-emerald-50 flex items-center gap-1.5 font-['Outfit']">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{headerText}</span>
          </div>
        )}

        {/* Body Text */}
        <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans font-normal">
          {bodyText || <span className="text-slate-400 italic">Type your WhatsApp automated message body...</span>}
        </div>

        {/* Footer Text & Timestamp */}
        <div className="mt-2 pt-1 border-t border-slate-100/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-medium text-slate-500 italic">
            {footerText || 'Prakash Institute • Official Desk'}
          </span>
          <span className="text-[9px] font-mono">{currentTime}</span>
        </div>

        {/* Attached Interactive Quick Reply Buttons */}
        {buttons && buttons.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
              <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
              <span>Interactive Quick Links ({buttons.length}/3):</span>
            </div>

            {buttons.map((btn, idx) => (
              <button
                key={btn.id || idx}
                type="button"
                onClick={() => handleSimulateButtonClick(btn)}
                className="w-full text-left py-2 px-3 bg-slate-50/90 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-700 rounded-xl border border-slate-200/90 text-xs font-semibold flex items-center justify-between transition-all group shadow-2xs active:scale-[0.98]"
              >
                <div className="flex items-center gap-2 truncate">
                  {btn.type === 'URL' && <ExternalLink className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                  {btn.type === 'CALL' && <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  {btn.type !== 'URL' && btn.type !== 'CALL' && (
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                  <span className="truncate group-hover:text-emerald-800">{btn.title || `Button #${idx + 1}`}</span>
                </div>

                <span className="text-[9px] text-slate-400 group-hover:text-emerald-600 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0 ml-1">
                  {btn.type === 'URL' ? 'Open URL' : btn.type === 'CALL' ? 'Call' : 'Tap Info'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Simulated conversation replies when testing buttons */}
      {clickedHistory.map((m) => {
        const isStudent = m.sender === 'student';
        return (
          <div
            key={m.id}
            className={`flex ${isStudent ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-xs relative ${
                isStudent
                  ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none'
                  : 'bg-white text-slate-900 rounded-tl-none border border-slate-200/50'
              }`}
            >
              {!isStudent && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 mb-0.5">
                  <Bot className="w-3 h-3" />
                  <span>{instituteName} Automated Payload</span>
                </div>
              )}
              <div className="whitespace-pre-wrap text-[11px] font-normal">{m.text}</div>
              <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400 font-medium">
                <span>{m.time}</span>
                {isStudent && <CheckCheck className="w-3.5 h-3.5 text-sky-500" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (mode === 'bubble') {
    return (
      <div className={`p-4 bg-[#efeae2] rounded-2xl border border-slate-200 shadow-inner ${className}`}>
        {renderBubble()}
        {clickedHistory.length > 0 && (
          <div className="mt-3 pt-2 border-t border-slate-300/60 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">Button response simulated</span>
            <button
              onClick={resetSimulation}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-bold text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Chat</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full Smartphone Frame Mode
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Smartphone Outer Casing */}
      <div className="w-[340px] h-[580px] bg-slate-950 rounded-[42px] shadow-2xl p-2.5 border-[3px] border-slate-700 relative flex flex-col overflow-hidden ring-1 ring-slate-800">
        
        {/* Dynamic Island / Speaker */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-end pr-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
        </div>

        {/* WhatsApp Screen Body */}
        <div className="flex-1 bg-[#efeae2] rounded-[32px] overflow-hidden flex flex-col relative border border-slate-800">
          
          {/* iOS Status Bar */}
          <div className="bg-[#075e54] text-white text-[10px] font-semibold px-5 pt-1.5 pb-1 flex justify-between items-center select-none shrink-0">
            <span>{currentTime}</span>
            <div className="flex items-center gap-1.5 text-[9px]">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* WhatsApp Header Bar */}
          <div className="bg-[#075e54] text-white px-3 py-2 flex items-center justify-between shadow-xs select-none shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <ChevronLeft className="w-4 h-4 text-emerald-200" />
              
              <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold ring-1 ring-white/30 text-white shrink-0">
                {avatarIcon || displayName.slice(0, 1).toUpperCase()}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-bold truncate leading-tight">{displayName}</h4>
                  <ShieldCheck className="w-3 h-3 text-emerald-300 fill-emerald-300 shrink-0" />
                </div>
                <p className="text-[9px] text-emerald-200 truncate leading-tight">Official Verified Account</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-emerald-200">
              <Video className="w-3.5 h-3.5" />
              <Phone className="w-3.5 h-3.5" />
              <MoreVertical className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* WhatsApp Chat Wallpaper Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#efeae2] custom-scrollbar">
            
            {/* Encryption & Guardrail Pill */}
            <div className="bg-[#ffeecd]/90 text-amber-900 text-[9px] text-center p-1.5 rounded-lg shadow-2xs flex items-center gap-1 justify-center border border-amber-200/60">
              <Lock className="w-2.5 h-2.5 text-amber-700 shrink-0" />
              <span>Messages are end-to-end encrypted. Grounded AI active.</span>
            </div>

            {/* Date Badge */}
            <div className="flex justify-center my-0.5">
              <span className="bg-white/80 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded shadow-2xs">
                TODAY
              </span>
            </div>

            {/* Message Bubble + Interactive Buttons */}
            {renderBubble()}

            {/* In-Preview Action Toast */}
            {activeToast && (
              <div className="p-2 bg-slate-900/95 text-white rounded-xl text-[10px] text-center shadow-lg border border-slate-700 animate-in fade-in">
                {activeToast}
              </div>
            )}
          </div>

          {/* Bottom Bar: Input Bar + Live Simulation Controller */}
          <div className="bg-[#f0f2f5] p-2 border-t border-slate-200 flex items-center justify-between text-[11px] shrink-0">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live WhatsApp Preview
            </span>
            {clickedHistory.length > 0 && (
              <button
                type="button"
                onClick={resetSimulation}
                className="flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded-md border border-slate-300 text-[10px] font-bold shadow-2xs transition-colors"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset Chat</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
