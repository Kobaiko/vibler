'use client'

import React from 'react'
import { Sidebar } from '@/components/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main 
        id="main-content"
        className="ml-64 min-h-screen"
        role="main"
        aria-label="Dashboard content"
      >
        {children}
      </main>
    </div>
  )
} 