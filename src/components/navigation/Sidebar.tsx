'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
      description: 'Overview and analytics'
    },
    {
      name: 'Prompt to Funnel',
      href: '/dashboard/prompt-to-funnel',
      icon: '🚀',
      description: 'Create funnels from prompts'
    },
    {
      name: 'ICP Generator',
      href: '/dashboard/icp',
      icon: '👥',
      description: 'Customer personas'
    },
    {
      name: 'Strategy Composer',
      href: '/dashboard/strategy',
      icon: '🎯',
      description: 'Marketing strategies'
    },
    {
      name: 'Creative Generator',
      href: '/dashboard/creative',
      icon: '🎨',
      description: 'Ad copy and visuals'
    },
    {
      name: 'Funnel Mapper',
      href: '/dashboard/funnel-mapper',
      icon: '🗺️',
      description: 'Visual funnel builder'
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: '📈',
      description: 'Performance metrics'
    },
  ]

  const secondaryNavigation = [
    {
      name: 'Projects',
      href: '/dashboard/projects',
      icon: '📁'
    },
    {
      name: 'Team',
      href: '/dashboard/team',
      icon: '👨‍👩‍👧‍👦'
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: '⚙️'
    },
  ]

  return (
    <div className={cn('flex flex-col w-64 bg-white border-r border-secondary-200', className)}>
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-secondary-200">
        <Link href="/dashboard" className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="ml-2 text-xl font-display font-bold text-secondary-900">
            Vibler
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                )}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <div className="flex-1">
                  <div>{item.name}</div>
                  <div className="text-xs text-secondary-500 group-hover:text-secondary-600">
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-secondary-200 my-6"></div>

        {/* Secondary Navigation */}
        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
            Workspace
          </div>
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                )}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t border-secondary-200">
        <div className="flex items-center justify-between text-xs text-secondary-500">
          <span>Vibler Beta</span>
          <Link 
            href="/help" 
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Help
          </Link>
        </div>
      </div>
    </div>
  )
} 