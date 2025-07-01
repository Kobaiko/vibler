/**
 * Security Configuration and Utilities for Vibler
 * Implements comprehensive security measures for data protection and privacy compliance
 */

import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import crypto from 'crypto'

// Security configuration
export const SECURITY_CONFIG = {
  // Data retention periods (in days)
  AUDIT_LOG_RETENTION: 365,
  SESSION_TIMEOUT: 30, // minutes
  
  // Rate limiting
  RATE_LIMITS: {
    ICP_GENERATION: { requests: 10, window: 60 }, // 10 requests per minute
    API_CALLS: { requests: 100, window: 60 }, // 100 requests per minute
    LOGIN_ATTEMPTS: { requests: 5, window: 300 }, // 5 attempts per 5 minutes
  },
  
  // Data validation
  MAX_FIELD_LENGTHS: {
    NAME: 100,
    TITLE: 100,
    COMPANY: 100,
    DESCRIPTION: 500,
    ARRAY_ITEMS: 20,
  },
  
  // Encryption settings
  ENCRYPTION: {
    ALGORITHM: 'aes-256-gcm',
    KEY_LENGTH: 32,
    IV_LENGTH: 16,
    TAG_LENGTH: 16,
  },
} as const

// Input sanitization utilities
export class SecurityUtils {
  /**
   * Sanitize user input to prevent XSS and injection attacks
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return ''
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 1000) // Limit length
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  /**
   * Validate UUID format
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Hash sensitive data
   */
  static hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  /**
   * Encrypt sensitive data
   */
  static encryptData(data: string, key: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(SECURITY_CONFIG.ENCRYPTION.IV_LENGTH)
    const cipher = crypto.createCipher(SECURITY_CONFIG.ENCRYPTION.ALGORITHM, key)
    cipher.setAAD(Buffer.from('vibler-data'))
    
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decryptData(encryptedData: { encrypted: string; iv: string; tag: string }, key: string): string {
    const decipher = crypto.createDecipher(SECURITY_CONFIG.ENCRYPTION.ALGORITHM, key)
    decipher.setAAD(Buffer.from('vibler-data'))
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'))
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }
}

// Rate limiting implementation
class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>()

  static isRateLimited(identifier: string, limit: { requests: number; window: number }): boolean {
    const now = Date.now()
    const windowMs = limit.window * 1000
    const key = identifier
    
    const current = this.requests.get(key)
    
    if (!current || now > current.resetTime) {
      this.requests.set(key, { count: 1, resetTime: now + windowMs })
      return false
    }
    
    if (current.count >= limit.requests) {
      return true
    }
    
    current.count++
    return false
  }

  static getRemainingRequests(identifier: string, limit: { requests: number; window: number }): number {
    const current = this.requests.get(identifier)
    if (!current || Date.now() > current.resetTime) {
      return limit.requests
    }
    return Math.max(0, limit.requests - current.count)
  }
}

// Security middleware for API routes
export async function securityMiddleware(request: Request, context: { params?: any } = {}) {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  const xForwardedFor = headersList.get('x-forwarded-for') || ''
  const realIp = headersList.get('x-real-ip') || ''
  const clientIp = xForwardedFor.split(',')[0] || realIp || 'unknown'
  
  // Basic security headers validation
  const securityChecks = {
    hasUserAgent: userAgent.length > 0,
    validUserAgent: !userAgent.includes('bot') && !userAgent.includes('crawler'),
    hasValidIp: clientIp !== 'unknown',
  }
  
  // Rate limiting based on IP
  const rateLimitKey = `api:${clientIp}`
  if (RateLimiter.isRateLimited(rateLimitKey, SECURITY_CONFIG.RATE_LIMITS.API_CALLS)) {
    return {
      error: 'Rate limit exceeded',
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': SECURITY_CONFIG.RATE_LIMITS.API_CALLS.requests.toString(),
        'X-RateLimit-Remaining': '0',
      }
    }
  }
  
  return {
    clientIp,
    userAgent,
    securityChecks,
    rateLimitRemaining: RateLimiter.getRemainingRequests(rateLimitKey, SECURITY_CONFIG.RATE_LIMITS.API_CALLS),
  }
}

// Data validation schemas
export const ValidationSchemas = {
  icp: {
    name: (value: string) => {
      const sanitized = SecurityUtils.sanitizeInput(value)
      return sanitized.length > 0 && sanitized.length <= SECURITY_CONFIG.MAX_FIELD_LENGTHS.NAME
    },
    title: (value: string) => {
      const sanitized = SecurityUtils.sanitizeInput(value)
      return sanitized.length > 0 && sanitized.length <= SECURITY_CONFIG.MAX_FIELD_LENGTHS.TITLE
    },
    company: (value: string) => {
      const sanitized = SecurityUtils.sanitizeInput(value)
      return sanitized.length > 0 && sanitized.length <= SECURITY_CONFIG.MAX_FIELD_LENGTHS.COMPANY
    },
    industry: (value: string) => {
      const sanitized = SecurityUtils.sanitizeInput(value)
      return sanitized.length > 0 && sanitized.length <= SECURITY_CONFIG.MAX_FIELD_LENGTHS.COMPANY
    },
    arrayField: (value: string[]) => {
      return Array.isArray(value) && 
             value.length <= SECURITY_CONFIG.MAX_FIELD_LENGTHS.ARRAY_ITEMS &&
             value.every(item => typeof item === 'string' && SecurityUtils.sanitizeInput(item).length > 0)
    }
  },
  
  workspace: {
    name: (value: string) => {
      const sanitized = SecurityUtils.sanitizeInput(value)
      return sanitized.length > 0 && sanitized.length <= SECURITY_CONFIG.MAX_FIELD_LENGTHS.NAME
    },
    description: (value: string) => {
      const sanitized = SecurityUtils.sanitizeInput(value)
      return sanitized.length <= SECURITY_CONFIG.MAX_FIELD_LENGTHS.DESCRIPTION
    }
  }
}

// Audit logging utility
export class AuditLogger {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  static async logAction(params: {
    userId?: string
    action: string
    tableName: string
    recordId?: string
    oldValues?: any
    newValues?: any
    ipAddress?: string
    userAgent?: string
  }) {
    try {
      await this.supabase.from('audit_logs').insert({
        user_id: params.userId,
        action: params.action,
        table_name: params.tableName,
        record_id: params.recordId,
        old_values: params.oldValues,
        new_values: params.newValues,
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
      })
    } catch (error) {
      console.error('Failed to log audit action:', error)
    }
  }

  static async getAuditLogs(userId: string, limit: number = 100) {
    try {
      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
      return []
    }
  }
}

// GDPR compliance utilities
export class GDPRUtils {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  /**
   * Export all user data for GDPR compliance
   */
  static async exportUserData(userId: string) {
    try {
      // Get user's workspaces
      const { data: workspaces } = await this.supabase
        .from('workspaces')
        .select('*')
        .eq('user_id', userId)

      // Get user's ICPs
      const { data: icps } = await this.supabase
        .from('icps')
        .select('*')
        .in('workspace_id', workspaces?.map(w => w.id) || [])

      // Get user's funnels
      const { data: funnels } = await this.supabase
        .from('funnels')
        .select('*')
        .eq('user_id', userId)

      // Get audit logs
      const auditLogs = await AuditLogger.getAuditLogs(userId, 1000)

      return {
        exportDate: new Date().toISOString(),
        userId,
        workspaces,
        icps,
        funnels,
        auditLogs,
      }
    } catch (error) {
      console.error('Failed to export user data:', error)
      throw new Error('Data export failed')
    }
  }

  /**
   * Anonymize user data (GDPR right to be forgotten - partial)
   */
  static async anonymizeUserData(userId: string) {
    try {
      const { error } = await this.supabase.rpc('anonymize_user_data', {
        target_user_id: userId
      })
      
      if (error) throw error
      
      await AuditLogger.logAction({
        userId,
        action: 'ANONYMIZE',
        tableName: 'user_data',
        recordId: userId,
      })
      
      return { success: true }
    } catch (error) {
      console.error('Failed to anonymize user data:', error)
      throw new Error('Data anonymization failed')
    }
  }

  /**
   * Completely delete user data (GDPR right to be forgotten - complete)
   */
  static async deleteUserData(userId: string) {
    try {
      const { error } = await this.supabase.rpc('delete_user_data', {
        target_user_id: userId
      })
      
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Failed to delete user data:', error)
      throw new Error('Data deletion failed')
    }
  }
}

// Security headers for API responses
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openai.com https://*.supabase.co wss://*.supabase.co;",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const

export default {
  SecurityUtils,
  RateLimiter,
  securityMiddleware,
  ValidationSchemas,
  AuditLogger,
  GDPRUtils,
  SECURITY_CONFIG,
  SECURITY_HEADERS,
} 