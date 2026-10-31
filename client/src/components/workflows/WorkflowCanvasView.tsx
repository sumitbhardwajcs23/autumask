import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Zap, 
  Play, 
  Plus, 
  Trash2, 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  FileText, 
  Tag, 
  UserPlus, 
  Bot, 
  ShieldAlert, 
  StopCircle, 
  ArrowRight, 
  Save, 
  RefreshCw, 
  ChevronRight, 
  X,
  Sparkles,
  Search,
  Sliders,
  Terminal,
  Activity,
  Smartphone,
  ExternalLink,
  Phone
} from 'lucide-react';
import { 
  WorkflowDefinition, 
  WorkflowNode, 
  WorkflowEdge, 
  WorkflowNodeType, 
  InteractiveButton,
  UserRole 
} from '../../types';
import { workflowsCanvasApi } from '../../services/api';
import { WhatsAppMessagePreview } from '../common/WhatsAppMessagePreview';

interface WorkflowCanvasViewProps {
  userRole?: UserRole;
  onOpenPhoneSimulator?: () => void;
}

export const WorkflowCanvasView: React.FC<WorkflowCanvasViewProps> = ({
  userRole = 'admin',
  onOpenPhoneSimulator,
}) => {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Canvas Node Selection & Editing
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<'config' | 'preview'>('config');
  const [canvasPreviewStep, setCanvasPreviewStep] = useState<WorkflowNode | null>(null);

  // Simulation State
  const [simMessage, setSimMessage] = useState('fees for jee dropper batch?');
  const [simName, setSimName] = useState('Rahul Verma');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const res = await workflowsCanvasApi.list();
      if (res.workflows && res.workflows.length > 0) {
        setWorkflows(res.workflows);
        setSelectedWorkflow(prev => {
          if (!prev) return res.workflows[0];
          const found = res.workflows.find(w => w.id === prev.id);
          return found || res.workflows[0];
        });
      }
    } catch (err: any) {
      console.warn('Failed to load workflows:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  // Cycle Detection Algorithm (DFS)
  const checkCycle = (nodes: WorkflowNode[], edges: WorkflowEdge[]): boolean => {
    const adj = new Map<string, string[]>();
    nodes.forEach(n => adj.set(n.id, []));
    edges.forEach(e => {
      const list = adj.get(e.source) || [];
      list.push(e.target);
      adj.set(e.source, list);
    });

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = adj.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true;
      }
    }
    return false;
  };

  const hasCycle = selectedWorkflow 
    ? checkCycle(selectedWorkflow.nodes, selectedWorkflow.edges) 
    : false;

  // Save current workflow
  const handleSaveWorkflow = async () => {
    if (!selectedWorkflow) return;
    if (hasCycle) {
      alert('Cannot save: A cycle (infinite loop) was detected in the workflow graph. AutoMask enforces acyclic execution.');
      return;
    }

    try {
      await workflowsCanvasApi.update(selectedWorkflow.id, {
        nodes: selectedWorkflow.nodes,
        edges: selectedWorkflow.edges,
        name: selectedWorkflow.name,
        description: selectedWorkflow.description,
        status: selectedWorkflow.status,
      });
      showNotice(`Saved "${selectedWorkflow.name}" successfully!`);
    } catch (err: any) {
      alert(`Save failed: ${err?.message || 'Server error'}`);
    }
  };

  // Toggle workflow status (ACTIVE / PAUSED)
  const handleToggleStatus = async () => {
    if (!selectedWorkflow) return;
    const newStatus = selectedWorkflow.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

    try {
      await workflowsCanvasApi.update(selectedWorkflow.id, { status: newStatus });
      setSelectedWorkflow(prev => prev ? { ...prev, status: newStatus } : null);
      setWorkflows(prev => prev.map(w => w.id === selectedWorkflow.id ? { ...w, status: newStatus } : w));
      showNotice(`Workflow status set to ${newStatus}.`);
    } catch (err: any) {
      alert(`Status update failed: ${err?.message || 'Server error'}`);
    }
  };

  // Dry-run simulation
  const handleRunSimulation = async () => {
    if (!selectedWorkflow) return;
    setIsSimulating(true);
    setSimulationLog([]);
    setSimulationResult(null);

    try {
      const res = await workflowsCanvasApi.simulate(selectedWorkflow.id, {
        incomingMessage: simMessage,
        studentName: simName,
        tags: ['JEE', 'Class-12'],
      });

      setSimulationLog(res.log || []);
      setSimulationResult(res);
    } catch (err: any) {
      alert(`Simulation error: ${err?.message || 'Server error'}`);
    } finally {
      setIsSimulating(false);
    }
  };

  // Node Color & Icon Helper
  const getNodeDetails = (type: WorkflowNodeType) => {
    switch (type) {
      case 'TRIGGER':
        return { icon: Zap, color: 'border-amber-400 bg-amber-50 text-amber-700', badge: 'bg-amber-100 text-amber-800' };
      case 'INTERACTIVE_BUTTONS':
        return { icon: Sparkles, color: 'border-emerald-500 bg-emerald-50 text-emerald-800', badge: 'bg-emerald-100 text-emerald-800' };
      case 'SEND_WHATSAPP':
        return { icon: MessageSquare, color: 'border-emerald-400 bg-emerald-50 text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' };
      case 'SEND_TEMPLATE':
        return { icon: FileText, color: 'border-teal-400 bg-teal-50 text-teal-700', badge: 'bg-teal-100 text-teal-800' };
      case 'CONDITION':
        return { icon: GitBranch, color: 'border-purple-400 bg-purple-50 text-purple-700', badge: 'bg-purple-100 text-purple-800' };
      case 'DELAY':
        return { icon: Clock, color: 'border-blue-400 bg-blue-50 text-blue-700', badge: 'bg-blue-100 text-blue-800' };
      case 'ASSIGN_AGENT':
        return { icon: UserPlus, color: 'border-indigo-400 bg-indigo-50 text-indigo-700', badge: 'bg-indigo-100 text-indigo-800' };
      case 'ADD_TAG':
        return { icon: Tag, color: 'border-cyan-400 bg-cyan-50 text-cyan-700', badge: 'bg-cyan-100 text-cyan-800' };
      case 'REMOVE_TAG':
        return { icon: Tag, color: 'border-rose-300 bg-rose-50 text-rose-700', badge: 'bg-rose-100 text-rose-800' };
      case 'UPDATE_ATTRIBUTE':
        return { icon: Sliders, color: 'border-orange-400 bg-orange-50 text-orange-700', badge: 'bg-orange-100 text-orange-800' };
      case 'HUMAN_HANDOFF':
        return { icon: ShieldAlert, color: 'border-red-500 bg-red-50 text-red-700', badge: 'bg-red-100 text-red-800' };
      case 'AI_ASSISTANT':
        return { icon: Bot, color: 'border-violet-500 bg-violet-50 text-violet-700', badge: 'bg-violet-100 text-violet-800' };
      case 'END':
        return { icon: StopCircle, color: 'border-slate-400 bg-slate-100 text-slate-700', badge: 'bg-slate-200 text-slate-800' };
      default:
        return { icon: Activity, color: 'border-slate-300 bg-white text-slate-700', badge: 'bg-slate-100 text-slate-700' };
    }
  };

  // Add new node to canvas
  const handleAddNode = (type: WorkflowNodeType) => {
    if (!selectedWorkflow) return;
    const newId = `node-${Date.now().toString().slice(-4)}`;
    const details = getNodeDetails(type);

    const isInteractive = type === 'INTERACTIVE_BUTTONS' || type === 'SEND_WHATSAPP';
    const newNode: WorkflowNode = {
      id: newId,
      type,
      title: type === 'INTERACTIVE_BUTTONS' ? 'Interactive WhatsApp Buttons' : `${type.replace('_', ' ')} Step`,
      config: {
        description: `Automated ${type} node execution.`,
        ...(isInteractive ? {
          headerText: '🎓 Prakash Institute Admissions',
          text: 'Namaste! Welcome to Prakash Institute. Choose an option below for instant details:',
          footerText: 'Select an option to proceed',
          buttons: [
            { id: 'btn-1', title: '📚 Course Fees', type: 'QUICK_REPLY', payload: 'JEE Dropper: ₹45,000/yr | Foundation: ₹35,000/yr' },
            { id: 'btn-2', title: '🎟️ Book Demo', type: 'QUICK_REPLY', payload: 'Demo session reserved for Friday 5:00 PM.' },
            { id: 'btn-3', title: '📞 Talk to Counsellor', type: 'CALL', phoneNumber: '+91 98765 43210' }
          ]
        } : {})
      },
    };

    // If there is a last node, connect it automatically
    const updatedNodes = [...selectedWorkflow.nodes, newNode];
    let updatedEdges = [...selectedWorkflow.edges];
    if (selectedWorkflow.nodes.length > 0) {
      const lastNode = selectedWorkflow.nodes[selectedWorkflow.nodes.length - 1];
      updatedEdges.push({
        id: `edge-${lastNode.id}-${newId}`,
        source: lastNode.id,
        target: newId,
        label: 'Next',
      });
    }

    setSelectedWorkflow({
      ...selectedWorkflow,
      nodes: updatedNodes,
      edges: updatedEdges,
    });
    setIsAddNodeOpen(false);
    setSelectedNode(newNode);
    showNotice(`Added ${type} node to canvas.`);
  };

  // Remove node from canvas
  const handleDeleteNode = (nodeId: string) => {
    if (!selectedWorkflow) return;
    const updatedNodes = selectedWorkflow.nodes.filter(n => n.id !== nodeId);
    const updatedEdges = selectedWorkflow.edges.filter(e => e.source !== nodeId && e.target !== nodeId);

    setSelectedWorkflow({
      ...selectedWorkflow,
      nodes: updatedNodes,
      edges: updatedEdges,
    });
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
    showNotice('Node deleted.');
  };

  // Update selected node config
  const handleUpdateNodeConfig = (key: string, value: any) => {
    if (!selectedNode || !selectedWorkflow) return;
    const updatedNode = {
      ...selectedNode,
      config: { ...selectedNode.config, [key]: value },
    };

    setSelectedNode(updatedNode);
    setSelectedWorkflow({
      ...selectedWorkflow,
      nodes: selectedWorkflow.nodes.map(n => n.id === updatedNode.id ? updatedNode : n),
    });
  };

  return (
    <div className="w-full px-6 sm:px-8 lg:px-10 py-8 space-y-8">
      {/* Top Bar Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-md flex items-center justify-center text-white shrink-0">
              <GitBranch className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-['Outfit'] flex items-center gap-3">
                Visual Workflow Builder & Canvas
                <span className="text-xs font-black bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                  DAG Engine
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 mt-1.5 font-normal">
                Design multi-step WhatsApp routing, conditions, delay intervals, AI auto-replies, and human agent handoffs.
              </p>
            </div>
          </div>
        </div>

        {/* Workflow Selector & Controls */}
        <div className="flex items-center gap-2">
          {actionNotice && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{actionNotice}</span>
            </div>
          )}

          <select
            value={selectedWorkflow?.id || ''}
            onChange={e => {
              const wf = workflows.find(w => w.id === e.target.value);
              if (wf) setSelectedWorkflow(wf);
            }}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white font-bold text-slate-700 shadow-xs"
          >
            {workflows.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          <button
            onClick={() => setIsSimulateModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Test Flow (Dry-Run)</span>
          </button>

          <button
            onClick={handleSaveWorkflow}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Workflow</span>
          </button>
        </div>
      </div>

      {/* Validation & Health Bar */}
      {selectedWorkflow && (
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
              hasCycle 
                ? 'bg-rose-50 text-rose-700 border-rose-300' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-300'
            }`}>
              {hasCycle ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Cycle Detected! (Infinite Loop Hazard)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Valid DAG (Acyclic Graph)</span>
                </>
              )}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              <span className="font-bold text-slate-700">{selectedWorkflow.nodes.length}</span> Nodes •{' '}
              <span className="font-bold text-slate-700">{selectedWorkflow.edges.length}</span> Edges •{' '}
              <span className="font-bold text-slate-700">{selectedWorkflow.executionsCount || 142}</span> Total Executions
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleStatus}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                selectedWorkflow.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
            >
              Status: {selectedWorkflow.status}
            </button>

            <button
              onClick={() => setIsAddNodeOpen(true)}
              className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold border border-purple-200 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Node</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas & Configuration Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Visual Canvas Area */}
        <div className="lg:col-span-2 bg-[#0d1622] rounded-3xl p-6 border border-slate-800 relative min-h-[520px] overflow-x-auto shadow-inner">
          <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Visual Graph
          </div>

          {/* Node Flow Representation */}
          <div className="flex flex-col items-center space-y-4 py-4 max-w-md mx-auto">
            {selectedWorkflow?.nodes.map((node, idx) => {
              const details = getNodeDetails(node.type);
              const Icon = details.icon;
              const isSelected = selectedNode?.id === node.id;
              const hasEdge = idx < (selectedWorkflow?.nodes.length || 0) - 1;

              return (
                <React.Fragment key={node.id}>
                  <div
                    onClick={() => setSelectedNode(node)}
                    className={`w-full bg-white rounded-2xl p-4 border-2 transition-all cursor-pointer shadow-md group relative hover:scale-[1.02] ${
                      isSelected ? 'border-purple-500 ring-4 ring-purple-500/20 shadow-xl' : details.color
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${details.badge}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                            {node.type}
                          </span>
                          <h4 className="font-bold text-xs text-slate-800">
                            {node.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteNode(node.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                          title="Delete Node"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-slate-50/80 p-2 rounded-xl border border-slate-100 font-mono line-clamp-2">
                      {node.config?.text || node.config?.prompt || node.config?.description || JSON.stringify(node.config)}
                    </div>

                    {/* Display attached interactive buttons on the canvas card */}
                    {node.config?.buttons && node.config.buttons.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-slate-100 space-y-1">
                        <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                          <span>Quick Buttons ({node.config.buttons.length}):</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {node.config.buttons.map((b: any, bi: number) => (
                            <span
                              key={bi}
                              className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold shadow-2xs flex items-center gap-1"
                            >
                              {b.type === 'URL' && <ExternalLink className="w-2.5 h-2.5 text-sky-600" />}
                              {b.type === 'CALL' && <Phone className="w-2.5 h-2.5 text-indigo-600" />}
                              {b.type !== 'URL' && b.type !== 'CALL' && <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />}
                              <span>{b.title}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Live WhatsApp Preview shortcut on node card */}
                    {(node.type === 'SEND_WHATSAPP' || node.type === 'INTERACTIVE_BUTTONS' || (node.config?.buttons && node.config.buttons.length > 0)) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCanvasPreviewStep(node);
                        }}
                        className="mt-2 w-full py-1 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg border border-slate-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Smartphone className="w-3 h-3 text-emerald-600" />
                        <span>Live WhatsApp Overview</span>
                      </button>
                    )}
                  </div>

                  {/* Flow Arrow */}
                  {hasEdge && (
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-5 bg-gradient-to-b from-purple-500 to-indigo-500" />
                      <div className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-500/50 flex items-center justify-center text-indigo-300">
                        <ChevronRight className="w-3 h-3 rotate-90" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Node Configuration Drawer & Mobile Overview */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-xs text-slate-800 font-['Outfit']">
                  Node Inspector & Parameters
                </h3>
              </div>
              {selectedNode && (
                <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                  {selectedNode.type}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-4">
                {/* Switcher between Configuration and Live WhatsApp Phone Overview */}
                {(selectedNode.type === 'SEND_WHATSAPP' || selectedNode.type === 'INTERACTIVE_BUTTONS') && (
                  <div className="flex border-b border-slate-200 pb-1 mb-2">
                    <button
                      type="button"
                      onClick={() => setInspectorTab('config')}
                      className={`flex-1 py-1.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                        inspectorTab === 'config'
                          ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Node Settings</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectorTab('preview')}
                      className={`flex-1 py-1.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                        inspectorTab === 'preview'
                          ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Overview</span>
                      {selectedNode.config.buttons && selectedNode.config.buttons.length > 0 && (
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">
                          {selectedNode.config.buttons.length}
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* TAB 1: Live WhatsApp Mobile Overview */}
                {inspectorTab === 'preview' && (selectedNode.type === 'SEND_WHATSAPP' || selectedNode.type === 'INTERACTIVE_BUTTONS') ? (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="text-[11px] text-slate-500 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-semibold text-emerald-800">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                        Live Student Mobile Screen
                      </span>
                      <button
                        type="button"
                        onClick={() => setInspectorTab('config')}
                        className="text-[10px] text-emerald-700 font-bold hover:underline"
                      >
                        Edit Text & Buttons
                      </button>
                    </div>

                    <WhatsAppMessagePreview
                      headerText={selectedNode.config.headerText}
                      bodyText={selectedNode.config.text || 'Namaste! Prakash Institute admissions are open. Select an option below:'}
                      footerText={selectedNode.config.footerText || 'Tap an option to proceed'}
                      buttons={selectedNode.config.buttons || []}
                      instituteName="Prakash Institute"
                      mode="phone"
                    />
                  </div>
                ) : (
                  /* TAB 2: Standard Node Parameters Configuration */
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Node Title</label>
                      <input
                        type="text"
                        value={selectedNode.title}
                        onChange={e => {
                          const updated = { ...selectedNode, title: e.target.value };
                          setSelectedNode(updated);
                          if (selectedWorkflow) {
                            setSelectedWorkflow({
                              ...selectedWorkflow,
                              nodes: selectedWorkflow.nodes.map(n => n.id === updated.id ? updated : n),
                            });
                          }
                        }}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
                      />
                    </div>

                    {(selectedNode.type === 'SEND_WHATSAPP' || selectedNode.type === 'INTERACTIVE_BUTTONS') && (
                      <div className="space-y-3">
                        {/* Preset Quick Buttons */}
                        <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/60 flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            Presets:
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateNodeConfig('headerText', '🎓 Prakash Institute Admissions');
                                handleUpdateNodeConfig('text', 'Namaste! Please choose an option below to proceed with your enrollment:');
                                handleUpdateNodeConfig('footerText', 'Select an option to proceed');
                                handleUpdateNodeConfig('buttons', [
                                  { id: 'btn-1', title: '📚 Course Fees', type: 'QUICK_REPLY', payload: '1-Year JEE Dropper: ₹45,000/yr | Foundation: ₹35,000/yr' },
                                  { id: 'btn-2', title: '🎟️ Book Demo', type: 'QUICK_REPLY', payload: 'Demo class reserved for Friday 5:00 PM.' },
                                  { id: 'btn-3', title: '📞 Talk to Counsellor', type: 'CALL', phoneNumber: '+91 98765 43210' }
                                ]);
                              }}
                              className="text-[9px] font-bold bg-white text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 shadow-2xs hover:bg-emerald-100/50"
                            >
                              Fees & Demo
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateNodeConfig('headerText', '📅 Demo Masterclass Slots');
                                handleUpdateNodeConfig('text', 'Choose a trial lecture slot:');
                                handleUpdateNodeConfig('footerText', 'Seats limited to 25');
                                handleUpdateNodeConfig('buttons', [
                                  { id: 'btn-1', title: 'Fri 5PM (Physics)', type: 'QUICK_REPLY', payload: 'Reserved Friday 5PM Mechanics slot.' },
                                  { id: 'btn-2', title: 'Sat 11AM (Chemistry)', type: 'QUICK_REPLY', payload: 'Reserved Saturday 11AM Organic slot.' }
                                ]);
                              }}
                              className="text-[9px] font-bold bg-white text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 shadow-2xs hover:bg-emerald-100/50"
                            >
                              Demo Slots
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Header Text <span className="text-slate-400 font-normal">(Optional bold banner)</span>
                          </label>
                          <input
                            type="text"
                            value={selectedNode.config.headerText || ''}
                            onChange={e => handleUpdateNodeConfig('headerText', e.target.value)}
                            placeholder="e.g. 🎓 Prakash Institute Admissions"
                            className="w-full text-xs p-2 rounded-xl border border-slate-200 font-medium"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Message Text Body
                          </label>
                          <textarea
                            rows={3}
                            value={selectedNode.config.text || ''}
                            onChange={e => handleUpdateNodeConfig('text', e.target.value)}
                            placeholder="Enter WhatsApp message text. Use variables like {{studentName}} or {{course}}."
                            className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Footer Text <span className="text-slate-400 font-normal">(Optional small note)</span>
                          </label>
                          <input
                            type="text"
                            value={selectedNode.config.footerText || ''}
                            onChange={e => handleUpdateNodeConfig('footerText', e.target.value)}
                            placeholder="e.g. Select an option below to proceed"
                            className="w-full text-xs p-2 rounded-xl border border-slate-200 font-medium"
                          />
                        </div>

                        {/* Interactive Buttons Config */}
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>Quick Buttons ({((selectedNode.config.buttons || []) as InteractiveButton[]).length}/3)</span>
                            </span>

                            {((selectedNode.config.buttons || []) as InteractiveButton[]).length < 3 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const currentBtns: InteractiveButton[] = selectedNode.config.buttons || [];
                                  const newBtn: InteractiveButton = {
                                    id: `btn-${Date.now()}-${currentBtns.length + 1}`,
                                    title: `Button #${currentBtns.length + 1}`,
                                    type: 'QUICK_REPLY',
                                    payload: 'Automated response information for this button.',
                                  };
                                  handleUpdateNodeConfig('buttons', [...currentBtns, newBtn]);
                                }}
                                className="text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-200 transition-colors"
                              >
                                + Add Button
                              </button>
                            )}
                          </div>

                          {((selectedNode.config.buttons || []) as InteractiveButton[]).map((btn, bIdx) => (
                            <div key={btn.id || bIdx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-700">Button #{bIdx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentBtns: InteractiveButton[] = selectedNode.config.buttons || [];
                                    handleUpdateNodeConfig('buttons', currentBtns.filter((_, i) => i !== bIdx));
                                  }}
                                  className="text-[10px] text-rose-500 hover:text-rose-700 font-bold"
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  maxLength={20}
                                  value={btn.title}
                                  onChange={e => {
                                    const currentBtns: InteractiveButton[] = [...(selectedNode.config.buttons || [])];
                                    currentBtns[bIdx] = { ...currentBtns[bIdx], title: e.target.value };
                                    handleUpdateNodeConfig('buttons', currentBtns);
                                  }}
                                  placeholder="Button title (max 20 chars)"
                                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white"
                                />

                                <select
                                  value={btn.type}
                                  onChange={e => {
                                    const currentBtns: InteractiveButton[] = [...(selectedNode.config.buttons || [])];
                                    currentBtns[bIdx] = { ...currentBtns[bIdx], type: e.target.value as any };
                                    handleUpdateNodeConfig('buttons', currentBtns);
                                  }}
                                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white"
                                >
                                  <option value="QUICK_REPLY">Quick Reply (Info Payload)</option>
                                  <option value="URL">Open URL Link</option>
                                  <option value="CALL">Call Phone Number</option>
                                </select>
                              </div>

                              {btn.type === 'QUICK_REPLY' && (
                                <textarea
                                  rows={2}
                                  value={btn.payload || ''}
                                  onChange={e => {
                                    const currentBtns: InteractiveButton[] = [...(selectedNode.config.buttons || [])];
                                    currentBtns[bIdx] = { ...currentBtns[bIdx], payload: e.target.value };
                                    handleUpdateNodeConfig('buttons', currentBtns);
                                  }}
                                  placeholder="Response info delivered when clicked..."
                                  className="w-full text-[11px] p-1.5 rounded-lg border border-slate-200 bg-white"
                                />
                              )}

                              {btn.type === 'URL' && (
                                <input
                                  type="url"
                                  value={btn.url || ''}
                                  onChange={e => {
                                    const currentBtns: InteractiveButton[] = [...(selectedNode.config.buttons || [])];
                                    currentBtns[bIdx] = { ...currentBtns[bIdx], url: e.target.value };
                                    handleUpdateNodeConfig('buttons', currentBtns);
                                  }}
                                  placeholder="https://prakashinstitute.edu.in/brochure.pdf"
                                  className="w-full text-[11px] p-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                                />
                              )}

                              {btn.type === 'CALL' && (
                                <input
                                  type="tel"
                                  value={btn.phoneNumber || ''}
                                  onChange={e => {
                                    const currentBtns: InteractiveButton[] = [...(selectedNode.config.buttons || [])];
                                    currentBtns[bIdx] = { ...currentBtns[bIdx], phoneNumber: e.target.value };
                                    handleUpdateNodeConfig('buttons', currentBtns);
                                  }}
                                  placeholder="+91 98765 43210"
                                  className="w-full text-[11px] p-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                                />
                              )}
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => setInspectorTab('preview')}
                            className="mt-2 w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Preview on WhatsApp Mobile Screen</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedNode.type === 'DELAY' && (
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Delay Duration (Minutes)</label>
                        <input
                          type="number"
                          value={selectedNode.config.minutes || 15}
                          onChange={e => handleUpdateNodeConfig('minutes', parseInt(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
                        />
                      </div>
                    )}

                    {selectedNode.type === 'CONDITION' && (
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Evaluation Rule</label>
                        <input
                          type="text"
                          value={selectedNode.config.condition || 'message contains "fee"'}
                          onChange={e => handleUpdateNodeConfig('condition', e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono text-[11px]"
                        />
                      </div>
                    )}

                    {selectedNode.type === 'AI_ASSISTANT' && (
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">System Instructions Prompt</label>
                        <textarea
                          rows={3}
                          value={selectedNode.config.prompt || 'Answer student doubts using Prakash Institute syllabus.'}
                          onChange={e => handleUpdateNodeConfig('prompt', e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium text-[11px]"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Raw JSON Config</label>
                      <pre className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[10px] font-mono text-slate-600 overflow-x-auto">
                        {JSON.stringify(selectedNode.config, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-600" />
                <p className="text-xs font-semibold">Click any canvas node to configure its behavior and buttons</p>
              </div>
            )}
          </div>

          {selectedNode && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">ID: {selectedNode.id}</span>
              <button
                onClick={() => handleDeleteNode(selectedNode.id)}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Node Palette Modal */}
      {isAddNodeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-800 font-['Outfit']">
                  Add Node to Workflow
                </h3>
              </div>
              <button
                onClick={() => setIsAddNodeOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {(['SEND_WHATSAPP', 'INTERACTIVE_BUTTONS', 'SEND_TEMPLATE', 'CONDITION', 'DELAY', 'ASSIGN_AGENT', 'ADD_TAG', 'REMOVE_TAG', 'UPDATE_ATTRIBUTE', 'HUMAN_HANDOFF', 'AI_ASSISTANT', 'END'] as WorkflowNodeType[]).map(type => {
                const details = getNodeDetails(type);
                const Icon = details.icon;

                return (
                  <button
                    key={type}
                    onClick={() => handleAddNode(type)}
                    className="p-3 text-left rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all flex items-start gap-2.5 group"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${details.badge}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                        {type === 'INTERACTIVE_BUTTONS' ? 'Interactive Buttons' : type.replace('_', ' ')}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {type === 'SEND_WHATSAPP' && 'Standard text message'}
                        {type === 'INTERACTIVE_BUTTONS' && 'Quick reply & action buttons'}
                        {type === 'SEND_TEMPLATE' && 'Meta approved template'}
                        {type === 'CONDITION' && 'If / Else branching'}
                        {type === 'DELAY' && 'Wait before next step'}
                        {type === 'ASSIGN_AGENT' && 'Route chat to counsellor'}
                        {type === 'ADD_TAG' && 'Attach lead label'}
                        {type === 'REMOVE_TAG' && 'Strip contact label'}
                        {type === 'UPDATE_ATTRIBUTE' && 'Set custom property'}
                        {type === 'HUMAN_HANDOFF' && 'Pause bot for human'}
                        {type === 'AI_ASSISTANT' && 'RAG grounded reply'}
                        {type === 'END' && 'Conclude execution'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Standalone Canvas Step Preview Modal */}
      {canvasPreviewStep && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 shadow-2xl border border-slate-200 flex flex-col items-center animate-in fade-in max-w-md w-full">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Workflow Step: {canvasPreviewStep.title}</h4>
                <p className="text-[10px] text-slate-400">Student Mobile WhatsApp Experience</p>
              </div>
              <button
                onClick={() => setCanvasPreviewStep(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <WhatsAppMessagePreview
              headerText={canvasPreviewStep.config?.headerText}
              bodyText={canvasPreviewStep.config?.text || 'Namaste! Welcome to Prakash Institute.'}
              footerText={canvasPreviewStep.config?.footerText}
              buttons={canvasPreviewStep.config?.buttons || []}
              instituteName="Prakash Institute"
              mode="phone"
            />

            <button
              onClick={() => setCanvasPreviewStep(null)}
              className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}


      {/* Dry-Run Simulation Modal */}
      {isSimulateModalOpen && selectedWorkflow && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-['Outfit']">
                    Workflow Dry-Run Simulator: {selectedWorkflow.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Step through DAG execution without sending real WhatsApp messages.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSimulateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Simulated Student</label>
                  <input
                    type="text"
                    value={simName}
                    onChange={e => setSimName(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Incoming Message Body</label>
                  <input
                    type="text"
                    value={simMessage}
                    onChange={e => setSimMessage(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>Execute Dry-Run Simulation</span>
              </button>
            </div>

            {/* Execution Trace Logs */}
            <div className="flex-1 bg-slate-900 rounded-2xl p-4 overflow-y-auto font-mono text-[11px] text-emerald-400 space-y-1.5 border border-slate-800 max-h-60">
              <div className="text-slate-500 pb-1 border-b border-slate-800">
                --- [AutoMask DAG Engine Execution Trace] ---
              </div>
              {simulationLog.length === 0 && !isSimulating && (
                <div className="text-slate-600 italic">Click Execute to run simulation...</div>
              )}
              {simulationLog.map((line, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-indigo-400 shrink-0">&gt;</span>
                  <span className={line.includes('HALT') ? 'text-amber-300' : line.includes('COMPLETED') ? 'text-white font-bold' : ''}>
                    {line}
                  </span>
                </div>
              ))}
            </div>

            {simulationResult && (
              <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">
                  Execution Status: {simulationResult.completed ? 'COMPLETED' : 'HALTED'}
                </span>
                <span className="text-indigo-600 font-mono">
                  Steps: {simulationResult.simulatedSteps}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
