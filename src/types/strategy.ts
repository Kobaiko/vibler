export interface StrategyGenerationRequest {
  prompt: string
  businessType?: string
  targetMarket?: string
  budget?: string
  timeline?: string
  userId: string
  icpContext?: string // Optional ICP context for better strategy generation
}

export interface MarketingChannel {
  name: string
  description: string
  budgetAllocation: number // percentage
  expectedROI: number
  timeline: string
  tactics: string[]
  kpis: string[]
}

export interface MessagingPillar {
  title: string
  description: string
  keyMessages: string[]
  taglines: string[]
  targetAudience: string
  channels: string[]
}

export interface CampaignTimeline {
  phase: string
  duration: string
  objectives: string[]
  activities: string[]
  deliverables: string[]
  budget: number
}

export interface BudgetBreakdown {
  totalBudget: number
  currency: string
  channels: {
    [channelName: string]: {
      amount: number
      percentage: number
      breakdown: {
        [category: string]: number
      }
    }
  }
  contingency: number
  timeline: string
}

export interface CompetitiveAnalysis {
  competitors: {
    name: string
    strengths: string[]
    weaknesses: string[]
    marketPosition: string
    estimatedBudget: string
  }[]
  opportunities: string[]
  threats: string[]
  differentiators: string[]
}

export interface CompleteStrategy {
  id: string
  title: string
  description: string
  originalPrompt: string
  userId: string
  
  // Core strategy components
  channels: MarketingChannel[]
  messagingPillars: MessagingPillar[]
  timeline: CampaignTimeline[]
  budget: BudgetBreakdown
  
  // Additional insights
  competitiveAnalysis: CompetitiveAnalysis
  riskAssessment: string[]
  successMetrics: string[]
  recommendations: string[]
  
  // Metadata
  metadata: {
    businessType: string
    industry: string
    targetMarket: string
    budget: string
    timeline: string
  }
  
  createdAt: string
  updatedAt: string
}

export interface StrategyGenerationResponse {
  strategy: CompleteStrategy
  success: boolean
  error?: string
  processingTime: number
}

export interface ExportFormat {
  format: 'pdf' | 'docx' | 'markdown' | 'json' | 'csv'
  sections: string[]
  customization?: {
    includeCharts: boolean
    includeBudgetDetails: boolean
    includeTimeline: boolean
  }
} 