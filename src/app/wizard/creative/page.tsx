'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ImageUpload, UploadedImage } from '@/components/ui/ImageUpload';
import LayeredAdEditor from '@/components/ui/LayeredAdEditor';
import DrawingAnimation from '@/components/ui/DrawingAnimation';
import { ArrowLeft, ArrowRight, Palette, Loader2, Wand2, CheckCircle, Download, Edit, Eye, Upload as UploadIcon, Sparkles } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

interface Creative {
  id: string;
  platform: string;
  format: string;
  headline: string;
  description: string;
  call_to_action: string;
  punchline?: string; // Add punchline field
  image_url: string;
  targeting: string;
  campaign_type: string;
  dimensions: string; // e.g., "300x250"
  
  // New composition data for layered editing
  composition?: {
    baseImage: string;
    finalComposition: string;
    layers: AdLayer[];
    dimensions: {
      width: number;
      height: number;
    };
  };
}

interface AdLayer {
  id: string;
  type: 'text' | 'button' | 'logo' | 'decoration' | 'image' | 'shape' | 'background';
  content: string;
  position: {
    x: number; // percentage
    y: number; // percentage
  };
  size: {
    width: number; // percentage
    height: number; // percentage
  };
  style: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    padding?: number;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: 'normal' | 'bold' | '600' | '700';
    zIndex: number;
    opacity?: number;
  };
  editable: boolean;
}

export default function CreativeGeneratorPage() {
  const router = useRouter();
  const [step, setStep] = useState<'generate' | 'review'>('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [regeneratingCreativeId, setRegeneratingCreativeId] = useState<string | null>(null);
  const [brandData, setBrandData] = useState(null);
  const [icpData, setIcpData] = useState(null);
  const [strategyData, setStrategyData] = useState(null);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
  // New state for image generation preferences
  const [imageGenerationType, setImageGenerationType] = useState<'ai' | 'upload' | 'both'>('ai');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  
  // Style selection for AI-generated images
  const [selectedStyle, setSelectedStyle] = useState<string>('premium-tech');
  
  // New state for tagline selection
  const [selectedTagline, setSelectedTagline] = useState<string>('');
  const [customTagline, setCustomTagline] = useState<string>('');
  const [availableTaglines, setAvailableTaglines] = useState<string[]>([]);
  
  // Available visual styles for AI-generated images
  const availableStyles = [
    {
      id: 'premium-tech',
      name: 'Premium Tech',
      description: 'Clean, modern style like Apple/Tesla ads with dramatic lighting',
      example: 'Sleek product shots, gradient backgrounds, premium feel'
    },
    {
      id: 'lifestyle-realistic',
      name: 'Lifestyle Realistic',
      description: 'Real people using products in authentic settings',
      example: 'Natural lighting, candid moments, relatable scenarios'
    },
    {
      id: 'minimalist-abstract',
      name: 'Minimalist Abstract',
      description: 'Simple geometric shapes and clean compositions',
      example: 'Bold colors, negative space, geometric patterns'
    },
    {
      id: 'illustration-modern',
      name: 'Modern Illustration',
      description: 'Stylized illustrations with vibrant colors',
      example: 'Vector-style graphics, bright palettes, creative interpretations'
    },
    {
      id: 'corporate-professional',
      name: 'Corporate Professional',
      description: 'Business-focused imagery with professional aesthetics',
      example: 'Office settings, handshakes, charts, clean layouts'
    },
    {
      id: 'creative-artistic',
      name: 'Creative Artistic',
      description: 'Artistic and expressive with unique visual elements',
      example: 'Creative compositions, artistic filters, unique perspectives'
    },
    {
      id: 'retro-vintage',
      name: 'Retro Vintage',
      description: 'Nostalgic aesthetics with vintage color palettes',
      example: 'Film grain, muted colors, classic typography styles'
    },
    {
      id: 'bold-energetic',
      name: 'Bold & Energetic',
      description: 'High-energy visuals with dynamic compositions',
      example: 'Bright colors, motion blur, explosive layouts'
    }
  ];

  // Modal state for the ad editor
  const [showAdEditor, setShowAdEditor] = useState(false);
  const [editingCreative, setEditingCreative] = useState<Creative | null>(null);

  // Available platforms for selection
  const availablePlatforms = [
    { id: 'linkedin', name: 'LinkedIn', description: 'Professional network ads' },
    { id: 'google', name: 'Google Ads', description: 'Search and display ads' },
    { id: 'facebook', name: 'Facebook', description: 'Social media advertising' },
    { id: 'instagram', name: 'Instagram', description: 'Visual social platform' },
    { id: 'tiktok', name: 'TikTok', description: 'Short-form video content' },
    { id: 'email', name: 'Email Marketing', description: 'Direct email campaigns' }
  ];



  useEffect(() => {
    // Load data from previous steps
    const savedBrandData = localStorage.getItem('wizard_brand_data');
    const savedIcpData = localStorage.getItem('wizard_icp_data');
    const savedStrategyData = localStorage.getItem('wizard_strategy_data');
    const savedCompleteStrategyData = localStorage.getItem('wizard_complete_strategy_data');
    
    if (savedBrandData && savedIcpData && savedStrategyData) {
      setBrandData(JSON.parse(savedBrandData));
      setIcpData(JSON.parse(savedIcpData));
      const strategy = JSON.parse(savedStrategyData);
      setStrategyData(strategy);
      
      // Extract taglines from the complete strategy data (has messagingPillars with taglines)
      const taglines: string[] = [];
      
      if (savedCompleteStrategyData) {
        try {
          const completeStrategy = JSON.parse(savedCompleteStrategyData);
          console.log('🏷️ Loading complete strategy with taglines:', completeStrategy);
          
          if (completeStrategy.messagingPillars && Array.isArray(completeStrategy.messagingPillars)) {
            completeStrategy.messagingPillars.forEach((pillar: any) => {
              if (pillar.taglines && Array.isArray(pillar.taglines)) {
                taglines.push(...pillar.taglines);
              }
            });
          }
        } catch (error) {
          console.error('Failed to parse complete strategy data:', error);
        }
      }
      
      // Fallback taglines if none found in complete strategy
      if (taglines.length === 0) {
        const fallbackTaglines = [
          'Excellence delivered',
          'Your success partner',
          'Results that matter',
          'Innovation unleashed',
          'Smart solutions',
          'Fast results'
        ];
        taglines.push(...fallbackTaglines);
        console.log('🏷️ Using fallback taglines:', fallbackTaglines);
      }
      
      // Set available taglines and select the first one by default
      console.log('🏷️ Available taglines for creative generation:', taglines);
      setAvailableTaglines(taglines);
      if (taglines.length > 0) {
        setSelectedTagline(taglines[0]);
      }
      
      // Don't set default platforms - let user choose explicitly
      // setSelectedPlatforms(['linkedin']); // Optional: start with one platform selected
    } else {
      // Redirect back if missing data
      router.push('/wizard');
    }
  }, [router]);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const generateCreatives = async (isMore = false) => {
    if (!brandData || !icpData || !strategyData) return;
    
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform to generate creatives for.');
      return;
    }
    
    // Validate image upload requirements
    if (imageGenerationType === 'upload' && uploadedImages.length === 0) {
      alert('Please upload at least one image to continue with the upload option.');
      return;
    }
    
    if (isMore) {
      setIsGeneratingMore(true);
    } else {
      setIsGenerating(true);
    }
    
    try {
      // Prepare uploaded images data if needed
      let uploadedImagesData: string[] = [];
      if (imageGenerationType === 'upload' || imageGenerationType === 'both') {
        uploadedImagesData = await Promise.all(
          uploadedImages.map(img => fileToBase64(img.file))
        );
      }

      console.log('🎨 Frontend Debug - Sending request with:', {
        selectedStyle,
        visualStyle: selectedStyle,
        platforms: selectedPlatforms,
        imageGenerationType
      });

      // Get the final tagline to use
      const finalTagline = customTagline.trim() || selectedTagline;
      
      const requestPayload = {
        prompt: `Create professional ads for ${(brandData as any).brandName} targeting ${(icpData as any).jobTitle}`,
        platforms: selectedPlatforms,
        tone: 'professional',
        targetAudience: (icpData as any).jobTitle,
        productService: (brandData as any).description,
        includeVisuals: imageGenerationType === 'ai' || imageGenerationType === 'both',
        imageGenerationType,
        uploadedImages: uploadedImagesData,
        visualStyle: selectedStyle,
        tagline: finalTagline,
        brandSettings: brandData,
        icpInsights: icpData,
        campaignContext: strategyData
      };

      console.log('🎨 EXACT REQUEST PAYLOAD:', JSON.stringify(requestPayload, null, 2));

      const response = await fetch('/api/creatives/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      console.log('🔍 Response details:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const data = await response.json();
        const transformedCreatives: Creative[] = data.creatives.map((creative: any, index: number) => {
          const baseId = isMore ? creatives.length + index + 1 : index + 1;
          
          // Debug: Check if we got an AI-generated image
          console.log('Creative image data:', {
            platform: creative.platform,
            has_image_url: !!creative.image_url,
            image_url_type: creative.image_url ? (creative.image_url.startsWith('data:') ? 'base64' : 'url') : 'none',
            image_url_length: creative.image_url?.length
          });
          
          // Handle different image sources
          let finalImageUrl = creative.image_url;
          
          // If we have uploaded images and no AI image was generated, use uploaded image
          if (!finalImageUrl && uploadedImagesData.length > 0) {
            finalImageUrl = uploadedImagesData[index % uploadedImagesData.length];
          }
          
          if (!finalImageUrl) {
            // Show a cool AI generation animation
            const svgContent = `
              <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                  </linearGradient>
                  <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:rgba(255,255,255,0);stop-opacity:0" />
                    <stop offset="50%" style="stop-color:rgba(255,255,255,0.8);stop-opacity:1" />
                    <stop offset="100%" style="stop-color:rgba(255,255,255,0);stop-opacity:0" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                <!-- Background -->
                <rect width="100%" height="100%" fill="url(#bgGradient)"/>
                
                <!-- Floating particles -->
                <circle cx="50" cy="80" r="3" fill="#ffffff" opacity="0.6">
                  <animate attributeName="cy" values="80;40;80" dur="3s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
                </circle>
                <circle cx="350" cy="120" r="2" fill="#ffffff" opacity="0.4">
                  <animate attributeName="cy" values="120;60;120" dur="4s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite"/>
                </circle>
                <circle cx="150" cy="200" r="2.5" fill="#ffffff" opacity="0.5">
                  <animate attributeName="cy" values="200;160;200" dur="3.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx="300" cy="220" r="2" fill="#ffffff" opacity="0.3">
                  <animate attributeName="cy" values="220;180;220" dur="4.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.3;0.7;0.3" dur="4.5s" repeatCount="indefinite"/>
                </circle>
                
                <!-- Central AI brain icon -->
                <g transform="translate(200,150)">
                  <!-- Brain outline -->
                  <path d="M-25,-20 C-35,-25 -35,-35 -25,-40 C-15,-45 -5,-45 5,-40 C15,-45 25,-45 35,-40 C45,-35 45,-25 35,-20 C35,-10 35,0 25,10 C15,15 5,15 -5,15 C-15,15 -25,10 -35,0 C-35,-10 -35,-20 -25,-20 Z" 
                        fill="none" stroke="#ffffff" stroke-width="2" opacity="0.8" filter="url(#glow)">
                    <animate attributeName="stroke-dasharray" values="0 200;100 200;0 200" dur="2s" repeatCount="indefinite"/>
                  </path>
                  
                  <!-- Neural network nodes -->
                  <circle cx="-15" cy="-15" r="3" fill="#ffffff" opacity="0.9">
                    <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="0" cy="-20" r="2.5" fill="#ffffff" opacity="0.8">
                    <animate attributeName="r" values="2.5;4;2.5" dur="1.8s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="15" cy="-10" r="3" fill="#ffffff" opacity="0.9">
                    <animate attributeName="r" values="3;5;3" dur="1.3s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="-10" cy="5" r="2" fill="#ffffff" opacity="0.7">
                    <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="10" cy="8" r="2.5" fill="#ffffff" opacity="0.8">
                    <animate attributeName="r" values="2.5;4.5;2.5" dur="1.6s" repeatCount="indefinite"/>
                  </circle>
                  
                  <!-- Connecting lines -->
                  <line x1="-15" y1="-15" x2="0" y2="-20" stroke="#ffffff" stroke-width="1" opacity="0.5">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
                  </line>
                  <line x1="0" y1="-20" x2="15" y2="-10" stroke="#ffffff" stroke-width="1" opacity="0.5">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/>
                  </line>
                  <line x1="-15" y1="-15" x2="-10" y2="5" stroke="#ffffff" stroke-width="1" opacity="0.5">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
                  </line>
                  <line x1="15" y1="-10" x2="10" y2="8" stroke="#ffffff" stroke-width="1" opacity="0.5">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="1.3s" repeatCount="indefinite"/>
                  </line>
                </g>
                
                <!-- Shimmer effect -->
                <rect width="100%" height="100%" fill="url(#shimmer)" opacity="0.3">
                  <animateTransform attributeName="transform" type="translate" values="-400 0;400 0;-400 0" dur="3s" repeatCount="indefinite"/>
                </rect>
                
                <!-- Text -->
                <text x="50%" y="70%" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" filter="url(#glow)">
                  AI Generating ${creative.platform} Image
                </text>
                <text x="50%" y="80%" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#ffffff" opacity="0.9">
                  Using Ideogram v2
                </text>
                
                <!-- Progress dots -->
                <g transform="translate(200,250)">
                  <circle cx="-20" cy="0" r="3" fill="#ffffff">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0s"/>
                  </circle>
                  <circle cx="0" cy="0" r="3" fill="#ffffff">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.3s"/>
                  </circle>
                  <circle cx="20" cy="0" r="3" fill="#ffffff">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.6s"/>
                  </circle>
                </g>
              </svg>
            `;
            
            // Use Unicode-safe base64 encoding for browser compatibility
            finalImageUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
          }
          
          // Debug log to see what we're getting from API
          console.log('🔍 Raw creative from API:', creative);
          
          // Safely convert all fields to ensure they're not objects
          return {
            id: String(baseId),
            platform: String(creative.platform || ''),
            format: String(creative.format || 'Single Image'),
            headline: String(creative.headline || ''),
            description: String(creative.description || ''),
            call_to_action: String(typeof creative.call_to_action === 'object' ? creative.call_to_action?.text || 'Learn More' : creative.call_to_action || 'Learn More'),
            punchline: String(creative.punchline || ''), 
            image_url: String(finalImageUrl || ''),
            targeting: String(creative.target_audience || ''),
            campaign_type: String('Lead Generation'),
            dimensions: String(creative.dimensions || '300x250'),
            
            // Include composition data if available
            composition: creative.composition ? {
              baseImage: creative.composition.baseImage || '',
              finalComposition: creative.composition.finalComposition || '',
              layers: Array.isArray(creative.composition.layers) ? creative.composition.layers.map((layer: any) => {
                // Debug log to see what we're getting
                console.log('🔍 Processing layer:', layer);
                
                // Ensure we're not passing objects as React children
                const safeLayers = {
                  id: String(layer.id || ''),
                  type: String(layer.type || 'text'),
                  content: String(layer.content || ''),
                  position: {
                    x: Number(layer.position?.x) || 0,
                    y: Number(layer.position?.y) || 0
                  },
                  size: {
                    width: Number(layer.size?.width) || 100,
                    height: Number(layer.size?.height) || 50
                  },
                  style: {
                    fontSize: Number(layer.style?.fontSize) || 14,
                    fontFamily: String(layer.style?.fontFamily) || 'Arial',
                    color: String(layer.style?.color) || '#000000',
                    backgroundColor: String(layer.style?.backgroundColor) || 'transparent',
                    borderRadius: Number(layer.style?.borderRadius) || 0,
                    textAlign: String(layer.style?.textAlign) || 'left',
                    fontWeight: String(layer.style?.fontWeight) || 'normal',
                    zIndex: Number(layer.style?.zIndex) || 1,
                    opacity: Number(layer.style?.opacity) || 1
                  },
                  editable: Boolean(layer.editable !== false)
                };
                
                console.log('🔍 Safe layer:', safeLayers);
                return safeLayers;
              }) : [],
              dimensions: {
                width: Number(creative.composition.dimensions?.width) || 300,
                height: Number(creative.composition.dimensions?.height) || 250
              }
            } : undefined
          };
        });
        
        if (isMore) {
          setCreatives(prev => [...prev, ...transformedCreatives]);
        } else {
          setCreatives(transformedCreatives);
          setStep('review');
        }
      } else {
        console.error('❌ API request failed:', {
          status: response.status,
          statusText: response.statusText
        });
        
        try {
          const errorData = await response.json();
          console.error('❌ Error response body:', errorData);
        } catch (e) {
          console.error('❌ Could not parse error response as JSON');
        }
        
        if (!isMore) {
          generateSampleCreatives();
        }
      }
    } catch (error) {
      console.error('Error generating creatives:', error);
      if (!isMore) {
        generateSampleCreatives();
      }
    } finally {
      setIsGenerating(false);
      setIsGeneratingMore(false);
    }
  };

  // Generate high-quality background image for creative
  const generateCreativeImage = (platform: string, brandName: string, industry: string) => {
    // Use Unsplash for high-quality, professional images
    const categories = {
      'LinkedIn': ['business', 'office', 'professional', 'technology', 'workspace'],
      'Facebook': ['lifestyle', 'social', 'community', 'modern', 'vibrant'],
      'Instagram': ['aesthetic', 'minimal', 'trendy', 'creative', 'lifestyle'],
      'TikTok': ['dynamic', 'colorful', 'energy', 'youth', 'modern'],
      'Google Ads': ['business', 'clean', 'professional', 'tech', 'corporate'],
      'Email Marketing': ['professional', 'clean', 'business', 'modern', 'tech']
    };
    
    // Industry-specific keywords
    const industryKeywords = {
      'Technology': ['tech', 'digital', 'computer', 'innovation', 'modern'],
      'Healthcare': ['medical', 'health', 'wellness', 'clean', 'professional'],
      'Finance': ['business', 'corporate', 'professional', 'modern', 'success'],
      'E-commerce': ['shopping', 'retail', 'product', 'modern', 'lifestyle'],
      'Education': ['learning', 'knowledge', 'books', 'academic', 'growth'],
      'Real Estate': ['architecture', 'building', 'home', 'modern', 'luxury'],
      'Food & Beverage': ['food', 'restaurant', 'fresh', 'organic', 'delicious'],
      'Fashion': ['fashion', 'style', 'clothing', 'trendy', 'aesthetic'],
      'Travel': ['travel', 'destination', 'adventure', 'landscape', 'journey'],
      'Fitness': ['fitness', 'health', 'workout', 'active', 'energy']
    };
    
    const platformCategories = categories[platform as keyof typeof categories] || ['business', 'professional'];
    const industryWords = industryKeywords[industry as keyof typeof industryKeywords] || ['business'];
    
    // Combine platform and industry keywords
    const allKeywords = [...platformCategories, ...industryWords];
    const selectedKeyword = allKeywords[Math.floor(Math.random() * allKeywords.length)];
    
    // Get platform dimensions for proper aspect ratio
    const dimensions = {
      'LinkedIn': '1080x1080',
      'Facebook': '1200x630', 
      'Instagram': '1080x1080',
      'TikTok': '1080x1920',
      'Google Ads': '1080x1080',
      'Email Marketing': '1200x630'
    };
    
    const size = dimensions[platform as keyof typeof dimensions] || '1080x1080';
    
    // Use Unsplash API for high-quality images with specific parameters
    return `https://images.unsplash.com/${size}/?${selectedKeyword},${brandName.toLowerCase()},professional,modern&fit=crop&auto=format&q=80`;
  };

  const generateSampleCreatives = () => {
    const sampleCreatives: Creative[] = [
      {
        id: '1',
        platform: 'LinkedIn',
        format: 'Single Image Ad', // Default format for sample creative
        headline: `Transform Your ${(brandData as any).industry} Workflow`,
        description: `Discover how ${(brandData as any).brandName} helps professionals like you achieve better results.`,
        call_to_action: 'Learn More',
        image_url: generateCreativeImage('LinkedIn', (brandData as any).brandName, (brandData as any).industry),
        targeting: (icpData as any).jobTitle,
        campaign_type: 'Lead Generation',
        dimensions: '1200x627'
      }
    ];
    setCreatives(sampleCreatives);
    setStep('review');
  };

  const handleEditCreative = async (creative: Creative) => {
    try {
      // Set up the creative data with proper brand settings for modal editing
      const editorData = {
        ...creative,
        primaryColor: (brandData as any).primaryColor,
        secondaryColor: (brandData as any).secondaryColor,
        brandName: (brandData as any).brandName
      };
      
      // Open modal editor instead of navigating away
      setEditingCreative(editorData);
      setShowAdEditor(true);
      
    } catch (error) {
      console.error('Error opening ad editor:', error);
      alert('Error opening editor. Please try again.');
    }
  };

  const regenerateCreative = async (creativeId: string, platform: string) => {
    setRegeneratingCreativeId(creativeId);
    try {
      // Get the specific creative being regenerated to preserve its format
      const originalCreative = creatives.find(c => c.id === creativeId);
      if (!originalCreative) {
        throw new Error('Creative not found');
      }

      // Prepare uploaded images data if needed
      let uploadedImagesData: string[] = [];
      if (imageGenerationType === 'upload' || imageGenerationType === 'both') {
        uploadedImagesData = await Promise.all(
          uploadedImages.map(img => fileToBase64(img.file))
        );
      }

      // Use the same data and parameters as the original generation
      const response = await fetch('/api/creatives/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: [platform], // This will regenerate ALL formats for this platform
          prompt: `Create professional ads for ${(brandData as any).brandName} targeting ${(icpData as any).jobTitle}`,
          tone: 'professional',
          targetAudience: (icpData as any).jobTitle,
          productService: (brandData as any).description,
          includeVisuals: imageGenerationType === 'ai' || imageGenerationType === 'both',
          imageGenerationType,
          uploadedImages: uploadedImagesData,
          brandSettings: brandData,
          icpInsights: icpData,
          campaignContext: strategyData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.creatives && result.creatives.length > 0) {
          // Find the new creative that matches the original format
          const newCreative = result.creatives.find((c: any) => 
            c.platform === originalCreative.platform && c.format === originalCreative.format
          ) || result.creatives[0]; // Fallback to first if format not found
          
          const transformedCreative: Creative = {
            id: creativeId, // Keep the same ID
            platform: newCreative.platform,
            format: newCreative.format || originalCreative.format, // Preserve original format
            headline: newCreative.headline,
            description: newCreative.description,
            call_to_action: newCreative.call_to_action,
            punchline: newCreative.punchline, // Add punchline mapping
            image_url: newCreative.image_url,
            targeting: newCreative.targeting || 'Mid to senior-level professionals, managers, consultants',
            campaign_type: newCreative.campaign_type || 'Lead Generation',
            dimensions: newCreative.dimensions || originalCreative.dimensions || '300x250',
            composition: newCreative.composition
          };
          
          setCreatives(prev => 
            prev.map(c => c.id === creativeId ? transformedCreative : c)
          );
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to regenerate creative');
      }
    } catch (error) {
      console.error('Error regenerating creative:', error);
      alert('Failed to regenerate creative. Please try again.');
    } finally {
      setRegeneratingCreativeId(null);
    }
  };

  const handleCompleteWizard = async () => {
    router.push('/wizard/complete');
  };

  if (!brandData || !icpData || !strategyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading wizard data...</p>
        </div>
      </div>
    );
  }

  // Show loading animation during initial generation
  if (isGenerating && creatives.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Creating Your Creatives
            </h1>
            <p className="text-gray-600">
              Our AI is crafting personalized ad creatives for your brand
            </p>
          </div>
          
          <div className="flex justify-center mb-8">
            <DrawingAnimation />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Generating images and copy for {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'generate') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/wizard/strategy')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Strategy
            </Button>
            
            <div className="text-center">
              <Palette className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Generate Your Creatives
              </h1>
              <p className="text-gray-600">
                Choose your preferred platforms and generate AI-powered ad creatives
              </p>
            </div>
          </div>

          {/* Platform Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Select Your Platforms</CardTitle>
              <CardDescription>
                Choose the platforms where you want to run your campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePlatforms.map((platform) => (
                  <div
                    key={platform.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => togglePlatform(platform.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{platform.name}</h3>
                        <p className="text-sm text-gray-500">{platform.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 ${
                        selectedPlatforms.includes(platform.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedPlatforms.includes(platform.id) && (
                          <CheckCircle className="w-3 h-3 text-white m-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Image Generation Preference */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Choose Your Image Source</CardTitle>
              <CardDescription>
                Select how you want to provide images for your ad creatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Image generation options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      imageGenerationType === 'ai'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setImageGenerationType('ai')}
                  >
                    <div className="text-center space-y-2">
                      <div className={`p-3 rounded-full inline-block ${
                        imageGenerationType === 'ai' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Sparkles className={`w-6 h-6 ${
                          imageGenerationType === 'ai' ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <h3 className="font-medium text-gray-900">AI Generated</h3>
                      <p className="text-sm text-gray-500">Let AI create custom images for your ads</p>
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      imageGenerationType === 'upload'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setImageGenerationType('upload')}
                  >
                    <div className="text-center space-y-2">
                      <div className={`p-3 rounded-full inline-block ${
                        imageGenerationType === 'upload' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <UploadIcon className={`w-6 h-6 ${
                          imageGenerationType === 'upload' ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <h3 className="font-medium text-gray-900">Upload Images</h3>
                      <p className="text-sm text-gray-500">Use your own product images or photos</p>
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      imageGenerationType === 'both'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setImageGenerationType('both')}
                  >
                    <div className="text-center space-y-2">
                      <div className={`p-3 rounded-full inline-block ${
                        imageGenerationType === 'both' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <div className="flex space-x-1">
                          <Sparkles className={`w-3 h-3 ${
                            imageGenerationType === 'both' ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                          <UploadIcon className={`w-3 h-3 ${
                            imageGenerationType === 'both' ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                      </div>
                      <h3 className="font-medium text-gray-900">Both Options</h3>
                      <p className="text-sm text-gray-500">Mix of AI generated and uploaded images</p>
                    </div>
                  </div>
                </div>

                {/* Upload section - show only if upload or both is selected */}
                {(imageGenerationType === 'upload' || imageGenerationType === 'both') && (
                  <div className="mt-6">
                    <ImageUpload
                      onImagesChange={setUploadedImages}
                      maxImages={10}
                    />
                  </div>
                )}

                {/* Validation message for upload option */}
                {imageGenerationType === 'upload' && uploadedImages.length === 0 && (
                  <div className="text-center">
                    <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                      Please upload at least one image to continue with this option
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Visual Style Selection - only show for AI generation */}
          {(imageGenerationType === 'ai' || imageGenerationType === 'both') && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Choose Visual Style</CardTitle>
                <CardDescription>
                  Select the visual style for your AI-generated images
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableStyles.map((style) => (
                    <div
                      key={style.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedStyle === style.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        console.log('🎨 Style clicked:', style.id, style.name);
                        setSelectedStyle(style.id);
                        console.log('🎨 Style updated to:', style.id);
                      }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{style.name}</h3>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedStyle === style.id
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedStyle === style.id && (
                              <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{style.description}</p>
                        <p className="text-xs text-gray-500 italic">{style.example}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tagline Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Choose Your Tagline</CardTitle>
              <CardDescription>
                Select a tagline from your marketing strategy or create a custom one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Available taglines from strategy */}
                {availableTaglines.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">From Your Marketing Strategy:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableTaglines.map((tagline, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedTagline === tagline && customTagline === ''
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            setSelectedTagline(tagline);
                            setCustomTagline('');
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">"{tagline}"</span>
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              selectedTagline === tagline && customTagline === ''
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedTagline === tagline && customTagline === '' && (
                                <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom tagline option */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Or Create Your Own:</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Enter your custom tagline (3-6 words recommended)"
                      value={customTagline}
                      onChange={(e) => {
                        setCustomTagline(e.target.value);
                        if (e.target.value.trim()) {
                          setSelectedTagline('');
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500">
                      Examples: "Your solution awaits", "We're nice, until we're not", "What flight delay?"
                    </p>
                  </div>
                </div>

                {/* Show selected tagline */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1">Selected Tagline:</h4>
                  <p className="text-lg font-semibold text-blue-600">
                    "{customTagline.trim() || selectedTagline || 'None selected'}"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="text-center">
            {!isGenerating && (
              <Button
                onClick={() => generateCreatives(false)}
                disabled={
                  selectedPlatforms.length === 0 || 
                  (imageGenerationType === 'upload' && uploadedImages.length === 0) ||
                  (!selectedTagline && !customTagline.trim())
                }
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                Generate Creatives
              </Button>
            )}
            {!isGenerating && selectedPlatforms.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Please select at least one platform to continue
              </p>
            )}
            {!isGenerating && imageGenerationType === 'upload' && uploadedImages.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Please upload at least one image to continue
              </p>
            )}
            {!isGenerating && !selectedTagline && !customTagline.trim() && (
              <p className="text-sm text-gray-500 mt-2">
                Please select or enter a tagline to continue
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Review step
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setStep('generate')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Platform Selection
          </Button>
          
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Generated Creatives
            </h1>
            <p className="text-gray-600">
              Review and edit your AI-generated ad creatives
            </p>
          </div>
        </div>

        {/* Generated Creatives - Grouped by Platform with Tabs */}
        <div className="space-y-8 mb-8">
          {Object.entries(
            creatives.reduce((acc, creative) => {
              if (!acc[creative.platform]) {
                acc[creative.platform] = [];
              }
              acc[creative.platform].push(creative);
              return acc;
            }, {} as Record<string, Creative[]>)
          ).map(([platform, platformCreatives]) => (
            <Card key={platform} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-lg px-3 py-1 capitalize">
                      {platform}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {platformCreatives.length} format{platformCreatives.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Regenerate all formats for this platform
                      platformCreatives.forEach(creative => 
                        regenerateCreative(creative.id, creative.platform)
                      );
                    }}
                    disabled={regeneratingCreativeId !== null}
                  >
                    <Wand2 className="w-4 h-4 mr-1" />
                    Redo All {platform}
                  </Button>
                </div>

                {/* Platform Creatives in Tabs */}
                <Tabs defaultValue={platformCreatives[0]?.id} className="w-full">
                  <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${platformCreatives.length}, 1fr)` }}>
                    {platformCreatives.map((creative) => (
                      <TabsTrigger key={creative.id} value={creative.id} className="text-sm">
                        {String(creative.format || '')}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {platformCreatives.map((creative) => (
                    <TabsContent key={creative.id} value={creative.id} className="mt-6">
                      {/* Show loading animation if this creative is being regenerated */}
                      {regeneratingCreativeId === creative.id ? (
                        <div className="flex items-center justify-center py-16">
                          <DrawingAnimation />
                        </div>
                      ) : (
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Image Preview with Correct Aspect Ratio */}
                          <div className="lg:w-1/3">
                            {/* Layered Creative Preview */}
                            <div 
                              className="bg-gray-100 rounded-lg overflow-hidden relative max-w-sm mx-auto lg:mx-0"
                              style={{
                                aspectRatio: (() => {
                                  // Parse dimensions from creative.dimensions (e.g., "300x250") 
                                  const dimensions = creative.dimensions || '300x250';
                                  const [width, height] = dimensions.split('x').map(Number);
                                  
                                  // Debug log
                                  console.log(`🎨 Creative ${creative.format} preview:`, {
                                    original: dimensions,
                                    width,
                                    height,
                                    aspectRatio: `${width}/${height}`,
                                    calculatedRatio: width/height,
                                    isWideSkyscraper: creative.format === 'Wide Skyscraper',
                                    isMediumRect: creative.format === 'Medium Rectangle',
                                    isLargeRect: creative.format === 'Large Rectangle'
                                  });
                                  
                                  return `${width}/${height}`;
                                })()
                              }}
                            >
                              {/* Background Image */}
                              <img
                                src={String(creative.image_url || '')}
                                alt={`${String(creative.platform || '')} ${String(creative.format || '')} ad creative`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://picsum.photos/seed/${creative.platform}-${creative.format}-fallback/500/500?blur=1`;
                                }}
                              />
                              
                              {/* Logo Overlay */}
                              {(brandData as any)?.logoUrl && (
                                <div 
                                  className="absolute"
                                  style={{
                                    top: '5%',
                                    left: '5%',
                                    width: '20%',
                                    height: '20%',
                                    maxWidth: '80px',
                                    maxHeight: '80px'
                                  }}
                                >
                                  <img
                                    src={String((brandData as any).logoUrl)}
                                    alt="Brand logo"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              
                              {/* CTA Button Overlay */}
                              {creative.call_to_action && (
                                <div 
                                  className="absolute flex items-center justify-center"
                                  style={{
                                    bottom: '10%',
                                    left: '25%',
                                    width: '50%',
                                    height: '15%',
                                    backgroundColor: (brandData as any)?.primaryColor || '#3b82f6',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    fontSize: 'clamp(12px, 2.5vw, 20px)',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                  }}
                                >
                                  {String(creative.call_to_action || 'Learn More')}
                                </div>
                              )}
                            </div>
                            
                            {/* Show exact dimensions */}
                            <div className="text-center mt-2 text-sm text-gray-500">
                              {creative.composition?.dimensions && 
                                `${creative.composition.dimensions.width} × ${creative.composition.dimensions.height}px`
                              }
                            </div>
                          </div>

                          {/* Creative Details */}
                          <div className="lg:w-2/3">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{String(creative.format || '')}</Badge>
                                <Badge variant="secondary" className="capitalize">{String(creative.platform || '')}</Badge>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditCreative(creative)}
                                  disabled={regeneratingCreativeId !== null}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => regenerateCreative(creative.id, creative.platform)}
                                  disabled={regeneratingCreativeId !== null}
                                >
                                  <Wand2 className="w-4 h-4 mr-1" />
                                  Redo
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Headline</h3>
                                <p className="text-gray-700">{String(creative.headline || '')}</p>
                              </div>

                              {creative.punchline && (
                                <div>
                                  <h3 className="font-semibold text-gray-900 mb-1">Tagline (Embedded in Image)</h3>
                                  <p className="text-gray-700 font-medium text-lg">"{String(creative.punchline || '')}"</p>
                                  <p className="text-xs text-gray-500 mt-1">✨ This tagline is embedded directly in the AI-generated image</p>
                                </div>
                              )}

                              <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Description</h3>
                                <p className="text-gray-700">{String(creative.description || '')}</p>
                              </div>

                              <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Call to Action</h3>
                                <Button variant="outline" size="sm" className="pointer-events-none">
                                  {String(creative.call_to_action || 'Learn More')}
                                </Button>
                              </div>

                              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Targeting</h4>
                                  <p className="text-sm text-gray-700">{String(creative.targeting || '')}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Campaign Type</h4>
                                  <p className="text-sm text-gray-700">{String(creative.campaign_type || '')}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => generateCreatives(true)}
            disabled={isGeneratingMore}
            className="order-2 sm:order-1"
          >
            {isGeneratingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating More...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate More Creatives
              </>
            )}
          </Button>
          
          <Button
            onClick={handleCompleteWizard}
            className="order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
          >
            Complete Wizard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Ad Editor Modal */}
      {showAdEditor && editingCreative && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Edit {editingCreative.platform} Creative
              </h2>
            </div>
            <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
              <LayeredAdEditor 
                creative={editingCreative}
                brandSettings={brandData ? {
                  primaryColor: (brandData as any).primaryColor || '#000000',
                  secondaryColor: (brandData as any).secondaryColor || '#ffffff',
                  brandName: (brandData as any).brandName || '',
                  logoUrl: (brandData as any).logoUrl || ''
                } : undefined}
                onSave={async (layers, imageDataUrl) => {
                  try {
                    // Update the creative with new composition data
                    const updatedCreative = {
                      ...editingCreative,
                      composition: {
                        baseImage: editingCreative.image_url || '',
                        finalComposition: imageDataUrl,
                        layers: layers.map(layer => ({
                          id: layer.id,
                          type: layer.type,
                          content: layer.content,
                          position: { 
                            x: typeof layer.x === 'number' ? layer.x : 0, 
                            y: typeof layer.y === 'number' ? layer.y : 0 
                          },
                          size: { 
                            width: typeof layer.width === 'number' ? layer.width : 100, 
                            height: typeof layer.height === 'number' ? layer.height : 100 
                          },
                          style: {
                            fontSize: layer.style?.fontSize || 16,
                            fontFamily: layer.style?.fontFamily || 'Arial',
                            color: layer.style?.color || '#000000',
                            backgroundColor: layer.style?.backgroundColor || 'transparent',
                            borderRadius: layer.style?.borderRadius || 0,
                            textAlign: layer.style?.textAlign || 'left',
                            fontWeight: layer.style?.fontWeight || 'normal',
                            zIndex: typeof layer.zIndex === 'number' ? layer.zIndex : 1,
                            opacity: layer.style?.opacity || 1
                          },
                          editable: layer.type !== 'background'
                        })),
                        dimensions: { width: 1024, height: 1024 }
                      },
                      image_url: imageDataUrl // Update with edited version
                    };

                    // Save to database via API
                    const saveResponse = await fetch('/api/creatives/save', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ creative: updatedCreative })
                    });

                    if (saveResponse.ok) {
                      // Update the creative in the list
                      setCreatives(prev => 
                        prev.map(c => c.id === updatedCreative.id ? updatedCreative : c)
                      );
                      alert('Creative saved to your assets!');
                    } else {
                      console.error('Failed to save creative');
                      alert('Failed to save creative. It will be available in this session only.');
                    }
                  } catch (error) {
                    console.error('Error saving creative:', error);
                    alert('Error saving creative. It will be available in this session only.');
                  }
                  
                  setShowAdEditor(false);
                  setEditingCreative(null);
                }}
                onCancel={() => {
                  setShowAdEditor(false);
                  setEditingCreative(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 