'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Search, User, Building, Target, Check, X } from 'lucide-react'

interface ICP {
  id: string
  name: string
  title: string
  company: string
  industry: string
  company_size: string
  demographics: {
    age: string
    location: string
    education: string
    income: string
  }
  psychographics: {
    personality: string
    values: string[]
    interests: string[]
    lifestyle: string
  }
  pain_points: string[]
  goals: string[]
  challenges: string[]
  buying_behavior: {
    decisionMakingProcess: string
    influencers: string[]
    budget: string
    timeline: string
    preferredChannels: string[]
  }
  communication_preferences: {
    tone: string
    channels: string[]
    frequency: string
  }
  objections: string[]
  motivations: string[]
  created_at: string
}

interface ICPSelectorProps {
  selectedICP: ICP | null
  onICPSelect: (icp: ICP | null) => void
}

export function ICPSelector({ selectedICP, onICPSelect }: ICPSelectorProps) {
  const [icps, setIcps] = useState<ICP[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Load ICPs from database
  const loadIcps = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/icps')
      if (response.ok) {
        const data = await response.json()
        setIcps(data.icps || [])
      }
    } catch (error) {
      console.error('Error loading ICPs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadIcps()
    }
  }, [isOpen])

  // Filter ICPs based on search
  const filteredIcps = icps.filter(icp => 
    icp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icp.industry.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (icp: ICP) => {
    onICPSelect(icp)
    setIsOpen(false)
  }

  const handleClear = () => {
    onICPSelect(null)
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        className="w-full justify-start"
        onClick={() => setIsOpen(true)}
      >
        {selectedICP ? (
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>{selectedICP.name}</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              {selectedICP.industry}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Select Customer Persona</span>
          </div>
        )}
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Select Customer Persona</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
            <Input
              placeholder="Search personas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Current Selection */}
          {selectedICP && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Currently Selected</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleClear}>
                    Clear Selection
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <h3 className="font-semibold">{selectedICP.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedICP.title} at {selectedICP.company}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {selectedICP.industry}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {selectedICP.company_size}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ICP List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredIcps.length === 0 ? (
              <div className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No personas found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'No personas match your search.' : 'Create your first customer persona to get started.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIcps.map((icp) => (
                  <Card 
                    key={icp.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedICP?.id === icp.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleSelect(icp)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{icp.name}</h3>
                            {selectedICP?.id === icp.id && (
                              <Check className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {icp.title} at {icp.company}
                          </p>
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {icp.industry}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {icp.company_size}
                            </span>
                          </div>
                          
                          {/* Key insights */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Target className="h-3 w-3 text-gray-600" />
                              <span className="text-xs text-gray-600">
                                {icp.goals.slice(0, 2).join(', ')}
                                {icp.goals.length > 2 && ` +${icp.goals.length - 2} more`}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Building className="h-3 w-3 text-gray-600" />
                              <span className="text-xs text-gray-600">
                                {icp.demographics.location} • {icp.demographics.age}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 