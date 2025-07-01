'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { handleKeyboardNavigation, aria } from '@/lib/accessibility'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  children: React.ReactNode
  ariaLabel?: string
  ariaDescribedBy?: string
  srText?: string // Screen reader only text
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled, 
    children, 
    ariaLabel,
    ariaDescribedBy,
    srText,
    onClick,
    onKeyDown,
    ...props 
  }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center rounded-lg font-medium 
      transition-all duration-200 focus:outline-none focus:ring-2 
      focus:ring-offset-2 disabled:cursor-not-allowed
    `

    const variants = {
      primary: `
        bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 active:from-pink-700 active:to-purple-800
        focus:ring-purple-500 disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-600 shadow-md hover:shadow-lg
      `,
      secondary: `
        bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 active:bg-gray-100
        focus:ring-gray-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200
      `,
      outline: `
        border-2 border-purple-500 text-purple-600 hover:bg-purple-50 active:bg-purple-100
        focus:ring-purple-500 disabled:border-gray-300 disabled:text-gray-400
      `,
      ghost: `
        text-gray-700 hover:bg-gray-100 active:bg-gray-200
        focus:ring-gray-500 disabled:text-gray-400
      `,
      danger: `
        bg-red-500 text-white hover:bg-red-600 active:bg-red-700
        focus:ring-red-500 disabled:bg-red-300 shadow-md hover:shadow-lg
      `,
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm gap-2',
      md: 'px-4 py-2.5 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-3',
      xl: 'px-8 py-4 text-xl gap-3',
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return
      onClick?.(event)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      handleKeyboardNavigation(event, {
        onEnter: () => onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>),
        onSpace: () => onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>),
      })
      onKeyDown?.(event)
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          loading && 'cursor-wait',
          'focus-visible',
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        ref={ref}
        {...(ariaLabel && aria.label(ariaLabel))}
        {...(ariaDescribedBy && aria.describedBy(ariaDescribedBy))}
        {...(disabled && aria.disabled(true))}
        {...props}
      >
        {loading && (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
            <span className="sr-only">Loading...</span>
          </>
        )}
        {children}
        {srText && <span className="sr-only">{srText}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button } 