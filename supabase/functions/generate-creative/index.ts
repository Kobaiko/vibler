import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Get environment variables when needed
const getReplicateToken = () => {
  const token = Deno.env.get('REPLICATE_API_TOKEN');
  if (!token) {
    throw new Error('REPLICATE_API_TOKEN environment variable is required');
  }
  return token;
};

interface AdFormat {
  name: string;
      width: number;
      height: number;
  aspectRatio: string;
}

interface PlatformConfig {
  name: string;
  formats: AdFormat[];
}

// Platform configurations - ONLY the formats requested by user
const platformConfigs: Record<string, PlatformConfig> = {
  google: {
    name: 'Google Ads',
    formats: [
      { name: 'Medium Rectangle', width: 300, height: 250, aspectRatio: '5:4' },
      { name: 'Large Rectangle', width: 336, height: 280, aspectRatio: '5:4' },
      { name: 'Wide Skyscraper', width: 160, height: 600, aspectRatio: '2:3' }
    ]
  },
  facebook: {
    name: 'Facebook',
    formats: [
      { name: 'Feed Ad', width: 1200, height: 628, aspectRatio: '16:9' },
      { name: 'Story Ad', width: 1080, height: 1920, aspectRatio: '9:16' }
    ]
  },
  instagram: {
    name: 'Instagram',
    formats: [
      { name: 'Feed Post', width: 1080, height: 1080, aspectRatio: '1:1' },
      { name: 'Story Ad', width: 1080, height: 1920, aspectRatio: '9:16' }
    ]
  },
  linkedin: {
    name: 'LinkedIn',
    formats: [
      { name: 'Single Image Ad', width: 1200, height: 627, aspectRatio: '16:9' },
      { name: 'Sponsored Content', width: 1200, height: 1200, aspectRatio: '1:1' }
    ]
  }
};

// Generate visual concepts based on brand and industry
function generateVisualConcepts(businessDescription: string, targetAudience: string): string {
  const description = businessDescription.toLowerCase();
  const audience = targetAudience.toLowerCase();
  
  // Determine industry-specific visual concepts that are purely visual (no text)
  let visualConcepts = '';
  
  if (description.includes('software') || description.includes('tech') || description.includes('development')) {
    visualConcepts = 'sleek modern devices, clean digital interfaces, innovative workspace environments, abstract geometric patterns, futuristic design elements';
  } else if (description.includes('marketing') || description.includes('advertising') || description.includes('creative')) {
    visualConcepts = 'dynamic creative workspaces, collaborative team environments, modern office settings, vibrant color palettes, artistic design elements';
  } else if (description.includes('consulting') || description.includes('business') || description.includes('strategy')) {
    visualConcepts = 'professional meeting spaces, modern conference rooms, strategic planning environments, clean architectural lines, sophisticated business settings';
  } else if (description.includes('finance') || description.includes('investment') || description.includes('banking')) {
    visualConcepts = 'elegant financial environments, modern banking spaces, sophisticated investment settings, clean professional architecture, premium business aesthetics';
  } else if (description.includes('healthcare') || description.includes('medical') || description.includes('wellness')) {
    visualConcepts = 'clean medical environments, modern healthcare facilities, wellness-focused spaces, calming natural elements, professional care settings';
  } else if (description.includes('education') || description.includes('learning') || description.includes('training')) {
    visualConcepts = 'modern learning environments, collaborative educational spaces, innovative classroom settings, knowledge-sharing atmospheres, inspiring academic venues';
  } else if (description.includes('ecommerce') || description.includes('retail') || description.includes('shopping')) {
    visualConcepts = 'modern retail environments, elegant product displays, sophisticated shopping experiences, clean commercial spaces, premium brand aesthetics';
            } else {
    // Generic professional/business concepts
    visualConcepts = 'modern professional environments, clean business settings, sophisticated workplace aesthetics, contemporary design elements, premium commercial spaces';
  }
  
  // Add audience-specific visual elements
  if (audience.includes('manager') || audience.includes('executive') || audience.includes('director')) {
    visualConcepts += ', executive-level environments, leadership-focused settings, premium professional spaces';
  } else if (audience.includes('developer') || audience.includes('engineer') || audience.includes('technical')) {
    visualConcepts += ', technical innovation spaces, modern development environments, cutting-edge technology aesthetics';
  } else if (audience.includes('creative') || audience.includes('designer') || audience.includes('artist')) {
    visualConcepts += ', creative studio environments, artistic workspaces, design-focused settings';
  }
  
  console.log(`[Info] Generated visual concepts: ${visualConcepts}`);
  return visualConcepts;
}

// Retry logic with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      console.log(`[Retry] Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`[Retry] Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

// Google Imagen 3 supports flexible aspect ratios with exact dimensions

async function generateText(prompt: string, maxTokens: number = 1000): Promise<string> {
  try {
    console.log(`[Info] Generating text with OpenAI GPT-4o-mini via Replicate...`);
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
        'Authorization': `Token ${getReplicateToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        version: "openai/gpt-4o-mini",
        input: {
          prompt: prompt,
          max_tokens: maxTokens,
          temperature: 0.7,
        }
    }),
  });

  if (!response.ok) {
      const errorText = await response.text();
      console.error('[Error] Replicate GPT-4o-mini API Error:', errorText);
      throw new Error(`Replicate GPT-4o-mini request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    
    // Poll for completion
    let pollResult = result;
    while (pollResult.status !== 'succeeded' && pollResult.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${pollResult.id}`, {
        headers: {
          'Authorization': `Token ${getReplicateToken()}`,
        },
      });
      
      if (!pollResponse.ok) {
        throw new Error(`Polling failed: ${pollResponse.status}`);
      }
      
      pollResult = await pollResponse.json();
      
      if (pollResult.status === 'failed') {
        throw new Error(`Text generation failed: ${pollResult.error}`);
      }
    }
    
    const generatedText = pollResult.output;
    console.log('[Info] Text generated successfully with OpenAI via Replicate');
    
    return generatedText;
  } catch (error) {
    console.error('[Error] Text generation failed:', error);
    throw error;
  }
}

async function generateAdCopy(
  prompt: string, 
  tone: string, 
  targetAudience: string, 
  productService: string,
  brandSettings?: any,
  icpData?: any,
  strategyData?: any
): Promise<any> {
  // Extract comprehensive brand data
  const brandName = brandSettings?.brandName || 'Your Business';
  const brandDescription = brandSettings?.description || productService;
  const brandIndustry = brandSettings?.industry || 'business';
  const brandKeywords = brandSettings?.keywords?.join(', ') || '';
  const brandColors = `${brandSettings?.primaryColor || ''} ${brandSettings?.secondaryColor || ''}`.trim();
  
  // Extract comprehensive ICP data
  const demographics = icpData?.demographics || {};
  const psychographics = icpData?.psychographics || {};
  const professionalInfo = icpData?.professionalInfo || {};
  const painPoints = icpData?.painPoints?.join(', ') || 'business challenges';
  const goals = icpData?.goals?.join(', ') || 'growth and success';
  const preferredChannels = icpData?.preferredChannels?.join(', ') || '';
  const buyingBehavior = icpData?.buyingBehavior || '';
  
  // Extract strategy context
  const campaignObjectives = strategyData?.campaignRecommendations?.map((c: any) => c.objective).join(', ') || '';
  const keyMessages = strategyData?.campaignRecommendations?.flatMap((c: any) => c.keyMessages || []).join(', ') || '';
  const contentThemes = strategyData?.contentStrategy?.themes?.join(', ') || '';
  
  const adCopyPrompt = `You are a world-class marketing copywriter creating high-converting ad copy for ${brandName}.

MARKETING STRATEGY INTELLIGENCE:
${strategyData?.campaignRecommendations?.map((campaign: any, index: number) => `
Campaign ${index + 1}: "${campaign.name}"
- Platform: ${campaign.platform}
- Objective: ${campaign.objective}
- Key Messages: ${campaign.keyMessages?.join(' • ') || 'N/A'}
- Target Audience: ${campaign.audience}
`).join('') || 'No specific campaigns defined'}

Content Strategy:
- Themes: ${contentThemes}
- Tone: ${strategyData?.contentStrategy?.tone || tone}
- Content Types: ${strategyData?.contentStrategy?.contentTypes?.join(', ') || 'N/A'}

BRAND POSITIONING:
${brandName} is a ${brandIndustry} company that ${brandDescription}
Key differentiators: ${brandKeywords}

TARGET CUSTOMER PSYCHOLOGY:
- WHO: ${professionalInfo.jobTitle || targetAudience} at ${professionalInfo.companySize || 'companies'}
- PAIN: ${painPoints}
- DESIRE: ${goals}
- BUYING BEHAVIOR: ${buyingBehavior}

COPYWRITING BRIEF:
Write marketing copy that follows these proven advertising principles:
1. HOOK with emotional pain/desire (not features)
2. AGITATE the problem they're experiencing daily
3. POSITION your solution as the bridge to their desired outcome
4. Use POWER WORDS that trigger action
5. Create URGENCY without being pushy
6. Match the MARKETING STRATEGY messaging exactly

COPY REQUIREMENTS:
- Headline: Emotional hook that makes them stop scrolling (25-30 chars)
- Description: Benefit-focused copy that connects pain to solution (80-90 chars)
- CTA: Action-oriented with implied benefit (15-20 chars)

Use the marketing strategy's key messages: "${keyMessages}"
Incorporate these content themes: "${contentThemes}"

Write like a direct response marketer, not a corporate brochure. Make it COMPELLING and CONVERSION-FOCUSED.

Generate ONLY a JSON response:
{
  "headline": "Emotional hook headline here",
  "description": "Benefit-focused description that connects pain to solution",
  "cta": "Action CTA with benefit"
}`;

  try {
    console.log('[Info] Generating ad copy with OpenAI...');
    
    const rawResponse = await generateText(adCopyPrompt, 500);
    
    // Clean up the response to extract JSON
    let cleanResponse = rawResponse.trim();
    
    // Remove any markdown code blocks
    cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON object
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanResponse = jsonMatch[0];
    }
    
    console.log('[Info] Parsing ad copy response:', cleanResponse);
    
    const adCopy = JSON.parse(cleanResponse);
    
    // Validate required fields
    if (!adCopy.headline || !adCopy.description || !adCopy.cta) {
      throw new Error('Generated ad copy missing required fields');
    }
    
    console.log('[Info] Ad copy generated successfully:', adCopy);
    return adCopy;
    
  } catch (error) {
    console.error('[Error] Failed to generate ad copy:', error);
    
    // Create compelling marketing fallback using available data
    const painPoint = painPoints.split(',')[0]?.trim() || 'business challenges';
    const goal = goals.split(',')[0]?.trim() || 'growth';
    
    const fallbackCopy = {
      headline: `Stop ${painPoint.toLowerCase()}`,
      description: `${brandName} helps ${professionalInfo.jobTitle || targetAudience}s achieve ${goal.toLowerCase()} faster`,
      cta: `Get Results Now`
    };
    
    console.log('[Info] Using personalized fallback ad copy:', fallbackCopy);
    return fallbackCopy;
  }
}

async function generateImage(
  imagePrompt: string,
  format: AdFormat,
  headline?: string,
  description?: string,
  cta?: string
): Promise<string> {
  try {
    console.log('[Info] Generating image with Google Imagen 4 Ultra via Replicate...');
    
    // Map our ad format dimensions to Imagen 4 Ultra supported aspect ratios
    const imagen4AspectRatioMapping: Record<string, string> = {
      '300x250': '6:5',      // Medium Rectangle (300x250) -> closest aspect ratio
      '336x280': '6:5',      // Large Rectangle (336x280) -> closest aspect ratio  
      '160x600': '2:7',      // Wide Skyscraper (160x600) -> tall ratio
      '1200x628': '16:9',    // Facebook Feed -> wide
      '1080x1920': '9:16',   // Story Ad -> tall
      '1080x1080': '1:1',    // Square -> exact match
      '1200x627': '16:9',    // LinkedIn -> wide
      '1200x1200': '1:1'     // LinkedIn Square -> exact match
    };
    
    const originalSize = `${format.width}x${format.height}`;
    const aspectRatio = imagen4AspectRatioMapping[originalSize] || '1:1';
    
    console.log('[Info] Google Imagen 4 Ultra request details:', {
      originalSize: originalSize,
      mappedAspectRatio: aspectRatio,
      promptLength: imagePrompt.length,
      prompt: imagePrompt.substring(0, 200) + '...'
    });

    const requestBody = {
      version: "google/imagen-4-ultra",
      input: {
        prompt: imagePrompt,
        aspect_ratio: aspectRatio,
        safety_filter_level: "block_only_high",
        output_format: "jpg"
      }
    };
    
    console.log('[Info] Full request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${getReplicateToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[Info] Replicate API Response:', { status: response.status, statusText: response.statusText });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Error] Google Imagen 4 Ultra API Error:', errorText);
      throw new Error(`Google Imagen 4 Ultra request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const prediction = await response.json();
    console.log('[Info] Google Imagen 4 Ultra prediction started:', prediction.id);

    // Poll for completion
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes max wait for Imagen 4 Ultra (higher quality takes longer)

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      console.log(`[Info] Imagen 4 Ultra generation status: ${result.status} (attempt ${attempts + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${getReplicateToken()}`,
        },
      });
      
      if (pollResponse.ok) {
        result = await pollResponse.json();
      }
      attempts++;
    }

    if (result.status === 'failed') {
      console.error('[Error] Google Imagen 4 Ultra generation failed:', result.error);
      throw new Error(`Image generation failed: ${result.error}`);
    }
    
    if (result.status !== 'succeeded') {
      console.error('[Error] Google Imagen 4 Ultra generation timed out');
      throw new Error('Image generation timed out after 2 minutes');
    }

    const imageUrl = result.output; // Imagen 4 Ultra returns a single string URL
    console.log('[Info] Image generated successfully:', imageUrl);
    
    // Add cache-busting timestamp to force fresh images
    const cacheBustUrl = `${imageUrl}?t=${Date.now()}`;
    return cacheBustUrl;
  } catch (error) {
    console.error('[Error] Image generation failed:', error);
    throw error;
  }
}

async function generateAdCopyAndImage(
  prompt: string,
  tone: string,
  targetAudience: string,
  productService: string,
  format: AdFormat,
  visualStyle: string = 'premium-tech',
  brandColors?: string,
  icpData?: any,
  brandSettings?: any,
  strategyData?: any,
  tagline?: string
): Promise<any> {
  console.log(`[Info] Generating creative for ${format.name} (${format.width}x${format.height})`);
  
  // Generate ad copy 
  const adCopy = await generateAdCopy(prompt, tone, targetAudience, productService, brandSettings, icpData, strategyData);
  
  // Use provided tagline or fallback
  const finalTagline = tagline || 'Your solution awaits';
  
  console.log(`[Tagline] Using: "${finalTagline}"`);
  
  // Extract dynamic values for the prompt template
  const selectedStyle = visualStyle.replace('-', ' '); // Convert "premium-tech" to "premium tech"
  
  // Transform business description into visual concepts using brand context
  const businessDescription = brandSettings?.description || productService || 'innovative business solution';
  const brandIndustry = brandSettings?.industry || 'business';
  const brandKeywords = brandSettings?.keywords?.join(' ') || '';
  const icpJobTitle = icpData?.professionalInfo?.jobTitle || (Array.isArray(targetAudience) ? targetAudience.join(', ') : targetAudience);
  
  const visualConcepts = generateVisualConcepts(
    `${businessDescription} in ${brandIndustry} industry, keywords: ${brandKeywords}`, 
    icpJobTitle
  );
  
  const targetICP = targetAudience || 'business professionals';
  const colors = brandColors || 'modern professional colors';
  
  console.log('[Color Debug] Brand colors used for image:', colors);
  console.log('[Color Debug] Original brand colors:', brandColors);
  
  // Style-specific visual elements and prompting
  const styleConfig = {
    'premium-tech': {
      elements: 'sleek geometric forms, gradient overlays, and futuristic elements',
      promptStyle: 'high-tech, modern design with clean lines and premium feel',
      sceneType: 'abstract premium technology background'
    },
    'lifestyle-realistic': {
      elements: 'authentic scenes, natural lighting, and real-world environments',
      promptStyle: 'photorealistic lifestyle photography with real people using products in authentic settings',
      sceneType: 'real people in natural environments using technology or products'
    },
    'minimalist-abstract': {
      elements: 'abstract shapes, clean lines, and geometric forms',
      promptStyle: 'minimalist design with clean abstract forms',
      sceneType: 'clean abstract background with minimal elements'
    },
    'illustration-modern': {
      elements: 'illustrated elements, creative graphics, and artistic compositions',
      promptStyle: 'modern illustration style with creative graphic elements',
      sceneType: 'illustrated scene with modern graphic design elements'
    },
    'corporate-professional': {
      elements: 'professional settings, business imagery, and clean layouts',
      promptStyle: 'professional corporate environment with business imagery',
      sceneType: 'professional business setting with clean corporate aesthetic'
    },
    'creative-artistic': {
      elements: 'artistic textures, creative compositions, and expressive elements',
      promptStyle: 'artistic and creative composition with expressive visual elements',
      sceneType: 'creative artistic background with expressive compositions'
    },
    'retro-vintage': {
      elements: 'vintage textures, retro patterns, and nostalgic design elements',
      promptStyle: 'retro vintage aesthetic with nostalgic design patterns',
      sceneType: 'vintage-inspired background with retro design elements'
    },
    'bold-energetic': {
      elements: 'dynamic movement, vibrant energy, and powerful visual impact',
      promptStyle: 'bold energetic design with dynamic movement and vibrant colors',
      sceneType: 'dynamic energetic background with powerful visual impact'
    }
  };

  const currentStyleConfig = styleConfig[visualStyle as keyof typeof styleConfig] || styleConfig['premium-tech'];

  // Create image prompt that properly respects the visual style
  const brandName = brandSettings?.brandName || 'Business';
  const brandDescription = brandSettings?.description || productService;
  
  // Build a contextual prompt that varies significantly based on visual style
  let contextualPrompt = '';
  
  if (visualStyle === 'lifestyle-realistic') {
    // For lifestyle-realistic, create prompts with real people and authentic scenarios
    const targetDemographic = icpData?.demographics || targetAudience || 'professionals';
    contextualPrompt = `Create a ${currentStyleConfig.promptStyle} showing ${targetDemographic} authentically using ${brandDescription} in a real-world setting.

PHOTOREALISTIC REQUIREMENTS:
- Real people (not models) in natural, authentic poses
- Natural lighting and realistic environments
- Genuine interactions with technology or products
- Professional but approachable aesthetic
- Use brand colors: ${colors} as accent elements (not dominant)
- Show "${finalTagline}" as clean, modern typography overlay
- Authentic workplace or lifestyle environment
- High-quality photography style with natural depth of field

STRICT TEXT REQUIREMENTS:
- Only show "${finalTagline}" as readable text
- NO other text, labels, or written content
- Clean, professional typography for the tagline only`;
  } else {
    // For other styles, use more abstract/design-focused approaches
    contextualPrompt = `Create a professional advertising image with ${currentStyleConfig.promptStyle} for ${brandName}.

VISUAL DESIGN:
- ${currentStyleConfig.sceneType}
- Use brand colors: ${colors}
- Modern, clean aesthetic for ${brandIndustry} industry
- Professional quality suitable for advertising
- ${currentStyleConfig.elements}

COMPOSITION REQUIREMENTS:
- Show "${finalTagline}" prominently as the main text element
- NO other text, bullet points, requirements, or descriptions
- Clean, modern typography for the tagline
- Focus on visual impact with tagline as the centerpiece
- NO company names, additional text, or design specifications visible
- High-quality ${currentStyleConfig.promptStyle}`;
  }

  console.log(`[Image Generation] Using ${visualStyle} style with enhanced prompting`);
  console.log(`[Image Generation] Style config:`, currentStyleConfig);

  console.log(`[Image Generation] Generating clean image`);

  // Generate image (only pass the prompt and format)
  const imageUrl = await generateImage(contextualPrompt, format);
  
  // Generate proper targeting information based on ICP data
  const targetingInfo = icpData ? 
    `${icpData.demographics || targetAudience} in ${brandIndustry} industry` : 
    `${targetAudience} in ${brandIndustry}`;
  
  const result = {
    format: format.name,
    dimensions: `${format.width}x${format.height}`,
    headline: adCopy.headline,
    description: adCopy.description,
    call_to_action: adCopy.cta, // Return as string, not object
    target_audience: targetingInfo, // Add proper targeting
    tagline: finalTagline,
    logo_url: brandSettings?.logoUrl,
    image_url: imageUrl,
    aspectRatio: format.aspectRatio
  };
  
  console.log(`[Info] Creative result for ${format.name}:`, {
    format: result.format,
    dimensions: result.dimensions,
    aspectRatio: result.aspectRatio,
    tagline: result.tagline
  });
  
  return result;
}



// Generate punchy punchline for image overlay using the existing text generation function
async function generatePunchline(marketingPrompt: string, brandSettings: any, icpData: any): Promise<string> {
  const punchlinePrompt = `Create a short, punchy punchline for an advertisement image overlay. This will be the main text on the image.

Context:
- Brand: ${brandSettings?.companyName || 'Business'}
- Industry: ${brandSettings?.industry || 'General'}
- Target: ${icpData?.demographics || 'Professionals'}
- Pain Points: ${icpData?.painPoints?.join(', ') || 'Various challenges'}
- Marketing Message: ${marketingPrompt}

Requirements:
- Maximum 6 words
- Provocative, intriguing, or benefit-focused
- Memorable and attention-grabbing
- Creates curiosity or desire
- Speaks to target audience pain/goals

Style examples:
- "We're nice, until we're not"
- "What flight delay?"
- "Saving you money makes us smile"
- "Your data. Everywhere."
- "Try 6 issues for $6"
- "The perfect addition to date night"

Generate ONLY the punchline text - no quotes, explanations, or additional text.`;

  try {
    console.log('[Punchline] Generating with prompt...');
    const punchlineText = await generateText(punchlinePrompt, 30);
    const cleanPunchline = punchlineText.trim().replace(/['"]/g, '').replace(/\n/g, ' ');
    console.log('[Punchline] Generated successfully:', cleanPunchline);
    return cleanPunchline;
  } catch (error) {
    console.error('[Error] Failed to generate punchline, using fallback:', error);
    
    // Industry-specific fallback punchlines
    const industry = brandSettings?.industry?.toLowerCase() || '';
    const companyName = brandSettings?.companyName || '';
    
    let fallbacks = [];
    
    if (industry.includes('security') || industry.includes('cyber')) {
      fallbacks = ["Security. Simplified.", "Your shield. Our strength.", "Threats end here.", "Safe. Secure. Simple."];
    } else if (industry.includes('marketing') || industry.includes('automation')) {
      fallbacks = ["Growth on autopilot", "Marketing made simple", "Results. Delivered.", "Your growth partner"];
    } else if (industry.includes('saas') || industry.includes('software')) {
      fallbacks = ["Software that works", "Simple. Powerful. Yours.", "Built for results", "Your solution awaits"];
    } else if (industry.includes('consulting') || industry.includes('business')) {
      fallbacks = ["Results that matter", "Your success partner", "Growth. Guaranteed.", "Business. Elevated."];
    } else if (industry.includes('finance') || industry.includes('fintech')) {
      fallbacks = ["Money made simple", "Your financial edge", "Wealth. Simplified.", "Finance reimagined"];
    } else if (industry.includes('healthcare') || industry.includes('medical')) {
      fallbacks = ["Health made simple", "Care that counts", "Wellness. Delivered.", "Your health partner"];
    } else if (industry.includes('education') || industry.includes('learning')) {
      fallbacks = ["Learn. Grow. Excel.", "Knowledge unlocked", "Education evolved", "Your learning edge"];
    } else {
      // Generic business fallbacks
      fallbacks = ["Results that matter", "Your success starts here", "Progress. Delivered.", "Make it happen"];
    }
    
    // Add company name to some punchlines if available
    if (companyName && companyName.length <= 15) {
      fallbacks.push(`${companyName}. Delivered.`);
      fallbacks.push(`${companyName} works.`);
    }
    
    const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    console.log('[Punchline] Using industry-specific fallback:', randomFallback);
    return randomFallback;
  }
}

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      prompt, 
      platforms, 
      tone, 
      targetAudience, 
      productService, 
      visualStyle = 'premium-tech',
      tagline,
      brandSettings,
      icpInsights,
      campaignContext
    } = await req.json()
    
    console.log('[Info] Edge Function - Received request for platforms:', platforms);
    console.log('[Info] Visual style selected:', visualStyle);
    console.log('[Info] Visual style type:', typeof visualStyle);
    console.log('[Info] Brand settings:', brandSettings);
    console.log('[Info] ICP insights available:', !!icpInsights);
    console.log('[Info] Strategy context available:', !!campaignContext);
    
    // Extract brand colors from brandSettings
    const brandColors = brandSettings ? 
      `${brandSettings.primaryColor || ''} ${brandSettings.secondaryColor || ''}`.trim() : 
      undefined;
    
    console.log('[Info] Brand colors extracted:', brandColors);
    console.log('[Info] Primary color:', brandSettings?.primaryColor);
    console.log('[Info] Secondary color:', brandSettings?.secondaryColor);
    
    // Use icpInsights as icpData and campaignContext as strategyData
    const icpData = icpInsights;
    const strategyData = campaignContext;
    
    if (!getReplicateToken()) {
      throw new Error('REPLICATE_API_TOKEN environment variable is required');
    }

    const results: any[] = [];
    const errors: string[] = [];

    // Process each platform sequentially to avoid rate limits
    for (const platformName of platforms) {
      const config = platformConfigs[platformName.toLowerCase()];
      if (!config) {
        console.error(`[Error] Unknown platform: ${platformName}`);
        errors.push(`Unknown platform: ${platformName}`);
        continue;
      }

      console.log(`[Info] Starting generation for ${platformName}`);

      try {
        // Process each format for this platform
        for (const format of config.formats) {
          console.log(`[Info] Starting generation for ${platformName} - ${format.name}`);
          
          const creative = await retryWithBackoff(
            () => generateAdCopyAndImage(prompt, tone, targetAudience, productService, format, visualStyle, brandColors, icpData, brandSettings, strategyData, tagline),
            3,
            2000
          );
          
          results.push({
            platform: platformName,
            ...creative
          });
          
          console.log(`[Info] Successfully generated creative for ${platformName} - ${format.name}`);
          
          // Small delay between formats to be respectful to API
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error: any) {
        const errorMessage = `Failed to generate creative for ${platformName}: ${error.message}`;
        console.error(`[Error] ${errorMessage}`);
        errors.push(errorMessage);
      }
    }

    console.log(`[Info] All creative generations completed. Success: ${results.length}, Errors: ${errors.length}`);

    if (results.length === 0) {
      console.error('[Error] All creative generations failed');
      throw new Error(`All creative generations failed: ${errors.join('; ')}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        creatives: results,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error: any) {
    console.error('[Error] Edge Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.toString()
      }),
      { 
      status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})
