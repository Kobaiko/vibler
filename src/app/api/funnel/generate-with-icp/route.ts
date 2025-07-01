import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ICPData {
  id: string
  name: string
  title: string
  company: string
  industry: string
  company_size: string
  demographics: {
    age: string
    location: string
    education: string
    income: string
  }
  psychographics: {
    personality: string
    values: string[]
    interests: string[]
    lifestyle: string
  }
  pain_points: string[]
  goals: string[]
  challenges: string[]
  buying_behavior: {
    decisionMakingProcess: string
    influencers: string[]
    budget: string
    timeline: string
    preferredChannels: string[]
  }
  communication_preferences: {
    tone: string
    channels: string[]
    frequency: string
  }
  objections: string[]
  motivations: string[]
}

// Transform ICP data into funnel-compatible format
function transformICPForFunnel(icp: ICPData) {
  return {
    // Basic persona info
    name: icp.name,
    title: icp.title,
    company: icp.company,
    industry: icp.industry,
    companySize: icp.company_size,
    
    // Demographics
    age: icp.demographics.age,
    location: icp.demographics.location,
    education: icp.demographics.education,
    income: icp.demographics.income,
    
    // Psychographics
    personality: icp.psychographics.personality,
    values: icp.psychographics.values,
    interests: icp.psychographics.interests,
    lifestyle: icp.psychographics.lifestyle,
    
    // Business context
    painPoints: icp.pain_points,
    goals: icp.goals,
    challenges: icp.challenges,
    
    // Buying behavior
    decisionMakingProcess: icp.buying_behavior.decisionMakingProcess,
    influencers: icp.buying_behavior.influencers,
    budget: icp.buying_behavior.budget,
    timeline: icp.buying_behavior.timeline,
    preferredChannels: icp.buying_behavior.preferredChannels,
    
    // Communication
    communicationTone: icp.communication_preferences.tone,
    communicationChannels: icp.communication_preferences.channels,
    communicationFrequency: icp.communication_preferences.frequency,
    
    // Objections and motivations
    objections: icp.objections,
    motivations: icp.motivations
  }
}

// Generate enhanced prompt with ICP context
function generateICPEnhancedPrompt(basePrompt: string, icp: ICPData) {
  const icpContext = `
CUSTOMER PERSONA CONTEXT:
- Name: ${icp.name} (${icp.title} at ${icp.company})
- Industry: ${icp.industry} | Company Size: ${icp.company_size}
- Demographics: ${icp.demographics.age}, ${icp.demographics.location}, ${icp.demographics.education}, ${icp.demographics.income}
- Personality: ${icp.psychographics.personality}
- Values: ${icp.psychographics.values.join(', ')}
- Interests: ${icp.psychographics.interests.join(', ')}
- Lifestyle: ${icp.psychographics.lifestyle}

KEY PAIN POINTS:
${icp.pain_points.map(point => `- ${point}`).join('\n')}

PRIMARY GOALS:
${icp.goals.map(goal => `- ${goal}`).join('\n')}

MAIN CHALLENGES:
${icp.challenges.map(challenge => `- ${challenge}`).join('\n')}

BUYING BEHAVIOR:
- Decision Process: ${icp.buying_behavior.decisionMakingProcess}
- Budget: ${icp.buying_behavior.budget}
- Timeline: ${icp.buying_behavior.timeline}
- Influencers: ${icp.buying_behavior.influencers.join(', ')}
- Preferred Channels: ${icp.buying_behavior.preferredChannels.join(', ')}

COMMUNICATION PREFERENCES:
- Tone: ${icp.communication_preferences.tone}
- Channels: ${icp.communication_preferences.channels.join(', ')}
- Frequency: ${icp.communication_preferences.frequency}

COMMON OBJECTIONS:
${icp.objections.map(objection => `- ${objection}`).join('\n')}

KEY MOTIVATIONS:
${icp.motivations.map(motivation => `- ${motivation}`).join('\n')}

FUNNEL REQUIREMENTS:
${basePrompt}

Please create a marketing funnel that specifically addresses this customer persona's pain points, goals, and communication preferences. Ensure the funnel content, messaging, and channels align with their buying behavior and decision-making process.`

  return icpContext
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { icpId, prompt, businessType, targetMarket, budget, timeline, userId } = body

    if (!icpId || !prompt) {
      return NextResponse.json(
        { success: false, error: 'ICP ID and prompt are required' },
        { status: 400 }
      )
    }

    // Fetch ICP data from database
    const { data: icp, error: icpError } = await supabase
      .from('icps')
      .select('*')
      .eq('id', icpId)
      .single()

    if (icpError || !icp) {
      return NextResponse.json(
        { success: false, error: 'ICP not found' },
        { status: 404 }
      )
    }

    // Transform ICP data for funnel use
    const transformedICP = transformICPForFunnel(icp)
    
    // Generate enhanced prompt with ICP context
    const enhancedPrompt = generateICPEnhancedPrompt(prompt, icp)

    // Call the existing funnel generation endpoint with enhanced data
    const funnelRequest = {
      prompt: enhancedPrompt,
      businessType: businessType || icp.industry,
      targetMarket: targetMarket || `${icp.title}s in ${icp.industry}`,
      budget: budget || icp.buying_behavior.budget,
      timeline: timeline || icp.buying_behavior.timeline,
      userId: userId || 'anonymous',
      // Include the ICP data in the request
      icp: transformedICP
    }

    // Forward to the existing funnel generation endpoint
    const funnelResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-funnel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify(funnelRequest)
    })

    if (!funnelResponse.ok) {
      const errorData = await funnelResponse.json()
      return NextResponse.json(
        { success: false, error: errorData.error || 'Funnel generation failed' },
        { status: funnelResponse.status }
      )
    }

    const funnelData = await funnelResponse.json()

    // Update the funnel with ICP reference
    if (funnelData.success && funnelData.funnel) {
      const { error: updateError } = await supabase
        .from('funnels')
        .update({ 
          icp: transformedICP,
          metadata: {
            ...funnelData.funnel.metadata,
            icpId: icpId,
            icpName: icp.name,
            generatedWithICP: true
          }
        })
        .eq('id', funnelData.funnel.id)

      if (updateError) {
        console.error('Error updating funnel with ICP data:', updateError)
        // Continue anyway - the funnel was generated successfully
      }
    }

    return NextResponse.json({
      success: true,
      funnel: funnelData.funnel,
      icp: transformedICP,
      processingTime: funnelData.processingTime,
      message: 'Funnel generated successfully with ICP integration'
    })

  } catch (error) {
    console.error('Error in ICP-funnel integration:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 