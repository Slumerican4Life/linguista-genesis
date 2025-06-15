
import React from 'react';
import { User } from '@supabase/supabase-js';

interface AdBannerProps {
  position: 'top' | 'middle' | 'bottom';
  user: User | null;
  currentPlan: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ position, user, currentPlan }) => {
  if (!user || currentPlan !== 'free') return null;

  let adContent: React.ReactNode;
  switch (position) {
    case 'top':
      adContent = (
        <div className="text-center">
          <p className="font-bold text-lg text-white">Sumerican Slang</p>
          <p className="text-sm text-purple-300">inspired by yelawolf</p>
        </div>
      );
      break;
    case 'middle':
      adContent = (
        <p className="font-bold text-lg text-center text-white">the losers win again.</p>
      );
      break;
    case 'bottom':
      adContent = (
        <p className="font-bold text-lg text-center text-white">better take a left mf.</p>
      );
      break;
    default:
      adContent = null;
  }
  
  return (
    <div className={`${
      position === 'top' ? 'mb-8' : position === 'middle' ? 'my-8' : 'mt-8'
    }`}>
      <div
        className="max-w-full p-4 rounded-lg flex items-center justify-center"
        style={{ minHeight: '100px', backgroundColor: '#1a1a1a', border: '1px dashed #4f46e5' }}
      >
        {adContent}
      </div>
    </div>
  );
};
