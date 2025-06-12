import Link from 'next/link'
import { Button, Card, CardHeader, CardContent } from '@/components/ui'
import { Header } from '@/components/navigation'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <Header />

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-display font-bold text-secondary-900 mb-6">
              Transform Ideas into
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500"> 
                {" "}Marketing Funnels
              </span>
            </h1>
            <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
              Vibler uses AI to convert your simple prompts into comprehensive marketing strategies, 
              complete with customer personas, creative content, and visual funnel maps.
            </p>
                         <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link href="/signup">
                 <Button size="lg" className="shadow-lg">
                   Start Building Your Funnel
                 </Button>
               </Link>
               <Button variant="outline" size="lg">
                 Watch Demo
               </Button>
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-secondary-900 mb-4">
              Everything You Need to Build Winning Funnels
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              From prompt to profit - our AI-powered platform handles every step of your marketing funnel creation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
              <CardHeader
                title="Prompt-to-Funnel Engine"
                subtitle="Transform natural language into complete marketing strategies"
              />
              <CardContent>
                <p className="text-secondary-600">
                  Simply describe your product or service, and our AI will generate a comprehensive 
                  marketing funnel with all the components you need to succeed.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
              <CardHeader
                title="ICP Generator"
                subtitle="Create detailed customer personas instantly"
              />
              <CardContent>
                <p className="text-secondary-600">
                  Generate ideal customer profiles with demographics, psychographics, pain points, 
                  and motivations based on your business description.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
              <CardHeader
                title="Creative Generator"
                subtitle="AI-powered ad copy and visual content"
              />
              <CardContent>
                <p className="text-secondary-600">
                  Create compelling ad copy, email sequences, landing page content, and visual 
                  assets tailored to your audience and brand voice.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
              <CardHeader
                title="Strategy Composer"
                subtitle="Comprehensive marketing strategy planning"
              />
              <CardContent>
                <p className="text-secondary-600">
                  Build complete marketing strategies with channel recommendations, budget allocation, 
                  and timeline planning for maximum ROI.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
              <CardHeader
                title="Funnel Mapper"
                subtitle="Visual funnel builder and optimization"
              />
              <CardContent>
                <p className="text-secondary-600">
                  Create and visualize your marketing funnels with drag-and-drop simplicity. 
                  Track performance and optimize for better conversions.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
              <CardHeader
                title="Analytics Dashboard"
                subtitle="Real-time performance tracking"
              />
              <CardContent>
                <p className="text-secondary-600">
                  Monitor KPIs, track conversions, and gain insights into your funnel performance 
                  with comprehensive analytics and reporting.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-6">
            Ready to Transform Your Marketing?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of marketers who are already building better funnels with Vibler.
          </p>
                     <Link href="/signup">
             <Button 
               size="xl" 
               variant="secondary"
               className="shadow-xl hover:shadow-2xl transform hover:scale-105"
             >
               Start Your Free Trial
             </Button>
           </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-display font-bold mb-4">Vibler</h3>
            <p className="text-secondary-400 mb-6">
              AI-powered marketing automation for modern businesses
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-secondary-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-secondary-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-secondary-400 hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
