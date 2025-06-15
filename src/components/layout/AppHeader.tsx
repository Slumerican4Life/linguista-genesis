
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bot, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthSection } from '@/components/auth/AuthSection';
import { NeuronixBrain } from '@/components/NeuronixBrain';
import { User } from '@supabase/supabase-js';

interface AppHeaderProps {
  user: User | null;
  userProfile: any;
  onSignOut: () => void;
  onOpenAuthModal: (isSignUp: boolean) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  userProfile,
  onSignOut,
  onOpenAuthModal
}) => {
  return (
    <header className="relative z-20 border-b-2 border-gradient-to-r from-purple-500/60 via-blue-500/60 to-indigo-500/60 bg-gradient-to-r from-slate-950/95 via-purple-950/50 to-blue-950/50 backdrop-blur-2xl shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 animate-shimmer"></div>
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="relative group">
              <NeuronixBrain size="lg" isActive className="hover:scale-110 transition-transform duration-500" />
            </div>

            <div className="space-y-2">
              <h1 className="text-6xl font-black bg-gradient-to-r from-purple-300 via-red-300 via-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl animate-gradient bg-size-200">
                Linguista
              </h1>
              <div className="flex items-center space-x-3">
                <p className="text-lg bg-gradient-to-r from-purple-200 via-red-200 to-blue-200 bg-clip-text text-transparent font-bold">
                  Powered by Neuronix Neural Engine
                </p>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
              <p className="text-sm text-purple-300/80 font-medium italic">
                ⚡ Next-Gen Language AI • Beyond Human Translation
              </p>
            </div>
            
            <div className="hidden lg:flex items-center space-x-6 ml-12 p-6 bg-gradient-to-br from-purple-900/60 via-red-900/30 to-blue-900/60 rounded-3xl border-2 border-purple-400/30 backdrop-blur-xl shadow-2xl">
              <NeuronixBrain size="sm" isActive />
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <p className="text-lg font-black bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    Neuronix Core
                  </p>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xs px-3 py-1">
                    ONLINE
                  </Badge>
                </div>
                <p className="text-sm text-purple-200 font-semibold">Advanced Neural Translation Matrix</p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-300 font-bold">Neural Paths: Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-300 font-bold">5 AI Agents Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-800/90 via-red-800/60 to-blue-800/90 text-white border-2 border-purple-400/40 px-6 py-3 font-black shadow-2xl text-lg">
              <Bot className="w-5 h-5 mr-3" />
              Neural Core Active
            </Badge>
            {userProfile && (
              <Badge variant="outline" className="px-6 py-3 font-black border-2 border-blue-400/60 text-blue-200 bg-gradient-to-r from-blue-900/60 to-purple-900/60 backdrop-blur-xl text-lg">
                <Shield className="w-5 h-5 mr-3" />
                {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
              </Badge>
            )}
            <AuthSection
              user={user}
              userProfile={userProfile}
              onSignOut={onSignOut}
              onOpenAuthModal={onOpenAuthModal}
            />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
