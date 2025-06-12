'use client'

import React from 'react'
import { Sidebar } from '@/components/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-secondary-50 flex">
      <Sidebar />
      <main 
        id="main-content"
        className="flex-1 overflow-auto"
        role="main"
        aria-label="Dashboard content"
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
} 