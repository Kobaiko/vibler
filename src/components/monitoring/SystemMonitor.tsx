'use client'

import React, { useState, useEffect } from 'react'
import { MagicCard } from '@/components/ui/magic-card'
import AnimatedCircularProgressBar from '@/components/ui/animated-circular-progress-bar'
import NumberTicker from '@/components/ui/number-ticker'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Database, 
  Zap, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Server,
  Wifi,
  RefreshCw
} from 'lucide-react'

interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime?: number
  lastCheck: string
  error?: string
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
    requests: {
      total: number
      successful: number
      failed: number
      averageResponseTime: number
    }
  }
}

interface SystemMonitorProps {
  className?: string
}

export function SystemMonitor({ className }: SystemMonitorProps) {
  const [healthData, setHealthData] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchHealthData = async (detailed: boolean = false) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/health${detailed ? '?detailed=true' : ''}`)
      if (response.ok) {
        const data = await response.json()
        setHealthData(data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch health data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData(true)
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchHealthData(false)
      }, 30000) // Refresh every 30 seconds
      
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'degraded': return 'text-yellow-400'
      case 'unhealthy': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'unhealthy': return <AlertTriangle className="w-5 h-5 text-red-400" />
      default: return <Activity className="w-5 h-5 text-gray-400" />
    }
  }

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60))
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const successRate = healthData ? 
    Math.round((healthData.metrics.requests.successful / healthData.metrics.requests.total) * 100) : 0

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">System Monitor</h2>
          <p className="text-gray-600">Real-time system health and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <ShimmerButton
            onClick={() => fetchHealthData(true)}
            disabled={loading}
            className="px-4 py-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </ShimmerButton>
        </div>
      </div>

      {/* Overall Status */}
      {healthData && (
        <MagicCard className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full bg-gray-800 ${getStatusColor(healthData.status)}`}>
                {getStatusIcon(healthData.status)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white capitalize">
                  System {healthData.status}
                </h3>
                <p className="text-gray-600">
                  Uptime: {formatUptime(healthData.uptime)} • Version {healthData.version}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                <NumberTicker value={successRate} />%
              </div>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
          </div>
        </MagicCard>
      )}

      {/* Service Status Grid */}
      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Database */}
          <MagicCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className={`w-6 h-6 ${getStatusColor(healthData.services.database.status)}`} />
              <h3 className="text-lg font-semibold text-white">Database</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`capitalize ${getStatusColor(healthData.services.database.status)}`}>
                  {healthData.services.database.status}
                </span>
              </div>
              {healthData.services.database.responseTime && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="text-white">
                    <NumberTicker value={Math.round(healthData.services.database.responseTime)} />ms
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Check</span>
                <span className="text-white text-sm">
                  {new Date(healthData.services.database.lastCheck).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </MagicCard>

          {/* OpenAI API */}
          <MagicCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className={`w-6 h-6 ${getStatusColor(healthData.services.openai.status)}`} />
              <h3 className="text-lg font-semibold text-white">OpenAI API</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`capitalize ${getStatusColor(healthData.services.openai.status)}`}>
                  {healthData.services.openai.status}
                </span>
              </div>
              {healthData.services.openai.responseTime && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="text-white">
                    <NumberTicker value={Math.round(healthData.services.openai.responseTime)} />ms
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Check</span>
                <span className="text-white text-sm">
                  {new Date(healthData.services.openai.lastCheck).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </MagicCard>

          {/* Edge Functions */}
          <MagicCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className={`w-6 h-6 ${getStatusColor(healthData.services.edgeFunctions.status)}`} />
              <h3 className="text-lg font-semibold text-white">Edge Functions</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`capitalize ${getStatusColor(healthData.services.edgeFunctions.status)}`}>
                  {healthData.services.edgeFunctions.status}
                </span>
              </div>
              {healthData.services.edgeFunctions.responseTime && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="text-white">
                    <NumberTicker value={Math.round(healthData.services.edgeFunctions.responseTime)} />ms
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Check</span>
                <span className="text-white text-sm">
                  {new Date(healthData.services.edgeFunctions.lastCheck).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </MagicCard>
        </div>
      )}

      {/* Performance Metrics */}
      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Requests */}
          <MagicCard className="p-6 text-center">
            <Server className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-2">
              <NumberTicker value={healthData.metrics.requests.total} />
            </div>
            <p className="text-gray-600">Total Requests</p>
          </MagicCard>

          {/* Success Rate */}
          <MagicCard className="p-6 text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <AnimatedCircularProgressBar
                max={100}
                value={successRate}
                gaugePrimaryColor="#10b981"
                gaugeSecondaryColor="#374151"
                className="w-20 h-20"
              />
            </div>
            <p className="text-gray-600">Success Rate</p>
          </MagicCard>

          {/* Average Response Time */}
          <MagicCard className="p-6 text-center">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-2">
              <NumberTicker value={Math.round(healthData.metrics.requests.averageResponseTime)} />
              <span className="text-lg">ms</span>
            </div>
            <p className="text-gray-600">Avg Response Time</p>
          </MagicCard>

          {/* Error Count */}
          <MagicCard className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-2">
              <NumberTicker value={healthData.metrics.requests.failed} />
            </div>
            <p className="text-gray-600">Failed Requests</p>
          </MagicCard>
        </div>
      )}

      {/* Loading State */}
      {loading && !healthData && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-gray-600">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Loading system status...</span>
          </div>
        </div>
      )}

      {/* Auto Refresh Toggle */}
      <div className="flex items-center justify-center">
        <label className="flex items-center gap-3 text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="sr-only"
          />
          <div className={`relative w-12 h-6 rounded-full transition-colors ${
            autoRefresh ? 'bg-blue-600' : 'bg-gray-600'
          }`}>
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              autoRefresh ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </div>
          <span>Auto-refresh every 30s</span>
        </label>
      </div>
    </div>
  )
} 