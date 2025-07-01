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

    const body = await request.json()
    const { confirmationCode } = body

    // Require confirmation code for data deletion
    if (confirmationCode !== 'DELETE_MY_DATA_PERMANENTLY') {
      return NextResponse.json(
        { error: 'Invalid confirmation code. Data deletion requires explicit confirmation.' },
        { status: 400, headers: SECURITY_HEADERS }
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

    // Delete user data
    const result = await GDPRUtils.deleteUserData(user.id)

    return NextResponse.json(
      { 
        success: true, 
        message: 'User data has been permanently deleted',
        timestamp: new Date().toISOString()
      },
      { status: 200, headers: SECURITY_HEADERS }
    )

  } catch (error) {
    console.error('Data deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
} 