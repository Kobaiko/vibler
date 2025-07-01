import { z } from 'zod'

export const StrategyGenerationRequestSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  businessType: z.string().optional(),
  targetMarket: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  userId: z.string().min(1, 'User ID is required'),
  icpContext: z.string().optional(),
})

export const MarketingChannelSchema = z.object({
  name: z.string(),
  description: z.string(),
  budgetAllocation: z.number().min(0).max(100),
  expectedROI: z.number(),
  timeline: z.string(),
  tactics: z.array(z.string()),
  kpis: z.array(z.string()),
})

export const MessagingPillarSchema = z.object({
  title: z.string(),
  description: z.string(),
  keyMessages: z.array(z.string()),
  taglines: z.array(z.string()).length(3),
  targetAudience: z.string(),
  channels: z.array(z.string()),
})

export const CampaignTimelineSchema = z.object({
  phase: z.string(),
  duration: z.string(),
  objectives: z.array(z.string()),
  activities: z.array(z.string()),
  deliverables: z.array(z.string()),
  budget: z.number(),
})

export const BudgetBreakdownSchema = z.object({
  totalBudget: z.number(),
  currency: z.string(),
  channels: z.record(z.object({
    amount: z.number(),
    percentage: z.number(),
    breakdown: z.record(z.number()),
  })),
  contingency: z.number(),
  timeline: z.string(),
})

export const CompetitiveAnalysisSchema = z.object({
  competitors: z.array(z.object({
    name: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    marketPosition: z.string(),
    estimatedBudget: z.string(),
  })),
  opportunities: z.array(z.string()),
  threats: z.array(z.string()),
  differentiators: z.array(z.string()),
})

export const CompleteStrategySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  originalPrompt: z.string(),
  userId: z.string(),
  
  channels: z.array(MarketingChannelSchema),
  messagingPillars: z.array(MessagingPillarSchema),
  timeline: z.array(CampaignTimelineSchema),
  budget: BudgetBreakdownSchema,
  
  competitiveAnalysis: CompetitiveAnalysisSchema,
  riskAssessment: z.array(z.string()),
  successMetrics: z.array(z.string()),
  recommendations: z.array(z.string()),
  
  metadata: z.object({
    businessType: z.string(),
    industry: z.string(),
    targetMarket: z.string(),
    budget: z.string(),
    timeline: z.string(),
  }),
  
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const ExportFormatSchema = z.object({
  format: z.enum(['pdf', 'docx', 'markdown', 'json', 'csv']),
  sections: z.array(z.string()),
  customization: z.object({
    includeCharts: z.boolean(),
    includeBudgetDetails: z.boolean(),
    includeTimeline: z.boolean(),
  }).optional(),
}) 