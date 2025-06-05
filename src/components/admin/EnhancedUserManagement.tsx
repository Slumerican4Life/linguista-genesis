
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Gift, Crown, Shield, Mail, Phone, Calendar, TrendingUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['app_role'];
type SubscriptionTier = Database['public']['Enums']['subscription_tier'];

export const EnhancedUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch all users with enhanced data
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users-enhanced', searchTerm, selectedFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          subscriptions(*),
          usage_metrics(
            words_translated,
            requests_made,
            date
          ),
          translation_requests(count)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%, full_name.ilike.%${searchTerm}%, phone_number.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by verification status if needed
      if (selectedFilter !== 'all') {
        return data?.filter(user => {
          // Safe access to verification fields that may not exist yet
          const phoneVerified = !!(user as any)?.phone_verified_at;
          const emailVerified = !!(user as any)?.email_verified_at;
          
          switch (selectedFilter) {
            case 'verified': return phoneVerified && emailVerified;
            case 'unverified': return !phoneVerified || !emailVerified;
            case 'phone-pending': return !phoneVerified;
            case 'email-pending': return !emailVerified;
            case 'premium': return user.subscriptions?.[0]?.tier !== 'free';
            case 'free': return !user.subscriptions?.[0] || user.subscriptions?.[0]?.tier === 'free';
            default: return true;
          }
        });
      }

      return data;
    },
  });

  // Manual verification override
  const manualVerification = useMutation({
    mutationFn: async ({ userId, type }: { userId: string; type: 'email' | 'phone' }) => {
      const updateField = type === 'email' ? 'email_verified_at' : 'phone_verified_at';
      
      // Try to update the profile with verification timestamp
      // This will fail gracefully if the column doesn't exist yet
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            [updateField]: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (error) {
          console.warn(`Column ${updateField} may not exist yet:`, error);
          throw new Error(`Manual verification will be available after database migration`);
        }

        // Log the admin action if admin_logs table is accessible
        try {
          await supabase.from('admin_logs').insert({
            action: `manual_${type}_verification`,
            target_user_id: userId,
            details: { type, verified_at: new Date().toISOString() }
          });
        } catch (logError) {
          console.warn('Failed to log admin action:', logError);
        }
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-enhanced'] });
      toast.success(`${type} verification manually completed`);
    },
    onError: (error) => {
      toast.error(`Failed to update verification: ${error.message}`);
    },
  });

  // Gift subscription mutation
  const giftSubscription = useMutation({
    mutationFn: async ({ userId, tier, duration }: { userId: string; tier: SubscriptionTier; duration: number }) => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);

      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          tier,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          is_active: true
        });
      
      if (error) throw error;

      // Log the action if admin_logs table is accessible
      try {
        await supabase.from('admin_logs').insert({
          action: 'gift_subscription',
          target_user_id: userId,
          details: { tier, duration_days: duration }
        });
      } catch (logError) {
        console.warn('Failed to log admin action:', logError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-enhanced'] });
      toast.success('Subscription gifted successfully');
      setSelectedUserId(null);
    },
    onError: (error) => {
      toast.error(`Failed to gift subscription: ${error.message}`);
    },
  });

  const getVerificationStatus = (user: any) => {
    // Safe access to verification fields that may not exist yet
    const emailVerified = !!(user as any)?.email_verified_at;
    const phoneVerified = !!(user as any)?.phone_verified_at;

    if (emailVerified && phoneVerified) {
      return { status: 'verified', color: 'bg-green-600', text: 'Fully Verified' };
    } else if (emailVerified || phoneVerified) {
      return { status: 'partial', color: 'bg-yellow-600', text: 'Partially Verified' };
    } else {
      return { status: 'unverified', color: 'bg-red-600', text: 'Unverified' };
    }
  };

  const getUserMetrics = (user: any) => {
    const totalWords = user.usage_metrics?.reduce((sum: number, metric: any) => sum + metric.words_translated, 0) || 0;
    const totalRequests = user.usage_metrics?.reduce((sum: number, metric: any) => sum + metric.requests_made, 0) || 0;
    const translationCount = user.translation_requests?.[0]?.count || 0;

    return { totalWords, totalRequests, translationCount };
  };

  return (
    <div className="space-y-6">
      <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-purple-100">Enhanced User Management</CardTitle>
          <CardDescription className="text-purple-200">
            Advanced search, verification override, and subscription management
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
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48 bg-purple-900/20 border-purple-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="verified">Fully Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="phone-pending">Phone Pending</SelectItem>
                <SelectItem value="email-pending">Email Pending</SelectItem>
                <SelectItem value="premium">Premium Users</SelectItem>
                <SelectItem value="free">Free Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {usersLoading ? (
            <div className="text-center py-8 text-purple-200">Loading users...</div>
          ) : (
            <div className="rounded-lg border border-purple-500/30 overflow-hidden">
              <Table>
                <TableHeader className="bg-purple-900/40">
                  <TableRow className="border-purple-500/30">
                    <TableHead className="text-purple-100">User Details</TableHead>
                    <TableHead className="text-purple-100">Verification</TableHead>
                    <TableHead className="text-purple-100">Subscription</TableHead>
                    <TableHead className="text-purple-100">Usage</TableHead>
                    <TableHead className="text-purple-100">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => {
                    const verification = getVerificationStatus(user);
                    const metrics = getUserMetrics(user);
                    const currentPlan = user.subscriptions?.[0]?.tier || 'free';
                    // Safe access to verification fields
                    const emailVerified = !!(user as any)?.email_verified_at;
                    const phoneVerified = !!(user as any)?.phone_verified_at;

                    return (
                      <TableRow key={user.id} className="border-purple-500/30 bg-black/40">
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-white flex items-center">
                              {user.full_name || 'No name'}
                              {user.role === 'owner' && <Crown className="w-4 h-4 ml-2 text-yellow-500" />}
                              {user.role === 'manager' && <Shield className="w-4 h-4 ml-2 text-blue-500" />}
                            </p>
                            <p className="text-sm text-purple-300 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email}
                            </p>
                            {user.phone_number && (
                              <p className="text-sm text-purple-300 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {user.phone_number}
                              </p>
                            )}
                            <p className="text-xs text-purple-400 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Joined {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Badge className={`${verification.color} text-white`}>
                              {verification.text}
                            </Badge>
                            <div className="flex space-x-1">
                              {!emailVerified && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => manualVerification.mutate({ userId: user.id, type: 'email' })}
                                  className="border-blue-400 text-blue-300 hover:bg-blue-900/20 text-xs"
                                >
                                  Verify Email
                                </Button>
                              )}
                              {!phoneVerified && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => manualVerification.mutate({ userId: user.id, type: 'phone' })}
                                  className="border-green-400 text-green-300 hover:bg-green-900/20 text-xs"
                                >
                                  Verify Phone
                                </Button>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${
                            currentPlan === 'business' ? 'bg-purple-600' :
                            currentPlan === 'premium' ? 'bg-blue-600' :
                            currentPlan === 'professional' ? 'bg-green-600' :
                            'bg-gray-600'
                          } text-white`}>
                            {currentPlan}
                          </Badge>
                          {user.subscriptions?.[0]?.end_date && (
                            <p className="text-xs text-purple-300 mt-1">
                              Expires: {new Date(user.subscriptions[0].end_date).toLocaleDateString()}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <p className="text-purple-200 flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {metrics.totalWords.toLocaleString()} words
                            </p>
                            <p className="text-purple-300">{metrics.totalRequests} requests</p>
                            <p className="text-purple-300">{metrics.translationCount} translations</p>
                          </div>
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
                              Gift
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gift Subscription Modal */}
      {selectedUserId && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <CardHeader className="bg-purple-900/80 rounded-t-lg">
              <CardTitle className="text-purple-100">Gift Subscription</CardTitle>
              <CardDescription className="text-purple-200">
                Grant premium access to this user
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-black/80 rounded-b-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => giftSubscription.mutate({ 
                    userId: selectedUserId, 
                    tier: 'professional', 
                    duration: 30 
                  })}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Professional (30d)
                </Button>
                <Button
                  onClick={() => giftSubscription.mutate({ 
                    userId: selectedUserId, 
                    tier: 'premium', 
                    duration: 30 
                  })}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Premium (30d)
                </Button>
                <Button
                  onClick={() => giftSubscription.mutate({ 
                    userId: selectedUserId, 
                    tier: 'business', 
                    duration: 30 
                  })}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Business (30d)
                </Button>
                <Button
                  onClick={() => setSelectedUserId(null)}
                  variant="outline"
                  className="border-gray-500 text-gray-300 hover:bg-gray-900/20"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
};
