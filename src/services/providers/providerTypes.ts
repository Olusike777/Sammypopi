/**
 * Multi-Provider AI Abstraction Types
 */

export type AIProviderId = 'openai' | 'gemini' | 'anthropic' | 'system-fallback';

export type ModelCapability = 
  | 'text' 
  | 'structured_output' 
  | 'reasoning' 
  | 'vision' 
  | 'image_generation' 
  | 'tool_calling';

export interface ModelMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ModelToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ModelToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ResponseFormat {
  type: 'text' | 'json';
  jsonSchema?: Record<string, unknown>;
}

export interface ModelRequest {
  provider?: AIProviderId;
  model?: string;
  systemInstruction?: string;
  messages: ModelMessage[];
  temperature?: number;
  maxTokens?: number;
  tools?: ModelToolDefinition[];
  responseFormat?: ResponseFormat;
  timeoutMs?: number;
  metadata?: {
    projectId?: string;
    taskId?: string;
    agentId?: string;
    runId?: string;
  };
}

export interface ModelResponse {
  id: string;
  provider: AIProviderId;
  model: string;
  text: string;
  structuredOutput?: unknown;
  toolCalls?: ModelToolCall[];
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  latencyMs?: number;
  finishReason?: string;
  metadata?: Record<string, unknown>;
}

export interface AIProvider {
  id: AIProviderId;
  name: string;
  isAvailable(): boolean;
  generate(request: ModelRequest): Promise<ModelResponse>;
  supports(capability: ModelCapability): boolean;
}

export interface ModelTarget {
  provider: AIProviderId;
  model: string;
}

export interface ModelPolicy {
  primary: ModelTarget;
  fallback?: ModelTarget[];
  requiredCapabilities?: ModelCapability[];
  maxRetries?: number;
  timeoutMs?: number;
}
