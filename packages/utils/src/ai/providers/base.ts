// Base AI Provider Implementation

import { 
  AIProviderInterface, 
  AIProviderConfig, 
  SynthesisRequest, 
  SynthesisResult,
  ChatRequest,
  ChatResponse,
  AIError
} from '../types';

export abstract class BaseAIProvider implements AIProviderInterface {
  protected config: AIProviderConfig;
  private requestCount = 0;
  private resetTime = Date.now() + 60000; // 1 minute

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  protected async checkRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Reset counter if minute has passed
    if (now > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + 60000;
    }

    // Check rate limit
    if (this.config.rateLimitPerMinute && this.requestCount >= this.config.rateLimitPerMinute) {
      throw new AIError(
        `Rate limit exceeded. Try again in ${Math.ceil((this.resetTime - now) / 1000)} seconds`,
        'RATE_LIMIT',
        this.config.provider
      );
    }

    this.requestCount++;
  }

  protected calculateCostCents(tokens: number, model: string): number {
    // Default pricing (can be overridden by specific providers)
    const pricing: Record<string, number> = {
      'gpt-3.5-turbo': 0.002, // $0.002 per 1K tokens
      'gpt-4': 0.03,          // $0.03 per 1K tokens
      'claude-3-opus': 0.015, // $0.015 per 1K tokens
      'claude-3-sonnet': 0.003 // $0.003 per 1K tokens
    };

    const pricePerToken = (pricing[model] || 0.002) / 1000;
    return Math.ceil(tokens * pricePerToken * 100); // Convert to cents
  }

  abstract generateSynthesis(request: SynthesisRequest): Promise<SynthesisResult>;
  abstract chat(request: ChatRequest): Promise<ChatResponse>;
  abstract generateEmbedding(text: string): Promise<number[]>;
  
  estimateCost(tokens: number): number {
    return this.calculateCostCents(tokens, this.config.model || 'gpt-3.5-turbo');
  }

  async checkHealth(): Promise<boolean> {
    try {
      // Simple health check - try to generate embedding for test text
      await this.generateEmbedding('test');
      return true;
    } catch (error) {
      return false;
    }
  }
}