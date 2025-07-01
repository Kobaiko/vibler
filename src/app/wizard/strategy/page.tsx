'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, ArrowRight, Target, Loader2, Wand2, CheckCircle, Calendar, DollarSign, Users, TrendingUp, Download } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import type { CompleteStrategy } from '@/types/strategy';

interface StrategyData {
  overview: {
    objective: string;
    timeline: string;
    budget: string;
    kpis: string[];
  };
  targetChannels: {
    primary: string[];
    secondary: string[];
    reasoning: string;
  };
  contentStrategy: {
    themes: string[];
    contentTypes: string[];
    postingFrequency: string;
    tone: string;
  };
  campaignRecommendations: {
    name: string;
    platform: string;
    objective: string;
    audience: string;
    budget: string;
    duration: string;
    keyMessages: string[];
    explanation?: string;
  }[];
  timeline: {
    phase: string;
    duration: string;
    activities: string[];
    deliverables: string[];
  }[];
  success_metrics: {
    awareness: string[];
    engagement: string[];
    conversion: string[];
    retention: string[];
  };
}

export default function StrategyComposerPage() {
  const router = useRouter();
  const [step, setStep] = useState<'generate' | 'review'>('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [brandData, setBrandData] = useState(null);
  const [icpData, setIcpData] = useState(null);
  const [marketingBudget, setMarketingBudget] = useState('');
  const [strategyData, setStrategyData] = useState<StrategyData | null>(null);

  useEffect(() => {
    // Load data from previous steps
    const savedBrandData = localStorage.getItem('wizard_brand_data');
    const savedIcpData = localStorage.getItem('wizard_icp_data');
    
    if (savedBrandData && savedIcpData) {
      setBrandData(JSON.parse(savedBrandData));
      setIcpData(JSON.parse(savedIcpData));
    } else {
      // Redirect back if missing data
      router.push('/wizard');
    }
  }, [router]);

  const generateAICampaigns = async (brandData: any, icpData: any, marketingBudget: string) => {
    try {
      const response = await fetch('/api/strategy/generate-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandData,
          icpData,
          marketingBudget
        }),
      });

      if (!response.ok) {
        throw new Error('Campaign generation failed');
      }

      const result = await response.json();
      
      if (result.success && result.campaigns) {
        return result.campaigns;
      }
      
      throw new Error('Invalid campaign response');
    } catch (error) {
      console.error('Error generating AI campaigns:', error);
      
      // Fallback campaigns
      const budgetValue = parseInt(marketingBudget);
      return [
        {
          name: "Lead Generation Campaign",
          platform: "LinkedIn",
          objective: "Generate qualified leads and build brand awareness",
          audience: icpData.jobTitle || "Business professionals",
          budget: `$${Math.round(budgetValue * 0.5).toLocaleString()}/month`,
          duration: "3 months",
          keyMessages: ["Industry expertise", "Proven results", "Trusted partner"],
          explanation: "LinkedIn is ideal for B2B lead generation with professional targeting options. This budget allocation focuses on the highest-converting platform for business audiences."
        },
        {
          name: "Brand Awareness Campaign", 
          platform: brandData.industry?.toLowerCase().includes('tech') ? "Twitter/X" : "Facebook",
          objective: "Build brand recognition and thought leadership",
          audience: `${icpData.demographics?.ageRange || 'Professional'} ${brandData.industry} professionals`,
          budget: `$${Math.round(budgetValue * 0.3).toLocaleString()}/month`,
          duration: "3 months",
          keyMessages: ["Innovation leader", "Customer success", "Market expertise"],
          explanation: "This platform reaches a broader audience to build brand recognition. The lower budget allocation maximizes reach while maintaining cost efficiency."
        },
        {
          name: "Retargeting Campaign",
          platform: "Google Ads", 
          objective: "Convert warm prospects and website visitors",
          audience: "Website visitors and email subscribers",
          budget: `$${Math.round(budgetValue * 0.2).toLocaleString()}/month`,
          duration: "3 months",
          keyMessages: ["Solution focused", "Quality delivery", "Growth partner"],
          explanation: "Google Ads retargeting converts high-intent visitors at lower cost. This smaller budget allocation targets the highest-converting audience segment."
        }
      ];
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    
    if (platformLower.includes('linkedin')) {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0077B5">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    }
    
    if (platformLower.includes('facebook')) {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    }
    
    if (platformLower.includes('instagram')) {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="url(#instagram-gradient)">
          <defs>
            <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f09433" />
              <stop offset="25%" stopColor="#e6683c" />
              <stop offset="50%" stopColor="#dc2743" />
              <stop offset="75%" stopColor="#cc2366" />
              <stop offset="100%" stopColor="#bc1888" />
            </linearGradient>
          </defs>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    }
    
    if (platformLower.includes('twitter') || platformLower.includes('x')) {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    }
    
    if (platformLower.includes('google')) {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      );
    }
    
    if (platformLower.includes('youtube')) {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FF0000">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    }
    
    if (platformLower.includes('tiktok')) {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      );
    }
    
    if (platformLower.includes('email')) {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#6B7280">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      );
    }
    
    // Default platform icon
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#6B7280">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    );
  };

  const normalizeBudget = (budgetInput: string) => {
    // Remove all non-numeric characters except decimals and commas
    const cleaned = budgetInput.replace(/[^0-9.,kK]/g, '');
    
    // Handle 'k' notation (e.g., 5k = 5000)
    if (cleaned.toLowerCase().includes('k')) {
      const number = parseFloat(cleaned.replace(/[kK,]/g, ''));
      return isNaN(number) ? 5000 : number * 1000;
    }
    
    // Handle comma-separated numbers (e.g., 25,000)
    const number = parseFloat(cleaned.replace(/,/g, ''));
    return isNaN(number) ? 5000 : number;
  };

  const generateStrategy = async () => {
    if (!brandData || !icpData || !marketingBudget.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/strategy/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate a comprehensive marketing strategy for ${(brandData as any).brandName} in the ${(brandData as any).industry} industry. ${(brandData as any).description}`,
          businessType: (brandData as any).industry,
          targetMarket: `${(icpData as any).demographics?.ageRange || ''} ${(icpData as any).demographics?.income || ''} ${(icpData as any).jobTitle || ''}`.trim(),
          budget: (icpData as any).budget || 'Not specified',
          timeline: '3-6 months',
          userId: 'wizard-user',
          icpContext: `Target Customer: ${(icpData as any).jobTitle || ''}, Pain Points: ${(icpData as any).painPoints?.join(', ') || ''}, Goals: ${(icpData as any).goals?.join(', ') || ''}`
        }),
      });

      if (!response.ok) {
        throw new Error(`Strategy API failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.strategy) {
        // Convert CompleteStrategy to StrategyData format for the UI
        const convertedStrategy: StrategyData = {
          overview: {
            objective: result.strategy.description || `Drive brand awareness for ${(brandData as any).brandName}`,
            timeline: result.strategy.metadata?.timeline || '3-6 months',
            budget: `$${normalizeBudget(marketingBudget).toLocaleString()}`,
            kpis: result.strategy.successMetrics?.map((m: any) => m.name || m.metric) || ['Lead Quality Score', 'Cost per Acquisition', 'Brand Awareness', 'Conversion Rate']
          },
          targetChannels: {
            primary: result.strategy.channels?.slice(0, 3).map((c: any) => c.name || c.channel) || ['LinkedIn', 'Google Ads', 'Email Marketing'],
            secondary: result.strategy.channels?.slice(3).map((c: any) => c.name || c.channel) || ['Content Marketing', 'Social Media'],
            reasoning: result.strategy.competitiveAnalysis?.opportunities?.[0] || `Selected based on ${(brandData as any).industry} industry best practices.`
          },
          contentStrategy: {
            themes: result.strategy.messagingPillars?.map((p: any) => p.title) || ['Industry Expertise', 'Customer Success', 'Innovation'],
            contentTypes: ['Blog Posts', 'Case Studies', 'Videos', 'Infographics'],
            postingFrequency: '3-4 posts per week',
            tone: (brandData as any).tone || 'Professional, helpful, authoritative'
          },
          campaignRecommendations: await generateAICampaigns(brandData, icpData, normalizeBudget(marketingBudget).toString()),
          timeline: result.strategy.timeline?.map((phase: any) => ({
            phase: phase.phase || phase.name,
            duration: phase.duration || '4 weeks',
            activities: phase.activities || [],
            deliverables: phase.deliverables || []
          })) || [
            {
              phase: 'Setup & Launch',
              duration: '4 weeks',
              activities: ['Campaign setup', 'Content creation', 'Audience targeting'],
              deliverables: ['Campaign assets', 'Landing pages', 'Tracking setup']
            }
          ],
          success_metrics: {
            awareness: result.strategy.successMetrics?.filter((m: any) => m.category === 'awareness')?.map((m: any) => m.name) || ['Brand search volume', 'Website traffic'],
            engagement: result.strategy.successMetrics?.filter((m: any) => m.category === 'engagement')?.map((m: any) => m.name) || ['Click-through rates', 'Social engagement'],
            conversion: result.strategy.successMetrics?.filter((m: any) => m.category === 'conversion')?.map((m: any) => m.name) || ['Lead generation rate', 'Cost per lead'],
            retention: result.strategy.successMetrics?.filter((m: any) => m.category === 'retention')?.map((m: any) => m.name) || ['Customer acquisition', 'Repeat engagement']
          }
        };
        
        setStrategyData(convertedStrategy);
        setStep('review');
        return;
      }
      
      throw new Error('Invalid strategy response');
    } catch (error) {
      console.log('Using fallback strategy generation:', error instanceof Error ? error.message : 'Using fallback');
      // Generate intelligent fallback strategy based on brand and ICP data
      const brandName = (brandData as any).brandName || 'Your Brand';
      const industry = (brandData as any).industry || 'Business';
      const jobTitle = (icpData as any).jobTitle || 'Professionals';
      // Normalize and validate the budget
      const budgetValue = normalizeBudget(marketingBudget);
      
      console.log('Budget processing:', { 
        originalInput: marketingBudget,
        normalizedBudget: budgetValue
      });
      const preferredChannels = (icpData as any).preferredChannels || [];
      
      // Select channels based on industry and ICP preferences
      const getIndustryChannels = (industry: string, preferredChannels: string[]) => {
        const techChannels = ['LinkedIn', 'Google Ads', 'Twitter/X', 'Technical Blogs'];
        const businessChannels = ['LinkedIn', 'Email Marketing', 'Google Ads', 'Industry Events'];
        const consumerChannels = ['Facebook', 'Instagram', 'Google Ads', 'Influencer Marketing'];
        const healthChannels = ['LinkedIn', 'Medical Publications', 'Google Ads', 'Professional Networks'];
        
        let baseChannels: string[];
        if (industry.toLowerCase().includes('tech') || industry.toLowerCase().includes('software')) {
          baseChannels = techChannels;
        } else if (industry.toLowerCase().includes('health') || industry.toLowerCase().includes('medical')) {
          baseChannels = healthChannels;
        } else if (industry.toLowerCase().includes('consumer') || industry.toLowerCase().includes('retail')) {
          baseChannels = consumerChannels;
        } else {
          baseChannels = businessChannels;
        }
        
        // Prioritize preferred channels if they exist
        if (preferredChannels.length > 0) {
          const prioritized = preferredChannels.filter(ch => baseChannels.includes(ch));
          const remaining = baseChannels.filter(ch => !preferredChannels.includes(ch));
          return [...prioritized, ...remaining.slice(0, 3 - prioritized.length)];
        }
        
        return baseChannels.slice(0, 3);
      };
      
      const primaryChannels = getIndustryChannels(industry, preferredChannels);
      
      const fallbackStrategy: StrategyData = {
        overview: {
          objective: `Drive brand awareness and generate qualified leads for ${brandName} in the ${industry} market`,
          timeline: '3-6 months',
          budget: `$${budgetValue.toLocaleString()}`,
          kpis: ['Lead Quality Score', 'Cost per Acquisition', 'Brand Awareness', 'Conversion Rate']
        },
        targetChannels: {
          primary: primaryChannels,
          secondary: ['Content Marketing', 'Partnerships', 'Referral Programs'],
          reasoning: `Selected based on ${industry} industry best practices and target audience of ${jobTitle}.`
        },
        contentStrategy: {
          themes: ['Industry Expertise', 'Customer Success', 'Innovation', 'Thought Leadership'],
          contentTypes: ['Blog Posts', 'Case Studies', 'Videos', 'Infographics'],
          postingFrequency: '3-4 posts per week',
          tone: 'Professional, helpful, authoritative'
        },
        campaignRecommendations: await generateAICampaigns(brandData, icpData, budgetValue.toString()),
        timeline: [
          {
            phase: 'Setup & Launch',
            duration: '4 weeks',
            activities: ['Campaign setup', 'Content creation', 'Audience targeting'],
            deliverables: ['Campaign assets', 'Landing pages', 'Tracking setup']
          },
          {
            phase: 'Optimization',
            duration: '8 weeks',
            activities: ['Performance monitoring', 'A/B testing', 'Budget optimization'],
            deliverables: ['Performance reports', 'Optimized campaigns', 'ROI analysis']
          }
        ],
        success_metrics: {
          awareness: ['Brand search volume', 'Website traffic', 'Social mentions'],
          engagement: ['Click-through rates', 'Social engagement', 'Content shares'],
          conversion: ['Lead generation rate', 'Cost per lead', 'Quality scores'],
          retention: ['Customer acquisition', 'Repeat engagement', 'Referral rates']
        }
      };
      
      console.log('Generated fallback strategy:', fallbackStrategy);
      console.log('Campaign budgets:', fallbackStrategy.campaignRecommendations.map(c => c.budget));
      setStrategyData(fallbackStrategy);
      setStep('review');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveStrategy = async () => {
    // Save to localStorage for wizard flow
    localStorage.setItem('wizard_strategy_data', JSON.stringify(strategyData));
    localStorage.setItem('wizard_strategy_completed', 'true');
    
    // Generate a complete strategy with taglines for the creative generator using smart fallback
    try {
      console.log('Generating complete strategy with fallback approach...');
             // Generate industry-specific taglines based on brand data
       const generateIndustryTaglines = (industry: string, brandName: string) => {
         const baseTaglines = ['Excellence delivered', 'Your success partner', 'Results that matter'];
         
         if (industry?.toLowerCase().includes('tech') || industry?.toLowerCase().includes('software') || industry?.toLowerCase().includes('ai')) {
           return ['Innovation unleashed', 'Smart solutions', 'Tech made simple', 'Future-ready', 'Code to success', 'Digital excellence'];
         } else if (industry?.toLowerCase().includes('marketing') || industry?.toLowerCase().includes('advertising')) {
           return ['Growth accelerated', 'Brands amplified', 'Success stories', 'Market leaders', 'Growth partners', 'Results delivered'];
         } else if (industry?.toLowerCase().includes('consulting') || industry?.toLowerCase().includes('business')) {
           return ['Strategy perfected', 'Business elevated', 'Success achieved', 'Growth unlocked', 'Excellence delivered', 'Solutions focused'];
         } else if (industry?.toLowerCase().includes('health') || industry?.toLowerCase().includes('medical')) {
           return ['Health transformed', 'Care reimagined', 'Wellness delivered', 'Better health', 'Care excellence', 'Health first'];
         } else if (industry?.toLowerCase().includes('finance') || industry?.toLowerCase().includes('banking')) {
           return ['Wealth secured', 'Financial freedom', 'Smart investing', 'Future secured', 'Money matters', 'Financial success'];
         } else if (industry?.toLowerCase().includes('education') || industry?.toLowerCase().includes('learning')) {
           return ['Knowledge unlocked', 'Learning reimagined', 'Education evolved', 'Skills mastered', 'Future learners', 'Growth mindset'];
         } else {
           return baseTaglines;
         }
       };

       const industryTaglines = generateIndustryTaglines((brandData as any).industry, (brandData as any).brandName);
       
       // Fallback with industry-specific taglines
       const fallbackCompleteStrategy: CompleteStrategy = {
         id: crypto.randomUUID(),
         title: 'Marketing Strategy',
         description: strategyData?.overview?.objective || 'Drive brand awareness',
         originalPrompt: `Strategy for ${(brandData as any).brandName}`,
         userId: 'wizard-user',
         channels: [],
         messagingPillars: [
           {
             title: 'Brand Awareness',
             description: 'Build recognition and trust',
             keyMessages: ['Professional service', 'Proven results', 'Customer focused'],
             taglines: industryTaglines.slice(0, 3),
             targetAudience: 'Business professionals',
             channels: ['LinkedIn', 'Email']
           },
           {
             title: 'Value Proposition',
             description: 'Highlight unique benefits',
             keyMessages: ['Innovative solutions', 'Cost effective', 'Fast delivery'],
             taglines: industryTaglines.slice(3, 6),
             targetAudience: 'Decision makers',
             channels: ['Google Ads', 'Social Media']
           }
         ],
        timeline: [],
        budget: {
          totalBudget: 10000,
          currency: 'USD',
          channels: {},
          contingency: 1000,
          timeline: '3 months'
        },
        competitiveAnalysis: {
          competitors: [],
          opportunities: [],
          threats: [],
          differentiators: []
        },
        riskAssessment: [],
        successMetrics: [],
        recommendations: [],
        metadata: {
          businessType: (brandData as any).industry || 'Business',
          industry: (brandData as any).industry || 'General',
          targetMarket: 'Business professionals',
          budget: '$10,000',
          timeline: '3 months'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('wizard_complete_strategy_data', JSON.stringify(fallbackCompleteStrategy));
    } catch (error) {
      console.error('Error saving complete strategy:', error);
      // Continue anyway as the main strategy was saved
    }
    
    // Navigate to next step
    router.push('/wizard/creative');
  };

  const exportToPDF = async () => {
    try {
      const { exportStrategyToPDF } = await import('@/utils/pdfExport');
      const brandName = (brandData as any)?.brandName || 'Brand';
      await exportStrategyToPDF(brandName);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      // Fallback to print
      if (typeof window !== 'undefined') {
        window.print();
      }
    }
  };

  if (!brandData || !icpData) {
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
              Compose Your Marketing Strategy
            </h1>
            <p className="text-gray-600">
              We'll create a comprehensive marketing strategy based on your brand and ideal customer profile.
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Brand Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Brand:</strong> {(brandData as any).brandName}</p>
                  <p><strong>Industry:</strong> {(brandData as any).industry}</p>
                  <p><strong>Description:</strong> {(brandData as any).description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Target Audience Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Demographics:</strong> {(icpData as any).demographics.ageRange}, {(icpData as any).demographics.income}</p>
                  <p><strong>Job Title:</strong> {(icpData as any).jobTitle}</p>
                  <p><strong>Key Pain Points:</strong> {(icpData as any).painPoints.slice(0, 2).join(', ')}</p>
                  <div>
                    <strong>Preferred Channels:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(icpData as any).preferredChannels.slice(0, 3).map((channel: string, index: number) => (
                        <Badge key={index} variant="secondary">{channel}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>AI Strategy Generation</span>
              </CardTitle>
              <CardDescription>
                Our AI will analyze your brand and ICP to create a comprehensive marketing strategy including channel recommendations, campaign ideas, timelines, and success metrics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="marketingBudget">Monthly Marketing Budget</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="marketingBudget"
                    type="text"
                    value={marketingBudget}
                    onChange={(e) => setMarketingBudget(e.target.value)}
                    placeholder="e.g., 5000, 10k, 25,000"
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Enter your monthly marketing budget (e.g., "5000", "10k", "$25,000"). This helps us create realistic campaign recommendations and budget allocation.
                </p>
              </div>
              
              <Button 
                onClick={generateStrategy}
                disabled={isGenerating || !marketingBudget.trim()}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Composing Your Strategy...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Marketing Strategy
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Your Strategy Will Include:</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Channel prioritization and reasoning</li>
              <li>• Specific campaign recommendations with budgets</li>
              <li>• Content strategy and themes</li>
              <li>• 3-6 month implementation timeline</li>
              <li>• Success metrics and KPIs</li>
              <li>• Platform-specific tactical recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Review step
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
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
              <span className="text-lg font-semibold">Strategy Generated Successfully!</span>
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
            Your Marketing Strategy
          </h1>
          <p className="text-gray-600">
            A comprehensive plan tailored to your brand and ideal customer profile.
          </p>
        </div>

        {strategyData && (
          <div id="strategy-content" className="space-y-8">
            {/* Strategy Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Strategy Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Objective</h4>
                  <p className="text-gray-600">{strategyData.overview.objective}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Timeline</span>
                  </h4>
                  <p className="text-gray-600">{strategyData.overview.timeline}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>Budget Range</span>
                  </h4>
                  <p className="text-gray-600">{strategyData.overview.budget}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Key KPIs</span>
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {strategyData.overview.kpis.map((kpi, index) => (
                      <Badge key={index} variant="outline">{kpi}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Channel Strategy */}
            <Card>
              <CardHeader>
                <CardTitle>Channel Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Primary Channels</h4>
                    <div className="space-y-2">
                      {strategyData.targetChannels.primary.map((channel, index) => (
                        <Badge key={index} className="mr-2">{channel}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Secondary Channels</h4>
                    <div className="space-y-2">
                      {strategyData.targetChannels.secondary.map((channel, index) => (
                        <Badge key={index} variant="outline" className="mr-2">{channel}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Channel Reasoning</h4>
                  <p className="text-gray-600">{strategyData.targetChannels.reasoning}</p>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {strategyData.campaignRecommendations.map((campaign, index) => (
                    <Card key={index} className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          {getPlatformIcon(campaign.platform)}
                          <Badge variant="outline">{campaign.platform}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <strong>Objective:</strong>
                          <p className="text-sm text-gray-600">{campaign.objective}</p>
                        </div>
                        <div>
                          <strong>Budget:</strong> {campaign.budget}
                        </div>
                        <div>
                          <strong>Duration:</strong> {campaign.duration}
                        </div>
                        <div>
                          <strong>Key Messages:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {campaign.keyMessages.map((message, msgIndex) => (
                              <Badge key={msgIndex} variant="secondary" className="text-xs">
                                {message}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {campaign.explanation && (
                          <div>
                            <strong>Why this campaign works:</strong>
                            <p className="text-sm text-gray-600 mt-1">{campaign.explanation}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Implementation Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Implementation Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {strategyData.timeline.map((phase, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-lg">{phase.phase}</h4>
                      <p className="text-gray-600 mb-3">Duration: {phase.duration}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <strong>Key Activities:</strong>
                          <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                            {phase.activities.map((activity, actIndex) => (
                              <li key={actIndex}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong>Deliverables:</strong>
                          <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                            {phase.deliverables.map((deliverable, delIndex) => (
                              <li key={delIndex}>{deliverable}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Success Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Success Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-blue-600">Awareness</h4>
                    <ul className="text-sm space-y-1">
                      {strategyData.success_metrics.awareness.map((metric, index) => (
                        <li key={index}>• {metric}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-green-600">Engagement</h4>
                    <ul className="text-sm space-y-1">
                      {strategyData.success_metrics.engagement.map((metric, index) => (
                        <li key={index}>• {metric}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-orange-600">Conversion</h4>
                    <ul className="text-sm space-y-1">
                      {strategyData.success_metrics.conversion.map((metric, index) => (
                        <li key={index}>• {metric}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-purple-600">Retention</h4>
                    <ul className="text-sm space-y-1">
                      {strategyData.success_metrics.retention.map((metric, index) => (
                        <li key={index}>• {metric}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8 text-center space-x-4">
          <Button 
            onClick={() => {
              // Clear the cache and regenerate
              localStorage.removeItem('wizard_strategy_data');
              setStep('generate');
              setStrategyData(null);
            }}
            variant="outline"
            size="lg"
            className="px-8 py-3"
          >
            Regenerate Strategy
          </Button>
          <Button 
            onClick={handleSaveStrategy}
            size="lg"
            className="px-8 py-3"
          >
            Perfect! Let's Create Some Ads
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
} 