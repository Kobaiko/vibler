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
    
    // Generate the ICP
    const result = await funnelEngine.generateICP(validatedRequest)
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      icp: result.icp,
    })
    
  } catch (error) {
    console.error('ICP API Error:', error)
    
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