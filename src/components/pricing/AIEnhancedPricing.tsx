
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Crown, Rocket, Check, Star, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export const AIEnhancedPricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      icon: <Zap className="w-6 h-6 text-blue-400" />,
      price: { monthly: 9, annual: 89 },
      description: "Perfect for individuals and small projects",
      features: [
        "50,000 words/month",
        "25+ languages",
        "Basic AI translation",
        "Standard support",
        "Web dashboard access",
        "API access (100 calls/day)"
      ],
      badge: null,
      color: "from-blue-600 to-cyan-600",
      borderColor: "border-blue-500/30"
    },
    {
      name: "Professional",
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      price: { monthly: 29, annual: 299 },
      description: "Advanced AI features for growing businesses",
      features: [
        "200,000 words/month",
        "50+ languages",
        "Advanced AI translation",
        "Priority support",
        "Team collaboration",
        "API access (1,000 calls/day)",
        "Custom tone settings",
        "Translation memory",
        "Quality scoring"
      ],
      badge: "Most Popular",
      color: "from-purple-600 to-pink-600",
      borderColor: "border-purple-500/50"
    },
    {
      name: "Enterprise",
      icon: <Crown className="w-6 h-6 text-yellow-400" />,
      price: { monthly: 99, annual: 999 },
      description: "Maximum AI power for large organizations",
      features: [
        "1,000,000 words/month",
        "100+ languages",
        "Neural AI translation",
        "24/7 premium support",
        "Advanced team features",
        "Unlimited API access",
        "Custom AI training",
        "White-label solution",
        "SLA guarantee",
        "Custom integrations",
        "Dedicated AI instance"
      ],
      badge: "Best Value",
      color: "from-yellow-600 to-orange-600",
      borderColor: "border-yellow-500/50"
    }
  ];

  const aiFeatures = [
    {
      icon: <Brain className="w-5 h-5 text-purple-400" />,
      title: "Neural Translation Engine",
      description: "Advanced AI models trained on 100B+ translations"
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-green-400" />,
      title: "Smart Optimization",
      description: "AI learns from your content to improve over time"
    },
    {
      icon: <Star className="w-5 h-5 text-yellow-400" />,
      title: "Quality Intelligence",
      description: "Real-time AI scoring and quality recommendations"
    },
    {
      icon: <Rocket className="w-5 h-5 text-blue-400" />,
      title: "Instant Processing",
      description: "Lightning-fast AI processing with 99.9% uptime"
    }
  ];

  const handleUpgrade = (planName: string) => {
    toast.success(`🚀 Upgrading to ${planName} plan! Redirecting to payment...`);
    // Add actual payment integration here
  };

  return (
    <div className="space-y-8">
      {/* AI Features Header */}
      <Card className="border-purple-500/30 bg-gradient-to-br from-black/80 to-purple-900/20 backdrop-blur-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-3 text-purple-100 text-3xl">
            <Brain className="w-8 h-8 text-purple-400" />
            <span>AI-Powered Translation Plans</span>
          </CardTitle>
          <CardDescription className="text-purple-200 text-lg">
            Choose the perfect AI translation package for your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="text-center p-4 bg-black/40 rounded-lg border border-purple-500/20">
                <div className="flex justify-center mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-purple-200">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-black/60 p-1 rounded-lg border border-purple-500/30">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-2 rounded-md transition-all ${
              !isAnnual 
                ? 'bg-purple-600 text-white' 
                : 'text-purple-200 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-4 py-2 rounded-md transition-all ${
              isAnnual 
                ? 'bg-purple-600 text-white' 
                : 'text-purple-200 hover:text-white'
            }`}
          >
            Annual
            <Badge className="ml-2 bg-green-600 text-white">Save 17%</Badge>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <Card 
            key={index} 
            className={`${plan.borderColor} bg-gradient-to-br from-black/80 to-gray-900/40 backdrop-blur-lg relative ${
              plan.badge ? 'ring-2 ring-purple-500/50' : ''
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600 text-white px-4 py-1">
                  {plan.badge}
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">{plan.icon}</div>
              <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
              <CardDescription className="text-gray-300">{plan.description}</CardDescription>
              
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">
                  ${isAnnual ? plan.price.annual : plan.price.monthly}
                </span>
                <span className="text-gray-400">
                  /{isAnnual ? 'year' : 'month'}
                </span>
              </div>
              
              {isAnnual && (
                <p className="text-green-400 text-sm">
                  Save ${(plan.price.monthly * 12) - plan.price.annual}/year
                </p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => handleUpgrade(plan.name)}
                className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold py-3`}
              >
                <Rocket className="w-4 h-4 mr-2" />
                Upgrade to {plan.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Enhancement Notice */}
      <Card className="border-green-500/30 bg-gradient-to-br from-black/80 to-green-900/20 backdrop-blur-lg">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-green-100">AI-Enhanced Translation Quality</h3>
          </div>
          <p className="text-green-200 mb-4">
            All plans include our advanced neural translation engine with continuous AI learning and optimization.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-green-300">
            <span>✨ 98.7% Accuracy</span>
            <span>⚡ Sub-second Processing</span>
            <span>🧠 Self-Improving AI</span>
            <span>🌍 100+ Languages</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
