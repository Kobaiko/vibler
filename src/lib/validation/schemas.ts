// Vibler Validation Schemas
// Comprehensive Zod schemas for data validation

import { z } from 'zod'

// ============================================================================
// BASE VALIDATION SCHEMAS
// ============================================================================

export const FunnelStatusSchema = z.enum([
  'draft',
  'active', 
  'paused',
  'completed',
  'archived'
])

export const PrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent'
])

export const MarketingChannelSchema = z.enum([
  'email',
  'social-media',
  'content-marketing',
  'paid-advertising',
  'seo',
  'webinars',
  'events',
  'partnerships',
  'referrals',
  'direct-mail',
  'phone',
  'other'
])

// ============================================================================
// MAIN FUNNEL SCHEMA
// ============================================================================

export const MarketingFunnelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: FunnelStatusSchema,
  priority: PrioritySchema.optional(),
  ownerId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

// ============================================================================
// API REQUEST/RESPONSE SCHEMAS
// ============================================================================

export const CreateFunnelRequestSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: PrioritySchema.optional()
})

export const UpdateFunnelRequestSchema = CreateFunnelRequestSchema.partial()

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export function validateFunnel(data: unknown) {
  return MarketingFunnelSchema.safeParse(data)
}

export function validateCreateFunnelRequest(data: unknown) {
  return CreateFunnelRequestSchema.safeParse(data)
}

export function validateUpdateFunnelRequest(data: unknown) {
  return UpdateFunnelRequestSchema.safeParse(data)
}
