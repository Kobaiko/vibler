import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Parse request body
    const funnel = await req.json()
    
    // Validate required fields
    if (!funnel.userId && !funnel.user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: userId' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!funnel.name) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: name' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const userId = funnel.userId || funnel.user_id
    console.log('Storing funnel for user:', userId)

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Add timestamps if not present
    const timestamp = new Date().toISOString()
    
    // Convert camelCase to snake_case for database storage
    const funnelToStore = {
      id: funnel.id || crypto.randomUUID(),
      name: funnel.name,
      description: funnel.description,
      status: funnel.status || 'draft',
      original_prompt: funnel.originalPrompt || funnel.original_prompt,
      icp: funnel.icp,
      strategy: funnel.strategy,
      creatives: funnel.creatives,
      flow: funnel.flow,
      kpis: funnel.kpis,
      metadata: funnel.metadata,
      user_id: userId,
      created_at: funnel.createdAt || funnel.created_at || timestamp,
      updated_at: timestamp,
    }

    // Store the funnel in the database
    const { data, error } = await supabase
      .from('funnels')
      .insert([funnelToStore])
      .select()

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    // Convert snake_case back to camelCase for API response
    const storedFunnel = data[0]
    const responseFunnel = {
      id: storedFunnel.id,
      name: storedFunnel.name,
      description: storedFunnel.description,
      status: storedFunnel.status,
      originalPrompt: storedFunnel.original_prompt,
      icp: storedFunnel.icp,
      strategy: storedFunnel.strategy,
      creatives: storedFunnel.creatives,
      flow: storedFunnel.flow,
      kpis: storedFunnel.kpis,
      metadata: storedFunnel.metadata,
      userId: storedFunnel.user_id,
      createdAt: storedFunnel.created_at,
      updatedAt: storedFunnel.updated_at,
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        funnel: responseFunnel,
        message: 'Funnel stored successfully',
      }),
      {
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