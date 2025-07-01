// Vibler Data Transformation Utilities
// Convert between camelCase (API) and snake_case (Database) formats

import { MarketingFunnel, FunnelRecord } from '../types/funnel-models'

// ============================================================================
// CASE CONVERSION UTILITIES
// ============================================================================

/**
 * Convert camelCase string to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * Convert snake_case string to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Convert object keys from camelCase to snake_case
 */
export function objectToSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(objectToSnakeCase)
  
  const result: any = {}
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key)
    result[snakeKey] = typeof value === 'object' && value !== null 
      ? objectToSnakeCase(value) 
      : value
  }
  return result
}

/**
 * Convert object keys from snake_case to camelCase
 */
export function objectToCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(objectToCamelCase)
  
  const result: any = {}
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key)
    result[camelKey] = typeof value === 'object' && value !== null 
      ? objectToCamelCase(value) 
      : value
  }
  return result
}

// ============================================================================
// FUNNEL-SPECIFIC TRANSFORMERS
// ============================================================================

/**
 * Transform MarketingFunnel (API format) to FunnelRecord (Database format)
 */
export function funnelToRecord(funnel: MarketingFunnel): FunnelRecord {
  return {
    id: funnel.id,
    name: funnel.name,
    description: funnel.description || null,
    status: funnel.status,
    original_prompt: funnel.originalPrompt || null,
    icp: funnel.icp || null,
    strategy: funnel.strategy || null,
    creatives: funnel.creatives || null,
    flow: funnel.flow || null,
    kpis: funnel.kpis || null,
    metadata: funnel.metadata || null,
    user_id: funnel.userId || null,
    created_at: funnel.createdAt || null,
    updated_at: funnel.updatedAt || null
  }
}

/**
 * Transform FunnelRecord (Database format) to MarketingFunnel (API format)
 */
export function recordToFunnel(record: FunnelRecord): MarketingFunnel {
  return {
    id: record.id,
    name: record.name,
    description: record.description || '',
    status: record.status,
    priority: 'medium', // Default priority if not in record
    originalPrompt: record.original_prompt || '',
    
    // Core components - ensure they exist or provide defaults
    icp: record.icp || {
      id: '',
      name: '',
      description: '',
      demographics: {
        ageRange: { min: 18, max: 65 },
        gender: ['all'],
        location: { countries: [] },
        income: { min: 0, max: 100000, currency: 'USD' },
        education: [],
        employment: { status: [] },
        familyStatus: { maritalStatus: [] }
      },
      psychographics: {
        personality: { traits: [], values: [], attitudes: [] },
        lifestyle: { interests: [], hobbies: [], activities: [], brands: [] },
        behavior: { shoppingHabits: [], mediaConsumption: [], socialMediaUsage: [], decisionMakingStyle: '' },
        motivations: { primary: [], secondary: [], fears: [], aspirations: [] }
      },
      painPoints: [],
      buyingBehavior: {
        decisionMakingProcess: { timeframe: '', influencers: [], informationSources: [], evaluationCriteria: [] },
        purchasePatterns: { frequency: '', timing: [], budgetConsiderations: [], preferredChannels: [] },
        objections: { common: [], price: [], trust: [], timing: [] }
      },
      customerJourney: { touchpoints: [], preferredChannels: [], contentPreferences: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    
    strategy: record.strategy || {
      id: '',
      name: '',
      description: '',
      objectives: { primary: '', secondary: [], kpis: [] },
      budget: { total: 0, currency: 'USD', allocation: [] },
      timeline: { duration: '', phases: [] },
      channels: [],
      targeting: { primaryAudience: '', secondaryAudiences: [], exclusions: [] },
      messaging: { valueProposition: '', keyMessages: [], tone: '', brandVoice: '' },
      competitiveAnalysis: { competitors: [], differentiators: [], opportunities: [], threats: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    
    creatives: record.creatives || {
      id: '',
      name: '',
      description: '',
      adCopy: [],
      emailSequences: [],
      landingPages: [],
      socialMedia: [],
      videoScripts: [],
      blogPosts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    
    flow: record.flow || {
      id: '',
      name: '',
      description: '',
      type: 'lead-generation',
      steps: [],
      customerJourney: [],
      automation: { triggers: [], sequences: [] },
      optimization: { testingPlan: [], conversionPoints: [], dropOffAnalysis: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    
    kpis: record.kpis || {
      id: '',
      name: '',
      description: '',
      objectives: [],
      metrics: [],
      dashboards: [],
      benchmarks: { industry: '', competitors: [], historical: {} },
      optimization: { priorities: [], experiments: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    
    // Metadata
    metadata: record.metadata || {
      businessType: '',
      industry: '',
      targetMarket: '',
      budget: '',
      timeline: '',
      tags: [],
      version: '1.0.0'
    },
    
    // Ownership & timestamps
    userId: record.user_id || '',
    teamMembers: [],
    createdAt: record.created_at || new Date().toISOString(),
    updatedAt: record.updated_at || new Date().toISOString(),
    lastModifiedBy: record.user_id || ''
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Ensure required fields exist in funnel data
 */
export function ensureFunnelDefaults(funnel: Partial<MarketingFunnel>): MarketingFunnel {
  const now = new Date().toISOString()
  
  return {
    id: funnel.id || crypto.randomUUID(),
    name: funnel.name || 'Untitled Funnel',
    description: funnel.description || '',
    status: funnel.status || 'draft',
    priority: funnel.priority || 'medium',
    originalPrompt: funnel.originalPrompt || '',
    
    // Use provided components or create minimal defaults
    icp: funnel.icp || createDefaultICP(),
    strategy: funnel.strategy || createDefaultStrategy(),
    creatives: funnel.creatives || createDefaultCreatives(),
    flow: funnel.flow || createDefaultFlow(),
    kpis: funnel.kpis || createDefaultKPIs(),
    
    metadata: {
      businessType: funnel.metadata?.businessType || '',
      industry: funnel.metadata?.industry || '',
      targetMarket: funnel.metadata?.targetMarket || '',
      budget: funnel.metadata?.budget || '',
      timeline: funnel.metadata?.timeline || '',
      tags: funnel.metadata?.tags || [],
      version: funnel.metadata?.version || '1.0.0'
    },
    
    userId: funnel.userId || '',
    teamMembers: funnel.teamMembers || [],
    createdAt: funnel.createdAt || now,
    updatedAt: funnel.updatedAt || now,
    lastModifiedBy: funnel.lastModifiedBy || funnel.userId || ''
  }
}

// ============================================================================
// DEFAULT COMPONENT CREATORS
// ============================================================================

function createDefaultICP() {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name: 'Default ICP',
    description: 'Placeholder ideal customer profile',
    demographics: {
      ageRange: { min: 25, max: 55 },
      gender: ['all' as const],
      location: { countries: ['United States'] },
      income: { min: 50000, max: 150000, currency: 'USD' },
      education: ['bachelors' as const],
      employment: { status: ['employed' as const] },
      familyStatus: { maritalStatus: ['married' as const] }
    },
    psychographics: {
      personality: { traits: [], values: [], attitudes: [] },
      lifestyle: { interests: [], hobbies: [], activities: [], brands: [] },
      behavior: { shoppingHabits: [], mediaConsumption: [], socialMediaUsage: [], decisionMakingStyle: 'analytical' },
      motivations: { primary: [], secondary: [], fears: [], aspirations: [] }
    },
    painPoints: [],
    buyingBehavior: {
      decisionMakingProcess: { timeframe: '1-3 months', influencers: [], informationSources: [], evaluationCriteria: [] },
      purchasePatterns: { frequency: 'annual', timing: [], budgetConsiderations: [], preferredChannels: [] },
      objections: { common: [], price: [], trust: [], timing: [] }
    },
    customerJourney: { touchpoints: [], preferredChannels: [], contentPreferences: [] },
    createdAt: now,
    updatedAt: now
  }
}

function createDefaultStrategy() {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name: 'Default Strategy',
    description: 'Placeholder marketing strategy',
    objectives: { primary: 'Generate leads', secondary: [], kpis: [] },
    budget: { total: 10000, currency: 'USD', allocation: [] },
    timeline: { duration: '3 months', phases: [] },
    channels: [],
    targeting: { primaryAudience: 'General audience', secondaryAudiences: [], exclusions: [] },
    messaging: { valueProposition: '', keyMessages: [], tone: 'professional', brandVoice: 'helpful' },
    competitiveAnalysis: { competitors: [], differentiators: [], opportunities: [], threats: [] },
    createdAt: now,
    updatedAt: now
  }
}

function createDefaultCreatives() {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name: 'Default Creatives',
    description: 'Placeholder creative assets',
    adCopy: [],
    emailSequences: [],
    landingPages: [],
    socialMedia: [],
    videoScripts: [],
    blogPosts: [],
    createdAt: now,
    updatedAt: now
  }
}

function createDefaultFlow() {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name: 'Default Flow',
    description: 'Placeholder funnel flow',
    type: 'lead-generation' as const,
    steps: [],
    customerJourney: [],
    automation: { triggers: [], sequences: [] },
    optimization: { testingPlan: [], conversionPoints: [], dropOffAnalysis: [] },
    createdAt: now,
    updatedAt: now
  }
}

function createDefaultKPIs() {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name: 'Default KPIs',
    description: 'Placeholder KPI framework',
    objectives: ['Increase conversions'],
    metrics: [],
    dashboards: [],
    benchmarks: { industry: '', competitors: [], historical: {} },
    optimization: { priorities: [], experiments: [] },
    createdAt: now,
    updatedAt: now
  }
}

// ============================================================================
// UTILITY EXPORTS COMPLETE
// ============================================================================
// All functions are exported individually above 