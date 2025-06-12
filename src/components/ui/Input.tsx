import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'filled' | 'outline'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text', 
    label, 
    error, 
    helper, 
    leftIcon, 
    rightIcon, 
    variant = 'default',
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = `
      w-full rounded-lg border transition-all duration-200 focus:outline-none 
      focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed 
      disabled:opacity-50 placeholder:text-secondary-400
    `

    const variants = {
      default: `
        border-secondary-300 bg-white px-3 py-2.5 text-secondary-900 
        focus:border-primary-500 focus:ring-primary-500/20
        ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''}
      `,
      filled: `
        border-transparent bg-secondary-100 px-3 py-2.5 text-secondary-900 
        focus:bg-white focus:border-primary-500 focus:ring-primary-500/20
        ${error ? 'bg-error-50 focus:border-error-500 focus:ring-error-500/20' : ''}
      `,
      outline: `
        border-2 border-secondary-300 bg-transparent px-3 py-2.5 text-secondary-900 
        focus:border-primary-500 focus:ring-primary-500/20
        ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''}
      `,
    }

    const inputClasses = cn(
      baseStyles,
      variants[variant],
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      className
    )

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-secondary-700">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={inputClasses}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || helper) && (
          <div className="mt-1.5 text-sm">
            {error ? (
              <span className="text-error-600">{error}</span>
            ) : (
              <span className="text-secondary-500">{helper}</span>
            )}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input } 