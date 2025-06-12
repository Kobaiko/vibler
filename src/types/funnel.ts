// Core types for the Prompt-to-Funnel Engine

export interface FunnelGenerationRequest {
  prompt: string
  businessType?: string
  targetMarket?: string
  budget?: string
  timeline?: string
  userId: string
}

export interface IdealCustomerProfile {
  id: string
  name: string
  demographics: {
    age: string
    gender: string
    location: string
    income: string
    education: string
    jobTitle: string
    companySize?: string
  }
  psychographics: {
    values: string[]
    interests: string[]
    lifestyle: string[]
    personalityTraits: string[]
  }
  painPoints: {
    primary: string
    secondary: string[]
    emotional: string[]
    practical: string[]
  }
  motivations: {
    goals: string[]
    desires: string[]
    fears: string[]
    triggers: string[]
  }
  behavior: {
    onlineHabits: string[]
    preferredChannels: string[]
    decisionFactors: string[]
    buyingProcess: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface MarketingStrategy {
  id: string
  name: string
  overview: string
  objectives: {
    primary: string
    secondary: string[]
    kpis: string[]
  }
  targetAudience: {
    primary: string
    secondary: string[]
    demographics: string[]
  }
  channels: {
    name: string
    priority: 'high' | 'medium' | 'low'
    budget: number
    timeline: string
    tactics: string[]
    expectedResults: string[]
  }[]
  budget: {
    total: number
    allocation: {
      channel: string
      amount: number
      percentage: number
    }[]
  }
  timeline: {
    phase: string
    duration: string
    milestones: string[]
    deliverables: string[]
  }[]
  createdAt: string
  updatedAt: string
}

export interface CreativeAssets {
  id: string
  name: string
  adCopy: {
    headlines: string[]
    subheadlines: string[]
    bodyText: string[]
    callsToAction: string[]
    variations: {
      platform: string
      content: string
      format: string
    }[]
  }
  emailSequences: {
    name: string
    type: 'welcome' | 'nurture' | 'promotional' | 'retention'
    emails: {
      subject: string
      preheader: string
      content: string
      sendDelay: string
    }[]
  }[]
  landingPageContent: {
    headline: string
    subheadline: string
    heroContent: string
    benefits: string[]
    features: string[]
    testimonials: string[]
    faq: {
      question: string
      answer: string
    }[]
    callToAction: string
  }
  socialMediaContent: {
    platform: string
    posts: {
      type: 'text' | 'image' | 'video' | 'carousel'
      content: string
      hashtags: string[]
      callToAction: string
    }[]
  }[]
  createdAt: string
  updatedAt: string
}

export interface FunnelFlow {
  id: string
  name: string
  description: string
  stages: {
    id: string
    name: string
    description: string
    type: 'awareness' | 'interest' | 'consideration' | 'conversion' | 'retention'
    touchpoints: {
      name: string
      type: string
      content: string
      timing: string
      triggers: string[]
    }[]
    objectives: string[]
    metrics: string[]
    nextStages: string[]
  }[]
  customerJourney: {
    phase: string
    customerState: string
    interactions: string[]
    content: string[]
    channels: string[]
    expectedOutcomes: string[]
  }[]
  conversionPoints: {
    stage: string
    action: string
    rate: number
    optimization: string[]
  }[]
  createdAt: string
  updatedAt: string
}

export interface KPIMetrics {
  id: string
  name: string
  category: 'awareness' | 'engagement' | 'conversion' | 'retention' | 'revenue'
  metrics: {
    name: string
    description: string
    formula: string
    target: number
    unit: string
    trackingMethod: string
    reportingFrequency: string
    benchmarks: {
      industry: number
      good: number
      excellent: number
    }
  }[]
  dashboardSetup: {
    primaryMetrics: string[]
    secondaryMetrics: string[]
    alerts: {
      metric: string
      condition: string
      threshold: number
      action: string
    }[]
  }
  trackingImplementation: {
    tools: string[]
    setup: string[]
    integrations: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface CompleteFunnel {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  originalPrompt: string
  icp: IdealCustomerProfile
  strategy: MarketingStrategy
  creatives: CreativeAssets
  flow: FunnelFlow
  kpis: KPIMetrics
  metadata: {
    businessType: string
    industry: string
    targetMarket: string
    budget: string
    timeline: string
  }
  userId: string
  teamId?: string
  createdAt: string
  updatedAt: string
}

export interface FunnelGenerationResponse {
  funnel: CompleteFunnel
  success: boolean
  error?: string
  processingTime: number
}

// API Response types for individual components
export interface GenerateICPResponse {
  icp: IdealCustomerProfile
  success: boolean
  error?: string
}

export interface GenerateStrategyResponse {
  strategy: MarketingStrategy
  success: boolean
  error?: string
}

export interface GenerateCreativesResponse {
  creatives: CreativeAssets
  success: boolean
  error?: string
}

export interface GenerateFlowResponse {
  flow: FunnelFlow
  success: boolean
  error?: string
}

export interface GenerateKPIsResponse {
  kpis: KPIMetrics
  success: boolean
  error?: string
} 