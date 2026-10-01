import { Project, AgentTask, TaskCritique } from '../types/orchestration';
import { INITIAL_PROJECT } from './mockProjectData';

export interface ProjectStateStore {
  getProject(id: string): Project;
  updateWorkflowStage(id: string, stage: Project['workflowStage']): void;
  updateTask(id: string, taskId: string, updates: Partial<AgentTask>): void;
  addTask(id: string, task: AgentTask): void;
  updateDesignDraft(id: string, draft: any): void;
  setTaskCritique(id: string, taskId: string, critique: TaskCritique): void;
  addDiscussion(id: string, discussion: any): void;
}

class ProjectStateManager implements ProjectStateStore {
  private projects: Map<string, Project> = new Map();

  constructor() {
    this.projects.set(INITIAL_PROJECT.id, JSON.parse(JSON.stringify(INITIAL_PROJECT)));
  }

  public getProject(id: string): Project {
    const proj = this.projects.get(id);
    if (!proj) {
      // Default to initial project
      return JSON.parse(JSON.stringify(INITIAL_PROJECT));
    }
    return proj;
  }

  public updateWorkflowStage(id: string, stage: Project['workflowStage']): void {
    const proj = this.getProject(id);
    proj.workflowStage = stage;
    proj.updatedAt = new Date().toISOString();
    this.projects.set(id, proj);
  }

  public updateTask(id: string, taskId: string, updates: Partial<AgentTask>): void {
    const proj = this.getProject(id);
    proj.tasks = proj.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    proj.updatedAt = new Date().toISOString();
    this.projects.set(id, proj);
  }

  public addTask(id: string, task: AgentTask): void {
    const proj = this.getProject(id);
    proj.tasks.push(task);
    proj.updatedAt = new Date().toISOString();
    this.projects.set(id, proj);
  }

  public updateDesignDraft(id: string, draft: any): void {
    const proj = this.getProject(id);
    proj.designDraft = {
      ...proj.designDraft,
      ...draft,
      version: (proj.designDraft?.version || 1) + 1,
    };
    proj.updatedAt = new Date().toISOString();
    this.projects.set(id, proj);
  }

  public setTaskCritique(id: string, taskId: string, critique: TaskCritique): void {
    const proj = this.getProject(id);
    proj.tasks = proj.tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          critique,
          status: critique.approved ? 'approved' : 'revision_requested',
        };
      }
      return t;
    });
    proj.updatedAt = new Date().toISOString();
    this.projects.set(id, proj);
  }

  public addDiscussion(id: string, discussion: any): void {
    const proj = this.getProject(id);
    proj.discussions = [discussion, ...proj.discussions];
    proj.updatedAt = new Date().toISOString();
    this.projects.set(id, proj);
  }
}

export const projectState = new ProjectStateManager();
