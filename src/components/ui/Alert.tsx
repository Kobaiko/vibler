import React from 'react'
import { cn } from '@/lib/utils'
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'

interface AlertProps {
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'warning' | 'success'
  className?: string
}

interface AlertDescriptionProps {
  children: React.ReactNode
  className?: string
}

const alertVariants = {
  default: 'bg-blue-50 text-blue-800 border-blue-200',
  destructive: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  success: 'bg-green-50 text-green-800 border-green-200'
}

const alertIcons = {
  default: Info,
  destructive: XCircle,
  warning: AlertTriangle,
  success: CheckCircle
}

export function Alert({ 
  children, 
  variant = 'default', 
  className 
}: AlertProps) {
  const Icon = alertIcons[variant]
  
  return (
    <div className={cn(
      'rounded-lg border p-4',
      alertVariants[variant],
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3">
          {children}
        </div>
      </div>
    </div>
  )
}

export function AlertDescription({ children, className }: AlertDescriptionProps) {
  return (
    <div className={cn('text-sm', className)}>
      {children}
    </div>
  )
} 