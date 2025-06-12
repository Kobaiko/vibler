'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface ApiResponse {
  success: boolean
  error?: string
  funnel?: any
  icp?: any
  processingTime?: number
  details?: string
}

export default function FunnelTestPage() {
  const [prompt, setPrompt] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [targetMarket, setTargetMarket] = useState('')
  const [budget, setBudget] = useState('')
  const [timeline, setTimeline] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResponse | null>(null)
  const [testType, setTestType] = useState<'complete' | 'icp'>('complete')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const requestBody = {
        prompt: prompt.trim(),
        businessType: businessType || undefined,
        targetMarket: targetMarket || undefined,
        budget: budget || undefined,
        timeline: timeline || undefined,
        userId: 'test-user-123', // Mock user ID for testing
      }

      const endpoint = testType === 'complete' ? '/api/funnel/generate' : '/api/funnel/icp'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  const checkApiStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/funnel/generate')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Funnel Engine Test Page
          </h1>
          
          <div className="mb-6">
            <Button
              onClick={checkApiStatus}
              variant="outline"
              disabled={loading}
              className="mb-4"
            >
              Check API Status
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Type
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as 'complete' | 'icp')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="complete">Complete Funnel</option>
                <option value="icp">ICP Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Prompt *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your business idea or marketing challenge..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <input
                  type="text"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="e.g., SaaS, E-commerce, Consulting"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Market
                </label>
                <input
                  type="text"
                  value={targetMarket}
                  onChange={(e) => setTargetMarket(e.target.value)}
                  placeholder="e.g., Small businesses, Millennials"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget
                </label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g., $10,000/month, $50k total"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline
                </label>
                <input
                  type="text"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="e.g., 3 months, Q1 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full"
            >
              {loading ? 'Generating...' : `Generate ${testType === 'complete' ? 'Complete Funnel' : 'ICP'}`}
            </Button>
          </form>

          {result && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Result
              </h2>
              
              <div className="bg-gray-100 rounded-md p-4">
                <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>

              {result.processingTime && (
                <p className="mt-2 text-sm text-gray-600">
                  Processing time: {result.processingTime}ms
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 