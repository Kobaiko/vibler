// Vibler Error Handling Middleware
// Centralized error handling for API routes and Edge Functions

import { NextRequest, NextResponse } from 'next/server'
import { 
  ViblerError, 
  formatErrorResponse, 
  formatSuccessResponse, 
  createErrorContext,
  ErrorFactory,
  ErrorCode
} from '../errors'
import { logger, logError, trackApiCall } from '../errors/logger'
import { withRetry, withCircuitBreaker } from '../errors/retry'

// ============================================================================
// MIDDLEWARE TYPES
// ============================================================================

export type ApiHandler<T = any> = (
  req: NextRequest,
  context?: any
) => Promise<T>

export type MiddlewareConfig = {
  enableRetry?: boolean
  enableCircuitBreaker?: boolean
  enableLogging?: boolean
  enableValidation?: boolean
  timeout?: number
}

// ============================================================================
// ERROR HANDLING WRAPPER
// ============================================================================

export function withErrorHandling<T>(
  handler: ApiHandler<T>,
  config: MiddlewareConfig = {}
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now()
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID()
    const errorContext = createErrorContext(req)
    
    try {
      // Add request ID to headers
      const headers = new Headers()
      headers.set('x-request-id', requestId)
      
      // Execute handler with optional retry and circuit breaker
      let result: T
      
      if (config.enableRetry && config.enableCircuitBreaker) {
        const circuitName = `${req.method}-${req.nextUrl.pathname}`
        result = await withRetry(
          () => withCircuitBreaker(circuitName, () => handler(req, context)),
          { maxAttempts: 3 }
        ).then(r => r.success ? r.data! : Promise.reject(r.error))
      } else if (config.enableRetry) {
        const retryResult = await withRetry(() => handler(req, context))
        if (!retryResult.success) {
          throw retryResult.error || new Error('Operation failed')
        }
        result = retryResult.data!
      } else if (config.enableCircuitBreaker) {
        const circuitName = `${req.method}-${req.nextUrl.pathname}`
        result = await withCircuitBreaker(circuitName, () => handler(req, context))
      } else {
        result = await handler(req, context)
      }
      
      // Log successful API call
      if (config.enableLogging) {
        trackApiCall(
          req.nextUrl.pathname,
          req.method,
          Date.now() - startTime,
          true,
          undefined,
          errorContext
        )
      }
      
      // Return success response
      const response = formatSuccessResponse(result, requestId)
      return NextResponse.json(response, { 
        status: 200,
        headers 
      })
      
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Log error
      if (config.enableLogging) {
        logError(error as Error, errorContext)
        trackApiCall(
          req.nextUrl.pathname,
          req.method,
          duration,
          false,
          error as Error,
          errorContext
        )
      }
      
      // Format error response
      const errorResponse = formatErrorResponse(error as Error, requestId)
      const statusCode = error instanceof ViblerError ? error.statusCode : 500
      
      return NextResponse.json(errorResponse, { 
        status: statusCode,
        headers: new Headers({ 'x-request-id': requestId })
      })
    }
  }
}

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

export function withValidation<T>(
  handler: ApiHandler<T>,
  validator: (data: unknown) => { success: boolean; data?: any; error?: any }
) {
  return async (req: NextRequest, context?: any): Promise<T> => {
    let body: unknown
    
    try {
      // Parse request body if present
      if (req.method !== 'GET' && req.method !== 'DELETE') {
        const text = await req.text()
        if (text) {
          body = JSON.parse(text)
        }
      }
      
      // Validate request data
      const validation = validator(body)
      if (!validation.success) {
        throw ErrorFactory.validation(
          'Request validation failed',
          createErrorContext(req),
          validation.error
        )
      }
      
      // Add validated data to request context
      const enhancedContext = {
        ...context,
        validatedData: validation.data
      }
      
      return handler(req, enhancedContext)
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw ErrorFactory.validation(
          'Invalid JSON in request body',
          createErrorContext(req),
          error
        )
      }
      throw error
    }
  }
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

export function withAuth<T>(
  handler: ApiHandler<T>,
  options: { required?: boolean; roles?: string[] } = {}
) {
  return async (req: NextRequest, context?: any): Promise<T> => {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token && options.required !== false) {
      throw ErrorFactory.authentication(
        'Authentication token required',
        createErrorContext(req)
      )
    }
    
    if (token) {
      try {
        // Verify token (implement your token verification logic)
        const user = await verifyToken(token)
        
        // Check roles if specified
        if (options.roles && !options.roles.some(role => user.roles?.includes(role))) {
          throw ErrorFactory.authorization(
            'Insufficient permissions',
            createErrorContext(req)
          )
        }
        
        // Add user to context
        const enhancedContext = {
          ...context,
          user
        }
        
        return handler(req, enhancedContext)
        
      } catch (error) {
        throw ErrorFactory.authentication(
          'Invalid authentication token',
          createErrorContext(req),
          error as Error
        )
      }
    }
    
    return handler(req, context)
  }
}

// ============================================================================
// RATE LIMITING MIDDLEWARE
// ============================================================================

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit<T>(
  handler: ApiHandler<T>,
  options: { 
    maxRequests: number
    windowMs: number
    keyGenerator?: (req: NextRequest) => string
  }
) {
  return async (req: NextRequest, context?: any): Promise<T> => {
    const key = options.keyGenerator 
      ? options.keyGenerator(req)
      : req.headers.get('x-forwarded-for') || 'anonymous'
    
    const now = Date.now()
    const record = rateLimitStore.get(key)
    
    if (!record || now > record.resetTime) {
      // Reset or create new record
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs
      })
    } else if (record.count >= options.maxRequests) {
      // Rate limit exceeded
      throw new ViblerError({
        code: ErrorCode.EXTERNAL_API_ERROR,
        message: 'Rate limit exceeded',
        severity: 'medium' as any,
        statusCode: 429,
        retryable: true,
        userMessage: 'Too many requests. Please try again later.'
      })
    } else {
      // Increment count
      record.count++
    }
    
    return handler(req, context)
  }
}

// ============================================================================
// TIMEOUT MIDDLEWARE
// ============================================================================

export function withTimeout<T>(
  handler: ApiHandler<T>,
  timeoutMs: number = 30000
) {
  return async (req: NextRequest, context?: any): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new ViblerError({
          code: ErrorCode.PROCESSING_TIMEOUT,
          message: `Request timeout after ${timeoutMs}ms`,
          severity: 'medium' as any,
          statusCode: 408,
          retryable: true,
          userMessage: 'Request timed out. Please try again.'
        }))
      }, timeoutMs)
    })
    
    return Promise.race([
      handler(req, context),
      timeoutPromise
    ])
  }
}

// ============================================================================
// COMBINED MIDDLEWARE
// ============================================================================

export function createApiHandler<T>(
  handler: ApiHandler<T>,
  config: MiddlewareConfig & {
    validator?: (data: unknown) => { success: boolean; data?: any; error?: any }
    auth?: { required?: boolean; roles?: string[] }
    rateLimit?: { maxRequests: number; windowMs: number }
    timeout?: number
  } = {}
) {
  let wrappedHandler = handler
  
  // Apply timeout
  if (config.timeout) {
    wrappedHandler = withTimeout(wrappedHandler, config.timeout)
  }
  
  // Apply rate limiting
  if (config.rateLimit) {
    wrappedHandler = withRateLimit(wrappedHandler, config.rateLimit)
  }
  
  // Apply authentication
  if (config.auth) {
    wrappedHandler = withAuth(wrappedHandler, config.auth)
  }
  
  // Apply validation
  if (config.validator) {
    wrappedHandler = withValidation(wrappedHandler, config.validator)
  }
  
  // Apply error handling (always last)
  return withErrorHandling(wrappedHandler, config)
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function verifyToken(token: string): Promise<{ id: string; roles?: string[] }> {
  // Implement your token verification logic here
  // This is a placeholder implementation
  try {
    // In a real implementation, you would:
    // 1. Verify JWT signature
    // 2. Check expiration
    // 3. Validate against database
    // 4. Return user information
    
    if (token === 'invalid') {
      throw new Error('Invalid token')
    }
    
    return {
      id: 'user-123',
      roles: ['user']
    }
  } catch (error) {
    throw new Error('Token verification failed')
  }
}

// ============================================================================
// EDGE FUNCTION HELPERS
// ============================================================================

export function createEdgeFunctionHandler<T>(
  handler: (req: Request) => Promise<T>,
  config: MiddlewareConfig = {}
) {
  return async (req: Request): Promise<Response> => {
    const startTime = Date.now()
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID()
    
    try {
      const result = await handler(req)
      
      // Log successful call
      if (config.enableLogging) {
        logger.info(`Edge Function success`, {
          requestId,
          method: req.method,
          url: req.url,
          duration: Date.now() - startTime
        })
      }
      
      const response = formatSuccessResponse(result, requestId)
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': requestId
        }
      })
      
    } catch (error) {
      // Log error
      if (config.enableLogging) {
        logError(error as Error, {
          requestId,
          method: req.method,
          url: req.url,
          duration: Date.now() - startTime
        })
      }
      
      const errorResponse = formatErrorResponse(error as Error, requestId)
      const statusCode = error instanceof ViblerError ? error.statusCode : 500
      
      return new Response(JSON.stringify(errorResponse), {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': requestId
        }
      })
    }
  }
} 