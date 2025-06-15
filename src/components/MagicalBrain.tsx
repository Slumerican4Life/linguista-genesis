
import React from 'react';
import { Brain } from 'lucide-react';

interface MagicalBrainProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const MagicalBrain = ({ size = 'md', className = '' }: MagicalBrainProps) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl'
  };

  const lightningSize = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`brain-container ${className}`}>
      <div className={`brain-icon animate-brain-pulse ${sizeClasses[size]}`}>
        <Brain />
      </div>
      
      {/* Lightning bolts */}
      <div className={`lightning-bolt lightning-1 animate-lightning ${lightningSize[size]}`}>⚡</div>
      <div className={`lightning-bolt lightning-2 animate-lightning ${lightningSize[size]}`}>⚡</div>
      <div className={`lightning-bolt lightning-3 animate-lightning ${lightningSize[size]}`}>⚡</div>
      <div className={`lightning-bolt lightning-4 animate-lightning ${lightningSize[size]}`}>⚡</div>
    </div>
  );
};
