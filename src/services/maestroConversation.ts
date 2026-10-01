import { MaestroConversationResult, MaestroIntent, Project } from '../types/orchestration';
import { agentRegistry } from './agentRegistry';
import { modelRouter } from './modelRouter';
import { memoryService } from './memoryService';
import { projectState } from './projectState';
import { ModelRequest, ModelResponse } from './providers/providerTypes';

export interface ConverseParams {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  projectId?: string;
  tool?: string;
}

export class MaestroConversationService {
  /**
   * Primary Conversational Entry Point for Sammypopi (Maestro).
   * Evaluates user intent, converses naturally, and strictly gates
   * team activation so specialist agents are only invoked for actual project work.
   */
  public async converse(params: ConverseParams): Promise<MaestroConversationResult> {
    const { message, history = [], projectId = 'proj_apex_01', tool } = params;

    const maestro = agentRegistry.getAgent('sammypopi');
    if (!maestro) {
      throw new Error('Maestro (sammypopi) agent is not registered.');
    }

    const currentProject = projectState.getProject(projectId);
    const relevantMemory = memoryService.getRelevantContext('sammypopi', projectId);

    const systemInstruction = `You are Sammypopi (the Maestro), the user's primary conversational AI partner and executive atelier orchestrator.

YOUR DUAL ROLE:
1. PRIMARY ROLE — CONVERSATIONAL AI:
   You are an intelligent, articulate, charismatic, and knowledgeable design director and AI conversationalist.
   You converse naturally and directly with the user. You greet warmly, answer complex questions about UI/UX, typography, design history, layout systems, conversion mechanics, and brand identity. You brainstorm fresh angles, discuss ideas, ask probing clarifying questions, challenge weak assumptions respectfully, and maintain multi-turn context.

2. SECONDARY ROLE — WORKSPACE ORCHESTRATOR:
   You lead a team of 5 specialized agents:
   - Samsmith: Research & UX Intelligence (competitor teardowns, benchmarks)
   - Samkindle: Visual Assets & Palette (textures, imagery, color tokens)
   - Samsonite: Landing Page Architect (wireframes, bento grids, structural math)
   - Sammy: Typography & Polish (font pairings, rhythm, tabular numerals)
   - Samuel: Quality Control & Critic (anti-slop audit, WCAG AA, zero-pill discipline)

CRITICAL EXECUTION GATING RULES:
- DO NOT activate the specialist team for greetings, questions, brainstorming, casual banter, or general discussions.
- NEVER say "I have aligned the specialists" or "The team has been dispatched" when having a normal conversation, answering a question, or greeting the user.
- Answer conversational queries directly as Maestro.
- ONLY set "requiresTeam": true when the user clearly intends to create, build, modify, or audit a landing page/portfolio, or explicitly commands the team to execute work.

INTENT CLASSIFICATION TAXONOMY:
Classify the user's latest message into exactly ONE of these categories:
- "greeting": Hello, hi, good morning, what's up, etc.
- "casual_conversation": Friendly banter, personal questions, compliments, or general chatter.
- "question": Informational query (e.g. "What is anti-slop?", "Why use a bento grid?", "How do font scales work?").
- "brainstorming": Exploring ideas, creative concepts, visual directions, or angles.
- "project_discussion": Talking about the current project (${currentProject.name}), discussing goals, strategy, or scope.
- "requirements_clarification": Refining specific details, features, audience, or aesthetic boundaries.
- "create_landing_page": Clear intent to build, generate, or construct a new landing page or portfolio.
- "modify_landing_page": Specific request to alter existing layout, copy, or components.
- "review_landing_page": Request for quality audit, critique, anti-slop inspection, or review.
- "other_action": Explicit command for another system action or tool invocation.

CURRENT WORKSPACE CONTEXT:
- Active Project: ${currentProject.name}
- Project Objective: ${currentProject.objective}
- Project Requirements: ${currentProject.requirements.join(' | ')}
- Workspace Memory: ${relevantMemory || 'Clean workspace.'}
${tool ? `- Active Tool Focus: ${tool}` : ''}

OUTPUT FORMAT REQUIREMENTS:
You MUST respond with valid JSON matching this schema:
{
  "intent": "<one of the 10 intents above>",
  "requiresTeam": boolean (true ONLY if actual project work or team execution is needed; FALSE for greeting/question/brainstorming/discussion),
  "requiresProjectMutation": boolean (true only if project files or stages should change),
  "response": "<your articulate, conversational, natural response to the user. Speak as Maestro. DO NOT output JSON or meta-instructions here>",
  "nextAction": "<'start_landing_page_workflow' | 'review_landing_page' | 'modify_layout' | null>",
  "suggestedPrompts": ["<optional 2-3 short follow-up prompts the user might say next>"],
  "delegationPlan": {
    "summary": "<summary of delegation if requiresTeam is true, else omit>",
    "delegatedTasks": [
      { "agentId": "samsmith", "taskTitle": "...", "priority": "high" },
      { "agentId": "samkindle", "taskTitle": "...", "priority": "high" },
      { "agentId": "samsonite", "taskTitle": "...", "priority": "high" },
      { "agentId": "sammy", "taskTitle": "...", "priority": "medium" },
      { "agentId": "samuel", "taskTitle": "...", "priority": "critical" }
    ],
    "anticipatedDebate": "<potential creative point of debate between specialists>"
  }
}
If requiresTeam is false, "delegationPlan" must be null.`;

    // Construct multi-turn messages including recent conversation history
    const modelMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Include last 8 history items for natural conversation context
    const recentHistory = history.slice(-8);
    for (const h of recentHistory) {
      modelMessages.push({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content,
      });
    }

    // Add current user message
    modelMessages.push({
      role: 'user',
      content: message,
    });

    const modelRequest: ModelRequest = {
      systemInstruction,
      messages: modelMessages,
      temperature: 0.5,
      responseFormat: { type: 'json' },
      timeoutMs: maestro.modelPolicy.timeoutMs || 40000,
      metadata: {
        agentId: 'sammypopi',
        projectId,
      },
    };

    try {
      const response: ModelResponse = await modelRouter.executeWithFallback(
        maestro.modelPolicy,
        modelRequest
      );

      let parsed: any = response.structuredOutput;

      if (!parsed && response.text) {
        try {
          // Clean possible markdown code fences
          let cleaned = response.text.trim();
          if (cleaned.startsWith('```json')) {
            cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          parsed = JSON.parse(cleaned);
        } catch {
          // Fallback parsing: extract response text if not pure JSON
          parsed = {
            intent: this.inferIntentHeuristic(message),
            requiresTeam: false,
            requiresProjectMutation: false,
            response: response.text,
            nextAction: null,
          };
        }
      }

      if (!parsed || typeof parsed !== 'object') {
        parsed = this.buildDeterministicResponse(message, currentProject);
      }

      // Sanitize fields
      const intent: MaestroIntent = this.validateIntent(parsed.intent);
      const requiresTeam: boolean = Boolean(parsed.requiresTeam && intent !== 'greeting' && intent !== 'casual_conversation' && intent !== 'question');
      const requiresProjectMutation: boolean = Boolean(parsed.requiresProjectMutation && requiresTeam);

      let cleanResponse = (parsed.response || '').trim();
      if (!cleanResponse) {
        cleanResponse = parsed.summary || parsed.executiveMessage || `I'm here with you. What direction shall we explore?`;
      }

      return {
        intent,
        requiresTeam,
        requiresProjectMutation,
        response: cleanResponse,
        nextAction: requiresTeam ? (parsed.nextAction || 'start_landing_page_workflow') : null,
        suggestedPrompts: Array.isArray(parsed.suggestedPrompts) ? parsed.suggestedPrompts : undefined,
        delegationPlan: requiresTeam && parsed.delegationPlan ? parsed.delegationPlan : undefined,
      };

    } catch (err: any) {
      console.warn('[MaestroConversation] Model execution error, falling back gracefully:', err.message);
      return this.buildDeterministicResponse(message, currentProject);
    }
  }

  private validateIntent(rawIntent: any): MaestroIntent {
    const validIntents: MaestroIntent[] = [
      'casual_conversation',
      'greeting',
      'question',
      'brainstorming',
      'project_discussion',
      'requirements_clarification',
      'create_landing_page',
      'modify_landing_page',
      'review_landing_page',
      'other_action',
    ];
    if (validIntents.includes(rawIntent)) {
      return rawIntent;
    }
    return 'casual_conversation';
  }

  private inferIntentHeuristic(text: string): MaestroIntent {
    const lower = text.toLowerCase().trim();
    if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|yo|greetings|howdy)\b/i.test(lower)) {
      return 'greeting';
    }
    if (/(build|create|generate|start\s*workflow|run\s*team|deploy)\b/i.test(lower)) {
      return 'create_landing_page';
    }
    if (/(audit|review|critique|inspect|anti-slop|wcag)\b/i.test(lower)) {
      return 'review_landing_page';
    }
    if (/(brainstorm|ideas|concept|what\s*if|suggest|vibe|direction)\b/i.test(lower)) {
      return 'brainstorming';
    }
    if (/(what\s*is|how\s*does|why|who|explain|tell\s*me\s*about|\?)/i.test(lower)) {
      return 'question';
    }
    return 'casual_conversation';
  }

  private buildDeterministicResponse(message: string, project: Project): MaestroConversationResult {
    const intent = this.inferIntentHeuristic(message);

    switch (intent) {
      case 'greeting':
        return {
          intent: 'greeting',
          requiresTeam: false,
          requiresProjectMutation: false,
          response: `Hey! Good to see you. I'm Sammypopi, your Maestro. What are we brainstorming or designing today?`,
          nextAction: null,
          suggestedPrompts: [
            'Tell me about the Apex Studio project',
            'What design principles guide our atelier?',
            'Brainstorm ideas for our architectural portfolio',
          ],
        };

      case 'question':
        return {
          intent: 'question',
          requiresTeam: false,
          requiresProjectMutation: false,
          response: `In our atelier, we design with uncompromising anti-slop discipline: 60% basalt canvas, 30% limestone tactile surfaces, and 10% warm travertine accent. We reject decorative rounded pill tags in favor of clean unboxed typography with dot separators. What specific aspect would you like to explore deeper?`,
          nextAction: null,
          suggestedPrompts: [
            'How do the specialist agents collaborate?',
            'What is Samuel’s role in quality control?',
            'Can we see the current design draft?',
          ],
        };

      case 'brainstorming':
        return {
          intent: 'brainstorming',
          requiresTeam: false,
          requiresProjectMutation: false,
          response: `I like where your head is at. For ${project.name.split('—')[0]}, we could lean into monolithic typography with a stark, architectural single-elevation scroll, or introduce high-contrast tactile bento layouts that highlight material textures. Which direction resonates more with your vision?`,
          nextAction: null,
          suggestedPrompts: [
            'Let’s go with monolithic single-elevation',
            'Tell me how Samsmith would research competitors',
            'Assemble the specialists to build this out',
          ],
        };

      case 'project_discussion':
      case 'requirements_clarification':
        return {
          intent,
          requiresTeam: false,
          requiresProjectMutation: false,
          response: `We're currently focused on "${project.name}". Our core objective is ${project.objective.toLowerCase()}. We have 5 specialist stations standing by in the atelier whenever we're ready for concrete production work. What would you like to refine first?`,
          nextAction: null,
          suggestedPrompts: [
            'Review our current wireframe',
            'Refine the hero headline',
            'Start the multi-agent production sequence',
          ],
        };

      case 'create_landing_page':
        return {
          intent: 'create_landing_page',
          requiresTeam: true,
          requiresProjectMutation: true,
          response: `Understood. I am assembling the specialist team to build out the landing page: Samsmith for intelligence, Samkindle for visual assets, Samsonite for architecture, Sammy for typography, and Samuel for anti-slop verification. Let's create something extraordinary.`,
          nextAction: 'start_landing_page_workflow',
          delegationPlan: {
            summary: `Maestro delegation sequence initialized for: "${message}"`,
            delegatedTasks: [
              { agentId: 'samsmith', taskTitle: 'Benchmark UX & High-End Portfolio Patterns', priority: 'high' },
              { agentId: 'samkindle', taskTitle: 'Curate Material Textures & Travertine Assets', priority: 'high' },
              { agentId: 'samsonite', taskTitle: 'Draft Single-Elevation 1440px Wireframe Blueprint', priority: 'high' },
              { agentId: 'sammy', taskTitle: 'Calibrate 2+1 Font Pairing & Tabular Figures', priority: 'medium' },
              { agentId: 'samuel', taskTitle: 'Perform Anti-Slop Audit & WCAG AA Contrast Inspection', priority: 'critical' },
            ],
            anticipatedDebate: 'Samuel is scheduled to scrutinize Samsonite’s spatial padding and enforce zero-pill discipline.',
          },
        };

      case 'review_landing_page':
        return {
          intent: 'review_landing_page',
          requiresTeam: true,
          requiresProjectMutation: false,
          response: `I'll have Samuel conduct a strict anti-slop audit across our current layout blueprints and typographic specimens to ensure zero single-word orphans, accessible contrast, and unboxed metadata.`,
          nextAction: 'review_landing_page',
          delegationPlan: {
            summary: `Design critique audit requested for: "${message}"`,
            delegatedTasks: [
              { agentId: 'samuel', taskTitle: 'Execute Anti-Slop & Design Constitution Audit', priority: 'critical' },
            ],
          },
        };

      default:
        return {
          intent: 'casual_conversation',
          requiresTeam: false,
          requiresProjectMutation: false,
          response: `I'm listening. As Maestro, I'm here to discuss design concepts, clarify objectives, or coordinate the atelier specialists whenever you're ready to build. How can I help?`,
          nextAction: null,
        };
    }
  }
}

export const maestroConversation = new MaestroConversationService();
