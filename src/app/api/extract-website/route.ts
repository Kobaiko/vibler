import { NextRequest, NextResponse } from 'next/server'

interface ExtractedData {
  companyName: string
  description: string
  industry: string
  primaryColor: string
  secondaryColor: string
  logo: string
  fonts: string[]
  keywords: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { website } = await request.json()

    if (!website) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      )
    }

    // Validate URL
    let url: URL
    try {
      url = new URL(website.startsWith('http') ? website : `https://${website}`)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      )
    }

    // Fetch website content with better error handling
    let response;
    try {
      response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        // Add signal for timeout
        signal: AbortSignal.timeout(10000)
      });
    } catch (fetchError) {
      console.error('Fetch error details:', fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
      
      // Try with HTTP if HTTPS fails
      if (url.protocol === 'https:') {
        console.log('HTTPS failed, trying HTTP...');
        const httpUrl = new URL(url.toString().replace('https:', 'http:'));
        
        try {
          response = await fetch(httpUrl.toString(), {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            },
            signal: AbortSignal.timeout(10000)
          });
        } catch (httpError) {
          console.error('HTTP fallback also failed:', httpError);
          throw new Error(`Unable to fetch website: ${errorMessage}`);
        }
      } else {
        throw new Error(`Unable to fetch website: ${errorMessage}`);
      }
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`)
    }

    const html = await response.text()

    // Extract basic data using regex and meta tags
    const extractedData = await extractWebsiteData(html, url.origin)

    return NextResponse.json(extractedData)
  } catch (error) {
    console.error('Error extracting website data:', error)
    return NextResponse.json(
      { error: 'Failed to extract website data' },
      { status: 500 }
    )
  }
}

async function extractWebsiteData(html: string, origin: string): Promise<ExtractedData> {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : ''

  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  const description = descMatch ? descMatch[1].trim() : ''

  // Extract og:title
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
  const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : ''

  // Extract og:description
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
  const ogDescription = ogDescMatch ? ogDescMatch[1].trim() : ''

  // Determine company name first
  let companyName = ogTitle || title || ''
  companyName = companyName
    .replace(/\s*[-|–]\s*.*/g, '') // Remove everything after dash or pipe
    .replace(/\s*(home|homepage|welcome)\s*/gi, '') // Remove common homepage words
    .trim()

  // Extract colors from HTML and CSS first
  const colors = extractColors(html)
  
  // Extract keywords from content
  const keywords = extractKeywords(html, companyName)

  // Extract all possible logo candidates with improved patterns
  const logoCandidates: string[] = []
  const logoPatterns = [
    // Favicons with higher priority
    /<link[^>]*rel=["']icon["'][^>]*href=["']([^"']+)["']/ig,
    /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/ig,
    /<link[^>]*rel=["']shortcut icon["'][^>]*href=["']([^"']+)["']/ig,
    
    // Logo images with class or alt containing "logo" - enhanced patterns
    /<img[^>]*(?:class=["'][^"']*logo[^"']*["']|alt=["'][^"']*logo[^"']*["']|id=["'][^"']*logo[^"']*["'])[^>]*src=["']([^"']+)["']/ig,
    /<img[^>]*src=["']([^"']+)["'][^>]*(?:class=["'][^"']*logo[^"']*["']|alt=["'][^"']*logo[^"']*["']|id=["'][^"']*logo[^"']*["'])/ig,
    
    // Brand-related patterns
    /<img[^>]*(?:class=["'][^"']*brand[^"']*["']|alt=["'][^"']*brand[^"']*["']|id=["'][^"']*brand[^"']*["'])[^>]*src=["']([^"']+)["']/ig,
    /<img[^>]*src=["']([^"']+)["'][^>]*(?:class=["'][^"']*brand[^"']*["']|alt=["'][^"']*brand[^"']*["']|id=["'][^"']*brand[^"']*["'])/ig,
    
    // Header images (often logos) - enhanced to catch more patterns
    /<header[^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["'][^>]*[\s\S]*?<\/header>/ig,
    /<div[^>]*(?:class=["'][^"']*header[^"']*["']|id=["'][^"']*header[^"']*["'])[\s\S]*?<img[^>]*src=["']([^"']+)["']/ig,
    
    // Navigation logos - enhanced patterns
    /<nav[^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["'][^>]*[\s\S]*?<\/nav>/ig,
    /<div[^>]*(?:class=["'][^"']*nav[^"']*["']|id=["'][^"']*nav[^"']*["'])[\s\S]*?<img[^>]*src=["']([^"']+)["']/ig,
    
    // Images in common brand/logo containers
    /<div[^>]*(?:class=["'][^"']*(?:site-logo|site-brand|brand-logo|company-logo)[^"']*["']|id=["'][^"']*(?:site-logo|site-brand|brand-logo|company-logo)[^"']*["'])[\s\S]*?<img[^>]*src=["']([^"']+)["']/ig,
    
    // Common logo file patterns in any img tag
    /<img[^>]*src=["']([^"']*(?:logo|brand|header|identity)[^"']*)["']/ig,
    
    // SVG logos with logo-related attributes
    /<svg[^>]*(?:class=["'][^"']*logo[^"']*["']|id=["'][^"']*logo[^"']*["'])/ig,
    
    // Open Graph image (often contains logo)
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/ig,
    
    // Icon URLs from link tags and meta references (often high-quality SVGs)
    /<link[^>]*href=["']([^"']*icon[^"']*\.svg[^"']*)["']/ig,
    /<meta[^>]*content=["']([^"']*icon[^"']*\.svg[^"']*)["']/ig,
    
    // Catch any SVG file references in href or src attributes
    /(?:href|src)=["']([^"']*\.svg[^"']*)["']/ig,
    
    // Additional patterns for modern websites
    /<picture[\s\S]*?<img[^>]*src=["']([^"']*(?:logo|brand)[^"']*)["']/ig,
    /<figure[^>]*(?:class=["'][^"']*logo[^"']*["'])?[\s\S]*?<img[^>]*src=["']([^"']+)["']/ig,
    
    // WordPress specific patterns
    /<img[^>]*(?:class=["'][^"']*custom-logo[^"']*["']|class=["'][^"']*wp-image[^"']*["'])[^>]*src=["']([^"']+)["']/ig,
    
    // Schema.org logo markup
    /<img[^>]*(?:itemprop=["']logo["'])[^>]*src=["']([^"']+)["']/ig,
    /<div[^>]*(?:itemtype=["'][^"']*Organization[^"']*["'])[\s\S]*?<img[^>]*src=["']([^"']+)["']/ig
  ]
  
  console.log('Starting logo extraction with enhanced patterns...')
  
  for (const pattern of logoPatterns) {
    let match
    while ((match = pattern.exec(html)) !== null) {
      let url = match[1]
      if (url) {
        // Convert relative URLs to absolute
        if (!url.startsWith('http')) {
          url = url.startsWith('/') ? `${origin}${url}` : `${origin}/${url}`
        }
        if (!logoCandidates.includes(url)) {
          logoCandidates.push(url)
          console.log('Found logo candidate:', url)
        }
      }
    }
  }
  
  // Add common logo paths as fallbacks with more variations (SVG first for better quality)
  const commonLogoPaths = [
    '/icon.svg', '/logo.svg', '/logo.png', '/logo.jpg', '/logo.jpeg', '/logo.webp', // SVG first
    '/Icon.svg', '/Logo.svg', '/Logo.png', '/Logo.jpg', // Case variations
    '/assets/logo.svg', '/assets/logo.png', '/assets/images/logo.svg', '/assets/images/logo.png',
    '/images/logo.svg', '/images/logo.png', '/images/brand/logo.svg', '/images/brand/logo.png',
    '/static/logo.svg', '/static/logo.png', '/static/images/logo.svg', '/static/images/logo.png',
    '/img/logo.svg', '/img/logo.png', '/img/brand/logo.svg', '/img/brand/logo.png',
    '/media/logo.svg', '/media/logo.png',
    '/uploads/logo.svg', '/uploads/logo.png',
    '/content/logo.svg', '/content/logo.png',
    '/wp-content/uploads/logo.svg', '/wp-content/uploads/logo.png',
    '/dist/images/logo.svg', '/dist/images/logo.png',
    '/build/images/logo.svg', '/build/images/logo.png',
    `/${companyName.toLowerCase().replace(/\s+/g, '-')}-logo.png`,
    `/${companyName.toLowerCase().replace(/\s+/g, '')}-logo.png`,
    `/${companyName.toLowerCase().replace(/\s+/g, '_')}_logo.png`
  ]
  
  for (const path of commonLogoPaths) {
    const url = `${origin}${path}`
    if (!logoCandidates.includes(url)) {
      logoCandidates.push(url)
    }
  }
  
  console.log(`Found ${logoCandidates.length} logo candidates total`)

  // Use AI to analyze and improve the extraction first
  const aiEnhancedData = await enhanceWithAI({
    html: html.substring(0, 8000), // Increased to 8KB for better analysis
    companyName,
    description: ogDescription || description,
    colors,
    logoCandidates,
    keywords,
    origin
  })

  // Enhanced logo selection with better scoring as fallback for AI
  let logo: string = ''
  
  // First try scoring algorithm to get best logo candidates
  console.log('Running scoring algorithm for logo selection...')
  // Enhanced scoring system for logos
  const scoredLogos = []
  
  for (const candidate of logoCandidates) {
    try {
      console.log('Testing logo candidate:', candidate)
      const res = await fetch(candidate, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      if (res.ok) {
        let score = 0
        const url = candidate.toLowerCase()
        const contentType = res.headers.get('content-type') || ''
        const contentLength = parseInt(res.headers.get('content-length') || '0')
        
        console.log(`Logo candidate ${candidate}:`, { contentType, contentLength })
        
        // Higher score for explicit logo/brand paths
        if (url.includes('logo')) score += 15
        if (url.includes('icon') && url.includes('.svg')) score += 12 // Icon SVGs are often logos
        if (url.includes('brand')) score += 12
        if (url.includes('identity')) score += 10
        if (url.includes('header')) score += 8
        
        // Company name in filename gets high score
        const cleanCompanyName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (cleanCompanyName && url.includes(cleanCompanyName)) score += 20
        
        // Prefer high-quality image formats (SVG gets highest score)
        if (url.endsWith('.svg')) score += 15 // SVG is ideal for logos - highest priority
        if (url.endsWith('.png')) score += 8
        if (url.endsWith('.webp')) score += 6
        if (url.endsWith('.jpg') || url.endsWith('.jpeg')) score += 4
        
        // Content type validation - only score actual images
        if (contentType.includes('image/svg')) score += 8
        else if (contentType.includes('image/png')) score += 6
        else if (contentType.includes('image/webp')) score += 4
        else if (contentType.includes('text/html')) {
          // If it's HTML, it's probably a route, not an actual image file
          score -= 50 // Heavy penalty for non-image content
          console.log(`Penalizing ${candidate} for serving HTML instead of image`)
        }
        
        // File size considerations (logos are usually between 1KB and 500KB)
        if (contentLength > 1000 && contentLength < 500000) score += 5
        if (contentLength > 5000 && contentLength < 100000) score += 3 // Sweet spot for logos
        
        // Prefer logos in common directories
        if (url.includes('/assets/') || url.includes('/images/') || url.includes('/img/')) score += 4
        if (url.includes('/static/') || url.includes('/media/')) score += 3
        if (url.includes('/uploads/') || url.includes('/content/')) score += 2
        
        // Penalize very small icons (likely favicons) but not too much
        if (url.includes('favicon')) score -= 3
        if (url.includes('icon-16') || url.includes('icon-32')) score -= 5
        if (url.includes('apple-touch-icon')) score += 2 // These are often good quality
        
        // Prefer logos that aren't in deep subdirectories
        const pathDepth = (candidate.match(/\//g) || []).length
        if (pathDepth <= 4) score += 3
        if (pathDepth <= 3) score += 2
        
        // Bonus for being in root or main directories
        if (url.match(/^https?:\/\/[^\/]+\/[^\/]+\.(svg|png|webp|jpg)$/)) score += 5
        
        console.log(`Logo candidate ${candidate} scored: ${score}`)
        scoredLogos.push({ url: candidate, score })
      }
    } catch (error: any) {
      console.log(`Could not fetch logo candidate ${candidate}:`, error.message)
    }
  }
  
  // Sort by score and pick the best one
  if (scoredLogos.length > 0) {
    scoredLogos.sort((a, b) => b.score - a.score)
    logo = scoredLogos[0].url
    console.log('Selected logo by scoring:', logo, 'with score:', scoredLogos[0].score)
    
    // Log top candidates for debugging
    console.log('Top 3 logo candidates:')
    scoredLogos.slice(0, 3).forEach((scored, i) => {
      console.log(`${i + 1}. ${scored.url} (score: ${scored.score})`)
    })
  }
  
  // Use AI suggestion as backup if scoring didn't find anything good
  if (!logo && aiEnhancedData.logo) {
    console.log('No good scored logo found, using AI suggestion:', aiEnhancedData.logo)
    logo = aiEnhancedData.logo
  }

  // AI enhancement already done above

  // Better default color selection
  const selectBestColors = (extractedColors: string[]) => {
    if (extractedColors.length === 0) {
      return { primary: '#8b5cf6', secondary: '#06b6d4' }
    }
    
    // If we have colors, pick the first two that are different enough
    let primary = extractedColors[0]
    let secondary = extractedColors.length > 1 ? extractedColors[1] : '#06b6d4'
    
    // If colors are too similar, use a complementary color
    if (extractedColors.length > 2 && primary === secondary) {
      secondary = extractedColors[2]
    }
    
    return { primary, secondary }
  }
  
  const bestColors = selectBestColors(colors)

  return {
    companyName: aiEnhancedData.companyName || companyName,
    description: aiEnhancedData.description || ogDescription || description,
    industry: aiEnhancedData.industry || 'Technology',
    primaryColor: aiEnhancedData.primaryColor || bestColors.primary,
    secondaryColor: aiEnhancedData.secondaryColor || bestColors.secondary,
    logo,
    fonts: aiEnhancedData.fonts || [],
    keywords: aiEnhancedData.keywords || keywords
  }
}

function extractColors(html: string): string[] {
  const colors: string[] = []
  
  // Extract from inline styles and <style> tags
  const styleBlocks = [
    ...Array.from(html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)).map(m => m[1]),
    ...Array.from(html.matchAll(/style=["']([^"']+)["']/gi)).map(m => m[1])
  ]
  
  // Enhanced color regex to catch more formats
  const colorRegex = /#([0-9a-fA-F]{3,6})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|var\(--[^)]+\)/g
  
  for (const block of styleBlocks) {
    const matches = block.match(colorRegex)
    if (matches) {
      for (const color of matches) {
        if (!colors.includes(color)) colors.push(color)
      }
    }
  }
  
  // Extract from HTML attributes (background-color, color, etc.)
  const htmlColorMatches = html.match(/#([0-9a-fA-F]{3,6})\b/g)
  if (htmlColorMatches) {
    for (const color of htmlColorMatches) {
      if (!colors.includes(color)) colors.push(color)
    }
  }
  
  // Extract CSS custom properties (CSS variables)
  const cssVarMatches = html.match(/--[\w-]+:\s*#([0-9a-fA-F]{3,6})/g)
  if (cssVarMatches) {
    for (const match of cssVarMatches) {
      const color = match.match(/#([0-9a-fA-F]{3,6})/)?.[0]
      if (color && !colors.includes(color)) colors.push(color)
    }
  }
  
  // Extract from theme-color meta tag
  const themeColorMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i)
  if (themeColorMatch && themeColorMatch[1].startsWith('#')) {
    const color = themeColorMatch[1]
    if (!colors.includes(color)) colors.push(color)
  }
  
  // Filter out common/generic colors and normalize hex codes
  const filteredColors = colors
    .map(color => {
      // Normalize 3-digit hex to 6-digit
      if (color.match(/^#[0-9a-fA-F]{3}$/)) {
        return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
      }
      return color
    })
    .filter(color => {
      const commonColors = [
        '#fff', '#ffffff', '#000', '#000000', '#f8f9fa', '#f5f5f5', 
        '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#6c757d', '#495057',
        '#343a40', '#212529', '#ffffff', '#f1f3f4', '#f8f9fa'
      ]
      return !commonColors.includes(color.toLowerCase())
    })
    .slice(0, 10) // Get more colors to choose from
  
  return filteredColors
}

function extractKeywords(html: string, companyName: string): string[] {
  const keywords: string[] = []
  
  // Extract from meta keywords tag
  const metaKeywords = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i)
  if (metaKeywords) {
    const keywordList = metaKeywords[1].split(',').map(k => k.trim().toLowerCase())
    keywords.push(...keywordList.slice(0, 3))
  }
  
  // Extract from meta description
  const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  if (metaDesc) {
    const desc = metaDesc[1].toLowerCase()
    const commonKeywords = [
      'software', 'technology', 'business', 'service', 'solution', 'platform',
      'digital', 'innovation', 'development', 'consulting', 'marketing',
      'design', 'web', 'mobile', 'app', 'cloud', 'data', 'analytics',
      'ecommerce', 'finance', 'healthcare', 'education', 'entertainment',
      'media', 'social', 'security', 'ai', 'machine learning', 'blockchain'
    ]
    
    for (const keyword of commonKeywords) {
      if (desc.includes(keyword) && !keywords.includes(keyword)) {
        keywords.push(keyword)
        if (keywords.length >= 4) break
      }
    }
  }
  
  // Extract from page title and headings
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  
  const titleText = (titleMatch?.[1] || '').toLowerCase()
  const h1Text = (h1Match?.[1] || '').toLowerCase()
  
  const textContent = `${titleText} ${h1Text}`.replace(companyName.toLowerCase(), '')
  
  // Look for action words and industry terms
  const actionWords = [
    'create', 'build', 'develop', 'design', 'manage', 'optimize', 'analyze',
    'automate', 'integrate', 'transform', 'innovate', 'deliver', 'provide',
    'enable', 'empower', 'streamline', 'enhance', 'accelerate'
  ]
  
  for (const word of actionWords) {
    if (textContent.includes(word) && !keywords.includes(word)) {
      keywords.push(word)
      if (keywords.length >= 4) break
    }
  }
  
  // If we still don't have enough keywords, add some generic ones based on common patterns
  if (keywords.length < 3) {
    const fallbackKeywords = ['professional', 'quality', 'reliable', 'innovative']
    for (const keyword of fallbackKeywords) {
      if (!keywords.includes(keyword)) {
        keywords.push(keyword)
        if (keywords.length >= 4) break
      }
    }
  }
  
  return keywords.slice(0, 4) // Return max 4 keywords
}

async function enhanceWithAI(data: any): Promise<Partial<ExtractedData>> {
  if (!process.env.REPLICATE_API_TOKEN) {
    console.log('Skipping AI enhancement - no Replicate API key configured')
    return {}
  }
  try {
    const prompt = `System: You are a web scraping and branding assistant. Given the provided HTML, extracted color codes, and all possible logo URLs, select the best primary and secondary brand colors and the best logo URL. If no logo is found, suggest a likely logo URL based on common patterns. Always try to find a logo. Return only valid JSON with these fields: companyName, description, industry, primaryColor, secondaryColor, logo, fonts, keywords.\n\nUser: Analyze this website data and improve it:\nCompany Name: ${data.companyName}\nDescription: ${data.description}\nColors found: ${data.colors.join(', ')}\nLogo candidates: ${data.logoCandidates.join(', ')}\nKeywords found: ${data.keywords.join(', ')}\n\nHTML sample: ${data.html}\n\nPlease return improved data as JSON. Focus on:\n1. Clean company name (remove common suffixes like "Inc", "LLC")\n2. Better description if current one is poor\n3. Guess industry based on content\n4. Select best 2 colors for primary/secondary\n5. Select the best logo URL or suggest one if missing\n6. Provide 3-4 relevant brand keywords that describe the company's focus/values.`
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'openai/gpt-4o-mini',
        input: {
          prompt: prompt,
          max_tokens: 500,
          temperature: 0.3,
        }
      }),
    });
    if (!response.ok) {
      console.error(`Replicate API error: ${response.status}`)
      return {}
    }
    const result = await response.json();
    let pollResult = result;
    while (pollResult.status !== 'succeeded' && pollResult.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${pollResult.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });
      if (!pollResponse.ok) {
        console.error(`Polling failed: ${pollResponse.status}`);
        return {}
      }
      pollResult = await pollResponse.json();
      if (pollResult.status === 'failed') {
        console.error(`Enhancement failed: ${pollResult.error}`);
        return {}
      }
    }
    const content = (Array.isArray(pollResult.output) ? pollResult.output.join('') : pollResult.output || '').toString().trim()
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0])
      console.log('AI enhancement successful')
      return parsedData
    } else {
      console.error('No valid JSON found in Replicate response')
      return {}
    }
  } catch (error) {
    console.error('AI enhancement failed:', error)
    return {}
  }
} 