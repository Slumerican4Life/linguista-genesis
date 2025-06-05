
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, Activity, Shield } from 'lucide-react';
import { UserManagement } from './admin/UserManagement';
import { KnowledgeBase } from './admin/KnowledgeBase';
import { ActivityLogs } from './admin/ActivityLogs';

export const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white flex items-center space-x-3">
          <Shield className="w-8 h-8 text-purple-400" />
          <span>Admin Dashboard</span>
        </h2>
        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-sm font-bold">
          Owner/Manager Access
        </Badge>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-black/50 backdrop-blur-sm border border-purple-500/30">
          <TabsTrigger value="users" className="flex items-center space-x-2 text-sm font-bold data-[state=active]:bg-purple-600/40">
            <Users className="w-4 h-4" />
            <span>User Management</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center space-x-2 text-sm font-bold data-[state=active]:bg-purple-600/40">
            <FileText className="w-4 h-4" />
            <span>Knowledge Base</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center space-x-2 text-sm font-bold data-[state=active]:bg-purple-600/40">
            <Activity className="w-4 h-4" />
            <span>Activity Logs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <KnowledgeBase />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <ActivityLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};
