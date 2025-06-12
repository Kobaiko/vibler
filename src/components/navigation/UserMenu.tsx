'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { User } from '@supabase/supabase-js'

interface UserMenuProps {
  user: User
  mobile?: boolean
}

export function UserMenu({ user, mobile = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { signOut } = useAuth()

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
    window.location.href = '/'
  }

  const menuItems = [
    { name: 'Profile', href: '/profile', icon: '👤' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
    { name: 'Billing', href: '/billing', icon: '💳' },
    { name: 'Help', href: '/help', icon: '❓' },
  ]

  // Mobile version - simplified layout
  if (mobile) {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-3 px-3 py-2 bg-secondary-50 rounded-lg">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-900 truncate">
              {user.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-secondary-500 truncate">{user.email}</p>
          </div>
        </div>
        
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center space-x-3 px-3 py-2 text-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-md transition-colors"
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
        
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-3 py-2 text-sm text-error-600 hover:text-error-700 hover:bg-error-50 rounded-md transition-colors w-full text-left"
        >
          <span>🚪</span>
          <span>Sign out</span>
        </button>
      </div>
    )
  }

  // Desktop version - dropdown menu
  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user.email?.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="hidden lg:block text-sm font-medium text-secondary-700 max-w-24 truncate">
          {user.user_metadata?.full_name || 'User'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-secondary-100">
            <p className="text-sm font-medium text-secondary-900 truncate">
              {user.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-secondary-500 truncate">{user.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Divider and sign out */}
          <div className="border-t border-secondary-100 py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors w-full text-left"
            >
              <span>🚪</span>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 