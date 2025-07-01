import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data: workspaces, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching workspaces:', error)
      return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 })
    }

    return NextResponse.json({ workspaces })
  } catch (error) {
    console.error('Error in workspaces GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color, icon } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const { data: workspace, error } = await supabase
      .from('workspaces')
      .insert([{
        name,
        description: description || '',
        color: color || '#3b82f6',
        icon: icon || '📁'
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating workspace:', error)
      return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
    }

    return NextResponse.json({ workspace })
  } catch (error) {
    console.error('Error in workspaces POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 