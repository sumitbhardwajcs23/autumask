import React, { useState } from 'react';
import { 
  Plus, 
  Zap, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Sparkles, 
  Bot, 
  X, 
  Smartphone, 
  ExternalLink, 
  Phone, 
  MessageSquare, 
  CornerDownRight, 
  HelpCircle,
  Link as LinkIcon,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AutomationRule, InteractiveButton, UserRole } from '../../types';
import { WhatsAppMessagePreview } from '../common/WhatsAppMessagePreview';

interface AutomationViewProps {
  rules: AutomationRule[];
  onToggleRule: (ruleId: string) => void;
  onAddRule: (rule: Partial<AutomationRule>) => void;
  onUpdateRule?: (ruleId: string, updates: Partial<AutomationRule>) => void;
  onDeleteRule?: (ruleId: string) => void;
  userRole?: UserRole;
}

export const AutomationView: React.FC<AutomationViewProps> = ({
  rules,
  onToggleRule,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  userRole = 'admin',
}) => {
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Form State
  const [ruleName, setRuleName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState<string>('KEYWORD');
  const [keywords, setKeywords] = useState('');
  const [headerText, setHeaderText] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [footerText, setFooterText] = useState('');
  const [buttons, setButtons] = useState<InteractiveButton[]>([]);

  // Quick Standalone Preview Modal State
  const [previewingRule, setPreviewingRule] = useState<AutomationRule | null>(null);

  // Toast Notice State
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // Open Create Studio
  const openCreateModal = () => {
    setModalMode('create');
    setEditingRuleId(null);
    setRuleName('');
    setDescription('Automated response with interactive WhatsApp quick links');
    setTrigger('KEYWORD');
    setKeywords('scholarship, discount, fees');
    setHeaderText('🎓 Prakash Institute of Science & Technology');
    setReplyMessage('Namaste! 🙏 Thank you for reaching out to Prakash Institute. We offer premier coaching for IIT-JEE & NEET with top AIR faculties.\n\nChoose an option below for instant details:');
    setFooterText('Select an option below to proceed');
    setButtons([
      {
        id: `btn-${Date.now()}-1`,
        title: '📚 Course Fees',
        type: 'QUICK_REPLY',
        payload: 'Our 2027 Batches:\n• 1-Yr JEE Dropper: ₹45,000/yr\n• 2-Yr Foundation: ₹35,000/yr\n• NEET Comprehensive: ₹55,000/yr\n*Includes books & test series.',
      },
      {
        id: `btn-${Date.now()}-2`,
        title: '🎟️ Book Free Demo',
        type: 'QUICK_REPLY',
        payload: 'Trial class reserved! Next physics mechanics session is Friday 5:00 PM. Classroom link sent to your WhatsApp.',
      },
      {
        id: `btn-${Date.now()}-3`,
        title: '📞 Talk to Counsellor',
        type: 'CALL',
        phoneNumber: '+91 98765 43210',
        payload: 'Connecting you with Senior Counsellor Sumit at +91 98765 43210.',
      },
    ]);
    setIsModalOpen(true);
  };

  // Open Edit Studio
  const openEditModal = (rule: AutomationRule) => {
    setModalMode('edit');
    setEditingRuleId(rule.id);
    setRuleName(rule.name);
    setDescription(rule.description || '');
    setTrigger(rule.trigger || 'KEYWORD');
    setKeywords(rule.keywords ? rule.keywords.join(', ') : '');
    setHeaderText(rule.headerText || '');
    setReplyMessage(rule.replyMessage || '');
    setFooterText(rule.footerText || '');
    setButtons(rule.buttons && rule.buttons.length > 0 ? [...rule.buttons] : []);
    setIsModalOpen(true);
  };

  // Add a new interactive button (max 3 per WhatsApp policy)
  const handleAddButton = () => {
    if (buttons.length >= 3) {
      alert('WhatsApp official guidelines limit interactive messages to a maximum of 3 quick buttons.');
      return;
    }
    const newBtn: InteractiveButton = {
      id: `btn-${Date.now()}-${buttons.length + 1}`,
      title: `Button #${buttons.length + 1}`,
      type: 'QUICK_REPLY',
      payload: 'Automated response information for this button click.',
    };
    setButtons([...buttons, newBtn]);
  };

  // Remove interactive button
  const handleRemoveButton = (idx: number) => {
    setButtons(buttons.filter((_, i) => i !== idx));
  };

  // Update specific button property
  const handleUpdateButton = (idx: number, field: keyof InteractiveButton, value: any) => {
    const updated = [...buttons];
    updated[idx] = { ...updated[idx], [field]: value };
    setButtons(updated);
  };

  // Apply Presets
  const applyPreset = (presetKey: 'admission' | 'demo' | 'scholarship') => {
    if (presetKey === 'admission') {
      setHeaderText('🎓 Admissions 2027 • Prakash Institute');
      setReplyMessage('Namaste! 🙏 Welcome to Prakash Institute admissions desk. What would you like to know today?');
      setFooterText('Tap an option below for immediate response');
      setButtons([
        {
          id: `btn-${Date.now()}-1`,
          title: '📚 Course Fees',
          type: 'QUICK_REPLY',
          payload: 'JEE Dropper 1-Year: ₹45,000/yr | NEET Comprehensive: ₹55,000/yr. EMI available.',
        },
        {
          id: `btn-${Date.now()}-2`,
          title: '🎟️ Book Demo',
          type: 'QUICK_REPLY',
          payload: 'Great! Upcoming Demo: Friday 5:00 PM (Physics Mechanics). Reserved seat for you.',
        },
        {
          id: `btn-${Date.now()}-3`,
          title: '📞 Call Desk',
          type: 'CALL',
          phoneNumber: '+91 98765 43210',
          payload: 'Calling counsellor hotline: +91 98765 43210',
        },
      ]);
    } else if (presetKey === 'demo') {
      setHeaderText('📅 Free Trial Masterclass Booking');
      setReplyMessage('Choose your preferred demo class slot to experience Prakash Institute faculty before admission:');
      setFooterText('Slots filling rapidly (25 students max)');
      setButtons([
        {
          id: `btn-${Date.now()}-1`,
          title: 'Fri 5PM (Physics)',
          type: 'QUICK_REPLY',
          payload: 'Slot confirmed! Friday 5:00 PM Mechanics by Dr. Sharma. Classroom invite sent.',
        },
        {
          id: `btn-${Date.now()}-2`,
          title: 'Sat 11AM (Chemistry)',
          type: 'QUICK_REPLY',
          payload: 'Slot confirmed! Saturday 11:00 AM Organic Chemistry. DPP sheet sent.',
        },
        {
          id: `btn-${Date.now()}-3`,
          title: 'Reschedule Demo',
          type: 'QUICK_REPLY',
          payload: 'Our counsellor Priya will contact you to find an alternate slot time.',
        },
      ]);
    } else if (presetKey === 'scholarship') {
      setHeaderText('🏆 P-SAT National Scholarship 2027');
      setReplyMessage('Get up to 90% fee waiver in Prakash National Scholarship Admission Test (P-SAT).');
      setFooterText('Next exam date: Sunday 10:00 AM');
      setButtons([
        {
          id: `btn-${Date.now()}-1`,
          title: '📝 Register Online',
          type: 'URL',
          url: 'https://prakashinstitute.edu.in/scholarship',
          payload: 'Direct registration link: https://prakashinstitute.edu.in/scholarship',
        },
        {
          id: `btn-${Date.now()}-2`,
          title: '📊 Exam Syllabus',
          type: 'QUICK_REPLY',
          payload: 'P-SAT Syllabus: Class 10 & 11 Physics, Chemistry & Math/Biology fundamentals.',
        },
        {
          id: `btn-${Date.now()}-3`,
          title: 'Talk to Academic Head',
          type: 'CALL',
          phoneNumber: '+91 98765 43210',
          payload: 'Calling Academic Council: +91 98765 43210',
        },
      ]);
    }
  };

  // Submit Save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || !replyMessage.trim()) {
      alert('Please fill out the Rule Name and Automated Message Body.');
      return;
    }

    const payloadData: Partial<AutomationRule> = {
      name: ruleName.trim(),
      description: description.trim() || 'Custom keyword automation rule',
      trigger: trigger,
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      headerText: headerText.trim() || undefined,
      replyMessage: replyMessage.trim(),
      footerText: footerText.trim() || undefined,
      buttons: buttons.length > 0 ? buttons : [],
      actions: ['assign_tag:Automated'],
    };

    if (modalMode === 'create') {
      onAddRule(payloadData);
      showNotice(`Created automation rule "${ruleName}" with ${buttons.length} interactive buttons!`);
    } else if (modalMode === 'edit' && editingRuleId && onUpdateRule) {
      onUpdateRule(editingRuleId, payloadData);
      showNotice(`Updated automation rule "${ruleName}" successfully!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (ruleId: string, name: string) => {
    if (userRole === 'agent') {
      alert("Permission Denied: Only Owner or Admin can delete automation rules (SRS Section 3).");
      return;
    }
    if (!confirm(`Are you sure you want to delete rule "${name}"?`)) return;

    if (onDeleteRule) {
      onDeleteRule(ruleId);
      showNotice(`Rule "${name}" was deleted.`);
    }
  };

  return (
    <div className="w-full px-6 sm:px-8 lg:px-10 py-8 space-y-8">
      {/* Top Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-['Outfit']">
              WhatsApp Automation Rules & Interactive Buttons
            </h1>
            <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Quick Replies & Action Links
            </span>
          </div>
          <p className="text-base sm:text-lg text-slate-600 mt-1.5 font-normal">
            Set up automatic keyword triggers that send rich WhatsApp messages with clickable Quick Reply buttons, URL links, and live mobile previews.
          </p>
        </div>

        {userRole === 'agent' ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              🔒 Read-Only for Agents (SRS §3)
            </span>
          </div>
        ) : (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Rule with Interactive Buttons</span>
          </button>
        )}
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{notice}</span>
        </div>
      )}

      {/* Priority Pipeline Explanation */}
      <div className="bg-gradient-to-r from-blue-50/80 via-emerald-50/50 to-indigo-50/80 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3 shadow-2xs">
        <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
          <Zap className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800">Deterministic Priority Pipeline & Interactive WhatsApp Message Protocol</h4>
            <span className="text-[10px] font-mono text-blue-700 bg-white/80 px-2 py-0.5 rounded border border-blue-200">
              Meta Cloud API Compliant
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            When an incoming student inquiry arrives, rules are evaluated from Priority #1 down. Once matched, the student receives your rich message bubble with up to 3 interactive quick reply buttons. Clicking any button immediately triggers that button's tailored payload.
          </p>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule, idx) => (
          <div
            key={rule.id}
            className={`bg-white rounded-2xl p-5 border transition-all ${
              rule.enabled ? 'border-slate-200/90 shadow-2xs hover:shadow-sm' : 'border-slate-200 opacity-60 bg-slate-50/50'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {/* Priority Badge */}
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center font-['Outfit'] shrink-0 border border-slate-200">
                  #{idx + 1}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-sm font-bold text-slate-800 font-['Outfit']">{rule.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
                      {rule.trigger}
                    </span>
                    {rule.buttons && rule.buttons.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        <span>{rule.buttons.length} Interactive Buttons Attached</span>
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-500">{rule.description}</p>

                  {/* Trigger Keywords */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400">KEYWORDS:</span>
                    {rule.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded-md"
                      >
                        "{kw}"
                      </span>
                    ))}
                  </div>

                  {/* WhatsApp Message Preview Box */}
                  <div className="mt-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-2">
                    {rule.headerText && (
                      <div className="text-[11px] font-extrabold text-emerald-800 pb-1 border-b border-slate-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{rule.headerText}</span>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap font-sans text-slate-800">
                      {rule.replyMessage}
                    </div>

                    {rule.footerText && (
                      <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-200/60">
                        {rule.footerText}
                      </div>
                    )}

                    {/* Render the buttons attached to this rule */}
                    {rule.buttons && rule.buttons.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 space-y-1.5">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                          <Bot className="w-3 h-3 text-emerald-600" />
                          <span>Student Quick Links ({rule.buttons.length}):</span>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          {rule.buttons.map((btn, bIdx) => (
                            <div
                              key={bIdx}
                              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-1.5 shadow-2xs group cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
                              title={btn.payload ? `Payload: ${btn.payload}` : btn.url || btn.phoneNumber}
                              onClick={() => setPreviewingRule(rule)}
                            >
                              {btn.type === 'URL' && <ExternalLink className="w-3 h-3 text-sky-600" />}
                              {btn.type === 'CALL' && <Phone className="w-3 h-3 text-indigo-600" />}
                              {btn.type !== 'URL' && btn.type !== 'CALL' && (
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                              )}
                              <span>{btn.title}</span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                ({btn.type === 'URL' ? 'URL' : btn.type === 'CALL' ? 'Call' : 'Info'})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions, Toggle & Preview button */}
              <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    {rule.enabled ? 'Active' : 'Disabled'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (userRole === 'agent') {
                        alert("Permission Denied: Automation rules can only be enabled/disabled by Owner or Admin (SRS Section 3).");
                        return;
                      }
                      onToggleRule(rule.id);
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      userRole === 'agent' ? 'opacity-50 cursor-not-allowed' : ''
                    } ${
                      rule.enabled ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        rule.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="text-[10px] text-slate-400 font-mono">
                  {rule.executionsCount.toLocaleString()} executions
                </div>

                {/* Quick Test on WhatsApp Phone Button */}
                <button
                  onClick={() => setPreviewingRule(rule)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-200 shadow-2xs"
                  title="Test how student sees this rule on their WhatsApp"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Preview Phone</span>
                </button>

                {/* Edit & Delete Action Buttons */}
                {userRole !== 'agent' && (
                  <div className="flex items-center gap-1 pt-1">
                    <button
                      onClick={() => openEditModal(rule)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Rule & Buttons"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteRule && (
                      <button
                        onClick={() => handleDelete(rule.id, rule.name)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 2-COLUMN AUTOMATION STUDIO & LIVE WHATSAPP BUILDER MODAL  */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] w-full max-w-5xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in duration-200">
            
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 font-['Outfit']">
                    {modalMode === 'create' ? 'Create WhatsApp Automation Rule' : 'Edit WhatsApp Automation Rule'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configure priority triggers with interactive Quick Reply buttons and preview on mobile in real-time.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Two-Column Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column (60%): Configuration Form */}
              <div className="lg:col-span-7 space-y-4">
                <form id="rule-form" onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Preset Shortcuts */}
                  <div className="p-3 bg-gradient-to-r from-emerald-50/80 to-blue-50/80 rounded-2xl border border-emerald-200/70 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Quick Presets:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => applyPreset('admission')}
                        className="text-[10px] font-semibold bg-white hover:bg-emerald-100/60 text-emerald-800 px-2 py-1 rounded-lg border border-emerald-200 transition-colors shadow-2xs"
                      >
                        🎓 Admissions
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('demo')}
                        className="text-[10px] font-semibold bg-white hover:bg-emerald-100/60 text-emerald-800 px-2 py-1 rounded-lg border border-emerald-200 transition-colors shadow-2xs"
                      >
                        📅 Demo Booking
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('scholarship')}
                        className="text-[10px] font-semibold bg-white hover:bg-emerald-100/60 text-emerald-800 px-2 py-1 rounded-lg border border-emerald-200 transition-colors shadow-2xs"
                      >
                        🏆 Scholarship
                      </button>
                    </div>
                  </div>

                  {/* Rule Name & Trigger Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Rule Name *</label>
                      <input
                        type="text"
                        value={ruleName}
                        onChange={(e) => setRuleName(e.target.value)}
                        placeholder="e.g. Scholarship Test Info"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Trigger Type</label>
                      <select
                        value={trigger}
                        onChange={(e) => setTrigger(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium bg-white"
                      >
                        <option value="KEYWORD">KEYWORD (Contains any keyword)</option>
                        <option value="EXACT_MATCH">EXACT_MATCH (Matches keyword strictly)</option>
                        <option value="DEMO_REQUEST">DEMO_REQUEST (Demo trial booking intent)</option>
                        <option value="FEE_QUERY">FEE_QUERY (Tuition fees intent)</option>
                      </select>
                    </div>
                  </div>

                  {/* Trigger Keywords */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Trigger Keywords (comma separated) *
                    </label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="scholarship, psat, test date, discount, fees"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-[11px]"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Case-insensitive. Matching any of these words triggers this rule.
                    </p>
                  </div>

                  {/* Header Text (Optional) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Header Text <span className="text-slate-400 font-normal">(Optional bold banner)</span>
                      </label>
                      <span className="text-[10px] text-slate-400">{headerText.length}/60</span>
                    </div>
                    <input
                      type="text"
                      maxLength={60}
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      placeholder="e.g. 🎓 Prakash Institute Admissions 2027"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    />
                  </div>

                  {/* Automated WhatsApp Response Body */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Automated WhatsApp Message Body *
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">Insert:</span>
                        <button
                          type="button"
                          onClick={() => setReplyMessage(prev => prev + ' {{studentName}}')}
                          className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono"
                        >
                          &#123;&#123;studentName&#125;&#125;
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyMessage(prev => prev + ' {{course}}')}
                          className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono"
                        >
                          &#123;&#123;course&#125;&#125;
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={4}
                      placeholder="Type the message that will be sent to the student on WhatsApp..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium leading-relaxed"
                      required
                    />
                  </div>

                  {/* Footer Text (Optional) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Footer Text <span className="text-slate-400 font-normal">(Small grey note at bottom)</span>
                      </label>
                      <span className="text-[10px] text-slate-400">{footerText.length}/60</span>
                    </div>
                    <input
                      type="text"
                      maxLength={60}
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      placeholder="e.g. ⚡ Tap an option below to proceed"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    />
                  </div>

                  {/* ==================================================== */}
                  {/* INTERACTIVE BUTTONS BUILDER SECTION                  */}
                  {/* ==================================================== */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 font-['Outfit']">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Interactive Buttons & Quick Links ({buttons.length}/3)</span>
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          Add buttons below your message. When students tap them, tailored information is delivered automatically.
                        </p>
                      </div>

                      {buttons.length < 3 && (
                        <button
                          type="button"
                          onClick={handleAddButton}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition-colors shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Button</span>
                        </button>
                      )}
                    </div>

                    {buttons.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                        <MessageSquare className="w-5 h-5 mx-auto mb-1 opacity-40 text-emerald-600" />
                        <span>No interactive buttons added yet. Click "+ Add Button" or use a Preset above.</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {buttons.map((btn, idx) => (
                          <div
                            key={btn.id || idx}
                            className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span>Button #{idx + 1} Configuration</span>
                              </span>

                              <button
                                type="button"
                                onClick={() => handleRemoveButton(idx)}
                                className="text-rose-500 hover:text-rose-700 text-[11px] font-bold flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div>
                                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                  Button Title (Max 20 chars)
                                </label>
                                <input
                                  type="text"
                                  maxLength={20}
                                  value={btn.title}
                                  onChange={(e) => handleUpdateButton(idx, 'title', e.target.value)}
                                  placeholder="e.g. 📚 Course Fees"
                                  className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-medium"
                                  required
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                  Button Action Type
                                </label>
                                <select
                                  value={btn.type}
                                  onChange={(e) => handleUpdateButton(idx, 'type', e.target.value as any)}
                                  className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-medium"
                                >
                                  <option value="QUICK_REPLY">Quick Reply (Deliver Info Payload)</option>
                                  <option value="URL">Open Website / PDF Link</option>
                                  <option value="CALL">Call Phone Number</option>
                                </select>
                              </div>
                            </div>

                            {/* Dynamic target based on Action Type */}
                            {btn.type === 'QUICK_REPLY' && (
                              <div>
                                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                  Response Information Delivered When Clicked:
                                </label>
                                <textarea
                                  rows={2}
                                  value={btn.payload || ''}
                                  onChange={(e) => handleUpdateButton(idx, 'payload', e.target.value)}
                                  placeholder="Enter the exact answer or details sent when the student taps this button..."
                                  className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-medium leading-relaxed"
                                />
                              </div>
                            )}

                            {btn.type === 'URL' && (
                              <div>
                                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                  Website / PDF Brochure URL:
                                </label>
                                <input
                                  type="url"
                                  value={btn.url || ''}
                                  onChange={(e) => handleUpdateButton(idx, 'url', e.target.value)}
                                  placeholder="https://prakashinstitute.edu.in/brochure.pdf"
                                  className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-mono text-[11px]"
                                />
                              </div>
                            )}

                            {btn.type === 'CALL' && (
                              <div>
                                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                  Phone Number Hotline to Dial:
                                </label>
                                <input
                                  type="tel"
                                  value={btn.phoneNumber || ''}
                                  onChange={(e) => handleUpdateButton(idx, 'phoneNumber', e.target.value)}
                                  placeholder="+91 98765 43210"
                                  className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-mono text-[11px]"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Right Column (40%): Real-Time WhatsApp Mobile Overview */}
              <div className="lg:col-span-5 flex flex-col items-center justify-start bg-slate-50/50 p-4 rounded-3xl border border-slate-200/80">
                <div className="text-center mb-3">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live WhatsApp Mobile Overview</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Updates live as you type. Click buttons inside the phone to test automated delivery!
                  </p>
                </div>

                <WhatsAppMessagePreview
                  headerText={headerText}
                  bodyText={replyMessage}
                  footerText={footerText}
                  buttons={buttons}
                  instituteName="Prakash Institute"
                  mode="phone"
                />
              </div>
            </div>

            {/* Modal Bottom Actions Footer */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                Changes will take effect immediately in the live WhatsApp webhook execution pipeline.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="rule-form"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all"
                >
                  {modalMode === 'create' ? 'Save & Activate Automation' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* QUICK STANDALONE RULE PREVIEW MODAL                       */}
      {/* ========================================================= */}
      {previewingRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 shadow-2xl border border-slate-200 flex flex-col items-center animate-in fade-in max-w-md w-full">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Rule: {previewingRule.name}</h4>
                <p className="text-[10px] text-slate-400">Student Mobile WhatsApp Experience</p>
              </div>
              <button
                onClick={() => setPreviewingRule(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <WhatsAppMessagePreview
              headerText={previewingRule.headerText}
              bodyText={previewingRule.replyMessage}
              footerText={previewingRule.footerText}
              buttons={previewingRule.buttons || []}
              instituteName="Prakash Institute"
              mode="phone"
            />

            <button
              onClick={() => setPreviewingRule(null)}
              className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
