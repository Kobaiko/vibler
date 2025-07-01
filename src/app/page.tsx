import Link from 'next/link'
import { Button, Card, CardHeader, CardContent } from '@/components/ui'
import { Header } from '@/components/navigation'
import { Zap, Users, Palette, Target, Map, BarChart3, ArrowRight, Play, Wand2 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main id="main-content" role="main">
      {/* Hero Section */}
      <section className="py-20 lg:py-32" aria-labelledby="hero-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 
              id="hero-heading"
              className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6"
            >
              Transform Ideas into
              <span className="gradient-text"> 
                {" "}Marketing Campaigns
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Vibler's guided wizard takes you from brand setup to professional ad creatives in minutes. 
              Complete with AI-powered ICP analysis, marketing strategy, and ready-to-launch campaigns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link href="/wizard">
                 <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                   <Wand2 className="w-4 h-4 mr-2" />
                   <span>Start Marketing Wizard</span>
                   <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
               </Link>
               <Button variant="outline" size="lg" className="border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-lg font-medium">
                 <Play className="w-4 h-4 mr-2" />
                 Watch Demo
               </Button>
             </div>
             
             {/* Quick Benefits */}
             <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
               <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                 <div className="text-center">
                   <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                     <Zap className="w-4 h-4 text-blue-600" />
                   </div>
                   <h3 className="font-semibold text-sm">Brand Analysis</h3>
                   <p className="text-xs text-gray-600">Auto-extract from website</p>
                 </div>
               </div>
               <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                 <div className="text-center">
                   <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                     <Users className="w-4 h-4 text-green-600" />
                   </div>
                   <h3 className="font-semibold text-sm">AI ICP Generator</h3>
                   <p className="text-xs text-gray-600">Ideal customer profiling</p>
                 </div>
               </div>
               <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                 <div className="text-center">
                   <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                     <Target className="w-4 h-4 text-purple-600" />
                   </div>
                   <h3 className="font-semibold text-sm">Strategy Composer</h3>
                   <p className="text-xs text-gray-600">Complete marketing plan</p>
                 </div>
               </div>
               <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                 <div className="text-center">
                   <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                     <Palette className="w-4 h-4 text-pink-600" />
                   </div>
                   <h3 className="font-semibold text-sm">Creative Generator</h3>
                   <p className="text-xs text-gray-600">Professional ad creatives</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Your Marketing Campaign in 4 Simple Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our guided wizard walks you through everything, building your complete marketing strategy piece by piece.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Brand Setup</h3>
              <p className="text-gray-600">
                Enter your website URL for automatic brand analysis or manually set up your brand identity, colors, and positioning.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ICP Generation</h3>
              <p className="text-gray-600">
                AI analyzes your brand to create detailed ideal customer profiles with demographics, pain points, and preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Strategy Composer</h3>
              <p className="text-gray-600">
                Generate comprehensive marketing strategies with channel recommendations, campaign ideas, and success metrics.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-pink-600">4</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Creative Generation</h3>
              <p className="text-gray-600">
                Create professional ad creatives optimized for your audience and strategy, ready to launch across platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Marketing Success
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From brand analysis to campaign launch - our AI-powered platform handles every step of your marketing journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mb-6"></div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Website Analysis</h3>
              <p className="text-sm text-purple-600 font-medium mb-4">Automatic brand extraction from any website</p>
              <p className="text-gray-600">
                Simply provide your website URL and our AI will extract brand colors, logo, messaging, 
                and positioning to create your brand profile instantly.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6"></div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered ICP</h3>
              <p className="text-sm text-green-600 font-medium mb-4">Detailed customer personas based on your brand</p>
              <p className="text-gray-600">
                Generate comprehensive ideal customer profiles with demographics, psychographics, 
                pain points, goals, and preferred communication channels.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
              <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mb-6"></div>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-200 transition-colors">
                <Palette className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Creatives</h3>
              <p className="text-sm text-pink-600 font-medium mb-4">Platform-optimized ads ready to launch</p>
              <p className="text-gray-600">
                Create stunning ad creatives optimized for LinkedIn, Facebook, Google Ads, 
                and other platforms with brand-consistent visuals and messaging.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
              <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mb-6"></div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Strategy</h3>
              <p className="text-sm text-orange-600 font-medium mb-4">Data-driven marketing strategies</p>
              <p className="text-gray-600">
                Get comprehensive marketing strategies with channel recommendations, 
                budget allocation, timeline planning, and success metrics.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
              <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-6"></div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-200 transition-colors">
                <Map className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Campaign Management</h3>
              <p className="text-sm text-cyan-600 font-medium mb-4">Organized campaign workflow</p>
              <p className="text-gray-600">
                Manage all your campaigns in one place with organized workflows, 
                reusable assets, and performance tracking.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-6"></div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Insights</h3>
              <p className="text-sm text-indigo-600 font-medium mb-4">Track and optimize campaign performance</p>
              <p className="text-gray-600">
                Monitor your campaign performance with detailed analytics, 
                conversion tracking, and optimization recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto text-center px-8 py-12 mx-4 sm:mx-6 lg:mx-8">
          <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-6">
            Ready to Build Your First Campaign?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of marketers who are already creating professional campaigns with our guided wizard.
          </p>
          <Link href="/wizard">
             <Button 
               size="xl" 
               className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
             >
               <Wand2 className="w-4 h-4 mr-2" />
               <span>Start Marketing Wizard</span>
               <ArrowRight className="w-4 h-4 ml-2" />
             </Button>
           </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold gradient-text mb-4">Vibler</h3>
            <p className="text-gray-600 mb-6">
              AI-powered marketing automation for modern businesses
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">Terms</a>
              <a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
      </main>
    </div>
  )
}
