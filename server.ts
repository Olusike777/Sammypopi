import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { modelRouter } from './src/services/modelRouter';
import { agentRuntime } from './src/services/agentRuntime';
import { orchestrationEngine } from './src/services/orchestrationEngine';
import { projectState } from './src/services/projectState';
import { memoryService } from './src/services/memoryService';
import { agentRegistry } from './src/services/agentRegistry';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Multi-provider status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  const providerStatus = modelRouter.getProviderStatus();
  res.json({
    status: 'online',
    appName: 'Sammypopi — Multi-Agent AI Workspace',
    orchestrator: 'Sammypopi (Maestro)',
    primaryProvider: 'OpenAI (default)',
    providers: providerStatus,
    timestamp: new Date().toISOString(),
  });
});

// Maestro Orchestration route
app.post('/api/orchestrate', async (req: Request, res: Response) => {
  try {
    const { prompt, projectId = 'proj_apex_01' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const maestroTask = await agentRuntime.runAgentTask({
      agentId: 'sammypopi',
      taskId: `task_orch_${Date.now()}`,
      projectId,
      objective: `Deconstruct user request: "${prompt}". Formulate delegation tasks across specialists and identify potential creative debate areas.`,
      actionRequired: 'create',
      scopeRequired: 'project:brief',
      responseFormat: 'json',
    });

    return res.json({
      source: `${maestroTask.provider}/${maestroTask.model}`,
      orchestration: maestroTask.structuredOutput || {
        summary: maestroTask.resultText,
        delegatedTasks: [],
        executiveMessage: maestroTask.resultText,
      },
    });
  } catch (error: any) {
    console.error('Orchestration error:', error);
    return res.status(500).json({ error: error.message || 'Orchestration failed' });
  }
});

// Real full multi-agent workflow execution
app.post('/api/runs', async (req: Request, res: Response) => {
  try {
    const { projectId = 'proj_apex_01', prompt } = req.body;

    const summary = await orchestrationEngine.executeWorkflow({
      projectId,
      userPrompt: prompt,
    });

    return res.json(summary);
  } catch (error: any) {
    console.error('Workflow run error:', error);
    return res.status(500).json({ error: error.message || 'Workflow run failed' });
  }
});

// Cancel active run
app.post('/api/runs/:runId/cancel', (req: Request, res: Response) => {
  const { runId } = req.params;
  orchestrationEngine.cancelRun(runId);
  return res.json({ status: 'cancelled', runId });
});

// Dispatch task directly to a specific agent with permission checks
app.post('/api/agents/:agentId/task', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { taskTitle, description, projectId = 'proj_apex_01', action = 'create', scope = 'project:drafts' } = req.body;

    if (!taskTitle) {
      return res.status(400).json({ error: 'taskTitle is required' });
    }

    const result = await agentRuntime.runAgentTask({
      agentId,
      taskId: `task_${Date.now()}`,
      projectId,
      objective: `${taskTitle}: ${description || ''}`,
      actionRequired: action,
      scopeRequired: scope,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Agent task error:', error);
    return res.status(500).json({ error: error.message || 'Agent task execution failed' });
  }
});

// Get current project state
app.get('/api/projects/:projectId', (req: Request, res: Response) => {
  const { projectId } = req.params;
  const project = projectState.getProject(projectId);
  res.json(project);
});

// Get all memories
app.get('/api/memories', (req: Request, res: Response) => {
  res.json(memoryService.getAll());
});

// Add new memory
app.post('/api/memories', (req: Request, res: Response) => {
  const { title, content, category, importance = 'high', tags = [] } = req.body;
  if (!title || !content || !category) {
    return res.status(400).json({ error: 'title, content, and category are required' });
  }
  const saved = memoryService.add({ title, content, category, importance, tags });
  res.json(saved);
});

// Start server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, when running from dist/server.js, static files are in the same folder (__dirname)
    // When running from root (e.g. tsx server.ts with NODE_ENV=production), static files are in path.join(__dirname, 'dist')
    const distPath = __dirname.endsWith('dist') ? __dirname : path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sammypopi Server] Multi-Provider AI Runtime active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
