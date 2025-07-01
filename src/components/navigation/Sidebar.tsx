'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { WalkthroughTour } from '@/components/onboarding/WalkthroughTour'
import { 
  LayoutDashboard, 
  Zap, 
  Users, 
  Target, 
  Palette, 
  Map, 
  BarChart3, 
  Monitor,
  Folder,
  UserPlus,
  Settings,
  Shield,
  HelpCircle,
  User,
  LogOut,
  CreditCard,
  ChevronUp,
  Play,
  Lightbulb
} from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: any
  description: string
  color: string
  dataTour?: string
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isTourOpen, setIsTourOpen] = useState(false)

  // Mock user data - replace with actual user context
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@company.com',
    avatar: '/placeholder-avatar.jpg',
    companyName: 'Acme Corp'
  }

  // Check if user has completed tour and auto-start if not
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('vibler_tour_completed')
    if (!hasCompletedTour) {
      // Auto-start tour after a short delay for better UX
      const timer = setTimeout(() => {
        setIsTourOpen(true)
      }, 1500) // 1.5 second delay

      return () => clearTimeout(timer)
    }
  }, [])

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview and analytics',
      color: 'text-blue-400'
    },
    {
      name: 'Creative Generator',
      href: '/dashboard/creative',
      icon: Palette,
      description: 'AI-powered ad creation',
      color: 'text-purple-400',
      dataTour: 'creative-nav'
    },
    {
      name: 'Strategy Composer',
      href: '/dashboard/strategy',
      icon: Target,
      description: 'Marketing strategy builder',
      color: 'text-green-400',
      dataTour: 'strategy-nav'
    },
    {
      name: 'ICP Generator',
      href: '/dashboard/icps',
      icon: Users,
      description: 'Customer persona creation',
      color: 'text-orange-400',
      dataTour: 'icp-nav'
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      description: 'Performance insights',
      color: 'text-indigo-400'
    }
  ]

  const secondaryNavigation = [
    {
      name: 'Profile & Branding',
      href: '/dashboard/profile',
      icon: User,
      color: 'text-gray-400'
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      color: 'text-gray-400'
    },
    {
      name: 'Privacy',
      href: '/dashboard/privacy',
      icon: Shield,
      color: 'text-gray-400'
    },
    {
      name: 'Help',
      href: '/dashboard/help',
      icon: HelpCircle,
      color: 'text-gray-400'
    }
  ]

  const startWalkthrough = () => {
    setIsTourOpen(true)
    setUserMenuOpen(false) // Close user menu if open
  }

  const handleTourComplete = () => {
    setIsTourOpen(false)
    // Save that user has completed tour
    localStorage.setItem('vibler_tour_completed', 'true')
  }

  const resetTour = () => {
    localStorage.removeItem('vibler_tour_completed')
    setUserMenuOpen(false)
    // Auto-start tour after a brief moment
    setTimeout(() => {
      setIsTourOpen(true)
    }, 500)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <>
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen w-64 modern-sidebar",
        className
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-gray-700 px-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold text-sidebar">Vibler</span>
            </Link>
          </div>

          {/* Walkthrough Button */}
          <div className="px-3 pt-4 pb-2">
            <button
              onClick={startWalkthrough}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">Take a Tour</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "nav-item group",
                      isActive && "active"
                    )}
                    {...(item.dataTour && { 'data-tour': item.dataTour })}
                  >
                    <item.icon 
                      className={cn(
                        "mr-3 h-5 w-5 transition-colors",
                        isActive ? "text-white" : item.color
                      )} 
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isActive ? "text-white" : "text-sidebar-muted group-hover:text-sidebar"
                      )}>
                        {item.name}
                      </p>
                      <p className={cn(
                        "text-xs truncate",
                        isActive ? "text-white/80" : "text-sidebar-muted/70"
                      )}>
                        {item.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Secondary Navigation */}
            <div className="pt-6">
              <p className="px-3 text-xs font-semibold text-sidebar-muted uppercase tracking-wider mb-3">
                More
              </p>
              <div className="space-y-1">
                {secondaryNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "nav-item group",
                        isActive && "active"
                      )}
                    >
                      <item.icon 
                        className={cn(
                          "mr-3 h-5 w-5 transition-colors",
                          isActive ? "text-white" : "text-sidebar-muted group-hover:text-sidebar"
                        )} 
                      />
                      <span className={cn(
                        "text-sm font-medium",
                        isActive ? "text-white" : "text-sidebar-muted group-hover:text-sidebar"
                      )}>
                        {item.name}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-gray-700 p-4">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-purple-600 text-white text-sm">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-sidebar truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-sidebar-muted truncate">
                    {user.companyName}
                  </p>
                </div>
                <ChevronUp 
                  className={cn(
                    "w-4 h-4 text-sidebar-muted transition-transform",
                    userMenuOpen && "rotate-180"
                  )}
                />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg overflow-hidden"
                >
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-sidebar-muted hover:bg-gray-700 hover:text-sidebar transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile & Branding</span>
                  </Link>
                  <Link
                    href="/dashboard/billing"
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-sidebar-muted hover:bg-gray-700 hover:text-sidebar transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Billing & Plan</span>
                  </Link>
                  <button
                    onClick={startWalkthrough}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-sidebar-muted hover:bg-gray-700 hover:text-sidebar transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>Take a Tour</span>
                  </button>
                  <button
                    onClick={resetTour}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-blue-400 hover:bg-gray-700 hover:text-blue-300 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Reset Tour</span>
                  </button>
                  <div className="border-t border-gray-600">
                    <button
                      onClick={() => {
                        // Handle sign out
                        setUserMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Tour Component */}
      <WalkthroughTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onComplete={handleTourComplete}
      />
    </>
  )
} 