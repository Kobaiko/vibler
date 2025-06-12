import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center rounded-lg font-medium 
      transition-all duration-200 focus:outline-none focus:ring-2 
      focus:ring-offset-2 disabled:cursor-not-allowed
    `

    const variants = {
      primary: `
        bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700
        focus:ring-primary-500 disabled:bg-primary-300 shadow-md hover:shadow-lg
      `,
      secondary: `
        bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300
        focus:ring-secondary-500 disabled:bg-secondary-50 disabled:text-secondary-400
      `,
      outline: `
        border-2 border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100
        focus:ring-primary-500 disabled:border-primary-300 disabled:text-primary-300
      `,
      ghost: `
        text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200
        focus:ring-secondary-500 disabled:text-secondary-400
      `,
      danger: `
        bg-error-500 text-white hover:bg-error-600 active:bg-error-700
        focus:ring-error-500 disabled:bg-error-300 shadow-md hover:shadow-lg
      `,
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm gap-2',
      md: 'px-4 py-2.5 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-3',
      xl: 'px-8 py-4 text-xl gap-3',
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          loading && 'cursor-wait',
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button } 