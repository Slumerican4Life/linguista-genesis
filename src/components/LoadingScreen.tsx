
import React from 'react';
import { MagicalBrain } from './MagicalBrain';
import { FloatingLetters } from './FloatingLetters';

interface LoadingScreenProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingScreen = ({ isLoading, message = "AI Agents Processing..." }: LoadingScreenProps) => {
  if (!isLoading) return null;

  return (
    <>
      <FloatingLetters />
      <div className="fixed inset-0 bg-gradient-to-br from-deep-purple-900/95 via-ai-blue-900/95 to-deep-purple-950/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center space-y-8">
          {/* Magical Brain with Lightning */}
          <div className="relative">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-ai-purple-500 via-ai-blue-500 to-ai-purple-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute inset-2 bg-gradient-to-r from-ai-purple-600 to-ai-blue-600 rounded-full opacity-30 animate-pulse animation-delay-300"></div>
              <div className="absolute inset-4 flex items-center justify-center">
                <MagicalBrain size="lg" />
              </div>
            </div>
          </div>

          {/* Brand name with magical styling */}
          <div className="space-y-2">
            <h1 className="text-6xl font-script font-bold bg-gradient-to-r from-magic-gold-400 via-ai-purple-400 to-ai-blue-400 bg-clip-text text-transparent animate-fade-in">
              Linguista
            </h1>
            <p className="text-xl text-magic-gold-300 font-fancy animate-fade-in animation-delay-300">
              by Neuronix ~ Language Rewired
            </p>
          </div>

          {/* Loading message with 3D effect */}
          <div className="space-y-4 animate-fade-in animation-delay-500">
            <p className="text-2xl text-white font-script font-semibold" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px rgba(139, 92, 246, 0.5)' }}>
              {message}
            </p>
            
            {/* Animated magical dots */}
            <div className="flex justify-center space-x-3">
              <div className="w-4 h-4 bg-magic-gold-400 rounded-full animate-bounce shadow-lg shadow-magic-gold-400/50"></div>
              <div className="w-4 h-4 bg-ai-purple-400 rounded-full animate-bounce animation-delay-200 shadow-lg shadow-ai-purple-400/50"></div>
              <div className="w-4 h-4 bg-ai-blue-400 rounded-full animate-bounce animation-delay-400 shadow-lg shadow-ai-blue-400/50"></div>
            </div>

            {/* Enhanced progress indicator */}
            <div className="w-80 h-2 bg-deep-purple-800 rounded-full mx-auto overflow-hidden border border-magic-gold-400/30">
              <div className="h-full bg-gradient-to-r from-magic-gold-400 via-ai-purple-500 to-ai-blue-500 rounded-full animate-shimmer shadow-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
