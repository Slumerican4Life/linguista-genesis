import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Crown, Zap, Rocket, Building, Star } from 'lucide-react';
import { toast } from 'sonner';

interface PricingPlansProps {
  onSelectPlan: (planId: string) => void;
  currentPlan: string;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ onSelectPlan, currentPlan }) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free Tier',
      icon: <Star className="w-6 h-6" />,
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Perfect for trying out Linguista',
      features: [
        '500 words per month',
        '5 languages',
        'Basic tone options',
        'Community support',
        'Ads supported'
      ],
      limitations: [
        'Limited file uploads',
        'Basic translations only',
        'No priority support'
      ],
      stripeMonthlyId: null,
      stripeAnnualId: null,
      popular: false,
      gradient: 'from-gray-600 to-gray-700'
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: <Zap className="w-6 h-6" />,
      monthlyPrice: 19.99,
      annualPrice: 199,
      description: 'For professionals and content creators',
      features: [
        '100,000 words per month',
        '30 languages',
        'All tone options',
        'File uploads (CSV, TXT, DOCX)',
        'Priority email support',
        'Minimal ads',
        'Translation history',
        'Export options'
      ],
      stripeMonthlyId: 'price_REPLACE_WITH_YOUR_PROFESSIONAL_MONTHLY_ID',
      stripeAnnualId: 'price_REPLACE_WITH_YOUR_PROFESSIONAL_ANNUAL_ID',
      popular: true,
      gradient: 'from-green-600 to-emerald-700'
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: <Rocket className="w-6 h-6" />,
      monthlyPrice: 29.99,
      annualPrice: 299.99,
      description: 'For teams and heavy users',
      features: [
        'Unlimited words',
        '35 languages',
        'Custom tone creation',
        'All file types supported',
        'URL content extraction',
        'No ads',
        'Priority chat support',
        'Advanced analytics',
        'Team collaboration',
        'API access'
      ],
      stripeMonthlyId: 'price_REPLACE_WITH_YOUR_PREMIUM_MONTHLY_ID',
      stripeAnnualId: 'price_REPLACE_WITH_YOUR_PREMIUM_ANNUAL_ID',
      popular: false,
      gradient: 'from-blue-600 to-purple-700'
    },
    {
      id: 'business',
      name: 'Business',
      icon: <Building className="w-6 h-6" />,
      monthlyPrice: 59.99,
      annualPrice: 599.99,
      description: 'For enterprises and large teams',
      features: [
        'Unlimited everything',
        '40+ languages',
        'Custom AI training',
        'White-label options',
        'Dedicated account manager',
        'SLA guarantee',
        'Custom integrations',
        'Advanced security',
        'Bulk processing',
        'Phone support'
      ],
      stripeMonthlyId: 'price_REPLACE_WITH_YOUR_BUSINESS_MONTHLY_ID',
      stripeAnnualId: 'price_REPLACE_WITH_YOUR_BUSINESS_ANNUAL_ID',
      popular: false,
      gradient: 'from-purple-600 to-pink-700'
    }
  ];

  const getAnnualSavings = (monthly: number, annual: number) => {
    if (monthly === 0) return 0;
    const monthlyCost = monthly * 12;
    return monthlyCost - annual;
  };

  const getSavingsPercentage = (monthly: number, annual: number) => {
    if (monthly === 0) return 0;
    const savings = getAnnualSavings(monthly, annual);
    return Math.round((savings / (monthly * 12)) * 100);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-6">
        <h2 className="text-4xl font-black text-white">
          Choose Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Linguista Plan</span>
        </h2>
        <p className="text-xl text-purple-100 max-w-3xl mx-auto">
          Scale your global content with AI-powered translations that understand context, culture, and tone.
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 p-4 bg-black/40 rounded-xl border border-purple-500/30 w-fit mx-auto">
          <span className={`font-medium transition-colors ${!isAnnual ? 'text-white' : 'text-purple-300'}`}>
            Monthly
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            className="data-[state=checked]:bg-purple-600"
          />
          <span className={`font-medium transition-colors ${isAnnual ? 'text-white' : 'text-purple-300'}`}>
            Annual
          </span>
          {isAnnual && (
            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold">
              Save up to 20%
            </Badge>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
          const savings = isAnnual ? getAnnualSavings(plan.monthlyPrice, plan.annualPrice) : 0;
          const savingsPercent = isAnnual ? getSavingsPercentage(plan.monthlyPrice, plan.annualPrice) : 0;

          return (
            <Card
              key={plan.id}
              className={`relative border-2 transition-all duration-300 hover:scale-[1.02] bg-black/60 backdrop-blur-sm ${
                plan.popular
                  ? 'border-purple-500 shadow-2xl shadow-purple-500/25'
                  : isCurrentPlan
                  ? 'border-blue-500 shadow-xl shadow-blue-500/25'
                  : 'border-purple-500/30 hover:border-purple-400'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-4 py-1">
                    <Crown className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute -top-4 right-4">
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className={`text-center pb-4 bg-gradient-to-r ${plan.gradient}/20 rounded-t-lg border-b border-purple-500/30`}>
                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center text-white mb-4`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-black text-white">{plan.name}</CardTitle>
                <CardDescription className="text-purple-200 font-medium">
                  {plan.description}
                </CardDescription>
                
                <div className="space-y-2">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-black text-white">
                      ${price === 0 ? '0' : price.toFixed(price % 1 === 0 ? 0 : 2)}
                    </span>
                    {price > 0 && (
                      <span className="text-purple-300 font-medium">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  
                  {isAnnual && savings > 0 && (
                    <div className="space-y-1">
                      <Badge className="bg-green-600/20 text-green-300 border border-green-500/30">
                        Save ${savings} ({savingsPercent}% off)
                      </Badge>
                      <p className="text-xs text-purple-300">
                        vs ${(plan.monthlyPrice * 12).toFixed(0)} billed monthly
                      </p>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-purple-100 text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => {
                    const priceId = isAnnual ? plan.stripeAnnualId : plan.stripeMonthlyId;
                    if (priceId) {
                      onSelectPlan(priceId);
                    } else if (plan.id === 'free') {
                      toast.info("The Free Tier is available by default for all new users.");
                    } else {
                      toast.error("This plan isn't available for purchase right now.");
                    }
                  }}
                  disabled={isCurrentPlan}
                  className={`w-full h-12 font-bold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                      : isCurrentPlan
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-600 hover:to-blue-600'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.id === 'free' ? 'Get Started Free' : 'Upgrade Now'}
                </Button>

                {plan.id === 'free' && (
                  <p className="text-xs text-purple-400 text-center">
                    No credit card required
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Refill Pack */}
      <Card className="border border-green-500/30 bg-gradient-to-r from-green-900/20 to-emerald-900/20 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-green-100 text-xl font-bold">Need Extra Words?</CardTitle>
          <CardDescription className="text-green-200">
            One-time refill pack for any plan
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <div className="text-3xl font-black text-green-100">$9.99</div>
            <div className="text-green-200">50,000 additional words</div>
            <Badge className="bg-green-600/30 text-green-200 border-green-400">
              Never expires
            </Badge>
          </div>
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            Buy Refill Pack
          </Button>
        </CardContent>
      </Card>

      <div className="text-center space-y-4">
        <p className="text-purple-200 font-medium">
          All plans include our 5-agent AI translation pipeline with cultural adaptation
        </p>
        <div className="flex justify-center space-x-8 text-sm text-purple-300">
          <span>✓ 30-day money-back guarantee</span>
          <span>✓ Cancel anytime</span>
          <span>✓ Enterprise discounts available</span>
        </div>
      </div>
    </div>
  );
};
