import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to convert snake_case to camelCase
function convertToCamelCase(funnel: any) {
  return {
    id: funnel.id,
    name: funnel.name,
    description: funnel.description,
    status: funnel.status,
    originalPrompt: funnel.original_prompt,
    icp: funnel.icp,
    strategy: funnel.strategy,
    creatives: funnel.creatives,
    flow: funnel.flow,
    kpis: funnel.kpis,
    metadata: funnel.metadata,
    userId: funnel.user_id,
    createdAt: funnel.created_at,
    updatedAt: funnel.updated_at,
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing')
    }

    // Get query parameters
    const url = new URL(req.url)
    const funnelId = url.searchParams.get('id')
    const userId = url.searchParams.get('userId')

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    let query = supabase.from('funnels').select('*')

    // If specific funnel ID is requested
    if (funnelId) {
      query = query.eq('id', funnelId)
      
      // If user ID is also provided, ensure ownership
      if (userId) {
        query = query.eq('user_id', userId)
      }
      
      const { data, error } = await query.single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return new Response(
            JSON.stringify({ error: 'Funnel not found' }),
            { 
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
        throw new Error(`Database error: ${error.message}`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          funnel: convertToCamelCase(data),
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // If user ID is provided, get all funnels for that user
    if (userId) {
      query = query.eq('user_id', userId).order('created_at', { ascending: false })
      
      const { data, error } = await query
      
      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          funnels: data.map(convertToCamelCase),
          count: data.length,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // If no parameters provided, return error
    return new Response(
      JSON.stringify({ error: 'Either funnelId or userId parameter is required' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 