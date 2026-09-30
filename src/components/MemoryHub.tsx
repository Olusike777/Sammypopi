import React, { useState } from 'react';
import { 
  BrainCircuit, 
  User, 
  FolderKanban, 
  Bot, 
  MessageSquare, 
  BookOpen, 
  Plus, 
  Search, 
  Sparkles,
  Clock,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { MemoryItem, MemoryCategory } from '../types/orchestration';

interface MemoryHubProps {
  memories: MemoryItem[];
  onAddMemory: (memory: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const MemoryHub: React.FC<MemoryHubProps> = ({
  memories,
  onAddMemory,
}) => {
  const [activeCategory, setActiveCategory] = useState<MemoryCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Memory Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('user');
  const [newImportance, setNewImportance] = useState<MemoryItem['importance']>('high');
  const [newTags, setNewTags] = useState('');

  const categories: Array<{ id: MemoryCategory | 'all'; label: string; icon: any; count: number }> = [
    { id: 'all', label: 'All Tiers', icon: BrainCircuit, count: memories.length },
    { id: 'user', label: 'User Memory', icon: User, count: memories.filter(m => m.category === 'user').length },
    { id: 'project', label: 'Project Memory', icon: FolderKanban, count: memories.filter(m => m.category === 'project').length },
    { id: 'agent', label: 'Agent Heuristics', icon: Bot, count: memories.filter(m => m.category === 'agent').length },
    { id: 'conversation', label: 'Key Decisions', icon: MessageSquare, count: memories.filter(m => m.category === 'conversation').length },
    { id: 'knowledge', label: 'Constitution & Specs', icon: BookOpen, count: memories.filter(m => m.category === 'knowledge').length },
  ];

  const filteredMemories = memories.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddMemory({
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      importance: newImportance,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
    });

    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setShowAddModal(false);
  };

  const getImportanceBadge = (importance: MemoryItem['importance']) => {
    switch (importance) {
      case 'critical':
        return <span className="text-[10px] font-mono text-rose-400">CRITICAL</span>;
      case 'high':
        return <span className="text-[10px] font-mono text-amber-400">HIGH</span>;
      default:
        return <span className="text-[10px] font-mono text-neutral-400">STANDARD</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-neutral-100">
              Persistent Memory Architecture
            </h2>
            <span className="text-xs text-neutral-500">·</span>
            <span className="text-xs font-mono text-neutral-400">5-Tier Conceptual Model</span>
          </div>
          <p className="mt-0.5 text-xs text-neutral-400">
            Sammypopi distinguishes permanent heuristics from transient context. Preserves user taste, locked project constraints, and agent rules.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-700 transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-amber-400" />
          <span>Record New Memory</span>
        </button>
      </div>

      {/* Categories & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-1 scrollbar-none">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-neutral-800 text-amber-300 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
                <span className="text-[10px] text-neutral-400 font-mono">({cat.count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memory graph..."
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMemories.map(mem => (
          <div
            key={mem.id}
            className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-3 hover:border-neutral-700 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-amber-400 uppercase">
                  {mem.category} tier
                </span>
                {getImportanceBadge(mem.importance)}
              </div>

              <h3 className="mt-2 text-sm font-semibold text-neutral-100">
                {mem.title}
              </h3>

              <p className="mt-1.5 text-xs text-neutral-300 leading-relaxed">
                {mem.content}
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400">
              <div className="flex flex-wrap gap-1">
                {mem.tags.map(tag => (
                  <span key={tag} className="font-mono bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                    #{tag}
                  </span>
                ))}
              </div>
              <span className="font-mono">
                {new Date(mem.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-neutral-100">Record Persistent Memory</h3>
                <div className="text-xs text-neutral-400">Store user taste, project constraints, or agent rules</div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400">Memory Category Tier</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                  className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-neutral-100 focus:outline-none"
                >
                  <option value="user">User Memory (Taste, style, business details)</option>
                  <option value="project">Project Memory (Approved tokens, constraints)</option>
                  <option value="agent">Agent Heuristics (Rules learned by Samuel, Sammy, etc.)</option>
                  <option value="conversation">Key Decisions (Milestones from chat)</option>
                  <option value="knowledge">Knowledge & Resources (Constitution, specs)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400">Importance Rating</label>
                <select
                  value={newImportance}
                  onChange={(e) => setNewImportance(e.target.value as MemoryItem['importance'])}
                  className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-neutral-100 focus:outline-none"
                >
                  <option value="critical">Critical (Always prioritized in agent prompts)</option>
                  <option value="high">High (Consulted during design & review)</option>
                  <option value="normal">Normal (Archived context)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400">Title / Subject</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Color Token Lockdown: Travertine Only"
                  className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-neutral-400">Content / Instruction</label>
                <textarea
                  rows={3}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Describe the permanent preference or constraint..."
                  className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-neutral-100 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div>
                <label className="text-neutral-400">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. palette, travertine, rules"
                  className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded px-3 py-1.5 text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-amber-400 px-4 py-1.5 font-semibold text-neutral-950 hover:bg-amber-300"
                >
                  Save Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
