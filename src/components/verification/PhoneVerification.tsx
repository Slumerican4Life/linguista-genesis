
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Phone, Check, AlertTriangle, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PhoneVerificationProps {
  phoneNumber: string;
  isVerified: boolean;
  onVerificationComplete: () => void;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  phoneNumber,
  isVerified,
  onVerificationComplete
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number first');
      return;
    }

    setIsVerifying(true);
    try {
      const { error } = await supabase.functions.invoke('send-verification', {
        body: {
          type: 'phone',
          phoneNumber: phoneNumber
        }
      });

      if (error) throw error;
      
      setCodeSent(true);
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast.success('Verification code sent to your phone');
    } catch (error) {
      console.error('Failed to send verification code:', error);
      toast.error('Failed to send verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    try {
      const { error } = await supabase.functions.invoke('verify-code', {
        body: {
          type: 'phone',
          phoneNumber: phoneNumber,
          code: verificationCode
        }
      });

      if (error) throw error;

      // Update profile with verification timestamp
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (updateError) throw updateError;

      toast.success('Phone number verified successfully!');
      onVerificationComplete();
      setVerificationCode('');
      setCodeSent(false);
    } catch (error) {
      console.error('Failed to verify code:', error);
      toast.error('Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerified) {
    return (
      <Card className="border-green-500/30 bg-green-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-green-400">
            <Check className="w-5 h-5" />
            <span>Phone Verified</span>
          </CardTitle>
          <CardDescription className="text-green-200">
            Your phone number {phoneNumber} is verified and secure.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-orange-500/30 bg-orange-900/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-400">
          <Phone className="w-5 h-5" />
          <span>Verify Phone Number</span>
          <Badge variant="outline" className="border-orange-500 text-orange-200 bg-orange-900">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Unverified
          </Badge>
        </CardTitle>
        <CardDescription className="text-orange-200">
          Verify your phone number to secure your account and enable SMS notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!codeSent ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-orange-200 mb-2 block">
                Phone Number: {phoneNumber}
              </label>
              <Button
                onClick={sendVerificationCode}
                disabled={isVerifying || !phoneNumber}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isVerifying ? (
                  <>
                    <Shield className="w-4 h-4 mr-2 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Send Verification Code
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-orange-200 mb-2 block">
                Enter 6-digit verification code
              </label>
              <Input
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="bg-orange-900/20 border-orange-500/30 text-white placeholder:text-orange-300"
                maxLength={6}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={verifyCode}
                disabled={isVerifying || verificationCode.length !== 6}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isVerifying ? (
                  <>
                    <Shield className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Verify Code
                  </>
                )}
              </Button>
              <Button
                onClick={sendVerificationCode}
                disabled={isVerifying || cooldown > 0}
                variant="outline"
                className="border-orange-500 text-orange-200 hover:bg-orange-900/20"
              >
                {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend Code'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
