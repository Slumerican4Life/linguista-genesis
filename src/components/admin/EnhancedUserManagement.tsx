
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Search, Gift, Crown, Shield, Phone, Mail, Calendar, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { GiftSubscriptionModal } from './GiftSubscriptionModal';

type UserRole = Database['public']['Enums']['app_role'];
type SubscriptionTier = Database['public']['Enums']['subscription_tier'];
type ProfileWithSubscription = Database['public']['Tables']['profiles']['Row'] & {
  subscriptions: Database['public']['Tables']['subscriptions']['Row'][] | null;
};

export const EnhancedUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'email' | 'phone' | 'name'>('email');
  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading } = useQuery<ProfileWithSubscription[]>({
    queryKey: ['admin-users', searchTerm, searchType],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*, subscriptions(*)')
        .order('created_at', { ascending: false });

      if (searchTerm.trim()) {
        const filterTerm = `%${searchTerm.trim()}%`;
        switch (searchType) {
          case 'email':
            query = query.ilike('email', filterTerm);
            break;
          case 'phone':
            query = query.ilike('phone_number', filterTerm);
            break;
          case 'name':
            query = query.ilike('full_name', filterTerm);
            break;
        }
      }

      const { data, error } = await query;
      if (error) {
        toast.error(`Failed to fetch users: ${error.message}`);
        throw error;
      }
      return data || [];
    },
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;

      await supabase.from('admin_logs').insert({
        action: 'role_update',
        target_user_id: userId,
        details: { new_role: newRole }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update user role: ${error.message}`);
    },
  });

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'manager': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'creator': return <Crown className="w-4 h-4 text-purple-400" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPlanBadgeColor = (tier: SubscriptionTier | 'free') => {
    switch (tier) {
      case 'business': return 'bg-purple-600';
      case 'premium': return 'bg-blue-600';
      case 'professional': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-purple-100">User Management & Gifting</CardTitle>
          <CardDescription className="text-purple-200">
            View all registered users. Search to filter, or scroll to find users and manage their roles or gift subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Select value={searchType} onValueChange={(value: 'email' | 'phone' | 'name') => setSearchType(value)}>
              <SelectTrigger className="w-32 bg-purple-900/20 border-purple-500/30 text-white">
                <SelectValue placeholder="Search by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email"><div className="flex items-center"><Mail className="w-4 h-4 mr-2" />Email</div></SelectItem>
                <SelectItem value="phone"><div className="flex items-center"><Phone className="w-4 h-4 mr-2" />Phone</div></SelectItem>
                <SelectItem value="name"><div className="flex items-center"><Users className="w-4 h-4 mr-2" />Name</div></SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <Input
                placeholder={`Search by ${searchType}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-purple-900/20 border-purple-500/30 text-white placeholder:text-purple-300"
              />
            </div>
          </div>

          <div className="text-sm text-purple-300">
            {usersLoading ? 'Loading users...' : `Showing ${users?.length || 0} users ${searchTerm ? `matching your search` : 'in total'}.`}
          </div>

          <ScrollArea className="h-[60vh] rounded-lg border border-purple-500/30">
            <Table>
              <TableHeader className="bg-purple-900/40 sticky top-0 z-10">
                <TableRow className="border-b-0">
                  <TableHead className="text-purple-100">User Details</TableHead>
                  <TableHead className="text-purple-100">Role</TableHead>
                  <TableHead className="text-purple-100">Plan</TableHead>
                  <TableHead className="text-purple-100">Joined</TableHead>
                  <TableHead className="text-right text-purple-100">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex justify-center items-center text-purple-200">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id} className="border-purple-500/30 bg-black/40 hover:bg-purple-900/20">
                      <TableCell>
                        <div className="font-medium text-white">{user.full_name || 'N/A'}</div>
                        <div className="text-sm text-purple-300">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(newRole: UserRole) => updateUserRole.mutate({ userId: user.id, newRole })}
                          disabled={updateUserRole.isPending}
                        >
                          <SelectTrigger className="w-32 bg-purple-900/20 border-purple-500/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="creator">Creator</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getPlanBadgeColor((user.subscriptions && user.subscriptions.length > 0 && user.subscriptions[0].tier) ? user.subscriptions[0].tier : 'free')} text-white`}>
                          {(user.subscriptions && user.subscriptions.length > 0 && user.subscriptions[0].tier) ? user.subscriptions[0].tier : 'Free'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-purple-300">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUserId(user.id)}
                          className="border-green-500 text-green-300 hover:bg-green-900/20"
                        >
                          <Gift className="w-4 h-4 mr-2" />
                          Gift Plan
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-purple-200">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedUserId && (
        <GiftSubscriptionModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
};
