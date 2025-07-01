'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, ArrowRight, Globe, Loader2, CheckCircle, Palette, Building } from 'lucide-react';

interface BrandData {
  brandName: string;
  description: string;
  industry: string;
  website: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  keywords: string[];
  tone: string;
}

export default function BrandSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'input' | 'analysis' | 'edit'>('input');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [brandData, setBrandData] = useState<BrandData>({
    brandName: '',
    description: '',
    industry: '',
    website: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    logoUrl: '',
    keywords: [],
    tone: 'professional'
  });

  const handleWebsiteAnalysis = async () => {
    if (!websiteUrl) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/extract-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website: websiteUrl })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Check if we got valid data
        if (data && !data.error) {
          setBrandData({
            brandName: data.companyName || '',
            description: data.description || '',
            industry: data.industry || '',
            website: websiteUrl,
            primaryColor: data.primaryColor || '#3B82F6',
            secondaryColor: data.secondaryColor || '#8B5CF6',
            logoUrl: data.logo || '',
            keywords: data.keywords || [],
            tone: data.tone || 'professional'
          });
          setStep('analysis');
        } else {
          console.error('API returned error:', data.error);
          // Fallback to manual entry
          setBrandData(prev => ({ ...prev, website: websiteUrl }));
          setStep('edit');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to analyze website:', errorData.error);
        // Fallback to manual entry
        setBrandData(prev => ({ ...prev, website: websiteUrl }));
        setStep('edit');
      }
    } catch (error) {
      console.error('Error analyzing website:', error);
      // Fallback to manual entry
      setBrandData(prev => ({ ...prev, website: websiteUrl }));
      setStep('edit');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualEntry = () => {
    setStep('edit');
  };

  const handleSaveBrand = () => {
    // Save to localStorage for wizard flow
    localStorage.setItem('wizard_brand_data', JSON.stringify(brandData));
    localStorage.setItem('wizard_brand_completed', 'true');
    
    // Navigate to next step
    router.push('/wizard/icp');
  };

  const addKeyword = (keyword: string) => {
    if (keyword && !brandData.keywords.includes(keyword)) {
      setBrandData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
    }
  };

  const removeKeyword = (keyword: string) => {
    setBrandData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  if (step === 'input') {
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
              Let's Set Up Your Brand
            </h1>
            <p className="text-gray-600">
              We'll analyze your website automatically, or you can enter your brand details manually.
            </p>
          </div>

          <div className="space-y-6">
            {/* Website Analysis Option */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span>Automatic Website Analysis</span>
                </CardTitle>
                <CardDescription>
                  Enter your website URL and we'll extract your brand colors, logo, and other details automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleWebsiteAnalysis}
                  disabled={!websiteUrl || isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Website...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 mr-2" />
                      Analyze Website
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Manual Entry Option */}
            <div className="text-center">
              <span className="text-gray-500">or</span>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-purple-600" />
                  <span>Manual Entry</span>
                </CardTitle>
                <CardDescription>
                  Prefer to enter your brand details manually? No problem!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleManualEntry}
                  variant="outline"
                  className="w-full"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Enter Brand Details Manually
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'analysis') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setStep('input')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center space-x-2 text-green-600 mb-4">
              <CheckCircle className="w-6 h-6" />
              <span className="text-lg font-semibold">Website Analysis Complete!</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Review Your Brand Details
            </h1>
            <p className="text-gray-600">
              We've extracted the following information from your website. You can edit any details before proceeding.
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Extracted Brand Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Display */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Logo</Label>
                <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                  {brandData.logoUrl ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center min-h-[4rem] bg-white rounded border">
                        <img 
                          src={brandData.logoUrl} 
                          alt="Brand Logo" 
                          className="max-h-16 max-w-full object-contain"
                          onError={(e) => {
                            console.error('Logo failed to load:', brandData.logoUrl);
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>';
                            (e.target as HTMLImageElement).className = 'h-16 w-16 text-gray-400';
                          }}
                          onLoad={() => {
                            console.log('Logo loaded successfully:', brandData.logoUrl);
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 break-all text-center">{brandData.logoUrl}</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center min-h-[4rem] bg-white rounded border text-gray-400">
                      <div className="text-center">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                        <p className="text-xs">No logo detected</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Brand Name</Label>
                  <p className="text-gray-900">{brandData.brandName || 'Not detected'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Industry</Label>
                  <p className="text-gray-900">{brandData.industry || 'Not detected'}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <p className="text-gray-900">{brandData.description || 'Not detected'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: brandData.primaryColor }}
                    />
                    <span className="text-gray-900">{brandData.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Secondary Color</Label>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: brandData.secondaryColor }}
                    />
                    <span className="text-gray-900">{brandData.secondaryColor}</span>
                  </div>
                </div>
              </div>

              {brandData.keywords.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Keywords</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {brandData.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Button 
              onClick={() => setStep('edit')}
              variant="outline"
              className="flex-1"
            >
              <Palette className="w-4 h-4 mr-2" />
              Edit Details
            </Button>
            <Button 
              onClick={handleSaveBrand}
              className="flex-1"
            >
              Looks Good! Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Edit step
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => step === 'edit' && brandData.brandName ? setStep('analysis') : setStep('input')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enter Your Brand Details
          </h1>
          <p className="text-gray-600">
            Fill in your brand information to personalize your marketing campaigns.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Brand Information</CardTitle>
            <CardDescription>
              This information will be used throughout your marketing campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name *</Label>
                <Input
                  id="brandName"
                  value={brandData.brandName}
                  onChange={(e) => setBrandData(prev => ({ ...prev, brandName: e.target.value }))}
                  placeholder="Your Company Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  value={brandData.industry}
                  onChange={(e) => setBrandData(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="e.g., Technology, Healthcare"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={brandData.description}
                onChange={(e) => setBrandData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of your company and what you do..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  value={brandData.website}
                  onChange={(e) => setBrandData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={brandData.logoUrl}
                  onChange={(e) => setBrandData(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://yourwebsite.com/logo.png"
                />
              </div>
            </div>

            {/* Logo Upload and Preview */}
            <div className="space-y-2">
              <Label>Brand Logo</Label>
              <div className="space-y-3">
                {/* Current logo display */}
                {brandData.logoUrl && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-center min-h-[4rem] bg-white rounded border mb-2">
                      <img 
                        src={brandData.logoUrl} 
                        alt="Current Logo" 
                        className="max-h-16 max-w-full object-contain"
                        onError={(e) => {
                          console.error('Logo failed to load in edit mode:', brandData.logoUrl);
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>';
                          (e.target as HTMLImageElement).className = 'h-16 w-16 text-gray-400';
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center">Current logo</p>
                  </div>
                )}
                
                {/* Upload new logo */}
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Convert to base64 for preview
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result as string;
                          setBrandData(prev => ({ ...prev, logoUrl: result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {brandData.logoUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBrandData(prev => ({ ...prev, logoUrl: '' }))}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                
                {/* Manual URL input */}
                <div className="text-sm text-gray-600">
                  <span>Or enter logo URL:</span>
                  <Input
                    type="url"
                    value={brandData.logoUrl.startsWith('data:') ? '' : brandData.logoUrl}
                    onChange={(e) => setBrandData(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://yourwebsite.com/logo.png"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={brandData.primaryColor}
                    onChange={(e) => setBrandData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <Input
                    value={brandData.primaryColor}
                    onChange={(e) => setBrandData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={brandData.secondaryColor}
                    onChange={(e) => setBrandData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <Input
                    value={brandData.secondaryColor}
                    onChange={(e) => setBrandData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    placeholder="#8B5CF6"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Brand Keywords</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Add a keyword and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword(e.currentTarget.value.trim());
                      e.currentTarget.value = '';
                    }
                  }}
                />
                {brandData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {brandData.keywords.map((keyword, index) => (
                      <button
                        key={index}
                        onClick={() => removeKeyword(keyword)}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                      >
                        {keyword} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button 
            onClick={handleSaveBrand}
            disabled={!brandData.brandName || !brandData.description || !brandData.industry}
            className="w-full"
            size="lg"
          >
            Save & Continue to ICP Generator
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
} 