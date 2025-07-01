import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Fallback function to generate sample creatives when Edge Function fails
function generateFallbackCreatives(body: any) {
  const platforms = body.platforms || ['LinkedIn']
  const brandName = body.brandSettings?.brandName || 'Your Brand'
  
  const sampleCreatives = platforms.map((platform: string, index: number) => ({
    platform: platform,
    format: platform === 'LinkedIn' ? 'Single Image Ad' : 
             platform === 'Facebook' ? 'Feed Ad' : 
             platform === 'Instagram' ? 'Feed Post' : 
             'Single Image Ad',
    dimensions: platform === 'LinkedIn' ? '1200x627' : 
                platform === 'Facebook' ? '1200x628' : 
                platform === 'Instagram' ? '1080x1080' : 
                '1200x627',
    headline: `Transform Your Business with ${brandName}`,
    description: `Discover how ${brandName} helps professionals achieve better results. Join thousands of satisfied customers and see the difference.`,
    call_to_action: 'Learn More',
    target_audience: body.targetAudience || 'Business professionals',
    tagline: body.tagline || `${brandName} - Excellence in Every Detail`,
    logo_url: body.brandSettings?.logoUrl || '',
    image_url: `https://picsum.photos/seed/${platform}-${index}/1200/627`,
    aspectRatio: platform === 'LinkedIn' ? '16:9' : 
                 platform === 'Facebook' ? '16:9' : 
                 platform === 'Instagram' ? '1:1' : 
                 '16:9'
  }))
  
  return {
    success: true,
    creatives: sampleCreatives,
    fallback: true
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('API Route - Received body:', {
      ...body,
      includeVisuals: body.includeVisuals,
      imageGenerationType: body.imageGenerationType,
      visualStyle: body.visualStyle,
      uploadedImagesCount: body.uploadedImages?.length || 0,
      hasBrandSettings: !!body.brandSettings,
      hasIcpInsights: !!body.icpInsights,
      hasCampaignContext: !!body.campaignContext
    })
    
    // Check if Supabase credentials are available
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Supabase credentials missing, using fallback creatives')
      return NextResponse.json(generateFallbackCreatives(body))
    }
    
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // Call the Supabase Edge Function for creative generation
      console.log('API Route - Calling Edge Function with enhanced data...')
      
      const { data, error } = await supabase.functions.invoke('generate-creative', {
        body: {
          prompt: body.prompt,
          platforms: body.platforms,
          tone: body.tone,
          targetAudience: body.targetAudience,
          productService: body.productService,
          includeVisuals: body.includeVisuals !== undefined ? body.includeVisuals : true,
          imageGenerationType: body.imageGenerationType || 'ai',
          uploadedImages: body.uploadedImages || [],
          visualStyle: body.visualStyle || 'premium-tech',
          tagline: body.tagline,
          brandSettings: body.brandSettings,
          icpInsights: body.icpInsights,
          campaignContext: body.campaignContext,
          strategyData: body.campaignContext // Also pass as strategyData for compatibility
        }
      })

      if (error) {
        console.error('Supabase Edge Function error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        console.warn('Edge Function failed, using fallback creatives')
        return NextResponse.json(generateFallbackCreatives(body))
      }

      console.log('API Route - Edge Function response:', {
        creativesCount: data?.creatives?.length || 0,
        hasImages: data?.creatives?.some((c: any) => c.image_url) || false,
        success: data?.success,
        hasError: !!data?.error
      })

      // Ensure the response has the expected structure
      if (!data || !data.success) {
        console.error('Edge Function returned unsuccessful response:', data)
        console.warn('Edge Function unsuccessful, using fallback creatives')
        return NextResponse.json(generateFallbackCreatives(body))
      }

      return NextResponse.json(data)
    } catch (supabaseError) {
      console.error('Supabase connection error:', supabaseError)
      console.warn('Supabase failed, using fallback creatives')
      return NextResponse.json(generateFallbackCreatives(body))
    }
  } catch (error) {
    console.error('Error generating creatives:', error)
    // Even if there's a general error, try to return fallback creatives
    try {
      const body = await request.json()
      return NextResponse.json(generateFallbackCreatives(body))
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Internal server error', 
        success: false 
      }, { status: 500 })
    }
  }
}
