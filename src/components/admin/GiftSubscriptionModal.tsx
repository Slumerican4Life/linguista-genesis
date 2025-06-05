
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type SubscriptionTier = Database['public']['Enums']['subscription_tier'];

interface GiftSubscriptionModalProps {
  userId: string;
  onClose: () => void;
}

export const GiftSubscriptionModal: React.FC<GiftSubscriptionModalProps> = ({ userId, onClose }) => {
  const [giftPlan, setGiftPlan] = useState<SubscriptionTier>('professional');
  const queryClient = useQueryClient();

  // Gift subscription mutation
  const giftSubscription = useMutation({
    mutationFn: async ({ userId, planId }: { userId: string; planId: SubscriptionTier }) => {
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
      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to gift subscription: ${error.message}`);
    },
  });

  return (
    <Card className="border border-green-500/30 bg-green-900/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-green-100">Gift Subscription</CardTitle>
        <CardDescription className="text-green-200">
          Select a plan to gift to the selected user
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={giftPlan} onValueChange={(value: SubscriptionTier) => setGiftPlan(value)}>
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
            onClick={() => giftSubscription.mutate({ userId, planId: giftPlan })}
            disabled={!giftPlan || giftSubscription.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {giftSubscription.isPending ? 'Gifting...' : 'Gift Subscription'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
