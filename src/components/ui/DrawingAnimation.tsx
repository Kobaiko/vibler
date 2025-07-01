'use client';

import React, { useState, useEffect } from 'react';

interface DrawingAnimationProps {
  className?: string;
}

const GENERATION_STEPS = [
  {
    title: "Analyzing your brand...",
    subtitle: "Understanding your unique value proposition",
    duration: 3000,
    icon: "🔍"
  },
  {
    title: "Writing your creative copy...",
    subtitle: "Crafting compelling headlines and descriptions",
    duration: 8000,
    icon: "✍️"
  },
  {
    title: "Generating your images...",
    subtitle: "Creating stunning visuals with AI",
    duration: 15000,
    icon: "🎨"
  },
  {
    title: "Optimizing for each platform...",
    subtitle: "Adapting content for different ad formats",
    duration: 8000,
    icon: "📱"
  },
  {
    title: "Putting everything together...",
    subtitle: "Finalizing your professional creatives",
    duration: 10000,
    icon: "✨"
  },
  {
    title: "Almost ready!",
    subtitle: "Adding the finishing touches",
    duration: 5000,
    icon: "🚀"
  }
];

export const DrawingAnimation: React.FC<DrawingAnimationProps> = ({ className = "" }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  useEffect(() => {
    let stepTimer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;
    
    const startStep = (stepIndex: number) => {
      if (stepIndex >= GENERATION_STEPS.length) {
        // Loop back to first step if we've gone through all
        setCurrentStep(0);
        setProgress(0);
        setStepProgress(0);
        startStep(0);
        return;
      }

      setCurrentStep(stepIndex);
      setStepProgress(0);
      
      const step = GENERATION_STEPS[stepIndex];
      const stepDuration = step.duration;
      const progressInterval = 50; // Update every 50ms
      const progressIncrement = (progressInterval / stepDuration) * 100;
      
      progressTimer = setInterval(() => {
        setStepProgress(prev => {
          const newProgress = Math.min(prev + progressIncrement, 100);
          return newProgress;
        });
      }, progressInterval);
      
      stepTimer = setTimeout(() => {
        clearInterval(progressTimer);
        setProgress(prev => Math.min(prev + (100 / GENERATION_STEPS.length), 100));
        startStep(stepIndex + 1);
      }, stepDuration);
    };

    startStep(0);

    return () => {
      clearTimeout(stepTimer);
      clearInterval(progressTimer);
    };
  }, []);

  const currentStepData = GENERATION_STEPS[currentStep];

  return (
    <div className={`flex flex-col items-center justify-center space-y-6 ${className}`}>
      {/* Main Animation Area */}
      <div className="relative w-40 h-40">
        {/* Canvas/paper background */}
        <div className="absolute inset-0 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Animated drawing lines that change based on step */}
          <svg className="w-full h-full" viewBox="0 0 160 160">
            {/* Background grid */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f8fafc" strokeWidth="0.5"/>
              </pattern>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <rect width="160" height="160" fill="url(#grid)" />
            
            {/* Step-specific animations */}
            {currentStep === 0 && (
              // Analyzing - magnifying glass effect
              <>
                <circle
                  cx="80"
                  cy="80"
                  r="25"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="157"
                  strokeDashoffset="157"
                  style={{
                    animation: 'drawCircle 2s ease-in-out infinite'
                  }}
                />
                <line
                  x1="100"
                  y1="100"
                  x2="120"
                  y2="120"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="28"
                  strokeDashoffset="28"
                  style={{
                    animation: 'drawLine 2s ease-in-out 0.5s infinite'
                  }}
                />
              </>
            )}
            
            {currentStep === 1 && (
              // Writing - text lines
              <>
                <line x1="30" y1="50" x2="130" y2="50" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"
                      strokeDasharray="100" strokeDashoffset="100" style={{ animation: 'drawLine 1.5s ease-in-out infinite' }} />
                <line x1="30" y1="70" x2="110" y2="70" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"
                      strokeDasharray="80" strokeDashoffset="80" style={{ animation: 'drawLine 1.5s ease-in-out 0.3s infinite' }} />
                <line x1="30" y1="90" x2="120" y2="90" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"
                      strokeDasharray="90" strokeDashoffset="90" style={{ animation: 'drawLine 1.5s ease-in-out 0.6s infinite' }} />
                <line x1="30" y1="110" x2="100" y2="110" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"
                      strokeDasharray="70" strokeDashoffset="70" style={{ animation: 'drawLine 1.5s ease-in-out 0.9s infinite' }} />
              </>
            )}
            
            {currentStep === 2 && (
              // Generating images - palette and brush
              <>
                <rect x="40" y="40" width="80" height="60" rx="8" fill="none" stroke="#ec4899" strokeWidth="2"
                      strokeDasharray="280" strokeDashoffset="280" style={{ animation: 'drawRect 2s ease-in-out infinite' }} />
                <circle cx="60" cy="70" r="8" fill="#3b82f6" opacity="0.7" style={{ animation: 'fadeIn 2s ease-in-out 0.5s infinite' }} />
                <circle cx="80" cy="70" r="8" fill="#8b5cf6" opacity="0.7" style={{ animation: 'fadeIn 2s ease-in-out 0.7s infinite' }} />
                <circle cx="100" cy="70" r="8" fill="#ec4899" opacity="0.7" style={{ animation: 'fadeIn 2s ease-in-out 0.9s infinite' }} />
              </>
            )}
            
            {currentStep === 3 && (
              // Optimizing - multiple device frames
              <>
                <rect x="30" y="40" width="30" height="50" rx="4" fill="none" stroke="#10b981" strokeWidth="2"
                      strokeDasharray="160" strokeDashoffset="160" style={{ animation: 'drawRect 1.5s ease-in-out infinite' }} />
                <rect x="70" y="35" width="40" height="60" rx="6" fill="none" stroke="#10b981" strokeWidth="2"
                      strokeDasharray="200" strokeDashoffset="200" style={{ animation: 'drawRect 1.5s ease-in-out 0.3s infinite' }} />
                <rect x="120" y="50" width="25" height="40" rx="3" fill="none" stroke="#10b981" strokeWidth="2"
                      strokeDasharray="130" strokeDashoffset="130" style={{ animation: 'drawRect 1.5s ease-in-out 0.6s infinite' }} />
              </>
            )}
            
            {currentStep === 4 && (
              // Putting together - puzzle pieces
              <>
                <path d="M50 50 L90 50 Q95 55 90 60 L50 60 Q45 55 50 50" fill="none" stroke="#f59e0b" strokeWidth="2"
                      strokeDasharray="120" strokeDashoffset="120" style={{ animation: 'drawPath 2s ease-in-out infinite' }} />
                <path d="M90 60 L130 60 Q135 65 130 70 L90 70 Q85 65 90 60" fill="none" stroke="#f59e0b" strokeWidth="2"
                      strokeDasharray="120" strokeDashoffset="120" style={{ animation: 'drawPath 2s ease-in-out 0.5s infinite' }} />
                <path d="M50 70 L90 70 Q95 75 90 80 L50 80 Q45 75 50 70" fill="none" stroke="#f59e0b" strokeWidth="2"
                      strokeDasharray="120" strokeDashoffset="120" style={{ animation: 'drawPath 2s ease-in-out 1s infinite' }} />
              </>
            )}
            
            {currentStep === 5 && (
              // Almost ready - checkmarks and stars
              <>
                <path d="M50 70 L70 85 L110 50" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray="100" strokeDashoffset="100" style={{ animation: 'drawCheck 2s ease-in-out infinite' }} />
                <text x="80" y="110" textAnchor="middle" fontSize="24" fill="#f59e0b">✨</text>
              </>
            )}
          </svg>
          
          {/* Animated cursor/tool */}
          <div 
            className="absolute w-6 h-6 transform -rotate-45 transition-all duration-300"
            style={{
              top: currentStep === 0 ? '40%' : currentStep === 1 ? '30%' : currentStep === 2 ? '45%' : currentStep === 3 ? '40%' : currentStep === 4 ? '35%' : '45%',
              left: currentStep === 0 ? '65%' : currentStep === 1 ? '20%' : currentStep === 2 ? '30%' : currentStep === 3 ? '50%' : currentStep === 4 ? '60%' : '50%',
              animation: 'float 2s ease-in-out infinite'
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 rounded-full shadow-lg">
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Step indicator */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
          {currentStepData.icon}
        </div>
      </div>
      
      {/* Progress and status */}
      <div className="text-center space-y-4 max-w-md">
        {/* Overall progress bar */}
        <div className="w-80 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Step progress bar */}
        <div className="w-64 h-1 bg-gray-100 rounded-full overflow-hidden mx-auto">
          <div 
            className="h-full bg-blue-400 rounded-full transition-all duration-100"
            style={{ width: `${stepProgress}%` }}
          />
        </div>
        
        {/* Current step info */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-center gap-2">
            <span className="text-2xl">{currentStepData.icon}</span>
            {currentStepData.title}
          </h3>
          <p className="text-sm text-gray-600">{currentStepData.subtitle}</p>
        </div>
        
        {/* Step counter */}
        <div className="flex items-center justify-center space-x-1">
          {GENERATION_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'bg-blue-500 scale-125' 
                  : index < currentStep 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Generating your personalized creatives...
        </p>
      </div>

      <style jsx global>{`
        @keyframes drawLine {
          0% { stroke-dashoffset: 100; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -100; }
        }
        
        @keyframes drawCircle {
          0% { stroke-dashoffset: 157; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -157; }
        }
        
        @keyframes drawRect {
          0% { stroke-dashoffset: 280; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -280; }
        }
        
        @keyframes drawPath {
          0% { stroke-dashoffset: 120; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -120; }
        }
        
        @keyframes drawCheck {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        
        @keyframes fadeIn {
          0%, 50% { opacity: 0; }
          100% { opacity: 0.7; }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(-45deg); }
          50% { transform: translate(2px, -2px) rotate(-45deg); }
        }
      `}</style>
    </div>
  );
};

export default DrawingAnimation; 