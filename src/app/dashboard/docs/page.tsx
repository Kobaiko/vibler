'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { 
  Search, 
  BookOpen, 
  Code, 
  Terminal, 
  FileText, 
  ExternalLink,
  Copy,
  Check,
  Zap,
  Shield,
  Database,
  Globe,
  Key,
  Settings,
  Users,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const apiEndpoints = [
    {
      method: 'POST',
      endpoint: '/api/icps/generate',
      description: 'Generate a new ICP using AI',
      parameters: [
        { name: 'industry', type: 'string', required: true, description: 'Target industry' },
        { name: 'businessType', type: 'string', required: true, description: 'Type of business' },
        { name: 'targetMarket', type: 'string', required: false, description: 'Target market description' },
        { name: 'companySize', type: 'string', required: false, description: 'Company size range' },
      ],
      example: `{
  "industry": "SaaS",
  "businessType": "B2B",
  "targetMarket": "Small to medium businesses",
  "companySize": "10-50 employees"
}`,
      response: `{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "SaaS B2B Decision Maker",
    "demographics": {...},
    "psychographics": {...},
    "painPoints": [...],
    "goals": [...],
    "preferredChannels": [...]
  }
}`
    },
    {
      method: 'GET',
      endpoint: '/api/icps',
      description: 'Retrieve all ICPs for the authenticated user',
      parameters: [
        { name: 'workspace_id', type: 'string', required: false, description: 'Filter by workspace' },
        { name: 'limit', type: 'number', required: false, description: 'Number of results to return' },
      ],
      example: 'GET /api/icps?workspace_id=123&limit=10',
      response: `{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "SaaS B2B Decision Maker",
      "created_at": "2024-01-01T00:00:00Z",
      "workspace_id": "123"
    }
  ],
  "total": 1
}`
    },
    {
      method: 'POST',
      endpoint: '/api/funnel/generate-with-icp',
      description: 'Generate a marketing funnel using an existing ICP',
      parameters: [
        { name: 'icpId', type: 'string', required: true, description: 'ID of the ICP to use' },
        { name: 'prompt', type: 'string', required: true, description: 'Funnel generation prompt' },
        { name: 'budget', type: 'string', required: false, description: 'Marketing budget' },
        { name: 'timeline', type: 'string', required: false, description: 'Campaign timeline' },
      ],
      example: `{
  "icpId": "uuid",
  "prompt": "Create a lead generation funnel for SaaS product",
  "budget": "$5000",
  "timeline": "3 months"
}`,
      response: `{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "SaaS Lead Generation Funnel",
    "stages": [...],
    "content": {...},
    "metrics": {...}
  }
}`
    },
  ]

  const sdkExamples = [
    {
      language: 'JavaScript',
      title: 'Node.js SDK',
      code: `import { ViblerClient } from '@vibler/sdk';

const client = new ViblerClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.vibler.com'
});

// Generate an ICP
const icp = await client.icps.generate({
  industry: 'SaaS',
  businessType: 'B2B',
  targetMarket: 'Small businesses'
});

// Create a funnel using the ICP
const funnel = await client.funnels.generateWithIcp({
  icpId: icp.id,
  prompt: 'Lead generation funnel',
  budget: '$5000'
});

console.log('Generated funnel:', funnel);`
    },
    {
      language: 'Python',
      title: 'Python SDK',
      code: `from vibler import ViblerClient

client = ViblerClient(
    api_key='your-api-key',
    base_url='https://api.vibler.com'
)

# Generate an ICP
icp = client.icps.generate(
    industry='SaaS',
    business_type='B2B',
    target_market='Small businesses'
)

# Create a funnel using the ICP
funnel = client.funnels.generate_with_icp(
    icp_id=icp['id'],
    prompt='Lead generation funnel',
    budget='$5000'
)

print(f"Generated funnel: {funnel}")`
    },
    {
      language: 'cURL',
      title: 'REST API',
      code: `# Generate an ICP
curl -X POST https://api.vibler.com/api/icps/generate \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "industry": "SaaS",
    "businessType": "B2B",
    "targetMarket": "Small businesses"
  }'

# Generate a funnel with ICP
curl -X POST https://api.vibler.com/api/funnel/generate-with-icp \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "icpId": "uuid",
    "prompt": "Lead generation funnel",
    "budget": "$5000"
  }'`
    },
  ]

  const guides = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of using Vibler AI for marketing automation',
      icon: Zap,
      color: 'blue',
      topics: [
        'Setting up your account',
        'Understanding ICPs',
        'Creating your first funnel',
        'Best practices'
      ]
    },
    {
      title: 'API Integration',
      description: 'Integrate Vibler AI into your existing systems',
      icon: Code,
      color: 'green',
      topics: [
        'Authentication',
        'Rate limiting',
        'Error handling',
        'Webhooks'
      ]
    },
    {
      title: 'Security',
      description: 'Keep your data safe with our security features',
      icon: Shield,
      color: 'purple',
      topics: [
        'API key management',
        'Data encryption',
        'Access controls',
        'Compliance'
      ]
    },
    {
      title: 'Data Management',
      description: 'Manage your customer data and insights',
      icon: Database,
      color: 'pink',
      topics: [
        'Data import/export',
        'Backup and restore',
        'Data retention',
        'Analytics'
      ]
    },
  ]

  const filteredEndpoints = apiEndpoints.filter(endpoint =>
    searchQuery === '' ||
    endpoint.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="icon-container icon-container-blue">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
          </div>
          <p className="text-muted">Everything you need to integrate with Vibler AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="modern-card sticky top-6">
              <CardHeader>
                <div className="accent-bar accent-bar-blue"></div>
                <CardTitle className="text-lg font-semibold text-gray-900">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href="#api-reference" className="flex items-center space-x-2 text-sm text-gray-700 hover:text-purple-600 transition-colors">
                  <Code className="w-4 h-4" />
                  <span>API Reference</span>
                </a>
                <a href="#sdk-examples" className="flex items-center space-x-2 text-sm text-gray-700 hover:text-purple-600 transition-colors">
                  <Terminal className="w-4 h-4" />
                  <span>SDK Examples</span>
                </a>
                <a href="#guides" className="flex items-center space-x-2 text-sm text-gray-700 hover:text-purple-600 transition-colors">
                  <BookOpen className="w-4 h-4" />
                  <span>Guides</span>
                </a>
                <a href="#support" className="flex items-center space-x-2 text-sm text-gray-700 hover:text-purple-600 transition-colors">
                  <Users className="w-4 h-4" />
                  <span>Support</span>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Guides Section */}
            <section id="guides">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Guides & Tutorials</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guides.map((guide, index) => (
                  <Card key={index} className="modern-card cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className={`accent-bar accent-bar-${guide.color}`}></div>
                      <div className="flex items-start space-x-3">
                        <div className={`icon-container-${guide.color} flex-shrink-0 w-10 h-10`}>
                          <guide.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">{guide.title}</CardTitle>
                          <CardDescription className="text-sm">{guide.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {guide.topics.map((topic, topicIndex) => (
                          <li key={topicIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* API Reference */}
            <section id="api-reference">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">API Reference</h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
                  <Input
                    placeholder="Search endpoints..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="modern-input pl-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredEndpoints.map((endpoint, index) => (
                  <Card key={index} className="modern-card">
                    <CardHeader>
                      <div className="accent-bar accent-bar-green"></div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={`${
                            endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                            endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                            endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono text-purple-600">{endpoint.endpoint}</code>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(endpoint.endpoint, `endpoint-${index}`)}
                          className="hover:bg-blue-50"
                        >
                          {copiedCode === `endpoint-${index}` ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <CardDescription>{endpoint.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="parameters" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="parameters">Parameters</TabsTrigger>
                          <TabsTrigger value="example">Example</TabsTrigger>
                          <TabsTrigger value="response">Response</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="parameters" className="mt-4">
                          <div className="space-y-3">
                            {endpoint.parameters.map((param, paramIndex) => (
                              <div key={paramIndex} className="modern-card p-3 border">
                                <div className="flex items-center justify-between mb-1">
                                  <code className="text-sm font-mono text-purple-600">{param.name}</code>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant={param.required ? "default" : "secondary"} className="text-xs">
                                      {param.required ? 'Required' : 'Optional'}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {param.type}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">{param.description}</p>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="example" className="mt-4">
                          <div className="relative">
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{endpoint.example}</code>
                            </pre>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(endpoint.example, `example-${index}`)}
                              className="absolute top-2 right-2 hover:bg-gray-700"
                            >
                              {copiedCode === `example-${index}` ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="response" className="mt-4">
                          <div className="relative">
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{endpoint.response}</code>
                            </pre>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(endpoint.response, `response-${index}`)}
                              className="absolute top-2 right-2 hover:bg-gray-700"
                            >
                              {copiedCode === `response-${index}` ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* SDK Examples */}
            <section id="sdk-examples">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">SDK Examples</h2>
              <div className="space-y-4">
                {sdkExamples.map((example, index) => (
                  <Card key={index} className="modern-card">
                    <CardHeader>
                      <div className="accent-bar accent-bar-yellow"></div>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">{example.title}</CardTitle>
                          <CardDescription>Example code for {example.language}</CardDescription>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700">
                          {example.language}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{example.code}</code>
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(example.code, `sdk-${index}`)}
                          className="absolute top-2 right-2 hover:bg-gray-700"
                        >
                          {copiedCode === `sdk-${index}` ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Support Section */}
            <section id="support">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Support & Community</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="modern-card">
                  <CardHeader>
                    <div className="accent-bar accent-bar-green"></div>
                    <div className="flex items-center space-x-3">
                      <div className="icon-container-green w-10 h-10">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">Help Center</CardTitle>
                        <CardDescription>Browse our knowledge base</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="modern-button-primary w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Help Center
                    </Button>
                  </CardContent>
                </Card>

                <Card className="modern-card">
                  <CardHeader>
                    <div className="accent-bar accent-bar-purple"></div>
                    <div className="flex items-center space-x-3">
                      <div className="icon-container-purple w-10 h-10">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">Community</CardTitle>
                        <CardDescription>Join our developer community</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="modern-button-secondary w-full">
                      <Globe className="w-4 h-4 mr-2" />
                      Join Discord
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 