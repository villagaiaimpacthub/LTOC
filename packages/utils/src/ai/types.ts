// AI Provider Types and Interfaces

export type AIProvider = 'openai' | 'anthropic' | 'custom';

export interface SynthesisRequest {
  contentIds: string[];
  level: 'executive' | 'detailed' | 'comprehensive';
  context?: {
    audience?: string;
    focus?: string[];
    maxTokens?: number;
  };
}

export interface SynthesisResult {
  synthesis: string;
  attributions: Attribution[];
  confidence: number;
  gaps: Gap[];
  metadata: {
    provider: AIProvider;
    model: string;
    tokensUsed: number;
    costCents: number;
    generatedAt: Date;
  };
}

export interface Attribution {
  contentId: string;
  author: string;
  contribution: string;
  weight: number;
}

export interface Gap {
  topic: string;
  description: string;
  suggestedSources?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  context: ChatContext;
  history?: ChatMessage[];
}

export interface ChatContext {
  contentIds?: string[];
  topic?: string;
  userRole?: 'reader' | 'contributor' | 'admin';
  preferredDepth?: 'brief' | 'detailed' | 'comprehensive';
}

export interface ChatResponse {
  response: string;
  sources: Source[];
  followUpQuestions?: string[];
  metadata: {
    provider: AIProvider;
    model: string;
    tokensUsed: number;
    responseTime: number;
  };
}

export interface Source {
  contentId: string;
  title: string;
  relevance: number;
  excerpt?: string;
}

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  rateLimitPerMinute?: number;
}

export interface AIProviderInterface {
  generateSynthesis(request: SynthesisRequest): Promise<SynthesisResult>;
  chat(request: ChatRequest): Promise<ChatResponse>;
  generateEmbedding(text: string): Promise<number[]>;
  estimateCost(tokens: number): number;
  checkHealth(): Promise<boolean>;
}

export class AIError extends Error {
  constructor(
    message: string,
    public code: 'RATE_LIMIT' | 'INVALID_API_KEY' | 'MODEL_ERROR' | 'UNKNOWN',
    public provider: AIProvider
  ) {
    super(message);
    this.name = 'AIError';
  }
}