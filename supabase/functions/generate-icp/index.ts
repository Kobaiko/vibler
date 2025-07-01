import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface ICPGenerationRequest {
  prompt: string
  count?: number
}

interface GeneratedICP {
  id: string
  name: string
  title: string
  company: string
  industry: string
  company_size: string
  demographics: {
    age?: number | string
    gender?: string
    location?: string
    education?: string
    income?: string
    incomeLevel?: string
  }
  psychographics: {
    personality?: string
    personalityTraits?: string[]
    values?: string[]
    interests?: string[]
    lifestyle?: string
  }
  pain_points: string[]
  goals: string[]
  challenges: string[]
  buying_behavior: {
    decisionMakingProcess?: string
    influencers?: string[]
    budget?: string
    timeline?: string
    preferredChannels?: string[]
  }
  communication_preferences: {
    tone?: string
    channels?: string[]
    frequency?: string
    contentTypes?: string[]
    preferredChannels?: string[]
  }
  objections: string[]
  motivations: string[]
  generation_context: any
  created_at: string
  updated_at: string
  workspace_id?: string | null
  folder_id?: string | null
  user_id?: string | null
}

serve(async (req) => {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  console.log('ICP generation request received', { 
    requestId, 
    method: req.method,
    url: req.url 
  })

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      console.warn('Invalid request method', { requestId, method: req.method })
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate environment variables
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured', { requestId })
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing', { requestId })
      return new Response(
        JSON.stringify({ error: 'Database configuration missing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    let requestData: ICPGenerationRequest
    try {
      requestData = await req.json()
      console.log('Request data parsed', { requestId, requestData })
    } catch (error) {
      console.error('Invalid JSON in request body', { requestId, error: error.message })
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate the new prompt-based input
    if (!requestData.prompt || typeof requestData.prompt !== 'string') {
      console.error('Invalid prompt', { requestId, prompt: requestData.prompt })
      return new Response(
        JSON.stringify({ error: 'Prompt is required and must be a string' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const count = requestData.count || 3
    if (count < 1 || count > 10) {
      console.error('Invalid count', { requestId, count })
      return new Response(
        JSON.stringify({ error: 'Count must be between 1 and 10' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build the prompt for GPT-4o
    const systemPrompt = `You are an expert marketing strategist and customer research analyst. Generate ${count} detailed, realistic Ideal Customer Profile(s) (ICP) based on the provided business context. 

Create comprehensive personas that include:
- Detailed demographics and psychographics
- Specific pain points and challenges
- Clear goals and motivations
- Realistic buying behavior patterns
- Communication preferences
- Common objections and how to address them

Make each persona feel like a real person with specific, actionable details that marketers can use to create targeted campaigns. Each persona should be distinct and represent different segments of the target market.

Return the response as a valid JSON object with an "icps" array containing ${count} objects with this exact structure:
{
  "icps": [
    {
      "name": "string (persona name like 'Sarah Johnson')",
      "title": "string (job title like 'Operations Manager')",
      "company": "string (company name like 'TechStart Solutions')",
      "industry": "string (industry like 'Technology')",
      "company_size": "string (like '10-50 employees')",
      "demographics": {
        "age": "number or string",
        "gender": "string",
        "location": "string",
        "education": "string",
        "income": "string"
      },
      "psychographics": {
        "personality": "string",
        "personalityTraits": ["array", "of", "strings"],
        "values": ["array", "of", "strings"],
        "interests": ["array", "of", "strings"],
        "lifestyle": "string"
      },
      "pain_points": ["array", "of", "pain", "points"],
      "goals": ["array", "of", "goals"],
      "challenges": ["array", "of", "challenges"],
      "buying_behavior": {
        "decisionMakingProcess": "string",
        "influencers": ["array", "of", "influencers"],
        "budget": "string",
        "timeline": "string",
        "preferredChannels": ["array", "of", "channels"]
      },
      "communication_preferences": {
        "tone": "string",
        "channels": ["array", "of", "channels"],
        "frequency": "string",
        "contentTypes": ["array", "of", "content", "types"]
      },
      "objections": ["array", "of", "objections"],
      "motivations": ["array", "of", "motivations"]
    }
  ]
}`

    const userPrompt = `Business Context: ${requestData.prompt}

Generate ${count} distinct Ideal Customer Profile(s) for this business. Each should represent a different segment or type of customer that would be interested in this business.`

    console.log('Calling OpenAI API for ICP generation', { requestId, count })
    
    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8, // Higher temperature for more variety
        max_tokens: 4000, // More tokens for multiple ICPs
        response_format: { type: 'json_object' }
      }),
    })

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text()
      console.error('OpenAI API error', { 
        requestId, 
        status: openAIResponse.status, 
        error: errorText 
      })
      return new Response(
        JSON.stringify({ error: 'Failed to generate ICP' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openAIData = await openAIResponse.json()
    console.log('OpenAI response received', { 
      requestId, 
      usage: openAIData.usage 
    })

    // Parse the generated ICPs
    let generatedData: { icps: GeneratedICP[] }
    try {
      generatedData = JSON.parse(openAIData.choices[0].message.content)
      console.log('ICPs parsed successfully', { requestId, count: generatedData.icps?.length })
    } catch (error) {
      console.error('Failed to parse generated ICPs', { requestId, error: error.message })
      return new Response(
        JSON.stringify({ error: 'Failed to parse generated ICPs' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate that we got the expected number of ICPs
    if (!generatedData.icps || !Array.isArray(generatedData.icps) || generatedData.icps.length === 0) {
      console.error('Invalid ICP data structure', { requestId, data: generatedData })
      return new Response(
        JSON.stringify({ error: 'Invalid ICP data structure' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Add missing fields to each ICP
    const processedIcps = generatedData.icps.map((icp: any) => ({
      ...icp,
      id: crypto.randomUUID(),
      generation_context: { prompt: requestData.prompt, count: requestData.count },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      workspace_id: null,
      folder_id: null,
      user_id: null
    }))

    console.log('ICP generation completed successfully', { 
      requestId, 
      icpCount: processedIcps.length,
      duration: Date.now() - startTime 
    })

    // Return the generated ICPs (without saving to database for now)
    return new Response(
      JSON.stringify({
        success: true,
        icps: processedIcps,
        usage: openAIData.usage
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in ICP generation', { requestId, error: error.message })
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 