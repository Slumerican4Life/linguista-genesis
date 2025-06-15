
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, Target, Zap, Globe, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const AIInsights: React.FC = () => {
  const insights = [
    {
      icon: <Brain className="w-5 h-5 text-purple-400" />,
      title: "AI Translation Quality Score",
      value: "98.7%",
      trend: "+2.3%",
      description: "Neural network accuracy improved this month",
      color: "from-purple-600 to-blue-600"
    },
    {
      icon: <Target className="w-5 h-5 text-green-400" />,
      title: "Language Optimization",
      value: "15 Languages",
      trend: "+3 new",
      description: "AI recommends expanding to German, Japanese, Korean",
      color: "from-green-600 to-emerald-600"
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
      title: "Performance Boost",
      value: "340ms",
      trend: "-45ms",
      description: "AI caching reduced translation time",
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: <Globe className="w-5 h-5 text-red-400" />,
      title: "Global Reach Score",
      value: "89%",
      trend: "+12%",
      description: "AI suggests targeting Southeast Asia next",
      color: "from-red-600 to-pink-600"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-purple-500/30 bg-gradient-to-br from-black/80 to-purple-900/20 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-purple-100">
            <Brain className="w-6 h-6 text-purple-400" />
            <span>AI-Powered Insights</span>
            <Badge className="bg-purple-600 text-white">Live</Badge>
          </CardTitle>
          <CardDescription className="text-purple-200">
            Real-time intelligence from your translation neural networks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insights.map((insight, index) => (
              <Card key={index} className={`bg-gradient-to-br ${insight.color} border-0 text-white`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    {insight.icon}
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {insight.trend}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{insight.title}</h3>
                  <p className="text-2xl font-bold mb-1">{insight.value}</p>
                  <p className="text-xs opacity-90">{insight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-blue-500/30 bg-gradient-to-br from-black/80 to-blue-900/20 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-blue-100">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span>AI Predictions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg">
                <span className="text-blue-200">Next Week Volume</span>
                <span className="text-blue-100 font-semibold">+23% ↗️</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                <span className="text-green-200">Revenue Forecast</span>
                <span className="text-green-100 font-semibold">$2,340 📈</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg">
                <span className="text-purple-200">Peak Usage Hours</span>
                <span className="text-purple-100 font-semibold">2-4 PM EST 🕐</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-gradient-to-br from-black/80 to-green-900/20 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-green-100">
              <Zap className="w-5 h-5 text-green-400" />
              <span>AI Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                <p className="text-yellow-200 text-sm font-medium">High Priority</p>
                <p className="text-yellow-100 text-xs">Add Chinese (Simplified) - 67% user demand detected</p>
              </div>
              <div className="p-3 bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-200 text-sm font-medium">Optimization</p>
                <p className="text-blue-100 text-xs">Upgrade to Premium for 40% faster translations</p>
              </div>
              <div className="p-3 bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                <p className="text-purple-200 text-sm font-medium">Growth</p>
                <p className="text-purple-100 text-xs">API integration ready - 12 potential customers waiting</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
