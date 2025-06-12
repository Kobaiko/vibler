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
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 