'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Target, 
  Users, 
  Palette, 
  User,
  Play,
  CheckCircle
} from 'lucide-react'

interface WalkthroughStep {
  id: string
  title: string
  description: string
  icon: any
  target?: string // CSS selector for highlighting
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  actionText?: string
  actionHref?: string
}

interface WalkthroughTourProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Vibler AI! 🎉',
    description: 'Your all-in-one AI marketing automation platform. Let\'s take a quick tour to show you the powerful features available.',
    icon: Sparkles,
    position: 'center'
  },
  {
    id: 'profile-setup',
    title: 'Set Up Your Brand Profile',
    description: 'First, let\'s set up your company branding. We can extract your logo, colors, and info directly from your website!',
    icon: User,
    position: 'center',
    actionText: 'Set Up Profile',
    actionHref: '/dashboard/profile'
  },
  {
    id: 'creative-generator',
    title: 'AI Creative Generator',
    description: 'Generate stunning ad copy and visuals for multiple platforms using advanced AI. Perfect for Facebook, Instagram, LinkedIn, and more.',
    icon: Palette,
    position: 'right',
    target: '[data-tour="creative-nav"]',
    actionText: 'Try Creative Generator',
    actionHref: '/dashboard/creative'
  },
  {
    id: 'strategy-composer',
    title: 'Marketing Strategy Composer',
    description: 'Build comprehensive marketing strategies with AI assistance. Get detailed plans, tactics, and recommendations.',
    icon: Target,
    position: 'right',
    target: '[data-tour="strategy-nav"]',
    actionText: 'Create Strategy',
    actionHref: '/dashboard/strategy'
  },
  {
    id: 'icp-generator',
    title: 'Ideal Customer Profile Generator',
    description: 'Define your perfect customers with AI-generated detailed personas, demographics, and behavioral insights.',
    icon: Users,
    position: 'right',
    target: '[data-tour="icp-nav"]',
    actionText: 'Generate ICP',
    actionHref: '/dashboard/icp'
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🚀',
    description: 'You now know the core features of Vibler AI. Start with setting up your profile, then generate your first creative!',
    icon: CheckCircle,
    position: 'center',
    actionText: 'Get Started',
    actionHref: '/dashboard/profile'
  }
]

export function WalkthroughTour({ isOpen, onClose, onComplete }: WalkthroughTourProps) {
  const [currentStep, setCurrentStep] = useState(() => {
    // Resume from saved step or start from beginning
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('vibler-tour-step')
      return savedStep ? parseInt(savedStep, 10) : 0
    }
    return 0
  })
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const step = walkthroughSteps[currentStep]
    if (step.target) {
      const element = document.querySelector(step.target) as HTMLElement
      if (element) {
        setHighlightedElement(element)
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    } else {
      setHighlightedElement(null)
    }
  }, [currentStep, isOpen])

  useEffect(() => {
    if (!isOpen) {
      setHighlightedElement(null)
      // Don't reset currentStep when closing - preserve for next time
    }
  }, [isOpen])

  // Save progress to localStorage whenever step changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vibler-tour-step', currentStep.toString())
    }
  }, [currentStep])

  const nextStep = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Tour completed - reset progress and close
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vibler-tour-step')
      }
      onComplete()
      onClose()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTour = () => {
    // When skipping, reset progress
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vibler-tour-step')
    }
    setCurrentStep(0)
    onClose()
  }

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  if (!isOpen) return null

  const currentStepData = walkthroughSteps[currentStep]
  const progress = ((currentStep + 1) / walkthroughSteps.length) * 100

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[100]" onClick={skipTour} />
      
      {/* Highlighted Element Outline */}
      {highlightedElement && (
        <div
          className="fixed pointer-events-none z-[101] border-4 border-purple-400 rounded-lg shadow-lg animate-pulse"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 4,
            left: highlightedElement.getBoundingClientRect().left - 4,
            width: highlightedElement.getBoundingClientRect().width + 8,
            height: highlightedElement.getBoundingClientRect().height + 8,
          }}
        />
      )}

      {/* Tour Modal */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="fixed z-[102]"
          style={getModalPositionStyle(currentStepData.position, highlightedElement)}
        >
          <Card className="w-[480px] max-w-[90vw] bg-white shadow-2xl border-2 border-purple-200 rounded-xl">
            <CardHeader className="relative pb-6">
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-white">
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 font-medium px-3 py-1 text-xs">
                  Step {currentStep + 1} of {walkthroughSteps.length}
                </Badge>
                {currentStep < walkthroughSteps.length - 1 ? (
                  <Button
                    variant="ghost"
                    onClick={skipTour}
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-xs"
                  >
                    Skip Tour
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      // Reset tour progress when closing from final step
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('vibler-tour-step')
                      }
                      setCurrentStep(0)
                      onClose()
                    }}
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-xs"
                  >
                    Close Tour
                  </Button>
                )}
              </div>
              
              {/* Progress Bar - Full Width */}
              <div className="absolute top-16 left-0 right-0 px-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="text-center w-full px-6 mt-24">
                <CardTitle className="flex items-center justify-center space-x-3 text-xl mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <currentStepData.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-gray-800 font-semibold">{currentStepData.title}</span>
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pb-6">
              <div className="text-center w-full">
                <CardDescription className="text-gray-600 leading-relaxed text-base px-2">
                  {currentStepData.description}
                </CardDescription>
              </div>

              {/* Step Dots */}
              <div className="flex justify-center space-x-2 py-2 w-full">
                {walkthroughSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                      index === currentStep
                        ? 'bg-purple-600 scale-125'
                        : index < currentStep
                        ? 'bg-purple-300'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 w-full">
                <div className="flex items-center space-x-3">
                  {currentStep > 0 && (
                    <Button
                      variant="ghost"
                      onClick={prevStep}
                      size="sm"
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    >
                      <ArrowLeft className="w-3 h-3 mr-1" />
                      Back
                    </Button>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {currentStepData.actionHref && currentStep < walkthroughSteps.length - 1 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        window.location.href = currentStepData.actionHref!
                        onClose()
                      }}
                      size="sm"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      {currentStepData.actionText}
                    </Button>
                  )}
                  
                  <Button
                    onClick={currentStep === walkthroughSteps.length - 1 ? () => {
                      if (currentStepData.actionHref) {
                        window.location.href = currentStepData.actionHref
                      }
                      onComplete()
                      onClose()
                    } : nextStep}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {currentStep === walkthroughSteps.length - 1 ? (
                      <>
                        Get Started
                        <Play className="w-3 h-3 ml-1 text-white" fill="white" stroke="none" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-3 h-3 ml-1 text-white" fill="white" stroke="none" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

function getModalPositionStyle(position: string, highlightedElement: HTMLElement | null): React.CSSProperties {
  if (position === 'center') {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
  }

  if (!highlightedElement) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
  }

  const rect = highlightedElement.getBoundingClientRect()
  const margin = 20
  const modalWidth = 480 // w-[480px] = 480px
  const modalHeight = 400 // Estimated height for better positioning

  switch (position) {
    case 'top':
      return {
        top: `${Math.max(rect.top - margin, 20)}px`,
        left: `${Math.min(rect.left, window.innerWidth - modalWidth - 20)}px`,
        transform: 'translateY(-100%)'
      }
    case 'bottom':
      return {
        top: `${Math.min(rect.bottom + margin, window.innerHeight - modalHeight)}px`,
        left: `${Math.min(rect.left, window.innerWidth - modalWidth - 20)}px`,
      }
    case 'left':
      return {
        top: `${Math.min(rect.top, window.innerHeight - modalHeight)}px`,
        left: `${Math.max(rect.left - modalWidth - margin, 20)}px`,
      }
    case 'right':
      return {
        top: `${Math.min(rect.top, window.innerHeight - modalHeight)}px`,
        left: `${Math.min(rect.right + margin, window.innerWidth - modalWidth - 20)}px`,
      }
    default:
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
  }
} 