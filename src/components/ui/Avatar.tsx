import React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  className?: string
  children: React.ReactNode
}

interface AvatarImageProps {
  src?: string
  alt?: string
  className?: string
}

interface AvatarFallbackProps {
  children: React.ReactNode
  className?: string
}

export function Avatar({ className, children, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function AvatarImage({ src, alt, className, ...props }: AvatarImageProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false)
  const [imageError, setImageError] = React.useState(false)

  if (!src || imageError) {
    return null
  }

  return (
    <img
      className={cn('aspect-square h-full w-full', className)}
      src={src}
      alt={alt}
      onLoad={() => setImageLoaded(true)}
      onError={() => setImageError(true)}
      style={{ display: imageLoaded ? 'block' : 'none' }}
      {...props}
    />
  )
}

export function AvatarFallback({ children, className, ...props }: AvatarFallbackProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
} 