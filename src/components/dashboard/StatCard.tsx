'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: number
    label?: string
    period?: string
  }
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'primary'
}

const variantStyles = {
  default: 'bg-secondary-50 text-secondary-600',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600', 
  error: 'bg-error-50 text-error-600',
  primary: 'bg-primary-50 text-primary-600',
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  className,
  variant = 'default' 
}: StatCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null
    
    if (trend.value > 0) {
      return <TrendingUp className="w-4 h-4 text-success-600" />
    } else if (trend.value < 0) {
      return <TrendingDown className="w-4 h-4 text-error-600" />
    } else {
      return <Minus className="w-4 h-4 text-secondary-400" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return ''
    
    if (trend.value > 0) return 'text-success-600'
    if (trend.value < 0) return 'text-error-600'
    return 'text-secondary-500'
  }

  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-secondary-600 mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-secondary-900 mb-2">
              {value}
            </p>
            
            {trend && (
              <div className="flex items-center space-x-1">
                {getTrendIcon()}
                <span className={cn('text-sm font-medium', getTrendColor())}>
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </span>
                {trend.label && (
                  <span className="text-sm text-secondary-500">
                    {trend.label}
                  </span>
                )}
                {trend.period && (
                  <span className="text-xs text-secondary-400">
                    {trend.period}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {icon && (
            <div className={cn(
              'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
              variantStyles[variant]
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 