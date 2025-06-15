
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { User } from '@supabase/supabase-js';

interface AuthSectionProps {
  user: User | null;
  userProfile: any;
  onSignOut: () => void;
  onOpenAuthModal: (isSignUp: boolean) => void;
}

export const AuthSection: React.FC<AuthSectionProps> = ({
  user,
  userProfile,
  onSignOut,
  onOpenAuthModal
}) => {
  if (user) {
    return (
      <div className="flex items-center space-x-4">
        {userProfile && (
          <Badge variant="outline" className="px-6 py-3 font-black border-2 border-blue-400/60 text-blue-200 bg-gradient-to-r from-blue-900/60 to-purple-900/60 backdrop-blur-xl text-lg">
            {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
          </Badge>
        )}
        <div className="text-right bg-gradient-to-r from-blue-900/40 to-purple-900/40 px-4 py-2 rounded-xl backdrop-blur-sm border border-blue-400/30">
          <span className="text-lg text-blue-200 font-bold block">
            {userProfile?.full_name || user.email}
          </span>
          <span className="text-sm text-purple-300">Neural User</span>
        </div>
        <Button variant="outline" size="lg" onClick={onSignOut} className="border-2 border-red-400/60 text-red-300 hover:bg-red-900/40 bg-black/60 backdrop-blur-sm font-bold">
          <LogOut className="w-5 h-5 mr-2" />
          Neural Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Button onClick={() => onOpenAuthModal(false)} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl font-bold px-8 py-3">
        <LogIn className="w-5 h-5 mr-2" />
        Neural Access
      </Button>
      <Button onClick={() => onOpenAuthModal(true)} size="lg" variant="outline" className="border-2 border-blue-400/60 text-blue-200 hover:bg-blue-900/40 bg-black/60 backdrop-blur-sm font-bold px-8 py-3">
        Join Neuronix
      </Button>
    </div>
  );
};
