'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { ContactForm } from '@/components/support/ContactForm'
import { 
  Search, 
  BookOpen, 
  Video, 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText, 
  Lightbulb,
  Users,
  Target,
  Rocket,
  Settings,
  Shield,
  Zap,
  HelpCircle,
  ExternalLink,
  Play,
  Download,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactFormType, setContactFormType] = useState<'support' | 'feedback' | 'bug' | 'feature'>('support')

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen },
    { id: 'getting-started', name: 'Getting Started', icon: Rocket },
    { id: 'icp-generator', name: 'ICP Generator', icon: Target },
    { id: 'funnel-builder', name: 'Funnel Builder', icon: Zap },
    { id: 'workspaces', name: 'Workspaces', icon: Users },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'account', name: 'Account Settings', icon: Settings },
  ]

  const tutorials = [
    {
      id: 1,
      title: 'Getting Started with Vibler',
      description: 'Learn the basics of using Vibler for AI-powered marketing automation',
      duration: '5 min',
      category: 'getting-started',
      type: 'video',
      featured: true,
    },
    {
      id: 2,
      title: 'Creating Your First ICP',
      description: 'Step-by-step guide to generating detailed customer personas',
      duration: '8 min',
      category: 'icp-generator',
      type: 'video',
      featured: true,
    },
    {
      id: 3,
      title: 'Building High-Converting Funnels',
      description: 'Master the art of funnel creation with AI assistance',
      duration: '12 min',
      category: 'funnel-builder',
      type: 'video',
      featured: false,
    },
    {
      id: 4,
      title: 'Organizing with Workspaces',
      description: 'Learn to organize your projects with workspaces and folders',
      duration: '6 min',
      category: 'workspaces',
      type: 'guide',
      featured: false,
    },
    {
      id: 5,
      title: 'Privacy and Data Security',
      description: 'Understanding your data rights and security features',
      duration: '4 min',
      category: 'privacy',
      type: 'guide',
      featured: false,
    },
  ]

  const faqs = [
    {
      category: 'getting-started',
      question: 'What is Vibler and how does it work?',
      answer: 'Vibler is an AI-powered marketing automation platform that helps you create detailed customer personas (ICPs) and build high-converting marketing funnels. Our AI analyzes your business requirements and generates comprehensive marketing strategies tailored to your target audience.',
    },
    {
      category: 'getting-started',
      question: 'How do I get started with my first project?',
      answer: 'Start by creating a workspace for your project, then use our ICP Generator to define your ideal customer persona. Once you have your ICP, you can use it to generate targeted marketing funnels that speak directly to your audience.',
    },
    {
      category: 'icp-generator',
      question: 'What information do I need to generate an ICP?',
      answer: 'To generate a comprehensive ICP, provide details about your industry, business type, target market, company size, and any specific requirements. The more information you provide, the more detailed and accurate your customer persona will be.',
    },
    {
      category: 'icp-generator',
      question: 'Can I edit my ICP after it\'s generated?',
      answer: 'Yes! You can edit all aspects of your generated ICP including demographics, psychographics, pain points, goals, and preferred communication channels. Changes are saved automatically.',
    },
    {
      category: 'funnel-builder',
      question: 'How does the AI-powered funnel generation work?',
      answer: 'Our AI analyzes your ICP data and business requirements to create customized marketing funnels. It considers your target audience\'s preferences, pain points, and behavior patterns to design funnels that maximize conversion rates.',
    },
    {
      category: 'funnel-builder',
      question: 'Can I use my existing ICPs for funnel generation?',
      answer: 'Absolutely! When creating a new funnel, you can select from your existing ICPs. This automatically populates the funnel generation form with relevant audience data, ensuring your funnel is perfectly aligned with your target customer.',
    },
    {
      category: 'workspaces',
      question: 'How do workspaces help organize my projects?',
      answer: 'Workspaces allow you to organize your ICPs and funnels by project, client, or campaign. You can create folders within workspaces and use tags to categorize your content, making it easy to find and manage your marketing assets.',
    },
    {
      category: 'workspaces',
      question: 'Can I share workspaces with team members?',
      answer: 'Team collaboration features are coming soon! Currently, workspaces are private to your account, but we\'re working on sharing and collaboration features for teams.',
    },
    {
      category: 'privacy',
      question: 'How is my data protected?',
      answer: 'We take data security seriously. All data is encrypted in transit and at rest, we follow GDPR compliance standards, and you have full control over your data including the ability to export, anonymize, or delete it at any time.',
    },
    {
      category: 'privacy',
      question: 'Can I export my data?',
      answer: 'Yes! You can export all your data including ICPs, funnels, and workspaces from the Privacy page in your dashboard. The export includes all your content in a structured JSON format.',
    },
    {
      category: 'account',
      question: 'How do I change my account settings?',
      answer: 'Access your account settings from the Settings page in your dashboard. Here you can update your profile information, change your password, and manage your preferences.',
    },
    {
      category: 'account',
      question: 'What should I do if I forgot my password?',
      answer: 'Use the "Forgot Password" link on the login page to reset your password. You\'ll receive an email with instructions to create a new password.',
    },
  ]

  const supportChannels = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageCircle,
      action: 'Start Chat',
      available: 'Mon-Fri, 9AM-6PM EST',
      color: 'blue',
      onClick: () => {
        setContactFormType('support')
        setShowContactForm(true)
      }
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: Mail,
      action: 'Send Email',
      available: 'Response within 24 hours',
      color: 'green',
      onClick: () => {
        setContactFormType('support')
        setShowContactForm(true)
      }
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our team',
      icon: Phone,
      action: 'Call Now',
      available: 'Mon-Fri, 9AM-5PM EST',
      color: 'purple',
      onClick: () => {
        setContactFormType('support')
        setShowContactForm(true)
      }
    },
  ]

  const filteredTutorials = tutorials.filter(tutorial => 
    (selectedCategory === 'all' || tutorial.category === selectedCategory) &&
    (searchQuery === '' || 
     tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredFaqs = faqs.filter(faq =>
    (selectedCategory === 'all' || faq.category === selectedCategory) &&
    (searchQuery === '' ||
     faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
     faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleContactSupport = () => {
    setContactFormType('support')
    setShowContactForm(true)
  }

  const handleSendFeedback = () => {
    setContactFormType('feedback')
    setShowContactForm(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="icon-container icon-container-blue">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
          </div>
          <p className="text-muted">Find answers, tutorials, and get help when you need it</p>
        </div>

        {/* Search */}
        <Card className="modern-card mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
              <Input
                placeholder="Search help articles, tutorials, and FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="modern-input pl-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {supportChannels.map((channel, index) => (
            <Card key={index} className="modern-card cursor-pointer hover:shadow-lg transition-shadow" onClick={channel.onClick}>
              <CardHeader>
                <div className={`accent-bar accent-bar-${channel.color}`}></div>
                <div className="flex items-center space-x-3">
                  <div className={`icon-container-${channel.color} w-12 h-12`}>
                    <channel.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">{channel.title}</CardTitle>
                    <CardDescription>{channel.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{channel.available}</span>
                  <Button className={`modern-button-${channel.color === 'blue' ? 'primary' : 'secondary'}`}>
                    {channel.action}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category Filter */}
        <Card className="modern-card mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id ? "modern-button-primary" : "modern-button-secondary"}
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tutorials */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Video className="w-6 h-6 mr-2 text-purple-600" />
              Video Tutorials
            </h2>
            <div className="space-y-4">
              {filteredTutorials.map((tutorial) => (
                <Card key={tutorial.id} className="modern-card hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="accent-bar accent-bar-purple"></div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {tutorial.featured && (
                            <Badge className="bg-yellow-100 text-yellow-700">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          <Badge className={tutorial.type === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                            {tutorial.type === 'video' ? <Video className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
                            {tutorial.type}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg font-semibold text-gray-900">{tutorial.title}</CardTitle>
                        <CardDescription className="text-sm">{tutorial.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className="text-sm text-gray-500">{tutorial.duration}</span>
                        <Button size="sm" className="modern-button-primary">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <HelpCircle className="w-6 h-6 mr-2 text-blue-600" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <Card key={index} className="modern-card">
                  <CardHeader>
                    <div className="accent-bar accent-bar-blue"></div>
                    <CardTitle className="text-lg font-semibold text-gray-900">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="modern-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="accent-bar accent-bar-green"></div>
                <div className="text-center">
                  <div className="icon-container-green w-12 h-12 mx-auto mb-3">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Documentation</CardTitle>
                  <CardDescription>Complete API reference</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="modern-button-secondary">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Docs
                </Button>
              </CardContent>
            </Card>

            <Card className="modern-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="accent-bar accent-bar-yellow"></div>
                <div className="text-center">
                  <div className="icon-container-yellow w-12 h-12 mx-auto mb-3">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Community</CardTitle>
                  <CardDescription>Join our Discord server</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="modern-button-secondary">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Join Community
                </Button>
              </CardContent>
            </Card>

            <Card className="modern-card hover:shadow-lg transition-shadow cursor-pointer" onClick={handleSendFeedback}>
              <CardHeader>
                <div className="accent-bar accent-bar-pink"></div>
                <div className="text-center">
                  <div className="icon-container-pink w-12 h-12 mx-auto mb-3">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Feedback</CardTitle>
                  <CardDescription>Share your thoughts</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="modern-button-secondary">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Feedback
                </Button>
              </CardContent>
            </Card>

            <Card className="modern-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="accent-bar accent-bar-purple"></div>
                <div className="text-center">
                  <div className="icon-container-purple w-12 h-12 mx-auto mb-3">
                    <Download className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Resources</CardTitle>
                  <CardDescription>Templates & guides</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="modern-button-secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
          <ContactForm
            type={contactFormType}
            onClose={() => setShowContactForm(false)}
          />
        )}
      </div>
    </div>
  )
} 