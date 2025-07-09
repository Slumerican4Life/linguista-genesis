import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Star, Crown, Zap, Shield, Globe, Brain, Sparkles } from 'lucide-react';

const competitors = [
  {
    name: "Google Translate",
    rating: 4.2,
    features: [
      { name: "Basic Translation", hasIt: true },
      { name: "Website Translation", hasIt: true },
      { name: "AI Agent Pipeline", hasIt: false },
      { name: "Cultural Adaptation", hasIt: false },
      { name: "Tone Customization", hasIt: false },
      { name: "Real-time Collaboration", hasIt: false },
      { name: "Advanced Security", hasIt: false }
    ],
    pricing: "Free/Limited",
    weaknesses: ["Generic translations", "No cultural context", "Privacy concerns"]
  },
  {
    name: "DeepL",
    rating: 4.5,
    features: [
      { name: "Basic Translation", hasIt: true },
      { name: "Website Translation", hasIt: true },
      { name: "AI Agent Pipeline", hasIt: false },
      { name: "Cultural Adaptation", hasIt: false },
      { name: "Tone Customization", hasIt: false },
      { name: "Real-time Collaboration", hasIt: false },
      { name: "Advanced Security", hasIt: true }
    ],
    pricing: "$8.74/month",
    weaknesses: ["Limited languages", "No multi-agent system", "Basic website support"]
  },
  {
    name: "ConveyThis",
    rating: 4.1,
    features: [
      { name: "Basic Translation", hasIt: true },
      { name: "Website Translation", hasIt: true },
      { name: "AI Agent Pipeline", hasIt: false },
      { name: "Cultural Adaptation", hasIt: false },
      { name: "Tone Customization", hasIt: true },
      { name: "Real-time Collaboration", hasIt: false },
      { name: "Advanced Security", hasIt: false }
    ],
    pricing: "$10/month",
    weaknesses: ["Single-agent translation", "Limited customization", "No neural pipeline"]
  },
  {
    name: "Linguista",
    rating: 5.0,
    isUs: true,
    features: [
      { name: "Basic Translation", hasIt: true },
      { name: "Website Translation", hasIt: true },
      { name: "AI Agent Pipeline", hasIt: true },
      { name: "Cultural Adaptation", hasIt: true },
      { name: "Tone Customization", hasIt: true },
      { name: "Real-time Collaboration", hasIt: true },
      { name: "Advanced Security", hasIt: true }
    ],
    pricing: "$16.58/month",
    advantages: ["5 AI agents working together", "Neural pipeline technology", "Cultural intelligence", "Advanced tone control"]
  }
];

export const CompetitorComparison = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Why Linguista Dominates the Competition
        </h2>
        <p className="text-xl text-purple-200 max-w-3xl mx-auto">
          While others use single AI models, we deploy a team of 5 specialized neural agents working in perfect harmony
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {competitors.map((competitor, index) => (
          <Card 
            key={competitor.name} 
            className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
              competitor.isUs 
                ? 'bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-cyan-900/50 border-2 border-purple-400/50 shadow-2xl shadow-purple-500/20' 
                : 'bg-black/60 border border-gray-600/30 hover:border-purple-400/30'
            }`}
          >
            {competitor.isUs && (
              <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-orange-500 text-black px-3 py-1 text-sm font-bold">
                <Crown className="w-4 h-4 inline mr-1" />
                WINNER
              </div>
            )}
            
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-lg ${competitor.isUs ? 'text-purple-100' : 'text-white'}`}>
                  {competitor.name}
                </CardTitle>
                <div className="flex items-center space-x-1">
                  <Star className={`w-4 h-4 ${competitor.isUs ? 'text-yellow-400' : 'text-yellow-500'}`} fill="currentColor" />
                  <span className={`text-sm font-bold ${competitor.isUs ? 'text-yellow-400' : 'text-gray-300'}`}>
                    {competitor.rating}
                  </span>
                </div>
              </div>
              <Badge className={competitor.isUs ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'bg-gray-700 text-gray-200'}>
                {competitor.pricing}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                {competitor.features.map((feature, featureIndex) => (
                  <div key={feature.name} className="flex items-center justify-between text-sm">
                    <span className={competitor.isUs ? 'text-purple-200' : 'text-gray-300'}>
                      {feature.name}
                    </span>
                    {feature.hasIt ? (
                      <Check className={`w-4 h-4 ${competitor.isUs ? 'text-green-400' : 'text-green-500'}`} />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                ))}
              </div>

              {competitor.isUs ? (
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-200 flex items-center">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Our Advantages
                  </h4>
                  <ul className="text-xs text-purple-300 space-y-1">
                    {competitor.advantages?.map((advantage, i) => (
                      <li key={i} className="flex items-start">
                        <Star className="w-3 h-3 mr-1 mt-0.5 text-yellow-400" fill="currentColor" />
                        {advantage}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-300 flex items-center">
                    <X className="w-4 h-4 mr-1 text-red-500" />
                    Limitations
                  </h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {competitor.weaknesses?.map((weakness, i) => (
                      <li key={i} className="flex items-start">
                        <X className="w-3 h-3 mr-1 mt-0.5 text-red-500" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Breakdown */}
      <Card className="bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-cyan-900/30 border border-purple-400/30">
        <CardHeader>
          <CardTitle className="text-2xl text-purple-100 flex items-center">
            <Brain className="w-6 h-6 mr-2" />
            The Neuronix Advantage: 5-Agent Neural Pipeline
          </CardTitle>
          <CardDescription className="text-purple-200">
            While competitors use single AI models, Linguista deploys specialized agent teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { name: "Zane", role: "Security Filter", icon: Shield, color: "text-red-400" },
              { name: "Lexi", role: "Content Extractor", icon: Globe, color: "text-emerald-400" },
              { name: "Poly", role: "Core Translator", icon: Brain, color: "text-blue-400" },
              { name: "Vera", role: "Cultural Adapter", icon: Star, color: "text-amber-400" },
              { name: "Tala", role: "Tone Specialist", icon: Zap, color: "text-purple-400" }
            ].map((agent, index) => (
              <div key={agent.name} className="text-center p-4 bg-black/40 rounded-lg border border-purple-500/20">
                <agent.icon className={`w-8 h-8 mx-auto mb-2 ${agent.color}`} />
                <h4 className="font-bold text-white">{agent.name}</h4>
                <p className="text-xs text-gray-300">{agent.role}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-8 py-3">
              <Crown className="w-5 h-5 mr-2" />
              Experience the Neural Advantage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};