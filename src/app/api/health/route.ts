import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get('detailed')
    const component = searchParams.get('component')
    
    // Build the Supabase Edge Function URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'Supabase URL not configured' },
        { status: 500 }
      )
    }

    let healthUrl = `${supabaseUrl}/functions/v1/health-monitor`
    const params = new URLSearchParams()
    
    if (detailed === 'true') {
      params.append('detailed', 'true')
    }
    
    if (component) {
      params.append('component', component)
    }
    
    if (params.toString()) {
      healthUrl += `?${params.toString()}`
    }

    // Forward the request to the Edge Function
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // If the health endpoint is not available, return a basic status
      return NextResponse.json({
        status: 'degraded',
        timestamp: new Date().toISOString(),
        uptime: 0,
        version: '1.0.0',
        services: {
          database: { status: 'unknown', lastCheck: new Date().toISOString() },
          openai: { status: 'unknown', lastCheck: new Date().toISOString() },
          edgeFunctions: { status: 'unhealthy', lastCheck: new Date().toISOString(), error: 'Health endpoint unavailable' }
        },
        metrics: {
          performance: {},
          errors: {},
          requests: {
            total: 0,
            successful: 0,
            failed: 0,
            averageResponseTime: 0
          }
        }
      })
    }

    const healthData = await response.json()
    return NextResponse.json(healthData)

  } catch (error) {
    console.error('Health check proxy error:', error)
    
    // Return a fallback health status
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: 0,
      version: '1.0.0',
      services: {
        database: { status: 'unknown', lastCheck: new Date().toISOString() },
        openai: { status: 'unknown', lastCheck: new Date().toISOString() },
        edgeFunctions: { status: 'unhealthy', lastCheck: new Date().toISOString(), error: 'Health check failed' }
      },
      metrics: {
        performance: {},
        errors: {},
        requests: {
          total: 0,
          successful: 0,
          failed: 0,
          averageResponseTime: 0
        }
      },
      error: (error as Error).message
    }, { status: 500 })
  }
} 