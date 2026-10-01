import { AIProvider, AIProviderId, ModelPolicy, ModelRequest, ModelResponse, ModelTarget } from './providers/providerTypes';
import { OpenAIProvider } from './providers/openaiProvider';
import { GeminiProvider } from './providers/geminiProvider';
import { AnthropicProvider } from './providers/anthropicProvider';
import { SystemFallbackProvider } from './providers/fallbackProvider';

export interface RouteResolution {
  provider: AIProvider;
  target: ModelTarget;
  isFallback: boolean;
  attemptedTargets: ModelTarget[];
}

export class ModelRouter {
  private providers: Map<AIProviderId, AIProvider> = new Map();
  private systemFallback: SystemFallbackProvider = new SystemFallbackProvider();

  constructor() {
    this.registerProvider(new OpenAIProvider());
    this.registerProvider(new GeminiProvider());
    this.registerProvider(new AnthropicProvider());
    this.registerProvider(this.systemFallback);
  }

  public registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: AIProviderId): AIProvider | undefined {
    return this.providers.get(id);
  }

  public getProviderStatus(): Record<AIProviderId, { name: string; available: boolean }> {
    return {
      openai: { name: 'OpenAI', available: this.providers.get('openai')?.isAvailable() || false },
      gemini: { name: 'Google Gemini', available: this.providers.get('gemini')?.isAvailable() || false },
      anthropic: { name: 'Anthropic Claude', available: this.providers.get('anthropic')?.isAvailable() || false },
      'system-fallback': { name: 'Local Engine', available: true },
    };
  }

  /**
   * Resolves the primary target or sequential fallbacks based on policy and provider availability.
   */
  public resolveRoute(policy: ModelPolicy): RouteResolution {
    const targetsToTry: ModelTarget[] = [
      policy.primary,
      ...(policy.fallback || []),
    ];

    const attempted: ModelTarget[] = [];

    for (const target of targetsToTry) {
      attempted.push(target);
      const provider = this.providers.get(target.provider);
      if (provider && provider.isAvailable()) {
        return {
          provider,
          target,
          isFallback: target.provider !== policy.primary.provider || target.model !== policy.primary.model,
          attemptedTargets: attempted,
        };
      }
    }

    // If no external provider is available, use system fallback
    return {
      provider: this.systemFallback,
      target: { provider: 'system-fallback', model: 'sammypopi-local-core' },
      isFallback: true,
      attemptedTargets: attempted,
    };
  }

  /**
   * Executes a model request with automated fallback if the primary provider errors or times out.
   */
  public async executeWithFallback(
    policy: ModelPolicy,
    request: ModelRequest,
    onFallbackEvent?: (from: ModelTarget, to: ModelTarget, error: string) => void
  ): Promise<ModelResponse> {
    const targetsToTry: ModelTarget[] = [
      policy.primary,
      ...(policy.fallback || []),
    ];

    let lastError: Error | null = null;

    for (let i = 0; i < targetsToTry.length; i++) {
      const target = targetsToTry[i];
      const provider = this.providers.get(target.provider);

      if (!provider || !provider.isAvailable()) {
        continue;
      }

      try {
        const enrichedRequest: ModelRequest = {
          ...request,
          provider: target.provider,
          model: target.model,
        };

        const res = await provider.generate(enrichedRequest);
        return res;
      } catch (err: any) {
        lastError = err;
        const nextTarget = targetsToTry[i + 1] || { provider: 'system-fallback', model: 'sammypopi-local-core' };
        if (onFallbackEvent) {
          onFallbackEvent(target, nextTarget, err.message || String(err));
        }
      }
    }

    // Ultimate safe fallback
    const fallbackReq: ModelRequest = {
      ...request,
      provider: 'system-fallback',
      model: 'sammypopi-local-core',
    };

    return this.systemFallback.generate(fallbackReq);
  }
}

export const modelRouter = new ModelRouter();
