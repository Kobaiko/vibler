import { v4 as uuidv4 } from 'uuid'
import { callOpenAI, validateApiKey } from './openai-client'
import {
  SYSTEM_PROMPT,
  createICPPrompt,
  createStrategyPrompt,
  createCreativesPrompt,
  createFlowPrompt,
  createKPIsPrompt,
  createCompleteFunnelPrompt,
} from './prompts'
import {
  FunnelGenerationRequestSchema,
  IdealCustomerProfileSchema,
  MarketingStrategySchema,
  CreativeAssetsSchema,
  FunnelFlowSchema,
  KPIMetricsSchema,
  CompleteFunnelSchema,
} from '../schemas/funnel-schemas'
import type {
  FunnelGenerationRequest,
  FunnelGenerationResponse,
  IdealCustomerProfile,
  MarketingStrategy,
  CreativeAssets,
  FunnelFlow,
  KPIMetrics,
  CompleteFunnel,
  GenerateICPResponse,
  GenerateStrategyResponse,
  GenerateCreativesResponse,
  GenerateFlowResponse,
  GenerateKPIsResponse,
} from '@/types/funnel'

// Convert Zod schemas to JSON Schema format for OpenAI structured outputs
function zodToJsonSchema(schema: any): any {
  // This is a simplified conversion - in production, you'd use a proper converter
  // For now, we'll use basic JSON schema structures
  return {
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false,
  }
}

export class FunnelEngine {
  constructor() {
    if (!validateApiKey()) {
      throw new Error('OpenAI API key is required')
    }
  }

  /**
   * Generate a complete marketing funnel from a user prompt
   */
  async generateCompleteFunnel(request: FunnelGenerationRequest): Promise<FunnelGenerationResponse> {
    const startTime = Date.now()
    
    try {
      // Validate input
      const validatedRequest = FunnelGenerationRequestSchema.parse(request)
      
      // Generate complete funnel
      const prompt = createCompleteFunnelPrompt(validatedRequest)
      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        { role: 'user' as const, content: prompt },
      ]

      const response = await callOpenAI<CompleteFunnel>(
        messages,
        { temperature: 0.7, maxTokens: 8000 }
        // Note: Structured output schema would go here when properly implemented
      )

      if (!response.success || !response.data) {
        return {
          funnel: {} as CompleteFunnel,
          success: false,
          error: response.error || 'Failed to generate funnel',
          processingTime: Date.now() - startTime,
        }
      }

      // Add metadata
      const completeFunnel: CompleteFunnel = {
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

      // Validate the generated funnel
      try {
        CompleteFunnelSchema.parse(completeFunnel)
      } catch (validationError) {
        console.error('Funnel validation error:', validationError)
        return {
          funnel: {} as CompleteFunnel,
          success: false,
          error: 'Generated funnel does not meet validation requirements',
          processingTime: Date.now() - startTime,
        }
      }

      return {
        funnel: completeFunnel,
        success: true,
        processingTime: Date.now() - startTime,
      }
    } catch (error) {
      console.error('Funnel generation error:', error)
      return {
        funnel: {} as CompleteFunnel,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        processingTime: Date.now() - startTime,
      }
    }
  }

  /**
   * Generate individual ICP component
   */
  async generateICP(request: FunnelGenerationRequest): Promise<GenerateICPResponse> {
    try {
      const validatedRequest = FunnelGenerationRequestSchema.parse(request)
      const prompt = createICPPrompt(validatedRequest)
      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        { role: 'user' as const, content: prompt },
      ]

      const response = await callOpenAI<IdealCustomerProfile>(
        messages,
        { temperature: 0.7, maxTokens: 2000 }
      )

      if (!response.success || !response.data) {
        return {
          icp: {} as IdealCustomerProfile,
          success: false,
          error: response.error || 'Failed to generate ICP',
        }
      }

      const icp: IdealCustomerProfile = {
        ...response.data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return {
        icp,
        success: true,
      }
    } catch (error) {
      return {
        icp: {} as IdealCustomerProfile,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  /**
   * Generate marketing strategy component
   */
  async generateStrategy(request: FunnelGenerationRequest, icpContext?: string): Promise<GenerateStrategyResponse> {
    try {
      const validatedRequest = FunnelGenerationRequestSchema.parse(request)
      const prompt = createStrategyPrompt(validatedRequest, icpContext)
      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        { role: 'user' as const, content: prompt },
      ]

      const response = await callOpenAI<MarketingStrategy>(
        messages,
        { temperature: 0.7, maxTokens: 3000 }
      )

      if (!response.success || !response.data) {
        return {
          strategy: {} as MarketingStrategy,
          success: false,
          error: response.error || 'Failed to generate strategy',
        }
      }

      const strategy: MarketingStrategy = {
        ...response.data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return {
        strategy,
        success: true,
      }
    } catch (error) {
      return {
        strategy: {} as MarketingStrategy,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  /**
   * Generate creative assets component
   */
  async generateCreatives(request: FunnelGenerationRequest, strategyContext?: string): Promise<GenerateCreativesResponse> {
    try {
      const validatedRequest = FunnelGenerationRequestSchema.parse(request)
      const prompt = createCreativesPrompt(validatedRequest, strategyContext)
      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        { role: 'user' as const, content: prompt },
      ]

      const response = await callOpenAI<CreativeAssets>(
        messages,
        { temperature: 0.8, maxTokens: 4000 }
      )

      if (!response.success || !response.data) {
        return {
          creatives: {} as CreativeAssets,
          success: false,
          error: response.error || 'Failed to generate creatives',
        }
      }

      const creatives: CreativeAssets = {
        ...response.data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return {
        creatives,
        success: true,
      }
    } catch (error) {
      return {
        creatives: {} as CreativeAssets,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  /**
   * Generate funnel flow component
   */
  async generateFlow(request: FunnelGenerationRequest, strategyContext?: string): Promise<GenerateFlowResponse> {
    try {
      const validatedRequest = FunnelGenerationRequestSchema.parse(request)
      const prompt = createFlowPrompt(validatedRequest, strategyContext)
      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        { role: 'user' as const, content: prompt },
      ]

      const response = await callOpenAI<FunnelFlow>(
        messages,
        { temperature: 0.6, maxTokens: 3000 }
      )

      if (!response.success || !response.data) {
        return {
          flow: {} as FunnelFlow,
          success: false,
          error: response.error || 'Failed to generate flow',
        }
      }

      const flow: FunnelFlow = {
        ...response.data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return {
        flow,
        success: true,
      }
    } catch (error) {
      return {
        flow: {} as FunnelFlow,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  /**
   * Generate KPI metrics component
   */
  async generateKPIs(request: FunnelGenerationRequest, strategyContext?: string, flowContext?: string): Promise<GenerateKPIsResponse> {
    try {
      const validatedRequest = FunnelGenerationRequestSchema.parse(request)
      const prompt = createKPIsPrompt(validatedRequest, strategyContext, flowContext)
      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        { role: 'user' as const, content: prompt },
      ]

      const response = await callOpenAI<KPIMetrics>(
        messages,
        { temperature: 0.5, maxTokens: 2500 }
      )

      if (!response.success || !response.data) {
        return {
          kpis: {} as KPIMetrics,
          success: false,
          error: response.error || 'Failed to generate KPIs',
        }
      }

      const kpis: KPIMetrics = {
        ...response.data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return {
        kpis,
        success: true,
      }
    } catch (error) {
      return {
        kpis: {} as KPIMetrics,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  /**
   * Health check for the engine
   */
  async healthCheck(): Promise<{ status: string; apiKeyValid: boolean }> {
    return {
      status: 'healthy',
      apiKeyValid: validateApiKey(),
    }
  }
}

// Singleton instance
export const funnelEngine = new FunnelEngine() 