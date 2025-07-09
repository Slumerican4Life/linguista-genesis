import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Users, Globe, DollarSign, Activity, Star, Shield, Crown } from 'lucide-react';

export const UserAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['user-analytics'],
    queryFn: async () => {
      const [profilesRes, translationsRes, subscriptionsRes, usageRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('translation_requests').select('*'),
        supabase.from('subscriptions').select('*'),
        supabase.from('usage_metrics').select('*')
      ]);

      const profiles = profilesRes.data || [];
      const translations = translationsRes.data || [];
      const subscriptions = subscriptionsRes.data || [];
      const usage = usageRes.data || [];

      // Calculate metrics
      const totalUsers = profiles.length;
      const activeSubscriptions = subscriptions.filter(s => s.is_active).length;
      const totalRevenue = activeSubscriptions * 299; // Simplified calculation
      const totalWords = usage.reduce((sum, u) => sum + u.words_translated, 0);
      const totalTranslations = translations.length;

      // User distribution by role
      const roleDistribution = profiles.reduce((acc, profile) => {
        acc[profile.role] = (acc[profile.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Subscription tier distribution
      const tierDistribution = subscriptions.filter(s => s.is_active).reduce((acc, sub) => {
        acc[sub.tier] = (acc[sub.tier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Recent activity (last 7 days)
      const recentUsers = profiles.filter(p => 
        new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;

      const recentTranslations = translations.filter(t => 
        new Date(t.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;

      return {
        totalUsers,
        activeSubscriptions,
        totalRevenue,
        totalWords,
        totalTranslations,
        roleDistribution,
        tierDistribution,
        recentUsers,
        recentTranslations,
        conversionRate: totalUsers > 0 ? (activeSubscriptions / totalUsers * 100).toFixed(1) : '0',
        averageWordsPerUser: totalUsers > 0 ? Math.round(totalWords / totalUsers) : 0
      };
    },
  });

  if (isLoading) {
    return (
      <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-purple-200 mt-4">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'manager': return <Shield className="w-5 h-5 text-blue-500" />;
      default: return <Users className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'business': return <Crown className="w-4 h-4 text-purple-500" />;
      case 'premium': return <Star className="w-4 h-4 text-blue-500" />;
      case 'professional': return <Activity className="w-4 h-4 text-green-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-black border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-200">Total Users</p>
                <p className="text-2xl font-bold text-white">{analytics?.totalUsers || 0}</p>
                <p className="text-xs text-purple-300">+{analytics?.recentUsers || 0} this week</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-200">Active Subscriptions</p>
                <p className="text-2xl font-bold text-white">{analytics?.activeSubscriptions || 0}</p>
                <p className="text-xs text-green-300">{analytics?.conversionRate}% conversion</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-200">Total Translations</p>
                <p className="text-2xl font-bold text-white">{analytics?.totalTranslations || 0}</p>
                <p className="text-xs text-blue-300">+{analytics?.recentTranslations || 0} this week</p>
              </div>
              <Globe className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-yellow-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-200">Est. Revenue</p>
                <p className="text-2xl font-bold text-white">${(analytics?.totalRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-yellow-300">Monthly recurring</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-100">User Roles Distribution</CardTitle>
            <CardDescription className="text-purple-200">
              Breakdown of user roles across the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analytics?.roleDistribution || {}).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between p-3 bg-purple-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(role)}
                  <span className="text-white font-medium capitalize">{role}</span>
                </div>
                <Badge className="bg-purple-600 text-white">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-green-500/30 bg-black/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-green-100">Subscription Tiers</CardTitle>
            <CardDescription className="text-green-200">
              Active subscriptions by tier level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analytics?.tierDistribution || {}).map(([tier, count]) => (
              <div key={tier} className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  {getTierIcon(tier)}
                  <span className="text-white font-medium capitalize">{tier}</span>
                </div>
                <Badge className="bg-green-600 text-white">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <Card className="border border-blue-500/30 bg-black/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-blue-100">Platform Performance</CardTitle>
          <CardDescription className="text-blue-200">
            Key performance indicators and usage statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-300">Total Words Processed</p>
              <p className="text-2xl font-bold text-white">{(analytics?.totalWords || 0).toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-300">Avg Words per User</p>
              <p className="text-2xl font-bold text-white">{analytics?.averageWordsPerUser || 0}</p>
            </div>
            <div className="text-center p-4 bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-300">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">{analytics?.conversionRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};