import { NextRequest, NextResponse } from 'next/server'
import { strategyEngine } from '@/lib/ai/strategy-engine'
import { StrategyGenerationRequestSchema } from '@/lib/schemas/strategy-schemas'
import type { StrategyGenerationRequest } from '@/types/strategy'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request
    const validatedRequest = StrategyGenerationRequestSchema.parse(body) as StrategyGenerationRequest
    
    // Check API key availability
    const healthCheck = await strategyEngine.healthCheck()
    if (!healthCheck.apiKeyValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' 
        },
        { status: 500 }
      )
    }
    
    // Generate the strategy
    const result = await strategyEngine.generateCompleteStrategy(validatedRequest)
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          processingTime: result.processingTime 
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      strategy: result.strategy,
      processingTime: result.processingTime,
    })
    
  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request format',
          details: error.message 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const healthCheck = await strategyEngine.healthCheck()
    
    return NextResponse.json({
      status: healthCheck.status,
      apiKeyConfigured: healthCheck.apiKeyValid,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
} 