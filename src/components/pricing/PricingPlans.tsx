import React from 'react';
import { AIEnhancedPricing } from './AIEnhancedPricing';

interface PricingPlansProps {
  onSelectPlan: (priceId: string) => void;
  currentPlan?: string;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({
  onSelectPlan,
  currentPlan = 'free'
}) => {
  return (
    <AIEnhancedPricing onSelectPlan={onSelectPlan} currentPlan={currentPlan} />
  );
};