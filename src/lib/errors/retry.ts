// Vibler Retry and Circuit Breaker System
// Handles transient failures and prevents cascade failures

import { isRetryableError, ErrorCode, ViblerError } from './index'

// ============================================================================
// RETRY CONFIGURATION
// ============================================================================

export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  jitter: boolean
  retryCondition?: (error: Error) => boolean
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  jitter: true,
  retryCondition: isRetryableError
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
  totalTime: number
}

// ============================================================================
// RETRY IMPLEMENTATION
// ============================================================================

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  const startTime = Date.now()
  let lastError: Error | undefined
  
  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      const result = await operation()
      return {
        success: true,
        data: result,
        attempts: attempt,
        totalTime: Date.now() - startTime
      }
    } catch (error) {
      lastError = error as Error
      
      // Check if we should retry
      if (attempt === finalConfig.maxAttempts || 
          !finalConfig.retryCondition?.(lastError)) {
        break
      }
      
      // Calculate delay with exponential backoff
      const delay = calculateDelay(attempt, finalConfig)
      await sleep(delay)
    }
  }
  
  return {
    success: false,
    error: lastError,
    attempts: finalConfig.maxAttempts,
    totalTime: Date.now() - startTime
  }
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1)
  delay = Math.min(delay, config.maxDelay)
  
  if (config.jitter) {
    // Add random jitter to prevent thundering herd
    delay = delay * (0.5 + Math.random() * 0.5)
  }
  
  return Math.floor(delay)
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================================================
// CIRCUIT BREAKER IMPLEMENTATION
// ============================================================================

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

export interface CircuitBreakerConfig {
  failureThreshold: number
  recoveryTimeout: number
  monitoringPeriod: number
  minimumThroughput: number
}

export const DEFAULT_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5, // Open after 5 failures
  recoveryTimeout: 60000, // 1 minute
  monitoringPeriod: 60000, // 1 minute window
  minimumThroughput: 10 // Minimum requests before considering failure rate
}

export interface CircuitBreakerStats {
  state: CircuitState
  failureCount: number
  successCount: number
  totalRequests: number
  failureRate: number
  lastFailureTime?: number
  lastSuccessTime?: number
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount = 0
  private successCount = 0
  private lastFailureTime?: number
  private lastSuccessTime?: number
  private requestLog: { timestamp: number; success: boolean }[] = []

  constructor(
    private name: string,
    private config: CircuitBreakerConfig = DEFAULT_CIRCUIT_CONFIG
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN
      } else {
        throw new ViblerError({
          code: ErrorCode.SERVICE_UNAVAILABLE,
          message: `Circuit breaker '${this.name}' is open`,
          severity: 'high' as any,
          statusCode: 503,
          retryable: true,
          userMessage: 'Service is temporarily unavailable. Please try again later.'
        })
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.successCount++
    this.lastSuccessTime = Date.now()
    this.addToRequestLog(true)
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED
      this.failureCount = 0
    }
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()
    this.addToRequestLog(false)
    
    if (this.shouldOpenCircuit()) {
      this.state = CircuitState.OPEN
    }
  }

  private shouldOpenCircuit(): boolean {
    const recentRequests = this.getRecentRequests()
    
    if (recentRequests.length < this.config.minimumThroughput) {
      return false
    }
    
    const failures = recentRequests.filter(req => !req.success).length
    const failureRate = failures / recentRequests.length
    
    return failureRate >= (this.config.failureThreshold / 100)
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false
    
    return Date.now() - this.lastFailureTime >= this.config.recoveryTimeout
  }

  private addToRequestLog(success: boolean): void {
    const now = Date.now()
    this.requestLog.push({ timestamp: now, success })
    
    // Clean old entries
    const cutoff = now - this.config.monitoringPeriod
    this.requestLog = this.requestLog.filter(req => req.timestamp > cutoff)
  }

  private getRecentRequests(): { timestamp: number; success: boolean }[] {
    const cutoff = Date.now() - this.config.monitoringPeriod
    return this.requestLog.filter(req => req.timestamp > cutoff)
  }

  getStats(): CircuitBreakerStats {
    const recentRequests = this.getRecentRequests()
    const totalRequests = recentRequests.length
    const failures = recentRequests.filter(req => !req.success).length
    
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalRequests,
      failureRate: totalRequests > 0 ? failures / totalRequests : 0,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime
    }
  }

  reset(): void {
    this.state = CircuitState.CLOSED
    this.failureCount = 0
    this.successCount = 0
    this.lastFailureTime = undefined
    this.lastSuccessTime = undefined
    this.requestLog = []
  }
}

// ============================================================================
// CIRCUIT BREAKER REGISTRY
// ============================================================================

class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>()

  getOrCreate(name: string, config?: CircuitBreakerConfig): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, config))
    }
    return this.breakers.get(name)!
  }

  get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name)
  }

  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {}
    for (const [name, breaker] of this.breakers) {
      stats[name] = breaker.getStats()
    }
    return stats
  }

  reset(name?: string): void {
    if (name) {
      this.breakers.get(name)?.reset()
    } else {
      for (const breaker of this.breakers.values()) {
        breaker.reset()
      }
    }
  }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry()

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export async function withCircuitBreaker<T>(
  name: string,
  operation: () => Promise<T>,
  config?: CircuitBreakerConfig
): Promise<T> {
  const breaker = circuitBreakerRegistry.getOrCreate(name, config)
  return breaker.execute(operation)
}

export async function withRetryAndCircuitBreaker<T>(
  name: string,
  operation: () => Promise<T>,
  retryConfig?: Partial<RetryConfig>,
  circuitConfig?: CircuitBreakerConfig
): Promise<T> {
  const breaker = circuitBreakerRegistry.getOrCreate(name, circuitConfig)
  
  const result = await withRetry(
    () => breaker.execute(operation),
    retryConfig
  )
  
  if (!result.success) {
    throw result.error || new Error('Operation failed after retries')
  }
  
  return result.data!
} 