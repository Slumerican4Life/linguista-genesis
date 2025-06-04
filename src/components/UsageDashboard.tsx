
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
  const wordsPercentage = (usage.wordsUsed / usage.wordsLimit) * 100;
  const languagesPercentage = (usage.languagesUsed / usage.languagesLimit) * 100;
  const isNearLimit = wordsPercentage >= 80;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <span>Usage Dashboard</span>
        </h2>
        <Badge 
          variant={usage.currentPlan === 'free' ? 'secondary' : 'default'}
          className="text-sm font-semibold px-3 py-1"
        >
          {usage.currentPlan.charAt(0).toUpperCase() + usage.currentPlan.slice(1)} Plan
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Words Usage */}
        <Card className={`${isNearLimit ? 'ring-2 ring-amber-500 bg-amber-50/50 dark:bg-amber-950/20' : ''} transition-all duration-300`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Words Used</span>
              {isNearLimit && <AlertTriangle className="w-5 h-5 text-amber-500" />}
            </CardTitle>
            <CardDescription>
              {formatNumber(usage.wordsUsed)} of {formatNumber(usage.wordsLimit)} words
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={wordsPercentage} 
              className={`h-3 ${isNearLimit ? 'bg-amber-100' : ''}`}
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{wordsPercentage.toFixed(1)}% used</span>
              <span>{formatNumber(usage.wordsLimit - usage.wordsUsed)} remaining</span>
            </div>
            {isNearLimit && (
              <div className="mt-3 p-2 bg-amber-100 dark:bg-amber-950/30 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                  ⚠️ You're running low on words. Consider upgrading!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Languages Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Languages</CardTitle>
            <CardDescription>
              {usage.languagesUsed} of {usage.languagesLimit === Infinity ? '∞' : usage.languagesLimit} languages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={usage.languagesLimit === Infinity ? 0 : languagesPercentage} 
              className="h-3"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>
                {usage.languagesLimit === Infinity ? 'Unlimited' : `${languagesPercentage.toFixed(1)}% used`}
              </span>
              <span>
                {usage.languagesLimit === Infinity 
                  ? 'No limits' 
                  : `${usage.languagesLimit - usage.languagesUsed} remaining`
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Billing Cycle */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Billing Cycle</span>
            </CardTitle>
            <CardDescription>
              {usage.daysUntilReset} days until reset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Translations today</span>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{usage.translationsToday}</span>
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Next reset</span>
                <span className="text-sm font-medium">
                  {new Date(Date.now() + usage.daysUntilReset * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <span>Need More Words?</span>
            </CardTitle>
            <CardDescription>
              Upgrade your plan or buy one-time credits to continue translating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-3">
              <Button onClick={onUpgrade} className="flex-1">
                Upgrade Plan
              </Button>
              <Button variant="outline" className="flex-1">
                Buy Credits
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span>Usage Insights</span>
            </CardTitle>
            <CardDescription>
              Your translation patterns and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Most used language:</span>
                <span className="font-medium">Spanish</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg. words/translation:</span>
                <span className="font-medium">247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Favorite tone:</span>
                <span className="font-medium">Professional</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
