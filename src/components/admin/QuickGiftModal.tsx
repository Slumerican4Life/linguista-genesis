import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { Gift, Sparkles, X, Mail, Phone, Send } from 'lucide-react';

type SubscriptionTier = Database['public']['Enums']['subscription_tier'];

interface QuickGiftModalProps {
  onClose: () => void;
}

export const QuickGiftModal: React.FC<QuickGiftModalProps> = ({ onClose }) => {
  const [identifier, setIdentifier] = useState('');
  const [giftPlan, setGiftPlan] = useState<SubscriptionTier>('professional');
  const [searchType, setSearchType] = useState<'email' | 'phone'>('email');
  const queryClient = useQueryClient();

  // Quick gift subscription by email/phone
  const quickGift = useMutation({
    mutationFn: async ({ identifier, planId, searchType }: { identifier: string; planId: SubscriptionTier; searchType: 'email' | 'phone' }) => {
      // Find user by email or phone
      let query = supabase.from('profiles').select('*');
      
      if (searchType === 'email') {
        query = query.eq('email', identifier);
      } else {
        query = query.eq('phone_number', identifier);
      }
      
      const { data: users, error: userError } = await query;
      
      if (userError) throw userError;
      if (!users || users.length === 0) {
        throw new Error(`No user found with that ${searchType}`);
      }
      
      const user = users[0];
      
      // First, deactivate any existing subscriptions
      await supabase
        .from('subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Create new subscription record
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
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
          user_id: user.id,
          date: today,
          words_translated: 0,
          requests_made: 0,
          plan_limit_exceeded: false
        }, {
          onConflict: 'user_id,date'
        });

      // Log the action
      await supabase.from('admin_logs').insert({
        action: 'quick_gift_subscription',
        target_user_id: user.id,
        details: { 
          plan: planId, 
          duration: '1 year', 
          gift_date: new Date().toISOString(),
          identifier: identifier,
          search_type: searchType,
          user_name: user.full_name,
          user_email: user.email
        }
      });
      
      return { user, plan: planId };
    },
    onSuccess: (data) => {
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
      
      toast.success(`🎉 ${data.plan} plan gifted to ${data.user.full_name || data.user.email}!`);
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
      <Card className="border border-green-500/30 bg-green-900/20 backdrop-blur-sm max-w-lg w-full mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Send className="w-6 h-6 text-green-400" />
              <CardTitle className="text-green-100">Quick Gift by Contact</CardTitle>
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
            Instantly gift a subscription plan using email or phone number
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-green-200 block">
              Search Method
            </label>
            <Select value={searchType} onValueChange={(value: 'email' | 'phone') => setSearchType(value)}>
              <SelectTrigger className="bg-green-900/20 border-green-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Email Address</span>
                  </div>
                </SelectItem>
                <SelectItem value="phone">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>Phone Number</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-green-200 block">
              {searchType === 'email' ? 'Email Address' : 'Phone Number'}
            </label>
            <Input
              type={searchType === 'email' ? 'email' : 'tel'}
              placeholder={searchType === 'email' ? 'user@example.com' : '+1234567890'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="bg-green-900/20 border-green-500/30 text-white placeholder:text-green-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-green-200 block">
              Plan to Gift
            </label>
            <Select value={giftPlan} onValueChange={(value: SubscriptionTier) => setGiftPlan(value)}>
              <SelectTrigger className="bg-green-900/20 border-green-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">
                  <div className="flex justify-between items-center w-full">
                    <span>Professional</span>
                    <span className="text-sm text-gray-400 ml-4">$199/year</span>
                  </div>
                </SelectItem>
                <SelectItem value="premium">
                  <div className="flex justify-between items-center w-full">
                    <span>Premium</span>
                    <span className="text-sm text-gray-400 ml-4">$299/year</span>
                  </div>
                </SelectItem>
                <SelectItem value="business">
                  <div className="flex justify-between items-center w-full">
                    <span>Business</span>
                    <span className="text-sm text-gray-400 ml-4">$599/year</span>
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
              onClick={() => quickGift.mutate({ identifier, planId: giftPlan, searchType })}
              disabled={!identifier || !giftPlan || quickGift.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {quickGift.isPending ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Gifting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Gift Now
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