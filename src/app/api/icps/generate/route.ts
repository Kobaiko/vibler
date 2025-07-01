import { NextRequest, NextResponse } from 'next/server'
import { securityMiddleware, SECURITY_HEADERS, ValidationSchemas, SecurityUtils } from '@/lib/security'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    // Apply security middleware
    const security = await securityMiddleware(request)
    if (security.error) {
      return NextResponse.json(
        { error: security.error },
        { status: security.status, headers: { ...SECURITY_HEADERS, ...security.headers } }
      )
    }

    const body = await request.json()
    
    // Validate and sanitize the new prompt-based input
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Sanitize the prompt
    body.prompt = SecurityUtils.sanitizeInput(body.prompt)
    
    // Validate prompt length (reasonable limits)
    if (body.prompt.length < 10) {
      return NextResponse.json(
        { error: 'Prompt must be at least 10 characters long' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }
    
    if (body.prompt.length > 2000) {
      return NextResponse.json(
        { error: 'Prompt must be less than 2000 characters' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Validate count parameter
    const count = body.count || 3
    if (typeof count !== 'number' || count < 1 || count > 10) {
      return NextResponse.json(
        { error: 'Count must be a number between 1 and 10' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Call the Supabase Edge Function with the new format
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-icp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'X-Client-IP': security.clientIp || 'unknown',
        'X-User-Agent': security.userAgent || 'unknown',
      },
      body: JSON.stringify({
        prompt: body.prompt,
        count: count
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Supabase Edge Function error:', errorData)
      return NextResponse.json(
        { error: errorData.error || 'Failed to generate ICP' },
        { status: response.status, headers: SECURITY_HEADERS }
      )
    }

    const data = await response.json()
    
    // Add security headers to response
    return NextResponse.json(data, {
      status: 200,
      headers: {
        ...SECURITY_HEADERS,
        'X-RateLimit-Remaining': (security.rateLimitRemaining || 0).toString(),
      }
    })
  } catch (error) {
    console.error('Error generating ICP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
} 