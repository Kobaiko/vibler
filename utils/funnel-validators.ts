// Vibler Funnel Validation Utilities
// Comprehensive validation functions for marketing funnel data

import { 
  MarketingFunnel, 
  IdealCustomerProfile, 
  MarketingStrategy, 
  CreativeAssets, 
  FunnelFlow, 
  KPIFramework,
  FunnelStatus,
  Priority,
  MarketingChannel
} from '../types/funnel-models'

// Define funnel type locally since it's not exported from models
type FunnelType = 'lead-generation' | 'sales' | 'nurture' | 'retention' | 'upsell'

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface FieldValidation {
  field: string
  isValid: boolean
  message?: string
}

// ============================================================================
// CORE VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate a complete marketing funnel
 */
export function validateMarketingFunnel(funnel: Partial<MarketingFunnel>): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!funnel.name || funnel.name.trim().length === 0) {
    errors.push('Funnel name is required')
  }

  if (!funnel.id || funnel.id.trim().length === 0) {
    errors.push('Funnel ID is required')
  }

  if (!funnel.userId || funnel.userId.trim().length === 0) {
    errors.push('User ID is required')
  }

  // Validate status
  if (funnel.status && !isValidFunnelStatus(funnel.status)) {
    errors.push(`Invalid funnel status: ${funnel.status}`)
  }

  // Validate priority
  if (funnel.priority && !isValidPriority(funnel.priority)) {
    errors.push(`Invalid priority: ${funnel.priority}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// ============================================================================
// ENUM VALIDATION HELPERS
// ============================================================================

export function isValidFunnelStatus(status: string): status is FunnelStatus {
  return ['draft', 'active', 'paused', 'completed', 'archived'].includes(status)
}

export function isValidPriority(priority: string): priority is Priority {
  return ['low', 'medium', 'high', 'urgent'].includes(priority)
}

export function isValidMarketingChannel(channel: string): channel is MarketingChannel {
  return [
    'google-ads', 'facebook-ads', 'instagram-ads', 'linkedin-ads', 'twitter-ads',
    'youtube-ads', 'tiktok-ads', 'pinterest-ads', 'snapchat-ads',
    'email-marketing', 'sms-marketing', 'content-marketing', 'seo',
    'influencer-marketing', 'affiliate-marketing', 'direct-mail',
    'events', 'webinars', 'podcasts', 'pr', 'partnerships'
  ].includes(channel)
}

export function isValidFunnelType(type: string): type is FunnelType {
  return [
    'lead-generation', 'sales', 'webinar', 'product-launch',
    'nurture', 'retention', 'upsell', 'referral'
  ].includes(type)
}
