import React, { useState, useEffect } from 'react';
import {
  Bot,
  FileText,
  Upload,
  Trash2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  RefreshCw,
  BookOpen,
  Sparkles,
  HelpCircle,
  Layers,
  Search,
  Plus,
  X,
  FileCode,
  ShieldCheck,
  Zap,
  Tag
} from 'lucide-react';
import {
  KnowledgeDocument,
  AIAssistantConfig,
  KnowledgeItem,
  UserRole
} from '../../types';
import { knowledgeDocsApi, knowledgeApi } from '../../services/api';

interface AIAssistantConfigViewProps {
  knowledgeItems?: KnowledgeItem[];
  userRole?: UserRole;
}

export const AIAssistantConfigView: React.FC<AIAssistantConfigViewProps> = ({
  knowledgeItems = [],
  userRole = 'admin',
}) => {
  const [activeTab, setActiveTab] = useState<'DOCUMENTS' | 'PERSONA' | 'PLAYGROUND'>('DOCUMENTS');
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Documents State
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFileType, setUploadFileType] = useState<'pdf' | 'docx' | 'txt' | 'csv'>('pdf');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadChunkSize, setUploadChunkSize] = useState(500);
  const [isUploading, setIsUploading] = useState(false);

  // Persona / Config State
  const [config, setConfig] = useState<AIAssistantConfig>({
    enabled: true,
    systemPrompt: 'You are AutoMask AI, the official admissions counsellor for Prakash Institute Kota. Answer student doubts about JEE, NEET, and PSAT with empathy and precise fee details. If unsure, escalate to a human counsellor.',
    confidenceThreshold: 0.75,
    temperature: 0.2,
    fallbackMessage: 'I will connect you directly with a senior faculty counsellor at Prakash Institute Kota right away.',
    handoffKeywords: ['human', 'counsellor', 'teacher', 'refund', 'complaint'],
    ragSettings: {
      matchCount: 3,
      minScore: 0.7,
    },
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  // Playground State
  const [testQuery, setTestQuery] = useState('What is the fee structure for Class 11 JEE 2-year classroom course?');
  const [studentName, setStudentName] = useState('Aditya Kumar');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsRes, cfgRes] = await Promise.all([
        knowledgeDocsApi.list().catch(() => ({ documents: [] })),
        knowledgeDocsApi.getConfig().catch(() => ({ config: null })),
      ]);

      if (docsRes.documents) setDocuments(docsRes.documents);
      if (cfgRes.config) setConfig(cfgRes.config);
    } catch (err: any) {
      console.warn('Failed to load AI Assistant data:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Upload new document
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadContent.trim()) return;

    setIsUploading(true);
    try {
      const res = await knowledgeDocsApi.upload({
        title: uploadTitle.trim(),
        fileType: uploadFileType,
        rawContent: uploadContent.trim(),
        chunkSize: uploadChunkSize,
      });

      showNotice(`Document "${res.document.title}" indexed into ${res.document.chunkCount} vector chunks!`);
      setIsUploadModalOpen(false);
      setUploadTitle('');
      setUploadContent('');
      loadData();
    } catch (err: any) {
      alert(`Upload failed: ${err?.message || 'Server error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Delete document
  const handleDeleteDocument = async (id: string, docTitle: string) => {
    if (!confirm(`Are you sure you want to remove document "${docTitle}" and its vector chunks?`)) return;

    try {
      await knowledgeDocsApi.delete(id);
      showNotice(`Document "${docTitle}" removed.`);
      loadData();
    } catch (err: any) {
      alert(`Delete failed: ${err?.message || 'Server error'}`);
    }
  };

  // Save Assistant Persona Config
  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const res = await knowledgeDocsApi.updateConfig(config);
      setConfig(res.config);
      showNotice('AI Assistant configuration updated successfully!');
    } catch (err: any) {
      alert(`Save failed: ${err?.message || 'Server error'}`);
    } finally {
      setSavingConfig(false);
    }
  };

  // Add Handoff Keyword
  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    const kw = keywordInput.trim().toLowerCase();
    if (!config.handoffKeywords.includes(kw)) {
      setConfig(prev => ({
        ...prev,
        handoffKeywords: [...prev.handoffKeywords, kw],
      }));
    }
    setKeywordInput('');
  };

  // Remove Handoff Keyword
  const handleRemoveKeyword = (kw: string) => {
    setConfig(prev => ({
      ...prev,
      handoffKeywords: prev.handoffKeywords.filter(k => k !== kw),
    }));
  };

  // Run Playground Query
  const handleRunPlayground = async () => {
    if (!testQuery.trim()) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await knowledgeApi.query(testQuery.trim(), studentName.trim() || 'Student');
      setTestResult(res);
    } catch (err: any) {
      alert(`Query failed: ${err?.message || 'Server error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-10 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 p-0.5 shadow-md flex items-center justify-center text-white shrink-0">
            <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight font-['Outfit']">
                AI Knowledge Base & RAG
              </h1>
              <span className="text-[10px] sm:text-xs font-black bg-violet-50 text-violet-700 px-2.5 py-0.5 sm:py-1 rounded-full border border-violet-200 shrink-0">
                Vector Retrieval
              </span>
            </div>
            <p className="text-xs sm:text-base text-slate-600 mt-1 font-normal leading-normal">
              Ground student WhatsApp inquiries with official course syllabus, fee structures, and batch schedules.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {actionNotice && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{actionNotice}</span>
            </div>
          )}

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex-1 sm:flex-initial h-10 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>

          <button
            onClick={loadData}
            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sub Tabs: horizontally scrollable on mobile */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'DOCUMENTS'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Knowledge Documents ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PERSONA')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'PERSONA'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Persona & Confidence Thresholds</span>
        </button>

        <button
          onClick={() => setActiveTab('PLAYGROUND')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'PLAYGROUND'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>RAG Query Playground</span>
        </button>
      </div>

      {/* Tab 1: Documents Library & Chunking */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map(doc => (
              <div key={doc.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-200">
                      .{doc.fileType}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {doc.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 font-['Outfit'] mb-1">
                    {doc.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span className="font-mono">{doc.chunkCount} vector chunks</span>
                    <span>•</span>
                    <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {doc.id}
                  </span>
                  <button
                    onClick={() => handleDeleteDocument(doc.id, doc.title)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold p-1 rounded hover:bg-rose-50 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Persona & Confidence Thresholds */}
      {activeTab === 'PERSONA' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 max-w-3xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 font-['Outfit']">
                AI Persona & Safety Guardrails
              </h2>
              <p className="text-xs text-slate-500">
                Control the assistant tone, hallucination suppression, and automated escalation to human counselling staff.
              </p>
            </div>

            {/* Master AI Auto-Reply Toggle Switch */}
            <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">
                {config.enabled ? '🟢 Auto-Reply Active' : '⚪ Auto-Reply Paused'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
                  showNotice(config.enabled ? 'AI Assistant auto-replies paused' : 'AI Assistant auto-replies activated');
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${config.enabled ? 'bg-violet-600' : 'bg-slate-300'
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${config.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Quick Guardrail Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">Strict RAG Grounding</h4>
                <p className="text-[11px] text-slate-400">Answer only from indexed PDFs</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ENFORCED
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">Human Faculty Handoff</h4>
                <p className="text-[11px] text-slate-400">Escalate if score &lt; {(config.confidenceThreshold * 100).toFixed(0)}%</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800">
                AUTOMATIC
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                System Instructions Prompt
              </label>
              <textarea
                rows={4}
                value={config.systemPrompt}
                onChange={e => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-medium leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Confidence Threshold for Auto-Replies: {(config.confidenceThreshold * 100).toFixed(0)}%
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {config.confidenceThreshold < 0.7 ? 'Aggressive' : 'Safe / Grounded'}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={config.confidenceThreshold}
                onChange={e => setConfig(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
                className="w-full accent-violet-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                If the RAG retrieval similarity score falls below this threshold, the bot withholds its reply and triggers human handoff.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Fallback Escalation Message
              </label>
              <input
                type="text"
                value={config.fallbackMessage}
                onChange={e => setConfig(prev => ({ ...prev, fallbackMessage: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            {/* Handoff Keywords */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Human Handoff Trigger Keywords
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. refund, complaint, teacher"
                  value={keywordInput}
                  onChange={e => setKeywordInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {config.handoffKeywords.map(kw => (
                  <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium border border-violet-200">
                    <span>{kw}</span>
                    <button
                      onClick={() => handleRemoveKeyword(kw)}
                      className="text-violet-400 hover:text-violet-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                {savingConfig && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Assistant Persona</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: RAG Query Playground */}
      {activeTab === 'PLAYGROUND' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 max-w-3xl">
          <div>
            <h2 className="text-sm font-bold text-slate-800 font-['Outfit']">
              Live RAG Simulator
            </h2>
            <p className="text-xs text-slate-500">
              Test how the AI assistant answers student questions using indexed documents.
            </p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Student Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Student Query</label>
                <input
                  type="text"
                  value={testQuery}
                  onChange={e => setTestQuery(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>
            </div>

            <button
              onClick={handleRunPlayground}
              disabled={isTesting}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>Ask AutoMask AI Assistant</span>
            </button>
          </div>

          {testResult && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Generated WhatsApp Reply:</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Score: {(testResult.confidence * 100).toFixed(0)}%
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                {testResult.answer}
              </div>

              {testResult.sources && testResult.sources.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                    Attributed Grounding Sources:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {testResult.sources.map((s: string, i: number) => (
                      <span key={i} className="text-[10px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded border border-violet-200 font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-violet-600" />
                <h3 className="text-sm font-bold text-slate-800 font-['Outfit']">
                  Upload Knowledge Document
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Document Title</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={e => setUploadTitle(e.target.value)}
                    placeholder="e.g. Prakash JEE 2027 Course Prospectus"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">File Format</label>
                  <select
                    value={uploadFileType}
                    onChange={e => setUploadFileType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  >
                    <option value="pdf">PDF (.pdf)</option>
                    <option value="docx">DOCX (.docx)</option>
                    <option value="txt">TXT (.txt)</option>
                    <option value="csv">CSV (.csv)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Document Content (Extracted Text / Syllabus / FAQ)
                </label>
                <textarea
                  rows={6}
                  value={uploadContent}
                  onChange={e => setUploadContent(e.target.value)}
                  placeholder="Paste syllabus text, fee structures, batch schedules, or scholarship rules..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-sans"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Chunk Size: {uploadChunkSize} characters (~{Math.ceil(uploadContent.length / uploadChunkSize || 1)} chunks)
                </label>
                <input
                  type="range"
                  min="250"
                  max="1500"
                  step="50"
                  value={uploadChunkSize}
                  onChange={e => setUploadChunkSize(parseInt(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isUploading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Index Document</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
