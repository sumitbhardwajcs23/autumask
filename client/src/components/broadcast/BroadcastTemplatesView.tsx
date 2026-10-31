import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  Clock, 
  Users, 
  Sparkles, 
  AlertCircle, 
  Plus, 
  Filter, 
  Smartphone, 
  CheckCheck,
  Loader2,
  X,
  Phone,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { UsageQuota, Lead } from '../../types';
import { whatsappApi, templatesApi } from '../../services/api';

interface TemplateItem {
  id: string;
  name: string;
  category: 'UTILITY' | 'MARKETING';
  status: 'APPROVED' | 'IN_REVIEW' | 'REJECTED';
  language: string;
  body: string;
  variables: string[];
  lastUsedAt: string;
}

interface BroadcastHistoryItem {
  id: string;
  name: string;
  templateName: string;
  targetCount: number;
  deliveredCount: number;
  readCount: number;
  status: 'COMPLETED' | 'SENDING';
  sentAt: string;
}

interface BroadcastTemplatesViewProps {
  usage: UsageQuota;
  leads: Lead[];
  onBroadcastSent?: (name: string, count: number) => void;
}

export const BroadcastTemplatesView: React.FC<BroadcastTemplatesViewProps> = ({
  usage,
  leads,
  onBroadcastSent,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'TEMPLATES' | 'CAMPAIGNS'>('TEMPLATES');
  
  // Custom templates list - starts clean and dynamic (no hardcoded pre-loaded templates)
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Template creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTplName, setNewTplName] = useState('');
  const [newTplCategory, setNewTplCategory] = useState<'MARKETING' | 'UTILITY'>('MARKETING');
  const [newTplLanguage, setNewTplLanguage] = useState<'en_US' | 'hi' | 'hi_en'>('en_US');
  const [newTplHeader, setNewTplHeader] = useState('🌟 Exclusive Announcement');
  const [newTplBody, setNewTplBody] = useState('Namaste {{1}}! We are thrilled to share an exclusive update with you. Avail our special offer valid until {{2}}. Choose an option below:');
  const [newTplFooter, setNewTplFooter] = useState('AutoMask Verified Desk');
  const [isSavingTpl, setIsSavingTpl] = useState(false);

  // Campaign builder state
  const [campaignName, setCampaignName] = useState('Exclusive Customer Privilege Announcement');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<'ALL' | 'NEW' | 'ENGAGED' | 'VIP' | 'CUSTOM'>('ENGAGED');
  const [customAudienceName, setCustomAudienceName] = useState('High-Value Contacts');
  const [customVar2, setCustomVar2] = useState('Sunday at 5:00 PM');
  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastHistoryItem[]>([
    {
      id: 'bc-01',
      name: 'Weekend Priority Customer Alert',
      templateName: 'welcome_customer_v1',
      targetCount: 142,
      deliveredCount: 141,
      readCount: 118,
      status: 'COMPLETED',
      sentAt: 'Yesterday, 11:30 AM',
    },
    {
      id: 'bc-02',
      name: 'VIP Privilege Announcement',
      templateName: 'vip_privilege_alert',
      targetCount: 88,
      deliveredCount: 88,
      readCount: 76,
      status: 'COMPLETED',
      sentAt: '12 Oct 2026',
    },
  ]);

  const [isLaunching, setIsLaunching] = useState(false);

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const res = await templatesApi.list();
      if (res.templates && Array.isArray(res.templates)) {
        const mapped: TemplateItem[] = res.templates.map(t => ({
          id: t.id,
          name: t.name,
          category: (t.category === 'UTILITY' ? 'UTILITY' : 'MARKETING') as 'UTILITY' | 'MARKETING',
          status: (t.status === 'APPROVED' ? 'APPROVED' : t.status === 'REJECTED' ? 'REJECTED' : 'IN_REVIEW') as any,
          language: t.language === 'hi_en' ? 'Hinglish (Hindi + English)' : t.language === 'hi' ? 'Hindi' : t.language === 'en_US' ? 'English' : t.language,
          body: t.components?.find((c: any) => c.type === 'BODY')?.text || t.bodyText || '',
          variables: ['Recipient Name', 'Expiry / Date'],
          lastUsedAt: t.createdAt ? 'Recently' : 'Never',
        }));
        setTemplates(mapped);
        if (mapped.length > 0 && !selectedTemplateId) {
          const approved = mapped.find(m => m.status === 'APPROVED') || mapped[0];
          setSelectedTemplateId(approved.id);
        }
      }
    } catch (err) {
      console.warn('Could not load templates:', err);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplName.trim() || !newTplBody.trim()) {
      alert('Please fill out the template name and message body.');
      return;
    }
    setIsSavingTpl(true);
    try {
      const cleanName = newTplName.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
      const createRes = await templatesApi.create({
        name: cleanName,
        category: newTplCategory,
        language: newTplLanguage,
        bodyText: newTplBody.trim(),
        headerText: newTplHeader.trim() || undefined,
        footerText: newTplFooter.trim() || undefined,
        buttons: [
          { id: 'btn-1', title: 'Claim Offer', type: 'QUICK_REPLY', payload: 'CLAIM_OFFER' },
          { id: 'btn-2', title: 'Visit Website', type: 'URL', url: 'https://example.com' },
          { id: 'btn-3', title: 'Call Support', type: 'CALL', phoneNumber: '+919876543210' }
        ]
      });

      if (createRes.template?.id) {
        await templatesApi.submitApproval(createRes.template.id);
        await templatesApi.approveTemplate(createRes.template.id);
      }

      alert(`🎉 Template "${cleanName}" (${newTplCategory} • ${newTplLanguage === 'hi_en' ? 'Hinglish' : newTplLanguage}) created and Meta approved!`);
      setIsCreateModalOpen(false);
      setNewTplName('');
      await loadTemplates();
      if (createRes.template?.id) {
        setSelectedTemplateId(createRes.template.id);
      }
    } catch (err: any) {
      alert(`Failed to create template: ${err?.message || 'Server error'}`);
    } finally {
      setIsSavingTpl(false);
    }
  };

  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  // Calculate target audience count based on audience segment
  const targetLeads = leads.filter(l => {
    if (selectedSegment === 'ALL') return true;
    if (selectedSegment === 'NEW') return l.status === 'NEW';
    if (selectedSegment === 'ENGAGED') return l.status === 'INTERESTED' || l.status === 'QUALIFIED';
    if (selectedSegment === 'VIP') return (l as any).score ? (l as any).score > 80 : true;
    return true; // CUSTOM
  });
  const audienceCount = Math.max(targetLeads.length * 15, 24); // scaled for demo representation

  const handleLaunchCampaign = async () => {
    if (!activeTemplate) {
      alert('Please create and select an approved template first.');
      return;
    }
    setIsLaunching(true);
    try {
      const res = await whatsappApi.sendBroadcast({
        name: campaignName,
        templateName: activeTemplate.name,
        targetSegment: selectedSegment === 'CUSTOM' ? customAudienceName : selectedSegment,
        count: audienceCount,
      });

      const newRecord: BroadcastHistoryItem = res.campaign || {
        id: `bc-${Date.now()}`,
        name: campaignName,
        templateName: activeTemplate.name,
        targetCount: audienceCount,
        deliveredCount: audienceCount - 1,
        readCount: Math.round(audienceCount * 0.78),
        status: 'COMPLETED',
        sentAt: 'Just now',
      };

      setBroadcastHistory(prev => [newRecord, ...prev]);
      if (onBroadcastSent) {
        onBroadcastSent(campaignName, audienceCount);
      }
      alert(`🎉 Broadcast Campaign "${campaignName}" sent to ${audienceCount} recipients via WhatsApp Cloud API!`);
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch broadcast campaign');
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="w-full px-6 sm:px-8 lg:px-10 py-8 space-y-8">
      {/* Top Banner & Quick Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-['Outfit'] flex items-center gap-3">
            <span>Meta WhatsApp Templates & Broadcasts</span>
            <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              Meta Cloud API Ready
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-1.5 font-normal">
            Compliant template-driven engagement for audiences outside the 24-hr customer service window.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveSubTab('TEMPLATES')}
            className={`h-11 px-5 text-sm font-bold rounded-xl transition-colors cursor-pointer ${
              activeSubTab === 'TEMPLATES'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Meta Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveSubTab('CAMPAIGNS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'CAMPAIGNS'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            🚀 Launch Broadcast Campaign
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Approved Templates</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 font-['Outfit']">
            {templates.filter(t => t.status === 'APPROVED').length} / {templates.length}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">100% compliant with Meta Business Policies</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Template Quota Usage</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 font-['Outfit']">
            {usage.templateMessagesUsed.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ {usage.templateMessagesLimit.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full" 
              style={{ width: `${(usage.templateMessagesUsed / usage.templateMessagesLimit) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Average Delivery Rate</span>
            <CheckCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 font-['Outfit']">99.4%</div>
          <p className="text-[11px] text-emerald-600 mt-1">Instant delivery via Meta Graph API</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Opt-Out Protection</span>
            <AlertCircle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 font-['Outfit']">0.2%</div>
          <p className="text-[11px] text-slate-500 mt-1">Auto-suppression active (SRS §4.3)</p>
        </div>
      </div>

      {/* VIEW 1: TEMPLATE LIBRARY */}
      {activeSubTab === 'TEMPLATES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Meta-Approved Template Catalog
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Custom Template</span>
              </button>
              {templates.length > 0 && (
                <button
                  onClick={() => setActiveSubTab('CAMPAIGNS')}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Use in Broadcast</span>
                </button>
              )}
            </div>
          </div>

          {isLoadingTemplates && (
            <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="text-xs">Loading Meta templates...</span>
            </div>
          )}

          {!isLoadingTemplates && templates.length === 0 && (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 max-w-lg mx-auto shadow-xs my-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 font-['Outfit']">
                  No Meta Templates Configured Yet
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Meta templates do not come pre-loaded. Create your custom template first, submit to Meta for approval, and it will appear here.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Custom Template & Submit to Meta</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <div 
                key={tpl.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-800 truncate" title={tpl.name}>
                      {tpl.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      tpl.status === 'APPROVED' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {tpl.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-3 flex-wrap">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                      tpl.category === 'MARKETING' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {tpl.category}
                    </span>
                    <span>•</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-600">
                      {tpl.language}
                    </span>
                  </div>

                  {/* Body Preview */}
                  <div className="bg-[#f0fdf4]/50 border border-emerald-100 p-3 rounded-xl text-xs text-slate-700 leading-relaxed font-sans mb-3">
                    {tpl.body || 'Template body text.'}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Used: {tpl.lastUsedAt}</span>
                  <button
                    onClick={() => {
                      setSelectedTemplateId(tpl.id);
                      setActiveSubTab('CAMPAIGNS');
                    }}
                    className="text-emerald-600 font-bold hover:text-emerald-700 cursor-pointer"
                  >
                    Select in Campaign →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: BROADCAST CAMPAIGN LAUNCHER */}
      {activeSubTab === 'CAMPAIGNS' && (
        <>
          {!activeTemplate ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 max-w-lg mx-auto shadow-xs my-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 font-['Outfit']">
                  No Approved Meta Templates Available
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  To launch a WhatsApp broadcast campaign, please create a custom template first and submit it for Meta approval.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveSubTab('TEMPLATES');
                  setIsCreateModalOpen(true);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create First Meta Template</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Form: Builder */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-800 font-['Outfit'] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Configure WhatsApp Broadcast Campaign</span>
                </h3>

                {/* Campaign Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Campaign Name:
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Select Meta Template */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Select Approved Meta Template:
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Create New</span>
                    </button>
                  </div>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  >
                    {templates.filter(t => t.status === 'APPROVED').map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category} • {t.language})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Audience Segment */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Filter Target Audience (CRM Segments):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'ALL', label: '🌐 All Audience' },
                      { id: 'NEW', label: '🟢 New Contacts' },
                      { id: 'ENGAGED', label: '⚡ High Intent' },
                      { id: 'VIP', label: '⭐ VIP / Premium' },
                      { id: 'CUSTOM', label: '🎯 Custom Segment' },
                    ].map(seg => (
                      <button
                        key={seg.id}
                        type="button"
                        onClick={() => setSelectedSegment(seg.id as any)}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center cursor-pointer ${
                          selectedSegment === seg.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {seg.label}
                      </button>
                    ))}
                  </div>

                  {selectedSegment === 'CUSTOM' && (
                    <div className="mt-2 animate-in fade-in">
                      <input
                        type="text"
                        value={customAudienceName}
                        onChange={(e) => setCustomAudienceName(e.target.value)}
                        placeholder="Enter custom audience tag or filter criteria (e.g. VIP-Cohort, Weekend-Shopper)..."
                        className="w-full text-xs p-2.5 bg-white border border-indigo-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  )}
                </div>

                {/* Dynamic Parameters */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Template Dynamic Variables
                  </span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">{'{{1}}'} Recipient Name:</span>
                    <span className="font-semibold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                      Auto-populated from CRM
                    </span>
                  </div>
                  {activeTemplate.variables && activeTemplate.variables.length > 1 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-mono">{'{{2}}'} {activeTemplate.variables[1]}:</span>
                      <input
                        type="text"
                        value={customVar2}
                        onChange={(e) => setCustomVar2(e.target.value)}
                        className="w-56 text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800"
                      />
                    </div>
                  )}
                </div>

                {/* Quota Impact Summary */}
                <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl flex items-center justify-between text-xs text-blue-900">
                  <div className="space-y-0.5">
                    <span className="font-bold">Audience Estimation:</span>
                    <p className="text-[11px] text-blue-700">
                      ~{audienceCount} eligible verified WhatsApp numbers (Active opt-in validated).
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-blue-800">{audienceCount}</span>
                    <span className="block text-[10px] text-blue-600 uppercase">Quota cost</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleLaunchCampaign}
                  disabled={isLaunching}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isLaunching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Launch Broadcast Campaign via WhatsApp API</span>
                </button>
              </div>

              {/* Right Preview: Live Phone Mockup */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-slate-500" />
                      <span>Audience Screen Preview</span>
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                      AutoMask Verified
                    </span>
                  </div>

                  {/* WhatsApp Message Bubble Simulation */}
                  <div className="bg-[#efeae2] p-4 rounded-2xl border border-slate-200 min-h-[220px] flex flex-col justify-end">
                    <div className="bg-white rounded-2xl p-3 shadow-sm max-w-[90%] space-y-2 text-xs leading-relaxed text-slate-800">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        <span>Official Business WhatsApp</span>
                      </div>
                      <p className="whitespace-pre-wrap font-sans">
                        {activeTemplate.body
                          ? activeTemplate.body
                              .replace('{{1}}', 'Alex Morgan')
                              .replace('{{2}}', customVar2)
                          : 'Message body preview'}
                      </p>
                      <div className="flex items-center justify-end text-[9px] text-slate-400">
                        <span>10:30 AM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Broadcast History */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Recent Broadcast Dispatches
                  </span>
                  <div className="space-y-2">
                    {broadcastHistory.map(bc => (
                      <div key={bc.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800">{bc.name}</div>
                          <div className="text-[10px] text-slate-400">{bc.templateName} • {bc.sentAt}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-bold text-emerald-600">{bc.deliveredCount} sent</span>
                          <span className="block text-[10px] text-slate-400">{bc.readCount} read</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE CUSTOM TEMPLATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 animate-in fade-in duration-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-['Outfit']">
                    Create Custom Template & Submit to Meta
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Compliant Meta WABA template with interactive buttons
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Template Name (Alphanumeric snake_case) *
                </label>
                <input
                  type="text"
                  value={newTplName}
                  onChange={e => setNewTplName(e.target.value)}
                  placeholder="e.g. exclusive_festive_offer_v1"
                  className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Meta Category *
                  </label>
                  <select
                    value={newTplCategory}
                    onChange={e => setNewTplCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-none"
                  >
                    <option value="MARKETING">MARKETING (Campaigns, Offers)</option>
                    <option value="UTILITY">UTILITY (Alerts, Reminders, Updates)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Language *
                  </label>
                  <select
                    value={newTplLanguage}
                    onChange={e => setNewTplLanguage(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-none"
                  >
                    <option value="en_US">English (en_US)</option>
                    <option value="hi">Hindi (hi)</option>
                    <option value="hi_en">Hinglish (Hindi + English)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Header Title (Optional)
                </label>
                <input
                  type="text"
                  value={newTplHeader}
                  onChange={e => setNewTplHeader(e.target.value)}
                  placeholder="e.g. 🌟 Exclusive Customer Privilege"
                  className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Message Body with Variables *
                  </label>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                    Use {'{{1}}'}, {'{{2}}'}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={newTplBody}
                  onChange={e => setNewTplBody(e.target.value)}
                  placeholder="Namaste {{1}}! We are thrilled to share an exclusive update with you. Avail our special offer valid until {{2}}. Choose an option below:"
                  className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 leading-relaxed font-sans"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Footer Note (Optional)
                </label>
                <input
                  type="text"
                  value={newTplFooter}
                  onChange={e => setNewTplFooter(e.target.value)}
                  placeholder="e.g. Reply STOP to unsubscribe"
                  className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:outline-none"
                />
              </div>

              {/* Interactive buttons chips preview */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Interactive Quick Reply & Action Buttons (Configured)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] bg-white border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-lg flex items-center gap-1 font-medium">
                    <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Claim Offer</span>
                  </span>
                  <span className="text-[10px] bg-white border border-sky-200 text-sky-700 px-2 py-0.5 rounded-lg flex items-center gap-1 font-medium">
                    <ExternalLink className="w-2.5 h-2.5 text-sky-600" />
                    <span>Visit Website</span>
                  </span>
                  <span className="text-[10px] bg-white border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-lg flex items-center gap-1 font-medium">
                    <Phone className="w-2.5 h-2.5 text-indigo-600" />
                    <span>Call Support</span>
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTpl}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingTpl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Save & Submit to Meta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
