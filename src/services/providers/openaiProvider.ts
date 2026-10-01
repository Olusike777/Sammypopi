import { AIProvider, ModelCapability, ModelRequest, ModelResponse } from './providerTypes';

export class OpenAIProvider implements AIProvider {
  public readonly id = 'openai';
  public readonly name = 'OpenAI';

  private getApiKey(): string | undefined {
    return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== ''
      ? process.env.OPENAI_API_KEY
      : undefined;
  }

  public isAvailable(): boolean {
    const key = this.getApiKey();
    return !!key && key.startsWith('sk-');
  }

  public supports(capability: ModelCapability): boolean {
    switch (capability) {
      case 'text':
      case 'structured_output':
      case 'reasoning':
      case 'tool_calling':
      case 'vision':
        return true;
      case 'image_generation':
        return true;
      default:
        return false;
    }
  }

  public async generate(request: ModelRequest): Promise<ModelResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured.');
    }

    const model = request.model || process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o';
    const startTime = Date.now();

    const messages = [];
    if (request.systemInstruction) {
      messages.push({ role: 'system', content: request.systemInstruction });
    }
    for (const msg of request.messages) {
      messages.push({ role: msg.role, content: msg.content });
    }

    const body: Record<string, unknown> = {
      model,
      messages,
      temperature: request.temperature ?? 0.4,
    };

    if (request.responseFormat?.type === 'json') {
      body.response_format = { type: 'json_object' };
    }

    if (request.maxTokens) {
      body.max_tokens = request.maxTokens;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeoutMs || 30000);

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenAI HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      const choice = data.choices?.[0];
      const text = choice?.message?.content || '';

      let structuredOutput: unknown = undefined;
      if (request.responseFormat?.type === 'json' && text) {
        try {
          structuredOutput = JSON.parse(text);
        } catch {
          // Keep text as-is if parsing fails
        }
      }

      return {
        id: data.id || `openai_${Date.now()}`,
        provider: 'openai',
        model: data.model || model,
        text,
        structuredOutput,
        usage: {
          inputTokens: data.usage?.prompt_tokens,
          outputTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
        },
        latencyMs: Date.now() - startTime,
        finishReason: choice?.finish_reason,
      };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error(`OpenAI request timed out after ${request.timeoutMs || 30000}ms`);
      }
      throw err;
    }
  }
}
