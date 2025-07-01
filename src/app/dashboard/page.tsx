'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, TrendingUp, TrendingDown, Users, Target, DollarSign, Zap, Plus, BarChart3, Settings, ChartColumn, Activity, Calendar, Clock, Eye, Edit, Download, Star, Heart, Bookmark, PlusCircle, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import NumberTicker from '@/components/ui/number-ticker'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCreatives: 0,
    totalStrategies: 0,
    totalICPs: 0,
    totalFunnels: 0
  })
  const [recentCreatives, setRecentCreatives] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/creatives').then(res => res.json()),
      fetch('/api/strategy').then(res => res.json()),
      fetch('/api/icps').then(res => res.json()),
      // Add funnels API when available
    ]).then(([creatives, strategies, icps]) => {
      setStats({
        totalCreatives: Array.isArray(creatives) ? creatives.length : 0,
        totalStrategies: Array.isArray(strategies) ? strategies.length : 0,
        totalICPs: Array.isArray(icps) ? icps.length : 0,
        totalFunnels: 0 // TODO: Add when funnels API is ready
      })
      setRecentCreatives(Array.isArray(creatives) ? creatives.slice(0, 3) : [])
      setLoading(false)
    }).catch(error => {
      console.error('Error loading dashboard data:', error)
      setLoading(false)
    })
  }, [])

  const EmptyStateCard = ({ 
    title, 
    description, 
    actionText, 
    actionHref, 
    icon: Icon, 
    gradient 
  }: {
    title: string
    description: string
    actionText: string
    actionHref: string
    icon: any
    gradient: string
  }) => (
    <Card className="border-dashed border-2 border-gray-300 hover:border-purple-300 transition-colors">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4 max-w-sm">{description}</p>
        <Link href={actionHref}>
          <Button className="modern-button-primary">
            <PlusCircle className="w-4 h-4 mr-2" />
            {actionText}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Manage your campaigns and marketing tools.</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/campaigns">
            <Button variant="outline" className="modern-button-secondary">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span>View Campaigns</span>
            </Button>
          </Link>
          <Link href="/wizard">
            <Button className="modern-button-primary bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Wand2 className="w-4 h-4 mr-2" />
              <span className="text-white font-semibold">Marketing Wizard</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Marketing Wizard CTA - for new users */}
      <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">New to Vibler? Start with our Guided Wizard</h3>
              <p className="text-gray-600">Create your first complete marketing campaign in minutes with our step-by-step wizard.</p>
            </div>
          </div>
          <Link href="/wizard">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Wand2 className="w-4 h-4 mr-2" />
              Start Wizard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Edit className="w-6 h-6 text-purple-600" />
            </div>
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Creatives</p>
            <NumberTicker
              value={stats.totalCreatives}
              className="text-2xl font-bold text-gray-900"
              delay={0.2}
            />
            {stats.totalCreatives === 0 && (
              <p className="text-xs text-gray-400 mt-1">No creatives generated yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Marketing Strategies</p>
            <NumberTicker
              value={stats.totalStrategies}
              className="text-2xl font-bold text-gray-900"
              delay={0.4}
            />
            {stats.totalStrategies === 0 && (
              <p className="text-xs text-gray-400 mt-1">No strategies created yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">ICPs Created</p>
            <NumberTicker
              value={stats.totalICPs}
              className="text-2xl font-bold text-gray-900"
              delay={0.6}
            />
            {stats.totalICPs === 0 && (
              <p className="text-xs text-gray-400 mt-1">No customer profiles yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Sales Funnels</p>
            <NumberTicker
              value={stats.totalFunnels}
              className="text-2xl font-bold text-gray-900"
              delay={0.8}
            />
            {stats.totalFunnels === 0 && (
              <p className="text-xs text-gray-400 mt-1">No funnels built yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/dashboard/creative" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-purple-600 rounded-full"></div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Creative Generator</h3>
            <p className="text-sm text-gray-600 mb-4">Generate AI-powered ad creatives and social media content</p>
            <div className="flex items-center text-purple-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link href="/dashboard/strategy" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full"></div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Strategy Composer</h3>
            <p className="text-sm text-gray-600 mb-4">Build comprehensive marketing strategies with AI assistance</p>
            <div className="flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
              <span>Create Strategy</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link href="/dashboard/icps" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">ICP Generator</h3>
            <p className="text-sm text-gray-600 mb-4">Define your ideal customer profiles with AI insights</p>
            <div className="flex items-center text-green-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
              <span>Create ICP</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link href="/dashboard/campaigns" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Campaign Manager</h3>
            <p className="text-sm text-gray-600 mb-4">View and manage all your marketing campaigns</p>
            <div className="flex items-center text-orange-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
              <span>View Campaigns</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* Content Area - Show empty states or recent items */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        
        {recentCreatives.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCreatives.map((creative: any, index: number) => (
              <div key={creative.id || index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      {creative.platform}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(creative.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{creative.headline}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{creative.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Score:</span>
                      <span className="text-sm font-semibold text-green-600">{creative.conversion_score}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EmptyStateCard
              title="Try the Marketing Wizard"
              description="Get started with our guided wizard to create your first complete campaign"
              actionText="Start Wizard"
              actionHref="/wizard"
              icon={Wand2}
              gradient="from-purple-500 to-pink-600"
            />
            
            <EmptyStateCard
              title="Create Your First Creative"
              description="Start generating AI-powered ad creatives for your marketing campaigns"
              actionText="Generate Creative"
              actionHref="/dashboard/creative"
              icon={Edit}
              gradient="from-pink-500 to-purple-600"
            />
            
            <EmptyStateCard
              title="Build a Marketing Strategy"
              description="Develop comprehensive marketing strategies tailored to your business goals"
              actionText="Create Strategy"
              actionHref="/dashboard/strategy"
              icon={Target}
              gradient="from-blue-500 to-cyan-600"
            />
          </div>
        )}
      </div>
    </div>
  )
} 