
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Gift, Crown, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { GiftSubscriptionModal } from './GiftSubscriptionModal';

type UserRole = Database['public']['Enums']['app_role'];
type SubscriptionTier = Database['public']['Enums']['subscription_tier'];

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
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

  // Update user role mutation
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
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

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'manager': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPlanBadgeColor = (tier: SubscriptionTier) => {
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
                            onValueChange={(newRole: UserRole) => 
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
        <GiftSubscriptionModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
};
