// AI Service Factory and Manager

import { AIProvider, AIProviderConfig, AIProviderInterface } from './types';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';

export * from './types';

export class AIServiceManager {
  private static instance: AIServiceManager;
  private providers: Map<AIProvider, AIProviderInterface> = new Map();
  private currentProvider: AIProvider = 'openai';

  private constructor() {}

  static getInstance(): AIServiceManager {
    if (!AIServiceManager.instance) {
      AIServiceManager.instance = new AIServiceManager();
    }
    return AIServiceManager.instance;
  }

  registerProvider(config: AIProviderConfig): void {
    let provider: AIProviderInterface;

    switch (config.provider) {
      case 'openai':
        provider = new OpenAIProvider(config);
        break;
      case 'anthropic':
        provider = new AnthropicProvider(config);
        break;
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }

    this.providers.set(config.provider, provider);
  }

  setActiveProvider(provider: AIProvider): void {
    if (!this.providers.has(provider)) {
      throw new Error(`Provider ${provider} not registered`);
    }
    this.currentProvider = provider;
  }

  getProvider(provider?: AIProvider): AIProviderInterface {
    const targetProvider = provider || this.currentProvider;
    const instance = this.providers.get(targetProvider);

    if (!instance) {
      throw new Error(`Provider ${targetProvider} not found. Register it first.`);
    }

    return instance;
  }

  // Convenience methods that use the current provider
  async generateSynthesis(...args: Parameters<AIProviderInterface['generateSynthesis']>) {
    return this.getProvider().generateSynthesis(...args);
  }

  async chat(...args: Parameters<AIProviderInterface['chat']>) {
    return this.getProvider().chat(...args);
  }

  async generateEmbedding(...args: Parameters<AIProviderInterface['generateEmbedding']>) {
    return this.getProvider().generateEmbedding(...args);
  }

  async checkHealth(provider?: AIProvider): Promise<boolean> {
    return this.getProvider(provider).checkHealth();
  }

  // Initialize from environment variables
  static initFromEnv(): AIServiceManager {
    const manager = AIServiceManager.getInstance();

    // Register OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      manager.registerProvider({
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        rateLimitPerMinute: parseInt(process.env.OPENAI_RATE_LIMIT || '20')
      });
    }

    // Register Anthropic if API key is available
    if (process.env.ANTHROPIC_API_KEY) {
      manager.registerProvider({
        provider: 'anthropic',
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet',
        rateLimitPerMinute: parseInt(process.env.ANTHROPIC_RATE_LIMIT || '20')
      });
    }

    // Set default provider
    const defaultProvider = (process.env.DEFAULT_AI_PROVIDER || 'openai') as AIProvider;
    if (manager.providers.has(defaultProvider)) {
      manager.setActiveProvider(defaultProvider);
    }

    return manager;
  }
}

// Export singleton instance
export const aiService = AIServiceManager.getInstance();