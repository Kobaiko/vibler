'use client'

import React from 'react'
import { Breadcrumb, useBreadcrumbs } from '@/components/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui'
import { usePathname } from 'next/navigation'

export default function DashboardPage() {
  const pathname = usePathname()
  const breadcrumbItems = useBreadcrumbs(pathname)

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-secondary-900 mb-2">
          Dashboard
        </h1>
        <p className="text-secondary-600">
          Welcome back! Here&apos;s an overview of your marketing automation.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600">🚀</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500">Active Funnels</p>
                <p className="text-2xl font-bold text-secondary-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <span className="text-success-600">📈</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500">Conversion Rate</p>
                <p className="text-2xl font-bold text-secondary-900">3.4%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                  <span className="text-accent-600">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500">Total Leads</p>
                <p className="text-2xl font-bold text-secondary-900">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                  <span className="text-warning-600">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500">Revenue</p>
                <p className="text-2xl font-bold text-secondary-900">$24.8k</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader 
            title="Recent Funnels" 
            subtitle="Your latest marketing automation projects"
          />
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'SaaS Landing Page Funnel', status: 'Active', leads: 45 },
                { name: 'E-commerce Product Launch', status: 'Draft', leads: 0 },
                { name: 'B2B Lead Generation', status: 'Active', leads: 127 },
              ].map((funnel, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-secondary-900">{funnel.name}</p>
                    <p className="text-sm text-secondary-500">{funnel.leads} leads generated</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    funnel.status === 'Active' 
                      ? 'bg-success-100 text-success-700'
                      : 'bg-secondary-100 text-secondary-700'
                  }`}>
                    {funnel.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader 
            title="Quick Actions" 
            subtitle="Get started with your next marketing campaign"
          />
          <CardContent>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg hover:bg-primary-50 transition-colors border border-primary-200">
                <div className="flex items-center">
                  <span className="text-lg mr-3">🚀</span>
                  <div>
                    <p className="font-medium text-secondary-900">Create New Funnel</p>
                    <p className="text-sm text-secondary-500">Start with a prompt</p>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-primary-50 transition-colors border border-primary-200">
                <div className="flex items-center">
                  <span className="text-lg mr-3">👥</span>
                  <div>
                    <p className="font-medium text-secondary-900">Generate ICP</p>
                    <p className="text-sm text-secondary-500">Define your audience</p>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-primary-50 transition-colors border border-primary-200">
                <div className="flex items-center">
                  <span className="text-lg mr-3">📈</span>
                  <div>
                    <p className="font-medium text-secondary-900">View Analytics</p>
                    <p className="text-sm text-secondary-500">Track performance</p>
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 