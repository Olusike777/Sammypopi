import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  Sparkles,
  ArrowUpRight,
  Cpu
} from 'lucide-react';
import { Agent, AgentTask } from '../types/orchestration';

interface AgentCardProps {
  agent: Agent;
  currentTask?: AgentTask;
  onDispatchTask?: (agentId: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  currentTask,
  onDispatchTask,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'personality' | 'permissions' | 'modelPolicy'>('overview');

  const getStatusBadge = (status: Agent['status']) => {
    switch (status) {
      case 'working':
        return (
          <span className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Working
          </span>
        );
      case 'reviewing':
        return (
          <span className="flex items-center gap-1.5 text-xs text-purple-400 font-mono">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            Reviewing
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Completed
          </span>
        );
      case 'waiting':
        return (
          <span className="flex items-center gap-1.5 text-xs text-sky-400 font-mono">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            Waiting
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
            <span className="h-2 w-2 rounded-full bg-neutral-600" />
            Idle
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 transition-all hover:border-neutral-700">
      
      {/* Top Header */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={agent.avatar}
                alt={agent.name}
                referrerPolicy="no-referrer"
                className="h-12 w-12 rounded-full border border-neutral-700 object-cover shadow-sm"
              />
              {agent.isMaestro && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-neutral-950">
                  <Sparkles className="h-2.5 w-2.5" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-neutral-100">{agent.name}</h3>
                {agent.isMaestro && (
                  <span className="text-[10px] font-mono text-amber-400">LEADER</span>
                )}
              </div>
              <p className="text-xs text-neutral-400">{agent.role}</p>
            </div>
          </div>

          <div>{getStatusBadge(agent.status)}</div>
        </div>

        <p className="mt-3 text-xs text-neutral-300 leading-relaxed line-clamp-2">
          {agent.tagline}
        </p>

        {/* Section 25 & 26: Configured Model Policy Indicator */}
        <div className="mt-3 flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950/80 px-2.5 py-1 text-[11px] font-mono">
          <span className="text-neutral-500">Provider:</span>
          <span className="text-amber-300 font-semibold uppercase flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            {agent.activeProvider || agent.modelPolicy?.primary?.provider} ({agent.activeModel || agent.modelPolicy?.primary?.model})
          </span>
        </div>

        {/* Current Task Box */}
        <div className="mt-3 rounded-lg border border-neutral-800/80 bg-neutral-950/70 p-3">
          <div className="text-[11px] text-neutral-400">Current Task:</div>
          <div className="mt-1 text-xs font-medium text-neutral-200 truncate">
            {currentTask ? currentTask.title : 'Awaiting task delegation from Maestro'}
          </div>
          {currentTask && (
            <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-400">
              <span className="capitalize">Priority: {currentTask.priority}</span>
              <span className="font-mono">{new Date(currentTask.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>

        {/* Expanded Details Tabs */}
        {isExpanded && (
          <div className="mt-4 border-t border-neutral-800/80 pt-3">
            <div className="flex flex-wrap gap-2 border-b border-neutral-800/60 pb-2 text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`transition-colors ${activeTab === 'overview' ? 'text-amber-400 font-semibold' : 'text-neutral-400'}`}
              >
                Overview
              </button>
              <span className="text-neutral-600">·</span>
              <button
                onClick={() => setActiveTab('modelPolicy')}
                className={`transition-colors ${activeTab === 'modelPolicy' ? 'text-amber-400 font-semibold' : 'text-neutral-400'}`}
              >
                Model Policy
              </button>
              <span className="text-neutral-600">·</span>
              <button
                onClick={() => setActiveTab('personality')}
                className={`transition-colors ${activeTab === 'personality' ? 'text-amber-400 font-semibold' : 'text-neutral-400'}`}
              >
                Personality
              </button>
              <span className="text-neutral-600">·</span>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`transition-colors ${activeTab === 'permissions' ? 'text-amber-400 font-semibold' : 'text-neutral-400'}`}
              >
                Permissions
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="text-[11px] text-neutral-400">System Instruction Context:</span>
                  <p className="mt-1 text-neutral-300 text-[11px] leading-relaxed max-h-24 overflow-y-auto pr-1">
                    {agent.systemInstruction}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Completed tasks: <span className="text-neutral-200 font-mono">{agent.completedTasksCount}</span></span>
                  <span>Tools: <span className="text-neutral-200 font-mono">{agent.assignedTools.length}</span></span>
                </div>
              </div>
            )}

            {/* Tab: Model Policy */}
            {activeTab === 'modelPolicy' && (
              <div className="mt-3 space-y-2 text-xs">
                <div className="rounded border border-neutral-800 bg-neutral-950 p-2 font-mono text-[11px] space-y-1">
                  <div>Primary Provider: <span className="text-amber-400 uppercase font-semibold">{agent.modelPolicy?.primary?.provider}</span></div>
                  <div>Primary Model: <span className="text-neutral-200">{agent.modelPolicy?.primary?.model}</span></div>
                  <div className="text-neutral-500 pt-1 border-t border-neutral-900">
                    Fallbacks: {agent.modelPolicy?.fallback?.map(f => `${f.provider} (${f.model})`).join(' → ') || 'system'}
                  </div>
                  <div className="text-neutral-500">
                    Timeout: {agent.modelPolicy?.timeoutMs || 40000}ms
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Personality */}
            {activeTab === 'personality' && (
              <div className="mt-3 space-y-2.5 text-xs">
                <div>
                  <span className="text-[11px] text-neutral-400">Communication Style:</span>
                  <p className="text-neutral-300 text-[11px] mt-0.5">{agent.personality.communicationStyle}</p>
                </div>

                <div>
                  <span className="text-[11px] text-neutral-400">Core Priorities:</span>
                  <ul className="mt-1 space-y-1 text-[11px] text-neutral-300">
                    {agent.personality.priorities.map((p, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-amber-400">·</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tab: Permissions */}
            {activeTab === 'permissions' && (
              <div className="mt-3 space-y-2 text-xs">
                <div className="text-[11px] text-neutral-400">Granular Capability Matrix:</div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                  {(['read', 'create', 'modify', 'send', 'delete', 'execute'] as const).map(action => {
                    const scopes = agent.permissions[action];
                    const hasAccess = scopes && scopes.length > 0;
                    return (
                      <div
                        key={action}
                        className={`rounded border px-2 py-1 flex items-center justify-between ${
                          hasAccess ? 'border-neutral-700 bg-neutral-950 text-neutral-200' : 'border-neutral-900 bg-neutral-950/40 text-neutral-600'
                        }`}
                      >
                        <span className="uppercase">{action}</span>
                        <span>{hasAccess ? `${scopes.length} scopes` : 'none'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="border-t border-neutral-800 bg-neutral-950/60 px-5 py-2.5 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <span>{isExpanded ? 'Collapse Dossier' : 'Inspect Dossier'}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {onDispatchTask && (
          <button
            onClick={() => onDispatchTask(agent.id)}
            className="flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>Assign Task</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

    </div>
  );
};
