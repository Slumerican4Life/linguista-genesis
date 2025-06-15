
import React from 'react';
import { Brain } from 'lucide-react';

interface NeuronixBrainProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isActive?: boolean;
}

export const NeuronixBrain: React.FC<NeuronixBrainProps> = ({ 
  size = 'md', 
  className = '', 
  isActive = false 
}) => {
  const sizeClasses = {
    sm: 'text-3xl',
    md: 'text-5xl', 
    lg: 'text-7xl',
    xl: 'text-9xl'
  };

  const lightningSize = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Main Brain Container */}
      <div className="relative">
        {/* Brain Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/40 via-blue-600/40 to-indigo-600/40 rounded-full blur-2xl animate-pulse"></div>
        
        {/* Brain Icon */}
        <div className={`relative z-10 ${sizeClasses[size]} ${isActive ? 'animate-brain-pulse' : ''}`}>
          <Brain className="text-transparent bg-gradient-to-br from-purple-400 via-blue-500 to-indigo-600 bg-clip-text drop-shadow-2xl" 
                 style={{ 
                   filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))',
                   WebkitTextStroke: '1px rgba(255, 255, 255, 0.3)'
                 }} 
          />
        </div>

        {/* Golden Lightning Bolts */}
        <div className={`absolute inset-0 ${lightningSize[size]}`}>
          <div className="absolute -top-4 -left-4 animate-lightning text-yellow-400 rotate-12" 
               style={{ textShadow: '0 0 10px #ffd700, 0 0 20px #ffed4e' }}>
            ⚡
          </div>
          <div className="absolute -top-2 -right-6 animate-lightning text-yellow-300 -rotate-45" 
               style={{ textShadow: '0 0 10px #ffd700, 0 0 20px #ffed4e', animationDelay: '0.3s' }}>
            ⚡
          </div>
          <div className="absolute -bottom-3 -left-3 animate-lightning text-yellow-500 rotate-45" 
               style={{ textShadow: '0 0 10px #ffd700, 0 0 20px #ffed4e', animationDelay: '0.6s' }}>
            ⚡
          </div>
          <div className="absolute -bottom-4 -right-2 animate-lightning text-yellow-400 -rotate-12" 
               style={{ textShadow: '0 0 10px #ffd700, 0 0 20px #ffed4e', animationDelay: '0.9s' }}>
            ⚡
          </div>
          <div className="absolute top-1/2 -right-8 animate-lightning text-yellow-300 rotate-90" 
               style={{ textShadow: '0 0 10px #ffd700, 0 0 20px #ffed4e', animationDelay: '1.2s' }}>
            ⚡
          </div>
          <div className="absolute top-1/2 -left-8 animate-lightning text-yellow-500 -rotate-90" 
               style={{ textShadow: '0 0 10px #ffd700, 0 0 20px #ffed4e', animationDelay: '1.5s' }}>
            ⚡
          </div>
        </div>

        {/* Neural Network Connections */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
      </div>
    </div>
  );
};
