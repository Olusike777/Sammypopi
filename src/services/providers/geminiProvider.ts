import { GoogleGenAI } from '@google/genai';
import { AIProvider, ModelCapability, ModelRequest, ModelResponse } from './providerTypes';

export class GeminiProvider implements AIProvider {
  public readonly id = 'gemini';
  public readonly name = 'Google Gemini';
  private client: GoogleGenAI | null = null;

  constructor() {
    this.initClient();
  }

  private initClient(): void {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      this.client = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }

  public isAvailable(): boolean {
    const key = process.env.GEMINI_API_KEY;
    return !!key && key !== 'MY_GEMINI_API_KEY' && key.trim() !== '';
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
        return true; // Supported via Imagen
      default:
        return false;
    }
  }

  public async generate(request: ModelRequest): Promise<ModelResponse> {
    if (!this.client) {
      this.initClient();
    }
    if (!this.client) {
      throw new Error('Google Gemini API key is not configured or invalid.');
    }

    const model = request.model || process.env.GEMINI_DEFAULT_MODEL || 'gemini-3.8-flash';
    const startTime = Date.now();

    // Map messages to Gemini contents format
    const contents = request.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

    const config: Record<string, unknown> = {
      temperature: request.temperature ?? 0.3,
    };

    if (request.systemInstruction) {
      config.systemInstruction = request.systemInstruction;
    }

    if (request.responseFormat?.type === 'json') {
      config.responseMimeType = 'application/json';
    }

    try {
      const response = await this.client.models.generateContent({
        model,
        contents,
        config: config as any,
      });

      const text = response.text || '';
      let structuredOutput: unknown = undefined;

      if (request.responseFormat?.type === 'json' && text) {
        try {
          structuredOutput = JSON.parse(text);
        } catch {
          // Keep raw text
        }
      }

      return {
        id: `gemini_${Date.now()}`,
        provider: 'gemini',
        model,
        text,
        structuredOutput,
        usage: {
          inputTokens: (response as any).usageMetadata?.promptTokenCount,
          outputTokens: (response as any).usageMetadata?.candidatesTokenCount,
          totalTokens: (response as any).usageMetadata?.totalTokenCount,
        },
        latencyMs: Date.now() - startTime,
        finishReason: 'stop',
      };
    } catch (err: any) {
      throw new Error(`Gemini error: ${err.message || String(err)}`);
    }
  }
}
