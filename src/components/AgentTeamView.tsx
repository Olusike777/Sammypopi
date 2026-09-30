import React, { useState } from 'react';
import { Plus, Users, Shield, Sparkles, Filter } from 'lucide-react';
import { Agent, Project } from '../types/orchestration';
import { AgentCard } from './AgentCard';

interface AgentTeamViewProps {
  agents: Agent[];
  activeProject: Project;
  onOpenNewAgentModal: () => void;
  onDispatchTask: (agentId: string) => void;
}

export const AgentTeamView: React.FC<AgentTeamViewProps> = ({
  agents,
  activeProject,
  onOpenNewAgentModal,
  onDispatchTask,
}) => {
  const [filterRole, setFilterRole] = useState<'all' | 'maestro' | 'specialist'>('all');

  const filteredAgents = agents.filter(agent => {
    if (filterRole === 'maestro') return agent.isMaestro;
    if (filterRole === 'specialist') return !agent.isMaestro;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-neutral-100">
              Specialized Agent Atelier
            </h2>
            <span className="text-xs text-neutral-500">·</span>
            <span className="text-xs font-mono text-neutral-400">{agents.length} active agents</span>
          </div>
          <p className="mt-0.5 text-xs text-neutral-400">
            Modular multi-agent architecture. Each agent maintains distinct instructions, domain perspective, and tool permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented filter control (allowed button elements) */}
          <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900/80 p-0.5 text-xs">
            <button
              onClick={() => setFilterRole('all')}
              className={`rounded px-2.5 py-1 transition-colors ${
                filterRole === 'all' ? 'bg-neutral-800 text-neutral-200' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All Agents
            </button>
            <button
              onClick={() => setFilterRole('maestro')}
              className={`rounded px-2.5 py-1 transition-colors ${
                filterRole === 'maestro' ? 'bg-neutral-800 text-amber-300' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Maestro
            </button>
            <button
              onClick={() => setFilterRole('specialist')}
              className={`rounded px-2.5 py-1 transition-colors ${
                filterRole === 'specialist' ? 'bg-neutral-800 text-neutral-200' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Specialists
            </button>
          </div>

          <button
            onClick={onOpenNewAgentModal}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-amber-400" />
            <span>Add Custom Agent</span>
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map(agent => {
          const currentTask = activeProject.tasks.find(t => t.assignedAgentId === agent.id);
          return (
            <AgentCard
              key={agent.id}
              agent={agent}
              currentTask={currentTask}
              onDispatchTask={onDispatchTask}
            />
          );
        })}
      </div>

      {/* Extensibility note callout */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-xs text-neutral-400 flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-neutral-200">Architectural Principle: Independence & Non-Monolithic Agents</span>
          <p className="leading-relaxed">
            The workspace does not rely on a single giant prompt. Each agent runs on isolated system instructions, returns structured JSON deliverables, and can be given custom tools (like web search or image generation) without rebuilding the core application.
          </p>
        </div>
      </div>

    </div>
  );
};
