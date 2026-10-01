import { MemoryItem, MemoryCategory } from '../types/orchestration';
import { INITIAL_MEMORIES } from './mockProjectData';

export class MemoryService {
  private memories: MemoryItem[] = [];

  constructor() {
    this.memories = [...INITIAL_MEMORIES];
  }

  public getAll(): MemoryItem[] {
    return [...this.memories];
  }

  public add(item: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>): MemoryItem {
    const newRecord: MemoryItem = {
      ...item,
      id: `mem_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.memories.unshift(newRecord);
    return newRecord;
  }

  /**
   * Section 29: Targeted memory retrieval for agent tasks.
   * Only returns memory relevant to the agent or project, rather than dumping all memory indiscriminately.
   */
  public getRelevantContext(agentId: string, projectId?: string): string {
    const relevant = this.memories.filter(m => {
      // Constitution & knowledge applies universally
      if (m.category === 'knowledge') return true;
      // User style preferences apply
      if (m.category === 'user') return true;
      // Project constraints
      if (m.category === 'project' && (!m.targetId || m.targetId === projectId)) return true;
      // Agent-specific heuristics
      if (m.category === 'agent' && m.targetId === agentId) return true;
      return false;
    });

    return relevant
      .map(m => `[${m.category.toUpperCase()} / ${m.importance.toUpperCase()}]: ${m.title} - ${m.content}`)
      .join('\n');
  }
}

export const memoryService = new MemoryService();
