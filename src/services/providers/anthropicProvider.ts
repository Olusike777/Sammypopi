import { AIProvider, ModelCapability, ModelRequest, ModelResponse } from './providerTypes';

export class AnthropicProvider implements AIProvider {
  public readonly id = 'anthropic';
  public readonly name = 'Anthropic Claude';

  private getApiKey(): string | undefined {
    return process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim() !== ''
      ? process.env.ANTHROPIC_API_KEY
      : undefined;
  }

  public isAvailable(): boolean {
    const key = this.getApiKey();
    return !!key && key.startsWith('sk-ant-');
  }

  public supports(capability: ModelCapability): boolean {
    switch (capability) {
      case 'text':
      case 'structured_output':
      case 'reasoning':
      case 'vision':
      case 'tool_calling':
        return true;
      case 'image_generation':
        return false;
      default:
        return false;
    }
  }

  public async generate(request: ModelRequest): Promise<ModelResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Anthropic API key is not configured.');
    }

    const model = request.model || process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022';
    const startTime = Date.now();

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    for (const msg of request.messages) {
      if (msg.role === 'system') continue;
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    }

    if (messages.length === 0) {
      messages.push({ role: 'user', content: 'Execute system directives.' });
    }

    const body: Record<string, unknown> = {
      model,
      messages,
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature ?? 0.3,
    };

    if (request.systemInstruction) {
      body.system = request.systemInstruction;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeoutMs || 30000);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Anthropic HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      const textBlock = data.content?.find((c: any) => c.type === 'text');
      const text = textBlock?.text || '';

      let structuredOutput: unknown = undefined;
      if (request.responseFormat?.type === 'json' && text) {
        try {
          structuredOutput = JSON.parse(text);
        } catch {
          // Keep raw text
        }
      }

      return {
        id: data.id || `anthropic_${Date.now()}`,
        provider: 'anthropic',
        model: data.model || model,
        text,
        structuredOutput,
        usage: {
          inputTokens: data.usage?.input_tokens,
          outputTokens: data.usage?.output_tokens,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
        latencyMs: Date.now() - startTime,
        finishReason: data.stop_reason,
      };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error(`Anthropic request timed out after ${request.timeoutMs || 30000}ms`);
      }
      throw err;
    }
  }
}
