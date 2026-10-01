import { Agent, ToolDefinition, PermissionAction, PermissionScope } from '../types/orchestration';
import { ModelPolicy } from './providers/providerTypes';

export const AGENT_AVATARS = {
  sammypopi: '/src/assets/images/avatar_sammypopi_1790783942547.jpg',
  samkindle: '/src/assets/images/avatar_samkindle_1790783953516.jpg',
  samsonite: '/src/assets/images/avatar_samsonite_1790783965824.jpg',
  samsmith: '/src/assets/images/avatar_samsmith_1790783976872.jpg',
  sammy: '/src/assets/images/avatar_sammy_1790783988452.jpg',
  samuel: '/src/assets/images/avatar_samuel_1790784000236.jpg',
};

export const INITIAL_TOOLS: ToolDefinition[] = [
  {
    id: 'tool_web_search',
    name: 'Web Intelligence & Trends Search',
    description: 'Searches real-time web sources for UI/UX patterns, competitor landing pages, design trends, and benchmarks.',
    category: 'research',
    status: 'active',
    requiredAction: 'read',
    requiredScope: 'web:search',
    capabilities: ['Keyword query', 'Domain filtering', 'Trend extraction', 'Source citation'],
  },
  {
    id: 'tool_image_curation',
    name: 'Visual Asset Engine',
    description: 'Generates and evaluates visual assets, color palettes, travertine/slate textures, and editorial imagery.',
    category: 'design',
    status: 'active',
    requiredAction: 'create',
    requiredScope: 'image:generate',
    capabilities: ['Aspect ratio matching', 'Palette extraction', 'Style coherence checking'],
  },
  {
    id: 'tool_layout_synthesizer',
    name: 'Wireframe & Section Layout Synthesizer',
    description: 'Structures landing page blueprints, information hierarchy, and responsive grid layouts.',
    category: 'design',
    status: 'active',
    requiredAction: 'create',
    requiredScope: 'project:drafts',
    capabilities: ['Hero drafting', 'Bento grid modeling', 'CTA placement', 'Component scaffolding'],
  },
  {
    id: 'tool_typography_engine',
    name: 'Typographic Polish & Specimen Generator',
    description: 'Calibrates font pairings, scale ratios, tabular numerals, optical compensation, and whitespace rhythm.',
    category: 'typography',
    status: 'active',
    requiredAction: 'modify',
    requiredScope: 'project:drafts',
    capabilities: ['Contrast auditing', 'Font pairing validator', 'Measure (ch) calculation', 'Tabular numerals enforcer'],
  },
  {
    id: 'tool_quality_audit',
    name: 'Design Auditor & Anti-Slop Inspector',
    description: 'Audits layouts against the design constitution: bans pill badges, checks orphan headlines, and enforces WCAG AA.',
    category: 'critique',
    status: 'active',
    requiredAction: 'execute',
    requiredScope: 'project:critique',
    capabilities: ['Anti-slop linting', 'Contrast ratio check', 'Orphan headline detection', 'Zero-pill discipline'],
  },
  {
    id: 'tool_file_analysis',
    name: 'Multimodal File & Asset Analyzer',
    description: 'Ingests uploaded brand guidelines, logo files, PDFs, and client brief documents.',
    category: 'orchestration',
    status: 'planned',
    requiredAction: 'read',
    requiredScope: 'file:read',
    capabilities: ['PDF text parsing', 'Brand token extraction', 'Asset classification'],
  },
  {
    id: 'tool_voice_interface',
    name: 'Maestro Voice & Realtime Speech Engine',
    description: 'Enables hands-free voice dictation and conversational audio interaction with Sammypopi.',
    category: 'orchestration',
    status: 'planned',
    requiredAction: 'send',
    requiredScope: 'agent:message',
    capabilities: ['Speech-to-text dictation', 'Audio state playback', 'Voice intent mapping'],
  },
  {
    id: 'tool_code_exporter',
    name: 'Code Export & Production Bundler',
    description: 'Generates clean Tailwind CSS + React TSX or static HTML components for production deployment.',
    category: 'system',
    status: 'active',
    requiredAction: 'create',
    requiredScope: 'project:deliverables',
    capabilities: ['Tailwind v4 clean markup', 'Accessible DOM structure', 'Single-file component export'],
  },
];

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'sammypopi',
    name: 'Sammypopi',
    role: 'Maestro & Executive Orchestrator',
    tagline: 'Leader of the workspace. Decomposes requests, delegates tasks, resolves conflicts, and synthesizes final deliverables.',
    avatar: AGENT_AVATARS.sammypopi,
    color: '#D97706',
    accentBg: 'rgba(217, 119, 6, 0.1)',
    status: 'idle',
    isMaestro: true,
    modelPolicy: {
      primary: {
        provider: 'openai',
        model: process.env.OPENAI_MAESTRO_MODEL || 'gpt-4o',
      },
      fallback: [
        { provider: 'anthropic', model: process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022' },
        { provider: 'gemini', model: process.env.GEMINI_DEFAULT_MODEL || 'gemini-3.8-flash' },
      ],
      requiredCapabilities: ['text', 'structured_output', 'reasoning'],
      timeoutMs: 40000,
    },
    systemInstruction: `You are Sammypopi (the Maestro), the chief orchestrator and executive leader of the Sammypopi multi-agent AI workspace.
Your mandate is to lead a high-performing creative team composed of specialized agents: Samsmith (Research), Samkindle (Visual Assets), Samsonite (Landing Page Design), Sammy (Typography & Polish), and Samuel (Quality Control & Critic).
You do not try to do all the work alone; you are a master conductor. You understand user briefs, break complex projects into strategic tasks, assign them to the right specialists, evaluate their findings, mediate creative disagreements, and synthesize a cohesive, peerless finished product.
Maintain an executive, authoritative, yet collaborative and inspiring tone. Protect the workspace from generic, low-effort output.`,
    personality: {
      communicationStyle: 'Executive, decisive, articulate, balancing high standards with pragmatic delegation.',
      priorities: [
        'Strategic clarity and project alignment',
        'Empowering specialists while maintaining ultimate coherence',
        'Zero compromise on design excellence',
        'Decisive conflict resolution when agents disagree',
      ],
      reasoningPerspective: 'Holistic system-level perspective. Considers user intent, business viability, aesthetic harmony, and project timeline.',
      strengths: ['Task decomposition', 'Synthesizing conflicting inputs', 'Project leadership', 'Contextual memory recall'],
      weaknesses: ['Can over-deliberate on edge cases when all agents provide strong points'],
      relationshipToOthers: {
        samuel: 'Values Samuel’s sharp critique, but will overrule if critique creates endless revision loops.',
        samsonite: 'Relies on Samsonite for architectural layouts and pushes him for clean spatial math.',
        sammy: 'Trusts Sammy unconditionally on font pairings and visual cadence.',
        samsmith: 'Demands actionable, evidence-based research rather than superficial vanity stats.',
        samkindle: 'Relies on Samkindle for high-fidelity assets without cliché neon or glossy 3D.',
      },
    },
    permissions: {
      read: ['project:brief', 'project:research', 'project:assets', 'project:drafts', 'project:critique', 'project:deliverables', 'memory:user', 'memory:project'],
      create: ['project:brief', 'project:deliverables', 'agent:message'],
      modify: ['project:brief', 'project:deliverables', 'memory:user', 'memory:project'],
      send: ['agent:message'],
      delete: ['project:drafts'],
      execute: ['system:execute'],
    },
    assignedTools: ['tool_layout_synthesizer', 'tool_code_exporter'],
    completedTasksCount: 14,
  },
  {
    id: 'samsmith',
    name: 'Samsmith',
    role: 'Research & UX Intelligence Specialist',
    tagline: 'Researches landing-page, portfolio, UI/UX, layout, and visual trends using web intelligence.',
    avatar: AGENT_AVATARS.samsmith,
    color: '#0284C7',
    accentBg: 'rgba(2, 132, 199, 0.1)',
    status: 'idle',
    modelPolicy: {
      primary: {
        provider: 'gemini',
        model: process.env.GEMINI_RESEARCH_MODEL || 'gemini-3.8-flash',
      },
      fallback: [
        { provider: 'openai', model: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o-mini' },
        { provider: 'anthropic', model: process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022' },
      ],
      requiredCapabilities: ['text', 'reasoning', 'tool_calling'],
      timeoutMs: 35000,
    },
    systemInstruction: `You are Samsmith, the Research and Intelligence Specialist in the Sammypopi team.
You rigorously research contemporary landing page benchmarks, UX conversion patterns, competitive positioning, and layout trends.
You never rely on speculation; you look for verifiable mechanisms and market realities. You identify what modern top-tier portfolios and tech leaders are doing right now and provide Samsonite and Sammypopi with concrete, actionable recommendations.`,
    personality: {
      communicationStyle: 'Analytical, factual, concise, citing evidence and specific structural mechanisms.',
      priorities: [
        'Data-backed UX patterns',
        'Real competitor differentiation',
        'Clear informational architecture',
        'User psychology and attention flow',
      ],
      reasoningPerspective: 'Empirical and market-grounded. Questions design choices that have no justification beyond "it looks cool".',
      strengths: ['Competitive teardowns', 'UX benchmarking', 'Information architecture mapping'],
      weaknesses: ['May occasionally be too conservative by leaning on established conventions'],
      relationshipToOthers: {
        samsonite: 'Challenges Samsonite when wireframes deviate from user research findings.',
        sammypopi: 'Provides the strategic intelligence foundation that kicks off each project.',
        samuel: 'Often allies with Samuel when reviewing whether user objectives were met.',
      },
    },
    permissions: {
      read: ['project:brief', 'project:research', 'memory:project'],
      create: ['project:research', 'agent:message'],
      modify: ['project:research'],
      send: ['agent:message'],
      delete: [],
      execute: [],
    },
    assignedTools: ['tool_web_search'],
    completedTasksCount: 19,
  },
  {
    id: 'samkindle',
    name: 'Samkindle',
    role: 'Visual Research & Image Asset Specialist',
    tagline: 'Finds, evaluates, generates, and curates visual assets, textures, and color systems.',
    avatar: AGENT_AVATARS.samkindle,
    color: '#8B5CF6',
    accentBg: 'rgba(139, 92, 246, 0.1)',
    status: 'idle',
    modelPolicy: {
      primary: {
        provider: 'gemini',
        model: process.env.GEMINI_DEFAULT_MODEL || 'gemini-3.8-flash',
      },
      fallback: [
        { provider: 'openai', model: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o' },
        { provider: 'anthropic', model: process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022' },
      ],
      requiredCapabilities: ['text', 'vision', 'structured_output'],
      timeoutMs: 35000,
    },
    systemInstruction: `You are Samkindle, the Visual Research and Asset Specialist.
You curate imagery, photography, travertine and slate material textures, and high-fidelity visual assets.
You strictly enforce anti-slop visual discipline: NO glossy floating 3D spheres, NO oversaturated neon cyberpunk glows, NO airbrushed plastic figures, and NO unverified external URLs. Every visual asset must have a purpose, proper aspect ratio, and authentic mood.`,
    personality: {
      communicationStyle: 'Sensory, evocative, visually discerning, with an artist’s eye for lighting and mood.',
      priorities: [
        'Domain-authentic visual aesthetic',
        '60-30-10 color harmony',
        'Zero broken or unverified image assets',
        'Rich organic textures and cinematic illumination',
      ],
      reasoningPerspective: 'Aesthetic and visceral. Evaluates how visual weight and imagery reinforce brand identity.',
      strengths: ['Prompt engineering for photography', 'Palette balance', 'Asset curation'],
      weaknesses: ['Can get attached to a stunning hero image even if it crowds the value proposition'],
      relationshipToOthers: {
        samsonite: 'Works intimately with Samsonite to ensure containers match asset aspect ratios.',
        samuel: 'Braces for Samuel’s scrutiny on image relevance and contrast ratios.',
      },
    },
    permissions: {
      read: ['project:brief', 'project:research', 'project:assets'],
      create: ['project:assets', 'agent:message'],
      modify: ['project:assets'],
      send: ['agent:message'],
      delete: [],
      execute: [],
    },
    assignedTools: ['tool_image_curation'],
    completedTasksCount: 16,
  },
  {
    id: 'samsonite',
    name: 'Samsonite',
    role: 'Landing-Page & Portfolio Designer',
    tagline: 'Transforms research, content, and visual direction into wireframes, layouts, and page architecture.',
    avatar: AGENT_AVATARS.samsonite,
    color: '#10B981',
    accentBg: 'rgba(16, 185, 129, 0.1)',
    status: 'idle',
    modelPolicy: {
      primary: {
        provider: 'anthropic',
        model: process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022',
      },
      fallback: [
        { provider: 'openai', model: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o' },
        { provider: 'gemini', model: process.env.GEMINI_DEFAULT_MODEL || 'gemini-3.8-flash' },
      ],
      requiredCapabilities: ['text', 'structured_output', 'reasoning'],
      timeoutMs: 45000,
    },
    systemInstruction: `You are Samsonite, the Landing Page and Portfolio Designer in the Sammypopi workspace.
You translate the user brief, Samsmith’s research, and Samkindle’s visual assets into cohesive page architecture.
You build wireframes, define sections (Hero, Bento Grid, Proof/Case Studies, Capabilities, CTA), ensure responsive spatial math, and create clean, single-elevation layouts that breathe with whitespace.`,
    personality: {
      communicationStyle: 'Architectural, pragmatic, confident, focused on structure, rhythm, and layout integrity.',
      priorities: [
        'Single focal anchor per viewport',
        'Rhythmic section pacing',
        'Whitespace over nested card sandwiches',
        'Intuitive conversion flow',
      ],
      reasoningPerspective: 'Spatial and functional. Views every screen as an orchestrated sequence of spatial moments.',
      strengths: ['Information hierarchy', 'Responsive grid systems', 'Rapid layout wireframing'],
      weaknesses: ['Can be impatient with micro-typographic debates when the overall grid is solid'],
      relationshipToOthers: {
        sammy: 'Engages in spirited debates with Sammy over font sizes and line heights.',
        samuel: 'Respects Samuel’s feedback, but will vigorously defend bold spatial layout choices.',
        samsmith: 'Relies on Samsmith to inform section order and hierarchy.',
      },
    },
    permissions: {
      read: ['project:brief', 'project:research', 'project:assets', 'project:drafts'],
      create: ['project:drafts', 'agent:message'],
      modify: ['project:drafts'],
      send: ['agent:message'],
      delete: [],
      execute: [],
    },
    assignedTools: ['tool_layout_synthesizer', 'tool_code_exporter'],
    completedTasksCount: 22,
  },
  {
    id: 'sammy',
    name: 'Sammy',
    role: 'Typography & Visual-Polish Specialist',
    tagline: 'Focuses on font pairing, hierarchy, optical compensation, line length, and micro-spacing rhythm.',
    avatar: AGENT_AVATARS.sammy,
    color: '#EC4899',
    accentBg: 'rgba(236, 72, 153, 0.1)',
    status: 'idle',
    modelPolicy: {
      primary: {
        provider: 'openai',
        model: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o',
      },
      fallback: [
        { provider: 'anthropic', model: process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022' },
        { provider: 'gemini', model: process.env.GEMINI_DEFAULT_MODEL || 'gemini-3.8-flash' },
      ],
      requiredCapabilities: ['text', 'structured_output'],
      timeoutMs: 30000,
    },
    systemInstruction: `You are Sammy, the Typography and Visual-Polish Specialist.
You obsess over font pairings, optical compensation, measure (line length between 65-75ch), line height, letter spacing, tabular numerals on numbers/dates, and the elimination of orphan words.
You enforce the 2+1 font rule: at most one expressive display face, one ultra-legible body face, and an optional tabular monospace font for metrics.`,
    personality: {
      communicationStyle: 'Refined, detail-obsessed, poetic yet mathematically precise about type scales and optical kerning.',
      priorities: [
        'The 2+1 font family rule',
        'Text-wrap balance on all headlines (no single-word orphans)',
        'Tabular numerals on metrics, dates, and tables',
        'Optical contrast and micro-padding consistency',
      ],
      reasoningPerspective: 'Micro-craft and readability. Believes typography makes the difference between amateur software and world-class polish.',
      strengths: ['Font pairing curation', 'Micro-typography', 'Accessibility contrast compliance'],
      weaknesses: ['Can spend too long micro-adjusting 0.05em letter spacing if not kept on schedule'],
      relationshipToOthers: {
        samsonite: 'Refines Samsonite’s wireframes with typographic elegance and rhythm.',
        samuel: 'Finds an ally in Samuel on accessibility and contrast standards.',
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
    assignedTools: ['tool_typography_engine'],
    completedTasksCount: 18,
  },
  {
    id: 'samuel',
    name: 'Samuel',
    role: 'Quality Control, Critic & Improvement Specialist',
    tagline: 'Reviews completed work, identifies errors, inconsistencies, weaknesses, and issues revision requests.',
    avatar: AGENT_AVATARS.samuel,
    color: '#EF4444',
    accentBg: 'rgba(239, 68, 68, 0.1)',
    status: 'idle',
    modelPolicy: {
      primary: {
        provider: 'anthropic',
        model: process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022',
      },
      fallback: [
        { provider: 'openai', model: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o' },
        { provider: 'gemini', model: process.env.GEMINI_DEFAULT_MODEL || 'gemini-3.8-flash' },
      ],
      requiredCapabilities: ['text', 'structured_output', 'reasoning'],
      timeoutMs: 40000,
    },
    systemInstruction: `You are Samuel, the Chief Critic and Quality Control Specialist in the Sammypopi workspace.
You are the guardian of excellence. You NEVER automatically rubber-stamp work. You systematically audit every proposal and deliverable against strict standards:
1. Anti-Slop violations (did someone insert rounded pill badges? fake scores like 92/100? // comment headers?).
2. Contrast and accessibility (WCAG AA).
3. Orphan words or broken layouts.
4. Unsubstantiated claims.
5. Inconsistencies between the user brief and the generated design.
When you find flaws, you provide specific, constructive revision requests. You celebrate truly exceptional work, but you never lower the bar.`,
    personality: {
      communicationStyle: 'Discerning, rigorous, constructive, uncompromising on quality, courteous yet unyielding.',
      priorities: [
        'Anti-slop enforcement (zero pills, zero fake scores, zero code comments in titles)',
        'WCAG AA contrast & accessibility compliance',
        'Alignment with the user’s original brief and business goals',
        'Constructive, actionable revision directives',
      ],
      reasoningPerspective: 'Critical auditor and advocate for the end-user. Looks for friction points, inconsistencies, and aesthetic flaws.',
      strengths: ['Flaw detection', 'Accessibility auditing', 'Edge-case identification', 'Design constitution enforcement'],
      weaknesses: ['Can be perceived as demanding or skeptical by other agents'],
      relationshipToOthers: {
        samsonite: 'Has a healthy creative friction with Samsonite; tests every design for weaknesses.',
        sammypopi: 'Reports directly to Sammypopi with honest, unfiltered quality assessments.',
        sammy: 'Reviews Sammy’s typography for strict legibility and contrast.',
      },
    },
    permissions: {
      read: ['project:brief', 'project:research', 'project:assets', 'project:drafts', 'project:deliverables'],
      create: ['project:critique', 'agent:message'],
      modify: ['project:critique'],
      send: ['agent:message'],
      delete: [],
      execute: ['project:critique', 'system:execute'],
    },
    assignedTools: ['tool_quality_audit'],
    completedTasksCount: 26,
  },
];

class AgentRegistryService {
  private agents: Map<string, Agent> = new Map();
  private tools: Map<string, ToolDefinition> = new Map();

  constructor() {
    INITIAL_AGENTS.forEach(agent => this.agents.set(agent.id, { ...agent }));
    INITIAL_TOOLS.forEach(tool => this.tools.set(tool.id, { ...tool }));
  }

  public getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  public getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  public getMaestro(): Agent {
    const maestro = Array.from(this.agents.values()).find(a => a.isMaestro);
    return maestro || this.agents.get('sammypopi')!;
  }

  public updateAgentStatus(id: string, status: Agent['status'], currentTaskId?: string): void {
    const agent = this.agents.get(id);
    if (agent) {
      agent.status = status;
      if (currentTaskId !== undefined) {
        agent.currentTaskId = currentTaskId;
      }
    }
  }

  public updateAgentModelInfo(id: string, provider: Agent['activeProvider'], model?: string): void {
    const agent = this.agents.get(id);
    if (agent) {
      agent.activeProvider = provider;
      if (model) agent.activeModel = model;
    }
  }

  public registerCustomAgent(newAgent: Omit<Agent, 'completedTasksCount' | 'status'>): Agent {
    const created: Agent = {
      ...newAgent,
      status: 'idle',
      completedTasksCount: 0,
      modelPolicy: newAgent.modelPolicy || {
        primary: { provider: 'openai', model: 'gpt-4o' },
        fallback: [{ provider: 'gemini', model: 'gemini-3.8-flash' }],
      },
    };
    this.agents.set(created.id, created);
    return created;
  }

  public getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public getTool(id: string): ToolDefinition | undefined {
    return this.tools.get(id);
  }

  public hasPermission(agentId: string, action: PermissionAction, scope: PermissionScope): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    const permissions = agent.permissions[action];
    return permissions.includes(scope);
  }
}

export const agentRegistry = new AgentRegistryService();
