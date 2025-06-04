
import React from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingScreen = ({ isLoading, message = "AI Agents Processing..." }: LoadingScreenProps) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo with pulsing animation */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-30 animate-pulse animation-delay-300"></div>
            <img 
              src="/lovable-uploads/56b3973a-75ee-45d3-8670-40289d5fab04.png" 
              alt="Linguista Logo" 
              className="w-full h-full object-contain relative z-10 animate-float"
            />
          </div>
        </div>

        {/* Brand name */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
            Linguista
          </h1>
          <p className="text-lg text-muted-foreground animate-fade-in animation-delay-300">
            by Neuronix ~ Language Rewired
          </p>
        </div>

        {/* Loading message */}
        <div className="space-y-4 animate-fade-in animation-delay-500">
          <p className="text-xl text-foreground font-medium">{message}</p>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce animation-delay-400"></div>
          </div>

          {/* Progress indicator */}
          <div className="w-64 h-1 bg-muted rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
