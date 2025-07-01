'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, Trophy, Rocket, Users, Target, Palette, ArrowRight, Download, BarChart3 } from 'lucide-react';

export default function WizardCompletePage() {
  const router = useRouter();
  const [campaignData, setCampaignData] = useState(null);
  const [stats, setStats] = useState({
    totalCreatives: 0,
    channelsSetup: 0,
    strategiesCreated: 1,
    icpDefined: 1
  });

  useEffect(() => {
    // Load completed wizard data
    const brandData = localStorage.getItem('wizard_brand_data');
    const icpData = localStorage.getItem('wizard_icp_data');
    const strategyData = localStorage.getItem('wizard_strategy_data');
    const creativeData = localStorage.getItem('wizard_creative_data');

    if (brandData && icpData && strategyData && creativeData) {
      const campaign = {
        brand: JSON.parse(brandData),
        icp: JSON.parse(icpData),
        strategy: JSON.parse(strategyData),
        creatives: JSON.parse(creativeData)
      };
      setCampaignData(campaign);
      
      setStats({
        totalCreatives: JSON.parse(creativeData).length,
        channelsSetup: JSON.parse(strategyData).targetChannels.primary.length,
        strategiesCreated: 1,
        icpDefined: 1
      });
    }
  }, []);

  const downloadCampaignReport = () => {
    if (!campaignData) return;
    
    // Create a comprehensive report
    const report = {
      ...campaignData,
      generatedAt: new Date().toISOString(),
      reportType: 'Complete Marketing Campaign Setup'
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(campaignData as any).brand.brandName}_marketing_campaign.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <Trophy className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Campaign Setup Complete!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Congratulations! Your complete marketing campaign is ready to launch.
          </p>
          
          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-green-600">{stats.icpDefined}</div>
              <div className="text-sm text-gray-600">ICP Defined</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">{stats.strategiesCreated}</div>
              <div className="text-sm text-gray-600">Strategy Created</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-purple-600">{stats.channelsSetup}</div>
              <div className="text-sm text-gray-600">Channels Setup</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-orange-600">{stats.totalCreatives}</div>
              <div className="text-sm text-gray-600">Creatives Ready</div>
            </div>
          </div>
        </div>

        {/* What You've Accomplished */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span>Brand Identity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-green-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Brand colors and identity extracted</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Industry positioning defined</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Brand keywords identified</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Users className="w-5 h-5" />
                <span>Ideal Customer Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Demographics analyzed</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Pain points identified</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Preferred channels mapped</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-800">
                <Target className="w-5 h-5" />
                <span>Marketing Strategy</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-purple-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Channel strategy developed</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Campaign recommendations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Success metrics defined</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <Palette className="w-5 h-5" />
                <span>Professional Creatives</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-orange-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Platform-specific ads generated</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Brand-consistent visuals</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Ready to launch campaigns</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Rocket className="w-5 h-5 text-blue-600" />
              <span>What's Next?</span>
            </CardTitle>
            <CardDescription>
              Your campaign is ready! Here are your recommended next steps:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Launch & Monitor</h3>
                <p className="text-sm text-gray-600">Start your campaigns and track performance using our dashboard</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Palette className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Refine Creatives</h3>
                <p className="text-sm text-gray-600">Use our creative editor to customize and optimize your ads</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Scale Success</h3>
                <p className="text-sm text-gray-600">Create new campaigns using proven strategies and audiences</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button 
            onClick={() => router.push('/dashboard')}
            size="lg"
            className="px-8 py-3"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
          
          <Button 
            onClick={() => router.push('/dashboard/creative')}
            variant="outline"
            size="lg"
            className="px-8 py-3"
          >
            <Palette className="w-4 h-4 mr-2" />
            View All Creatives
          </Button>
          
          <Button 
            onClick={downloadCampaignReport}
            variant="outline"
            size="lg"
            className="px-8 py-3"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>

        {/* Tips for Success */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-semibold mb-4">💡 Pro Tips for Campaign Success</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Test & Learn:</strong> Start with smaller budgets and scale what works best
            </div>
            <div>
              <strong>Monitor Closely:</strong> Check performance daily in the first week to optimize quickly
            </div>
            <div>
              <strong>Stay Consistent:</strong> Maintain your brand voice across all channels and campaigns
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Need help getting started? Our team is here to support your marketing success.
          </p>
          <Button variant="link" className="mt-2">
            Contact Support <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
} 