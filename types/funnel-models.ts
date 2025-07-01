// Vibler Marketing Funnel Data Models
// Comprehensive TypeScript interfaces for all funnel components

// ============================================================================
// BASE TYPES & ENUMS
// ============================================================================

export type FunnelStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type Gender = 'male' | 'female' | 'non-binary' | 'all'
export type EducationLevel = 'high-school' | 'some-college' | 'bachelors' | 'masters' | 'doctorate' | 'other'
export type EmploymentStatus = 'employed' | 'self-employed' | 'unemployed' | 'student' | 'retired'
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'other'

export type MarketingChannel = 
  | 'facebook-ads' | 'google-ads' | 'instagram-ads' | 'linkedin-ads' | 'twitter-ads' | 'tiktok-ads'
  | 'email-marketing' | 'content-marketing' | 'seo' | 'influencer-marketing' | 'affiliate-marketing'
  | 'direct-mail' | 'webinars' | 'podcasts' | 'youtube' | 'organic-social' | 'referral-program'
  | 'cold-outreach' | 'events' | 'pr' | 'retargeting' | 'display-ads' | 'native-ads'

export type CreativeType = 'ad-copy' | 'email' | 'landing-page' | 'social-post' | 'video-script' | 'blog-post'
export type FunnelStage = 'awareness' | 'interest' | 'consideration' | 'intent' | 'evaluation' | 'purchase' | 'retention' | 'advocacy'
export type KPICategory = 'traffic' | 'engagement' | 'conversion' | 'revenue' | 'retention' | 'satisfaction'

// ============================================================================
// IDEAL CUSTOMER PROFILE (ICP) MODELS
// ============================================================================

export interface Demographics {
  ageRange: {
    min: number
    max: number
  }
  gender: Gender[]
  location: {
    countries: string[]
    regions?: string[]
    cities?: string[]
    urbanRural?: 'urban' | 'suburban' | 'rural' | 'mixed'
  }
  income: {
    min: number
    max: number
    currency: string
  }
  education: EducationLevel[]
  employment: {
    status: EmploymentStatus[]
    industries?: string[]
    jobTitles?: string[]
    companySize?: string[]
  }
  familyStatus: {
    maritalStatus: MaritalStatus[]
    hasChildren?: boolean
    numberOfChildren?: number
    householdSize?: number
  }
}

export interface Psychographics {
  personality: {
    traits: string[]
    values: string[]
    attitudes: string[]
  }
  lifestyle: {
    interests: string[]
    hobbies: string[]
    activities: string[]
    brands: string[]
  }
  behavior: {
    shoppingHabits: string[]
    mediaConsumption: string[]
    socialMediaUsage: string[]
    decisionMakingStyle: string
  }
  motivations: {
    primary: string[]
    secondary: string[]
    fears: string[]
    aspirations: string[]
  }
}

export interface PainPoint {
  id: string
  category: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant'
  impact: string
  currentSolutions: string[]
  frustrations: string[]
}

export interface BuyingBehavior {
  decisionMakingProcess: {
    timeframe: string
    influencers: string[]
    informationSources: string[]
    evaluationCriteria: string[]
  }
  purchasePatterns: {
    frequency: string
    timing: string[]
    budgetConsiderations: string[]
    preferredChannels: string[]
  }
  objections: {
    common: string[]
    price: string[]
    trust: string[]
    timing: string[]
  }
}

export interface IdealCustomerProfile {
  id: string
  name: string
  description: string
  demographics: Demographics
  psychographics: Psychographics
  painPoints: PainPoint[]
  buyingBehavior: BuyingBehavior
  customerJourney: {
    touchpoints: string[]
    preferredChannels: MarketingChannel[]
    contentPreferences: string[]
  }
  createdAt: string
  updatedAt: string
}

// ============================================================================
// MARKETING STRATEGY MODELS
// ============================================================================

export interface ChannelStrategy {
  channel: MarketingChannel
  objective: string
  budget: {
    amount: number
    currency: string
    percentage: number
  }
  timeline: {
    startDate: string
    endDate: string
    milestones: Array<{
      date: string
      description: string
      target: string
    }>
  }
  targeting: {
    audience: string
    demographics: Partial<Demographics>
    interests: string[]
    behaviors: string[]
  }
  content: {
    types: CreativeType[]
    themes: string[]
    messaging: string[]
  }
  expectedResults: {
    reach: number
    impressions: number
    clicks: number
    conversions: number
    cost: number
  }
}

export interface MarketingStrategy {
  id: string
  name: string
  description: string
  objectives: {
    primary: string
    secondary: string[]
    kpis: string[]
  }
  budget: {
    total: number
    currency: string
    allocation: Array<{
      category: string
      amount: number
      percentage: number
    }>
  }
  timeline: {
    duration: string
    phases: Array<{
      name: string
      startDate: string
      endDate: string
      objectives: string[]
      deliverables: string[]
    }>
  }
  channels: ChannelStrategy[]
  targeting: {
    primaryAudience: string
    secondaryAudiences: string[]
    exclusions: string[]
  }
  messaging: {
    valueProposition: string
    keyMessages: string[]
    tone: string
    brandVoice: string
  }
  competitiveAnalysis: {
    competitors: string[]
    differentiators: string[]
    opportunities: string[]
    threats: string[]
  }
  createdAt: string
  updatedAt: string
}

// ============================================================================
// CREATIVE ASSETS MODELS
// ============================================================================

export interface CreativeAsset {
  id: string
  type: CreativeType
  name: string
  description: string
  content: {
    headline?: string
    subheadline?: string
    body: string
    callToAction: string
    visualDescription?: string
  }
  targeting: {
    audience: string
    stage: FunnelStage
    channel: MarketingChannel
  }
  performance: {
    expectedCTR?: number
    expectedConversionRate?: number
    testingNotes?: string
  }
  variations: Array<{
    id: string
    name: string
    changes: string[]
    content: any
  }>
  createdAt: string
  updatedAt: string
}

export interface EmailSequence {
  id: string
  name: string
  description: string
  trigger: string
  emails: Array<{
    id: string
    sequence: number
    delay: number // hours
    subject: string
    preheader: string
    content: string
    callToAction: string
    personalizations: string[]
  }>
  targeting: {
    segments: string[]
    conditions: string[]
  }
  performance: {
    expectedOpenRate: number
    expectedClickRate: number
    expectedConversionRate: number
  }
  createdAt: string
  updatedAt: string
}

export interface LandingPageContent {
  id: string
  name: string
  purpose: string
  template: string
  sections: Array<{
    type: 'hero' | 'features' | 'benefits' | 'testimonials' | 'pricing' | 'faq' | 'cta'
    content: {
      headline?: string
      subheadline?: string
      body?: string
      bullets?: string[]
      image?: string
      video?: string
      callToAction?: string
    }
  }>
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  conversion: {
    primaryGoal: string
    secondaryGoals: string[]
    formFields: string[]
    incentives: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface CreativeAssets {
  id: string
  name: string
  description: string
  adCopy: CreativeAsset[]
  emailSequences: EmailSequence[]
  landingPages: LandingPageContent[]
  socialMedia: CreativeAsset[]
  videoScripts: CreativeAsset[]
  blogPosts: CreativeAsset[]
  createdAt: string
  updatedAt: string
}

// ============================================================================
// FUNNEL FLOW MODELS
// ============================================================================

export interface FunnelStep {
  id: string
  stage: FunnelStage
  name: string
  description: string
  objective: string
  channels: MarketingChannel[]
  content: {
    primary: string
    supporting: string[]
    callToAction: string
  }
  conversion: {
    goal: string
    expectedRate: number
    optimizations: string[]
  }
  nextSteps: string[]
  exitPoints: string[]
  timing: {
    duration: string
    triggers: string[]
  }
}

export interface CustomerJourney {
  stage: FunnelStage
  touchpoints: Array<{
    channel: MarketingChannel
    content: string
    timing: string
    purpose: string
  }>
  emotions: string[]
  questions: string[]
  barriers: string[]
  opportunities: string[]
}

export interface FunnelFlow {
  id: string
  name: string
  description: string
  type: 'lead-generation' | 'sales' | 'nurture' | 'retention' | 'upsell'
  steps: FunnelStep[]
  customerJourney: CustomerJourney[]
  automation: {
    triggers: Array<{
      event: string
      condition: string
      action: string
    }>
    sequences: Array<{
      name: string
      steps: string[]
      timing: string[]
    }>
  }
  optimization: {
    testingPlan: string[]
    conversionPoints: string[]
    dropOffAnalysis: string[]
  }
  createdAt: string
  updatedAt: string
}

// ============================================================================
// KPI & METRICS MODELS
// ============================================================================

export interface KPIMetric {
  id: string
  name: string
  description: string
  category: KPICategory
  type: 'number' | 'percentage' | 'currency' | 'time'
  calculation: string
  target: {
    value: number
    timeframe: string
    benchmark: string
  }
  current?: {
    value: number
    lastUpdated: string
    trend: 'up' | 'down' | 'stable'
  }
  tracking: {
    source: string
    frequency: string
    automation: boolean
  }
  alerts: {
    enabled: boolean
    thresholds: Array<{
      condition: string
      value: number
      action: string
    }>
  }
}

export interface ReportingDashboard {
  id: string
  name: string
  description: string
  metrics: string[] // KPI IDs
  visualizations: Array<{
    type: 'chart' | 'table' | 'gauge' | 'scorecard'
    title: string
    metrics: string[]
    timeframe: string
  }>
  schedule: {
    frequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly'
    recipients: string[]
    format: 'dashboard' | 'email' | 'slack'
  }
}

export interface KPIFramework {
  id: string
  name: string
  description: string
  objectives: string[]
  metrics: KPIMetric[]
  dashboards: ReportingDashboard[]
  benchmarks: {
    industry: string
    competitors: Array<{
      name: string
      metrics: Record<string, number>
    }>
    historical: Record<string, number[]>
  }
  optimization: {
    priorities: string[]
    experiments: Array<{
      hypothesis: string
      metrics: string[]
      duration: string
    }>
  }
  createdAt: string
  updatedAt: string
}

// ============================================================================
// MAIN FUNNEL MODEL
// ============================================================================

export interface MarketingFunnel {
  id: string
  name: string
  description: string
  status: FunnelStatus
  priority: Priority
  originalPrompt: string
  
  // Core Components
  icp: IdealCustomerProfile
  strategy: MarketingStrategy
  creatives: CreativeAssets
  flow: FunnelFlow
  kpis: KPIFramework
  
  // Metadata
  metadata: {
    businessType: string
    industry: string
    targetMarket: string
    budget: string
    timeline: string
    tags: string[]
    version: string
  }
  
  // Ownership & Timestamps
  userId: string
  teamMembers?: Array<{
    userId: string
    role: string
    permissions: string[]
  }>
  
  createdAt: string
  updatedAt: string
  lastModifiedBy: string
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateFunnelRequest {
  prompt: string
  businessType?: string
  targetMarket?: string
  budget?: string
  timeline?: string
  userId: string
  priority?: Priority
  tags?: string[]
}

export interface UpdateFunnelRequest {
  id: string
  userId: string
  name?: string
  description?: string
  status?: FunnelStatus
  priority?: Priority
  icp?: Partial<IdealCustomerProfile>
  strategy?: Partial<MarketingStrategy>
  creatives?: Partial<CreativeAssets>
  flow?: Partial<FunnelFlow>
  kpis?: Partial<KPIFramework>
  metadata?: Partial<MarketingFunnel['metadata']>
}

export interface FunnelResponse {
  success: boolean
  funnel?: MarketingFunnel
  error?: string
  message?: string
}

export interface FunnelListResponse {
  success: boolean
  funnels?: MarketingFunnel[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
}

// ============================================================================
// DATABASE SCHEMA TYPES (snake_case for Supabase)
// ============================================================================

export interface FunnelRecord {
  id: string
  name: string
  description: string | null
  status: FunnelStatus
  original_prompt: string | null
  icp: IdealCustomerProfile | null
  strategy: MarketingStrategy | null
  creatives: CreativeAssets | null
  flow: FunnelFlow | null
  kpis: KPIFramework | null
  metadata: MarketingFunnel['metadata'] | null
  user_id: string | null
  created_at: string | null
  updated_at: string | null
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type FunnelComponent = 'icp' | 'strategy' | 'creatives' | 'flow' | 'kpis'

export interface ComponentValidation {
  component: FunnelComponent
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface FunnelValidation {
  isValid: boolean
  components: ComponentValidation[]
  overallScore: number
  recommendations: string[]
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  // Enums
  FunnelStatus, Priority, Gender, EducationLevel, EmploymentStatus, MaritalStatus,
  MarketingChannel, CreativeType, FunnelStage, KPICategory,
  
  // ICP Types
  Demographics, Psychographics, PainPoint, BuyingBehavior, IdealCustomerProfile,
  
  // Strategy Types
  ChannelStrategy, MarketingStrategy,
  
  // Creative Types
  CreativeAsset, EmailSequence, LandingPageContent, CreativeAssets,
  
  // Flow Types
  FunnelStep, CustomerJourney, FunnelFlow,
  
  // KPI Types
  KPIMetric, ReportingDashboard, KPIFramework,
  
  // Main Types
  MarketingFunnel, FunnelRecord,
  
  // API Types
  CreateFunnelRequest, UpdateFunnelRequest, FunnelResponse, FunnelListResponse,
  
  // Utility Types
  FunnelComponent, ComponentValidation, FunnelValidation
} 