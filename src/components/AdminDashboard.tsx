
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BarChart3, Settings, FileText, TrendingUp, Globe, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedUserManagement } from './admin/EnhancedUserManagement';
import { ActivityLogs } from './admin/ActivityLogs';
import { KnowledgeBase } from './admin/KnowledgeBase';

export const AdminDashboard = () => {
  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersRes, translationsRes] = await Promise.all([
        supabase.from('profiles').select('id, role, created_at').order('created_at', { ascending: false }),
        supabase.from('translation_requests').select('id, status, created_at, word_count')
      ]);

      const totalUsers = usersRes.data?.length || 0;
      const newUsersThisWeek = usersRes.data?.filter(u => 
        new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0;

      const totalTranslations = translationsRes.data?.length || 0;
      const totalWords = translationsRes.data?.reduce((sum, t) => sum + (t.word_count || 0), 0) || 0;
      const translationsToday = translationsRes.data?.filter(t => 
        new Date(t.created_at).toDateString() === new Date().toDateString()
      ).length || 0;

      // Mock project data until translation_projects table is available in types
      const totalProjects = 0;
      const activeProjects = 0;
      const totalPages = 0;

      return {
        totalUsers,
        newUsersThisWeek,
        totalTranslations,
        totalWords,
        translationsToday,
        totalProjects,
        activeProjects,
        totalPages
      };
    },
  });

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-black border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-200">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-purple-300">+{stats?.newUsersThisWeek || 0} this week</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-200">Translations</p>
                <p className="text-2xl font-bold text-white">{stats?.totalTranslations || 0}</p>
                <p className="text-xs text-blue-300">{stats?.translationsToday || 0} today</p>
              </div>
              <Globe className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-200">Words Processed</p>
                <p className="text-2xl font-bold text-white">{(stats?.totalWords || 0).toLocaleString()}</p>
                <p className="text-xs text-green-300">Across all translations</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-200">Projects</p>
                <p className="text-2xl font-bold text-white">{stats?.totalProjects || 0}</p>
                <p className="text-xs text-orange-300">{stats?.activeProjects || 0} active</p>
              </div>
              <FileText className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-black border border-purple-600">
          <TabsTrigger value="users" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white text-purple-200">
            <Users className="w-4 h-4 mr-2" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white text-purple-200">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white text-purple-200">
            <Shield className="w-4 h-4 mr-2" />
            Activity Logs
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white text-purple-200">
            <FileText className="w-4 h-4 mr-2" />
            Knowledge Base
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <EnhancedUserManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-100">Platform Analytics</CardTitle>
              <CardDescription className="text-purple-200">
                Detailed insights into platform usage and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Usage Trends</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg">
                      <span className="text-purple-200">Daily Active Users</span>
                      <Badge className="bg-purple-600 text-white">Coming Soon</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg">
                      <span className="text-purple-200">Translation Quality Score</span>
                      <Badge className="bg-purple-600 text-white">Coming Soon</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg">
                      <span className="text-purple-200">Revenue Analytics</span>
                      <Badge className="bg-purple-600 text-white">Coming Soon</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">System Health</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                      <span className="text-green-200">API Status</span>
                      <Badge className="bg-green-600 text-white">Operational</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                      <span className="text-green-200">Database Status</span>
                      <Badge className="bg-green-600 text-white">Healthy</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg">
                      <span className="text-blue-200">Translation Engine</span>
                      <Badge className="bg-blue-600 text-white">Online</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <ActivityLogs />
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeBase />
        </TabsContent>
      </Tabs>
    </div>
  );
};
