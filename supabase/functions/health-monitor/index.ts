import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createLogger, PerformanceMonitor, ErrorTracker } from '../_shared/logger.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  services: {
    database: ServiceHealth
    openai: ServiceHealth
    edgeFunctions: ServiceHealth
  }
  metrics: {
    performance: any
    errors: any
    requests: RequestMetrics
  }
}

interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime?: number
  lastCheck: string
  error?: string
}

interface RequestMetrics {
  total: number
  successful: number
  failed: number
  averageResponseTime: number
}

// Global metrics tracking
let requestMetrics: RequestMetrics = {
  total: 0,
  successful: 0,
  failed: 0,
  averageResponseTime: 0
}

let responseTimes: number[] = []
const startTime = Date.now()

serve(async (req) => {
  const logger = createLogger('health-monitor', req)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    logger.requestStart(req.method, req.url)
    const requestStart = performance.now()

    // Check if this is a detailed health check or simple ping
    const url = new URL(req.url)
    const detailed = url.searchParams.get('detailed') === 'true'
    const component = url.searchParams.get('component')

    if (req.method === 'GET') {
      let healthStatus: HealthStatus

      if (component) {
        // Check specific component health
        const componentHealth = await checkComponentHealth(component, logger)
        const requestEnd = performance.now()
        const duration = requestEnd - requestStart
        
        logger.requestEnd(200, JSON.stringify(componentHealth).length)
        
        return new Response(
          JSON.stringify(componentHealth),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } else if (detailed) {
        // Perform comprehensive health check
        healthStatus = await performDetailedHealthCheck(logger)
      } else {
        // Simple health check
        healthStatus = await performSimpleHealthCheck(logger)
      }

      const requestEnd = performance.now()
      const duration = requestEnd - requestStart
      
      // Update metrics
      requestMetrics.total++
      requestMetrics.successful++
      responseTimes.push(duration)
      
      // Keep only last 100 response times
      if (responseTimes.length > 100) {
        responseTimes.shift()
      }
      
      requestMetrics.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length

      logger.requestEnd(200, JSON.stringify(healthStatus).length)

      return new Response(
        JSON.stringify(healthStatus),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Method not allowed
    logger.warn('Method not allowed', { method: req.method })
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    const requestEnd = performance.now()
    const duration = requestEnd - requestStart
    
    // Update error metrics
    requestMetrics.total++
    requestMetrics.failed++
    responseTimes.push(duration)
    
    logger.error('Health monitor error', error as Error)
    
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        error: (error as Error).message || 'Internal server error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function performSimpleHealthCheck(logger: any): Promise<HealthStatus> {
  logger.info('Performing simple health check')
  
  const uptime = Date.now() - startTime
  
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime,
    version: '1.0.0',
    services: {
      database: { status: 'healthy', lastCheck: new Date().toISOString() },
      openai: { status: 'healthy', lastCheck: new Date().toISOString() },
      edgeFunctions: { status: 'healthy', lastCheck: new Date().toISOString() }
    },
    metrics: {
      performance: {},
      errors: {},
      requests: requestMetrics
    }
  }
}

async function performDetailedHealthCheck(logger: any): Promise<HealthStatus> {
  logger.info('Performing detailed health check')
  
  const uptime = Date.now() - startTime
  const performanceMonitor = PerformanceMonitor.getInstance()
  
  // Check database health
  const databaseHealth = await checkDatabaseHealth(logger)
  
  // Check OpenAI API health
  const openaiHealth = await checkOpenAIHealth(logger)
  
  // Check Edge Functions health
  const edgeFunctionsHealth = await checkEdgeFunctionsHealth(logger)
  
  // Determine overall status
  const services = [databaseHealth, openaiHealth, edgeFunctionsHealth]
  const overallStatus = services.every(s => s.status === 'healthy') ? 'healthy' :
                       services.some(s => s.status === 'unhealthy') ? 'unhealthy' : 'degraded'

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime,
    version: '1.0.0',
    services: {
      database: databaseHealth,
      openai: openaiHealth,
      edgeFunctions: edgeFunctionsHealth
    },
    metrics: {
      performance: performanceMonitor.getAllMetrics(),
      errors: ErrorTracker.getErrorStats(),
      requests: requestMetrics
    }
  }
}

async function checkDatabaseHealth(logger: any): Promise<ServiceHealth> {
  const startTime = performance.now()
  
  try {
    logger.dbOperationStart('health_check', 'system')
    
    const supabaseUrl = (globalThis as any).Deno?.env?.get('SUPABASE_URL')
    const supabaseKey = (globalThis as any).Deno?.env?.get('SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Simple query to test database connectivity
    const { data, error } = await supabase
      .from('funnels')
      .select('count')
      .limit(1)

    const responseTime = performance.now() - startTime
    
    if (error) {
      logger.dbOperationError('health_check', 'system', error)
      return {
        status: 'unhealthy',
        responseTime,
        lastCheck: new Date().toISOString(),
        error: error.message
      }
    }

    logger.dbOperationEnd('health_check', 'system', responseTime)
    
    return {
      status: responseTime > 1000 ? 'degraded' : 'healthy',
      responseTime,
      lastCheck: new Date().toISOString()
    }

  } catch (error) {
    const responseTime = performance.now() - startTime
    logger.dbOperationError('health_check', 'system', error as Error)
    
    return {
      status: 'unhealthy',
      responseTime,
      lastCheck: new Date().toISOString(),
      error: (error as Error).message
    }
  }
}

async function checkOpenAIHealth(logger: any): Promise<ServiceHealth> {
  const startTime = performance.now()
  
  try {
    logger.apiCallStart('openai', 'health_check')
    
    const openaiApiKey = (globalThis as any).Deno?.env?.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      return {
        status: 'degraded',
        responseTime: 0,
        lastCheck: new Date().toISOString(),
        error: 'OpenAI API key not configured'
      }
    }

    // Simple API call to check OpenAI health
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
    })

    const responseTime = performance.now() - startTime
    
    if (!response.ok) {
      logger.apiCallError('openai', 'health_check', new Error(`HTTP ${response.status}`))
      return {
        status: 'unhealthy',
        responseTime,
        lastCheck: new Date().toISOString(),
        error: `HTTP ${response.status}`
      }
    }

    logger.apiCallEnd('openai', 'health_check', response.status, responseTime)
    
    return {
      status: responseTime > 2000 ? 'degraded' : 'healthy',
      responseTime,
      lastCheck: new Date().toISOString()
    }

  } catch (error) {
    const responseTime = performance.now() - startTime
    logger.apiCallError('openai', 'health_check', error as Error)
    
    return {
      status: 'unhealthy',
      responseTime,
      lastCheck: new Date().toISOString(),
      error: (error as Error).message
    }
  }
}

async function checkEdgeFunctionsHealth(logger: any): Promise<ServiceHealth> {
  const startTime = performance.now()
  
  try {
    // Check if Edge Functions are responsive
    // This is a self-check since we're running in an Edge Function
    const responseTime = performance.now() - startTime
    
    logger.info('Edge Functions health check completed', { responseTime })
    
    return {
      status: 'healthy',
      responseTime,
      lastCheck: new Date().toISOString()
    }

  } catch (error) {
    const responseTime = performance.now() - startTime
    logger.error('Edge Functions health check failed', error as Error)
    
    return {
      status: 'unhealthy',
      responseTime,
      lastCheck: new Date().toISOString(),
      error: (error as Error).message
    }
  }
}

async function checkComponentHealth(component: string, logger: any): Promise<ServiceHealth> {
  logger.info(`Checking health for component: ${component}`)
  
  switch (component.toLowerCase()) {
    case 'database':
      return await checkDatabaseHealth(logger)
    case 'openai':
      return await checkOpenAIHealth(logger)
    case 'edge-functions':
      return await checkEdgeFunctionsHealth(logger)
    default:
      return {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: `Unknown component: ${component}`
      }
  }
} 