// OpenAI Provider Implementation

import { BaseAIProvider } from './base';
import {
  SynthesisRequest,
  SynthesisResult,
  ChatRequest,
  ChatResponse,
  AIError,
  Attribution,
  Gap,
  Source
} from '../types';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    total_tokens: number;
  };
}

export class OpenAIProvider extends BaseAIProvider {
  private baseUrl = 'https://api.openai.com/v1';

  async generateSynthesis(request: SynthesisRequest): Promise<SynthesisResult> {
    await this.checkRateLimit();

    const prompt = this.buildSynthesisPrompt(request);
    
    try {
      const response = await this.makeRequest('/chat/completions', {
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at synthesizing academic content while maintaining proper attribution.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.config.temperature || 0.7,
        max_tokens: request.context?.maxTokens || 2000
      });

      const result = this.parseSynthesisResponse(response);
      
      return {
        synthesis: result.synthesis,
        attributions: result.attributions,
        confidence: result.confidence,
        gaps: result.gaps,
        metadata: {
          provider: 'openai',
          model: this.config.model || 'gpt-3.5-turbo',
          tokensUsed: response.usage.total_tokens,
          costCents: this.calculateCostCents(response.usage.total_tokens, this.config.model || 'gpt-3.5-turbo'),
          generatedAt: new Date()
        }
      };
    } catch (error: any) {
      throw new AIError(
        error.message || 'Failed to generate synthesis',
        error.response?.status === 401 ? 'INVALID_API_KEY' : 'MODEL_ERROR',
        'openai'
      );
    }
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    await this.checkRateLimit();
    const startTime = Date.now();

    try {
      const messages = this.buildChatMessages(request);
      
      const response = await this.makeRequest('/chat/completions', {
        model: this.config.model || 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 1000
      });

      const sources = this.extractSources(response.choices[0].message.content);
      
      return {
        response: response.choices[0].message.content,
        sources,
        followUpQuestions: this.generateFollowUpQuestions(request.message),
        metadata: {
          provider: 'openai',
          model: this.config.model || 'gpt-3.5-turbo',
          tokensUsed: response.usage.total_tokens,
          responseTime: Date.now() - startTime
        }
      };
    } catch (error: any) {
      throw new AIError(
        error.message || 'Chat request failed',
        'MODEL_ERROR',
        'openai'
      );
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    await this.checkRateLimit();

    try {
      const response = await this.makeRequest('/embeddings', {
        model: 'text-embedding-ada-002',
        input: text
      });

      return response.data[0].embedding;
    } catch (error: any) {
      throw new AIError(
        'Failed to generate embedding',
        'MODEL_ERROR',
        'openai'
      );
    }
  }

  private async makeRequest(endpoint: string, body: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    return response.json();
  }

  private buildSynthesisPrompt(request: SynthesisRequest): string {
    const levelInstructions = {
      executive: 'Create a brief executive summary (200-300 words)',
      detailed: 'Create a detailed synthesis (500-800 words)',
      comprehensive: 'Create a comprehensive analysis (1000-1500 words)'
    };

    return `
Please synthesize the following content pieces into a ${request.level} overview.
${levelInstructions[request.level]}

Important requirements:
1. Maintain clear attribution to original authors
2. Identify connections between different perspectives
3. Highlight any gaps or areas needing more research
4. Use academic writing style

Content IDs to synthesize: ${request.contentIds.join(', ')}

${request.context?.focus ? `Focus areas: ${request.context.focus.join(', ')}` : ''}
${request.context?.audience ? `Target audience: ${request.context.audience}` : ''}

Return your response in the following JSON format:
{
  "synthesis": "The synthesized text...",
  "attributions": [
    {
      "contentId": "id",
      "author": "name",
      "contribution": "what they contributed",
      "weight": 0.0-1.0
    }
  ],
  "confidence": 0.0-1.0,
  "gaps": [
    {
      "topic": "topic name",
      "description": "what's missing"
    }
  ]
}`;
  }

  private parseSynthesisResponse(response: OpenAIResponse): {
    synthesis: string;
    attributions: Attribution[];
    confidence: number;
    gaps: Gap[];
  } {
    try {
      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      
      return {
        synthesis: parsed.synthesis || content,
        attributions: parsed.attributions || [],
        confidence: parsed.confidence || 0.8,
        gaps: parsed.gaps || []
      };
    } catch {
      // Fallback if response isn't properly formatted JSON
      return {
        synthesis: response.choices[0].message.content,
        attributions: [],
        confidence: 0.7,
        gaps: []
      };
    }
  }

  private buildChatMessages(request: ChatRequest): Array<{role: string; content: string}> {
    const systemPrompt = `You are an AI assistant for the Living Theory of Change platform. 
    You help users understand systems change theory and research.
    ${request.context.userRole === 'contributor' ? 'The user is a contributor who can create content.' : ''}
    ${request.context.preferredDepth ? `Provide ${request.context.preferredDepth} responses.` : ''}`;

    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add history if provided
    if (request.history) {
      messages.push(...request.history.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    }

    // Add current message
    messages.push({
      role: 'user',
      content: request.message
    });

    return messages;
  }

  private extractSources(response: string): Source[] {
    // Mock implementation - in real scenario, would parse citations from response
    return [];
  }

  private generateFollowUpQuestions(message: string): string[] {
    // Simple implementation - could be enhanced with AI
    return [
      'Would you like more details on any specific aspect?',
      'How does this relate to your current work?',
      'Are there other perspectives you\'d like to explore?'
    ];
  }
}