
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Globe, Users } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="text-center space-y-8 mb-16">
      <div className="space-y-6">
        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 text-lg font-bold shadow-2xl border-none">
          <Brain className="w-5 h-5 mr-2" />
          Next-Generation AI Translation
        </Badge>
        
        <h2 className="text-5xl lg:text-7xl font-black bg-gradient-to-r from-purple-300 via-red-300 to-blue-300 bg-clip-text text-transparent leading-tight">
          Beyond Human Translation
        </h2>
        
        <p className="text-xl lg:text-2xl text-purple-200 max-w-4xl mx-auto leading-relaxed">
          Experience the future of language with our neural translation engine. 
          Powered by 5 specialized AI agents working in perfect harmony.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16">
        <div className="text-center space-y-4 p-6 bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-2xl border border-purple-500/30 backdrop-blur-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">Lightning Fast</h3>
          <p className="text-purple-200">AI agents process translations in seconds, not minutes</p>
        </div>

        <div className="text-center space-y-4 p-6 bg-gradient-to-br from-red-900/40 to-purple-900/40 rounded-2xl border border-red-500/30 backdrop-blur-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">Cultural Context</h3>
          <p className="text-red-200">Understands cultural nuances and local expressions</p>
        </div>

        <div className="text-center space-y-4 p-6 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-2xl border border-blue-500/30 backdrop-blur-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">Team Collaboration</h3>
          <p className="text-blue-200">Multiple AI agents working together for perfection</p>
        </div>
      </div>
    </div>
  );
};
