import { v4 as uuidv4 } from 'uuid'
import { callOpenAI, validateApiKey } from './openai-client'
import { createCompleteStrategyPrompt } from './strategy-prompts'
import { StrategyGenerationRequestSchema, CompleteStrategySchema } from '../schemas/strategy-schemas'
import type {
  StrategyGenerationRequest,
  StrategyGenerationResponse,
  CompleteStrategy,
} from '@/types/strategy'

export class StrategyEngine {
  constructor() {
    // Remove immediate API key validation - check it when needed
  }

  /**
   * Generate a complete marketing strategy from a user prompt
   */
  async generateCompleteStrategy(request: StrategyGenerationRequest): Promise<StrategyGenerationResponse> {
    const startTime = Date.now()
    
    try {
      // Check API key before processing
      if (!validateApiKey()) {
        return {
          strategy: {} as CompleteStrategy,
          success: false,
          error: 'Replicate API key is not configured. Please set the REPLICATE_API_TOKEN environment variable. For now, using fallback strategy generation.',
          processingTime: Date.now() - startTime,
        }
      }

      // Validate input
      const validatedRequest = StrategyGenerationRequestSchema.parse(request)
      
      // Generate complete strategy
      const prompt = createCompleteStrategyPrompt(validatedRequest)
      const messages = [
        { 
          role: 'system' as const, 
          content: `You are an expert marketing strategist with 15+ years of experience in developing comprehensive marketing strategies across various industries. You specialize in creating data-driven, actionable marketing plans that deliver measurable results.

Your expertise includes:
- Multi-channel marketing strategy development
- Budget allocation and ROI optimization
- Competitive analysis and market positioning
- Campaign timeline and execution planning
- Performance metrics and KPI framework design

Always provide detailed, actionable strategies with specific tactics, timelines, and budget recommendations.` 
        },
        { role: 'user' as const, content: prompt },
      ]

      const response = await callOpenAI<CompleteStrategy>(
        messages,
        { temperature: 0.7, maxTokens: 8000 }
      )

      if (!response.success || !response.data) {
        return {
          strategy: {} as CompleteStrategy,
          success: false,
          error: response.error || 'Failed to generate strategy',
          processingTime: Date.now() - startTime,
        }
      }

      // Add metadata
      const completeStrategy: CompleteStrategy = {
        ...response.data,
        id: uuidv4(),
        originalPrompt: validatedRequest.prompt,
        userId: validatedRequest.userId,
        metadata: {
          businessType: validatedRequest.businessType || 'Not specified',
          industry: 'Auto-detected',
          targetMarket: validatedRequest.targetMarket || 'Not specified',
          budget: validatedRequest.budget || 'Not specified',
          timeline: validatedRequest.timeline || 'Not specified',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Validate the generated strategy
      try {
        CompleteStrategySchema.parse(completeStrategy)
      } catch (validationError) {
        console.error('Strategy validation error:', validationError)
        return {
          strategy: {} as CompleteStrategy,
          success: false,
          error: 'Generated strategy does not meet validation requirements',
          processingTime: Date.now() - startTime,
        }
      }

      return {
        strategy: completeStrategy,
        success: true,
        processingTime: Date.now() - startTime,
      }
    } catch (error) {
      console.error('Strategy generation error:', error)
      return {
        strategy: {} as CompleteStrategy,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        processingTime: Date.now() - startTime,
      }
    }
  }

  /**
   * Health check for the strategy engine
   */
  async healthCheck(): Promise<{ status: string; apiKeyValid: boolean }> {
    try {
      const apiKeyValid = validateApiKey()
      return {
        status: apiKeyValid ? 'healthy' : 'api_key_missing',
        apiKeyValid,
      }
    } catch (error) {
      return {
        status: 'error',
        apiKeyValid: false,
      }
    }
  }
}

// Lazy-loaded singleton instance
let strategyEngineInstance: StrategyEngine | null = null

export function getStrategyEngine(): StrategyEngine {
  if (!strategyEngineInstance) {
    strategyEngineInstance = new StrategyEngine()
  }
  return strategyEngineInstance
}

// Export for backward compatibility
export const strategyEngine = getStrategyEngine() 