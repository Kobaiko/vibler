// Example API Route with Comprehensive Error Handling
// Demonstrates the new error handling, validation, and middleware system

import { NextRequest } from 'next/server'
import { createApiHandler } from '@/lib/middleware/error-handler'
import { validateCreateFunnelRequest } from '@/lib/validation/schemas'
import { ErrorFactory, ErrorCode } from '@/lib/errors'

// ============================================================================
// EXAMPLE HANDLER FUNCTION
// ============================================================================

async function handleCreateFunnel(req: NextRequest, context: any) {
  const { validatedData, user } = context
  
  // Simulate some business logic
  if (validatedData.name === 'forbidden') {
    throw ErrorFactory.businessLogic(
      'Funnel name is not allowed',
      ErrorCode.INVALID_FUNNEL_STATE
    )
  }
  
  // Simulate database operation
  if (validatedData.name === 'database-error') {
    throw ErrorFactory.database(
      'Failed to create funnel in database',
      ErrorCode.DATABASE_QUERY_ERROR
    )
  }
  
  // Simulate OpenAI API call
  if (validatedData.name === 'ai-error') {
    throw ErrorFactory.openai(
      'AI service failed to generate funnel',
      ErrorCode.OPENAI_API_ERROR
    )
  }
  
  // Success case
  const funnel = {
    id: crypto.randomUUID(),
    name: validatedData.name,
    description: validatedData.description,
    status: 'draft',
    priority: validatedData.priority || 'medium',
    ownerId: user?.id || 'anonymous',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  return funnel
}

// ============================================================================
// CONFIGURED API HANDLER
// ============================================================================

export const POST = createApiHandler(handleCreateFunnel, {
  // Enable comprehensive error handling
  enableLogging: true,
  enableRetry: true,
  enableCircuitBreaker: true,
  
  // Add validation
  validator: validateCreateFunnelRequest,
  
  // Add authentication (optional for this example)
  auth: { required: false },
  
  // Add rate limiting
  rateLimit: {
    maxRequests: 10,
    windowMs: 60000 // 1 minute
  },
  
  // Add timeout
  timeout: 30000 // 30 seconds
})

// ============================================================================
// EXAMPLE GET HANDLER
// ============================================================================

async function handleGetFunnels(req: NextRequest, context: any) {
  const { user } = context
  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  
  // Simulate fetching funnels
  const funnels = [
    {
      id: '1',
      name: 'Example Funnel',
      description: 'A sample marketing funnel',
      status: status || 'active',
      priority: 'high',
      ownerId: user?.id || 'anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
  
  return {
    funnels,
    total: funnels.length,
    page: 1,
    limit: 10,
    hasMore: false
  }
}

export const GET = createApiHandler(handleGetFunnels, {
  enableLogging: true,
  auth: { required: false },
  rateLimit: {
    maxRequests: 50,
    windowMs: 60000
  }
}) 