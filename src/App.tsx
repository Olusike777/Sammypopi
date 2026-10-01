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
  AgentDiscussionMessage,
  OrchestrationEvent 
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
  const [runtimeEvents, setRuntimeEvents] = useState<OrchestrationEvent[]>([]);

  // Modals
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newAgentModalOpen, setNewAgentModalOpen] = useState(false);

  // Chat with Maestro
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'sammypopi',
      content: `Welcome to the atelier, Alamu. I am Sammypopi, your Maestro.

I'm your primary conversational AI partner and orchestrator. We can converse naturally, brainstorm creative angles, answer questions about design systems and typography, or assemble our specialist team whenever you want to build or audit a landing page.

What would you like to explore today?`,
      timestamp: new Date().toISOString(),
      intent: 'greeting',
      requiresTeam: false,
      suggestedPrompts: [
        'What makes this atelier different from a chatbot?',
        'Brainstorm ideas for Apex Studio’s portfolio',
        'Explain our anti-slop rules & zero-pill discipline',
        'Assemble the team to build our landing page',
      ],
    },
  ]);

  // Check backend server status
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data.providers?.gemini?.available || data.providers?.openai?.available || data.providers?.anthropic?.available) {
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

    // Set Sammypopi status to working (Maestro is reasoning)
    setAgents(prev => prev.map(a => a.isMaestro ? { ...a, status: 'working' } : a));

    // Construct conversation history for context (last 8 messages)
    const recentHistory = messages.slice(-8).map(m => ({
      role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: recentHistory,
          projectId: activeProject.id,
          tool: options?.tool,
        }),
      });

      const data = await response.json();

      const maestroReply: ChatMessage = {
        id: `msg_m_${Date.now()}`,
        sender: 'sammypopi',
        content: data.response || "I'm here with you. What direction shall we explore?",
        timestamp: new Date().toISOString(),
        intent: data.intent,
        requiresTeam: data.requiresTeam,
        requiresProjectMutation: data.requiresProjectMutation,
        nextAction: data.nextAction,
        suggestedPrompts: data.suggestedPrompts,
        orchestrationData: data.requiresTeam && data.delegationPlan ? {
          subtasksPlanned: data.delegationPlan.delegatedTasks?.map((t: any) => ({
            agentId: t.agentId,
            task: t.taskTitle || t.description,
          })) || [],
          delegatedTo: data.delegationPlan.delegatedTasks?.map((t: any) => t.agentId) || [],
          critiqueInvolved: true,
          synthesisReady: true,
        } : undefined,
      };

      setMessages(prev => [...prev, maestroReply]);

      // Add inter-agent discussion based on debate ONLY if requiresTeam is true
      if (data.requiresTeam && data.delegationPlan?.anticipatedDebate) {
        const debateMsg: AgentDiscussionMessage = {
          id: `disc_${Date.now()}`,
          projectId: activeProject.id,
          senderAgentId: 'samuel',
          recipientAgentId: 'samsonite',
          content: data.delegationPlan.anticipatedDebate,
          type: 'critique',
          timestamp: new Date().toISOString(),
        };

        setActiveProject(prev => ({
          ...prev,
          discussions: [debateMsg, ...prev.discussions],
        }));
      }

      // If team execution is explicitly requested by user or Maestro, trigger workflow
      if (data.requiresTeam && data.nextAction === 'start_landing_page_workflow') {
        handleRunWorkflow(content);
      }

    } catch (err) {
      const fallbackReply: ChatMessage = {
        id: `msg_m_${Date.now()}`,
        sender: 'sammypopi',
        content: "I'm here with you. What direction shall we explore?",
        timestamp: new Date().toISOString(),
        intent: 'casual_conversation',
        requiresTeam: false,
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsAiResponding(false);
      setAgents(prev => prev.map(a => a.isMaestro ? { ...a, status: 'idle' } : a));
    }
  };

  // Section 10 & 14: Real multi-agent workflow execution via backend /api/runs
  const handleRunWorkflow = async (customPrompt?: string) => {
    if (isWorkflowRunning) return;
    setIsWorkflowRunning(true);
    setRuntimeEvents([]);

    // Mark maestro active
    setAgents(prev => prev.map(a => a.isMaestro ? { ...a, status: 'working' } : a));

    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProject.id,
          prompt: customPrompt || 'Execute full architectural atelier sprint for Apex Studio: research, assets, wireframe, typography, and strict QC critique.',
        }),
      });

      const summary = await res.json();
      const events: OrchestrationEvent[] = summary.events || [];
      setRuntimeEvents(events);

      // Reflect final state
      setActiveProject(prev => ({
        ...prev,
        workflowStage: 'final_ready',
        status: summary.status === 'completed' ? 'completed' : 'review',
      }));

      // Update agents list with updated statuses & models
      setAgents(agentRegistry.getAllAgents().map(a => ({ ...a, status: 'idle' })));

      // Add completion message from Maestro to chat
      setMessages(prev => [
        ...prev,
        {
          id: `msg_wf_${Date.now()}`,
          sender: 'sammypopi',
          content: summary.finalSynthesis || `Autonomous workflow completed with ${summary.revisionLoopsCount} revision iterations. Deliverable verified and ready for review.`,
          timestamp: new Date().toISOString(),
          orchestrationData: {
            synthesisReady: true,
          },
        },
      ]);
    } catch (err) {
      console.error('Failed to run workflow:', err);
    } finally {
      setIsWorkflowRunning(false);
      setAgents(prev => prev.map(a => ({ ...a, status: 'idle' })));
    }
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
  const handleAddMemory = async (memoryData: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memoryData),
      });
      const saved = await res.json();
      setMemories(prev => [saved, ...prev]);
    } catch {
      const fallbackMem: MemoryItem = {
        ...memoryData,
        id: `mem_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMemories(prev => [fallbackMem, ...prev]);
    }
  };

  // Add new agent
  const handleAddAgent = (newAgent: Omit<Agent, 'completedTasksCount' | 'status'>) => {
    const created = agentRegistry.registerCustomAgent(newAgent);
    setAgents(prev => [...prev, created]);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500/20 selection:text-amber-200">
      
      {/* Top Bar Contract */}
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
            onSelectAgent={() => {
              setActiveTab('agents');
            }}
            onSendMessageToAgent={handleSendMessageToAgent}
            onRunWorkflowStage={handleRunWorkflowStage}
            isWorkflowRunning={isWorkflowRunning}
            runtimeEvents={runtimeEvents}
          />
        )}

        {activeTab === 'maestro' && (
          <MaestroConsole
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isAiResponding}
            agents={agents}
            activeProject={activeProject}
            onRunWorkflow={() => handleRunWorkflow()}
            isWorkflowRunning={isWorkflowRunning}
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
            onDispatchTask={() => {
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
