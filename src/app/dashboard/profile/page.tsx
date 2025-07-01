'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { toast } from 'sonner'
import { 
  User, 
  Building2, 
  Globe, 
  Camera, 
  Palette, 
  CreditCard,
  Download,
  Upload,
  Eye,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface CompanyProfile {
  companyName: string
  website: string
  description: string
  industry: string
  logo: string
  primaryColor: string
  secondaryColor: string
  fonts: string[]
  extractedData?: {
    colors: string[]
    logo: string
    description: string
    industry: string
  }
}

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  avatar: string
  role: string
  phone: string
}

interface BillingInfo {
  planName: string
  planPrice: string
  billingCycle: string
  nextBilling: string
  paymentMethod: string
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    avatar: '',
    role: '',
    phone: ''
  })

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    companyName: '',
    website: '',
    description: '',
    industry: '',
    logo: '',
    primaryColor: '#8b5cf6',
    secondaryColor: '#06b6d4',
    fonts: []
  })

  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    planName: 'Pro Plan',
    planPrice: '$29',
    billingCycle: 'monthly',
    nextBilling: '2024-07-16',
    paymentMethod: '**** 4242'
  })

  const extractWebsiteData = async () => {
    if (!companyProfile.website) {
      toast.error('Please enter a website URL first')
      return
    }

    setExtracting(true)
    try {
      const response = await fetch('/api/extract-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website: companyProfile.website })
      })

      if (!response.ok) throw new Error('Failed to extract data')

      const extractedData = await response.json()
      
      setCompanyProfile(prev => ({
        ...prev,
        companyName: extractedData.companyName || prev.companyName,
        description: extractedData.description || prev.description,
        industry: extractedData.industry || prev.industry,
        primaryColor: extractedData.primaryColor || prev.primaryColor,
        secondaryColor: extractedData.secondaryColor || prev.secondaryColor,
        logo: extractedData.logo || prev.logo,
        extractedData
      }))

      toast.success('Website data extracted successfully!')
    } catch (error) {
      console.error('Error extracting website data:', error)
      toast.error('Failed to extract website data')
    } finally {
      setExtracting(false)
    }
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile, companyProfile })
      })

      if (!response.ok) throw new Error('Failed to save profile')

      toast.success('Profile saved successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-1">Manage your profile, company branding, and billing information.</p>
          </div>
          <Button 
            onClick={handleSaveProfile}
            disabled={loading}
            className="modern-button-primary"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Personal Profile</TabsTrigger>
            <TabsTrigger value="company">Company Branding</TabsTrigger>
            <TabsTrigger value="billing">Billing & Plan</TabsTrigger>
          </TabsList>

          {/* Personal Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>
                  Update your personal details and profile picture.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={userProfile.avatar} />
                    <AvatarFallback className="text-xl bg-purple-100 text-purple-600">
                      {getInitials(userProfile.firstName, userProfile.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
                    <p className="text-sm text-gray-600">JPG, PNG or GIF. Max 2MB.</p>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Upload Photo
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={userProfile.firstName}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={userProfile.lastName}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="role">Role/Title</Label>
                    <Input
                      id="role"
                      value={userProfile.role}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="Marketing Manager"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Branding Tab */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>Company Information</span>
                </CardTitle>
                <CardDescription>
                  Set up your company branding that will be used across all generated content.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Website Extraction */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">Auto-Extract Company Data</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        Enter your website URL and we'll automatically extract your company's branding information.
                      </p>
                      <div className="flex space-x-2">
                        <Input
                          value={companyProfile.website}
                          onChange={(e) => setCompanyProfile(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://yourcompany.com"
                          className="flex-1"
                        />
                        <Button 
                          onClick={extractWebsiteData}
                          disabled={extracting}
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          {extracting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Extract
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyProfile.companyName}
                      onChange={(e) => setCompanyProfile(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={companyProfile.industry}
                      onChange={(e) => setCompanyProfile(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="Technology, Healthcare, etc."
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      value={companyProfile.description}
                      onChange={(e) => setCompanyProfile(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of your company and what you do..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Brand Colors */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Palette className="w-5 h-5" />
                    <span>Brand Colors</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          id="primaryColor"
                          value={companyProfile.primaryColor}
                          onChange={(e) => setCompanyProfile(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={companyProfile.primaryColor}
                          onChange={(e) => setCompanyProfile(prev => ({ ...prev, primaryColor: e.target.value }))}
                          placeholder="#8b5cf6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          id="secondaryColor"
                          value={companyProfile.secondaryColor}
                          onChange={(e) => setCompanyProfile(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={companyProfile.secondaryColor}
                          onChange={(e) => setCompanyProfile(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          placeholder="#06b6d4"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Company Logo</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {companyProfile.logo ? (
                      <div className="space-y-4">
                        <img 
                          src={companyProfile.logo} 
                          alt="Company Logo" 
                          className="mx-auto h-20 object-contain"
                        />
                        <div className="flex justify-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Replace Logo
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600"
                            onClick={() => setCompanyProfile(prev => ({ ...prev, logo: '' }))}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Upload Company Logo</h3>
                          <p className="text-sm text-gray-600">PNG, JPG or SVG. Recommended size: 200x80px</p>
                        </div>
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Brand Preview</h4>
                  <div className="border border-gray-200 rounded-lg p-6 bg-white">
                    <div className="flex items-center space-x-4 mb-4">
                      {companyProfile.logo && (
                        <img 
                          src={companyProfile.logo} 
                          alt="Logo" 
                          className="h-8 object-contain"
                        />
                      )}
                      <h3 
                        className="text-xl font-bold" 
                        style={{ color: companyProfile.primaryColor }}
                      >
                        {companyProfile.companyName || 'Your Company Name'}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {companyProfile.description || 'Your company description will appear here...'}
                    </p>
                    <div className="flex space-x-2">
                      <div 
                        className="w-6 h-6 rounded" 
                        style={{ backgroundColor: companyProfile.primaryColor }}
                        title="Primary Color"
                      ></div>
                      <div 
                        className="w-6 h-6 rounded" 
                        style={{ backgroundColor: companyProfile.secondaryColor }}
                        title="Secondary Color"
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Current Plan</span>
                  </CardTitle>
                  <CardDescription>
                    Your subscription details and usage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Plan</span>
                    <Badge variant="default" className="bg-purple-100 text-purple-700">
                      {billingInfo.planName}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Price</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {billingInfo.planPrice}/{billingInfo.billingCycle}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Next Billing</span>
                    <span className="text-sm text-gray-900">{billingInfo.nextBilling}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Payment Method</span>
                    <span className="text-sm text-gray-900">{billingInfo.paymentMethod}</span>
                  </div>
                  <div className="pt-4 space-y-2">
                    <Button className="w-full" variant="outline">
                      Upgrade Plan
                    </Button>
                    <Button className="w-full" variant="ghost">
                      Update Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage This Month</CardTitle>
                  <CardDescription>
                    Track your current usage against plan limits.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">AI Creatives Generated</span>
                      <span className="font-medium">12 / 500</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '2.4%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Strategies Created</span>
                      <span className="font-medium">3 / 50</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '6%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ICPs Generated</span>
                      <span className="font-medium">5 / 25</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 