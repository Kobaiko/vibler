'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { MagicCard } from '@/components/ui/magic-card'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Send, 
  X, 
  CheckCircle,
  AlertCircle,
  Bug,
  Lightbulb,
  HelpCircle,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface ContactFormProps {
  isOpen: boolean
  onClose: () => void
  initialType?: 'support' | 'feedback' | 'bug' | 'feature'
}

export function ContactForm({ isOpen, onClose, initialType = 'support' }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    type: initialType,
    priority: 'medium',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const contactTypes = [
    { id: 'support', label: 'General Support', icon: HelpCircle, color: 'bg-blue-500' },
    { id: 'feedback', label: 'Product Feedback', icon: Star, color: 'bg-green-500' },
    { id: 'bug', label: 'Bug Report', icon: Bug, color: 'bg-red-500' },
    { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'bg-purple-500' },
  ]

  const priorities = [
    { id: 'low', label: 'Low', color: 'bg-gray-500' },
    { id: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { id: 'high', label: 'High', color: 'bg-orange-500' },
    { id: 'urgent', label: 'Urgent', color: 'bg-red-500' },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Here you would typically send the form data to your support system
      console.log('Contact form submitted:', formData)
      
      setIsSubmitted(true)
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({
          name: '',
          email: '',
          subject: '',
          type: initialType,
          priority: 'medium',
          message: '',
        })
        onClose()
      }, 3000)
    } catch (error) {
      console.error('Error submitting contact form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = formData.name && formData.email && formData.subject && formData.message

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <MagicCard className="bg-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h2 className="text-white text-xl font-semibold">Contact Support</h2>
              <p className="text-slate-400">
                Get help from our support team or share your feedback
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-400 mb-4">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/50 rounded text-sm inline-block">
                    Ticket #VB-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Contact Type */}
                  <div>
                    <Label className="text-white mb-3 block">What can we help you with?</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {contactTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleInputChange('type', type.id)}
                          className={cn(
                            'flex items-center p-3 rounded-lg border transition-all',
                            formData.type === type.id
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                          )}
                        >
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mr-3', type.color)}>
                            <type.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-white text-sm font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Subject and Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="subject" className="text-white">Subject *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder="Brief description of your issue"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white">Priority</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {priorities.map((priority) => (
                          <button
                            key={priority.id}
                            type="button"
                            onClick={() => handleInputChange('priority', priority.id)}
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-medium transition-all',
                              formData.priority === priority.id
                                ? `${priority.color} text-white`
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            )}
                          >
                            {priority.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message" className="text-white">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white min-h-[120px]"
                      placeholder="Please provide as much detail as possible..."
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <ShimmerButton
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </ShimmerButton>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </MagicCard>
      </motion.div>
    </div>
  )
} 