'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, ArrowRight, Users, Loader2, Wand2, CheckCircle, Download } from 'lucide-react';

interface ICPData {
  demographics: {
    ageRange: string;
    gender: string;
    income: string;
    education: string;
    location: string;
  };
  psychographics: {
    interests: string[];
    values: string[];
    lifestyle: string;
    personality: string;
  };
  behavioral: {
    buyingPatterns: string;
    brandLoyalty: string;
    decisionMaking: string;
    mediaConsumption: string[];
  };
  painPoints: string[];
  goals: string[];
  preferredChannels: string[];
  jobTitle: string;
  companySize: string;
  budget: string;
}

export default function ICPGeneratorPage() {
  const router = useRouter();
  const [step, setStep] = useState<'generate' | 'review' | 'edit'>('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [brandData, setBrandData] = useState(null);
  const [icpData, setIcpData] = useState<ICPData>({
    demographics: {
      ageRange: '',
      gender: '',
      income: '',
      education: '',
      location: ''
    },
    psychographics: {
      interests: [],
      values: [],
      lifestyle: '',
      personality: ''
    },
    behavioral: {
      buyingPatterns: '',
      brandLoyalty: '',
      decisionMaking: '',
      mediaConsumption: []
    },
    painPoints: [],
    goals: [],
    preferredChannels: [],
    jobTitle: '',
    companySize: '',
    budget: ''
  });

  useEffect(() => {
    // Load brand data from previous step
    const savedBrandData = localStorage.getItem('wizard_brand_data');
    if (savedBrandData) {
      setBrandData(JSON.parse(savedBrandData));
    } else {
      // Redirect back to brand setup if no data
      router.push('/wizard/brand');
    }
  }, [router]);

  const generateICP = async () => {
    if (!brandData) return;
    
    setIsGenerating(true);
    
    try {
      // Call the actual ICP generation API with brand data
      const response = await fetch('/api/generate-icp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandData: {
            brandName: (brandData as any).brandName,
            industry: (brandData as any).industry,
            description: (brandData as any).description,
            keywords: (brandData as any).keywords,
            logoUrl: (brandData as any).logoUrl,
            primaryColor: (brandData as any).primaryColor,
            secondaryColor: (brandData as any).secondaryColor,
            additionalContext: additionalInfo
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.details || 'Failed to generate ICP');
      }

      // Transform the API response to match our ICPData interface
      const apiICP = result.icp;
      const generatedICP: ICPData = {
        demographics: {
          ageRange: apiICP.demographics?.ageRange || 'Not specified',
          gender: apiICP.demographics?.gender || 'Mixed',
          income: apiICP.demographics?.income || 'Not specified',
          education: apiICP.demographics?.education || 'Not specified',
          location: apiICP.demographics?.location || 'Not specified'
        },
        psychographics: {
          interests: apiICP.psychographics?.interests || [],
          values: apiICP.psychographics?.values || [],
          lifestyle: apiICP.psychographics?.lifestyle || 'Not specified',
          personality: apiICP.psychographics?.personality || 'Not specified'
        },
        behavioral: {
          buyingPatterns: apiICP.buyingBehavior || 'Not specified',
          brandLoyalty: 'Moderate to high', // Default
          decisionMaking: apiICP.decisionProcess || 'Not specified',
          mediaConsumption: apiICP.communicationChannels || []
        },
        painPoints: apiICP.painPoints || [],
        goals: apiICP.goals || [],
        preferredChannels: apiICP.communicationChannels || [],
        jobTitle: apiICP.professional?.jobTitle || 'Not specified',
        companySize: apiICP.professional?.companySize || 'Not specified',
        budget: apiICP.professional?.budget || 'Not specified'
      };
      
      setIcpData(generatedICP);
      setStep('review');
    } catch (error) {
      console.error('Error generating ICP:', error);
      // Fallback to a basic ICP if API fails
      const fallbackICP: ICPData = {
        demographics: {
          ageRange: 'Analysis failed - please try again',
          gender: 'Mixed',
          income: 'Not determined',
          education: 'Not determined',
          location: 'Not determined'
        },
        psychographics: {
          interests: ['Please regenerate for specific interests'],
          values: ['Please regenerate for specific values'],
          lifestyle: 'Analysis failed - please try again',
          personality: 'Analysis failed - please try again'
        },
        behavioral: {
          buyingPatterns: 'Analysis failed - please try again',
          brandLoyalty: 'Not determined',
          decisionMaking: 'Analysis failed - please try again',
          mediaConsumption: ['Please regenerate for channels']
        },
        painPoints: ['Analysis failed - please regenerate'],
        goals: ['Analysis failed - please regenerate'],
        preferredChannels: ['Please regenerate for channels'],
        jobTitle: 'Analysis failed - please try again',
        companySize: 'Not determined',
        budget: 'Not determined'
      };
      setIcpData(fallbackICP);
      setStep('review');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveICP = () => {
    // Save to localStorage for wizard flow
    localStorage.setItem('wizard_icp_data', JSON.stringify(icpData));
    localStorage.setItem('wizard_icp_completed', 'true');
    
    // Navigate to next step
    router.push('/wizard/strategy');
  };

  const exportToPDF = async () => {
    try {
      const { exportICPToPDF } = await import('@/utils/pdfExport');
      const brandName = (brandData as any)?.brandName || 'Brand';
      await exportICPToPDF(brandName);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      // Fallback to print
      if (typeof window !== 'undefined') {
        window.print();
      }
    }
  };

  const addArrayItem = (field: string, subfield: string, value: string) => {
    if (value.trim()) {
      setIcpData(prev => {
        const updatedData = { ...prev };
        if (field === 'psychographics' && subfield === 'interests') {
          updatedData.psychographics = {
            ...updatedData.psychographics,
            interests: [...updatedData.psychographics.interests, value.trim()]
          };
        } else if (field === 'psychographics' && subfield === 'values') {
          updatedData.psychographics = {
            ...updatedData.psychographics,
            values: [...updatedData.psychographics.values, value.trim()]
          };
        }
        return updatedData;
      });
    }
  };

  const removeArrayItem = (field: string, subfield: string, index: number) => {
    setIcpData(prev => {
      const updatedData = { ...prev };
      if (field === 'psychographics' && subfield === 'interests') {
        updatedData.psychographics = {
          ...updatedData.psychographics,
          interests: updatedData.psychographics.interests.filter((_, i) => i !== index)
        };
      } else if (field === 'psychographics' && subfield === 'values') {
        updatedData.psychographics = {
          ...updatedData.psychographics,
          values: updatedData.psychographics.values.filter((_, i) => i !== index)
        };
      }
      return updatedData;
    });
  };

  if (!brandData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (step === 'generate') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/wizard')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Overview
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Generate Your Ideal Customer Profile
            </h1>
            <p className="text-gray-600">
              Based on your brand information, we'll create a detailed profile of your ideal customer.
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Brand Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Brand:</strong> {(brandData as any).brandName}</p>
                <p><strong>Industry:</strong> {(brandData as any).industry}</p>
                <p><strong>Description:</strong> {(brandData as any).description}</p>
                {(brandData as any).keywords && (brandData as any).keywords.length > 0 && (
                  <div>
                    <strong>Keywords:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(brandData as any).keywords.map((keyword: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>AI-Powered ICP Generation</span>
              </CardTitle>
              <CardDescription>
                Our AI will analyze your brand and generate a comprehensive ideal customer profile including demographics, psychographics, pain points, and preferred channels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Context (Optional)</Label>
                <Textarea
                  id="additionalInfo"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Any specific information about your target audience, market insights, or customer feedback you'd like to include..."
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={generateICP}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Your ICP...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Ideal Customer Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What We'll Generate:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Demographics (age, income, location, education)</li>
              <li>• Psychographics (interests, values, lifestyle)</li>
              <li>• Behavioral patterns (buying habits, decision-making)</li>
              <li>• Pain points and goals</li>
              <li>• Preferred communication channels</li>
              <li>• Professional context (job titles, company size)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setStep('generate')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg font-semibold">ICP Generated Successfully!</span>
              </div>
              <Button
                variant="outline"
                onClick={exportToPDF}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </Button>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Ideal Customer Profile
            </h1>
            <p className="text-gray-600">
              Review the generated profile and make any adjustments needed.
            </p>
          </div>

          <div id="icp-content" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div><strong>Age Range:</strong> {icpData.demographics.ageRange}</div>
                <div><strong>Gender:</strong> {icpData.demographics.gender}</div>
                <div><strong>Income:</strong> {icpData.demographics.income}</div>
                <div><strong>Education:</strong> {icpData.demographics.education}</div>
                <div><strong>Location:</strong> {icpData.demographics.location}</div>
              </CardContent>
            </Card>

            {/* Professional Context */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div><strong>Job Title:</strong> {icpData.jobTitle}</div>
                <div><strong>Company Size:</strong> {icpData.companySize}</div>
                <div><strong>Budget:</strong> {icpData.budget}</div>
              </CardContent>
            </Card>

            {/* Psychographics */}
            <Card>
              <CardHeader>
                <CardTitle>Psychographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <strong>Interests:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {icpData.psychographics.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">{interest}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <strong>Values:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {icpData.psychographics.values.map((value, index) => (
                      <Badge key={index} variant="secondary">{value}</Badge>
                    ))}
                  </div>
                </div>
                <div><strong>Lifestyle:</strong> {icpData.psychographics.lifestyle}</div>
                <div><strong>Personality:</strong> {icpData.psychographics.personality}</div>
              </CardContent>
            </Card>

            {/* Behavioral Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Behavioral Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div><strong>Buying Patterns:</strong> {icpData.behavioral.buyingPatterns}</div>
                <div><strong>Brand Loyalty:</strong> {icpData.behavioral.brandLoyalty}</div>
                <div><strong>Decision Making:</strong> {icpData.behavioral.decisionMaking}</div>
                <div>
                  <strong>Media Consumption:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {icpData.behavioral.mediaConsumption.map((media, index) => (
                      <Badge key={index} variant="secondary">{media}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pain Points & Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Pain Points</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {icpData.painPoints.map((pain, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{pain}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {icpData.goals.map((goal, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Preferred Channels */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Preferred Communication Channels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {icpData.preferredChannels.map((channel, index) => (
                  <Badge key={index} variant="outline" className="text-blue-600 border-blue-200">
                    {channel}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Button 
              onClick={() => setStep('edit')}
              variant="outline"
              className="flex-1"
            >
              <Users className="w-4 h-4 mr-2" />
              Edit ICP
            </Button>
            <Button 
              onClick={handleSaveICP}
              className="flex-1"
            >
              Perfect! Continue to Strategy
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Edit step would go here - simplified for now
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Edit ICP</h2>
          <p className="text-gray-600 mb-8">Detailed editing interface would go here...</p>
          <Button onClick={() => setStep('review')}>
            Back to Review
          </Button>
        </div>
      </div>
    </div>
  );
} 