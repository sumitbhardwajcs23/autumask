import React, { useState, useEffect } from 'react';
import { 
  Send, 
  FileText, 
  Users, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Smartphone, 
  X, 
  Sparkles, 
  ArrowRight, 
  FileSpreadsheet, 
  CheckCheck, 
  Ban, 
  Activity, 
  Layers, 
  Phone,
  Globe,
  MapPin,
  Compass,
  Tag,
  Hash,
  ExternalLink,
  MessageSquare,
  Trash2,
  Sliders,
  Check,
  RotateCcw,
  Briefcase
} from 'lucide-react';
import { 
  BroadcastCampaign, 
  MessageTemplate, 
  Lead, 
  UsageQuota, 
  UserRole,
  Contact,
  InteractiveButton,
  TargetAudienceFilter
} from '../../types';
import { 
  broadcastsApi, 
  templatesApi, 
  contactsImportApi, 
  contactsApi 
} from '../../services/api';
import { WhatsAppMessagePreview } from '../common/WhatsAppMessagePreview';
import { 
  BUSINESS_SECTORS, 
  ALL_SECTOR_KEYS, 
  BusinessSectorId, 
  IndustryTemplatePreset,
  getAllIndustryPresets 
} from '../../services/industryPacks';

interface BroadcastWizardViewProps {
  usage: UsageQuota;
  leads?: Lead[];
  userRole?: UserRole;
  workspace?: {
    name?: string;
    businessName?: string;
    industry?: BusinessSectorId;
    customerTerm?: string;
  };
  onCampaignCreated?: () => void;
}

export const BroadcastWizardView: React.FC<BroadcastWizardViewProps> = ({
  usage,
  leads = [],
  userRole = 'admin',
  workspace,
  onCampaignCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'CAMPAIGNS' | 'TEMPLATES' | 'IMPORT_CSV'>('CAMPAIGNS');
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Core Data
  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Wizard Modal State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [campaignName, setCampaignName] = useState('');
  const [campaignCategory, setCampaignCategory] = useState<'UTILITY' | 'MARKETING'>('MARKETING');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [optInOnly, setOptInOnly] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);

  // Advanced Audience Targeting State (Audio 2: City, Region, Country, Tags, Custom Numbers)
  const [audienceTargetTab, setAudienceTargetTab] = useState<'GEO' | 'TAGS' | 'CUSTOM_NUMBERS'>('GEO');
  const [targetCountry, setTargetCountry] = useState<string>('ALL');
  const [targetCity, setTargetCity] = useState<string>('ALL');
  const [targetRegion, setTargetRegion] = useState<string>('ALL');
  const [targetTags, setTargetTags] = useState<string[]>(['VIP']);
  const [targetLeadStatus, setTargetLeadStatus] = useState<string>('ALL');
  const [customPhoneNumbersInput, setCustomPhoneNumbersInput] = useState<string>('');

  // Template Creator State (Audio 1 & 2 Requirements: Meta Category & Interactive Buttons)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<'UTILITY' | 'MARKETING'>('MARKETING');
  const [newTemplateLanguage, setNewTemplateLanguage] = useState<'en_US' | 'hi' | 'hi_en'>('en_US');
  const [newTemplateHeader, setNewTemplateHeader] = useState('🌟 Special Announcement & Priority Access');
  const [newTemplateBody, setNewTemplateBody] = useState('Namaste {{1}}! We are delighted to share an exclusive update with you. Avail our special offer valid until {{2}}. Choose an option below:');
  const [newTemplateFooter, setNewTemplateFooter] = useState('Official WhatsApp Desk');
  const [newTemplateButtons, setNewTemplateButtons] = useState<InteractiveButton[]>([
    {
      id: 'btn-offer',
      title: '🏆 Claim Offer',
      type: 'QUICK_REPLY',
      payload: 'Special offer claim request initiated.',
    },
    {
      id: 'btn-details',
      title: '🌐 View Details',
      type: 'URL',
      url: 'https://example.com/exclusive-offer',
    },
    {
      id: 'btn-call-support',
      title: '📞 Contact Us',
      type: 'CALL',
      phoneNumber: '+919876543210',
    },
  ]);
  const [previewVar1, setPreviewVar1] = useState('Amit');
  const [previewVar2, setPreviewVar2] = useState('Sunday 5:00 PM');
  const [isSubmittingTemplate, setIsSubmittingTemplate] = useState(false);

  // CSV Import State
  const [csvContent, setCsvContent] = useState(
    'phone,name,tags,city\n+919876543210,Aarav Sharma,JEE;Class11,Delhi NCR\n+919876543211,Rhea Sen,NEET;Dropper,Kota\n+919876543212,Karan Patel,PSAT-2027,Jaipur\n9811234567,Amit Raj,Existing;Duplicate,Delhi NCR'
  );
  const [overwriteDuplicates, setOverwriteDuplicates] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<any>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [campRes, tempRes, contactsRes] = await Promise.all([
        broadcastsApi.listCampaigns().catch(() => ({ campaigns: [] })),
        templatesApi.list().catch(() => ({ templates: [] })),
        contactsApi.list().catch(() => ({ contacts: [] })),
      ]);

      if (campRes.campaigns) setCampaigns(campRes.campaigns);
      if (tempRes.templates) setTemplates(tempRes.templates);
      if (contactsRes.contacts) setContacts(contactsRes.contacts);
    } catch (err: any) {
      console.warn('Failed to load broadcast data:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Submit Template for Meta Approval
  const handleSubmitApproval = async (tplId: string) => {
    try {
      const res = await templatesApi.submitApproval(tplId);
      showNotice(`Template "${res.template.name}" submitted to Meta for review.`);
      loadData();
    } catch (err: any) {
      alert(`Submission failed: ${err?.message || 'Server error'}`);
    }
  };

  // Simulate Meta Cloud API Approval (Webhook verification)
  const handleSimulateApproval = async (tplId: string) => {
    try {
      await templatesApi.approveTemplate(tplId);
      showNotice(`Meta Webhook Event: Template approved and ready for broadcasts!`);
      loadData();
    } catch (err: any) {
      alert(`Approval simulation failed: ${err?.message || 'Server error'}`);
    }
  };

  // Active industry filters & configuration
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<BusinessSectorId>('ALL');
  const [creationSector, setCreationSector] = useState<Exclude<BusinessSectorId, 'ALL'>>(
    (workspace?.industry && workspace.industry !== 'ALL' ? workspace.industry : 'GENERAL') as Exclude<BusinessSectorId, 'ALL'>
  );
  const [customTagInput, setCustomTagInput] = useState('');

  // Synchronize creationSector when workspace industry updates
  useEffect(() => {
    if (workspace?.industry && workspace.industry !== 'ALL') {
      setCreationSector(workspace.industry as Exclude<BusinessSectorId, 'ALL'>);
    }
  }, [workspace?.industry]);

  const audienceLabelPlural = workspace?.customerTerm || 
    (workspace?.industry && workspace.industry !== 'ALL' && BUSINESS_SECTORS[workspace.industry]?.customerTermPlural) || 
    'Recipients';

  const audienceLabelSingle = 
    (workspace?.industry && workspace.industry !== 'ALL' && BUSINESS_SECTORS[workspace.industry]?.customerTermSingle) || 
    'Recipient';

  // Presets for Template Creator across all market business sectors (Audio 1, 2 & 4)
  const applyIndustryPreset = (preset: IndustryTemplatePreset) => {
    setNewTemplateName(preset.name);
    setNewTemplateCategory(preset.category);
    setNewTemplateHeader(preset.headerText);
    setNewTemplateBody(preset.bodyText);
    setNewTemplateFooter(preset.footerText);
    setNewTemplateButtons(preset.buttons);
    setPreviewVar1(preset.defaultVar1);
    setPreviewVar2(preset.defaultVar2);
    if (preset.industry !== 'ALL') {
      setCreationSector(preset.industry);
    }
  };

  // Create Custom Template & Submit to Meta (Audio 1 & 2)
  const handleCreateAndSubmitTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim() || !newTemplateBody.trim()) {
      alert('Please fill out the template name and message body.');
      return;
    }
    setIsSubmittingTemplate(true);
    try {
      const cleanName = newTemplateName.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
      const createRes = await templatesApi.create({
        name: cleanName,
        category: newTemplateCategory,
        language: newTemplateLanguage,
        industry: creationSector,
        bodyText: newTemplateBody.trim(),
        headerText: newTemplateHeader.trim() || undefined,
        footerText: newTemplateFooter.trim() || undefined,
        buttons: newTemplateButtons,
      });

      if (createRes.template?.id) {
        await templatesApi.submitApproval(createRes.template.id);
      }

      showNotice(`Template "${cleanName}" (${newTemplateCategory}) saved & submitted to Meta for verification.`);
      setIsTemplateModalOpen(false);
      setNewTemplateName('');
      loadData();
    } catch (err: any) {
      alert(`Submission to Meta failed: ${err?.message || 'Server error'}`);
    } finally {
      setIsSubmittingTemplate(false);
    }
  };

  // Audience Targeting Engine: filter contacts dynamically by City, Region, Country, Tags, Numbers (Audio 2)
  const getFilteredContacts = () => {
    let result = contacts;

    // 1. Country Filter
    if (targetCountry && targetCountry !== 'ALL') {
      result = result.filter(c => (c.country || 'India').toLowerCase() === targetCountry.toLowerCase());
    }

    // 2. City Filter
    if (targetCity && targetCity !== 'ALL') {
      result = result.filter(c => (c.city || '').toLowerCase() === targetCity.toLowerCase());
    }

    // 3. Region Filter
    if (targetRegion && targetRegion !== 'ALL') {
      result = result.filter(c => (c.region || '').toLowerCase() === targetRegion.toLowerCase());
    }

    // 4. Cohort Tags
    if (targetTags.length > 0) {
      result = result.filter(c => c.tags.some(t => targetTags.includes(t)));
    }

    // 5. Custom Phone Numbers
    if (customPhoneNumbersInput.trim()) {
      const numbers = customPhoneNumbersInput
        .split(/[\n,;]+/)
        .map(n => n.replace(/[^0-9]/g, ''))
        .filter(n => n.length >= 10);
      if (numbers.length > 0) {
        result = result.filter(c => numbers.includes(c.phone.replace(/[^0-9]/g, '')));
      }
    }

    return result;
  };

  const matchedContacts = getFilteredContacts();
  const eligibleContacts = matchedContacts.filter(c => c.optInStatus === 'OPTED_IN');
  const optedOutContacts = matchedContacts.filter(c => c.optInStatus === 'OPTED_OUT');

  // Launch Campaign from Wizard with Audience Targeting
  const handleLaunchCampaign = async () => {
    if (!campaignName.trim() || !selectedTemplateId) return;

    setIsLaunching(true);
    try {
      const audienceFilter: TargetAudienceFilter = {
        country: targetCountry !== 'ALL' ? targetCountry : undefined,
        city: targetCity !== 'ALL' ? targetCity : undefined,
        region: targetRegion !== 'ALL' ? targetRegion : undefined,
        tags: targetTags.length > 0 ? targetTags : undefined,
        leadStatus: targetLeadStatus !== 'ALL' ? [targetLeadStatus] : undefined,
        customPhoneNumbers: customPhoneNumbersInput.trim() 
          ? customPhoneNumbersInput.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean) 
          : undefined,
        optInOnly,
      };

      // 1. Create Campaign
      const createRes = await broadcastsApi.createCampaign({
        name: campaignName.trim(),
        templateId: selectedTemplateId,
        templateName: selectedTemplate?.name || 'custom_campaign',
        category: selectedTemplate?.category || campaignCategory,
        industry: workspace?.industry || selectedTemplate?.industry || 'GENERAL',
        headerText: selectedTemplate?.headerText,
        customMessageText: selectedTemplate?.bodyText,
        footerText: selectedTemplate?.footerText,
        buttons: selectedTemplate?.buttons,
        audienceFilter,
        totalRecipients: eligibleContacts.length,
        excludedCount: optedOutContacts.length,
      });

      // 2. Trigger Send
      if (createRes.campaign?.id) {
        await broadcastsApi.sendCampaign(createRes.campaign.id);
        showNotice(`Broadcast dispatched to ${eligibleContacts.length} targeted contacts (${optedOutContacts.length} opt-out protected).`);
      }

      setIsWizardOpen(false);
      setWizardStep(1);
      setCampaignName('');
      loadData();
      if (onCampaignCreated) onCampaignCreated();
    } catch (err: any) {
      alert(`Campaign failed: ${err?.message || 'Server error'}`);
    } finally {
      setIsLaunching(false);
    }
  };

  // Import CSV Contacts
  const handleImportCsv = async () => {
    if (!csvContent.trim()) return;

    setIsImporting(true);
    setImportSummary(null);

    try {
      const res = await contactsImportApi.importCsv(csvContent.trim(), overwriteDuplicates);
      setImportSummary(res);
      showNotice(`CSV processed: ${res.importedCount} new contacts imported, ${res.skippedDuplicates} duplicates skipped.`);
      loadData();
    } catch (err: any) {
      alert(`CSV import error: ${err?.message || 'Server error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    if (selectedSectorFilter === 'ALL') return true;
    return t.industry === selectedSectorFilter;
  });

  const filteredCampaigns = campaigns.filter(c => {
    if (selectedSectorFilter === 'ALL') return true;
    return c.industry === selectedSectorFilter;
  });

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <div className="w-full px-6 sm:px-8 lg:px-10 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-md flex items-center justify-center text-white shrink-0">
              <Send className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-['Outfit'] flex items-center gap-3">
                WhatsApp Broadcast Campaigns & Templates
                <span className="text-xs font-black bg-sky-50 text-sky-700 px-3 py-1 rounded-full border border-sky-200">
                  Meta Cloud API
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 mt-1.5 font-normal">
                Send targeted announcements, scholarship alerts, and schedule reminders with automatic opt-out suppression.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {actionNotice && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{actionNotice}</span>
            </div>
          )}

          <button
            onClick={() => {
              setWizardStep(1);
              setIsWizardOpen(true);
            }}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Broadcast Campaign</span>
          </button>

          <button
            onClick={loadData}
            className="p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Multi-Industry Sector Filter Pills Bar (Audio 1 & 2) */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-2xs flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 whitespace-nowrap flex items-center gap-1">
          <Briefcase className="w-3 h-3 text-slate-400" />
          Industry:
        </span>
        <button
          type="button"
          onClick={() => setSelectedSectorFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            selectedSectorFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>🌐 All Sectors ({templates.length})</span>
        </button>
        {ALL_SECTOR_KEYS.map(secKey => {
          const cfg = BUSINESS_SECTORS[secKey];
          const isSelected = selectedSectorFilter === secKey;
          const matchCount = templates.filter(t => t.industry === secKey).length;
          return (
            <button
              key={secKey}
              type="button"
              onClick={() => setSelectedSectorFilter(secKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{cfg.shortName}</span>
              {matchCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-600'
                }`}>
                  {matchCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('CAMPAIGNS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'CAMPAIGNS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Broadcast Campaigns ({filteredCampaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TEMPLATES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'TEMPLATES'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Meta Templates ({templates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('IMPORT_CSV')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'IMPORT_CSV'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>CSV Contact Import & Deduplication</span>
        </button>
      </div>

      {/* Tab 1: Campaigns & Delivery Status */}
      {activeTab === 'CAMPAIGNS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Total Audience Reached</span>
              <div className="text-2xl font-extrabold text-slate-800 font-['Outfit'] mt-1">
                {campaigns.reduce((sum, c) => sum + (c.deliveredCount || 0), 0).toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Across all broadcast batches</span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Opt-Out Protection Rate</span>
              <div className="text-2xl font-extrabold text-slate-800 font-['Outfit'] mt-1">
                100%
              </div>
              <span className="text-[11px] text-sky-600 font-medium">Zero spam strikes on WhatsApp WABA</span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Monthly Quota Consumption</span>
              <div className="text-2xl font-extrabold text-slate-800 font-['Outfit'] mt-1">
                {usage.templateMessagesUsed} / {usage.templateMessagesLimit}
              </div>
              <span className="text-[11px] text-purple-600 font-medium">Meta Tier 1 Verified Account</span>
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Category & Template</th>
                  <th className="py-3 px-4">Audience Target</th>
                  <th className="py-3 px-4">Delivery Progress</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCampaigns.map(camp => {
                  const secCfg = camp.industry && camp.industry !== 'ALL' ? BUSINESS_SECTORS[camp.industry as Exclude<BusinessSectorId, 'ALL'>] : null;
                  return (
                    <tr key={camp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{camp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {camp.id}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border ${
                            camp.category === 'MARKETING' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            camp.category === 'UTILITY' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {camp.category || 'MARKETING'}
                          </span>
                          {secCfg && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${secCfg.badgeClass}`}>
                              {secCfg.shortName}
                            </span>
                          )}
                          <span className="text-xs font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {camp.templateName || camp.templateId}
                          </span>
                        </div>
                        {camp.buttons && camp.buttons.length > 0 && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-500" />
                            <span>{camp.buttons.length} Interactive Buttons</span>
                          </div>
                        )}
                      </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{camp.totalRecipients} recipients</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        {camp.audienceFilter?.city ? (
                          <span className="inline-flex items-center gap-0.5 text-indigo-600 bg-indigo-50 px-1 rounded">
                            <MapPin className="w-2.5 h-2.5" />
                            {camp.audienceFilter.city}
                          </span>
                        ) : camp.audienceFilter?.country ? (
                          <span className="inline-flex items-center gap-0.5 text-slate-600 bg-slate-100 px-1 rounded">
                            <Globe className="w-2.5 h-2.5" />
                            {camp.audienceFilter.country}
                          </span>
                        ) : (
                          <span>All Eligible</span>
                        )}
                        {camp.audienceFilter?.tags && camp.audienceFilter.tags.length > 0 && (
                          <span className="text-slate-500 font-mono">[{camp.audienceFilter.tags.join(',')}]</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-1.5 rounded-full" 
                            style={{ width: `${camp.totalRecipients > 0 ? (camp.deliveredCount / camp.totalRecipients) * 100 : 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700">
                          {camp.deliveredCount}/{camp.totalRecipients}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        camp.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        camp.status === 'SENDING' ? 'bg-sky-50 text-sky-700 border border-sky-200 animate-pulse' :
                        camp.status === 'SCHEDULED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {camp.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {camp.status === 'DRAFT' && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await broadcastsApi.sendCampaign(camp.id);
                              showNotice(`Sent to ${res.result.delivered} ${audienceLabelPlural}!`);
                              loadData();
                            } catch (err: any) {
                              alert(`Send failed: ${err?.message || 'Server error'}`);
                            }
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Send Now
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: WhatsApp Meta Templates (Audio 1 & 2 Requirements) */}
      {activeTab === 'TEMPLATES' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800 font-['Outfit'] flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Official Meta WhatsApp Verified Templates & Interactive CTAs
              </h2>
              <p className="text-xs text-slate-500">
                Meta requires pre-approval for outbound marketing and utility templates with up to 3 interactive buttons.
              </p>
            </div>

            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Custom Template & Submit to Meta</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(tpl => {
              const isApproved = tpl.status === 'APPROVED';
              const isPending = tpl.status === 'PENDING' || tpl.status === 'PENDING_APPROVAL';
              const secCfg = tpl.industry && tpl.industry !== 'ALL' ? BUSINESS_SECTORS[tpl.industry as Exclude<BusinessSectorId, 'ALL'>] : null;

              return (
                <div key={tpl.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-slate-800 truncate" title={tpl.name}>
                        {tpl.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                        isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        isPending ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        tpl.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {isApproved && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                        {isApproved ? 'Meta Approved' : isPending ? 'Under Review' : tpl.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                        tpl.category === 'MARKETING' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        tpl.category === 'UTILITY' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {tpl.category}
                      </span>

                      {secCfg && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${secCfg.badgeClass}`}>
                          {secCfg.shortName}
                        </span>
                      )}

                      <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                        {tpl.language === 'hi_en' ? 'Hinglish (Hindi + English)' : tpl.language === 'hi' ? 'Hindi' : tpl.language === 'en_US' ? 'English' : tpl.language}
                      </span>
                    </div>

                    {tpl.headerText && (
                      <div className="text-[11px] font-bold text-emerald-800 mb-1">
                        {tpl.headerText}
                      </div>
                    )}

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 font-sans mb-3 line-clamp-3 leading-relaxed">
                      {tpl.components?.find(c => c.type === 'BODY')?.text || tpl.bodyText || 'Template body text.'}
                    </div>

                    {/* Interactive Buttons Chips */}
                    {tpl.buttons && tpl.buttons.length > 0 && (
                      <div className="mb-3 space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                          Interactive Buttons ({tpl.buttons.length}/3):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {tpl.buttons.map((b, idx) => (
                            <span 
                              key={b.id || idx}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg"
                            >
                              {b.type === 'URL' && <ExternalLink className="w-2.5 h-2.5 text-sky-600" />}
                              {b.type === 'CALL' && <Phone className="w-2.5 h-2.5 text-indigo-600" />}
                              {b.type === 'QUICK_REPLY' && <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />}
                              <span>{b.title}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Meta ID: {tpl.metaTemplateId || 'waba-tmpl'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isPending && (
                        <button
                          onClick={() => handleSimulateApproval(tpl.id)}
                          className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          title="Simulate Meta Webhook approval for testing"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Simulate Approval</span>
                        </button>
                      )}
                      {tpl.status === 'DRAFT' && (
                        <button
                          onClick={() => handleSubmitApproval(tpl.id)}
                          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Submit to Meta
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4 max-w-lg mx-auto shadow-xs my-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 font-['Outfit']">
                  No Meta Templates Configured Yet
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Templates do not come pre-loaded. Design your custom template, submit it to Meta for approval, and it will automatically appear here once approved.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Custom Template & Submit to Meta</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: CSV Bulk Contact Import */}
      {activeTab === 'IMPORT_CSV' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-800 font-['Outfit'] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Bulk Contact Importer & Duplicate Detector
            </h2>
            <p className="text-xs text-slate-500">
              Import thousands of student admissions leads at once. Automatically normalizes Indian phone numbers (+91), deduplicates against existing records, and tags incoming cohorts.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              Paste CSV Content (Format: phone, name, tags, city)
            </label>
            <textarea
              rows={8}
              value={csvContent}
              onChange={e => setCsvContent(e.target.value)}
              className="w-full text-xs font-mono p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50 leading-relaxed text-slate-800"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={overwriteDuplicates}
                onChange={e => setOverwriteDuplicates(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Overwrite existing contact names and tags if duplicate found</span>
            </label>

            <button
              onClick={handleImportCsv}
              disabled={isImporting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
              <span>Process & Import Contacts</span>
            </button>
          </div>

          {importSummary && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in">
              <h4 className="text-xs font-bold text-slate-800 font-['Outfit']">
                Import Ingestion Summary
              </h4>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <div className="text-base font-extrabold text-slate-800">{importSummary.totalProcessed}</div>
                  <div className="text-[10px] text-slate-400">Total Rows</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100 text-emerald-700">
                  <div className="text-base font-extrabold">{importSummary.importedCount}</div>
                  <div className="text-[10px]">Successfully Imported</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-100 text-amber-700">
                  <div className="text-base font-extrabold">{importSummary.skippedDuplicates}</div>
                  <div className="text-[10px]">Skipped Duplicates</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-rose-100 text-rose-700">
                  <div className="text-base font-extrabold">{importSummary.invalidRowsCount}</div>
                  <div className="text-[10px]">Invalid Phone Format</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4-Step Broadcast Wizard Modal with Audience Segmentation Studio */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-4xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center font-bold shadow-md">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-['Outfit'] flex items-center gap-2">
                    WhatsApp Broadcast Studio
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                      Step {wizardStep} of 4
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {wizardStep === 1 && 'Configure campaign details and Meta message category'}
                    {wizardStep === 2 && 'Choose an approved Meta template with interactive CTAs'}
                    {wizardStep === 3 && 'Audio 2: Target by City, Area, Country, Tags & Custom Numbers with Opt-Out Guard'}
                    {wizardStep === 4 && 'Preview interactive WhatsApp phone simulation and launch broadcast'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { step: 1, label: '1. Objective' },
                { step: 2, label: '2. Template' },
                { step: 3, label: '3. Audience Studio' },
                { step: 4, label: '4. Live Review' },
              ].map(s => (
                <div 
                  key={s.step} 
                  className={`py-1.5 px-2 rounded-xl text-center text-xs font-bold border transition-all ${
                    wizardStep === s.step 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                      : wizardStep > s.step 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  {s.label}
                </div>
              ))}
            </div>

            {/* Modal Body Container with Scroll */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
              {/* Step 1: Basics & Category Selection */}
              {wizardStep === 1 && (
                <div className="space-y-4 max-w-xl mx-auto py-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={e => setCampaignName(e.target.value)}
                      placeholder="e.g. JEE 2027 Dropper Batch Masterclass Reminder"
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-800"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Internal identifier for analytics and campaign performance tracking.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">
                      Meta Message Category *
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { id: 'MARKETING', label: 'MARKETING', desc: 'Promotions, announcements, seasonal offers' },
                        { id: 'UTILITY', label: 'UTILITY', desc: 'Order updates, account alerts, schedule reminders' },
                      ].map(cat => (
                        <div
                          key={cat.id}
                          onClick={() => setCampaignCategory(cat.id as any)}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                            campaignCategory === cat.id
                              ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider block mb-1 w-max ${
                            cat.id === 'MARKETING' ? 'bg-purple-100 text-purple-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {cat.label}
                          </span>
                          <p className="text-[10px] text-slate-500 leading-tight">
                            {cat.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                    <span className="font-bold text-slate-700 block flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Opt-Out Suppression Protection
                    </span>
                    <p className="text-[11px] text-slate-500">
                      AutoMask automatically suppresses recipients who replied "STOP" or opted out, preserving your Meta WABA tier quality rating.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Select Meta-Approved Template */}
              {wizardStep === 2 && (
                <div className="space-y-3 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700">
                        Select Meta-Approved Template
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Only verified and approved templates can be broadcasted via WhatsApp Cloud API.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsTemplateModalOpen(true)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Template</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar p-1">
                    {templates
                      .filter(t => t.status === 'APPROVED')
                      .map(tpl => (
                        <div
                          key={tpl.id}
                          onClick={() => setSelectedTemplateId(tpl.id)}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                            selectedTemplateId === tpl.id
                              ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono text-xs font-bold text-slate-800">{tpl.name}</span>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border ${
                                tpl.category === 'MARKETING' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                tpl.category === 'UTILITY' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {tpl.category}
                              </span>
                            </div>

                            {tpl.headerText && (
                              <div className="text-[10px] font-bold text-emerald-800 mb-1">
                                {tpl.headerText}
                              </div>
                            )}

                            <p className="text-[11px] text-slate-600 line-clamp-3 bg-slate-50 p-2 rounded-xl mb-2 font-sans leading-relaxed">
                              {tpl.components?.find(c => c.type === 'BODY')?.text || tpl.bodyText}
                            </p>
                          </div>

                          {/* Interactive Buttons Preview on Template Card */}
                          {tpl.buttons && tpl.buttons.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                              {tpl.buttons.map((b, idx) => (
                                <span 
                                  key={b.id || idx}
                                  className="text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1"
                                >
                                  {b.type === 'URL' && <ExternalLink className="w-2.5 h-2.5 text-sky-600" />}
                                  {b.type === 'CALL' && <Phone className="w-2.5 h-2.5 text-indigo-600" />}
                                  {b.type === 'QUICK_REPLY' && <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />}
                                  <span className="truncate max-w-[100px]">{b.title}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    {templates.filter(t => t.status === 'APPROVED').length === 0 && (
                      <div className="col-span-2 text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="font-bold text-slate-700">No Approved Meta Templates Available</div>
                        <p className="text-slate-400">Create a custom template and simulate Meta approval to broadcast.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Audience Segmentation & Targeting Studio (Audio 2 Requirements) */}
              {wizardStep === 3 && (
                <div className="space-y-4 py-1">
                  {/* Real-time Audience Calculator Bar */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Filter Matched
                      </span>
                      <span className="text-xl font-extrabold text-slate-800 font-['Outfit']">
                        {matchedContacts.length}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Contacts in Database</span>
                    </div>

                    <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 text-center">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                        Eligible Recipients (Opted-in)
                      </span>
                      <span className="text-xl font-extrabold text-emerald-600 font-['Outfit']">
                        {eligibleContacts.length}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold block">Safe for WhatsApp Blast</span>
                    </div>

                    <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-200 text-center">
                      <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                        Opt-Out Suppressed (STOP)
                      </span>
                      <span className="text-xl font-extrabold text-rose-600 font-['Outfit']">
                        {optedOutContacts.length}
                      </span>
                      <span className="text-[10px] text-rose-600 font-semibold block">Auto Protected</span>
                    </div>
                  </div>

                  {/* Audience Targeting Studio Navigation Tabs */}
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <button
                      type="button"
                      onClick={() => setAudienceTargetTab('GEO')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        audienceTargetTab === 'GEO'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>📍 Location & Geography Targeting</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAudienceTargetTab('TAGS')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        audienceTargetTab === 'TAGS'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>🏷️ {audienceLabelPlural} Cohorts & Tags</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAudienceTargetTab('CUSTOM_NUMBERS')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        audienceTargetTab === 'CUSTOM_NUMBERS'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>📱 Custom Phone Numbers Direct List</span>
                    </button>
                  </div>

                  {/* Tab Panel 1: Location & Geography (Audio 2: City-wise, Country-wise, Area-wise) */}
                  {audienceTargetTab === 'GEO' && (
                    <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200 space-y-3.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Compass className="w-4 h-4 text-indigo-600" />
                          Geographic & Regional Targeting
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setTargetCountry('India');
                              setTargetCity('Delhi NCR');
                              setTargetRegion('North Zone');
                            }}
                            className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200 hover:bg-indigo-100 cursor-pointer"
                          >
                            🎯 Delhi NCR
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTargetCountry('India');
                              setTargetCity('Kota');
                              setTargetRegion('North Zone');
                            }}
                            className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200 hover:bg-indigo-100 cursor-pointer"
                          >
                            🎯 Kota Hub
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTargetCountry('United Arab Emirates');
                              setTargetCity('Dubai');
                              setTargetRegion('Middle East');
                            }}
                            className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 hover:bg-purple-100 cursor-pointer"
                          >
                            🌍 Dubai NRI
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTargetCountry('ALL');
                              setTargetCity('ALL');
                              setTargetRegion('ALL');
                            }}
                            className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Reset</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Target Country
                          </label>
                          <select
                            value={targetCountry}
                            onChange={e => setTargetCountry(e.target.value)}
                            className="w-full text-xs p-2 bg-white rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          >
                            <option value="ALL">All Countries (Global)</option>
                            <option value="India">India (+91)</option>
                            <option value="United Arab Emirates">United Arab Emirates (+971)</option>
                            <option value="Nepal">Nepal (+977)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Target City
                          </label>
                          <select
                            value={targetCity}
                            onChange={e => setTargetCity(e.target.value)}
                            className="w-full text-xs p-2 bg-white rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          >
                            <option value="ALL">All Cities</option>
                            <option value="Delhi NCR">Delhi NCR</option>
                            <option value="Kota">Kota</option>
                            <option value="Patna">Patna</option>
                            <option value="Jaipur">Jaipur</option>
                            <option value="Lucknow">Lucknow</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Bengaluru">Bengaluru</option>
                            <option value="Dubai">Dubai</option>
                            <option value="Kathmandu">Kathmandu</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Target Area / Region
                          </label>
                          <select
                            value={targetRegion}
                            onChange={e => setTargetRegion(e.target.value)}
                            className="w-full text-xs p-2 bg-white rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          >
                            <option value="ALL">All Zones & Regions</option>
                            <option value="North Zone">North Zone (Delhi, UP, Rajasthan)</option>
                            <option value="Central Hub">Central Hub</option>
                            <option value="East Region">East Region (Bihar, Bengal)</option>
                            <option value="West Zone">West Zone (Maharashtra, Gujarat)</option>
                            <option value="South Region">South Region (Karnataka, TN)</option>
                            <option value="Middle East">Middle East (UAE / Gulf)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab Panel 2: Cohorts & Audience Tags (Audio 1, 2 & 4) */}
                  {audienceTargetTab === 'TAGS' && (
                    <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Tag className="w-4 h-4 text-indigo-600" />
                          Filter by {audienceLabelPlural} Cohorts, Tags & Segments
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {targetTags.length} tags active
                        </span>
                      </div>

                      {/* Dynamic Industry Recommended & Custom Tags */}
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set([
                          ...((workspace?.industry && workspace.industry !== 'ALL' && BUSINESS_SECTORS[workspace.industry]?.recommendedTags) || BUSINESS_SECTORS.GENERAL.recommendedTags),
                          ...targetTags
                        ])).map(t => {
                          const isSelected = targetTags.includes(t);
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setTargetTags(targetTags.filter(x => x !== t));
                                } else {
                                  setTargetTags([...targetTags, t]);
                                }
                              }}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                              <span>{t}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Add Custom Tag on the fly */}
                      <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                        <input
                          type="text"
                          value={customTagInput}
                          onChange={e => setCustomTagInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && customTagInput.trim()) {
                              e.preventDefault();
                              if (!targetTags.includes(customTagInput.trim())) {
                                setTargetTags([...targetTags, customTagInput.trim()]);
                              }
                              setCustomTagInput('');
                            }
                          }}
                          placeholder={`+ Add custom tag for this batch (e.g. VIP, Abandoned Cart, 3BHK)...`}
                          className="text-xs p-2 bg-white rounded-xl border border-slate-200 text-slate-800 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customTagInput.trim()) {
                              if (!targetTags.includes(customTagInput.trim())) {
                                setTargetTags([...targetTags, customTagInput.trim()]);
                              }
                              setCustomTagInput('');
                            }
                          }}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Tag</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tab Panel 3: Custom Phone Numbers (Direct client list) */}
                  {audienceTargetTab === 'CUSTOM_NUMBERS' && (
                    <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200 space-y-2 animate-in fade-in">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-indigo-600" />
                        Target Specific Phone Numbers Directly
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Paste specific phone numbers (separated by commas or new lines). Matches will be verified against opt-in records.
                      </p>
                      <textarea
                        rows={3}
                        value={customPhoneNumbersInput}
                        onChange={e => setCustomPhoneNumbersInput(e.target.value)}
                        placeholder="+919876543210, +919876543211, +971501234567"
                        className="w-full text-xs font-mono p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  )}

                  {/* Live Matched Student Preview Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        Live Matched Recipients Preview ({matchedContacts.length})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Showing first 5 matches
                      </span>
                    </div>

                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="py-2 px-3">Student Name</th>
                          <th className="py-2 px-3">Phone</th>
                          <th className="py-2 px-3">Location (City / Region)</th>
                          <th className="py-2 px-3">Cohort Tags</th>
                          <th className="py-2 px-3 text-right">Opt-In Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {matchedContacts.slice(0, 5).map(c => (
                          <tr key={c.id} className="hover:bg-slate-50/40">
                            <td className="py-2 px-3 font-semibold text-slate-800">{c.name}</td>
                            <td className="py-2 px-3 font-mono text-slate-500">{c.phone}</td>
                            <td className="py-2 px-3">
                              <span className="font-medium text-slate-700">{c.city || 'Delhi NCR'}</span>
                              <span className="text-[10px] text-slate-400 ml-1">({c.region || 'North'})</span>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex flex-wrap gap-1">
                                {c.tags.slice(0, 2).map(tag => (
                                  <span key={tag} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-right">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                c.optInStatus === 'OPTED_IN'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {c.optInStatus === 'OPTED_IN' ? 'Eligible' : 'Opted Out'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {matchedContacts.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-xs text-slate-400">
                              No contacts match the selected geographic or tag criteria. Try expanding your filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Step 4: Final Confirmation & Live Smartphone Preview */}
              {wizardStep === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 py-2">
                  {/* Left Column: Campaign Launch Summary */}
                  <div className="md:col-span-6 space-y-3.5">
                    <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 space-y-2.5 shadow-md">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        Campaign Launch Readiness Confirmed
                      </div>

                      <div className="text-xs space-y-1.5 border-t border-slate-800 pt-2">
                        <div>
                          <span className="text-slate-400">Campaign Title:</span>{' '}
                          <strong className="text-white font-['Outfit']">{campaignName}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Meta Category:</span>{' '}
                          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-mono font-bold text-[10px]">
                            {selectedTemplate?.category || campaignCategory}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Template:</span>{' '}
                          <strong className="text-slate-200 font-mono">{selectedTemplate?.name}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Geographic Targeting:</span>{' '}
                          <strong className="text-emerald-300">
                            {targetCity !== 'ALL' ? targetCity : targetCountry !== 'ALL' ? targetCountry : 'All Locations'} 
                            {targetRegion !== 'ALL' ? ` (${targetRegion})` : ''}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Cohort Tags:</span>{' '}
                          <strong className="text-slate-300">{targetTags.join(', ') || 'All Cohorts'}</strong>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Eligible Outbound Deliveries:</span>
                          <span className="text-lg font-black text-emerald-400 font-mono">{eligibleContacts.length} {audienceLabelPlural}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Suppressed (Opt-Out):</span>
                          <span className="text-lg font-black text-rose-400 font-mono">{optedOutContacts.length} {audienceLabelPlural}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Compliant with Meta Cloud API Tier 1 messaging guidelines. Interactive button events will trigger automatic routing.
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Live WhatsApp Mobile Preview */}
                  <div className="md:col-span-6 flex flex-col items-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      Live Recipient WhatsApp Preview
                    </span>

                    <WhatsAppMessagePreview
                      headerText={selectedTemplate?.headerText || 'Official Announcement'}
                      bodyText={selectedTemplate?.bodyText || 'Welcome! We are excited to connect with you.'}
                      footerText={selectedTemplate?.footerText || `Official WhatsApp Desk • ${workspace?.businessName || 'Business'}`}
                      buttons={selectedTemplate?.buttons || []}
                      instituteName={workspace?.businessName || 'Verified Business'}
                      mode="phone"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => {
                  if (wizardStep > 1) setWizardStep((wizardStep - 1) as any);
                  else setIsWizardOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                {wizardStep === 1 ? 'Cancel' : 'Back'}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (wizardStep < 4) {
                    if (wizardStep === 1 && !campaignName.trim()) {
                      alert('Please enter a campaign name');
                      return;
                    }
                    if (wizardStep === 2 && !selectedTemplateId) {
                      alert('Please select an approved template');
                      return;
                    }
                    setWizardStep((wizardStep + 1) as any);
                  } else {
                    handleLaunchCampaign();
                  }
                }}
                disabled={isLaunching}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isLaunching && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{wizardStep === 4 ? `Confirm & Send to ${eligibleContacts.length} ${audienceLabelPlural}` : 'Next Step'}</span>
                {wizardStep < 4 && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Template Creator Modal with Interactive Buttons & Meta Categories (Audio 1 & 2) */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-600 p-0.5 shadow-md flex items-center justify-center text-white font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-['Outfit'] flex items-center gap-2">
                    Create Custom Template & Submit to Meta
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                      Cloud API v21.0
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Define custom message text, Meta category, and up to 3 interactive buttons (Quick Replies, Call Hotline, Website URL).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Business Sector & Tailored Presets (Audio 1, 2 & 4) */}
            <div className="py-2.5 border-b border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-['Outfit']">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  Select Business Sector / Industry:
                </span>
                <span className="text-[10px] text-slate-400">
                  Switching sector updates Meta presets & button configurations
                </span>
              </div>

              {/* 9 Industry Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                {ALL_SECTOR_KEYS.map(secKey => {
                  const cfg = BUSINESS_SECTORS[secKey];
                  const isSecActive = creationSector === secKey;
                  return (
                    <button
                      key={secKey}
                      type="button"
                      onClick={() => {
                        setCreationSector(secKey);
                        if (cfg.presets.length > 0) {
                          applyIndustryPreset(cfg.presets[0]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                        isSecActive
                          ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>{cfg.shortName}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic 1-Click Presets for Selected Sector */}
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  {BUSINESS_SECTORS[creationSector]?.shortName} Presets:
                </span>
                {BUSINESS_SECTORS[creationSector]?.presets.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyIndustryPreset(p)}
                    className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-3 py-1 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>{p.label}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-100 text-indigo-800 uppercase font-mono font-bold">
                      {p.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body: Split 2 Columns (Form & WhatsApp Preview) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 py-3 overflow-y-auto custom-scrollbar flex-1">
              {/* Form Column */}
              <form onSubmit={handleCreateAndSubmitTemplate} id="template-create-form" className="md:col-span-7 space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Template Identifier Name (lowercase, snake_case) *
                  </label>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={e => setNewTemplateName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                    placeholder="e.g. jee_scholarship_alert_2027"
                    className="w-full text-xs font-mono p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Meta requires lowercase letters, numbers, and underscores only.</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Meta Category *
                    </label>
                    <select
                      value={newTemplateCategory}
                      onChange={e => setNewTemplateCategory(e.target.value as any)}
                      className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none"
                    >
                      <option value="MARKETING">MARKETING (Campaigns, Offers)</option>
                      <option value="UTILITY">UTILITY (Admissions, Reminders, Alerts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Language *
                    </label>
                    <select
                      value={newTemplateLanguage}
                      onChange={e => setNewTemplateLanguage(e.target.value as any)}
                      className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none"
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
                    value={newTemplateHeader}
                    onChange={e => setNewTemplateHeader(e.target.value)}
                    placeholder="e.g. 🎓 Prakash Institute Admissions"
                    className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Message Body with Variables *
                    </label>
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                      Use {'{{1}}'}, {'{{2}}'}
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={newTemplateBody}
                    onChange={e => setNewTemplateBody(e.target.value)}
                    placeholder="Namaste {{1}}! Admissions for 2027 are now open. Choose an option below:"
                    className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 leading-relaxed"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Footer Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={newTemplateFooter}
                    onChange={e => setNewTemplateFooter(e.target.value)}
                    placeholder="e.g. Official WhatsApp Desk • Prakash Institute"
                    className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:outline-none"
                  />
                </div>

                {/* Interactive Buttons Builder (Audio 1 Requirement) */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-['Outfit']">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Interactive Buttons (Meta Limit: Max 3)
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Add Quick Replies, Call Phone Number, or Website URL links.
                      </p>
                    </div>

                    {newTemplateButtons.length < 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newBtn: InteractiveButton = {
                            id: `btn-${Date.now()}`,
                            title: `Option ${newTemplateButtons.length + 1}`,
                            type: 'QUICK_REPLY',
                            payload: 'User tapped interactive option.',
                          };
                          setNewTemplateButtons([...newTemplateButtons, newBtn]);
                        }}
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Button ({newTemplateButtons.length}/3)</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {newTemplateButtons.map((btn, idx) => (
                      <div key={btn.id || idx} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-1">
                            <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                            <select
                              value={btn.type}
                              onChange={e => {
                                const newType = e.target.value as any;
                                const updated = [...newTemplateButtons];
                                updated[idx] = {
                                  ...updated[idx],
                                  type: newType,
                                  url: newType === 'URL' ? 'https://prakashinstitute.edu.in' : undefined,
                                  phoneNumber: newType === 'CALL' ? '+919876543210' : undefined,
                                  payload: newType === 'QUICK_REPLY' ? `Payload for ${updated[idx].title}` : undefined,
                                };
                                setNewTemplateButtons(updated);
                              }}
                              className="text-[10px] font-bold p-1 bg-slate-50 rounded border border-slate-200 text-slate-700"
                            >
                              <option value="QUICK_REPLY">Quick Reply</option>
                              <option value="URL">Visit Website URL</option>
                              <option value="CALL">Call Phone Number</option>
                            </select>

                            <input
                              type="text"
                              maxLength={20}
                              value={btn.title}
                              onChange={e => {
                                const updated = [...newTemplateButtons];
                                updated[idx].title = e.target.value;
                                setNewTemplateButtons(updated);
                              }}
                              placeholder="Button Label (Max 20 chars)"
                              className="text-xs p-1 bg-slate-50 rounded border border-slate-200 text-slate-800 flex-1 font-semibold"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setNewTemplateButtons(newTemplateButtons.filter((_, i) => i !== idx));
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Remove Button"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Button Type Value Input */}
                        {btn.type === 'URL' && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <ExternalLink className="w-3 h-3 text-sky-600 shrink-0" />
                            <input
                              type="url"
                              value={btn.url || ''}
                              onChange={e => {
                                const updated = [...newTemplateButtons];
                                updated[idx].url = e.target.value;
                                setNewTemplateButtons(updated);
                              }}
                              placeholder="https://prakashinstitute.edu.in/..."
                              className="w-full text-[11px] p-1 bg-slate-50 rounded border border-slate-200 text-slate-800 font-mono"
                            />
                          </div>
                        )}

                        {btn.type === 'CALL' && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Phone className="w-3 h-3 text-indigo-600 shrink-0" />
                            <input
                              type="tel"
                              value={btn.phoneNumber || ''}
                              onChange={e => {
                                const updated = [...newTemplateButtons];
                                updated[idx].phoneNumber = e.target.value;
                                setNewTemplateButtons(updated);
                              }}
                              placeholder="+919876543210"
                              className="w-full text-[11px] p-1 bg-slate-50 rounded border border-slate-200 text-slate-800 font-mono"
                            />
                          </div>
                        )}

                        {btn.type === 'QUICK_REPLY' && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <MessageSquare className="w-3 h-3 text-emerald-600 shrink-0" />
                            <input
                              type="text"
                              value={btn.payload || ''}
                              onChange={e => {
                                const updated = [...newTemplateButtons];
                                updated[idx].payload = e.target.value;
                                setNewTemplateButtons(updated);
                              }}
                              placeholder="Auto-response / payload sent to bot"
                              className="w-full text-[11px] p-1 bg-slate-50 rounded border border-slate-200 text-slate-800"
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {newTemplateButtons.length === 0 && (
                      <div className="text-center py-2 text-[11px] text-slate-400 italic">
                        No interactive buttons added yet. Click "+ Add Button" above.
                      </div>
                    )}
                  </div>
                </div>

                {/* Variable test inputs for preview */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Sample Variables for Live Phone Preview:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500">{'{{1}}'} Student Name:</span>
                      <input
                        type="text"
                        value={previewVar1}
                        onChange={e => setPreviewVar1(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white rounded-lg border border-slate-200 mt-0.5"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500">{'{{2}}'} Date / Slot:</span>
                      <input
                        type="text"
                        value={previewVar2}
                        onChange={e => setPreviewVar2(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white rounded-lg border border-slate-200 mt-0.5"
                      />
                    </div>
                  </div>
                </div>
              </form>

              {/* WhatsApp Phone Mockup Column */}
              <div className="md:col-span-5 flex flex-col items-center justify-start">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  Live Interactive WhatsApp Overview
                </span>

                <WhatsAppMessagePreview
                  headerText={newTemplateHeader}
                  bodyText={newTemplateBody
                    .replace('{{1}}', previewVar1)
                    .replace('{{2}}', previewVar2)}
                  footerText={newTemplateFooter}
                  buttons={newTemplateButtons}
                  instituteName={workspace?.businessName || BUSINESS_SECTORS[creationSector]?.sampleBrandName || 'Verified Business'}
                  mode="phone"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="template-create-form"
                disabled={isSubmittingTemplate}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmittingTemplate ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Save & Submit to Meta for Verification</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
