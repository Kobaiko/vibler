import type { StrategyGenerationRequest } from '@/types/strategy'

export function createCompleteStrategyPrompt(request: StrategyGenerationRequest): string {
  const { prompt, businessType, targetMarket, budget, timeline, icpContext } = request

  return `
Generate a comprehensive marketing strategy based on the following requirements:

**Primary Objective:** ${prompt}

**Business Context:**
- Business Type: ${businessType || 'Not specified'}
- Target Market: ${targetMarket || 'Not specified'}
- Budget: ${budget || 'Not specified'}
- Timeline: ${timeline || 'Not specified'}

${icpContext ? `**Ideal Customer Profile Context:**\n${icpContext}\n` : ''}

CRITICAL: You must return ONLY valid JSON that matches this EXACT structure. Pay special attention to data types:

{
  "title": "Strategy Title Here",
  "description": "Brief strategy description",
  "channels": [
    {
      "name": "Channel Name",
      "description": "Channel description",
      "budgetAllocation": 25,
      "expectedROI": 150,
      "timeline": "3 months",
      "tactics": ["tactic1", "tactic2"],
      "kpis": ["kpi1", "kpi2"]
    }
  ],
  "messagingPillars": [
    {
      "title": "Pillar Title",
      "description": "Pillar description",
      "keyMessages": ["message1", "message2"],
      "taglines": ["tagline1", "tagline2", "tagline3"],
      "targetAudience": "audience description",
      "channels": ["channel1", "channel2"]
    }
  ],
  "timeline": [
    {
      "phase": "Phase Name",
      "duration": "2 months",
      "objectives": ["objective1"],
      "activities": ["activity1"],
      "deliverables": ["deliverable1"],
      "budget": 2500
    }
  ],
  "budget": {
    "totalBudget": 10000,
    "currency": "USD",
    "channels": {
      "Digital Advertising": {
        "amount": 5000,
        "percentage": 50,
        "breakdown": {
          "Google Ads": 3000,
          "Facebook Ads": 2000
        }
      }
    },
    "contingency": 1000,
    "timeline": "6 months"
  },
  "competitiveAnalysis": {
    "competitors": [
      {
        "name": "Competitor Name",
        "strengths": ["strength1"],
        "weaknesses": ["weakness1"],
        "marketPosition": "Market leader",
        "estimatedBudget": "$50,000/month"
      }
    ],
    "opportunities": ["opportunity1"],
    "threats": ["threat1"],
    "differentiators": ["differentiator1"]
  },
  "riskAssessment": [
    "Risk 1: Description and mitigation strategy",
    "Risk 2: Description and mitigation strategy"
  ],
  "successMetrics": [
    "Metric 1: Target and measurement method",
    "Metric 2: Target and measurement method"
  ],
  "recommendations": [
    "Recommendation 1: Action and timeline",
    "Recommendation 2: Action and timeline"
  ]
}

CRITICAL REQUIREMENTS:
1. expectedROI MUST be a NUMBER (not string) - example: 150 not "150%"
2. budgetAllocation MUST be a NUMBER - example: 25 not "25%"
3. budget in timeline phases MUST be a NUMBER - example: 2500 not "$2,500"
4. totalBudget MUST be a NUMBER - example: 10000 not "$10,000"
5. amount in budget.channels MUST be a NUMBER - example: 5000 not "$5,000"
6. competitiveAnalysis MUST be an OBJECT (not array)
7. riskAssessment MUST be an ARRAY of STRINGS (not objects)
8. successMetrics MUST be an ARRAY of STRINGS (not objects)
9. recommendations MUST be an ARRAY of STRINGS (not objects)
10. taglines MUST be an ARRAY of exactly 3 SHORT taglines (3-6 words each) that can be used as image overlays

TAGLINE REQUIREMENTS:
- Generate exactly 3 taglines per messaging pillar
- Each tagline should be 3-6 words maximum
- Make them punchy, provocative, and memorable
- They should work as image overlays for advertisements
- Examples: "We're nice, until we're not", "What flight delay?", "Your solution awaits"
- Focus on emotional hooks, benefits, or intriguing statements
- Avoid generic corporate speak

Return ONLY the JSON object, no markdown formatting, no explanations.`
} 