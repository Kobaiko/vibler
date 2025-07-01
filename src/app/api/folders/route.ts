import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data: folders, error } = await supabase
      .from('folders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching folders:', error)
      return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 })
    }

    return NextResponse.json({ folders })
  } catch (error) {
    console.error('Error in folders GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, workspace_id, color, icon } = body

    if (!name || !workspace_id) {
      return NextResponse.json({ error: 'Name and workspace_id are required' }, { status: 400 })
    }

    const { data: folder, error } = await supabase
      .from('folders')
      .insert([{
        name,
        description: description || '',
        workspace_id,
        color: color || '#6b7280',
        icon: icon || '📂'
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating folder:', error)
      return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 })
    }

    return NextResponse.json({ folder })
  } catch (error) {
    console.error('Error in folders POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 