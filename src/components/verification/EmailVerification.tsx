
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Check, AlertTriangle, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailVerificationProps {
  email: string;
  isVerified: boolean;
  onVerificationComplete: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  isVerified,
  onVerificationComplete
}) => {
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const resendVerification = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.functions.invoke('send-verification', {
        body: {
          type: 'email',
          email: email
        }
      });

      if (error) throw error;
      
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
      
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <Card className="border-green-500/30 bg-green-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-green-400">
            <Check className="w-5 h-5" />
            <span>Email Verified</span>
          </CardTitle>
          <CardDescription className="text-green-200">
            Your email address {email} is verified and secure.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-orange-500/30 bg-orange-900/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-400">
          <Mail className="w-5 h-5" />
          <span>Verify Email Address</span>
          <Badge variant="outline" className="border-orange-500 text-orange-200 bg-orange-900">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Unverified
          </Badge>
        </CardTitle>
        <CardDescription className="text-orange-200">
          Please check your email and click the verification link we sent to {email}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={resendVerification}
          disabled={isResending || cooldown > 0}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-orange-300/30 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 lava-effect"></div>
          <div className="relative z-10 flex items-center justify-center">
            {isResending ? (
              <>
                <Shield className="w-4 h-4 mr-2 animate-spin" />
                Sending Email...
              </>
            ) : cooldown > 0 ? (
              `Resend Email (${cooldown}s)`
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Resend Verification Email
              </>
            )}
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};
