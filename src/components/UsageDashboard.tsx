
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Calendar, Zap, AlertTriangle } from 'lucide-react';

interface UsageData {
  wordsUsed: number;
  wordsLimit: number;
  languagesUsed: number;
  languagesLimit: number;
  currentPlan: string;
  daysUntilReset: number;
  translationsToday: number;
}

interface UsageDashboardProps {
  usage: UsageData;
  onUpgrade: () => void;
}

export const UsageDashboard: React.FC<UsageDashboardProps> = ({ usage, onUpgrade }) => {
  const wordsPercentage = usage.wordsLimit > 0 ? (usage.wordsUsed / usage.wordsLimit) * 100 : 0;
  const languagesPercentage = usage.languagesLimit > 0 ? (usage.languagesUsed / usage.languagesLimit) * 100 : 0;
  const isNearLimit = wordsPercentage >= 80;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'free': return 'Free';
      case 'professional': return 'Professional';
      case 'premium': return 'Premium';
      case 'business': return 'Business';
      default: return plan.charAt(0).toUpperCase() + plan.slice(1);
    }
  };

  const getPlanBenefits = (plan: string) => {
    switch (plan) {
      case 'free': 
        return 'Basic translation features with limited usage';
      case 'professional': 
        return 'Advanced features with higher limits';
      case 'premium': 
        return 'Premium AI models with extensive usage';
      case 'business': 
        return 'Enterprise features with unlimited usage';
      default: 
        return 'Standard features available';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center space-x-2 text-white">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <span>Usage Dashboard</span>
        </h2>
        <Badge 
          variant={usage.currentPlan === 'free' ? 'secondary' : 'default'}
          className="text-sm font-semibold px-3 py-1 bg-purple-700 text-white border border-purple-500"
        >
          {getPlanDisplayName(usage.currentPlan)} Plan
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Words Usage */}
        <Card className={`${isNearLimit ? 'ring-2 ring-red-500 bg-black border-red-500' : 'bg-black border-blue-600'} transition-all duration-300`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between text-white">
              <span>Words Used</span>
              {isNearLimit && <AlertTriangle className="w-5 h-5 text-red-500" />}
            </CardTitle>
            <CardDescription className="text-blue-300">
              {formatNumber(usage.wordsUsed)} of {formatNumber(usage.wordsLimit)} words
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={wordsPercentage} 
              className={`h-3 ${isNearLimit ? 'bg-red-900' : 'bg-blue-900'}`}
            />
            <div className="flex justify-between text-sm text-blue-200 mt-2">
              <span>{wordsPercentage.toFixed(1)}% used</span>
              <span>{formatNumber(Math.max(0, usage.wordsLimit - usage.wordsUsed))} remaining</span>
            </div>
            {isNearLimit && usage.wordsUsed > 0 && (
              <div className="mt-3 p-2 bg-red-900 rounded-lg border border-red-500">
                <p className="text-sm text-red-200 font-medium">
                  ⚠️ You're running low on words. Consider upgrading!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Languages Usage */}
        <Card className="bg-black border-blue-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">Languages Available</CardTitle>
            <CardDescription className="text-blue-300">
              {usage.languagesUsed} of {usage.languagesLimit === Infinity ? '∞' : usage.languagesLimit} languages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={usage.languagesLimit === Infinity ? 20 : languagesPercentage} 
              className="h-3 bg-blue-900"
            />
            <div className="flex justify-between text-sm text-blue-200 mt-2">
              <span>
                {usage.languagesLimit === Infinity ? 'Unlimited access' : `${languagesPercentage.toFixed(1)}% used`}
              </span>
              <span>
                {usage.languagesLimit === Infinity 
                  ? 'No limits' 
                  : `${Math.max(0, usage.languagesLimit - usage.languagesUsed)} remaining`
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Billing Cycle */}
        <Card className="bg-black border-blue-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2 text-white">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span>Billing Cycle</span>
            </CardTitle>
            <CardDescription className="text-blue-300">
              {usage.daysUntilReset} days until reset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-200">Translations today</span>
                <Badge variant="outline" className="flex items-center space-x-1 border-blue-500 text-blue-200 bg-blue-900">
                  <TrendingUp className="w-3 h-3" />
                  <span>{usage.translationsToday}</span>
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-200">Next reset</span>
                <span className="text-sm font-medium text-white">
                  {new Date(Date.now() + usage.daysUntilReset * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black border-purple-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Zap className="w-5 h-5 text-purple-500" />
              <span>Need More Capacity?</span>
            </CardTitle>
            <CardDescription className="text-blue-200">
              {usage.currentPlan === 'free' 
                ? 'Upgrade your plan to get more words and advanced features'
                : 'You can always upgrade to a higher tier for more capacity'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-3">
              <Button onClick={onUpgrade} className="flex-1 bg-purple-700 hover:bg-purple-800 text-white">
                Upgrade Plan
              </Button>
              {usage.currentPlan !== 'free' && (
                <Button variant="outline" className="flex-1 border-blue-500 text-blue-200 hover:bg-blue-900 bg-black">
                  Buy Credits
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-blue-600">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Plan Information</span>
            </CardTitle>
            <CardDescription className="text-blue-200">
              {getPlanBenefits(usage.currentPlan)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-200">Current plan:</span>
                <span className="font-medium text-white">{getPlanDisplayName(usage.currentPlan)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Word limit:</span>
                <span className="font-medium text-white">{formatNumber(usage.wordsLimit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Language access:</span>
                <span className="font-medium text-white">
                  {usage.languagesLimit === Infinity ? 'Unlimited' : usage.languagesLimit}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Message for New Users */}
      {usage.translationsToday === 0 && usage.wordsUsed === 0 && (
        <Card className="bg-black border-purple-700">
          <CardHeader>
            <CardTitle className="text-white">Welcome to Linguista! 🚀</CardTitle>
            <CardDescription className="text-blue-200">
              You haven't made any translations yet. Head to the Translate tab to get started with our AI-powered translation agents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.hash = '#translate'} className="bg-purple-700 hover:bg-purple-800 text-white">
              Start Translating
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
