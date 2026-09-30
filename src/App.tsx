import React, { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { AgentRoom } from './components/AgentRoom';
import { MaestroConsole } from './components/MaestroConsole';
import { ProjectWorkspace } from './components/ProjectWorkspace';
import { AgentTeamView } from './components/AgentTeamView';
import { MemoryHub } from './components/MemoryHub';
import { ToolMatrix } from './components/ToolMatrix';
import { UserAccountModal } from './components/UserAccountModal';
import { NewAgentModal } from './components/NewAgentModal';

import { 
  Agent, 
  Project, 
  MemoryItem, 
  UserProfile, 
  ChatMessage, 
  AgentDiscussionMessage 
} from './types/orchestration';
import { INITIAL_AGENTS, agentRegistry } from './services/agentRegistry';
import { INITIAL_PROJECT, INITIAL_MEMORIES, INITIAL_USER_PROFILE } from './services/mockProjectData';

export default function App() {
  const [activeTab, setActiveTab] = useState<'room' | 'maestro' | 'project' | 'agents' | 'memory' | 'tools'>('room');
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [activeProject, setActiveProject] = useState<Project>(INITIAL_PROJECT);
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);

  // Modals
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newAgentModalOpen, setNewAgentModalOpen] = useState(false);

  // Chat with Maestro
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'sammypopi',
      content: `Welcome to the atelier, Alamu. I am Sammypopi, your Maestro.

My specialist team is aligned and ready: Samsmith is on research, Samkindle on visual asset curation, Samsonite on architectural layouts, Sammy on typography polish, and Samuel on rigorous quality critique.

How shall we direct the team today? We can orchestrate a full landing-page sprint, audit wireframes against our design constitution, or research market benchmarks.`,
      timestamp: new Date().toISOString(),
      orchestrationData: {
        delegatedTo: ['samsmith', 'samkindle', 'samsonite', 'sammy', 'samuel'],
      },
    },
  ]);

  // Check backend server status
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data.hasApiKey) {
          setHasApiKey(true);
        }
      })
      .catch(() => {
        // Dev server fallback
      });
  }, []);

  // Send message to Sammypopi
  const handleSendMessage = async (content: string, options?: { tool?: string; attachment?: string }) => {
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      content: options?.attachment 
        ? `${content} [Attached: ${options.attachment}]`
        : content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsAiResponding(true);

    // Set Sammypopi status to working
    setAgents(prev => prev.map(a => a.isMaestro ? { ...a, status: 'working' } : a));

    try {
      const response = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: content,
          projectId: activeProject.id,
          context: {
            projectName: activeProject.name,
            objective: activeProject.objective,
            userPreferences: userProfile.preferences,
            toolRequested: options?.tool,
          },
        }),
      });

      const data = await response.json();
      const orch = data.orchestration || {};

      const maestroReply: ChatMessage = {
        id: `msg_m_${Date.now()}`,
        sender: 'sammypopi',
        content: orch.executiveMessage || orch.summary || 'I have aligned the team and assigned tasks across the workspace.',
        timestamp: new Date().toISOString(),
        orchestrationData: {
          subtasksPlanned: orch.delegatedTasks?.map((t: any) => ({
            agentId: t.agentId,
            task: t.taskTitle || t.description,
          })) || [],
          delegatedTo: orch.delegatedTasks?.map((t: any) => t.agentId) || [],
          critiqueInvolved: true,
          synthesisReady: true,
        },
      };

      setMessages(prev => [...prev, maestroReply]);

      // Add inter-agent discussion based on debate
      if (orch.anticipatedDebate) {
        const debateMsg: AgentDiscussionMessage = {
          id: `disc_${Date.now()}`,
          projectId: activeProject.id,
          senderAgentId: 'samuel',
          recipientAgentId: 'samsonite',
          content: orch.anticipatedDebate,
          type: 'critique',
          timestamp: new Date().toISOString(),
        };

        setActiveProject(prev => ({
          ...prev,
          discussions: [debateMsg, ...prev.discussions],
        }));
      }

    } catch (err) {
      const fallbackReply: ChatMessage = {
        id: `msg_m_${Date.now()}`,
        sender: 'sammypopi',
        content: `I have received your directive: "${content}". I am coordinating with Samsmith, Samkindle, and Samsonite to refine the atelier architecture. Samuel is standing by for independent review.`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsAiResponding(false);
      setAgents(prev => prev.map(a => a.isMaestro ? { ...a, status: 'idle' } : a));
    }
  };

  // Run the multi-agent workflow sequence
  const handleRunWorkflow = async () => {
    if (isWorkflowRunning) return;
    setIsWorkflowRunning(true);

    const stages: Array<{ stage: Project['workflowStage']; agentId: string; log: string }> = [
      { stage: 'research', agentId: 'samsmith', log: 'Samsmith researching high-end UX benchmarks...' },
      { stage: 'visual_curation', agentId: 'samkindle', log: 'Samkindle curating 60-30-10 travertine palette & assets...' },
      { stage: 'design_architecture', agentId: 'samsonite', log: 'Samsonite synthesizing 1440px wireframe Bento grid...' },
      { stage: 'typography_polish', agentId: 'sammy', log: 'Sammy enforcing 2+1 font rule & tabular numerals...' },
      { stage: 'quality_control', agentId: 'samuel', log: 'Samuel conducting anti-slop audit & WCAG AA check...' },
      { stage: 'maestro_synthesis', agentId: 'sammypopi', log: 'Sammypopi synthesizing final verified deliverable...' },
    ];

    for (const step of stages) {
      // Set active stage in project
      setActiveProject(prev => ({ ...prev, workflowStage: step.stage }));

      // Set agent working
      setAgents(prev => prev.map(a => a.id === step.agentId ? { ...a, status: 'working' } : a));

      // Wait 800ms per stage for smooth visual orchestration feedback
      await new Promise(res => setTimeout(res, 850));

      // Mark agent completed
      setAgents(prev => prev.map(a => a.id === step.agentId ? { ...a, status: 'completed' } : a));
    }

    setActiveProject(prev => ({
      ...prev,
      workflowStage: 'final_ready',
      status: 'completed',
    }));

    // Reset agents to idle
    setAgents(prev => prev.map(a => ({ ...a, status: 'idle' })));
    setIsWorkflowRunning(false);

    // Notify in chat
    setMessages(prev => [
      ...prev,
      {
        id: `msg_wf_${Date.now()}`,
        sender: 'sammypopi',
        content: `Multi-agent sprint completed successfully! All 6 specialists have contributed: Samsmith’s research, Samkindle’s visual tokens, Samsonite’s layout, Sammy’s typography, and Samuel’s QC audit. The live landing page preview is now updated.`,
        timestamp: new Date().toISOString(),
        orchestrationData: {
          synthesisReady: true,
        },
      },
    ]);
  };

  const handleRunWorkflowStage = (stage: string) => {
    setActiveProject(prev => ({
      ...prev,
      workflowStage: stage as any,
    }));
  };

  // Inter-agent discussion trigger
  const handleSendMessageToAgent = (senderId: string, recipientId: string, content: string) => {
    const newDiscussion: AgentDiscussionMessage = {
      id: `disc_${Date.now()}`,
      projectId: activeProject.id,
      senderAgentId: senderId,
      recipientAgentId: recipientId,
      content,
      type: senderId === 'samuel' ? 'critique' : 'proposal',
      timestamp: new Date().toISOString(),
    };

    setActiveProject(prev => ({
      ...prev,
      discussions: [newDiscussion, ...prev.discussions],
    }));
  };

  // Add new memory
  const handleAddMemory = (memoryData: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMem: MemoryItem = {
      ...memoryData,
      id: `mem_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMemories(prev => [newMem, ...prev]);
  };

  // Add new agent
  const handleAddAgent = (newAgent: Omit<Agent, 'completedTasksCount' | 'status'>) => {
    const created = agentRegistry.registerCustomAgent(newAgent);
    setAgents(prev => [...prev, created]);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500/20 selection:text-amber-200">
      
      {/* Top Bar Contract adhering to Section 2 */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeProject={activeProject}
        userProfile={userProfile}
        onOpenUserModal={() => setUserModalOpen(true)}
        onRunWorkflow={handleRunWorkflow}
        isWorkflowRunning={isWorkflowRunning}
        hasApiKey={hasApiKey}
      />

      {/* Main Viewport Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        
        {activeTab === 'room' && (
          <AgentRoom
            agents={agents}
            activeProject={activeProject}
            onSelectAgent={(agentId) => {
              setActiveTab('agents');
            }}
            onSendMessageToAgent={handleSendMessageToAgent}
            onRunWorkflowStage={handleRunWorkflowStage}
            isWorkflowRunning={isWorkflowRunning}
          />
        )}

        {activeTab === 'maestro' && (
          <MaestroConsole
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isAiResponding}
            agents={agents}
            activeProject={activeProject}
          />
        )}

        {activeTab === 'project' && (
          <ProjectWorkspace
            project={activeProject}
            agents={agents}
            onRunWorkflow={handleRunWorkflow}
            isWorkflowRunning={isWorkflowRunning}
          />
        )}

        {activeTab === 'agents' && (
          <AgentTeamView
            agents={agents}
            activeProject={activeProject}
            onOpenNewAgentModal={() => setNewAgentModalOpen(true)}
            onDispatchTask={(agentId) => {
              setActiveTab('maestro');
            }}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryHub
            memories={memories}
            onAddMemory={handleAddMemory}
          />
        )}

        {activeTab === 'tools' && (
          <ToolMatrix
            agents={agents}
          />
        )}

      </main>

      {/* Modals */}
      <UserAccountModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={(updated) => setUserProfile(updated)}
        hasApiKey={hasApiKey}
      />

      <NewAgentModal
        isOpen={newAgentModalOpen}
        onClose={() => setNewAgentModalOpen(false)}
        onAddAgent={handleAddAgent}
      />

    </div>
  );
}
