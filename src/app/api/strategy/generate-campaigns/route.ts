import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { brandData, icpData, marketingBudget } = await request.json();

    if (!brandData || !icpData || !marketingBudget) {
      return NextResponse.json(
        { success: false, error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Convert budget to number for calculations
    const budgetValue = parseInt(marketingBudget);
    
    // Get budget range text for context
    const getBudgetRange = (budget: string) => {
      switch (budget) {
        case '1000': return '$1,000 - $2,500';
        case '2500': return '$2,500 - $5,000';
        case '5000': return '$5,000 - $10,000';
        case '10000': return '$10,000 - $25,000';
        case '25000': return '$25,000 - $50,000';
        case '50000': return '$50,000+';
        default: return '$5,000 - $10,000';
      }
    };

    const prompt = `You are a marketing strategist creating campaigns for a client. Generate 3 distinct marketing campaigns with intelligent budget distribution.

BRAND INFORMATION:
- Name: ${brandData.brandName}
- Industry: ${brandData.industry}
- Description: ${brandData.description}
- Keywords: ${brandData.keywords?.join(', ') || 'N/A'}

TARGET CUSTOMER:
- Job Title: ${icpData.jobTitle || 'Not specified'}
- Company Size: ${icpData.companySize || 'Not specified'}
- Pain Points: ${icpData.painPoints?.join(', ') || 'Not specified'}
- Goals: ${icpData.goals?.join(', ') || 'Not specified'}
- Preferred Channels: ${icpData.preferredChannels?.join(', ') || 'Not specified'}
- Demographics: Age ${icpData.demographics?.ageRange}, Income ${icpData.demographics?.income}, Location ${icpData.demographics?.location}

MONTHLY MARKETING BUDGET: ${getBudgetRange(marketingBudget)}

REQUIREMENTS:
1. Create exactly 3 campaigns with different objectives and platforms
2. Distribute the budget intelligently across campaigns (they don't need equal amounts)
3. Choose platforms based on the industry, target audience, and budget
4. Replace any mention of "Twitter" with "Twitter/X"
5. Each campaign should have a clear explanation of why it will be effective

For each campaign, provide:
- name: Creative campaign name
- platform: Primary advertising platform (LinkedIn, Facebook, Instagram, Twitter/X, Google Ads, etc.)
- objective: What this campaign aims to achieve
- audience: Specific target audience description
- budget: Monthly budget allocation in dollars (be specific, not a range)
- duration: Recommended duration
- keyMessages: Array of 3 key messages
- explanation: 2-3 sentences explaining why this campaign will be effective for this specific business and audience

Return ONLY a JSON object with this structure:
{
  "campaigns": [
    {
      "name": "Campaign Name",
      "platform": "Platform Name",
      "objective": "Campaign objective",
      "audience": "Target audience",
      "budget": "$X,XXX/month",
      "duration": "X months",
      "keyMessages": ["Message 1", "Message 2", "Message 3"],
      "explanation": "Why this campaign will be effective..."
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a marketing strategist. Generate intelligent marketing campaigns with budget distribution. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    // Parse the JSON response
    const campaignData = JSON.parse(content);
    
    if (!campaignData.campaigns || !Array.isArray(campaignData.campaigns)) {
      throw new Error('Invalid campaign format');
    }

    return NextResponse.json({
      success: true,
      campaigns: campaignData.campaigns
    });

  } catch (error) {
    console.error('Error generating campaigns:', error);
    
    // Get the original values for fallback
    const { brandData: fallbackBrandData, icpData: fallbackIcpData, marketingBudget: fallbackMarketingBudget } = await request.json();
    
    // Fallback campaigns if AI generation fails
    const fallbackBudgetValue = parseInt(fallbackMarketingBudget);
    const fallbackCampaigns = [
      {
        name: "Lead Generation Campaign",
        platform: "LinkedIn",
        objective: "Generate qualified leads and build brand awareness",
        audience: fallbackIcpData.jobTitle || "Business professionals",
        budget: `$${Math.round(fallbackBudgetValue * 0.5).toLocaleString()}/month`,
        duration: "3 months",
        keyMessages: ["Industry expertise", "Proven results", "Trusted partner"],
        explanation: "LinkedIn is ideal for B2B lead generation with professional targeting options. This budget allocation focuses on the highest-converting platform for business audiences."
      },
      {
        name: "Brand Awareness Campaign",
        platform: fallbackBrandData.industry?.toLowerCase().includes('tech') ? "Twitter/X" : "Facebook",
        objective: "Build brand recognition and thought leadership",
        audience: `${fallbackIcpData.demographics?.ageRange || 'Professional'} ${fallbackBrandData.industry} professionals`,
        budget: `$${Math.round(fallbackBudgetValue * 0.3).toLocaleString()}/month`,
        duration: "3 months", 
        keyMessages: ["Innovation leader", "Customer success", "Market expertise"],
        explanation: "This platform reaches a broader audience to build brand recognition. The lower budget allocation maximizes reach while maintaining cost efficiency."
      },
      {
        name: "Retargeting Campaign",
        platform: "Google Ads",
        objective: "Convert warm prospects and website visitors",
        audience: "Website visitors and email subscribers",
        budget: `$${Math.round(fallbackBudgetValue * 0.2).toLocaleString()}/month`,
        duration: "3 months",
        keyMessages: ["Solution focused", "Quality delivery", "Growth partner"],
        explanation: "Google Ads retargeting converts high-intent visitors at lower cost. This smaller budget allocation targets the highest-converting audience segment."
      }
    ];

    return NextResponse.json({
      success: true,
      campaigns: fallbackCampaigns
    });
  }
} 