import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Sparkles, 
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Eye
} from 'lucide-react';
import { Agent, Project, AgentDiscussionMessage } from '../types/orchestration';

interface AgentRoomProps {
  agents: Agent[];
  activeProject: Project;
  onSelectAgent: (agentId: string) => void;
  onSendMessageToAgent: (senderId: string, recipientId: string, message: string) => void;
  onRunWorkflowStage: (stage: string) => void;
  isWorkflowRunning: boolean;
}

export const AgentRoom: React.FC<AgentRoomProps> = ({
  agents,
  activeProject,
  onSelectAgent,
  onSendMessageToAgent,
  onRunWorkflowStage,
  isWorkflowRunning,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('sammypopi');
  const [interAgentInput, setInterAgentInput] = useState('');
  const [targetAgentId, setTargetAgentId] = useState('samsonite');
  const [activeFilter, setActiveFilter] = useState<'all' | 'critique' | 'proposals'>('all');

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
  const maestro = agents.find(a => a.isMaestro) || agents[0];
  const specialists = agents.filter(a => !a.isMaestro);

  const filteredDiscussions = activeProject.discussions.filter(disc => {
    if (activeFilter === 'critique') return disc.type === 'critique' || disc.type === 'disagreement';
    if (activeFilter === 'proposals') return disc.type === 'proposal' || disc.type === 'directive';
    return true;
  });

  const handleSendDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interAgentInput.trim()) return;
    onSendMessageToAgent(selectedAgentId, targetAgentId, interAgentInput.trim());
    setInterAgentInput('');
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'working': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'reviewing': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'waiting': return 'text-sky-400 bg-sky-400/10 border-sky-400/30';
      case 'error': return 'text-rose-400 bg-rose-400/10 border-rose-400/30';
      default: return 'text-neutral-400 bg-neutral-800/40 border-neutral-700/30';
    }
  };

  const stages = [
    { id: 'research', label: '01. Research', agent: 'Samsmith' },
    { id: 'visual_curation', label: '02. Assets', agent: 'Samkindle' },
    { id: 'design_architecture', label: '03. Layout', agent: 'Samsonite' },
    { id: 'typography_polish', label: '04. Polish', agent: 'Sammy' },
    { id: 'quality_control', label: '05. QC & Critique', agent: 'Samuel' },
    { id: 'maestro_synthesis', label: '06. Synthesis', agent: 'Sammypopi' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Workflow Stages Pipeline */}
      <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs text-neutral-400">
              Active Workflow Pipeline · {activeProject.name.split('—')[0]}
            </div>
            <h2 className="text-sm font-semibold text-neutral-200">
              Collaborative Atelier Room
            </h2>
          </div>
          <div className="text-xs text-neutral-400 font-mono">
            Stage: <span className="text-amber-400 font-medium">{activeProject.workflowStage}</span>
          </div>
        </div>

        {/* Workflow Steps Horizontal Bar */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {stages.map((st, i) => {
            const isCurrent = activeProject.workflowStage === st.id;
            return (
              <button
                key={st.id}
                onClick={() => onRunWorkflowStage(st.id)}
                disabled={isWorkflowRunning}
                className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition-all ${
                  isCurrent
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-neutral-800/80 bg-neutral-900/40 hover:border-neutral-700'
                }`}
              >
                <span className="text-[11px] font-medium text-neutral-300">{st.label}</span>
                <span className="text-[10px] text-neutral-400">{st.agent}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Stage Floor */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Column: Virtual Workspace Stations (8 cols) */}
        <div className="space-y-4 lg:col-span-8">
          
          {/* Maestro Orchestrator Podium (Centerpiece) */}
          <div 
            onClick={() => setSelectedAgentId(maestro.id)}
            className={`cursor-pointer rounded-xl border p-5 transition-all ${
              selectedAgentId === maestro.id
                ? 'border-amber-500/60 bg-gradient-to-r from-amber-950/20 via-neutral-900 to-neutral-900 shadow-md'
                : 'border-neutral-800/80 bg-neutral-900/50 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={maestro.avatar}
                    alt={maestro.name}
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 rounded-full border-2 border-amber-400/40 object-cover shadow-inner"
                  />
                  <span className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-neutral-950 ${
                    maestro.status === 'working' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
                  }`} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-neutral-100">{maestro.name}</h3>
                    <span className="text-xs text-neutral-500">·</span>
                    <span className="text-xs font-mono text-amber-400">{maestro.role}</span>
                  </div>
                  <p className="mt-1 max-w-xl text-xs text-neutral-400 leading-relaxed">
                    {maestro.tagline}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-neutral-400">
                    <span>Delegated: {activeProject.tasks.length} tasks</span>
                    <span>·</span>
                    <span>Directing: {specialists.length} specialists</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-block rounded-md border px-2.5 py-1 text-[11px] font-medium capitalize ${getStatusColor(maestro.status)}`}>
                  {maestro.status}
                </span>
              </div>
            </div>
          </div>

          {/* Specialists Grid (5 Agents) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {specialists.map(agent => {
              const isSelected = selectedAgentId === agent.id;
              const currentTask = activeProject.tasks.find(t => t.assignedAgentId === agent.id);

              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-amber-500/60 bg-neutral-900 shadow-sm'
                      : 'border-neutral-800/80 bg-neutral-900/40 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        referrerPolicy="no-referrer"
                        className="h-11 w-11 rounded-full border border-neutral-700 object-cover"
                      />
                      <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-neutral-950 ${
                        agent.status === 'working' ? 'bg-amber-400 animate-pulse' :
                        agent.status === 'reviewing' ? 'bg-purple-400 animate-pulse' : 'bg-emerald-500'
                      }`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="truncate text-xs font-semibold text-neutral-200">
                          {agent.name}
                        </h4>
                        <span className={`text-[10px] capitalize font-mono ${
                          agent.status === 'working' ? 'text-amber-400' :
                          agent.status === 'reviewing' ? 'text-purple-400' : 'text-neutral-400'
                        }`}>
                          {agent.status}
                        </span>
                      </div>
                      <p className="truncate text-[11px] text-neutral-400">{agent.role}</p>
                    </div>
                  </div>

                  {/* Current Active Task or Last Deliverable */}
                  <div className="mt-3 rounded-lg border border-neutral-800/60 bg-neutral-950/60 p-2 text-[11px]">
                    <div className="text-[10px] text-neutral-400">Current Task:</div>
                    <div className="truncate font-medium text-neutral-300">
                      {currentTask ? currentTask.title : 'Ready for assignment'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Selected Agent Inspector Card */}
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/70 p-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedAgent.avatar}
                  alt={selectedAgent.name}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full border border-neutral-700 object-cover"
                />
                <div>
                  <h3 className="text-sm font-semibold text-neutral-100">
                    Station: {selectedAgent.name} ({selectedAgent.role})
                  </h3>
                  <div className="text-xs text-neutral-400">
                    Communication: {selectedAgent.personality.communicationStyle.slice(0, 70)}...
                  </div>
                </div>
              </div>
              <button
                onClick={() => onSelectAgent(selectedAgent.id)}
                className="flex items-center gap-1 rounded-md border border-neutral-700 bg-neutral-800/80 px-2.5 py-1 text-xs text-neutral-200 hover:bg-neutral-700 transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Open Dossier</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <div className="text-[11px] font-medium text-neutral-400">Core Priorities</div>
                <ul className="mt-1.5 space-y-1 text-xs text-neutral-300">
                  {selectedAgent.personality.priorities.slice(0, 3).map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400">·</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-[11px] font-medium text-neutral-400">Specialist Strengths</div>
                <ul className="mt-1.5 space-y-1 text-xs text-neutral-300">
                  {selectedAgent.personality.strengths.slice(0, 3).map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">·</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-[11px] font-medium text-neutral-400">Assigned Capabilities</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs text-neutral-300">
                  {selectedAgent.assignedTools.map(toolId => (
                    <span key={toolId} className="font-mono text-[11px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                      {toolId.replace('tool_', '')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Agent-to-Agent Discussion Feed (4 cols) */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-amber-400" />
                <h3 className="text-xs font-semibold text-neutral-200">
                  Agent-to-Agent Stream
                </h3>
              </div>

              {/* Filter controls */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    activeFilter === 'all' ? 'bg-neutral-800 text-neutral-200' : 'text-neutral-400 hover:text-neutral-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('critique')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    activeFilter === 'critique' ? 'bg-neutral-800 text-rose-300' : 'text-neutral-400 hover:text-neutral-300'
                  }`}
                >
                  Critique
                </button>
              </div>
            </div>

            {/* Live Message Thread */}
            <div className="mt-3 max-h-[460px] space-y-3 overflow-y-auto pr-1">
              {filteredDiscussions.map(disc => {
                const sender = agents.find(a => a.id === disc.senderAgentId);
                const recipient = disc.recipientAgentId ? agents.find(a => a.id === disc.recipientAgentId) : null;
                const isCritique = disc.type === 'critique' || disc.type === 'disagreement';

                return (
                  <div
                    key={disc.id}
                    className={`rounded-lg border p-3 text-xs transition-colors ${
                      isCritique
                        ? 'border-rose-900/40 bg-rose-950/20'
                        : 'border-neutral-800/70 bg-neutral-950/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {sender && (
                          <img
                            src={sender.avatar}
                            alt={sender.name}
                            referrerPolicy="no-referrer"
                            className="h-5 w-5 rounded-full object-cover border border-neutral-700"
                          />
                        )}
                        <span className="font-semibold text-neutral-200">
                          {sender?.name || disc.senderAgentId}
                        </span>

                        {recipient && (
                          <>
                            <ArrowRight className="h-3 w-3 text-neutral-500" />
                            <span className="text-neutral-400">{recipient.name}</span>
                          </>
                        )}
                      </div>

                      <span className={`text-[10px] font-mono capitalize ${
                        isCritique ? 'text-rose-400' : 'text-neutral-400'
                      }`}>
                        {disc.type}
                      </span>
                    </div>

                    <p className="mt-2 text-neutral-300 leading-relaxed">
                      {disc.content}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400">
                      <span>{new Date(disc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {disc.relatedTaskId && <span>Ref: {disc.relatedTaskId}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Prompt inter-agent dialogue trigger */}
            <form onSubmit={handleSendDiscussion} className="mt-3 border-t border-neutral-800 pt-3">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
                <span>Direct inquiry from:</span>
                <select
                  value={targetAgentId}
                  onChange={(e) => setTargetAgentId(e.target.value)}
                  className="rounded border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-xs text-neutral-200 focus:outline-none"
                >
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>to {a.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={interAgentInput}
                  onChange={(e) => setInterAgentInput(e.target.value)}
                  placeholder="Initiate team critique or task..."
                  className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:border-amber-500/60 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-md bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/30 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};
