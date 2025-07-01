'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { CheckCircle, Globe, Users, Target, Palette, ArrowRight } from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  completed: boolean;
}

export default function WizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  
  const [steps, setSteps] = useState<WizardStep[]>([
    {
      id: 'brand',
      title: 'Brand Setup',
      description: 'Connect your website or manually set up your brand identity',
      icon: <Globe className="w-6 h-6" />,
      route: '/wizard/brand',
      completed: false
    },
    {
      id: 'icp',
      title: 'ICP Generator',
      description: 'Define your Ideal Customer Profile using AI',
      icon: <Users className="w-6 h-6" />,
      route: '/wizard/icp',
      completed: false
    },
    {
      id: 'strategy',
      title: 'Strategy Composer',
      description: 'Generate a complete marketing strategy based on your brand and ICP',
      icon: <Target className="w-6 h-6" />,
      route: '/wizard/strategy',
      completed: false
    },
    {
      id: 'creative',
      title: 'Creative Generator',
      description: 'Create stunning ads tailored to your strategy and audience',
      icon: <Palette className="w-6 h-6" />,
      route: '/wizard/creative',
      completed: false
    }
  ]);

  // Calculate progress
  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  // Get next available step
  const nextStep = steps.find(step => !step.completed);

  const handleStepClick = (step: WizardStep, index: number) => {
    // Only allow clicking on current step or completed steps
    if (index === currentStep || step.completed) {
      router.push(step.route);
    }
  };

  const handleContinue = () => {
    if (nextStep) {
      router.push(nextStep.route);
    }
  };

  useEffect(() => {
    // Check completion status from localStorage or API
    const checkStepCompletion = () => {
      const brandCompleted = localStorage.getItem('wizard_brand_completed') === 'true';
      const icpCompleted = localStorage.getItem('wizard_icp_completed') === 'true';
      const strategyCompleted = localStorage.getItem('wizard_strategy_completed') === 'true';
      const creativeCompleted = localStorage.getItem('wizard_creative_completed') === 'true';

      setSteps(prevSteps => prevSteps.map((step, index) => ({
        ...step,
        completed: [brandCompleted, icpCompleted, strategyCompleted, creativeCompleted][index]
      })));

      // Set current step based on completion
      if (!brandCompleted) setCurrentStep(0);
      else if (!icpCompleted) setCurrentStep(1);
      else if (!strategyCompleted) setCurrentStep(2);
      else if (!creativeCompleted) setCurrentStep(3);
      else setCurrentStep(4); // All completed
    };

    checkStepCompletion();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Marketing Journey
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Let's build your complete marketing campaign step by step
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{completedSteps}/{steps.length} completed</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {steps.map((step, index) => (
            <Card 
              key={step.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                step.completed 
                  ? 'border-green-200 bg-green-50' 
                  : index === currentStep 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
              } ${
                index > currentStep && !step.completed ? 'opacity-60' : ''
              }`}
              onClick={() => handleStepClick(step, index)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      step.completed 
                        ? 'bg-green-100 text-green-600' 
                        : index === currentStep 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {step.completed ? <CheckCircle className="w-6 h-6" /> : step.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          step.completed 
                            ? 'bg-green-100 text-green-700' 
                            : index === currentStep 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          {step.completed ? 'Completed' : index === currentStep ? 'Current' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {(index === currentStep || step.completed) && (
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          {nextStep ? (
            <Button 
              onClick={handleContinue}
              size="lg"
              className="px-8 py-3 text-lg"
            >
              {currentStep === 0 ? 'Start Your Journey' : `Continue to ${nextStep.title}`}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600 mb-4">
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg font-semibold">Wizard Complete!</span>
              </div>
              <Button 
                onClick={() => router.push('/dashboard')}
                size="lg"
                className="px-8 py-3 text-lg mr-4"
              >
                Go to Dashboard
              </Button>
              <Button 
                onClick={() => router.push('/wizard/campaign')}
                variant="outline"
                size="lg"
                className="px-8 py-3 text-lg"
              >
                Create New Campaign
              </Button>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-16 bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 What You'll Get</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Complete brand identity analysis from your website</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>AI-powered Ideal Customer Profile generation</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Comprehensive marketing strategy tailored to your business</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Professional ad creatives optimized for your audience</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 