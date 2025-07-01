/**
 * Audit Logging System for Vibler
 * Implements comprehensive audit trails for security compliance and monitoring
 */

import { createClient } from '@supabase/supabase-js'

// Audit event types
export enum AuditEventType {
  // Authentication events
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTER = 'user_register',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  
  // Data access events
  DATA_VIEW = 'data_view',
  DATA_EXPORT = 'data_export',
  DATA_SEARCH = 'data_search',
  
  // Data modification events
  DATA_CREATE = 'data_create',
  DATA_UPDATE = 'data_update',
  DATA_DELETE = 'data_delete',
  DATA_ANONYMIZE = 'data_anonymize',
  
  // ICP events
  ICP_GENERATE = 'icp_generate',
  ICP_VIEW = 'icp_view',
  ICP_EDIT = 'icp_edit',
  ICP_DELETE = 'icp_delete',
  
  // Funnel events
  FUNNEL_GENERATE = 'funnel_generate',
  FUNNEL_VIEW = 'funnel_view',
  FUNNEL_EDIT = 'funnel_edit',
  FUNNEL_DELETE = 'funnel_delete',
  
  // Workspace events
  WORKSPACE_CREATE = 'workspace_create',
  WORKSPACE_UPDATE = 'workspace_update',
  WORKSPACE_DELETE = 'workspace_delete',
  WORKSPACE_ACCESS = 'workspace_access',
  
  // Security events
  SECURITY_VIOLATION = 'security_violation',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  
  // Privacy events
  PRIVACY_EXPORT_REQUEST = 'privacy_export_request',
  PRIVACY_DELETE_REQUEST = 'privacy_delete_request',
  PRIVACY_ANONYMIZE_REQUEST = 'privacy_anonymize_request',
  
  // System events
  SYSTEM_ERROR = 'system_error',
  API_CALL = 'api_call',
  PERFORMANCE_ISSUE = 'performance_issue',
}

// Audit event severity levels
export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Audit event interface
export interface AuditEvent {
  id?: string
  event_type: AuditEventType
  severity: AuditSeverity
  user_id?: string
  session_id?: string
  ip_address?: string
  user_agent?: string
  resource_type?: string
  resource_id?: string
  action?: string
  details?: Record<string, any>
  metadata?: Record<string, any>
  timestamp?: string
  created_at?: string
}

// Audit logger class
export class AuditLogger {
  private supabase: any

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /**
   * Log an audit event
   */
  async log(event: AuditEvent): Promise<void> {
    try {
      const auditRecord = {
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
        created_at: new Date().toISOString(),
      }

      const { error } = await this.supabase
        .from('audit_logs')
        .insert([auditRecord])

      if (error) {
        console.error('Failed to log audit event:', error)
        // Fallback to console logging for critical events
        if (event.severity === AuditSeverity.CRITICAL) {
          console.error('CRITICAL AUDIT EVENT:', auditRecord)
        }
      }
    } catch (error) {
      console.error('Audit logging error:', error)
    }
  }

  /**
   * Log authentication events
   */
  async logAuth(
    eventType: AuditEventType,
    userId?: string,
    details?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      event_type: eventType,
      severity: AuditSeverity.MEDIUM,
      user_id: userId,
      details,
      metadata,
    })
  }

  /**
   * Log data access events
   */
  async logDataAccess(
    eventType: AuditEventType,
    userId: string,
    resourceType: string,
    resourceId?: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      event_type: eventType,
      severity: AuditSeverity.LOW,
      user_id: userId,
      resource_type: resourceType,
      resource_id: resourceId,
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
    })
  }

  /**
   * Log data modification events
   */
  async logDataModification(
    eventType: AuditEventType,
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      event_type: eventType,
      severity: AuditSeverity.MEDIUM,
      user_id: userId,
      resource_type: resourceType,
      resource_id: resourceId,
      action,
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
    })
  }

  /**
   * Log security events
   */
  async logSecurity(
    eventType: AuditEventType,
    severity: AuditSeverity,
    details: Record<string, any>,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      event_type: eventType,
      severity,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
    })
  }

  /**
   * Log privacy events
   */
  async logPrivacy(
    eventType: AuditEventType,
    userId: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      event_type: eventType,
      severity: AuditSeverity.HIGH,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
    })
  }

  /**
   * Log API calls
   */
  async logApiCall(
    endpoint: string,
    method: string,
    statusCode: number,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    responseTime?: number,
    details?: Record<string, any>
  ): Promise<void> {
    const severity = statusCode >= 500 ? AuditSeverity.HIGH : 
                    statusCode >= 400 ? AuditSeverity.MEDIUM : 
                    AuditSeverity.LOW

    await this.log({
      event_type: AuditEventType.API_CALL,
      severity,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: {
        endpoint,
        method,
        status_code: statusCode,
        response_time: responseTime,
        ...details,
      },
    })
  }

  /**
   * Query audit logs
   */
  async queryLogs(
    filters: {
      eventType?: AuditEventType
      severity?: AuditSeverity
      userId?: string
      resourceType?: string
      startDate?: string
      endDate?: string
      limit?: number
    } = {}
  ): Promise<AuditEvent[]> {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType)
      }

      if (filters.severity) {
        query = query.eq('severity', filters.severity)
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }

      if (filters.resourceType) {
        query = query.eq('resource_type', filters.resourceType)
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate)
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to query audit logs:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Audit query error:', error)
      return []
    }
  }

  /**
   * Get audit statistics
   */
  async getStats(
    timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<Record<string, any>> {
    try {
      const now = new Date()
      let startDate: Date

      switch (timeframe) {
        case 'hour':
          startDate = new Date(now.getTime() - 60 * 60 * 1000)
          break
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
      }

      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('event_type, severity')
        .gte('created_at', startDate.toISOString())

      if (error) {
        console.error('Failed to get audit stats:', error)
        return {}
      }

      const stats = {
        total: data?.length || 0,
        by_type: {},
        by_severity: {},
        security_events: 0,
        privacy_events: 0,
      }

      data?.forEach((log: any) => {
        // Count by type
        stats.by_type[log.event_type] = (stats.by_type[log.event_type] || 0) + 1

        // Count by severity
        stats.by_severity[log.severity] = (stats.by_severity[log.severity] || 0) + 1

        // Count security events
        if (log.event_type.includes('security') || log.event_type.includes('unauthorized')) {
          stats.security_events++
        }

        // Count privacy events
        if (log.event_type.includes('privacy')) {
          stats.privacy_events++
        }
      })

      return stats
    } catch (error) {
      console.error('Audit stats error:', error)
      return {}
    }
  }
}

// Global audit logger instance
export const auditLogger = new AuditLogger()

// Convenience functions
export const logAuth = auditLogger.logAuth.bind(auditLogger)
export const logDataAccess = auditLogger.logDataAccess.bind(auditLogger)
export const logDataModification = auditLogger.logDataModification.bind(auditLogger)
export const logSecurity = auditLogger.logSecurity.bind(auditLogger)
export const logPrivacy = auditLogger.logPrivacy.bind(auditLogger)
export const logApiCall = auditLogger.logApiCall.bind(auditLogger) 