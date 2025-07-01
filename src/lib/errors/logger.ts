// Vibler Error Logging and Monitoring System
// Comprehensive error tracking and analysis

import { ViblerError, ErrorSeverity, ErrorCode } from './index'

// ============================================================================
// LOGGING CONFIGURATION
// ============================================================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  error?: ViblerError
  context?: Record<string, any>
  requestId?: string
  userId?: string
  sessionId?: string
  userAgent?: string
  ip?: string
  endpoint?: string
  method?: string
  stack?: string
}

export interface ErrorMetrics {
  totalErrors: number
  errorsByCode: Record<string, number>
  errorsBySeverity: Record<string, number>
  errorsByEndpoint: Record<string, number>
  errorsByUser: Record<string, number>
  averageResponseTime: number
  errorRate: number
  lastError?: LogEntry
}

// ============================================================================
// LOGGER IMPLEMENTATION
// ============================================================================

class ErrorLogger {
  private logs: LogEntry[] = []
  private maxLogs = 10000 // Keep last 10k logs in memory
  private logLevel = LogLevel.INFO

  setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }

  log(level: LogLevel, message: string, error?: Error, context?: Record<string, any>): void {
    if (level < this.logLevel) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      requestId: context?.requestId,
      userId: context?.userId,
      sessionId: context?.sessionId,
      userAgent: context?.userAgent,
      ip: context?.ip,
      endpoint: context?.endpoint,
      method: context?.method
    }

    if (error) {
      if (error instanceof ViblerError) {
        entry.error = error
      } else {
        // Convert regular error to ViblerError for consistency
        entry.error = new ViblerError({
          code: ErrorCode.UNKNOWN_ERROR,
          message: error.message,
          severity: ErrorSeverity.MEDIUM,
          statusCode: 500,
          cause: error
        })
      }
      entry.stack = error.stack
    }

    this.logs.push(entry)

    // Trim logs if we exceed max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      this.consoleLog(entry)
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogger(entry)
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, undefined, context)
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, undefined, context)
  }

  warn(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, error, context)
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, error, context)
  }

  critical(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.CRITICAL, message, error, context)
  }

  private consoleLog(entry: LogEntry): void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL']
    const levelName = levelNames[entry.level]
    
    console.log(`[${entry.timestamp}] ${levelName}: ${entry.message}`)
    
    if (entry.error) {
      console.error('Error Details:', {
        code: entry.error.code,
        severity: entry.error.severity,
        statusCode: entry.error.statusCode,
        context: entry.error.context
      })
      
      if (entry.stack) {
        console.error('Stack Trace:', entry.stack)
      }
    }
    
    if (entry.context) {
      console.log('Context:', entry.context)
    }
  }

  private async sendToExternalLogger(entry: LogEntry): Promise<void> {
    try {
      // In a real implementation, you would send to services like:
      // - Sentry
      // - LogRocket
      // - DataDog
      // - CloudWatch
      // - Custom logging endpoint
      
      // For now, we'll just store it (in production you'd send to external service)
      if (entry.level >= LogLevel.ERROR) {
        // Send critical errors to monitoring service
        await this.sendToMonitoringService(entry)
      }
    } catch (error) {
      // Don't let logging errors crash the application
      console.error('Failed to send log to external service:', error)
    }
  }

  private async sendToMonitoringService(entry: LogEntry): Promise<void> {
    // Placeholder for external monitoring service integration
    // In production, integrate with services like Sentry, DataDog, etc.
  }

  getLogs(filters?: {
    level?: LogLevel
    startTime?: string
    endTime?: string
    userId?: string
    endpoint?: string
    errorCode?: string
  }): LogEntry[] {
    let filteredLogs = [...this.logs]

    if (filters) {
      if (filters.level !== undefined) {
        filteredLogs = filteredLogs.filter(log => log.level >= filters.level!)
      }

      if (filters.startTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startTime!)
      }

      if (filters.endTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endTime!)
      }

      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId)
      }

      if (filters.endpoint) {
        filteredLogs = filteredLogs.filter(log => log.endpoint === filters.endpoint)
      }

      if (filters.errorCode) {
        filteredLogs = filteredLogs.filter(log => log.error?.code === filters.errorCode)
      }
    }

    return filteredLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  }

  getMetrics(timeWindow?: number): ErrorMetrics {
    const now = Date.now()
    const windowStart = timeWindow ? now - timeWindow : 0
    
    const relevantLogs = this.logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime()
      return logTime >= windowStart && log.error
    })

    const totalErrors = relevantLogs.length
    const errorsByCode: Record<string, number> = {}
    const errorsBySeverity: Record<string, number> = {}
    const errorsByEndpoint: Record<string, number> = {}
    const errorsByUser: Record<string, number> = {}

    relevantLogs.forEach(log => {
      if (log.error) {
        // Count by error code
        errorsByCode[log.error.code] = (errorsByCode[log.error.code] || 0) + 1
        
        // Count by severity
        errorsBySeverity[log.error.severity] = (errorsBySeverity[log.error.severity] || 0) + 1
      }

      // Count by endpoint
      if (log.endpoint) {
        errorsByEndpoint[log.endpoint] = (errorsByEndpoint[log.endpoint] || 0) + 1
      }

      // Count by user
      if (log.userId) {
        errorsByUser[log.userId] = (errorsByUser[log.userId] || 0) + 1
      }
    })

    // Calculate error rate (errors per minute)
    const timeWindowMinutes = timeWindow ? timeWindow / (1000 * 60) : 60
    const errorRate = totalErrors / timeWindowMinutes

    return {
      totalErrors,
      errorsByCode,
      errorsBySeverity,
      errorsByEndpoint,
      errorsByUser,
      averageResponseTime: 0, // Would need to track response times
      errorRate,
      lastError: relevantLogs[0]
    }
  }

  clearLogs(): void {
    this.logs = []
  }

  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'message', 'errorCode', 'severity', 'endpoint', 'userId']
      const rows = this.logs.map(log => [
        log.timestamp,
        LogLevel[log.level],
        log.message,
        log.error?.code || '',
        log.error?.severity || '',
        log.endpoint || '',
        log.userId || ''
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
    
    return JSON.stringify(this.logs, null, 2)
  }
}

// ============================================================================
// SINGLETON LOGGER INSTANCE
// ============================================================================

export const logger = new ErrorLogger()

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export function logError(error: Error, context?: Record<string, any>): void {
  if (error instanceof ViblerError) {
    const level = error.severity === ErrorSeverity.CRITICAL ? LogLevel.CRITICAL : LogLevel.ERROR
    logger.log(level, error.message, error, { ...context, ...error.context })
  } else {
    logger.error(error.message, error, context)
  }
}

export function logWarning(message: string, context?: Record<string, any>): void {
  logger.warn(message, undefined, context)
}

export function logInfo(message: string, context?: Record<string, any>): void {
  logger.info(message, context)
}

export function logDebug(message: string, context?: Record<string, any>): void {
  logger.debug(message, context)
}

// ============================================================================
// ERROR TRACKING MIDDLEWARE
// ============================================================================

export function createErrorTrackingContext(req: any): Record<string, any> {
  return {
    requestId: req.headers?.['x-request-id'] || crypto.randomUUID(),
    userId: req.user?.id,
    sessionId: req.session?.id,
    userAgent: req.headers?.['user-agent'],
    ip: req.headers?.['x-forwarded-for'] || req.connection?.remoteAddress,
    endpoint: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  }
}

export function trackApiCall(
  endpoint: string,
  method: string,
  duration: number,
  success: boolean,
  error?: Error,
  context?: Record<string, any>
): void {
  const message = `API ${method} ${endpoint} - ${success ? 'SUCCESS' : 'FAILED'} (${duration}ms)`
  
  if (success) {
    logger.info(message, { ...context, duration, endpoint, method })
  } else {
    logger.error(message, error, { ...context, duration, endpoint, method })
  }
} 