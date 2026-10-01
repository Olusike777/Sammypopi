import { Agent, PermissionAction, PermissionScope } from '../types/orchestration';
import { agentRegistry } from './agentRegistry';
import { modelRouter } from './modelRouter';
import { memoryService } from './memoryService';
import { projectState } from './projectState';
import { ModelRequest, ModelResponse } from './providers/providerTypes';

export interface AgentTaskExecutionOptions {
  agentId: string;
  taskId: string;
  projectId: string;
  objective: string;
  actionRequired: PermissionAction;
  scopeRequired: PermissionScope;
  input?: unknown;
  context?: Record<string, unknown>;
  responseFormat?: 'json' | 'text';
  timeoutMs?: number;
  onFallback?: (from: string, to: string, reason: string) => void;
}

export interface AgentTaskExecutionResult {
  taskId: string;
  agentId: string;
  provider: string;
  model: string;
  status: 'completed' | 'failed';
  resultText: string;
  structuredOutput?: unknown;
  usage?: {
    totalTokens?: number;
    latencyMs?: number;
  };
  error?: string;
}

export class AgentRuntime {
  /**
   * Executes a task for a given agent adhering to Section 9:
   * 1. Load agent
   * 2. Validate agent exists
   * 3. Validate permissions (Section 16)
   * 4. Load model policy
   * 5. Resolve provider/model via ModelRouter
   * 6. Construct system instruction + personality
   * 7. Targeted memory retrieval (Section 29)
   * 8. Pass prior outputs from project state
   * 9. Execute model call with fallback
   * 10. Update project state & return result
   */
  public async runAgentTask(options: AgentTaskExecutionOptions): Promise<AgentTaskExecutionResult> {
    const {
      agentId,
      taskId,
      projectId,
      objective,
      actionRequired,
      scopeRequired,
      input,
      context,
      responseFormat = 'json',
      timeoutMs,
      onFallback,
    } = options;

    const agent = agentRegistry.getAgent(agentId);
    if (!agent) {
      throw new Error(`AgentRuntime: Agent "${agentId}" does not exist in registry.`);
    }

    // Section 16: Strict Backend Permission Enforcement
    const isAllowed = agentRegistry.hasPermission(agentId, actionRequired, scopeRequired);
    if (!isAllowed) {
      const err = `SECURITY ERROR: Agent "${agent.name}" is unauthorized for action "${actionRequired}" on scope "${scopeRequired}".`;
      throw new Error(err);
    }

    // Mark agent status
    agentRegistry.updateAgentStatus(agentId, 'working', taskId);

    // Section 29: Targeted memory retrieval
    const relevantMemory = memoryService.getRelevantContext(agentId, projectId);

    // Retrieve current project state context
    const currentProject = projectState.getProject(projectId);
    const priorDeliverables = currentProject.tasks
      .filter(t => t.status === 'completed' && t.deliverable)
      .map(t => `[COMPLETED TASK by ${t.assignedAgentId}]: ${t.title}\n${t.deliverable?.summary || ''}\n${t.deliverable?.content || ''}`)
      .join('\n\n');

    // Build comprehensive system instruction embedding role, personality, and constitution
    const systemPrompt = `${agent.systemInstruction}

PERSONALITY DIRECTIVES:
- Communication style: ${agent.personality.communicationStyle}
- Core priorities: ${agent.personality.priorities.join('; ')}
- Reasoning perspective: ${agent.personality.reasoningPerspective}

RELEVANT WORKSPACE MEMORY & CONSTRAINTS:
${relevantMemory || 'Standard workspace guidelines apply.'}

DESIGN CONSTITUTION MANDATES:
1. Zero-pill discipline: NEVER wrap status/metadata in rounded capsule pill badges. Use unboxed text with dot bullets (·).
2. 60-30-10 color discipline: 60% basalt canvas (#0A0A0C), 30% limestone surfaces (#16161A), 10% warm travertine (#D4A373).
3. 2+1 font rule: at most 2 font families + 1 monospace outlier for metrics with tabular-nums.
4. WCAG AA accessible contrast: >= 4.5:1 minimum on all interactive elements.
5. No single-word headline orphans: enforce balanced text wrap.`;

    const userMessageContent = `TASK OBJECTIVE: ${objective}

PROJECT CONTEXT:
- Project Name: ${currentProject.name}
- Project Objective: ${currentProject.objective}
- Project Requirements: ${currentProject.requirements.join(' | ')}

PRIOR WORK DELIVERABLES:
${priorDeliverables || 'Initiating project sequence.'}

SPECIFIC TASK INPUT:
${input ? JSON.stringify(input, null, 2) : 'None'}

ADDITIONAL CONTEXT:
${context ? JSON.stringify(context, null, 2) : 'None'}

Deliver your structured specialist response in accordance with workspace standards.`;

    const modelRequest: ModelRequest = {
      systemInstruction: systemPrompt,
      messages: [{ role: 'user', content: userMessageContent }],
      temperature: 0.3,
      responseFormat: responseFormat === 'json' ? { type: 'json' } : { type: 'text' },
      timeoutMs: timeoutMs || agent.modelPolicy.timeoutMs || 40000,
      metadata: {
        agentId,
        taskId,
        projectId,
      },
    };

    try {
      const response: ModelResponse = await modelRouter.executeWithFallback(
        agent.modelPolicy,
        modelRequest,
        (from, to, reason) => {
          if (onFallback) {
            onFallback(from.provider, to.provider, reason);
          }
        }
      );

      // Update active model metadata on agent
      agentRegistry.updateAgentModelInfo(agentId, response.provider, response.model);
      agentRegistry.updateAgentStatus(agentId, 'completed');

      return {
        taskId,
        agentId,
        provider: response.provider,
        model: response.model,
        status: 'completed',
        resultText: response.text,
        structuredOutput: response.structuredOutput,
        usage: {
          totalTokens: response.usage?.totalTokens,
          latencyMs: response.latencyMs,
        },
      };
    } catch (err: any) {
      agentRegistry.updateAgentStatus(agentId, 'error');
      return {
        taskId,
        agentId,
        provider: agent.modelPolicy.primary.provider,
        model: agent.modelPolicy.primary.model,
        status: 'failed',
        resultText: '',
        error: err.message || String(err),
      };
    }
  }
}

export const agentRuntime = new AgentRuntime();
