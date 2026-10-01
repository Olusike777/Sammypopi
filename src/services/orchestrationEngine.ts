import { OrchestrationEvent, OrchestrationEventType, Project, AgentTask } from '../types/orchestration';
import { agentRuntime } from './agentRuntime';
import { projectState } from './projectState';
import { agentRegistry } from './agentRegistry';

export interface WorkflowOptions {
  projectId: string;
  userPrompt?: string;
  maxRevisions?: number;
  onEvent?: (event: OrchestrationEvent) => void;
}

export interface WorkflowRunSummary {
  runId: string;
  projectId: string;
  status: 'completed' | 'revision_limit_reached' | 'failed' | 'cancelled';
  stagesCompleted: string[];
  revisionLoopsCount: number;
  events: OrchestrationEvent[];
  finalSynthesis?: string;
  error?: string;
}

export class OrchestrationEngine {
  private activeRuns: Map<string, { cancelled: boolean }> = new Map();
  private maxRevisionsDefault = parseInt(process.env.MAX_AGENT_REVISIONS || '3', 10);

  public cancelRun(runId: string): void {
    const run = this.activeRuns.get(runId);
    if (run) {
      run.cancelled = true;
    }
  }

  /**
   * Executes the full multi-agent orchestration sequence:
   * 1. Maestro decomposes brief & builds plan
   * 2. Samsmith (Research) + Samkindle (Visuals) concurrently
   * 3. Samsonite (Landing-Page Architecture)
   * 4. Sammy (Typography Polish)
   * 5. Samuel (QC & Anti-Slop Audit)
   * 6. Real Samsonite <-> Samuel revision loop (max N iterations)
   * 7. Maestro final synthesis
   */
  public async executeWorkflow(options: WorkflowOptions): Promise<WorkflowRunSummary> {
    const { projectId, userPrompt = 'Synthesize high-end landing page', maxRevisions = this.maxRevisionsDefault, onEvent } = options;
    const runId = `run_${Date.now()}`;
    this.activeRuns.set(runId, { cancelled: false });

    const events: OrchestrationEvent[] = [];
    const stagesCompleted: string[] = [];

    const emit = (type: OrchestrationEventType, message: string, meta?: Partial<OrchestrationEvent>) => {
      const ev: OrchestrationEvent = {
        id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        runId,
        type,
        message,
        timestamp: new Date().toISOString(),
        ...meta,
      };
      events.push(ev);
      if (onEvent) onEvent(ev);
    };

    const isCancelled = () => this.activeRuns.get(runId)?.cancelled ?? false;

    try {
      emit('workflow_started', `Orchestration run ${runId} started for project "${projectId}".`);

      // ==========================================
      // STEP 1: SAMMYPOPI (MAESTRO) PLANNING
      // ==========================================
      if (isCancelled()) throw new Error('Workflow was cancelled.');

      emit('agent_started', 'Sammypopi (Maestro) is deconstructing the project brief and crafting the orchestration plan...', {
        agentId: 'sammypopi',
      });

      const maestroPlan = await agentRuntime.runAgentTask({
        agentId: 'sammypopi',
        taskId: `task_plan_${Date.now()}`,
        projectId,
        objective: `Deconstruct user request: "${userPrompt}". Formulate strategic delegation plan for Samsmith, Samkindle, Samsonite, Sammy, and Samuel.`,
        actionRequired: 'create',
        scopeRequired: 'project:brief',
        onFallback: (from, to, reason) => {
          emit('provider_fallback', `Sammypopi provider fallback from ${from} to ${to}: ${reason}`, {
            agentId: 'sammypopi',
            provider: to,
          });
        },
      });

      emit('agent_completed', `Sammypopi completed orchestration plan. Dispatched subtasks to specialists.`, {
        agentId: 'sammypopi',
        provider: maestroPlan.provider,
        model: maestroPlan.model,
      });

      stagesCompleted.push('briefing');
      projectState.updateWorkflowStage(projectId, 'research');

      // ==========================================
      // STEP 2: SAMSMITH (RESEARCH) & SAMKINDLE (VISUALS)
      // Executed concurrently as independent preliminary inputs
      // ==========================================
      if (isCancelled()) throw new Error('Workflow was cancelled.');

      emit('agent_started', 'Samsmith researching contemporary architectural landing-page UX benchmarks...', {
        agentId: 'samsmith',
      });
      emit('agent_started', 'Samkindle curating 60-30-10 travertine palette & photographic assets...', {
        agentId: 'samkindle',
      });

      const [researchResult, visualsResult] = await Promise.all([
        agentRuntime.runAgentTask({
          agentId: 'samsmith',
          taskId: `task_res_${Date.now()}`,
          projectId,
          objective: 'Benchmark conversion patterns and content hierarchy for high-end boutique ateliers. Identify top UX drivers.',
          actionRequired: 'create',
          scopeRequired: 'project:research',
          onFallback: (from, to, reason) => {
            emit('provider_fallback', `Samsmith fallback from ${from} to ${to}: ${reason}`, { agentId: 'samsmith' });
          },
        }),
        agentRuntime.runAgentTask({
          agentId: 'samkindle',
          taskId: `task_vis_${Date.now()}`,
          projectId,
          objective: 'Curate domain-authentic visual asset tokens and 60-30-10 palette (Volcanic basalt, limestone, travertine). Strict anti-slop rules.',
          actionRequired: 'create',
          scopeRequired: 'project:assets',
          onFallback: (from, to, reason) => {
            emit('provider_fallback', `Samkindle fallback from ${from} to ${to}: ${reason}`, { agentId: 'samkindle' });
          },
        }),
      ]);

      emit('agent_completed', 'Samsmith delivered competitive research teardown.', {
        agentId: 'samsmith',
        provider: researchResult.provider,
        model: researchResult.model,
      });
      emit('agent_completed', 'Samkindle finalized 60-30-10 color tokens & visual assets.', {
        agentId: 'samkindle',
        provider: visualsResult.provider,
        model: visualsResult.model,
      });

      stagesCompleted.push('research', 'visual_curation');
      projectState.updateWorkflowStage(projectId, 'design_architecture');

      // ==========================================
      // STEP 3: SAMSONITE (LANDING PAGE DESIGN)
      // ==========================================
      if (isCancelled()) throw new Error('Workflow was cancelled.');

      emit('agent_started', 'Samsonite synthesizing wireframe layout blueprint and Bento monograph grid...', {
        agentId: 'samsonite',
      });

      let currentDesignResult = await agentRuntime.runAgentTask({
        agentId: 'samsonite',
        taskId: `task_design_${Date.now()}`,
        projectId,
        objective: 'Construct responsive 1440px single-elevation wireframe blueprint incorporating Samsmith’s research and Samkindle’s tokens.',
        actionRequired: 'create',
        scopeRequired: 'project:drafts',
        input: {
          research: researchResult.structuredOutput,
          visuals: visualsResult.structuredOutput,
        },
        onFallback: (from, to, reason) => {
          emit('provider_fallback', `Samsonite fallback from ${from} to ${to}: ${reason}`, { agentId: 'samsonite' });
        },
      });

      emit('agent_completed', 'Samsonite delivered initial layout architecture draft.', {
        agentId: 'samsonite',
        provider: currentDesignResult.provider,
        model: currentDesignResult.model,
      });

      stagesCompleted.push('design_architecture');
      projectState.updateWorkflowStage(projectId, 'typography_polish');

      // ==========================================
      // STEP 4: SAMMY (TYPOGRAPHY POLISH)
      // ==========================================
      if (isCancelled()) throw new Error('Workflow was cancelled.');

      emit('agent_started', 'Sammy calibrating 2+1 font pairings, tabular numerals, and optical kerning...', {
        agentId: 'sammy',
      });

      const typographyResult = await agentRuntime.runAgentTask({
        agentId: 'sammy',
        taskId: `task_type_${Date.now()}`,
        projectId,
        objective: 'Enforce the 2+1 font pairing rule, verify tabular-nums on architectural metrics, and audit headline text-wrap balance.',
        actionRequired: 'modify',
        scopeRequired: 'project:drafts',
        input: currentDesignResult.structuredOutput,
        onFallback: (from, to, reason) => {
          emit('provider_fallback', `Sammy fallback from ${from} to ${to}: ${reason}`, { agentId: 'sammy' });
        },
      });

      emit('agent_completed', 'Sammy applied typographic polish & optical scale ratios.', {
        agentId: 'sammy',
        provider: typographyResult.provider,
        model: typographyResult.model,
      });

      stagesCompleted.push('typography_polish');
      projectState.updateWorkflowStage(projectId, 'quality_control');

      // ==========================================
      // STEP 5 & 6: REAL SAMSONITE <-> SAMUEL REVISION LOOP
      // ==========================================
      let revisionCount = 0;
      let reviewApproved = false;

      while (revisionCount < maxRevisions && !reviewApproved) {
        if (isCancelled()) throw new Error('Workflow was cancelled.');

        emit('review_started', `Samuel initiating quality audit (Pass ${revisionCount + 1}/${maxRevisions})...`, {
          agentId: 'samuel',
        });

        const reviewResult = await agentRuntime.runAgentTask({
          agentId: 'samuel',
          taskId: `task_qc_${Date.now()}_r${revisionCount}`,
          projectId,
          objective: 'Inspect layout against the design constitution: check for banned pill badges, headline orphans, contrast ratio >= 4.5:1, and alignment with brief.',
          actionRequired: 'create',
          scopeRequired: 'project:critique',
          input: {
            designDraft: currentDesignResult.structuredOutput,
            typography: typographyResult.structuredOutput,
            revisionNumber: revisionCount,
          },
          onFallback: (from, to, reason) => {
            emit('provider_fallback', `Samuel fallback from ${from} to ${to}: ${reason}`, { agentId: 'samuel' });
          },
        });

        const structuredReview: any = reviewResult.structuredOutput || {};
        const isApproved = structuredReview.status === 'approved' || (structuredReview.issues && structuredReview.issues.length === 0);

        if (isApproved) {
          reviewApproved = true;
          emit('approval_received', `Samuel has approved the design deliverable. Quality standards satisfied.`, {
            agentId: 'samuel',
            provider: reviewResult.provider,
            model: reviewResult.model,
          });
          break;
        }

        // Revision is required!
        revisionCount++;
        emit('revision_requested', `Samuel requested revisions: ${structuredReview.issues?.join('; ') || 'Anti-slop adjustments needed.'}`, {
          agentId: 'samuel',
          provider: reviewResult.provider,
          model: reviewResult.model,
        });

        if (revisionCount >= maxRevisions) {
          emit('workflow_started', `Maximum revision loops (${maxRevisions}) reached. Handing unresolved items to Maestro.`, {
            agentId: 'sammypopi',
          });
          break;
        }

        // Dispatch revision task back to Samsonite
        emit('revision_started', `Samsonite applying requested revisions from Samuel (Iteration ${revisionCount})...`, {
          agentId: 'samsonite',
        });

        currentDesignResult = await agentRuntime.runAgentTask({
          agentId: 'samsonite',
          taskId: `task_rev_${Date.now()}_${revisionCount}`,
          projectId,
          objective: `Address Samuel's critique feedback: ${structuredReview.requestedChanges?.join(' | ') || 'Fix pill badges and metadata.'}`,
          actionRequired: 'modify',
          scopeRequired: 'project:drafts',
          input: {
            critique: structuredReview,
            previousDraft: currentDesignResult.structuredOutput,
          },
          onFallback: (from, to, reason) => {
            emit('provider_fallback', `Samsonite revision fallback from ${from} to ${to}: ${reason}`, { agentId: 'samsonite' });
          },
        });

        emit('agent_completed', `Samsonite submitted revision #${revisionCount} for re-review.`, {
          agentId: 'samsonite',
          provider: currentDesignResult.provider,
          model: currentDesignResult.model,
        });
      }

      stagesCompleted.push('quality_control');
      projectState.updateWorkflowStage(projectId, 'maestro_synthesis');

      // ==========================================
      // STEP 7: SAMMYPOPI (MAESTRO) FINAL SYNTHESIS
      // ==========================================
      if (isCancelled()) throw new Error('Workflow was cancelled.');

      emit('agent_started', 'Sammypopi synthesizing finished deliverable for user presentation...', {
        agentId: 'sammypopi',
      });

      const finalSynthesisResponse = await agentRuntime.runAgentTask({
        agentId: 'sammypopi',
        taskId: `task_synth_${Date.now()}`,
        projectId,
        objective: 'Review entire completed workspace pipeline. Synthesize executive overview and confirm deliverable readiness.',
        actionRequired: 'create',
        scopeRequired: 'project:deliverables',
        responseFormat: 'text',
        onFallback: (from, to, reason) => {
          emit('provider_fallback', `Sammypopi synthesis fallback from ${from} to ${to}: ${reason}`, { agentId: 'sammypopi' });
        },
      });

      stagesCompleted.push('maestro_synthesis', 'final_ready');
      projectState.updateWorkflowStage(projectId, 'final_ready');

      const synthesisText = finalSynthesisResponse.resultText || 'Atelier sprint concluded with validated deliverables.';

      emit('workflow_completed', 'Multi-agent orchestration workflow completed successfully.', {
        agentId: 'sammypopi',
        provider: finalSynthesisResponse.provider,
        model: finalSynthesisResponse.model,
      });

      return {
        runId,
        projectId,
        status: reviewApproved ? 'completed' : 'revision_limit_reached',
        stagesCompleted,
        revisionLoopsCount: revisionCount,
        events,
        finalSynthesis: synthesisText,
      };

    } catch (err: any) {
      emit('task_failed', `Workflow execution halted: ${err.message || String(err)}`);
      return {
        runId,
        projectId,
        status: isCancelled() ? 'cancelled' : 'failed',
        stagesCompleted,
        revisionLoopsCount: 0,
        events,
        error: err.message || String(err),
      };
    } finally {
      this.activeRuns.delete(runId);
    }
  }
}

export const orchestrationEngine = new OrchestrationEngine();
