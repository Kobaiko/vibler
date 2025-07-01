'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Zap, Target, TrendingUp, Users, DollarSign, Sparkles, Calendar, BarChart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FunnelFormData {
  prompt: string
  businessType: string
  targetMarket: string
  budget: string
  timeline: string
}

export default function FunnelsPage() {
  const [formData, setFormData] = useState<FunnelFormData>({
    prompt: '',
    businessType: '',
    targetMarket: '',
    budget: '',
    timeline: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.prompt.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/funnel/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: 'anonymous'
        })
      })

      const data = await response.json()

      if (data.success && data.funnel) {
        console.log('Funnel generated successfully:', data.funnel)
        // TODO: Handle success - redirect to funnel view or show results
      } else {
        setError(data.error || 'Failed to generate funnel')
      }
    } catch (err) {
      setError('An error occurred while generating the funnel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="icon-container icon-container-blue">
              <Zap className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Funnel Generator</h1>
          </div>
          <p className="text-muted">Create AI-powered marketing funnels tailored to your business</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Form */}
          <div className="lg:col-span-2">
            <Card className="modern-card">
              <CardHeader>
                <div className="accent-bar accent-bar-blue"></div>
                <CardTitle className="text-2xl font-semibold text-gray-900">Funnel Configuration</CardTitle>
                <CardDescription>Describe your marketing goals and business details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="form-label">
                      Funnel Description *
                    </label>
                    <textarea
                      value={formData.prompt}
                      onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                      placeholder="Describe your marketing funnel goals, target audience, and desired outcomes..."
                      className="modern-input min-h-[120px] w-full"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">
                        Business Type
                      </label>
                      <Input
                        value={formData.businessType}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                        placeholder="e.g., SaaS, E-commerce, Service"
                        className="modern-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">
                        Target Market
                      </label>
                      <Input
                        value={formData.targetMarket}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetMarket: e.target.value }))}
                        placeholder="e.g., Small business owners, Millennials"
                        className="modern-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">
                        Budget Range
                      </label>
                      <Input
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                        placeholder="e.g., $5,000/month, $50K total"
                        className="modern-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">
                        Timeline
                      </label>
                      <Input
                        value={formData.timeline}
                        onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                        placeholder="e.g., 3 months, Q1 2024"
                        className="modern-input"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="modern-card p-4 border-red-200 bg-red-50">
                      <p className="text-red-600 text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || !formData.prompt.trim()}
                    className="modern-button-primary w-full py-3"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {loading ? 'Generating Funnel...' : 'Generate AI Funnel'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Features & Benefits */}
          <div className="space-y-6">
            <Card className="modern-card">
              <CardHeader>
                <div className="accent-bar accent-bar-green"></div>
                <CardTitle className="text-lg font-semibold text-gray-900">What You'll Get</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="icon-container-blue flex-shrink-0 w-8 h-8">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Customer Profile</h4>
                    <p className="text-sm text-muted">Detailed ICP with demographics and behavior patterns</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="icon-container-green flex-shrink-0 w-8 h-8">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Marketing Strategy</h4>
                    <p className="text-sm text-muted">Channel recommendations and campaign structure</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="icon-container-purple flex-shrink-0 w-8 h-8">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Audience Segments</h4>
                    <p className="text-sm text-muted">Targeting criteria and persona development</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="icon-container-yellow flex-shrink-0 w-8 h-8">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Budget Allocation</h4>
                    <p className="text-sm text-muted">Optimized spend across channels and campaigns</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="icon-container-pink flex-shrink-0 w-8 h-8">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Campaign Timeline</h4>
                    <p className="text-sm text-muted">Phased execution plan with key milestones</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="icon-container-blue flex-shrink-0 w-8 h-8">
                    <BarChart className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Success Metrics</h4>
                    <p className="text-sm text-muted">KPIs and measurement framework</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="modern-card">
              <CardHeader>
                <div className="accent-bar accent-bar-purple"></div>
                <CardTitle className="text-lg font-semibold text-gray-900">AI-Powered Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">2.5x</div>
                    <div className="text-sm text-muted">Avg. Conversion Lift</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">40%</div>
                    <div className="text-sm text-muted">Cost Reduction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-muted">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">3 min</div>
                    <div className="text-sm text-muted">Setup Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pro Tips */}
            <Card className="modern-card">
              <CardHeader>
                <div className="accent-bar accent-bar-yellow"></div>
                <CardTitle className="text-lg font-semibold text-gray-900">Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">Be specific about your target audience demographics and pain points</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">Include your current marketing challenges and goals</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">Mention any existing marketing channels or assets</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">Set realistic timelines and budget constraints</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 