'use client'

import React from 'react'
import Image from 'next/image'
import { Card, CardHeader, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: 'created' | 'updated' | 'completed' | 'deleted' | 'shared' | 'custom'
  title: string
  description?: string
  timestamp: Date | string
  user?: {
    name: string
    avatar?: string
    initials?: string
  }
  icon?: React.ReactNode
  metadata?: Record<string, unknown>
}

interface ActivityTimelineProps {
  activities: ActivityItem[]
  title?: string
  subtitle?: string
  className?: string
  maxItems?: number
  showAvatars?: boolean
}

const activityColors = {
  created: 'bg-success-100 text-success-600 border-success-200',
  updated: 'bg-primary-100 text-primary-600 border-primary-200',
  completed: 'bg-success-100 text-success-600 border-success-200',
  deleted: 'bg-error-100 text-error-600 border-error-200',
  shared: 'bg-accent-100 text-accent-600 border-accent-200',
  custom: 'bg-secondary-100 text-secondary-600 border-secondary-200',
}

const activityIcons = {
  created: '✨',
  updated: '📝',
  completed: '✅',
  deleted: '🗑️',
  shared: '📤',
  custom: '📋',
}

export function ActivityTimeline({
  activities,
  title = 'Recent Activity',
  subtitle,
  className,
  maxItems = 10,
  showAvatars = true
}: ActivityTimelineProps) {
  const displayedActivities = activities.slice(0, maxItems)

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) { // 7 days
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className={className}>
      <CardHeader title={title} subtitle={subtitle} />
      
      <CardContent>
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8 text-secondary-500">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4">
            {displayedActivities.map((activity, index) => (
              <div key={activity.id} className="flex items-start space-x-3">
                {/* Activity Icon */}
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm',
                  activityColors[activity.type]
                )}>
                  {activity.icon || activityIcons[activity.type]}
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-secondary-900">
                      {activity.title}
                    </p>
                    <span className="text-xs text-secondary-500 whitespace-nowrap ml-2">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  
                  {activity.description && (
                    <p className="text-sm text-secondary-600 mt-1">
                      {activity.description}
                    </p>
                  )}

                                     {activity.user && showAvatars && (
                     <div className="flex items-center mt-2">
                       {activity.user.avatar ? (
                         <Image
                           src={activity.user.avatar}
                           alt={activity.user.name}
                           width={24}
                           height={24}
                           className="w-6 h-6 rounded-full"
                         />
                       ) : (
                        <div className="w-6 h-6 rounded-full bg-secondary-200 flex items-center justify-center text-xs font-medium text-secondary-700">
                          {activity.user.initials || getInitials(activity.user.name)}
                        </div>
                      )}
                      <span className="text-xs text-secondary-500 ml-2">
                        {activity.user.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Timeline Line */}
                {index < displayedActivities.length - 1 && (
                  <div className="absolute left-7 mt-8 w-0.5 h-6 bg-secondary-200" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Quick Actions Component
interface QuickAction {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
}

interface QuickActionsProps {
  actions: QuickAction[]
  title?: string
  subtitle?: string
  className?: string
  columns?: 1 | 2 | 3 | 4
}

const actionVariants = {
  default: 'border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50',
  primary: 'border-primary-200 hover:border-primary-300 hover:bg-primary-50',
  success: 'border-success-200 hover:border-success-300 hover:bg-success-50',
  warning: 'border-warning-200 hover:border-warning-300 hover:bg-warning-50',
  error: 'border-error-200 hover:border-error-300 hover:bg-error-50',
}

export function QuickActions({
  actions,
  title = 'Quick Actions',
  subtitle,
  className,
  columns = 2
}: QuickActionsProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <Card className={className}>
      <CardHeader title={title} subtitle={subtitle} />
      
      <CardContent>
        <div className={cn('grid gap-4', gridCols[columns])}>
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                'p-4 rounded-lg border-2 text-left transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                action.disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer',
                actionVariants[action.variant || 'default']
              )}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 text-lg">
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-secondary-900">
                    {action.title}
                  </h3>
                  {action.description && (
                    <p className="text-xs text-secondary-600 mt-1">
                      {action.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 