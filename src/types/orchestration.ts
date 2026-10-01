import { ModelPolicy, AIProviderId } from '../services/providers/providerTypes';

export type AgentStatus = 'idle' | 'working' | 'waiting' | 'reviewing' | 'completed' | 'error';

export type PermissionAction = 'read' | 'create' | 'modify' | 'send' | 'delete' | 'execute';

export type PermissionScope = 
  | 'project:brief'
  | 'project:research'
  | 'project:assets'
  | 'project:drafts'
  | 'project:critique'
  | 'project:deliverables'
  | 'web:search'
  | 'image:generate'
  | 'file:read'
  | 'file:write'
  | 'memory:user'
  | 'memory:project'
  | 'agent:message'
  | 'system:execute';

export interface AgentPermissions {
  read: PermissionScope[];
  create: PermissionScope[];
  modify: PermissionScope[];
  send: PermissionScope[];
  delete: PermissionScope[];
  execute: PermissionScope[];
}

export interface AgentPersonality {
  communicationStyle: string;
  priorities: string[];
  reasoningPerspective: string;
  strengths: string[];
  weaknesses: string[];
  relationshipToOthers: Record<string, string>;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'research' | 'design' | 'typography' | 'critique' | 'orchestration' | 'system';
  status: 'active' | 'configured' | 'planned';
  requiredAction: PermissionAction;
  requiredScope: PermissionScope;
  capabilities: string[];
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  tagline: string;
  avatar: string;
  color: string;
  accentBg: string;
  status: AgentStatus;
  isMaestro?: boolean;
  systemInstruction: string;
  personality: AgentPersonality;
  permissions: AgentPermissions;
  assignedTools: string[]; // Tool IDs
  modelPolicy: ModelPolicy; // Real multi-provider policy
  activeProvider?: AIProviderId;
  activeModel?: string;
  currentTaskId?: string;
  lastResult?: TaskResult;
  completedTasksCount: number;
}

export type TaskStatus = 
  | 'pending'
  | 'in_progress'
  | 'review_required'
  | 'revision_requested'
  | 'approved'
  | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskDeliverable {
  title: string;
  summary: string;
  content: string;
  format: 'markdown' | 'json' | 'code' | 'specs';
  metadata?: Record<string, any>;
}

export interface TaskCritique {
  reviewerId: string;
  reviewerName: string;
  feedback: string;
  approved: boolean;
  revisionRequired: boolean;
  score?: number;
  timestamp: string;
}

export interface AgentTask {
  id: string;
  projectId: string;
  assignedAgentId: string;
  assignedByAgentId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  stepIndex: number;
  workflowStage?: string;
  inputContext?: string;
  deliverable?: TaskDeliverable;
  critique?: TaskCritique;
  createdAt: string;
  completedAt?: string;
}

export interface TaskResult {
  taskId: string;
  agentId: string;
  agentName: string;
  summary: string;
  outputPreview: string;
  recommendations: string[];
  concerns?: string[];
  timestamp: string;
}

export interface AgentDiscussionMessage {
  id: string;
  projectId: string;
  senderAgentId: string;
  recipientAgentId?: string; // Optional target (e.g. Samuel to Samsonite)
  content: string;
  type: 'proposal' | 'critique' | 'agreement' | 'disagreement' | 'directive' | 'inquiry';
  timestamp: string;
  relatedTaskId?: string;
}

/**
 * Section 11: Structured Agent Message Protocol
 */
export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type:
    | 'task'
    | 'result'
    | 'question'
    | 'review'
    | 'revision_request'
    | 'approval'
    | 'status'
    | 'handoff';
  priority: 'low' | 'normal' | 'high' | 'critical';
  projectId: string;
  taskId: string;
  objective: string;
  input?: unknown;
  context?: unknown;
  evidence?: unknown;
  requestedAction?: string;
  output?: unknown;
  status:
    | 'pending'
    | 'working'
    | 'completed'
    | 'failed'
    | 'blocked'
    | 'revision_required'
    | 'approved';
  revisionNumber?: number;
  createdAt: string;
  completedAt?: string;
}

export interface ProjectAsset {
  id: string;
  title: string;
  category: 'image' | 'palette' | 'icon' | 'moodboard';
  url: string;
  description: string;
  attribution?: string;
  tags: string[];
  curatedByAgentId: string;
}

export interface ResearchItem {
  id: string;
  title: string;
  category: 'market' | 'typography' | 'layout' | 'competitor' | 'ux';
  insight: string;
  sourceUrl?: string;
  recommendedActions: string[];
  conductedByAgentId: string;
  confidence: 'high' | 'moderate' | 'exploratory';
}

export interface TypographySpec {
  displayFont: string;
  bodyFont: string;
  monoFont: string;
  scaleRatio: string;
  lineHeights: {
    display: string;
    body: string;
  };
  spacingRhythm: string;
  rationale: string;
  curatedByAgentId: string;
}

export interface DesignDraft {
  headline: string;
  subheadline: string;
  heroCta: string;
  secondaryCta: string;
  layoutStructure: string[];
  colorTokens: {
    canvas: string;
    surface: string;
    textPrimary: string;
    textMuted: string;
    accent: string;
    border: string;
  };
  sections: Array<{
    id: string;
    name: string;
    kicker?: string;
    heading: string;
    description: string;
    items?: string[];
  }>;
  designedByAgentId: string;
  version: number;
}

export interface ProjectDeliverable {
  id: string;
  title: string;
  type: 'landing_page' | 'design_spec' | 'copy_deck' | 'audit_report';
  status: 'draft' | 'reviewed' | 'final';
  content: string;
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  agentId: string;
  action: string;
  detail: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  objective: string;
  requirements: string[];
  status: 'planning' | 'in_progress' | 'review' | 'completed';
  workflowStage: 
    | 'briefing'
    | 'research'
    | 'visual_curation'
    | 'design_architecture'
    | 'typography_polish'
    | 'quality_control'
    | 'maestro_synthesis'
    | 'final_ready';
  tasks: AgentTask[];
  assets: ProjectAsset[];
  researchNotes: ResearchItem[];
  typographySpec: TypographySpec;
  designDraft: DesignDraft;
  discussions: AgentDiscussionMessage[];
  deliverables: ProjectDeliverable[];
  history: ActivityLogEntry[];
  createdAt: string;
  updatedAt: string;
}

export type MemoryCategory = 'user' | 'project' | 'agent' | 'conversation' | 'knowledge';

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  targetId?: string; // agentId or projectId
  tags: string[];
  importance: 'critical' | 'high' | 'normal' | 'low';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  preferences: {
    designAesthetic: 'editorial_minimal' | 'modern_saas' | 'warm_crafted' | 'high_contrast';
    communicationTone: 'executive_concise' | 'collaborative' | 'detailed_technical';
    theme: 'dark' | 'light' | 'system';
    autonomousApproval: boolean;
  };
}

export type MaestroIntent = 
  | 'casual_conversation'
  | 'greeting'
  | 'question'
  | 'brainstorming'
  | 'project_discussion'
  | 'requirements_clarification'
  | 'create_landing_page'
  | 'modify_landing_page'
  | 'review_landing_page'
  | 'other_action';

export interface MaestroConversationResult {
  intent: MaestroIntent;
  requiresTeam: boolean;
  requiresProjectMutation: boolean;
  response: string;
  nextAction: string | null;
  suggestedPrompts?: string[];
  delegationPlan?: {
    summary: string;
    delegatedTasks: Array<{
      agentId: string;
      taskTitle: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
    }>;
    anticipatedDebate?: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'sammypopi' | 'system';
  content: string;
  timestamp: string;
  intent?: MaestroIntent;
  requiresTeam?: boolean;
  requiresProjectMutation?: boolean;
  nextAction?: string | null;
  suggestedPrompts?: string[];
  orchestrationData?: {
    subtasksPlanned?: Array<{ agentId: string; task: string }>;
    delegatedTo?: string[];
    critiqueInvolved?: boolean;
    synthesisReady?: boolean;
  };
}

/**
 * Section 14: Real Event Stream definitions
 */
export type OrchestrationEventType = 
  | 'workflow_started'
  | 'task_created'
  | 'agent_started'
  | 'agent_message'
  | 'agent_completed'
  | 'review_started'
  | 'revision_requested'
  | 'revision_started'
  | 'approval_received'
  | 'provider_fallback'
  | 'task_failed'
  | 'workflow_completed'
  | 'workflow_cancelled';

export interface OrchestrationEvent {
  id: string;
  runId: string;
  type: OrchestrationEventType;
  agentId?: string;
  taskId?: string;
  provider?: string;
  model?: string;
  message: string;
  payload?: unknown;
  timestamp: string;
}
