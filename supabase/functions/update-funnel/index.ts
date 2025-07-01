import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to convert camelCase to snake_case for database
function convertToSnakeCase(data: any) {
  const converted: any = {}
  
  // Handle common field mappings
  if (data.originalPrompt !== undefined) converted.original_prompt = data.originalPrompt
  if (data.userId !== undefined) converted.user_id = data.userId
  if (data.createdAt !== undefined) converted.created_at = data.createdAt
  if (data.updatedAt !== undefined) converted.updated_at = data.updatedAt
  
  // Copy other fields as-is
  Object.keys(data).forEach(key => {
    if (!['originalPrompt', 'userId', 'createdAt', 'updatedAt', 'id'].includes(key)) {
      converted[key] = data[key]
    }
  })
  
  return converted
}

// Helper function to convert snake_case to camelCase for response
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
    // Only allow PUT and PATCH methods
    if (req.method !== 'PUT' && req.method !== 'PATCH') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use PUT or PATCH.' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing')
    }

    // Parse request body
    const updateData = await req.json()
    
    // Validate required fields
    if (!updateData.id || (!updateData.userId && !updateData.user_id)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: id and userId' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const userId = updateData.userId || updateData.user_id
    console.log('Updating funnel:', updateData.id, 'for user:', userId)

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Convert camelCase to snake_case and remove id/userId from update data
    const { id, userId: userIdCamel, user_id, ...fieldsToUpdate } = updateData
    const convertedFields = convertToSnakeCase(fieldsToUpdate)

    // Add updated timestamp
    const funnelUpdate = {
      ...convertedFields,
      updated_at: new Date().toISOString(),
    }

    // Update the funnel in the database
    const { data, error } = await supabase
      .from('funnels')
      .update(funnelUpdate)
      .eq('id', id)
      .eq('user_id', userId) // Use snake_case column name
      .select()

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Funnel not found or unauthorized' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Return success response with camelCase
    return new Response(
      JSON.stringify({
        success: true,
        funnel: convertToCamelCase(data[0]),
        message: 'Funnel updated successfully',
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