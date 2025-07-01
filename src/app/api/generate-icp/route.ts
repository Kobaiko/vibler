import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { brandData } = await request.json();

    if (!brandData) {
      return NextResponse.json({ error: 'Brand data is required' }, { status: 400 });
    }

    const prompt = `Based on the following comprehensive brand information, generate a highly targeted and specific Ideal Customer Profile (ICP):

BRAND ANALYSIS:
Brand Name: ${brandData.brandName}
Industry: ${brandData.industry}
Business Description: ${brandData.description}
Brand Keywords: ${brandData.keywords?.join(', ') || 'N/A'}
${brandData.logoUrl ? `Logo Available: Yes (indicates established brand presence)` : ''}
${brandData.primaryColor ? `Brand Colors: Primary ${brandData.primaryColor}, Secondary ${brandData.secondaryColor}` : ''}

TASK: Create a detailed ICP that reflects someone who would be genuinely interested in this specific brand based on the industry, keywords, and business description. Use the keywords to infer customer interests and pain points. Use the industry to determine realistic demographics and professional contexts.

Generate a comprehensive ICP that includes:
1. Demographics (age range, gender, income, education, location) - Make realistic for the industry
2. Psychographics (interests, values, lifestyle, personality traits) - Align with brand keywords
3. Professional info (job title, industry, company size, role) - Match the target industry context
4. Pain points and challenges - Derive from business description and keywords
5. Goals and motivations - What would drive them to this brand?
6. Preferred communication channels and platforms - Industry-appropriate
7. Buying behavior patterns - Realistic for the demographic and industry
8. Decision-making process - How they would evaluate this type of service/product

Respond in JSON format with the following structure:
{
  "demographics": {
    "ageRange": "25-35",
    "gender": "Mixed",
    "income": "$50,000-$75,000",
    "education": "Bachelor's degree",
    "location": "Urban areas, major cities"
  },
  "psychographics": {
    "interests": ["interest1", "interest2"],
    "values": ["value1", "value2"],
    "lifestyle": "description",
    "personality": "traits"
  },
  "professional": {
    "jobTitle": "Marketing Manager",
    "industry": "Technology",
    "companySize": "50-200 employees",
    "role": "Decision maker"
  },
  "painPoints": ["pain1", "pain2"],
  "goals": ["goal1", "goal2"],
  "communicationChannels": ["LinkedIn", "Email"],
  "buyingBehavior": "Research-driven, values ROI",
  "decisionProcess": "Evaluates multiple options, seeks peer recommendations"
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
          prompt: `You are an expert marketing strategist specializing in customer profiling. Generate detailed, accurate ICPs based on brand information. Always respond with valid JSON.\n\n${prompt}`,
          max_tokens: 1500,
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
        throw new Error(`ICP generation failed: ${pollResult.error}`);
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
    
    // Ensure we have a string
    if (typeof response !== 'string') {
      response = String(response);
    }

    // Parse the JSON response
    let icpData;
    try {
      console.log('Raw AI response type:', typeof response);
      console.log('Raw AI response length:', response.length);
      console.log('Raw AI response preview:', response.substring(0, 200));
      
      // Clean the response - remove markdown code blocks and extra text
      let cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^\s*Here.*?:\s*/i, '')
        .trim();
      
      // Find JSON object
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON object found in response:', cleanedResponse);
        throw new Error('No valid JSON found in AI response');
      }
      
      const jsonString = jsonMatch[0];
      console.log('Extracted JSON string preview:', jsonString.substring(0, 200));
      
      icpData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', response);
      console.error('Parse error:', parseError);
      throw new Error('Invalid response format from AI');
    }

    return NextResponse.json({
      success: true,
      icp: icpData
    });

  } catch (error) {
    console.error('ICP generation error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({
      error: 'Failed to generate ICP',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
} 