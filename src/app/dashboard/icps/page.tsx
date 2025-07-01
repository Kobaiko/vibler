'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Label } from '@/components/ui/Label'
import { 
  User, 
  Building, 
  Target, 
  AlertTriangle, 
  Lightbulb, 
  Brain, 
  DollarSign, 
  MessageSquare, 
  Heart,
  RefreshCw,
  Save,
  Sparkles,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  FileText,
  X,
  Check
} from 'lucide-react'

interface ICP {
  id: string
  name: string
  title: string
  company: string
  industry: string
  company_size: string
  demographics: {
    age?: number | string
    gender?: string
    location?: string
    education?: string
    income?: string
    incomeLevel?: string
  }
  psychographics: {
    personality?: string
    personalityTraits?: string[]
    values?: string[]
    interests?: string[]
    lifestyle?: string
  }
  pain_points: string[]
  goals: string[]
  challenges: string[]
  buying_behavior: {
    decisionMakingProcess?: string
    influencers?: string[]
    budget?: string
    timeline?: string
    preferredChannels?: string[]
  }
  communication_preferences: {
    tone?: string
    channels?: string[]
    frequency?: string
    contentTypes?: string[]
    preferredChannels?: string[]
  }
  objections: string[]
  motivations: string[]
  generation_context: any
  created_at: string
  updated_at: string
  workspace_id?: string | null
  folder_id?: string | null
  user_id?: string | null
}

export default function ICPsPage() {
  const [savedIcps, setSavedIcps] = useState<ICP[]>([])
  const [generatedIcps, setGeneratedIcps] = useState<ICP[]>([])
  const [selectedIcp, setSelectedIcp] = useState<ICP | null>(null)
  const [editingIcp, setEditingIcp] = useState<ICP | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshingIndex, setRefreshingIndex] = useState<number | null>(null)
  const [savingIndex, setSavingIndex] = useState<number | null>(null)
  const [updatingIcp, setUpdatingIcp] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    loadSavedIcps()
  }, [])

  const loadSavedIcps = async () => {
    try {
      const response = await fetch('/api/icps')
      if (response.ok) {
        const data = await response.json()
        // Ensure we always set an array, handle both direct array and object with icps property
        const icpsArray = Array.isArray(data) ? data : (data.icps || [])
        setSavedIcps(icpsArray)
      } else {
        console.error('Failed to load ICPs')
        setSavedIcps([]) // Set empty array on error
      }
    } catch (error) {
      console.error('Error loading ICPs:', error)
      setSavedIcps([]) // Set empty array on error
    }
  }

  const generateIcps = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/icps/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt.trim(),
          count: 3 // Always generate 3 ICPs
        })
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedIcps(data.icps || [])
      } else {
        console.error('Failed to generate ICPs')
      }
    } catch (error) {
      console.error('Error generating ICPs:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshSingleIcp = async (index: number) => {
    if (!prompt.trim()) return

    setRefreshingIndex(index)
    try {
      const response = await fetch('/api/icps/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt.trim(),
          count: 1 // Generate just one new ICP
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.icps && data.icps.length > 0) {
          const newGeneratedIcps = [...generatedIcps]
          newGeneratedIcps[index] = data.icps[0]
          setGeneratedIcps(newGeneratedIcps)
        }
      }
    } catch (error) {
      console.error('Error refreshing ICP:', error)
    } finally {
      setRefreshingIndex(null)
    }
  }

  const saveIcp = async (icp: ICP, index: number) => {
    setSavingIndex(index)
    try {
      const response = await fetch('/api/icps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(icp)
      })

      if (response.ok) {
        const savedIcp = await response.json()
        setSavedIcps(prev => [...(Array.isArray(prev) ? prev : []), savedIcp])
      }
    } catch (error) {
      console.error('Error saving ICP:', error)
    } finally {
      setSavingIndex(null)
    }
  }

  const updateIcp = async (updatedIcp: ICP) => {
    setUpdatingIcp(true)
    try {
      const response = await fetch(`/api/icps/${updatedIcp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedIcp)
      })

      if (response.ok) {
        const updated = await response.json()
        setSavedIcps(prev => 
          (Array.isArray(prev) ? prev : []).map(icp => 
            icp.id === updated.id ? updated : icp
          )
        )
        setEditingIcp(null)
        setSelectedIcp(updated)
      }
    } catch (error) {
      console.error('Error updating ICP:', error)
    } finally {
      setUpdatingIcp(false)
    }
  }

  const deleteIcp = async (id: string) => {
    try {
      const response = await fetch(`/api/icps/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setSavedIcps(prev => (Array.isArray(prev) ? prev : []).filter(icp => icp.id !== id))
      }
    } catch (error) {
      console.error('Error deleting ICP:', error)
    }
  }

  const exportAsJSON = () => {
    const dataToExport = showSaved ? filteredSavedIcps : generatedIcps
    if (dataToExport.length === 0) return

    // Export all data - complete ICP objects with all fields
    const exportData = {
      exportDate: new Date().toISOString(),
      type: showSaved ? 'saved_icps' : 'generated_icps',
      count: dataToExport.length,
      metadata: {
        exportedBy: 'Vibler ICP System',
        version: '1.0',
        totalFields: Object.keys(dataToExport[0] || {}).length
      },
      icps: dataToExport.map(icp => ({
        // Include all fields from the ICP
        ...icp,
        // Ensure arrays are properly formatted
        pain_points: icp.pain_points || [],
        goals: icp.goals || [],
        challenges: icp.challenges || [],
        objections: icp.objections || [],
        motivations: icp.motivations || [],
        // Ensure nested objects are complete
        demographics: {
          age: icp.demographics?.age || null,
          gender: icp.demographics?.gender || null,
          location: icp.demographics?.location || null,
          education: icp.demographics?.education || null,
          income: icp.demographics?.income || icp.demographics?.incomeLevel || null,
          ...icp.demographics
        },
        psychographics: {
          personality: icp.psychographics?.personality || null,
          personalityTraits: icp.psychographics?.personalityTraits || [],
          values: icp.psychographics?.values || [],
          interests: icp.psychographics?.interests || [],
          lifestyle: icp.psychographics?.lifestyle || null,
          ...icp.psychographics
        },
        buying_behavior: {
          decisionMakingProcess: icp.buying_behavior?.decisionMakingProcess || null,
          influencers: icp.buying_behavior?.influencers || [],
          budget: icp.buying_behavior?.budget || null,
          timeline: icp.buying_behavior?.timeline || null,
          preferredChannels: icp.buying_behavior?.preferredChannels || [],
          ...icp.buying_behavior
        },
        communication_preferences: {
          tone: icp.communication_preferences?.tone || null,
          channels: icp.communication_preferences?.channels || icp.communication_preferences?.preferredChannels || [],
          frequency: icp.communication_preferences?.frequency || null,
          contentTypes: icp.communication_preferences?.contentTypes || [],
          preferredChannels: icp.communication_preferences?.preferredChannels || icp.communication_preferences?.channels || [],
          ...icp.communication_preferences
        }
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `icps-complete-${showSaved ? 'saved' : 'generated'}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportAsPDF = async () => {
    const dataToExport = showSaved ? filteredSavedIcps : generatedIcps
    if (dataToExport.length === 0) return

    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import('jspdf')).default

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      let yPosition = margin

      // Helper function to check if we need a new page
      const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - 30) {
          doc.addPage()
          yPosition = margin
          return true
        }
        return false
      }

      // Header
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Ideal Customer Profiles - Complete Export', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15

      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' })
      doc.text(`Total ICPs: ${dataToExport.length}`, pageWidth / 2, yPosition + 8, { align: 'center' })
      yPosition += 25

      // ICPs with complete data
      dataToExport.forEach((icp, index) => {
        // Check if we need a new page for the ICP header (more conservative)
        checkPageBreak(60)

        // ICP Header
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text(`${index + 1}. ${icp.name}`, margin, yPosition)
        yPosition += 8

        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text(`${icp.title} at ${icp.company}`, margin, yPosition)
        yPosition += 6
        doc.text(`Industry: ${icp.industry} | Company Size: ${icp.company_size}`, margin, yPosition)
        yPosition += 10

        // Demographics - Complete
        if (icp.demographics) {
          checkPageBreak(50)
          
          doc.setFont('helvetica', 'bold')
          doc.text('Demographics:', margin, yPosition)
          yPosition += 6
          doc.setFont('helvetica', 'normal')
          
          const demographics = []
          if (icp.demographics.age) demographics.push(`Age: ${icp.demographics.age}`)
          if (icp.demographics.gender) demographics.push(`Gender: ${icp.demographics.gender}`)
          if (icp.demographics.location) demographics.push(`Location: ${icp.demographics.location}`)
          if (icp.demographics.education) demographics.push(`Education: ${icp.demographics.education}`)
          if (icp.demographics.income || icp.demographics.incomeLevel) {
            demographics.push(`Income: ${icp.demographics.income || icp.demographics.incomeLevel}`)
          }
          
          demographics.forEach(demo => {
            checkPageBreak(10)
            doc.text(`• ${demo}`, margin + 5, yPosition)
            yPosition += 5
          })
          yPosition += 3
        }

        // Psychographics - Complete
        if (icp.psychographics) {
          checkPageBreak(50)
          
          doc.setFont('helvetica', 'bold')
          doc.text('Psychographics:', margin, yPosition)
          yPosition += 6
          doc.setFont('helvetica', 'normal')
          
          if (icp.psychographics.personality) {
            checkPageBreak(10)
            doc.text(`Personality: ${icp.psychographics.personality}`, margin + 5, yPosition)
            yPosition += 5
          }
          if (icp.psychographics.personalityTraits?.length) {
            checkPageBreak(10)
            doc.text(`Traits: ${icp.psychographics.personalityTraits.join(', ')}`, margin + 5, yPosition)
            yPosition += 5
          }
          if (icp.psychographics.values?.length) {
            checkPageBreak(10)
            doc.text(`Values: ${icp.psychographics.values.join(', ')}`, margin + 5, yPosition)
            yPosition += 5
          }
          if (icp.psychographics.interests?.length) {
            checkPageBreak(10)
            doc.text(`Interests: ${icp.psychographics.interests.join(', ')}`, margin + 5, yPosition)
            yPosition += 5
          }
          if (icp.psychographics.lifestyle) {
            const lifestyleLines = doc.splitTextToSize(`Lifestyle: ${icp.psychographics.lifestyle}`, pageWidth - margin * 2 - 5)
            checkPageBreak(lifestyleLines.length * 5 + 10)
            doc.text(lifestyleLines, margin + 5, yPosition)
            yPosition += lifestyleLines.length * 5
          }
          yPosition += 3
        }

        // Pain Points - All
        if (icp.pain_points && icp.pain_points.length > 0) {
          checkPageBreak(50)
          
          doc.setFont('helvetica', 'bold')
          doc.text('Pain Points:', margin, yPosition)
          yPosition += 6
          doc.setFont('helvetica', 'normal')
          
          icp.pain_points.forEach(point => {
            const lines = doc.splitTextToSize(`• ${point}`, pageWidth - margin * 2 - 5)
            checkPageBreak(lines.length * 5 + 5)
            doc.text(lines, margin + 5, yPosition)
            yPosition += lines.length * 5
          })
          yPosition += 3
        }

        // Goals - All
        if (icp.goals && icp.goals.length > 0) {
          checkPageBreak(50)
          
          doc.setFont('helvetica', 'bold')
          doc.text('Goals:', margin, yPosition)
          yPosition += 6
          doc.setFont('helvetica', 'normal')
          
          icp.goals.forEach(goal => {
            const lines = doc.splitTextToSize(`• ${goal}`, pageWidth - margin * 2 - 5)
            checkPageBreak(lines.length * 5 + 5)
            doc.text(lines, margin + 5, yPosition)
            yPosition += lines.length * 5
          })
          yPosition += 3
        }

        // Challenges
        if (icp.challenges && icp.challenges.length > 0) {
          checkPageBreak(50)
          
          doc.setFont('helvetica', 'bold')
          doc.text('Challenges:', margin, yPosition)
          yPosition += 6
          doc.setFont('helvetica', 'normal')
          
          icp.challenges.forEach(challenge => {
            const lines = doc.splitTextToSize(`• ${challenge}`, pageWidth - margin * 2 - 5)
            checkPageBreak(lines.length * 5 + 5)
            doc.text(lines, margin + 5, yPosition)
            yPosition += lines.length * 5
          })
          yPosition += 3
        }

        // Buying Behavior - Complete
        if (icp.buying_behavior) {
          checkPageBreak(50)
          
          doc.setFont('helvetica', 'bold')
          doc.text('Buying Behavior:', margin, yPosition)
          yPosition += 6
          doc.setFont('helvetica', 'normal')
          
          if (icp.buying_behavior.decisionMakingProcess) {
            const lines = doc.splitTextToSize(`Decision Process: ${icp.buying_behavior.decisionMakingProcess}`, pageWidth - margin * 2 - 5)
            checkPageBreak(lines.length * 5 + 5)
            doc.text(lines, margin + 5, yPosition)
            yPosition += lines.length * 5
          }
          if (icp.buying_behavior.budget) {
            checkPageBreak(10)
            doc.text(`Budget: ${icp.buying_behavior.budget}`, margin + 5, yPosition)
            yPosition += 5
          }
          if (icp.buying_behavior.timeline) {
            checkPageBreak(10)
            doc.text(`Timeline: ${icp.buying_behavior.timeline}`, margin + 5, yPosition)
            yPosition += 5
          }
          if (icp.buying_behavior.influencers?.length) {
            checkPageBreak(10)
            doc.text(`Influencers: ${icp.buying_behavior.influencers.join(', ')}`, margin + 5, yPosition)
            yPosition += 5
          }
          if (icp.buying_behavior.preferredChannels?.length) {
            checkPageBreak(10)
            doc.text(`Preferred Channels: ${icp.buying_behavior.preferredChannels.join(', ')}`, margin + 5, yPosition)
            yPosition += 5
          }
          yPosition += 3
        }

        // Communication Preferences - Complete
        if (icp.communication_preferences) {
          checkPageBreak(50)
          
          doc.setFont('helvetica', 'bold')
          doc.text('Communication Preferences:', margin, yPosition)
          yPosition += 6
          doc.setFont('helvetica', 'normal')
          
          if (icp.communication_preferences.tone) {
            checkPageBreak(10)
            doc.text(`Tone: ${icp.communication_preferences.tone}`, margin + 5, yPosition)
            yPosition += 5
          }
          if (icp.communication_preferences.frequency) {
            checkPageBreak(10)
            doc.text(`Frequency: ${icp.communication_preferences.frequency}`, margin + 5, yPosition)
            yPosition += 5
          }
          const channels = icp.communication_preferences.channels || icp.communication_preferences.preferredChannels || []
          if (channels.length) {
            checkPageBreak(10)
            doc.text(`Channels: ${channels.join(', ')}`, margin + 5, yPosition)
            yPosition += 5
          }
          if (icp.communication_preferences.contentTypes?.length) {
            checkPageBreak(10)
            doc.text(`Content Types: ${icp.communication_preferences.contentTypes.join(', ')}`, margin + 5, yPosition)
            yPosition += 5
          }
          yPosition += 3
        }

        // Objections
        if (icp.objections && icp.objections.length > 0) {
          checkPageBreak(50)
          
          doc.setFont('helvetica', 'bold')
          doc.text('Common Objections:', margin, yPosition)
          yPosition += 6
          doc.setFont('helvetica', 'normal')
          
          icp.objections.forEach(objection => {
            const lines = doc.splitTextToSize(`• ${objection}`, pageWidth - margin * 2 - 5)
            checkPageBreak(lines.length * 5 + 5)
            doc.text(lines, margin + 5, yPosition)
            yPosition += lines.length * 5
          })
          yPosition += 3
        }

        // Motivations
        if (icp.motivations && icp.motivations.length > 0) {
          checkPageBreak(50)
          
          doc.setFont('helvetica', 'bold')
          doc.text('Motivations:', margin, yPosition)
          yPosition += 6
          doc.setFont('helvetica', 'normal')
          
          icp.motivations.forEach(motivation => {
            const lines = doc.splitTextToSize(`• ${motivation}`, pageWidth - margin * 2 - 5)
            checkPageBreak(lines.length * 5 + 5)
            doc.text(lines, margin + 5, yPosition)
            yPosition += lines.length * 5
          })
          yPosition += 8
        }

        // Add separator line
        if (index < dataToExport.length - 1) {
          checkPageBreak(15)
          doc.setDrawColor(200, 200, 200)
          doc.line(margin, yPosition, pageWidth - margin, yPosition)
          yPosition += 10
        }
      })

      // Save the PDF
      doc.save(`icps-complete-${showSaved ? 'saved' : 'generated'}-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  const handleCardClick = (icp: ICP, event: React.MouseEvent) => {
    // Don't open if clicking on action buttons
    if ((event.target as HTMLElement).closest('button')) {
      return
    }
    setSelectedIcp(icp)
  }

  const handleEditClick = (icp: ICP, event: React.MouseEvent) => {
    event.stopPropagation()
    setEditingIcp({ ...icp })
    setSelectedIcp(null)
  }

  const filteredSavedIcps = (Array.isArray(savedIcps) ? savedIcps : []).filter(icp =>
    icp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icp.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="icon-container icon-container-purple">
              <Target className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Ideal Customer Profiles</h1>
          </div>
          <p className="text-muted">Generate detailed personas to understand your target customers</p>
        </div>

        {/* Generation Form */}
        <Card className="modern-card mb-8">
          <CardHeader>
            <div className="accent-bar accent-bar-purple"></div>
            <CardTitle className="flex items-center text-gray-900">
              <Brain className="w-5 h-5 mr-2 text-purple-600" />
              Generate New ICPs
            </CardTitle>
            <CardDescription>
              Describe your business and target market to generate detailed customer personas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt" className="text-sm font-medium text-gray-700 mb-2 block">
                  Business Description
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe your business, product/service, industry, and any specific requirements for your ideal customer profiles..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="modern-input min-h-[120px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={generateIcps}
                  disabled={loading || !prompt.trim()}
                  className="modern-button-primary"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate ICPs
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowSaved(!showSaved)}
                  variant="outline"
                  className="modern-button-secondary"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {showSaved ? 'Hide Saved' : 'View Saved'} ({savedIcps.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        {(showSaved && savedIcps.length > 0) && (
          <Card className="modern-card mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
                <Input
                  placeholder="Search saved ICPs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-input pl-10"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        <div className="space-y-6">
          {/* Generated ICPs */}
          {generatedIcps.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                  Generated ICPs
                </h2>
                <Badge className="bg-purple-100 text-purple-700">
                  {generatedIcps.length} Generated
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedIcps.map((icp, index) => (
                  <Card 
                    key={index} 
                    className="modern-card cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={(e) => handleCardClick(icp, e)}
                  >
                    <CardHeader>
                      <div className="accent-bar accent-bar-purple"></div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                            {icp.name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {icp.title} at {icp.company}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              refreshSingleIcp(index)
                            }}
                            disabled={refreshingIndex === index}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            {refreshingIndex === index ? (
                              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              saveIcp(icp, index)
                            }}
                            disabled={savingIndex === index}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            {savingIndex === index ? (
                              <div className="w-3 h-3 border border-green-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Save className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Industry & Company</h4>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">{icp.industry}</Badge>
                            <Badge variant="outline" className="text-xs">{icp.company_size}</Badge>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Key Pain Points</h4>
                          <div className="space-y-1">
                            {icp.pain_points.slice(0, 2).map((point, i) => (
                              <p key={i} className="text-xs text-gray-600 line-clamp-1">
                                • {point}
                              </p>
                            ))}
                            {icp.pain_points.length > 2 && (
                              <p className="text-xs text-gray-500">
                                +{icp.pain_points.length - 2} more...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Saved ICPs */}
          {showSaved && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Saved ICPs
                </h2>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700">
                    {filteredSavedIcps.length} Saved
                  </Badge>
                  {savedIcps.length > 0 && (
                    <Button
                      onClick={exportAsJSON}
                      variant="outline"
                      size="sm"
                      className="modern-button-secondary"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  )}
                </div>
              </div>
              {filteredSavedIcps.length === 0 ? (
                <Card className="modern-card">
                  <CardContent className="text-center py-12">
                    <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No ICPs found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm ? 'No ICPs match your search criteria.' : 'Generate your first ICP to get started.'}
                    </p>
                    {searchTerm && (
                      <Button
                        onClick={() => setSearchTerm('')}
                        variant="outline"
                        className="modern-button-secondary"
                      >
                        Clear Search
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSavedIcps.map((icp) => (
                    <Card 
                      key={icp.id} 
                      className="modern-card cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={(e) => handleCardClick(icp, e)}
                    >
                      <CardHeader>
                        <div className="accent-bar accent-bar-blue"></div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                              {icp.name}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {icp.title} at {icp.company}
                            </CardDescription>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              onClick={(e) => handleEditClick(icp, e)}
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteIcp(icp.id)
                              }}
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Industry & Company</h4>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs">{icp.industry}</Badge>
                              <Badge variant="outline" className="text-xs">{icp.company_size}</Badge>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Key Pain Points</h4>
                            <div className="space-y-1">
                              {icp.pain_points.slice(0, 2).map((point, i) => (
                                <p key={i} className="text-xs text-gray-600 line-clamp-1">
                                  • {point}
                                </p>
                              ))}
                              {icp.pain_points.length > 2 && (
                                <p className="text-xs text-gray-500">
                                  +{icp.pain_points.length - 2} more...
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Created {new Date(icp.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ICP Detail Modal */}
        <Dialog open={selectedIcp !== null} onOpenChange={() => setSelectedIcp(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedIcp && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                    <User className="w-6 h-6 mr-2 text-purple-600" />
                    {selectedIcp.name}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    {selectedIcp.title} at {selectedIcp.company} • {selectedIcp.industry}
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="overview" className="mt-6">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="demographics">Demographics</TabsTrigger>
                    <TabsTrigger value="psychographics">Psychology</TabsTrigger>
                    <TabsTrigger value="behavior">Behavior</TabsTrigger>
                    <TabsTrigger value="communication">Communication</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="modern-card">
                        <CardHeader>
                          <div className="accent-bar accent-bar-red"></div>
                          <CardTitle className="flex items-center text-red-700">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Pain Points
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {selectedIcp.pain_points.map((point, i) => (
                              <li key={i} className="flex items-start">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                <span className="text-sm text-gray-700">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card className="modern-card">
                        <CardHeader>
                          <div className="accent-bar accent-bar-green"></div>
                          <CardTitle className="flex items-center text-green-700">
                            <Target className="w-5 h-5 mr-2" />
                            Goals
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {selectedIcp.goals.map((goal, i) => (
                              <li key={i} className="flex items-start">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                <span className="text-sm text-gray-700">{goal}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card className="modern-card">
                        <CardHeader>
                          <div className="accent-bar accent-bar-yellow"></div>
                          <CardTitle className="flex items-center text-yellow-700">
                            <Lightbulb className="w-5 h-5 mr-2" />
                            Motivations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {selectedIcp.motivations.map((motivation, i) => (
                              <li key={i} className="flex items-start">
                                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                <span className="text-sm text-gray-700">{motivation}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card className="modern-card">
                        <CardHeader>
                          <div className="accent-bar accent-bar-purple"></div>
                          <CardTitle className="flex items-center text-purple-700">
                            <X className="w-5 h-5 mr-2" />
                            Objections
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {selectedIcp.objections.map((objection, i) => (
                              <li key={i} className="flex items-start">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                <span className="text-sm text-gray-700">{objection}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="demographics" className="mt-6">
                    <Card className="modern-card">
                      <CardHeader>
                        <div className="accent-bar accent-bar-blue"></div>
                        <CardTitle className="flex items-center text-blue-700">
                          <User className="w-5 h-5 mr-2" />
                          Demographics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(selectedIcp.demographics).map(([key, value]) => (
                            value && (
                              <div key={key}>
                                <h4 className="text-sm font-medium text-gray-700 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{value}</p>
                              </div>
                            )
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="psychographics" className="mt-6">
                    <Card className="modern-card">
                      <CardHeader>
                        <div className="accent-bar accent-bar-purple"></div>
                        <CardTitle className="flex items-center text-purple-700">
                          <Brain className="w-5 h-5 mr-2" />
                          Psychographics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedIcp.psychographics.personalityTraits && selectedIcp.psychographics.personalityTraits.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Personality Traits</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedIcp.psychographics.personalityTraits.map((trait, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {trait}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {selectedIcp.psychographics.values && selectedIcp.psychographics.values.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Values</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedIcp.psychographics.values.map((value, i) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-green-50 text-green-700">
                                    {value}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {selectedIcp.psychographics.interests && selectedIcp.psychographics.interests.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Interests</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedIcp.psychographics.interests.map((interest, i) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                    {interest}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {selectedIcp.psychographics.lifestyle && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Lifestyle</h4>
                              <p className="text-sm text-gray-600">{selectedIcp.psychographics.lifestyle}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="behavior" className="mt-6">
                    <Card className="modern-card">
                      <CardHeader>
                        <div className="accent-bar accent-bar-green"></div>
                        <CardTitle className="flex items-center text-green-700">
                          <DollarSign className="w-5 h-5 mr-2" />
                          Buying Behavior
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedIcp.buying_behavior.decisionMakingProcess && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Decision Making Process</h4>
                              <p className="text-sm text-gray-600">{selectedIcp.buying_behavior.decisionMakingProcess}</p>
                            </div>
                          )}
                          
                          {selectedIcp.buying_behavior.influencers && selectedIcp.buying_behavior.influencers.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Influencers</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedIcp.buying_behavior.influencers.map((influencer, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {influencer}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedIcp.buying_behavior.budget && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Budget Range</h4>
                                <p className="text-sm text-gray-600">{selectedIcp.buying_behavior.budget}</p>
                              </div>
                            )}
                            
                            {selectedIcp.buying_behavior.timeline && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Decision Timeline</h4>
                                <p className="text-sm text-gray-600">{selectedIcp.buying_behavior.timeline}</p>
                              </div>
                            )}
                          </div>
                          
                          {selectedIcp.buying_behavior.preferredChannels && selectedIcp.buying_behavior.preferredChannels.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Preferred Channels</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedIcp.buying_behavior.preferredChannels.map((channel, i) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                    {channel}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="communication" className="mt-6">
                    <Card className="modern-card">
                      <CardHeader>
                        <div className="accent-bar accent-bar-pink"></div>
                        <CardTitle className="flex items-center text-pink-700">
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Communication Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedIcp.communication_preferences.tone && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Preferred Tone</h4>
                              <Badge className="bg-pink-100 text-pink-700">
                                {selectedIcp.communication_preferences.tone}
                              </Badge>
                            </div>
                          )}
                          
                          {selectedIcp.communication_preferences.channels && selectedIcp.communication_preferences.channels.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Communication Channels</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedIcp.communication_preferences.channels.map((channel, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {channel}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {selectedIcp.communication_preferences.frequency && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Contact Frequency</h4>
                              <p className="text-sm text-gray-600">{selectedIcp.communication_preferences.frequency}</p>
                            </div>
                          )}
                          
                          {selectedIcp.communication_preferences.contentTypes && selectedIcp.communication_preferences.contentTypes.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Preferred Content Types</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedIcp.communication_preferences.contentTypes.map((type, i) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                    {type}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 mt-6">
                  <Button
                    onClick={() => exportAsPDF()}
                    className="modern-button-primary"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button
                    onClick={() => setSelectedIcp(null)}
                    variant="outline"
                    className="modern-button-secondary"
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit ICP Modal */}
        <Dialog open={editingIcp !== null} onOpenChange={() => setEditingIcp(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {editingIcp && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-900">Edit ICP</DialogTitle>
                  <DialogDescription>
                    Update the details for this customer persona
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-name">Name</Label>
                      <Input
                        id="edit-name"
                        value={editingIcp.name}
                        onChange={(e) => setEditingIcp({...editingIcp, name: e.target.value})}
                        className="modern-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-title">Title</Label>
                      <Input
                        id="edit-title"
                        value={editingIcp.title}
                        onChange={(e) => setEditingIcp({...editingIcp, title: e.target.value})}
                        className="modern-input"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-company">Company</Label>
                      <Input
                        id="edit-company"
                        value={editingIcp.company}
                        onChange={(e) => setEditingIcp({...editingIcp, company: e.target.value})}
                        className="modern-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-industry">Industry</Label>
                      <Input
                        id="edit-industry"
                        value={editingIcp.industry}
                        onChange={(e) => setEditingIcp({...editingIcp, industry: e.target.value})}
                        className="modern-input"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-company-size">Company Size</Label>
                    <Input
                      id="edit-company-size"
                      value={editingIcp.company_size}
                      onChange={(e) => setEditingIcp({...editingIcp, company_size: e.target.value})}
                      className="modern-input"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    onClick={() => updateIcp(editingIcp)}
                    disabled={updatingIcp}
                    className="modern-button-primary"
                  >
                    {updatingIcp ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Update ICP
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setEditingIcp(null)}
                    variant="outline"
                    className="modern-button-secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 