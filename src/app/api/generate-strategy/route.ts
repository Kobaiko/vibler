import { NextRequest, NextResponse } from 'next/server';

interface StrategyData {
  overview: {
    objective: string;
    timeline: string;
    budget: string;
    kpis: string[];
  };
  targetChannels: {
    primary: string[];
    secondary: string[];
    reasoning: string;
  };
  contentStrategy: {
    themes: string[];
    contentTypes: string[];
    postingFrequency: string;
    tone: string;
  };
  campaignRecommendations: Array<{
    name: string;
    platform: string;
    objective: string;
    audience: string;
    budget: string;
    duration: string;
    keyMessages: string[];
  }>;
  timeline: Array<{
    phase: string;
    duration: string;
    activities: string[];
    deliverables: string[];
  }>;
  success_metrics: {
    awareness: string[];
    engagement: string[];
    conversion: string[];
    retention: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const { brandData, icpData, additionalContext } = await request.json();

    if (!brandData || !icpData) {
      return NextResponse.json({ error: 'Brand data and ICP data are required' }, { status: 400 });
    }

    const prompt = `Based on the following comprehensive brand and customer profile information, generate a highly targeted and actionable marketing strategy:

BRAND ANALYSIS:
Brand Name: ${brandData.brandName}
Industry: ${brandData.industry}
Business Description: ${brandData.description}
Brand Keywords: ${brandData.keywords?.join(', ') || 'N/A'}
Primary Color: ${brandData.primaryColor || 'N/A'}
Secondary Color: ${brandData.secondaryColor || 'N/A'}
${brandData.logoUrl ? 'Logo: Available (established brand presence)' : 'Logo: Not available'}

IDEAL CUSTOMER PROFILE:
Demographics:
- Age Range: ${icpData.demographics?.ageRange || 'Not specified'}
- Gender: ${icpData.demographics?.gender || 'Not specified'}
- Income: ${icpData.demographics?.income || 'Not specified'}
- Education: ${icpData.demographics?.education || 'Not specified'}
- Location: ${icpData.demographics?.location || 'Not specified'}

Professional Context:
- Job Title: ${icpData.jobTitle || 'Not specified'}
- Company Size: ${icpData.companySize || 'Not specified'}
- Budget: ${icpData.budget || 'Not specified'}

Psychographics:
- Interests: ${icpData.psychographics?.interests?.join(', ') || 'Not specified'}
- Values: ${icpData.psychographics?.values?.join(', ') || 'Not specified'}
- Lifestyle: ${icpData.psychographics?.lifestyle || 'Not specified'}
- Personality: ${icpData.psychographics?.personality || 'Not specified'}

Behavioral Patterns:
- Buying Patterns: ${icpData.behavioral?.buyingPatterns || 'Not specified'}
- Brand Loyalty: ${icpData.behavioral?.brandLoyalty || 'Not specified'}
- Decision Making: ${icpData.behavioral?.decisionMaking || 'Not specified'}
- Media Consumption: ${icpData.behavioral?.mediaConsumption?.join(', ') || 'Not specified'}

Pain Points: ${icpData.painPoints?.join(', ') || 'Not specified'}
Goals: ${icpData.goals?.join(', ') || 'Not specified'}
Preferred Channels: ${icpData.preferredChannels?.join(', ') || 'Not specified'}

${additionalContext ? `Additional Context: ${additionalContext}` : ''}

TASK: Create a comprehensive, actionable marketing strategy that leverages the brand's strengths and directly addresses the ICP's pain points, goals, and preferred channels. Use the industry context and brand keywords to inform channel selection and messaging.

Generate a detailed marketing strategy that includes:

1. **Overview**: Strategic objective aligned with ICP goals, realistic timeline, budget recommendations, and key KPIs that matter to this specific audience
2. **Target Channels**: Primary and secondary channels based on ICP's preferred channels and media consumption, with clear reasoning
3. **Content Strategy**: Content themes that resonate with ICP interests and values, content types that fit their consumption habits, posting frequency, and tone that matches their personality
4. **Campaign Recommendations**: 3-4 specific campaigns with platform, objective, audience targeting, budget allocation, duration, and key messages that address pain points
5. **Implementation Timeline**: Phased approach with activities and deliverables that build toward ICP goals
6. **Success Metrics**: Metrics organized by awareness, engagement, conversion, and retention that align with business objectives

Ensure the strategy is:
- Specifically tailored to this exact ICP and brand combination
- Realistic and achievable within typical marketing budgets
- Focused on addressing the identified pain points and goals
- Optimized for the preferred communication channels
- Aligned with the brand's industry and positioning

Respond in JSON format with the following structure:
{
  "overview": {
    "objective": "Clear objective that addresses ICP goals",
    "timeline": "Realistic timeline",
    "budget": "Budget recommendation range",
    "kpis": ["KPI 1", "KPI 2", "KPI 3", "KPI 4", "KPI 5"]
  },
  "targetChannels": {
    "primary": ["Channel 1", "Channel 2", "Channel 3"],
    "secondary": ["Channel 4", "Channel 5", "Channel 6"],
    "reasoning": "Detailed explanation based on ICP analysis"
  },
  "contentStrategy": {
    "themes": ["Theme 1", "Theme 2", "Theme 3", "Theme 4"],
    "contentTypes": ["Type 1", "Type 2", "Type 3", "Type 4", "Type 5"],
    "postingFrequency": "Specific frequency recommendation",
    "tone": "Tone that matches ICP personality"
  },
  "campaignRecommendations": [
    {
      "name": "Campaign Name",
      "platform": "Platform",
      "objective": "Specific objective",
      "audience": "Audience description",
      "budget": "Budget range",
      "duration": "Duration",
      "keyMessages": ["Message 1", "Message 2", "Message 3"]
    }
  ],
  "timeline": [
    {
      "phase": "Phase Name",
      "duration": "Duration",
      "activities": ["Activity 1", "Activity 2"],
      "deliverables": ["Deliverable 1", "Deliverable 2"]
    }
  ],
  "success_metrics": {
    "awareness": ["Metric 1", "Metric 2"],
    "engagement": ["Metric 1", "Metric 2"],
    "conversion": ["Metric 1", "Metric 2"],
    "retention": ["Metric 1", "Metric 2"]
  }
}`;

    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "meta/meta-llama-3-70b-instruct",
        input: {
          prompt: `You are an expert marketing strategist with 15+ years of experience creating data-driven marketing strategies. You specialize in aligning marketing tactics with specific customer profiles and brand positioning. Always respond with valid JSON.\n\n${prompt}`,
          max_tokens: 2000,
          temperature: 0.7,
        }
      }),
    });

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      throw new Error(`Replicate request failed: ${replicateResponse.status} ${replicateResponse.statusText} - ${errorText}`);
    }

    const result = await replicateResponse.json();
    
    // Poll for completion
    let pollResult = result;
    while (pollResult.status !== 'succeeded' && pollResult.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${pollResult.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });
      
      if (!pollResponse.ok) {
        throw new Error(`Polling failed: ${pollResponse.status}`);
      }
      
      pollResult = await pollResponse.json();
      
      if (pollResult.status === 'failed') {
        throw new Error(`Strategy generation failed: ${pollResult.error}`);
      }
    }

    let response = pollResult.output;
    
    if (!response) {
      throw new Error('No response from AI');
    }

    // Handle array response from Llama model
    if (Array.isArray(response)) {
      response = response.join('');
    }

    // Parse the JSON response
    let strategyData;
    try {
      // Clean the response - sometimes models add extra text before/after JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response;
      strategyData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', response);
      console.error('Parse error:', parseError);
      throw new Error('Invalid response format from AI');
    }

    return NextResponse.json({
      success: true,
      strategy: strategyData
    });

  } catch (error) {
    console.error('Strategy generation error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({
      error: 'Failed to generate strategy',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
} 