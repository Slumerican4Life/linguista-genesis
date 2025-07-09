import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Building } from 'lucide-react';

interface AIEnhancedPricingProps {
  onSelectPlan: (priceId: string) => void;
  currentPlan?: string;
}

export const AIEnhancedPricing: React.FC<AIEnhancedPricingProps> = ({
  onSelectPlan,
  currentPlan = 'free'
}) => {
  const pricingTiers = [
    {
      id: 'professional',
      name: 'Professional',
      originalPrice: 199.99,
      discountedPrice: 185,
      priceId: 'price_professional_yearly',
      icon: <Zap className="w-6 h-6" />,
      features: ['1 Website', '10,000 words/month', '10 languages', 'Basic AI agents']
    },
    {
      id: 'premium',
      name: 'Premium',
      originalPrice: 299.99,
      discountedPrice: 225,
      priceId: 'price_premium_yearly',
      icon: <Star className="w-6 h-6" />,
      popular: true,
      features: ['2 Websites', '50,000 words/month', '25 languages', 'Enhanced AI + Urban Dictionary']
    },
    {
      id: 'business',
      name: 'Business',
      originalPrice: 599.99,
      discountedPrice: 400,
      priceId: 'price_business_yearly',
      icon: <Building className="w-6 h-6" />,
      features: ['Unlimited websites', '200,000 words/month', '50+ languages', 'All AI agents + Lyra']
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-blue-300 to-green-300 bg-clip-text text-transparent">
          Choose Your AI Translation Plan
        </h2>
        <Badge variant="outline" className="border-green-500 text-green-300 bg-green-900/20 px-4 py-2">
          <Crown className="w-4 h-4 mr-2" />
          50% Money-Back Guarantee
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {pricingTiers.map((tier) => (
          <Card
            key={tier.id}
            className={`relative border-2 transition-all duration-300 hover:scale-105 ${
              tier.popular
                ? 'border-purple-500 bg-gradient-to-br from-purple-900/40 to-blue-900/40'
                : 'border-purple-500/30 bg-gradient-to-br from-black/80 to-purple-900/20'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="p-2 rounded-full bg-purple-600">{tier.icon}</div>
                <CardTitle className="text-2xl font-bold text-purple-100">{tier.name}</CardTitle>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg text-gray-400 line-through">${tier.originalPrice}</span>
                  <Badge variant="outline" className="border-red-500 text-red-300">
                    Save ${tier.originalPrice - tier.discountedPrice}
                  </Badge>
                </div>
                <div className="text-4xl font-bold text-white">${tier.discountedPrice}/year</div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-purple-200 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => onSelectPlan(tier.priceId)}
                disabled={currentPlan === tier.id}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {currentPlan === tier.id ? 'Current Plan' : `Choose ${tier.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg">
        <p className="text-blue-100 text-sm">
          ⚠️ AI Experimentation Notice: Our service uses experimental AI with 50% money-back guarantee. 
          Results may vary. Dictionary APIs and Urban Dictionary integration included.
        </p>
      </div>
    </div>
  );
};