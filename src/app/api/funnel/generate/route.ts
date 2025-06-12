import { NextRequest, NextResponse } from 'next/server'
import { funnelEngine } from '@/lib/ai/funnel-engine'
import { FunnelGenerationRequestSchema } from '@/lib/schemas/funnel-schemas'
import type { FunnelGenerationRequest } from '@/types/funnel'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request
    const validatedRequest = FunnelGenerationRequestSchema.parse(body) as FunnelGenerationRequest
    
    // Check API key availability
    const healthCheck = await funnelEngine.healthCheck()
    if (!healthCheck.apiKeyValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' 
        },
        { status: 500 }
      )
    }
    
    // Generate the funnel
    const result = await funnelEngine.generateCompleteFunnel(validatedRequest)
    
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
      funnel: result.funnel,
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
    const healthCheck = await funnelEngine.healthCheck()
    
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