
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, Building2, Sparkles } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  popular?: boolean;
  gradient: string;
  wordLimit: string;
  languages: string;
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Tier',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out PolyLingua',
    wordLimit: '500 words/day',
    languages: 'Up to 2 languages',
    features: [
      '500 words per day',
      'Up to 2 language exports',
      'Basic translation quality',
      'Watermarked exports',
      'Community support'
    ],
    icon: Sparkles,
    gradient: 'from-gray-400 to-gray-600'
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    price: '$9.99',
    period: '/month',
    description: 'Great for individuals and small projects',
    wordLimit: '10K words/month',
    languages: 'Up to 10 languages',
    features: [
      '10,000 words per month',
      'Up to 10 language exports',
      'Custom tone settings',
      'Save preferences',
      'Download without watermark',
      'Basic email support'
    ],
    icon: Zap,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '$29',
    period: '/month',
    description: 'Perfect for businesses and professionals',
    wordLimit: '100K words/month',
    languages: '40+ languages',
    popular: true,
    features: [
      '100,000 words per month',
      'Full access to 40+ languages',
      'Advanced AI agents (Poly, Vera, Tala)',
      'Local vocabulary injection',
      'Translation templates',
      'API access',
      'Priority email support'
    ],
    icon: Crown,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'agency',
    name: 'Agency Plan',
    price: '$79',
    period: '/month',
    description: 'For teams and agencies with high-volume needs',
    wordLimit: '1M words/month',
    languages: 'Unlimited access',
    features: [
      '1,000,000 words per month',
      'Unlimited projects & collaboration',
      'Auto-detect language',
      'Multi-format exports',
      'Feedback memory & learning',
      'White-label options',
      'Dedicated account manager'
    ],
    icon: Building2,
    gradient: 'from-emerald-500 to-teal-500'
  }
];

interface PricingPlansProps {
  onSelectPlan: (planId: string) => void;
  currentPlan?: string;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ onSelectPlan, currentPlan }) => {
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
          Choose Your Perfect Plan
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Scale your global content strategy with our flexible pricing options
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          
          return (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                plan.popular
                  ? 'ring-2 ring-purple-500 shadow-purple-500/25'
                  : 'hover:shadow-lg'
              } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''} backdrop-blur-sm bg-card/90`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-sm font-semibold rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center shadow-lg`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {plan.description}
                </CardDescription>
                
                <div className="flex items-baseline justify-center mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <Badge variant="secondary" className="text-sm">
                    {plan.wordLimit}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {plan.languages}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => onSelectPlan(plan.id)}
                  disabled={isCurrentPlan}
                  className={`w-full mt-6 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                      : plan.id === 'free'
                      ? 'bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700'
                      : `bg-gradient-to-r ${plan.gradient.replace('from-', 'from-').replace('to-', 'to-')} hover:opacity-90`
                  } text-white font-semibold py-3 transition-all duration-300`}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.id === 'free' ? 'Get Started' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Credits Option */}
      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              <Zap className="w-6 h-6 text-amber-500" />
              <span>One-Time Credits</span>
            </CardTitle>
            <CardDescription>
              Need extra words for a big project? Buy credits without a subscription!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">50,000 words</div>
                <div className="text-sm text-muted-foreground">One-time purchase</div>
              </div>
              <div className="text-3xl font-bold">$9.99</div>
              <Button
                onClick={() => onSelectPlan('credits')}
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/30"
              >
                Buy Credits
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
