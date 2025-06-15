
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface LiveDemoSectionProps {
  onStartDemo: () => void;
  isLoggedIn: boolean;
}

export const LiveDemoSection: React.FC<LiveDemoSectionProps> = ({
  onStartDemo,
  isLoggedIn
}) => {
  const handleLiveDemo = () => {
    onStartDemo();
    toast.success('🎬 Starting live translation demonstration!');
  };

  return (
    <Card className="border-green-500/50 bg-gradient-to-br from-green-900/20 to-black/80 backdrop-blur-lg shadow-2xl">
      <CardHeader className={isLoggedIn ? "bg-gradient-to-r from-green-900/60 to-blue-900/60 rounded-t-lg border-b border-green-500/30" : ""}>
        <CardTitle className="flex items-center space-x-4 text-green-100">
          <Zap className="w-6 h-6 animate-pulse" />
          <div>
            <span className="text-xl font-black">
              {isLoggedIn ? "Translation Proof of Concept" : "See Translation in Action!"}
            </span>
            <p className="text-green-200 text-sm font-normal mt-1">
              {isLoggedIn ? "See the AI translation in action" : "Watch how any website gets translated instantly with AI"}
            </p>
          </div>
        </CardTitle>
        <CardDescription className="text-green-200">
          {isLoggedIn 
            ? "Click below to see a live demonstration of how any website gets translated"
            : "Watch how any website gets translated instantly with AI"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 text-center space-y-6">
        {!isLoggedIn && (
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-green-100">See Translation in Action!</h3>
            <p className="text-green-200 text-lg">Watch how any website gets translated instantly with AI</p>
          </div>
        )}
        
        <Button
          onClick={handleLiveDemo}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold px-8 py-4 text-lg"
        >
          <Play className="w-5 h-5 mr-2" />
          {isLoggedIn ? "Watch Live Translation Demo" : "Watch Live Demo"}
        </Button>
      </CardContent>
    </Card>
  );
};
