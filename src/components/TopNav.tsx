import React from 'react';
import { 
  Users, 
  MessageSquare, 
  FolderKanban, 
  Layers, 
  BrainCircuit, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { Project, UserProfile } from '../types/orchestration';

interface TopNavProps {
  activeTab: 'room' | 'maestro' | 'project' | 'agents' | 'memory' | 'tools';
  setActiveTab: (tab: 'room' | 'maestro' | 'project' | 'agents' | 'memory' | 'tools') => void;
  activeProject: Project;
  userProfile: UserProfile;
  onOpenUserModal: () => void;
  onRunWorkflow: () => void;
  isWorkflowRunning: boolean;
  hasApiKey: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  activeProject,
  userProfile,
  onOpenUserModal,
  onRunWorkflow,
  isWorkflowRunning,
  hasApiKey,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Zone 1: Single text element wordmark + subtle project identifier */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight text-neutral-100">
              Sammypopi
            </span>
            <span className="text-xs text-neutral-500">·</span>
            <span className="text-xs font-mono text-amber-400/90">Maestro AI</span>
          </div>

          <div className="hidden h-4 w-px bg-neutral-800 sm:block" />

          {/* Project Dropdown / Indicator */}
          <div className="hidden items-center gap-1.5 text-xs text-neutral-400 sm:flex">
            <span className="text-neutral-500">Project:</span>
            <span className="max-w-[180px] truncate font-medium text-neutral-200">
              {activeProject.name.split('—')[0]}
            </span>
            <span className="text-neutral-600">·</span>
            <span className="font-mono text-neutral-400">Phase 1</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (single-line controls, text with subtle states) */}
        <nav className="hidden items-center gap-1 md:flex">
          <button
            onClick={() => setActiveTab('room')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'room'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>AI Room</span>
          </button>

          <button
            onClick={() => setActiveTab('maestro')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'maestro'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Maestro</span>
          </button>

          <button
            onClick={() => setActiveTab('project')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'project'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FolderKanban className="h-3.5 w-3.5" />
            <span>Project & Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('agents')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'agents'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Agent Team</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'memory'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>Memory Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'tools'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Tools & Permissions</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions + User Account */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRunWorkflow}
            disabled={isWorkflowRunning}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-neutral-950 transition-all ${
              isWorkflowRunning
                ? 'bg-neutral-600 text-neutral-300 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-300 shadow-sm'
            }`}
          >
            <Sparkles className={`h-3.5 w-3.5 ${isWorkflowRunning ? 'animate-spin' : ''}`} />
            <span className="whitespace-nowrap">
              {isWorkflowRunning ? 'Orchestrating...' : 'Run Pipeline'}
            </span>
          </button>

          <button
            onClick={onOpenUserModal}
            className="flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/80 px-2.5 py-1.5 text-xs text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
          >
            <UserCheck className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline font-medium">{userProfile.name.split(' ')[0]}</span>
            <ChevronDown className="h-3 w-3 text-neutral-500" />
          </button>
        </div>

      </div>

      {/* Mobile navigation bar */}
      <div className="flex overflow-x-auto border-t border-neutral-800/80 px-4 py-1.5 md:hidden scrollbar-none gap-2">
        {(['room', 'maestro', 'project', 'agents', 'memory', 'tools'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === tab ? 'text-amber-400 font-semibold' : 'text-neutral-400'
            }`}
          >
            {tab === 'room' && 'AI Room'}
            {tab === 'maestro' && 'Maestro'}
            {tab === 'project' && 'Project'}
            {tab === 'agents' && 'Agents'}
            {tab === 'memory' && 'Memory'}
            {tab === 'tools' && 'Tools'}
          </button>
        ))}
      </div>
    </header>
  );
};
