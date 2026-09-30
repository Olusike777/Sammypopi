import React, { useState } from 'react';
import { Bot, Plus, X, Sparkles, Shield, Wrench } from 'lucide-react';
import { Agent, PermissionScope } from '../types/orchestration';
import { AGENT_AVATARS } from '../services/agentRegistry';

interface NewAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAgent: (newAgent: Omit<Agent, 'completedTasksCount' | 'status'>) => void;
}

export const NewAgentModal: React.FC<NewAgentModalProps> = ({
  isOpen,
  onClose,
  onAddAgent,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [tagline, setTagline] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [communicationStyle, setCommunicationStyle] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>(['tool_web_search']);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');

    const newAgent: Omit<Agent, 'completedTasksCount' | 'status'> = {
      id: id || `agent_${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      tagline: tagline.trim() || `Specialist agent for ${role.trim()}`,
      avatar: AGENT_AVATARS.samsmith, // Reusable avatar fallback
      color: '#3B82F6',
      accentBg: 'rgba(59, 130, 246, 0.1)',
      systemInstruction: systemInstruction.trim() || `You are ${name}, a specialist agent in the Sammypopi multi-agent workspace.`,
      personality: {
        communicationStyle: communicationStyle.trim() || 'Professional, rigorous, and domain-focused.',
        priorities: ['Execution excellence', 'Clear deliverables', 'Team alignment'],
        reasoningPerspective: 'Domain specialist perspective.',
        strengths: ['Domain expertise', 'Speed', 'Consistency'],
        weaknesses: ['Requires clear task briefs'],
        relationshipToOthers: {
          sammypopi: 'Reports directly to Sammypopi for task assignments and review.',
        },
      },
      permissions: {
        read: ['project:brief', 'project:drafts'],
        create: ['project:drafts', 'agent:message'],
        modify: ['project:drafts'],
        send: ['agent:message'],
        delete: [],
        execute: [],
      },
      assignedTools: selectedTools,
    };

    onAddAgent(newAgent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-semibold text-neutral-100">Provision New Specialist Agent</h3>
              <div className="text-xs text-neutral-400">Add an autonomous specialist to Sammypopi's atelier</div>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400">Agent Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samcopy"
                className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-neutral-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-neutral-400">Specialist Role</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Monograph Copywriting Specialist"
                className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-neutral-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-400">Tagline / Mission</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Crafts evocative, restrained architectural narrative prose."
              className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-neutral-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-neutral-400">System Instruction / Persona Directives</label>
            <textarea
              rows={3}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              placeholder="Describe the agent's mandate, constraints, and non-negotiables..."
              className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-neutral-100 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div>
            <label className="text-neutral-400">Communication Style</label>
            <input
              type="text"
              value={communicationStyle}
              onChange={(e) => setCommunicationStyle(e.target.value)}
              placeholder="e.g. Poetic, concise, unhurried, razor-sharp on word choice."
              className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-neutral-100 focus:outline-none"
            />
          </div>

          {/* Assigned Tools */}
          <div>
            <label className="text-neutral-400">Initial Tool Capabilities</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2 text-[11px]">
              {[
                { id: 'tool_web_search', label: 'Web Intelligence' },
                { id: 'tool_layout_synthesizer', label: 'Layout Synthesizer' },
                { id: 'tool_image_curation', label: 'Visual Asset Engine' },
                { id: 'tool_code_exporter', label: 'Code Exporter' },
              ].map(tool => {
                const checked = selectedTools.includes(tool.id);
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => {
                      if (checked) {
                        setSelectedTools(selectedTools.filter(t => t !== tool.id));
                      } else {
                        setSelectedTools([...selectedTools, tool.id]);
                      }
                    }}
                    className={`rounded border p-2 text-left transition-colors ${
                      checked
                        ? 'border-amber-400 bg-amber-400/10 text-amber-200'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    {tool.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-3 py-1.5 text-neutral-400 hover:text-neutral-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-amber-400 px-4 py-1.5 font-semibold text-neutral-950 hover:bg-amber-300"
            >
              Provision Specialist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
