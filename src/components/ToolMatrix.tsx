import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Unlock, 
  FileCode, 
  Search, 
  Image as ImageIcon, 
  Sparkles,
  Cpu,
  Layers
} from 'lucide-react';
import { ToolDefinition, Agent, PermissionAction } from '../types/orchestration';
import { INITIAL_TOOLS } from '../services/agentRegistry';

interface ToolMatrixProps {
  agents: Agent[];
  tools?: ToolDefinition[];
}

export const ToolMatrix: React.FC<ToolMatrixProps> = ({
  agents,
  tools = INITIAL_TOOLS,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const actions: PermissionAction[] = ['read', 'create', 'modify', 'send', 'delete', 'execute'];

  const filteredTools = tools.filter(tool => {
    if (selectedCategory !== 'all' && tool.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-neutral-100">
            Tool Registry & Permissions Governance
          </h2>
          <span className="text-xs text-neutral-500">·</span>
          <span className="text-xs font-mono text-neutral-400">Granular Security Architecture</span>
        </div>
        <p className="mt-0.5 text-xs text-neutral-400">
          Tools are bound to specific permission scopes. Planned capabilities are explicitly declared without simulated stubs.
        </p>
      </div>

      {/* Tools Section */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-neutral-200">
              Workspace Tool Registry
            </h3>
          </div>

          {/* Category Filter */}
          <div className="flex overflow-x-auto gap-1 text-xs">
            {['all', 'research', 'design', 'typography', 'critique', 'orchestration', 'system'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded px-2.5 py-1 capitalize transition-colors ${
                  selectedCategory === cat ? 'bg-neutral-800 text-amber-300' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredTools.map(tool => {
            const isPlanned = tool.status === 'planned';
            const assignedAgents = agents.filter(a => a.assignedTools.includes(tool.id));

            return (
              <div
                key={tool.id}
                className={`rounded-lg border p-3.5 text-xs space-y-2.5 transition-all ${
                  isPlanned
                    ? 'border-neutral-800/60 bg-neutral-950/40 opacity-75'
                    : 'border-neutral-800 bg-neutral-950'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-neutral-200">{tool.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                    isPlanned
                      ? 'border-neutral-800 text-neutral-400 bg-neutral-900'
                      : 'border-emerald-900 text-emerald-400 bg-emerald-950/40'
                  }`}>
                    {tool.status}
                  </span>
                </div>

                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  {tool.description}
                </p>

                <div className="pt-2 border-t border-neutral-900 space-y-1 text-[10px] text-neutral-400">
                  <div>
                    <span className="text-neutral-400">Required:</span>{' '}
                    <span className="font-mono text-neutral-300">{tool.requiredAction} · {tool.requiredScope}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Authorized:</span>{' '}
                    <span className="text-neutral-300 font-medium">
                      {assignedAgents.length > 0 ? assignedAgents.map(a => a.name).join(', ') : 'None (Planned)'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Granular Permission Action Matrix */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-neutral-200">
            Agent Permission Matrix (6 Actions)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-[11px] text-neutral-400 uppercase font-mono">
                <th className="py-2.5 px-3">Agent</th>
                <th className="py-2.5 px-3">Role</th>
                {actions.map(action => (
                  <th key={action} className="py-2.5 px-3 text-center">{action}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {agents.map(agent => (
                <tr key={agent.id} className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-neutral-200 flex items-center gap-2">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      referrerPolicy="no-referrer"
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span>{agent.name}</span>
                  </td>
                  <td className="py-3 px-3 text-neutral-400">{agent.role}</td>

                  {actions.map(action => {
                    const scopes = agent.permissions[action] || [];
                    const hasPermission = scopes.length > 0;

                    return (
                      <td key={action} className="py-3 px-3 text-center">
                        {hasPermission ? (
                          <span
                            title={`${scopes.join(', ')}`}
                            className="inline-flex items-center justify-center font-mono text-[11px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/40"
                          >
                            ✓ {scopes.length}
                          </span>
                        ) : (
                          <span className="text-neutral-700 font-mono">―</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-800">
          Hover over permission badge to view exact allowed scopes. Delete and Execute permissions require explicit Maestro or user authorization.
        </div>
      </div>

    </div>
  );
};
