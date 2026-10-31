import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Zap, 
  ShieldCheck, 
  Bot, 
  UserCheck, 
  Calendar, 
  HelpCircle, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight, 
  Sliders, 
  Clock, 
  AlertTriangle,
  Sparkles,
  Search,
  CheckCheck
} from 'lucide-react';
import { WorkflowStage, UserRole } from '../../types';
import { workflowsApi } from '../../services/api';

interface WorkflowsViewProps {
  userRole?: UserRole;
  onOpenSimulator?: () => void;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({
  userRole = 'admin',
  onOpenSimulator,
}) => {
  const [stages, setStages] = useState<WorkflowStage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    activeRulesCount: 4,
    autoReplyLatencyMs: 180,
    dailyProcessedCount: 428,
  });

  // Simulator Test Box State
  const [testMessage, setTestMessage] = useState('Can I book a demo class for JEE Droppers?');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simulationLatency, setSimulationLatency] = useState<number | null>(null);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const data = await workflowsApi.get();
      if (data.workflows) setStages(data.workflows);
      setStats({
        activeRulesCount: data.activeRulesCount || 4,
        autoReplyLatencyMs: data.autoReplyLatencyMs || 180,
        dailyProcessedCount: data.dailyProcessedCount || 428,
      });
    } catch (err) {
      console.error('Error fetching workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleSimulate = async (customMsg?: string) => {
    const msg = customMsg || testMessage;
    if (!msg.trim()) return;

    setIsSimulating(true);
    try {
      const startTime = performance.now();
      const res = await workflowsApi.simulateStage({
        message: msg,
        name: 'Simulated Student',
        phone: '+91 98765 43210',
      });
      const elapsed = Math.round(performance.now() - startTime);

      setSimulationResult(res.result);
      setSimulationLatency(res.latencyMs || elapsed);
    } catch (err: any) {
      alert(`Simulation failed: ${err?.message || 'Server error'}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const getStageIcon = (stageNum: number) => {
    switch (stageNum) {
      case 1: return <Clock className="w-4 h-4 text-slate-600" />;
      case 2: return <UserCheck className="w-4 h-4 text-indigo-600" />;
      case 3: return <ShieldCheck className="w-4 h-4 text-rose-600" />;
      case 4: return <Calendar className="w-4 h-4 text-purple-600" />;
      case 5: return <Sliders className="w-4 h-4 text-emerald-600" />;
      case 6: return <Bot className="w-4 h-4 text-sky-600" />;
      case 7: return <HelpCircle className="w-4 h-4 text-amber-600" />;
      default: return <Zap className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStageColorBadge = (stageNum: number) => {
    switch (stageNum) {
      case 1: return 'bg-slate-100 text-slate-700 border-slate-200';
      case 2: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 3: return 'bg-rose-50 text-rose-700 border-rose-200';
      case 4: return 'bg-purple-50 text-purple-700 border-purple-200';
      case 5: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 6: return 'bg-sky-50 text-sky-700 border-sky-200';
      case 7: return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="w-full px-6 sm:px-8 lg:px-10 py-8 space-y-8">
      {/* Top Banner & Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-['Outfit']">
              WhatsApp Decision Order & Response Workflows
            </h1>
            <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Live 7-Stage Pipeline
            </span>
          </div>
          <p className="text-base sm:text-lg text-slate-600 mt-1.5 font-normal">
            Deterministic SRS-compliant priority pipeline evaluated on every incoming student message before AI triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchWorkflows()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>
          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Open Phone Simulator</span>
            </button>
          )}
        </div>
      </div>

      {/* Pipeline Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pipeline Stages</div>
            <div className="text-xl font-extrabold text-slate-800 font-['Outfit']">7 Active Stages</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Deterministic Priority</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Latency</div>
            <div className="text-xl font-extrabold text-slate-800 font-['Outfit']">{stats.autoReplyLatencyMs} ms</div>
            <div className="text-[10px] text-sky-600 font-semibold mt-0.5">Sub-200ms Decision Loop</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Configured Rules</div>
            <div className="text-xl font-extrabold text-slate-800 font-['Outfit']">{stats.activeRulesCount} Rules</div>
            <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Top-to-Bottom Execution</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Daily Handled</div>
            <div className="text-xl font-extrabold text-slate-800 font-['Outfit']">{stats.dailyProcessedCount} Msgs</div>
            <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Redis Idempotent Queue</div>
          </div>
        </div>
      </div>

      {/* Interactive Live Decision Simulator Box */}
      <div className="bg-gradient-to-br from-slate-900 via-[#101b2b] to-[#0c1420] rounded-3xl p-6 text-white shadow-xl border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">Live Workflow Routing Simulator</h2>
              <p className="text-[11px] text-slate-400">Test how the backend 7-stage engine parses, routes, and responds to student queries in real time.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
            REST: /api/v1/workflows/simulate-stage
          </span>
        </div>

        {/* Input & Action */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
              placeholder="Type student message e.g. 'Can I book a demo?', 'STOP', 'Fees for Dropper'..."
              className="w-full bg-[#162334] border border-slate-700/80 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-medium"
            />
          </div>
          <button
            onClick={() => handleSimulate()}
            disabled={isSimulating}
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isSimulating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>Execute Test</span>
          </button>
        </div>

        {/* Quick Test Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
          <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Quick Scenarios:</span>
          <button
            onClick={() => { setTestMessage('Can I book a demo class?'); handleSimulate('Can I book a demo class?'); }}
            className="px-2.5 py-1 rounded-xl bg-purple-950/60 text-purple-300 border border-purple-800/60 hover:bg-purple-900/60 transition-colors"
          >
            📅 Stage 4: "Can I book a demo class?"
          </button>
          <button
            onClick={() => { setTestMessage('What is the fee structure for Class 12 Dropper?'); handleSimulate('What is the fee structure for Class 12 Dropper?'); }}
            className="px-2.5 py-1 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60 transition-colors"
          >
            ⚡ Stage 5: "Fees for Class 12 Dropper"
          </button>
          <button
            onClick={() => { setTestMessage('Do you have hostel and mess facilities near Kota campus?'); handleSimulate('Do you have hostel and mess facilities near Kota campus?'); }}
            className="px-2.5 py-1 rounded-xl bg-sky-950/60 text-sky-300 border border-sky-800/60 hover:bg-sky-900/60 transition-colors"
          >
            🤖 Stage 6: "Hostel facilities (AI RAG)"
          </button>
          <button
            onClick={() => { setTestMessage('STOP'); handleSimulate('STOP'); }}
            className="px-2.5 py-1 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60 transition-colors"
          >
            🛑 Stage 3: "STOP (Opt-Out)"
          </button>
          <button
            onClick={() => { setTestMessage('What is the secret formula of dark matter?'); handleSimulate('What is the secret formula of dark matter?'); }}
            className="px-2.5 py-1 rounded-xl bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900/60 transition-colors"
          >
            ⚠️ Stage 7: "Unknown query (Fallback)"
          </button>
        </div>

        {/* Live Simulation Results Panel */}
        {simulationResult && (
          <div className="mt-4 p-4 rounded-2xl bg-[#09101a] border border-slate-800 text-xs space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStageColorBadge(simulationResult.matchedStage)}`}>
                  Intercepted at Stage #{simulationResult.matchedStage}: {simulationResult.stageName}
                </span>
                {simulationResult.leadStatus && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                    Pipeline Lead Status: {simulationResult.leadStatus}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Engine Latency: <strong className="text-emerald-400">{simulationLatency || 12} ms</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Engine Routing Decision
                </span>
                <p className="text-slate-300 leading-relaxed font-mono text-[11px] bg-[#121c29] p-3 rounded-xl border border-slate-800">
                  {simulationResult.actionTaken}
                </p>
                {simulationResult.matchedRuleName && (
                  <p className="mt-2 text-[11px] text-emerald-400">
                    Rule Triggered: <strong>{simulationResult.matchedRuleName}</strong>
                  </p>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Generated WhatsApp Response Bubble
                </span>
                <div className="bg-emerald-900/40 border border-emerald-700/60 p-3 rounded-xl text-emerald-100 font-sans leading-relaxed text-xs">
                  {simulationResult.replyText ? (
                    simulationResult.replyText
                  ) : (
                    <span className="text-slate-400 italic">No automated reply sent (Opt-out recorded or Human Takeover active).</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visual 7-Stage Architecture Flow Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-emerald-600" />
          <span>Active Sequential Decision Pipeline Order</span>
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {stages.map((stage) => {
            const isCurrentlyMatched = simulationResult?.matchedStage === stage.stage;

            return (
              <div
                key={stage.stage}
                className={`bg-white rounded-2xl p-4 border transition-all duration-200 ${
                  isCurrentlyMatched
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/10'
                    : 'border-slate-200/80 shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    {/* Stage Number Badge */}
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-700 font-['Outfit'] flex-shrink-0">
                      #{stage.stage}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          {getStageIcon(stage.stage)}
                          <span>{stage.name}</span>
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStageColorBadge(stage.stage)}`}>
                          {stage.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {stage.description}
                      </p>
                    </div>
                  </div>

                  {/* Stage Metrics */}
                  <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800 font-['Outfit']">
                        {stage.handledCount.toLocaleString()} Handled
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">Messages Processed</div>
                    </div>
                    {isCurrentlyMatched && (
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-600 text-white rounded-xl shadow-2xs">
                        Matched in Simulation
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
