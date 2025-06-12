import { z } from 'zod'

// Base schemas
export const IdealCustomerProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  demographics: z.object({
    age: z.string(),
    gender: z.string(),
    location: z.string(),
    income: z.string(),
    education: z.string(),
    jobTitle: z.string(),
    companySize: z.string().optional(),
  }),
  psychographics: z.object({
    values: z.array(z.string()),
    interests: z.array(z.string()),
    lifestyle: z.array(z.string()),
    personalityTraits: z.array(z.string()),
  }),
  painPoints: z.object({
    primary: z.string(),
    secondary: z.array(z.string()),
    emotional: z.array(z.string()),
    practical: z.array(z.string()),
  }),
  motivations: z.object({
    goals: z.array(z.string()),
    desires: z.array(z.string()),
    fears: z.array(z.string()),
    triggers: z.array(z.string()),
  }),
  behavior: z.object({
    onlineHabits: z.array(z.string()),
    preferredChannels: z.array(z.string()),
    decisionFactors: z.array(z.string()),
    buyingProcess: z.array(z.string()),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const MarketingStrategySchema = z.object({
  id: z.string(),
  name: z.string(),
  overview: z.string(),
  objectives: z.object({
    primary: z.string(),
    secondary: z.array(z.string()),
    kpis: z.array(z.string()),
  }),
  targetAudience: z.object({
    primary: z.string(),
    secondary: z.array(z.string()),
    demographics: z.array(z.string()),
  }),
  channels: z.array(z.object({
    name: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    budget: z.number(),
    timeline: z.string(),
    tactics: z.array(z.string()),
    expectedResults: z.array(z.string()),
  })),
  budget: z.object({
    total: z.number(),
    allocation: z.array(z.object({
      channel: z.string(),
      amount: z.number(),
      percentage: z.number(),
    })),
  }),
  timeline: z.array(z.object({
    phase: z.string(),
    duration: z.string(),
    milestones: z.array(z.string()),
    deliverables: z.array(z.string()),
  })),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const CreativeAssetsSchema = z.object({
  id: z.string(),
  name: z.string(),
  adCopy: z.object({
    headlines: z.array(z.string()),
    subheadlines: z.array(z.string()),
    bodyText: z.array(z.string()),
    callsToAction: z.array(z.string()),
    variations: z.array(z.object({
      platform: z.string(),
      content: z.string(),
      format: z.string(),
    })),
  }),
  emailSequences: z.array(z.object({
    name: z.string(),
    type: z.enum(['welcome', 'nurture', 'promotional', 'retention']),
    emails: z.array(z.object({
      subject: z.string(),
      preheader: z.string(),
      content: z.string(),
      sendDelay: z.string(),
    })),
  })),
  landingPageContent: z.object({
    headline: z.string(),
    subheadline: z.string(),
    heroContent: z.string(),
    benefits: z.array(z.string()),
    features: z.array(z.string()),
    testimonials: z.array(z.string()),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })),
    callToAction: z.string(),
  }),
  socialMediaContent: z.array(z.object({
    platform: z.string(),
    posts: z.array(z.object({
      type: z.enum(['text', 'image', 'video', 'carousel']),
      content: z.string(),
      hashtags: z.array(z.string()),
      callToAction: z.string(),
    })),
  })),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const FunnelFlowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  stages: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.enum(['awareness', 'interest', 'consideration', 'conversion', 'retention']),
    touchpoints: z.array(z.object({
      name: z.string(),
      type: z.string(),
      content: z.string(),
      timing: z.string(),
      triggers: z.array(z.string()),
    })),
    objectives: z.array(z.string()),
    metrics: z.array(z.string()),
    nextStages: z.array(z.string()),
  })),
  customerJourney: z.array(z.object({
    phase: z.string(),
    customerState: z.string(),
    interactions: z.array(z.string()),
    content: z.array(z.string()),
    channels: z.array(z.string()),
    expectedOutcomes: z.array(z.string()),
  })),
  conversionPoints: z.array(z.object({
    stage: z.string(),
    action: z.string(),
    rate: z.number(),
    optimization: z.array(z.string()),
  })),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const KPIMetricsSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['awareness', 'engagement', 'conversion', 'retention', 'revenue']),
  metrics: z.array(z.object({
    name: z.string(),
    description: z.string(),
    formula: z.string(),
    target: z.number(),
    unit: z.string(),
    trackingMethod: z.string(),
    reportingFrequency: z.string(),
    benchmarks: z.object({
      industry: z.number(),
      good: z.number(),
      excellent: z.number(),
    }),
  })),
  dashboardSetup: z.object({
    primaryMetrics: z.array(z.string()),
    secondaryMetrics: z.array(z.string()),
    alerts: z.array(z.object({
      metric: z.string(),
      condition: z.string(),
      threshold: z.number(),
      action: z.string(),
    })),
  }),
  trackingImplementation: z.object({
    tools: z.array(z.string()),
    setup: z.array(z.string()),
    integrations: z.array(z.string()),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const CompleteFunnelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['draft', 'active', 'paused', 'completed']),
  originalPrompt: z.string(),
  icp: IdealCustomerProfileSchema,
  strategy: MarketingStrategySchema,
  creatives: CreativeAssetsSchema,
  flow: FunnelFlowSchema,
  kpis: KPIMetricsSchema,
  metadata: z.object({
    businessType: z.string(),
    industry: z.string(),
    targetMarket: z.string(),
    budget: z.string(),
    timeline: z.string(),
  }),
  userId: z.string(),
  teamId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const FunnelGenerationRequestSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  businessType: z.string().optional(),
  targetMarket: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  userId: z.string(),
})

// API Response schemas
export const FunnelGenerationResponseSchema = z.object({
  funnel: CompleteFunnelSchema,
  success: z.boolean(),
  error: z.string().optional(),
  processingTime: z.number(),
}) 