'use client'

import { SystemMonitor } from '@/components/monitoring/SystemMonitor'
import { Activity } from 'lucide-react'

export default function MonitoringPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="icon-container icon-container-green">
              <Activity className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          </div>
          <p className="text-muted max-w-3xl">
            Real-time monitoring and performance analytics for the Vibler marketing automation platform. 
            Track system health, API performance, and service availability.
          </p>
        </div>

        {/* System Monitor Component */}
        <SystemMonitor />
      </div>
    </div>
  )
} 