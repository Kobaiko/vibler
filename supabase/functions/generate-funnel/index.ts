import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createLogger, extractUserContext, PerformanceMonitor, ErrorTracker } from '../_shared/logger.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FunnelRequest {
  prompt: string
  businessType?: string
  targetMarket?: string
  budget?: string
  timeline?: string
  userId: string
}

serve(async (req) => {
  const logger = createLogger('generate-funnel', req)
  const performanceMonitor = PerformanceMonitor.getInstance()
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    logger.requestStart(req.method, req.url)
    logger.businessLogicStart('funnel_generation')
    
    // Validate environment variables
    logger.debug('Validating environment configuration')
    const openaiApiKey = (globalThis as any).Deno?.env?.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      logger.securityEvent('missing_api_key', 'high', { service: 'openai' })
      throw new Error('OpenAI API key not configured')
    }

    const supabaseUrl = (globalThis as any).Deno?.env?.get('SUPABASE_URL')
    const supabaseKey = (globalThis as any).Deno?.env?.get('SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) {
      logger.securityEvent('missing_config', 'high', { service: 'supabase' })
      throw new Error('Supabase configuration missing')
    }

    // Parse request body
    logger.debug('Parsing request body')
    const body: FunnelRequest = await req.json()
    
    // Extract user context for logging
    const userContext = extractUserContext(req, body)
    Object.assign(logger['context'], userContext)
    
    // Validate required fields
    if (!body.prompt || !body.userId) {
      logger.warn('Invalid request: missing required fields', {
        hasPrompt: !!body.prompt,
        hasUserId: !!body.userId
      })
      return new Response(
        JSON.stringify({ error: 'Missing required fields: prompt and userId' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    logger.info('Starting funnel generation', {
      userId: body.userId,
      promptLength: body.prompt.length,
      businessType: body.businessType,
      targetMarket: body.targetMarket,
      budget: body.budget,
      timeline: body.timeline
    })

    // Create system prompt
    logger.debug('Creating system prompt')
    const systemPrompt = `You are an expert marketing strategist and funnel architect with 20+ years of experience in digital marketing, conversion optimization, and customer journey design. You specialize in creating comprehensive, data-driven marketing funnels that convert prospects into customers.

Your expertise includes:
- Consumer psychology and behavioral analysis
- Conversion rate optimization (CRO)
- Multi-channel marketing campaigns
- Customer segmentation and targeting
- Performance marketing and ROI optimization
- Marketing automation and lifecycle campaigns
- Content strategy and creative development
- Analytics and KPI tracking

You always provide actionable, specific, and measurable recommendations based on industry best practices and proven methodologies.`

    // Create user prompt
    logger.debug('Creating user prompt')
    const userPrompt = `Create a complete, comprehensive marketing funnel based on the following business requirements:

**Business Prompt:** "${body.prompt}"

${body.businessType ? `**Business Type:** ${body.businessType}` : ''}
${body.targetMarket ? `**Target Market:** ${body.targetMarket}` : ''}
${body.budget ? `**Total Budget:** ${body.budget}` : ''}
${body.timeline ? `**Timeline:** ${body.timeline}` : ''}

Create a complete funnel including the components below.

Respond with valid JSON only, following this exact structure:
{
  "name": "A concise, descriptive name for this marketing funnel",
  "description": "A brief summary of the funnel's purpose and strategy",
  "icp": {
    "description": "A summary of the ideal customer profile",
    "demographics": {
      "age": "e.g., 25-45",
      "gender": "e.g., Male/Female/All",
      "income": "e.g., $70k+",
      "location": "e.g., Urban/Suburban"
    },
    "psychographics": {
      "interests": ["e.g., Technology", "Marketing", "Business"],
      "values": ["e.g., Innovation", "Efficiency"],
      "goals": ["e.g., Increase team productivity", "Drive revenue growth"]
    },
    "painPoints": ["List of specific problems the customer faces"],
    "motivations": ["List of key drivers for the customer to seek a solution"]
  },
  "strategy": {
    "objective": "A clear, measurable primary goal for this funnel (e.g., Generate 100 qualified leads in Q3)",
    "targetChannels": [
      {
        "channel": "e.g., LinkedIn Ads",
        "justification": "Why this channel is suitable for the ICP",
        "priority": "High/Medium/Low"
      }
    ],
    "budgetAllocation": {
      "totalBudget": "The total budget provided by the user",
      "breakdown": [
        {
          "category": "e.g., Ad Spend",
          "amount": "Amount or percentage",
          "details": "e.g., LinkedIn: 60%, Google Ads: 40%"
        },
        {
          "category": "e.g., Content Creation",
          "amount": "Amount or percentage"
        },
        {
          "category": "e.g., Tools/Software",
          "amount": "Amount or percentage"
        }
      ]
    },
    "timeline": {
      "duration": "The total timeline provided by the user",
      "phases": [
        {
          "phase": "e.g., Phase 1: Awareness (Weeks 1-4)",
          "activities": ["Activity 1", "Activity 2"]
        }
      ]
    },
    "keyMessaging": {
      "mainHook": "The primary emotional hook",
      "valueProposition": "The core value proposition",
      "differentiators": ["Unique selling points"]
    }
  },
  "creatives": {
    "adCopy": [
      {
        "platform": "e.g., LinkedIn",
        "headline": "Ad headline",
        "body": "Ad body text"
      }
    ],
    "landingPage": {
      "headline": "Landing page headline",
      "subheadline": "Landing page subheadline",
      "cta": "Call to action"
    },
    "emailSequence": [
      {
        "subject": "Email 1 Subject",
        "body": "Email 1 body"
      }
    ]
  },
  "flow": {
    "stages": [
      {
        "stageName": "e.g., Top of Funnel (Awareness)",
        "description": "How to attract visitors",
        "touchpoints": ["e.g., LinkedIn Ad", "Blog Post"]
      },
      {
        "stageName": "e.g., Middle of Funnel (Consideration)",
        "description": "How to capture leads",
        "touchpoints": ["e.g., Landing Page with eBook", "Email Nurture Sequence"]
      },
      {
        "stageName": "e.g., Bottom of Funnel (Conversion)",
        "description": "How to convert leads to customers",
        "touchpoints": ["e.g., Demo Call", "Pricing Page"]
      }
    ]
  },
  "kpis": {
    "primaryMetric": "The most important KPI to track (e.g., Cost Per Acquisition)",
    "secondaryMetrics": ["e.g., Click-Through Rate (CTR)", "Conversion Rate", "Lead-to-Customer Rate"]
  }
}`

    // Call OpenAI API
    logger.apiCallStart('openai', 'chat/completions')
    const apiStartTime = performance.now()
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    })

    const apiDuration = performance.now() - apiStartTime
    performanceMonitor.recordMetric('openai_api_call', apiDuration)

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      logger.apiCallError('openai', 'chat/completions', new Error(`HTTP ${openaiResponse.status}: ${error}`))
      throw new Error(`OpenAI API error: ${error}`)
    }

    logger.apiCallEnd('openai', 'chat/completions', openaiResponse.status, apiDuration)

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0]?.message?.content

    if (!content) {
      logger.error('No content received from OpenAI', undefined, { 
        choices: openaiData.choices?.length || 0,
        usage: openaiData.usage 
      })
      throw new Error('No content received from OpenAI')
    }

    logger.info('OpenAI response received', {
      contentLength: content.length,
      usage: openaiData.usage
    })

    // Parse the generated content
    logger.debug('Parsing OpenAI response')
    let generatedFunnel
    try {
      // Clean the content - remove markdown code blocks if present
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      generatedFunnel = JSON.parse(cleanContent)
      logger.info('Successfully parsed OpenAI response', {
        hasIcp: !!generatedFunnel.icp,
        hasStrategy: !!generatedFunnel.strategy,
        hasCreatives: !!generatedFunnel.creatives,
        hasFlow: !!generatedFunnel.flow,
        hasKpis: !!generatedFunnel.kpis
      })
    } catch (parseError) {
      logger.error('Failed to parse OpenAI response', parseError as Error, { 
        contentPreview: content.substring(0, 200) 
      })
      throw new Error(`Failed to parse OpenAI response: ${(parseError as Error).message}`)
    }

    // Create complete funnel object with snake_case column names for database
    logger.debug('Creating complete funnel object')
    const funnelId = crypto.randomUUID()
    const timestamp = new Date().toISOString()
    
    const completeFunnel = {
      id: funnelId,
      name: generatedFunnel.name || 'Generated Marketing Funnel',
      description: generatedFunnel.description || 'AI-generated marketing funnel',
      status: 'draft',
      original_prompt: body.prompt, // snake_case for database
      icp: {
        id: crypto.randomUUID(),
        ...generatedFunnel.icp,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      strategy: {
        id: crypto.randomUUID(),
        ...generatedFunnel.strategy,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      creatives: {
        id: crypto.randomUUID(),
        ...generatedFunnel.creatives,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      flow: {
        id: crypto.randomUUID(),
        ...generatedFunnel.flow,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      kpis: {
        id: crypto.randomUUID(),
        ...generatedFunnel.kpis,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      metadata: {
        businessType: body.businessType || 'Not specified',
        industry: 'Auto-detected',
        targetMarket: body.targetMarket || 'Not specified',
        budget: body.budget || 'Not specified',
        timeline: body.timeline || 'Not specified',
      },
      user_id: body.userId, // snake_case for database
      created_at: timestamp, // snake_case for database
      updated_at: timestamp, // snake_case for database
    }

    // Initialize Supabase client
    logger.debug('Initializing Supabase client')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Store the funnel in the database
    logger.dbOperationStart('insert', 'funnels')
    const dbStartTime = performance.now()
    
    const { error: insertError } = await supabase
      .from('funnels')
      .insert([completeFunnel])

    const dbDuration = performance.now() - dbStartTime
    performanceMonitor.recordMetric('database_insert', dbDuration)

    if (insertError) {
      logger.dbOperationError('insert', 'funnels', insertError)
      logger.warn('Database insert failed, continuing without storage', { error: insertError.message })
      // Continue without failing - return the funnel even if storage fails
    } else {
      logger.dbOperationEnd('insert', 'funnels', dbDuration, 1)
      logger.info('Funnel successfully stored in database', { funnelId })
    }

    // Return the generated funnel with camelCase for API response
    logger.debug('Preparing response')
    const responseFunnel = {
      id: completeFunnel.id,
      name: completeFunnel.name,
      description: completeFunnel.description,
      status: completeFunnel.status,
      originalPrompt: completeFunnel.original_prompt,
      icp: completeFunnel.icp,
      strategy: completeFunnel.strategy,
      creatives: completeFunnel.creatives,
      flow: completeFunnel.flow,
      kpis: completeFunnel.kpis,
      metadata: completeFunnel.metadata,
      userId: completeFunnel.user_id,
      createdAt: completeFunnel.created_at,
      updatedAt: completeFunnel.updated_at,
    }

    const totalDuration = logger.endTimer('funnel_generation')
    logger.businessLogicEnd('funnel_generation', totalDuration, responseFunnel)

    const responseBody = JSON.stringify({
      success: true,
      funnel: responseFunnel,
      processingTime: totalDuration,
      metrics: {
        apiCallDuration: apiDuration,
        dbOperationDuration: dbDuration,
        totalDuration
      }
    })

    logger.requestEnd(200, responseBody.length)
    logger.info('Funnel generation completed successfully', {
      funnelId: completeFunnel.id,
      totalDuration,
      apiDuration,
      dbDuration
    })

    return new Response(responseBody, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    const errorInstance = error as Error
    ErrorTracker.trackError(errorInstance, logger['context'])
    
    logger.businessLogicError('funnel_generation', errorInstance)
    logger.critical('Funnel generation failed', errorInstance, {
      timestamp: new Date().toISOString()
    })
    
    const errorResponse = JSON.stringify({
      success: false,
      error: errorInstance.message || 'Internal server error',
      requestId: logger['context'].requestId,
      timestamp: new Date().toISOString()
    })

    logger.requestEnd(500, errorResponse.length)
    
    return new Response(errorResponse, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}) 