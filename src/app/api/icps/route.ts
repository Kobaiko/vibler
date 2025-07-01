import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: icps, error } = await supabase
      .from('icps')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch ICPs' },
        { status: 500 }
      )
    }

    return NextResponse.json({ icps })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    // Remove the temporary id if it exists and let the database generate a new one
    const { id, ...icpData } = body

    const { data: savedIcp, error } = await supabase
      .from('icps')
      .insert({
        ...icpData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Database error saving ICP:', error)
      return NextResponse.json(
        { error: 'Failed to save ICP' },
        { status: 500 }
      )
    }

    return NextResponse.json(savedIcp)
  } catch (error) {
    console.error('Unexpected error saving ICP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 