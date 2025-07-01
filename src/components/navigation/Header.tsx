'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { UserMenu } from './UserMenu'
import { SkipLinks } from '@/components/accessibility'
import { FocusManager, aria } from '@/lib/accessibility'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, loading } = useAuth()
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const navigation = [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
  ]

  // Handle mobile menu keyboard navigation
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }

    const handleTabTrap = (event: KeyboardEvent) => {
      if (mobileMenuOpen && mobileMenuRef.current) {
        FocusManager.trapFocus(mobileMenuRef.current, event)
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleTabTrap)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTabTrap)
    }
  }, [mobileMenuOpen])

  return (
    <>
      <SkipLinks />
      <header 
        className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm"
        id="navigation"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="ml-2 text-xl font-bold gradient-text group-hover:scale-105 transition-transform duration-200">
                Vibler
              </span>
            </Link>
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 rounded-full border border-purple-200">
              Beta
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-purple-600 font-medium transition-colors duration-200 hover:scale-105"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full" />
            ) : user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="modern-button-ghost">
                    Dashboard
                  </Button>
                </Link>
                <UserMenu user={user} />
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="modern-button-ghost">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="modern-button-primary">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              ref={menuButtonRef}
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
              ariaLabel={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
              {...aria.expanded(mobileMenuOpen)}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden bg-white border-t border-gray-200 shadow-lg rounded-b-lg mx-4 mb-2"
            role="menu"
            {...aria.labelledBy('mobile-menu-button')}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-3 text-base font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t border-gray-200 pt-3 mt-3">
                {loading ? (
                  <div className="px-3 py-2">
                    <div className="w-24 h-4 animate-pulse bg-gray-200 rounded" />
                  </div>
                ) : user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block px-3 py-3 text-base font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <div className="px-3 py-2">
                      <UserMenu user={user} mobile />
                    </div>
                  </>
                ) : (
                  <div className="px-3 py-2 space-y-3">
                    <Link href="/login" className="block">
                      <Button variant="ghost" size="sm" className="w-full justify-start modern-button-ghost">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup" className="block">
                      <Button size="sm" className="w-full modern-button-primary">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </header>
    </>
  )
} 