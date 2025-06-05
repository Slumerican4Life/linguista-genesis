
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Gift, Upload, FileText, Activity, Crown, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [giftPlan, setGiftPlan] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*, subscriptions(*)')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%, full_name.ilike.%${searchTerm}%, phone_number.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch knowledge base files
  const { data: knowledgeFiles } = useQuery({
    queryKey: ['knowledge-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_files')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch admin activity logs
  const { data: adminLogs } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*, profiles!admin_logs_admin_id_fkey(full_name, email), profiles!admin_logs_target_user_id_fkey(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  // Update user role mutation
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;

      // Log the action
      await supabase.from('admin_logs').insert({
        action: 'role_update',
        target_user_id: userId,
        details: { new_role: newRole }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update user role: ${error.message}`);
    },
  });

  // Gift subscription mutation
  const giftSubscription = useMutation({
    mutationFn: async ({ userId, planId }: { userId: string; planId: string }) => {
      // Create subscription record
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          tier: planId,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          is_active: true
        });
      
      if (error) throw error;

      // Log the action
      await supabase.from('admin_logs').insert({
        action: 'gift_subscription',
        target_user_id: userId,
        details: { plan: planId, duration: '1 year' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
      toast.success('Subscription gifted successfully');
      setSelectedUserId(null);
      setGiftPlan('');
    },
    onError: (error) => {
      toast.error(`Failed to gift subscription: ${error.message}`);
    },
  });

  // Upload knowledge file mutation
  const uploadKnowledgeFile = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `knowledge/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('knowledge-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create database record
      const { error: dbError } = await supabase
        .from('knowledge_files')
        .insert({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath,
          description: 'Admin uploaded knowledge file'
        });

      if (dbError) throw dbError;

      // Log the action
      await supabase.from('admin_logs').insert({
        action: 'knowledge_upload',
        details: { file_name: file.name, file_size: file.size }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-files'] });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
      toast.success('Knowledge file uploaded successfully');
      setUploadedFile(null);
    },
    onError: (error) => {
      toast.error(`Failed to upload file: ${error.message}`);
    },
  });

  const handleFileUpload = () => {
    if (uploadedFile) {
      uploadKnowledgeFile.mutate(uploadedFile);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'manager': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPlanBadgeColor = (tier: string) => {
    switch (tier) {
      case 'business': return 'bg-purple-600';
      case 'premium': return 'bg-blue-600';
      case 'professional': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

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

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-100">User Search & Management</CardTitle>
              <CardDescription className="text-purple-200">
                Search users by email, name, or phone number
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <Input
                    placeholder="Search by email, name, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-purple-900/20 border-purple-500/30 text-white placeholder:text-purple-300"
                  />
                </div>
              </div>

              {usersLoading ? (
                <div className="text-center py-8 text-purple-200">Loading users...</div>
              ) : (
                <div className="rounded-lg border border-purple-500/30 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-purple-900/40">
                      <TableRow className="border-purple-500/30">
                        <TableHead className="text-purple-100">User</TableHead>
                        <TableHead className="text-purple-100">Role</TableHead>
                        <TableHead className="text-purple-100">Plan</TableHead>
                        <TableHead className="text-purple-100">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user) => (
                        <TableRow key={user.id} className="border-purple-500/30 bg-black/40">
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-white">{user.full_name || 'No name'}</p>
                              <p className="text-sm text-purple-300">{user.email}</p>
                              {user.phone_number && (
                                <p className="text-sm text-purple-300">{user.phone_number}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getRoleIcon(user.role)}
                              <Select
                                value={user.role}
                                onValueChange={(newRole) => 
                                  updateUserRole.mutate({ userId: user.id, newRole })
                                }
                              >
                                <SelectTrigger className="w-24 bg-purple-900/20 border-purple-500/30 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="manager">Manager</SelectItem>
                                  <SelectItem value="owner">Owner</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getPlanBadgeColor(user.subscriptions?.[0]?.tier || 'free')} text-white`}>
                              {user.subscriptions?.[0]?.tier || 'free'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUserId(user.id)}
                                className="border-purple-400 text-purple-300 hover:bg-purple-900/20"
                              >
                                <Gift className="w-4 h-4 mr-1" />
                                Gift Plan
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gift Subscription Modal */}
          {selectedUserId && (
            <Card className="border border-green-500/30 bg-green-900/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-100">Gift Subscription</CardTitle>
                <CardDescription className="text-green-200">
                  Select a plan to gift to the selected user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={giftPlan} onValueChange={setGiftPlan}>
                  <SelectTrigger className="bg-green-900/20 border-green-500/30 text-white">
                    <SelectValue placeholder="Select plan to gift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional ($199/year)</SelectItem>
                    <SelectItem value="premium">Premium ($299/year)</SelectItem>
                    <SelectItem value="business">Business ($599/year)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => giftSubscription.mutate({ userId: selectedUserId, planId: giftPlan })}
                    disabled={!giftPlan || giftSubscription.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {giftSubscription.isPending ? 'Gifting...' : 'Gift Subscription'}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedUserId(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-6">
          <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-100">Knowledge Base Management</CardTitle>
              <CardDescription className="text-purple-200">
                Upload files to enhance Lyra's knowledge and translation capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-purple-200">Upload knowledge files, dictionaries, or language resources</p>
                    <p className="text-sm text-purple-300">Supports TXT, CSV, JSON, PDF files up to 10MB</p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <input
                      type="file"
                      onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                      accept=".txt,.csv,.json,.pdf"
                      className="hidden"
                      id="knowledge-upload"
                    />
                    <label htmlFor="knowledge-upload">
                      <Button variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-900/20" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                    {uploadedFile && (
                      <div className="space-y-2">
                        <p className="text-sm text-purple-200">Selected: {uploadedFile.name}</p>
                        <Button 
                          onClick={handleFileUpload}
                          disabled={uploadKnowledgeFile.isPending}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {uploadKnowledgeFile.isPending ? 'Uploading...' : 'Upload File'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Knowledge Files List */}
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-100">Uploaded Files</h4>
                <div className="space-y-2">
                  {knowledgeFiles?.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                      <div>
                        <p className="font-medium text-white">{file.file_name}</p>
                        <p className="text-sm text-purple-300">
                          {(file.file_size / 1024).toFixed(1)} KB • {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={file.is_active ? 'default' : 'secondary'}>
                        {file.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-100">Admin Activity Logs</CardTitle>
              <CardDescription className="text-purple-200">
                Track all admin actions and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminLogs?.map((log) => (
                  <div key={log.id} className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-white">{log.action.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-purple-300">
                          by {log.profiles?.full_name || log.profiles?.email || 'System'}
                        </p>
                        {log.details && (
                          <p className="text-xs text-purple-400">
                            {JSON.stringify(log.details)}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-purple-300">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
