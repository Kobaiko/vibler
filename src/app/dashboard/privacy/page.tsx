'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'sonner'
import { Download, Shield, Trash2, UserX, AlertTriangle, Lock, Eye, FileText } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Separator } from '@/components/ui/Separator'
import { cn } from '@/lib/utils'

export default function PrivacyPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [isAnonymizing, setIsAnonymizing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [showDeleteForm, setShowDeleteForm] = useState(false)

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/privacy/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vibler-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Data exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  const handleAnonymizeData = async () => {
    setIsAnonymizing(true)
    try {
      const response = await fetch('/api/privacy/anonymize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to anonymize data')
      }

      toast.success('Data anonymized successfully')
    } catch (error) {
      console.error('Anonymization error:', error)
      toast.error('Failed to anonymize data')
    } finally {
      setIsAnonymizing(false)
    }
  }

  const handleDeleteData = async () => {
    if (deleteConfirmation !== 'DELETE_MY_DATA_PERMANENTLY') {
      toast.error('Please enter the correct confirmation code')
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch('/api/privacy/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmationCode: deleteConfirmation
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete data')
      }

      toast.success('Data deleted successfully')
      setShowDeleteForm(false)
      setDeleteConfirmation('')
    } catch (error) {
      console.error('Deletion error:', error)
      toast.error('Failed to delete data')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="icon-container icon-container-blue">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Privacy & Data Control</h1>
          </div>
          <p className="text-muted">Manage your personal data and privacy settings. We're committed to protecting your privacy and giving you control over your information.</p>
        </div>

        {/* Privacy Overview */}
        <Card className="modern-card mb-8">
          <CardHeader>
            <div className="accent-bar accent-bar-blue"></div>
            <CardTitle className="flex items-center text-gray-900">
              <Eye className="w-5 h-5 mr-2 text-blue-600" />
              Your Privacy Rights
            </CardTitle>
            <CardDescription>
              Under GDPR and other privacy regulations, you have the following rights regarding your personal data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Right to Access</h4>
                  <p className="text-sm text-gray-600">Export and view all your personal data</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Right to Rectification</h4>
                  <p className="text-sm text-gray-600">Correct inaccurate personal data</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Right to Erasure</h4>
                  <p className="text-sm text-gray-600">Delete your personal data permanently</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Right to Portability</h4>
                  <p className="text-sm text-gray-600">Transfer your data to another service</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Export */}
        <Card className="modern-card mb-6">
          <CardHeader>
            <div className="accent-bar accent-bar-green"></div>
            <CardTitle className="flex items-center text-gray-900">
              <Download className="w-5 h-5 mr-2 text-green-600" />
              Export Your Data
            </CardTitle>
            <CardDescription>
              Download a complete copy of all your personal data stored in Vibler. This includes your ICPs, funnels, workspaces, and activity logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">Complete Data Export</h4>
                <p className="text-sm text-gray-600">
                  Includes all your content and metadata in JSON format
                </p>
              </div>
              <Button
                onClick={handleExportData}
                disabled={isExporting}
                className="modern-button-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Anonymization */}
        <Card className="modern-card mb-6">
          <CardHeader>
            <div className="accent-bar accent-bar-purple"></div>
            <CardTitle className="flex items-center text-gray-900">
              <UserX className="w-5 h-5 mr-2 text-purple-600" />
              Anonymize Your Data
            </CardTitle>
            <CardDescription>
              Remove all personally identifiable information from your data while keeping your content. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Anonymization will remove your name, email, and other personal identifiers from your data. Your content will remain but won't be tied to your identity.
                </AlertDescription>
              </Alert>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">Anonymize Personal Data</h4>
                  <p className="text-sm text-gray-600">
                    Keep your content but remove personal identifiers
                  </p>
                </div>
                <Button
                  onClick={handleAnonymizeData}
                  disabled={isAnonymizing}
                  variant="outline"
                  className="modern-button-secondary"
                >
                  <UserX className="w-4 h-4 mr-2" />
                  {isAnonymizing ? 'Anonymizing...' : 'Anonymize Data'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Deletion */}
        <Card className="modern-card border-red-200">
          <CardHeader>
            <div className="accent-bar accent-bar-red"></div>
            <CardTitle className="flex items-center text-red-700">
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Your Data
            </CardTitle>
            <CardDescription>
              Permanently delete all your data from Vibler. This action cannot be undone and you will lose access to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <strong>Warning:</strong> This will permanently delete all your data including ICPs, funnels, workspaces, and account information. This action cannot be undone.
                </AlertDescription>
              </Alert>

              {!showDeleteForm ? (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Permanent Data Deletion</h4>
                    <p className="text-sm text-gray-600">
                      Remove all your data and close your account
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowDeleteForm(true)}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Data
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <Label htmlFor="delete-confirmation" className="text-sm font-medium text-red-700">
                      Type "DELETE_MY_DATA_PERMANENTLY" to confirm deletion:
                    </Label>
                    <Input
                      id="delete-confirmation"
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      className="mt-1 border-red-300 focus:border-red-500 focus:ring-red-500"
                      placeholder="DELETE_MY_DATA_PERMANENTLY"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDeleteData}
                      disabled={isDeleting || deleteConfirmation !== 'DELETE_MY_DATA_PERMANENTLY'}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDeleteForm(false)
                        setDeleteConfirmation('')
                      }}
                      variant="outline"
                      className="modern-button-secondary"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Privacy Policy */}
        <Card className="modern-card">
          <CardHeader>
            <div className="accent-bar accent-bar-blue"></div>
            <CardTitle className="flex items-center text-gray-900">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Privacy Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Data We Collect</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Account information (name, email, preferences)</li>
                  <li>• Content you create (ICPs, funnels, workspaces)</li>
                  <li>• Usage analytics and performance metrics</li>
                  <li>• Device and browser information</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">How We Use Your Data</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Provide and improve our services</li>
                  <li>• Generate AI-powered content and recommendations</li>
                  <li>• Send important account and service updates</li>
                  <li>• Analyze usage patterns to enhance user experience</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Data Security</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• All data encrypted in transit and at rest</li>
                  <li>• Regular security audits and compliance checks</li>
                  <li>• Access controls and authentication measures</li>
                  <li>• GDPR and CCPA compliance standards</li>
                </ul>
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="modern-button-secondary">
                  <FileText className="w-4 h-4 mr-2" />
                  View Privacy Policy
                </Button>
                <Button variant="outline" className="modern-button-secondary">
                  <Lock className="w-4 h-4 mr-2" />
                  Security Center
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 