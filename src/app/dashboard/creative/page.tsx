'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { 
  Wand2, 
  Copy, 
  Download, 
  BarChart3, 
  Target, 
  Lightbulb,
  Image as ImageIcon,
  Sparkles,
  CheckCircle,
  Facebook,
  Instagram,
  Linkedin,
  Monitor,
  Video,
  Zap,
  TrendingUp,
  Users,
  Heart,
  Gift,
  Calendar,
  Star,
  Edit3,
  Palette
} from 'lucide-react'
import LayeredAdEditor from '@/components/ui/LayeredAdEditor'

// Platform configurations
const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, sizes: ['16:9 (1792x1024)'] },
  { id: 'instagram', name: 'Instagram', icon: Instagram, sizes: ['1:1 (1024x1024)'] },
  { id: 'tiktok', name: 'TikTok', icon: Video, sizes: ['9:16 (1024x1792)'] },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, sizes: ['16:9 (1792x1024)'] },
  { id: 'google', name: 'Google Ads', icon: Monitor, sizes: ['16:9 (1792x1024)'] }
]

// Tone options
const TONES = [
  'Professional', 'Friendly', 'Urgent', 'Casual', 'Inspiring', 
  'Confident', 'Playful', 'Sophisticated', 'Trustworthy', 'Bold'
]

// Campaign Ideas for Quick-Fill
const CAMPAIGN_IDEAS = [
  {
    id: 'product-launch',
    title: 'Product Launch',
    icon: Zap,
    description: 'Introduce a new product or service',
    prompt: 'Create an exciting product launch campaign that builds anticipation and drives early adoption for our new offering.',
    tone: 'Professional',
    audience: 'Early adopters and tech enthusiasts'
  },
  {
    id: 'lead-generation',
    title: 'Lead Generation',
    icon: Target,
    description: 'Capture qualified leads',
    prompt: 'Design a lead generation campaign offering valuable content in exchange for contact information to build our sales pipeline.',
    tone: 'Professional',
    audience: 'Business decision makers'
  },
  {
    id: 'brand-awareness',
    title: 'Brand Awareness',
    icon: TrendingUp,
    description: 'Increase brand recognition',
    prompt: 'Build brand awareness campaign that showcases our unique value proposition and establishes thought leadership in our industry.',
    tone: 'Inspiring',
    audience: 'Target demographic'
  },
  {
    id: 'seasonal-promotion',
    title: 'Seasonal Promotion',
    icon: Gift,
    description: 'Holiday or seasonal offers',
    prompt: 'Create a compelling seasonal promotion campaign with limited-time offers to drive urgency and boost sales.',
    tone: 'Urgent',
    audience: 'Existing customers and prospects'
  },
  {
    id: 'customer-retention',
    title: 'Customer Retention',
    icon: Heart,
    description: 'Re-engage existing customers',
    prompt: 'Develop a customer retention campaign that re-engages inactive users and increases lifetime value through exclusive offers.',
    tone: 'Friendly',
    audience: 'Existing customers'
  },
  {
    id: 'event-promotion',
    title: 'Event Promotion',
    icon: Calendar,
    description: 'Promote webinars or events',
    prompt: 'Promote our upcoming event or webinar to drive registrations and build community engagement around our expertise.',
    tone: 'Professional',
    audience: 'Industry professionals'
  }
]

// Creative interface
interface Creative {
  id: string
  platform: string
  headline: string
  description: string
  call_to_action: string
  tone: string
  target_audience: string
  product_service?: string
  image_url?: string
  conversion_score: number
  brandCompliance?: {
    score: number
    checks: {
      brandName: boolean
      tone: boolean
      keywords: boolean
      avoidance: boolean
      industry: boolean
    }
    recommendations: string[]
  }
  created_at: string
  
  // New composition data for layered editing
  composition?: {
    baseImage: string
    finalComposition: string
    layers: any[]
    dimensions: {
      width: number
      height: number
    }
  }
}

// Brand Settings interface 
interface BrandSettings {
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  brandName: string
  description: string
  industry: string
  brandTone?: string
  brandKeywords?: string[]
  avoidKeywords?: string[]
}

export default function CreativePage() {
  const [activeTab, setActiveTab] = useState('campaign-ideas')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [creatives, setCreatives] = useState<Creative[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook'])
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    logoUrl: '',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    brandName: '',
    description: '',
    industry: 'Technology'
  })

  // Creative Generation Form
  const [formData, setFormData] = useState({
    prompt: '',
    tone: 'Professional',
    targetAudience: '',
    productService: ''
  })

  // Ad Editor State
  const [editingCreative, setEditingCreative] = useState<Creative | null>(null)
  const [showAdEditor, setShowAdEditor] = useState(false)

  // Wizard data state
  const [hasWizardData, setHasWizardData] = useState(false)
  const [wizardData, setWizardData] = useState<{
    brand: any,
    icp: any,
    strategy: any
  } | null>(null)

  useEffect(() => {
    loadSavedCreatives()
    loadBrandProfile()
    loadWizardData()
    
    // Check for edit parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    const editParam = urlParams.get('edit')
    const dataParam = urlParams.get('data')
    
    if (editParam === 'true' && dataParam) {
      try {
        const creativeData = JSON.parse(decodeURIComponent(dataParam))
        setEditingCreative(creativeData)
        setShowAdEditor(true)
      } catch (error) {
        console.error('Error parsing creative data:', error)
      }
    }
  }, [])

  const loadBrandProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const profile = await response.json()
        setBrandSettings(prev => ({
          ...prev,
          brandName: profile.company_name || '',
          description: profile.company_description || '',
          industry: profile.industry || 'Technology',
          primaryColor: profile.primary_color || '#6366f1',
          secondaryColor: profile.secondary_color || '#8b5cf6',
          logoUrl: profile.logo_url || ''
        }))
      }
    } catch (error) {
      console.error('Error loading brand profile:', error)
    }
  }

  const loadSavedCreatives = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/creatives')
      if (response.ok) {
        const data = await response.json()
        setCreatives(data.creatives || [])
      } else {
        console.error('Failed to load creatives')
      }
    } catch (error) {
      console.error('Error loading creatives:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadWizardData = () => {
    try {
      // Check if wizard was completed
      const wizardCompleted = localStorage.getItem('wizard_creative_completed') === 'true'
      
      if (wizardCompleted) {
        const brandData = localStorage.getItem('wizard_brand_data')
        const icpData = localStorage.getItem('wizard_icp_data')
        const strategyData = localStorage.getItem('wizard_strategy_data')
        
        if (brandData && icpData && strategyData) {
          const brand = JSON.parse(brandData)
          const icp = JSON.parse(icpData)
          const strategy = JSON.parse(strategyData)
          
          setWizardData({ brand, icp, strategy })
          setHasWizardData(true)
          
          // Pre-populate brand settings
          setBrandSettings(prev => ({
            ...prev,
            brandName: brand.brandName || '',
            description: brand.description || '',
            industry: brand.industry || 'Technology',
            primaryColor: brand.primaryColor || '#6366f1',
            secondaryColor: brand.secondaryColor || '#8b5cf6',
            logoUrl: brand.logoUrl || ''
          }))
          
          // Pre-populate form data
          setFormData(prev => ({
            ...prev,
            targetAudience: icp.jobTitle || '',
            productService: brand.description || '',
            prompt: `Create professional ads for ${brand.brandName} targeting ${icp.jobTitle || 'professionals'}`
          }))
          
          // Pre-select platforms from strategy
          if (strategy.targetChannels?.primary) {
            const platforms = strategy.targetChannels.primary
              .map((channel: string) => channel.toLowerCase())
              .filter((platform: string) => 
                PLATFORMS.some(p => p.id === platform)
              )
            if (platforms.length > 0) {
              setSelectedPlatforms(platforms)
            }
          }
          
          // Set active tab to generate copy since we have all the data
          setActiveTab('generate-copy')
        }
      }
    } catch (error) {
      console.error('Error loading wizard data:', error)
    }
  }

  const handleCampaignSelect = (campaign: typeof CAMPAIGN_IDEAS[0]) => {
    setFormData({
      prompt: campaign.prompt,
      tone: campaign.tone,
      targetAudience: campaign.audience,
      productService: ''
    })
    setActiveTab('generate-copy')
  }

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const generateAdCopy = async () => {
    if (!formData.prompt.trim()) {
      alert('Please enter a campaign description or select a campaign idea')
      return
    }
    
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform')
      return
    }

    setIsGenerating(true)
    try {
      // Prepare request with wizard data if available
      const requestBody: any = {
        prompt: formData.prompt,
        platforms: selectedPlatforms,
        tone: formData.tone,
        targetAudience: formData.targetAudience,
        productService: formData.productService,
        includeVisuals: false, // Copy only first
        brandSettings
      }

      // Include wizard data for better generation
      if (hasWizardData && wizardData) {
        requestBody.icpInsights = {
          painPoints: wizardData.icp.painPoints || [],
          goals: wizardData.icp.goals || [],
          preferredChannels: wizardData.icp.preferredChannels || []
        }
        requestBody.campaignContext = wizardData.strategy.campaignRecommendations || []
      }

      const response = await fetch('/api/creatives/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const result = await response.json()
        setCreatives(prev => [...(result.creatives || []), ...prev])
        setActiveTab('generated-creatives')
      } else {
        console.error('Failed to generate creatives')
        alert('Failed to generate ad copy. Please try again.')
      }
    } catch (error) {
      console.error('Error generating creatives:', error)
      alert('Error generating ad copy. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateImageForCreative = async (creative: Creative) => {
    setIsGeneratingImage(true)
    try {
      const response = await fetch('/api/creatives/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${creative.headline}. ${creative.description}`,
          platforms: [creative.platform],
          tone: creative.tone,
          targetAudience: creative.target_audience,
          productService: creative.product_service,
          includeVisuals: true, // Image generation
          brandSettings
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const newCreative = result.creatives?.[0]
        if (newCreative?.image_url) {
          // Update the existing creative with the image
          setCreatives(prev => prev.map(c => 
            c.id === creative.id 
              ? { ...c, image_url: newCreative.image_url }
              : c
          ))
        }
      } else {
        console.error('Failed to generate image')
        alert('Failed to generate image. Please try again.')
      }
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Error generating image. Please try again.')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const getConversionScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getBrandScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getPlatformIcon = (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId)
    return platform?.icon || Monitor
  }

  // Ad Editor Functions
  const openAdEditor = (creative: Creative) => {
    try {
      // Store the creative data in sessionStorage to avoid URL size limits
      const creativeId = creative.id || `temp-${Date.now()}`;
      sessionStorage.setItem(`vibler-creative-${creativeId}`, JSON.stringify(creative));
      
      // Navigate to editor with just the ID
      const editorUrl = `/dashboard/creative/edit?id=${creativeId}`;
      window.open(editorUrl, '_blank');
      
    } catch (error) {
      console.error('Error opening ad editor:', error);
      // Fallback to the original modal approach for smaller data
      setEditingCreative(creative);
      setShowAdEditor(true);
    }
  }

  const closeAdEditor = () => {
    setEditingCreative(null)
    setShowAdEditor(false)
  }

  const saveEditedAd = async (layers: any[], imageDataUrl: string) => {
    if (!editingCreative) return
    
    try {
      // Extract text content from layers for database storage
      const headlineLayer = layers.find(l => l.id === 'headline')
      const descriptionLayer = layers.find(l => l.id === 'description')
      const ctaLayer = layers.find(l => l.id === 'cta-button')
      
      // Update the creative with the edited data
      const updatedCreative = {
        ...editingCreative,
        headline: headlineLayer?.content || editingCreative.headline,
        description: descriptionLayer?.content || editingCreative.description,
        call_to_action: ctaLayer?.content || editingCreative.call_to_action,
        final_image_url: imageDataUrl, // Store the final composed image
        layers: JSON.stringify(layers) // Store layer data for future editing
      }
      
      // Save to database if it has an ID, otherwise add to local state
      if (editingCreative.id) {
        // Here you would save to your database
        console.log('Saving edited creative:', updatedCreative)
      }
      
      // Update local state
      setCreatives(prev => prev.map(c => 
        c.id === editingCreative.id ? updatedCreative : c
      ))
      
      // Close editor
      closeAdEditor()
      
      // Show success message
      alert('Creative saved successfully!')
      
    } catch (error) {
      console.error('Error saving creative:', error)
      alert('Error saving creative. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {hasWizardData ? `Welcome back! Create more ads for ${brandSettings.brandName}` : 'AI Creative Generator'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {hasWizardData 
              ? `Your brand profile and strategy are ready. Let's create some amazing ads!`
              : 'Create high-converting ad copy and visuals powered by your brand identity'
            }
          </p>
        </div>

        {/* Wizard Data Loaded Banner */}
        {hasWizardData && wizardData && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-2">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">🎉 Your Campaign Data is Ready!</h3>
                  <p className="text-green-100">
                    We've loaded your brand profile, target audience, and marketing strategy from your completed wizard.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-100">Ready to use:</div>
                <div className="flex space-x-4 text-xs">
                  <span>✓ Brand: {wizardData.brand?.brandName}</span>
                  <span>✓ Audience: {wizardData.icp?.jobTitle}</span>
                  <span>✓ Strategy: {wizardData.strategy?.targetChannels?.primary?.length || 0} channels</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px] mx-auto">
            <TabsTrigger value="campaign-ideas" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Campaign Ideas
            </TabsTrigger>
            <TabsTrigger value="generate-copy" className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Generate Copy
            </TabsTrigger>
            <TabsTrigger value="generated-creatives" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Generated Creatives ({creatives.length})
            </TabsTrigger>
          </TabsList>

          {/* Campaign Ideas Tab */}
          <TabsContent value="campaign-ideas" className="space-y-6">
            {/* Custom Campaign Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="w-5 h-5 text-purple-600" />
                  Create Custom Campaign
                </CardTitle>
                <CardDescription>
                  Describe your own campaign idea or choose from our proven templates below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-prompt">What's your campaign about?</Label>
                  <Textarea
                    id="custom-prompt"
                    value={formData.prompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                    placeholder="Describe your campaign objectives, target audience, and what you want to promote. For example: 'Launch our new AI-powered fitness app targeting busy professionals who want quick, effective workouts...'"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      if (formData.prompt.trim()) {
                        setActiveTab('generate-copy')
                      } else {
                        alert('Please enter your campaign description first')
                      }
                    }}
                    disabled={!formData.prompt.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-purple-600" />
                  Or Choose a Campaign Template
                </CardTitle>
                <CardDescription>
                  Select a campaign idea to auto-fill your creative brief with proven templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CAMPAIGN_IDEAS.map((campaign) => (
                    <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <campaign.icon className="w-5 h-5 text-purple-600" />
                            <span className="font-medium">{campaign.title}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {campaign.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              {campaign.tone}
                            </Badge>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCampaignSelect(campaign)}
                            className="hover:bg-purple-50 hover:border-purple-300"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Generate Copy Tab */}
          <TabsContent value="generate-copy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Generation Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Copy className="w-5 h-5 text-purple-600" />
                      Campaign Brief
                    </CardTitle>
                    <CardDescription>
                      Describe your campaign or use one of our pre-built templates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="prompt">Campaign Description</Label>
                      <Textarea
                        id="prompt"
                        value={formData.prompt}
                        onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                        placeholder="Describe your campaign objectives, key messages, and what you want to promote..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tone">Tone</Label>
                        <Select value={formData.tone} onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}>
                          <SelectTrigger className="bg-white border-gray-200 shadow-sm">
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                          <SelectContent>
                            {TONES.map((tone) => (
                              <SelectItem key={tone} value={tone}>
                                {tone}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="target-audience">Target Audience</Label>
                        <Input
                          id="target-audience"
                          value={formData.targetAudience}
                          onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                          placeholder="Who is your target audience?"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="product-service">Product/Service (Optional)</Label>
                      <Input
                        id="product-service"
                        value={formData.productService}
                        onChange={(e) => setFormData(prev => ({ ...prev, productService: e.target.value }))}
                        placeholder="What specific product or service are you promoting?"
                      />
                    </div>

                    {/* Platform Selection */}
                    <div className="space-y-3">
                      <Label>Select Platforms</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {PLATFORMS.map((platform) => (
                          <Button
                            key={platform.id}
                            variant={selectedPlatforms.includes(platform.id) ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => togglePlatform(platform.id)}
                            className="flex items-center gap-2 justify-start"
                          >
                            <platform.icon className="w-4 h-4" />
                            {platform.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={generateAdCopy}
                      disabled={isGenerating || !formData.prompt.trim() || selectedPlatforms.length === 0}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          Generating Ad Copy...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate {selectedPlatforms.length} Ad Copy{selectedPlatforms.length !== 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Brand Profile Preview */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Your Brand
                    </CardTitle>
                    <CardDescription>
                      This will be used to ensure brand consistency
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {brandSettings.brandName ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: brandSettings.primaryColor }}
                          ></div>
                          <span className="font-medium">{brandSettings.brandName}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {brandSettings.description || 'No description provided'}
                        </p>
                        <Badge variant="outline">{brandSettings.industry}</Badge>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No brand profile found</p>
                        <p className="text-xs">Set up your brand in Profile settings</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Generated Creatives Tab */}
          <TabsContent value="generated-creatives" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Sparkles className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : creatives.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <Copy className="w-16 h-16 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">No creatives yet</h3>
                      <p className="text-gray-600">
                        Generate your first ad copy to see it here
                      </p>
                    </div>
                    <Button 
                      onClick={() => setActiveTab('generate-copy')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Ad Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {creatives.map((creative) => {
                  const PlatformIcon = getPlatformIcon(creative.platform)
                  return (
                    <Card key={creative.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <PlatformIcon className="w-5 h-5" />
                            <span className="font-medium capitalize">{creative.platform}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getConversionScoreColor(creative.conversion_score)}>
                              {creative.conversion_score}% Score
                            </Badge>
                            {creative.brandCompliance && (
                              <Badge variant="outline" className={getBrandScoreColor(creative.brandCompliance.score)}>
                                Brand: {creative.brandCompliance.score}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Creative Content */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Headline</h4>
                            <p className="text-gray-700">{creative.headline}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Description</h4>
                            <p className="text-gray-700 text-sm">{creative.description}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Call to Action</h4>
                            <p className="text-gray-700 text-sm font-medium">{creative.call_to_action}</p>
                          </div>
                        </div>

                        {/* Image Section */}
                        {creative.image_url ? (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900">Visual</h4>
                            <img 
                              src={creative.image_url} 
                              alt="Generated creative" 
                              className="w-full rounded-lg border"
                            />
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-3">No image generated yet</p>
                            <Button
                              onClick={() => generateImageForCreative(creative)}
                              disabled={isGeneratingImage}
                              variant="outline"
                              size="sm"
                            >
                              {isGeneratingImage ? (
                                <>
                                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="w-4 h-4 mr-2" />
                                  Generate Image
                                </>
                              )}
                            </Button>
                          </div>
                        )}

                        {/* Brand Compliance Details */}
                        {creative.brandCompliance && (
                          <div className="space-y-2 pt-3 border-t border-gray-100">
                            <h4 className="font-semibold text-gray-900 text-sm">Brand Compliance</h4>
                            <div className="grid grid-cols-5 gap-1">
                              {Object.entries(creative.brandCompliance.checks).map(([check, passed]) => (
                                <div key={check} className="text-center">
                                  <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center ${
                                    passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                  }`}>
                                    {passed ? <CheckCircle className="w-3 h-3" /> : '✕'}
                                  </div>
                                  <span className="text-xs text-gray-600 capitalize">
                                    {check === 'brandName' ? 'Name' : check}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {creative.brandCompliance.recommendations && creative.brandCompliance.recommendations.length > 0 && (
                              <div className="mt-2 space-y-1">
                                <h5 className="text-xs font-medium text-gray-700">Recommendations:</h5>
                                {creative.brandCompliance.recommendations.map((recommendation, index) => (
                                  <p key={index} className="text-xs text-gray-600">
                                    • {recommendation}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyToClipboard(`${creative.headline}\n\n${creative.description}\n\n${creative.call_to_action}`)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openAdEditor(creative)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(creative.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Ad Editor Modal */}
      {showAdEditor && editingCreative && (
        <LayeredAdEditor
          creative={editingCreative}
          brandSettings={brandSettings}
          onSave={saveEditedAd}
          onCancel={closeAdEditor}
        />
      )}
    </div>
  )
} 