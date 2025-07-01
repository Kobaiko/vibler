import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GDPRUtils, securityMiddleware, SECURITY_HEADERS } from '@/lib/security'

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

    // Get user from Supabase auth
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: request.headers.get('Authorization') || '',
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: SECURITY_HEADERS }
      )
    }

    // Anonymize user data
    const result = await GDPRUtils.anonymizeUserData(user.id)

    return NextResponse.json(
      { 
        success: true, 
        message: 'User data has been anonymized successfully',
        timestamp: new Date().toISOString()
      },
      { status: 200, headers: SECURITY_HEADERS }
    )

  } catch (error) {
    console.error('Data anonymization error:', error)
    return NextResponse.json(
      { error: 'Failed to anonymize data' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
} 