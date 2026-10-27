import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  Plus, 
  CheckCircle2, 
  AlertTriangle,
  Languages,
  DollarSign,
  Cpu,
  Trash2,
  Search,
  Play,
  Loader2,
  HelpCircle,
  X
} from 'lucide-react';
import { KnowledgeItem } from '../../types';
import { knowledgeApi } from '../../services/api';

interface AIAssistantViewProps {
  knowledgeItems: KnowledgeItem[];
  onAddKnowledge: (item: Partial<KnowledgeItem>) => void;
  onDeleteKnowledge?: (id: string) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  knowledgeItems,
  onAddKnowledge,
  onDeleteKnowledge,
}) => {
  const [activeTab, setActiveTab] = useState<'KNOWLEDGE' | 'PLAYGROUND' | 'GUARDRAILS' | 'PROMPTS'>('KNOWLEDGE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fees, setFees] = useState('');
  const [batches, setBatches] = useState('');
  const [type, setType] = useState<'course' | 'faq' | 'policy'>('course');

  // Playground state
  const [queryInput, setQueryInput] = useState('What is the fee structure for Class 11 JEE 2-year classroom course?');
  const [studentNameInput, setStudentNameInput] = useState('Rohan Verma');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onAddKnowledge({
      title: title.trim(),
      content: content.trim(),
      fees: fees.trim() || undefined,
      batches: batches.trim() || undefined,
      type,
      active: true,
    });

    setTitle('');
    setContent('');
    setFees('');
    setBatches('');
    setIsModalOpen(false);
  };

  const handleRunPlayground = async (customQuery?: string) => {
    const q = customQuery || queryInput;
    if (!q.trim()) return;

    setIsQuerying(true);
    setQueryResult(null);

    try {
      const res = await knowledgeApi.query(q.trim(), studentNameInput.trim() || 'Student');
      setQueryResult(res);
    } catch (err: any) {
      alert(`Query failed: ${err.message || 'Server error'}`);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleDelete = (id: string, itemTitle: string) => {
    if (!confirm(`Are you sure you want to remove "${itemTitle}" from Knowledge Base?`)) return;
    if (onDeleteKnowledge) {
      onDeleteKnowledge(id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight font-['Outfit']">
              AI Assistant & Grounded Knowledge Base
            </h1>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              GPT-4o + pgvector RAG
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Knowledge-grounded AI trained specifically on Prakash Institute courses, batch timings, and fee structures.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Item</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('KNOWLEDGE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'KNOWLEDGE' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Courses & FAQs ({knowledgeItems.length})
        </button>
        <button
          onClick={() => setActiveTab('PLAYGROUND')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'PLAYGROUND' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>RAG Query Playground</span>
        </button>
        <button
          onClick={() => setActiveTab('GUARDRAILS')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'GUARDRAILS' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Safety Guardrails (DD-05)</span>
        </button>
        <button
          onClick={() => setActiveTab('PROMPTS')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'PROMPTS' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Languages className="w-3.5 h-3.5 text-blue-500" />
          <span>Hindi / Hinglish Persona</span>
        </button>
      </div>

      {/* 1. Knowledge Items Grid */}
      {activeTab === 'KNOWLEDGE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {knowledgeItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-slate-100 text-slate-600">
                    {item.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified RAG
                    </span>
                    {onDeleteKnowledge && (
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-800 mb-1.5">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.content}</p>
              </div>

              {(item.fees || item.batches) && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs">
                  {item.fees && (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Official Fee: {item.fees}</span>
                    </div>
                  )}
                  {item.batches && (
                    <div className="text-slate-500 text-[11px]">
                      ⏰ Batch: {item.batches}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 2. Interactive RAG Playground */}
      {activeTab === 'PLAYGROUND' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">RAG Retrieval Playground</h3>
                  <p className="text-[11px] text-slate-400">
                    Query the 1536-dimensional OpenAI pgvector index with semantic cosine similarity search.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Strict Guardrails Active (No Hallucinations)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Student Question
                </label>
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunPlayground()}
                  placeholder="Ask any question about courses, fees, or Kota campus..."
                  className="w-full bg-[#162334] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={studentNameInput}
                  onChange={(e) => setStudentNameInput(e.target.value)}
                  placeholder="Rohan Verma"
                  className="w-full bg-[#162334] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Sample Queries:</span>
                <button
                  onClick={() => {
                    const q = "What is the fee for NEET Dropper batch?";
                    setQueryInput(q);
                    handleRunPlayground(q);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700"
                >
                  "NEET Dropper Fee"
                </button>
                <button
                  onClick={() => {
                    const q = "Do you have hostel and mess facilities near Kota campus?";
                    setQueryInput(q);
                    handleRunPlayground(q);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700"
                >
                  "Hostel & Mess info"
                </button>
                <button
                  onClick={() => {
                    const q = "Can I attend a free demo trial class?";
                    setQueryInput(q);
                    handleRunPlayground(q);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700"
                >
                  "Demo trial class"
                </button>
              </div>

              <button
                onClick={() => handleRunPlayground()}
                disabled={isQuerying}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-colors"
              >
                {isQuerying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>Run Vector Query</span>
              </button>
            </div>

            {/* Live Result Output */}
            {queryResult && (
              <div className="mt-4 p-4 rounded-2xl bg-[#0b1320] border border-slate-800 text-xs space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                      {queryResult.sourcesCount} Document Sources Retrieved
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Query Execution: <strong className="text-emerald-400">Success</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Retrieved Grounding Documents (Vector Cosine Match)
                    </span>
                    <div className="space-y-2">
                      {queryResult.sources && queryResult.sources.map((src: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px]">
                          <div className="font-bold text-emerald-400 mb-0.5">{src.title}</div>
                          <div className="text-slate-300 line-clamp-2">{src.snippet}</div>
                          {src.fees && (
                            <div className="text-[10px] text-amber-300 font-mono mt-1">Official Fee: {src.fees}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Synthesized WhatsApp Bot Answer (GPT-4o)
                    </span>
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-100 font-sans leading-relaxed text-xs">
                      {queryResult.answer}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Safety Guardrails Tab */}
      {activeTab === 'GUARDRAILS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Safety Guardrail Controls (DD-05)</h3>
            <p className="text-xs text-slate-500">
              Guarantees that the AI will never hallucinate false pricing, make unapproved promises, or invent discounts.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Strict Fee Enforcement</h4>
                  <p className="text-[11px] text-slate-500">
                    Never quote any fee amount not explicitly present in the Knowledge Base.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Enforced
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Auto Human Takeover on Low Confidence</h4>
                  <p className="text-[11px] text-slate-500">
                    If student enquiry similarity score is below 70%, route immediately to Sumit Bhardwaj.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Minor & Student Privacy Protection</h4>
                  <p className="text-[11px] text-slate-500">
                    Compliant with India Digital Personal Data Protection Act (DPDP 2023) provisions.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Compliant
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Prompts Tab */}
      {activeTab === 'PROMPTS' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800">System Persona & Language Instructions</h3>
          <p className="text-xs text-slate-500">
            AutoMask AI communicates respectfully using Indian coaching terminology (Droppers, Kota system, Rank Booster batches).
          </p>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 leading-relaxed space-y-2">
            <p><strong>System Prompt:</strong> You are the Prakash Institute Kota AI Academic Counsellor.</p>
            <p><strong>Rules:</strong></p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Always start with "Namaste {'{{student_name}}'}!"</li>
              <li>Reply concisely in the student's chosen language (Hindi, English, or conversational Hinglish).</li>
              <li>Only quote official fees verified in the Prakash Institute database.</li>
              <li>Offer demo class trial booking whenever student expresses interest in admission.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Add Knowledge Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">Add Course / Knowledge Grounding</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Course / Topic Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Class 12 NEET Crash Course"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Content / Syllabus / Details</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="Comprehensive details for this course including syllabus, faculty, and test series..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Official Fee</label>
                  <input
                    type="text"
                    value={fees}
                    onChange={(e) => setFees(e.target.value)}
                    placeholder="e.g. ₹38,000 / year"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Batch Timings</label>
                  <input
                    type="text"
                    value={batches}
                    onChange={(e) => setBatches(e.target.value)}
                    placeholder="e.g. Mon-Fri 8:00 AM - 1:00 PM"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
                >
                  Save to Knowledge Base
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
