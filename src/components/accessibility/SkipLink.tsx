'use client'

import React from 'react'

interface SkipLinkProps {
  href: string
  children: React.ReactNode
}

export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="skip-link"
      onFocus={(e) => {
        // Ensure the link is visible when focused
        e.currentTarget.classList.add('focus')
      }}
      onBlur={(e) => {
        e.currentTarget.classList.remove('focus')
      }}
    >
      {children}
    </a>
  )
}

export function SkipLinks() {
  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>
    </>
  )
} 