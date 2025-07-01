'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Progress } from '@/components/ui/Progress'
import { Label } from '@/components/ui/Label'
import { MagicCard } from '@/components/ui/magic-card'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  Rocket, 
  Users, 
  Zap,
  Play,
  BookOpen,
  Lightbulb,
  Star,
  X,
  Globe,
  Palette,
  Image
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface OnboardingFlowProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function OnboardingFlow({ isOpen, onClose, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [userProfile, setUserProfile] = useState({
    name: '',
    company: '',
    role: '',
    industry: '',
    website: '',
    useBranding: false,
    brandingPreferences: {
      logo: true,
      colors: true,
      fonts: false,
      style: true
    },
    goals: [] as string[],
  })

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Vibler!',
      description: 'Let\'s get you set up for success with AI-powered marketing automation',
      icon: Rocket,
      color: 'text-blue-400',
    },
    {
      id: 'profile',
      title: 'Tell us about yourself',
      description: 'Help us personalize your Vibler experience',
      icon: Users,
      color: 'text-green-400',
    },
    {
      id: 'branding',
      title: 'Website & Branding',
      description: 'Connect your website and set branding preferences for ads',
      icon: Palette,
      color: 'text-pink-400',
    },
    {
      id: 'goals',
      title: 'What are your goals?',
      description: 'Select what you want to achieve with Vibler',
      icon: Target,
      color: 'text-purple-400',
    },
    {
      id: 'features',
      title: 'Key Features Overview',
      description: 'Discover what makes Vibler powerful',
      icon: Zap,
      color: 'text-yellow-400',
    },
    {
      id: 'first-steps',
      title: 'Ready to get started?',
      description: 'Here\'s what you can do first',
      icon: Play,
      color: 'text-orange-400',
    },
  ]

  const goalOptions = [
    { id: 'generate-icps', label: 'Generate Customer Personas', icon: Target },
    { id: 'build-funnels', label: 'Build Marketing Funnels', icon: Zap },
    { id: 'organize-projects', label: 'Organize Marketing Projects', icon: Users },
    { id: 'improve-conversions', label: 'Improve Conversion Rates', icon: Star },
    { id: 'automate-marketing', label: 'Automate Marketing Tasks', icon: Rocket },
    { id: 'learn-best-practices', label: 'Learn Marketing Best Practices', icon: BookOpen },
  ]

  const features = [
    {
      title: 'AI-Powered ICP Generator',
      description: 'Create detailed customer personas with advanced AI analysis',
      icon: Target,
      color: 'bg-blue-500',
    },
    {
      title: 'Smart Funnel Builder',
      description: 'Generate high-converting funnels tailored to your audience',
      icon: Zap,
      color: 'bg-green-500',
    },
    {
      title: 'Creative Generator',
      description: 'Generate ads that match your brand style and colors',
      icon: Image,
      color: 'bg-pink-500',
    },
    {
      title: 'Privacy & Security',
      description: 'Enterprise-grade security with full data control',
      icon: CheckCircle,
      color: 'bg-orange-500',
    },
  ]

  const nextSteps = [
    {
      title: 'Create Your First ICP',
      description: 'Start by generating a detailed customer persona',
      action: 'Go to ICP Generator',
      href: '/dashboard/icps',
      icon: Target,
      color: 'bg-blue-600',
    },
    {
      title: 'Build a Marketing Strategy',
      description: 'Use AI to create a comprehensive marketing strategy',
      action: 'Go to Strategy Composer',
      href: '/dashboard/strategy',
      icon: Lightbulb,
      color: 'bg-purple-600',
    },
    {
      title: 'Generate Creative Assets',
      description: 'Create ads that match your brand',
      action: 'Go to Creative Generator',
      href: '/dashboard/creative',
      icon: Image,
      color: 'bg-pink-600',
    },
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Save user profile to localStorage or API
      localStorage.setItem('vibler_user_profile', JSON.stringify(userProfile))
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGoalToggle = (goalId: string) => {
    setUserProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }))
  }

  const handleProfileChange = (field: string, value: string | boolean) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBrandingPreferenceChange = (preference: string, value: boolean) => {
    setUserProfile(prev => ({
      ...prev,
      brandingPreferences: {
        ...prev.brandingPreferences,
        [preference]: value
      }
    }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: // Profile step
        return userProfile.name && userProfile.company && userProfile.role
      case 2: // Branding step - website is optional, but if useBranding is true, website should be provided
        return !userProfile.useBranding || (userProfile.useBranding && userProfile.website)
      case 3: // Goals step
        return userProfile.goals.length > 0
      default:
        return true
    }
  }

  if (!isOpen) return null

  const CurrentStepIcon = steps[currentStep].icon

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl"
      >
        <MagicCard className="bg-slate-900 border-slate-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500")}>
                <CurrentStepIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{steps[currentStep].title}</h2>
                <p className="text-slate-400 text-sm">{steps[currentStep].description}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="px-6 py-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-sm text-slate-400">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Content */}
          <div className="p-6 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Welcome Step */}
                {currentStep === 0 && (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                      <Rocket className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        Welcome to the future of marketing automation!
                      </h3>
                      <p className="text-slate-400 text-lg leading-relaxed">
                        Vibler uses advanced AI to help you create detailed customer personas, build 
                        high-converting marketing strategies, and generate branded creative assets. Let's take a quick tour to get you started.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-8">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Target className="w-6 h-6 text-blue-400" />
                        </div>
                        <p className="text-white font-medium">AI-Powered ICPs</p>
                        <p className="text-slate-400 text-sm">Generate detailed personas</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Lightbulb className="w-6 h-6 text-green-400" />
                        </div>
                        <p className="text-white font-medium">Smart Strategies</p>
                        <p className="text-slate-400 text-sm">Build comprehensive plans</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Image className="w-6 h-6 text-pink-400" />
                        </div>
                        <p className="text-white font-medium">Branded Creatives</p>
                        <p className="text-slate-400 text-sm">Generate on-brand ads</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Step */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-white mb-2">Let's personalize your experience</h3>
                      <p className="text-slate-400">This helps us provide better recommendations and content</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-white">Your Name *</Label>
                        <Input
                          id="name"
                          value={userProfile.name}
                          onChange={(e) => handleProfileChange('name', e.target.value)}
                          placeholder="John Doe"
                          className="mt-1 bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company" className="text-white">Company *</Label>
                        <Input
                          id="company"
                          value={userProfile.company}
                          onChange={(e) => handleProfileChange('company', e.target.value)}
                          placeholder="Acme Corp"
                          className="mt-1 bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role" className="text-white">Your Role *</Label>
                        <Input
                          id="role"
                          value={userProfile.role}
                          onChange={(e) => handleProfileChange('role', e.target.value)}
                          placeholder="Marketing Manager"
                          className="mt-1 bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="industry" className="text-white">Industry</Label>
                        <Input
                          id="industry"
                          value={userProfile.industry}
                          onChange={(e) => handleProfileChange('industry', e.target.value)}
                          placeholder="SaaS, E-commerce, etc."
                          className="mt-1 bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Branding Step */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-white mb-2">Website & Branding Preferences</h3>
                      <p className="text-slate-400">Help us create ads that match your brand identity</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="website" className="text-white">Website URL</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Globe className="w-4 h-4 text-slate-400" />
                          <Input
                            id="website"
                            value={userProfile.website}
                            onChange={(e) => handleProfileChange('website', e.target.value)}
                            placeholder="https://yourcompany.com"
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                        </div>
                        <p className="text-slate-400 text-sm mt-1">We'll analyze your website to extract branding elements</p>
                      </div>

                      <div className="border border-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-white font-medium">Use Website Branding in Ads</h4>
                            <p className="text-slate-400 text-sm">Automatically apply your brand elements to generated creatives</p>
                          </div>
                          <button
                            onClick={() => handleProfileChange('useBranding', !userProfile.useBranding)}
                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                              userProfile.useBranding ? "bg-blue-600" : "bg-slate-600"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                userProfile.useBranding ? "translate-x-6" : "translate-x-1"
                              )}
                            />
                          </button>
                        </div>

                        {userProfile.useBranding && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                          >
                            <p className="text-slate-400 text-sm mb-3">Select which brand elements to use:</p>
                            
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { key: 'logo', label: 'Logo', icon: Image },
                                { key: 'colors', label: 'Brand Colors', icon: Palette },
                                { key: 'fonts', label: 'Typography', icon: BookOpen },
                                { key: 'style', label: 'Visual Style', icon: Star },
                              ].map((item) => (
                                <button
                                  key={item.key}
                                  onClick={() => handleBrandingPreferenceChange(item.key, !userProfile.brandingPreferences[item.key as keyof typeof userProfile.brandingPreferences])}
                                  className={cn(
                                    "p-3 rounded-lg border-2 transition-all text-left",
                                    userProfile.brandingPreferences[item.key as keyof typeof userProfile.brandingPreferences]
                                      ? "border-blue-500 bg-blue-500/10"
                                      : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
                                  )}
                                >
                                  <div className="flex items-center space-x-2">
                                    <item.icon className={cn(
                                      "w-4 h-4",
                                      userProfile.brandingPreferences[item.key as keyof typeof userProfile.brandingPreferences] ? "text-blue-400" : "text-slate-400"
                                    )} />
                                    <span className={cn(
                                      "text-sm font-medium",
                                      userProfile.brandingPreferences[item.key as keyof typeof userProfile.brandingPreferences] ? "text-white" : "text-slate-300"
                                    )}>
                                      {item.label}
                                    </span>
                                    {userProfile.brandingPreferences[item.key as keyof typeof userProfile.brandingPreferences] && (
                                      <CheckCircle className="w-3 h-3 text-blue-400 ml-auto" />
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Goals Step */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-white mb-2">What do you want to achieve?</h3>
                      <p className="text-slate-400">Select all that apply - we'll customize your experience accordingly</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {goalOptions.map((goal) => (
                        <button
                          key={goal.id}
                          onClick={() => handleGoalToggle(goal.id)}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-all text-left",
                            userProfile.goals.includes(goal.id)
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <goal.icon className={cn(
                              "w-5 h-5",
                              userProfile.goals.includes(goal.id) ? "text-blue-400" : "text-slate-400"
                            )} />
                            <span className={cn(
                              "font-medium",
                              userProfile.goals.includes(goal.id) ? "text-white" : "text-slate-300"
                            )}>
                              {goal.label}
                            </span>
                            {userProfile.goals.includes(goal.id) && (
                              <CheckCircle className="w-4 h-4 text-blue-400 ml-auto" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features Step */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-white mb-2">Powerful features at your fingertips</h3>
                      <p className="text-slate-400">Here's what makes Vibler special</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="pb-3">
                              <div className="flex items-center space-x-3">
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", feature.color)}>
                                  <feature.icon className="w-4 h-4 text-white" />
                                </div>
                                <h4 className="text-white text-base font-medium">{feature.title}</h4>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-slate-400">
                                {feature.description}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* First Steps */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-white mb-2">You're all set! 🎉</h3>
                      <p className="text-slate-400">Here are some great ways to get started with Vibler</p>
                    </div>
                    <div className="space-y-4">
                      {nextSteps.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", step.color)}>
                                    <step.icon className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-white">{step.title}</h4>
                                    <p className="text-slate-400 text-sm">{step.description}</p>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                  onClick={() => window.location.href = step.href}
                                >
                                  {step.action}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-slate-700">
            {currentStep === 0 ? (
              <div></div>
            ) : (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index <= currentStep ? "bg-blue-400" : "bg-slate-600"
                  )}
                />
              ))}
            </div>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </MagicCard>
      </motion.div>
    </div>
  )
} 