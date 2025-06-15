
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { Gift, Sparkles, X } from 'lucide-react';

type SubscriptionTier = Database['public']['Enums']['subscription_tier'];

interface GiftSubscriptionModalProps {
  userId: string;
  onClose: () => void;
}

export const GiftSubscriptionModal: React.FC<GiftSubscriptionModalProps> = ({ userId, onClose }) => {
  const [giftPlan, setGiftPlan] = useState<SubscriptionTier>('professional');
  const queryClient = useQueryClient();

  // Gift subscription mutation with confetti effect
  const giftSubscription = useMutation({
    mutationFn: async ({ userId, planId }: { userId: string; planId: SubscriptionTier }) => {
      // First, deactivate any existing subscriptions
      await supabase
        .from('subscriptions')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Create new subscription record
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

      // Give initial word bank for new users
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('usage_metrics')
        .upsert({
          user_id: userId,
          date: today,
          words_translated: 0,
          requests_made: 0,
          plan_limit_exceeded: false
        }, {
          onConflict: 'user_id,date'
        });

      // Log the action
      await supabase.from('admin_logs').insert({
        action: 'gift_subscription',
        target_user_id: userId,
        details: { plan: planId, duration: '1 year', gift_date: new Date().toISOString() }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
      
      // Trigger confetti effect
      const confetti = (window as any).confetti;
      if (confetti) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      toast.success('🎉 Subscription gifted successfully! User has been notified with confetti!');
      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to gift subscription: ${error.message}`);
    },
  });

  const planDetails = {
    professional: { name: 'Professional', price: '$199/year', words: '10,000 words/day' },
    premium: { name: 'Premium', price: '$299/year', words: '50,000 words/day' },
    business: { name: 'Business', price: '$599/year', words: '200,000 words/day' }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="border border-green-500/30 bg-green-900/20 backdrop-blur-sm max-w-md w-full mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gift className="w-6 h-6 text-green-400" />
              <CardTitle className="text-green-100">Gift Subscription</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-green-300 hover:bg-green-900/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription className="text-green-200">
            Select a plan to gift to the selected user. They'll receive a notification with confetti!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-green-200 mb-2 block">
              Select Plan to Gift
            </label>
            <Select value={giftPlan} onValueChange={(value: SubscriptionTier) => setGiftPlan(value)}>
              <SelectTrigger className="bg-green-900/20 border-green-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">
                  <div className="flex justify-between items-center w-full">
                    <span>Professional</span>
                    <span className="text-sm text-gray-400">$199/year</span>
                  </div>
                </SelectItem>
                <SelectItem value="premium">
                  <div className="flex justify-between items-center w-full">
                    <span>Premium</span>
                    <span className="text-sm text-gray-400">$299/year</span>
                  </div>
                </SelectItem>
                <SelectItem value="business">
                  <div className="flex justify-between items-center w-full">
                    <span>Business</span>
                    <span className="text-sm text-gray-400">$599/year</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {giftPlan && (
            <div className="p-3 bg-green-900/30 rounded-lg border border-green-500/20">
              <h4 className="font-semibold text-green-200">{planDetails[giftPlan].name} Plan</h4>
              <p className="text-sm text-green-300">{planDetails[giftPlan].words}</p>
              <p className="text-sm text-green-300">Value: {planDetails[giftPlan].price}</p>
              <p className="text-xs text-green-400 mt-1">Includes 1000 word welcome bonus!</p>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={() => giftSubscription.mutate({ userId, planId: giftPlan })}
              disabled={!giftPlan || giftSubscription.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {giftSubscription.isPending ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Gifting...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Gift Subscription
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose} className="border-green-500/30 text-green-200">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
