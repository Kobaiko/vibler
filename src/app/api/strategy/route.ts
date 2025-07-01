import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { CompleteStrategy } from '@/types/strategy'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Add validation for environment variables
if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}
if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'anonymous'

    const { data: strategies, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching strategies:', error)
      return NextResponse.json({ strategies: [] })
    }

    return NextResponse.json({ strategies: strategies || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ strategies: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      strategy,
      teamId = null,
      userId = 'anonymous'
    } = body

    if (!strategy) {
      return NextResponse.json(
        { error: 'Strategy data is required' },
        { status: 400 }
      )
    }

    // Prepare strategy data for database
    const strategyData = {
      team_id: teamId,
      created_by: userId,
      icp_id: null,
      name: strategy.title,
      description: strategy.description,
      objectives: strategy.successMetrics || [],
      tactics: {
        channels: strategy.channels || [],
        messagingPillars: strategy.messagingPillars || [],
        timeline: strategy.timeline || [],
        competitiveAnalysis: strategy.competitiveAnalysis || {},
        riskAssessment: strategy.riskAssessment || [],
        recommendations: strategy.recommendations || []
      },
      budget_allocation: strategy.budget || {},
      timeline: strategy.timeline || [],
      kpis: strategy.successMetrics || []
    }

    const { data: savedStrategy, error } = await supabase
      .from('strategies')
      .insert([strategyData])
      .select()
      .single()

    if (error) {
      console.error('Error saving strategy:', error)
      return NextResponse.json(
        { error: 'Failed to save strategy to database' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      strategy: savedStrategy,
      message: 'Strategy saved successfully' 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      id,
      strategy,
      userId = 'anonymous'
    } = body

    if (!id || !strategy) {
      return NextResponse.json(
        { error: 'Strategy ID and data are required' },
        { status: 400 }
      )
    }

    // Prepare strategy data for database
    const strategyData = {
      name: strategy.title,
      description: strategy.description,
      objectives: strategy.successMetrics || [],
      tactics: {
        channels: strategy.channels || [],
        messagingPillars: strategy.messagingPillars || [],
        timeline: strategy.timeline || [],
        competitiveAnalysis: strategy.competitiveAnalysis || {},
        riskAssessment: strategy.riskAssessment || [],
        recommendations: strategy.recommendations || []
      },
      budget_allocation: strategy.budget || {},
      timeline: strategy.timeline || [],
      kpis: strategy.successMetrics || [],
      updated_at: new Date().toISOString()
    }

    const { data: updatedStrategy, error } = await supabase
      .from('strategies')
      .update(strategyData)
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating strategy:', error)
      return NextResponse.json(
        { error: 'Failed to update strategy' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      strategy: updatedStrategy,
      message: 'Strategy updated successfully' 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId') || 'anonymous'

    if (!id) {
      return NextResponse.json(
        { error: 'Strategy ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('strategies')
      .delete()
      .eq('id', id)
      .eq('created_by', userId)

    if (error) {
      console.error('Error deleting strategy:', error)
      return NextResponse.json(
        { error: 'Failed to delete strategy' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Strategy deleted successfully' 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 