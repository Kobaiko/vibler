// Vibler Error Handling System
// Comprehensive error management for the marketing automation platform

// ============================================================================
// ERROR CODES AND TYPES
// ============================================================================

export enum ErrorCode {
  // Validation Errors (1000-1999)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  SCHEMA_VALIDATION_FAILED = 'SCHEMA_VALIDATION_FAILED',
  
  // Authentication/Authorization Errors (2000-2999)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // API/External Service Errors (3000-3999)
  OPENAI_API_ERROR = 'OPENAI_API_ERROR',
  OPENAI_RATE_LIMIT = 'OPENAI_RATE_LIMIT',
  OPENAI_QUOTA_EXCEEDED = 'OPENAI_QUOTA_EXCEEDED',
  OPENAI_INVALID_REQUEST = 'OPENAI_INVALID_REQUEST',
  SUPABASE_ERROR = 'SUPABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  
  // Database Errors (4000-4999)
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR = 'DATABASE_QUERY_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD = 'DUPLICATE_RECORD',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  
  // Business Logic Errors (5000-5999)
  FUNNEL_GENERATION_FAILED = 'FUNNEL_GENERATION_FAILED',
  INVALID_FUNNEL_STATE = 'INVALID_FUNNEL_STATE',
  COMPONENT_GENERATION_FAILED = 'COMPONENT_GENERATION_FAILED',
  PROCESSING_TIMEOUT = 'PROCESSING_TIMEOUT',
  RESOURCE_LIMIT_EXCEEDED = 'RESOURCE_LIMIT_EXCEEDED',
  
  // System Errors (6000-6999)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ============================================================================
// BASE ERROR CLASSES
// ============================================================================

export interface ErrorContext {
  userId?: string
  requestId?: string
  timestamp?: string
  userAgent?: string
  ip?: string
  endpoint?: string
  method?: string
  additionalData?: Record<string, any>
}

export interface ErrorDetails {
  code: ErrorCode
  message: string
  severity: ErrorSeverity
  statusCode: number
  context?: ErrorContext
  cause?: Error
  retryable?: boolean
  userMessage?: string
}

export class ViblerError extends Error {
  public readonly code: ErrorCode
  public readonly severity: ErrorSeverity
  public readonly statusCode: number
  public readonly context?: ErrorContext
  public readonly cause?: Error
  public readonly retryable: boolean
  public readonly userMessage?: string
  public readonly timestamp: string

  constructor(details: ErrorDetails) {
    super(details.message)
    this.name = 'ViblerError'
    this.code = details.code
    this.severity = details.severity
    this.statusCode = details.statusCode
    this.context = details.context
    this.cause = details.cause
    this.retryable = details.retryable ?? false
    this.userMessage = details.userMessage
    this.timestamp = new Date().toISOString()

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ViblerError)
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      severity: this.severity,
      statusCode: this.statusCode,
      context: this.context,
      retryable: this.retryable,
      userMessage: this.userMessage,
      timestamp: this.timestamp,
      stack: this.stack
    }
  }
}

// ============================================================================
// SPECIFIC ERROR CLASSES
// ============================================================================

export class ValidationError extends ViblerError {
  constructor(message: string, context?: ErrorContext, cause?: Error) {
    super({
      code: ErrorCode.VALIDATION_ERROR,
      message,
      severity: ErrorSeverity.MEDIUM,
      statusCode: 400,
      context,
      cause,
      retryable: false,
      userMessage: 'The provided data is invalid. Please check your input and try again.'
    })
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends ViblerError {
  constructor(message: string, context?: ErrorContext, cause?: Error) {
    super({
      code: ErrorCode.UNAUTHORIZED,
      message,
      severity: ErrorSeverity.HIGH,
      statusCode: 401,
      context,
      cause,
      retryable: false,
      userMessage: 'Authentication required. Please log in and try again.'
    })
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ViblerError {
  constructor(message: string, context?: ErrorContext, cause?: Error) {
    super({
      code: ErrorCode.FORBIDDEN,
      message,
      severity: ErrorSeverity.HIGH,
      statusCode: 403,
      context,
      cause,
      retryable: false,
      userMessage: 'You do not have permission to perform this action.'
    })
    this.name = 'AuthorizationError'
  }
}

export class OpenAIError extends ViblerError {
  constructor(message: string, code?: ErrorCode, context?: ErrorContext, cause?: Error) {
    super({
      code: code || ErrorCode.OPENAI_API_ERROR,
      message,
      severity: ErrorSeverity.HIGH,
      statusCode: 502,
      context,
      cause,
      retryable: true,
      userMessage: 'AI service is temporarily unavailable. Please try again in a moment.'
    })
    this.name = 'OpenAIError'
  }
}

export class DatabaseError extends ViblerError {
  constructor(message: string, code?: ErrorCode, context?: ErrorContext, cause?: Error) {
    super({
      code: code || ErrorCode.DATABASE_QUERY_ERROR,
      message,
      severity: ErrorSeverity.HIGH,
      statusCode: 500,
      context,
      cause,
      retryable: true,
      userMessage: 'Database service is temporarily unavailable. Please try again.'
    })
    this.name = 'DatabaseError'
  }
}

export class BusinessLogicError extends ViblerError {
  constructor(message: string, code?: ErrorCode, context?: ErrorContext, cause?: Error) {
    super({
      code: code || ErrorCode.FUNNEL_GENERATION_FAILED,
      message,
      severity: ErrorSeverity.MEDIUM,
      statusCode: 422,
      context,
      cause,
      retryable: true,
      userMessage: 'Unable to process your request. Please try again or contact support.'
    })
    this.name = 'BusinessLogicError'
  }
}

export class SystemError extends ViblerError {
  constructor(message: string, code?: ErrorCode, context?: ErrorContext, cause?: Error) {
    super({
      code: code || ErrorCode.INTERNAL_SERVER_ERROR,
      message,
      severity: ErrorSeverity.CRITICAL,
      statusCode: 500,
      context,
      cause,
      retryable: true,
      userMessage: 'An unexpected error occurred. Our team has been notified.'
    })
    this.name = 'SystemError'
  }
}

// ============================================================================
// ERROR RESPONSE FORMATTING
// ============================================================================

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    userMessage?: string
    details?: any
    timestamp: string
    requestId?: string
  }
  retryable?: boolean
}

export interface SuccessResponse<T = any> {
  success: true
  data: T
  timestamp: string
  requestId?: string
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse

export function formatErrorResponse(error: Error, requestId?: string): ErrorResponse {
  if (error instanceof ViblerError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        userMessage: error.userMessage,
        timestamp: error.timestamp,
        requestId: requestId || error.context?.requestId
      },
      retryable: error.retryable
    }
  }

  // Handle unknown errors
  return {
    success: false,
    error: {
      code: ErrorCode.UNKNOWN_ERROR,
      message: 'An unexpected error occurred',
      userMessage: 'Something went wrong. Please try again.',
      timestamp: new Date().toISOString(),
      requestId
    },
    retryable: false
  }
}

export function formatSuccessResponse<T>(data: T, requestId?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId
  }
}

// ============================================================================
// ERROR UTILITIES
// ============================================================================

export function isRetryableError(error: Error): boolean {
  if (error instanceof ViblerError) {
    return error.retryable
  }
  
  // Check for common retryable error patterns
  const retryablePatterns = [
    /timeout/i,
    /rate limit/i,
    /service unavailable/i,
    /connection/i,
    /network/i
  ]
  
  return retryablePatterns.some(pattern => pattern.test(error.message))
}

export function getErrorSeverity(error: Error): ErrorSeverity {
  if (error instanceof ViblerError) {
    return error.severity
  }
  
  // Default severity based on error type
  if (error.name === 'ValidationError') return ErrorSeverity.MEDIUM
  if (error.name === 'AuthenticationError') return ErrorSeverity.HIGH
  if (error.name === 'AuthorizationError') return ErrorSeverity.HIGH
  
  return ErrorSeverity.MEDIUM
}

export function createErrorContext(req?: any): ErrorContext {
  if (!req) return {}
  
  return {
    requestId: req.headers?.['x-request-id'] || crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userAgent: req.headers?.['user-agent'],
    ip: req.headers?.['x-forwarded-for'] || req.connection?.remoteAddress,
    endpoint: req.url,
    method: req.method
  }
}

// ============================================================================
// ERROR FACTORY FUNCTIONS
// ============================================================================

export const ErrorFactory = {
  validation: (message: string, context?: ErrorContext, cause?: Error) => 
    new ValidationError(message, context, cause),
    
  authentication: (message: string, context?: ErrorContext, cause?: Error) => 
    new AuthenticationError(message, context, cause),
    
  authorization: (message: string, context?: ErrorContext, cause?: Error) => 
    new AuthorizationError(message, context, cause),
    
  openai: (message: string, code?: ErrorCode, context?: ErrorContext, cause?: Error) => 
    new OpenAIError(message, code, context, cause),
    
  database: (message: string, code?: ErrorCode, context?: ErrorContext, cause?: Error) => 
    new DatabaseError(message, code, context, cause),
    
  businessLogic: (message: string, code?: ErrorCode, context?: ErrorContext, cause?: Error) => 
    new BusinessLogicError(message, code, context, cause),
    
  system: (message: string, code?: ErrorCode, context?: ErrorContext, cause?: Error) => 
    new SystemError(message, code, context, cause)
} 