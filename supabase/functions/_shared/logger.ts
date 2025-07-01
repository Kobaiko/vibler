// Comprehensive logging utility for Supabase Edge Functions
// Provides structured logging, performance monitoring, and error tracking

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogContext {
  functionName: string
  requestId: string
  userId?: string
  sessionId?: string
  userAgent?: string
  ip?: string
  [key: string]: any
}

export interface PerformanceMetrics {
  startTime: number
  endTime?: number
  duration?: number
  memoryUsage?: number
  cpuUsage?: number
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context: LogContext
  error?: Error
  metrics?: PerformanceMetrics
  metadata?: Record<string, any>
}

class Logger {
  private context: LogContext
  private metrics: PerformanceMetrics
  private logLevel: LogLevel

  constructor(context: LogContext) {
    this.context = context
    this.metrics = {
      startTime: performance.now()
    }
    this.logLevel = this.getLogLevel()
  }

  private getLogLevel(): LogLevel {
    const level = (globalThis as any).Deno?.env?.get('LOG_LEVEL') || 'INFO'
    switch (level.toUpperCase()) {
      case 'DEBUG': return LogLevel.DEBUG
      case 'INFO': return LogLevel.INFO
      case 'WARN': return LogLevel.WARN
      case 'ERROR': return LogLevel.ERROR
      case 'CRITICAL': return LogLevel.CRITICAL
      default: return LogLevel.INFO
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel
  }

  private formatLog(level: LogLevel, message: string, metadata?: Record<string, any>, error?: Error): LogEntry {
    const now = new Date().toISOString()
    
    return {
      timestamp: now,
      level,
      message,
      context: this.context,
      error,
      metrics: this.metrics,
      metadata
    }
  }

  private writeLog(logEntry: LogEntry): void {
    const logString = JSON.stringify({
      ...logEntry,
      levelName: LogLevel[logEntry.level],
      error: logEntry.error ? {
        name: logEntry.error.name,
        message: logEntry.error.message,
        stack: logEntry.error.stack
      } : undefined
    })

    // Use appropriate console method based on log level
    switch (logEntry.level) {
      case LogLevel.DEBUG:
        console.debug(logString)
        break
      case LogLevel.INFO:
        console.info(logString)
        break
      case LogLevel.WARN:
        console.warn(logString)
        break
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(logString)
        break
      default:
        console.log(logString)
    }
  }

  debug(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.writeLog(this.formatLog(LogLevel.DEBUG, message, metadata))
    }
  }

  info(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.writeLog(this.formatLog(LogLevel.INFO, message, metadata))
    }
  }

  warn(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.writeLog(this.formatLog(LogLevel.WARN, message, metadata))
    }
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.writeLog(this.formatLog(LogLevel.ERROR, message, metadata, error))
    }
  }

  critical(message: string, error?: Error, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.CRITICAL)) {
      this.writeLog(this.formatLog(LogLevel.CRITICAL, message, metadata, error))
    }
  }

  // Performance monitoring methods
  startTimer(operation: string): void {
    this.metrics.startTime = performance.now()
    this.debug(`Started operation: ${operation}`)
  }

  endTimer(operation: string): number {
    this.metrics.endTime = performance.now()
    this.metrics.duration = this.metrics.endTime - this.metrics.startTime
    
    this.info(`Completed operation: ${operation}`, {
      duration: this.metrics.duration,
      operation
    })
    
    return this.metrics.duration
  }

  recordMetrics(metrics: Partial<PerformanceMetrics>): void {
    this.metrics = { ...this.metrics, ...metrics }
  }

  // Request lifecycle methods
  requestStart(method: string, url: string): void {
    this.info('Request started', {
      method,
      url,
      timestamp: new Date().toISOString()
    })
  }

  requestEnd(statusCode: number, responseSize?: number): void {
    const duration = this.endTimer('request')
    this.info('Request completed', {
      statusCode,
      responseSize,
      duration,
      timestamp: new Date().toISOString()
    })
  }

  // API call monitoring
  apiCallStart(service: string, endpoint: string): void {
    this.debug(`API call started: ${service}`, {
      service,
      endpoint,
      timestamp: new Date().toISOString()
    })
  }

  apiCallEnd(service: string, endpoint: string, statusCode: number, duration: number): void {
    this.info(`API call completed: ${service}`, {
      service,
      endpoint,
      statusCode,
      duration,
      timestamp: new Date().toISOString()
    })
  }

  apiCallError(service: string, endpoint: string, error: Error): void {
    this.error(`API call failed: ${service}`, error, {
      service,
      endpoint,
      timestamp: new Date().toISOString()
    })
  }

  // Database operation monitoring
  dbOperationStart(operation: string, table: string): void {
    this.debug(`Database operation started: ${operation}`, {
      operation,
      table,
      timestamp: new Date().toISOString()
    })
  }

  dbOperationEnd(operation: string, table: string, duration: number, rowsAffected?: number): void {
    this.info(`Database operation completed: ${operation}`, {
      operation,
      table,
      duration,
      rowsAffected,
      timestamp: new Date().toISOString()
    })
  }

  dbOperationError(operation: string, table: string, error: Error): void {
    this.error(`Database operation failed: ${operation}`, error, {
      operation,
      table,
      timestamp: new Date().toISOString()
    })
  }

  // Business logic monitoring
  businessLogicStart(operation: string): void {
    this.debug(`Business logic started: ${operation}`, {
      operation,
      timestamp: new Date().toISOString()
    })
  }

  businessLogicEnd(operation: string, duration: number, result?: any): void {
    this.info(`Business logic completed: ${operation}`, {
      operation,
      duration,
      result: result ? 'success' : 'unknown',
      timestamp: new Date().toISOString()
    })
  }

  businessLogicError(operation: string, error: Error): void {
    this.error(`Business logic failed: ${operation}`, error, {
      operation,
      timestamp: new Date().toISOString()
    })
  }

  // Security monitoring
  securityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', details?: Record<string, any>): void {
    const level = severity === 'critical' ? LogLevel.CRITICAL : 
                  severity === 'high' ? LogLevel.ERROR :
                  severity === 'medium' ? LogLevel.WARN : LogLevel.INFO

    if (this.shouldLog(level)) {
      this.writeLog(this.formatLog(level, `Security event: ${event}`, {
        securityEvent: event,
        severity,
        ...details
      }))
    }
  }

  // Health check monitoring
  healthCheck(component: string, status: 'healthy' | 'degraded' | 'unhealthy', details?: Record<string, any>): void {
    const level = status === 'unhealthy' ? LogLevel.ERROR :
                  status === 'degraded' ? LogLevel.WARN : LogLevel.INFO

    if (this.shouldLog(level)) {
      this.writeLog(this.formatLog(level, `Health check: ${component}`, {
        component,
        status,
        ...details
      }))
    }
  }
}

// Factory function to create logger instances
export function createLogger(functionName: string, request: Request): Logger {
  const requestId = crypto.randomUUID()
  const userAgent = request.headers.get('user-agent') ?? 'unknown'
  const ip = request.headers.get('x-forwarded-for') ?? 
             request.headers.get('x-real-ip') ?? 
             'unknown'

  const context: LogContext = {
    functionName,
    requestId,
    userAgent,
    ip
  }

  return new Logger(context)
}

// Utility function to extract user context from request
export function extractUserContext(request: Request, body?: any): Partial<LogContext> {
  const authHeader = request.headers.get('authorization')
  const userId = body?.userId || body?.user_id
  const sessionId = request.headers.get('x-session-id')

  return {
    userId,
    sessionId: sessionId ?? undefined,
    hasAuth: !!authHeader
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, PerformanceMetrics[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  recordMetric(operation: string, duration: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetrics = {
      startTime: performance.now() - duration,
      endTime: performance.now(),
      duration,
      ...metadata
    }

    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, [])
    }

    const operationMetrics = this.metrics.get(operation)!
    operationMetrics.push(metric)

    // Keep only last 100 metrics per operation
    if (operationMetrics.length > 100) {
      operationMetrics.shift()
    }
  }

  getAverageMetrics(operation: string): PerformanceMetrics | null {
    const operationMetrics = this.metrics.get(operation)
    if (!operationMetrics || operationMetrics.length === 0) {
      return null
    }

    const totalDuration = operationMetrics.reduce((sum, metric) => sum + (metric.duration || 0), 0)
    const avgDuration = totalDuration / operationMetrics.length

    return {
      startTime: 0,
      duration: avgDuration
    }
  }

  getAllMetrics(): Record<string, PerformanceMetrics[]> {
    return Object.fromEntries(this.metrics)
  }
}

// Error tracking utilities
export class ErrorTracker {
  private static errors: Array<{ timestamp: string; error: Error; context: LogContext }> = []

  static trackError(error: Error, context: LogContext): void {
    this.errors.push({
      timestamp: new Date().toISOString(),
      error,
      context
    })

    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors.shift()
    }
  }

  static getRecentErrors(limit: number = 10): Array<{ timestamp: string; error: Error; context: LogContext }> {
    return this.errors.slice(-limit)
  }

  static getErrorStats(): { total: number; byFunction: Record<string, number> } {
    const byFunction: Record<string, number> = {}
    
    this.errors.forEach(({ context }) => {
      const functionName = context.functionName
      byFunction[functionName] = (byFunction[functionName] || 0) + 1
    })

    return {
      total: this.errors.length,
      byFunction
    }
  }
} 