
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Settings, Sparkles, Eye } from 'lucide-react';

export const TranslationInstructions: React.FC = () => {
  return (
    <Card className="border-blue-500/30 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 animate-pulse"></div>
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center space-x-3 text-2xl font-bold text-blue-100">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Website Translation Condom™
          </span>
        </CardTitle>
        <CardDescription className="text-blue-200 text-lg">
          Slip a translation layer over any website - preserving design, functionality, and user experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105">
            <Globe className="w-12 h-12 text-blue-400 mx-auto mb-3 animate-bounce" />
            <h3 className="font-bold text-blue-200 mb-2">Enter Website</h3>
            <p className="text-sm text-blue-300">Any URL - ecommerce, blogs, social media</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105">
            <Settings className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-spin-slow" />
            <h3 className="font-bold text-purple-200 mb-2">AI Crawlers Deploy</h3>
            <p className="text-sm text-purple-300">Scan, extract, and understand context</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 rounded-xl border border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300 transform hover:scale-105">
            <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-3 animate-pulse" />
            <h3 className="font-bold text-indigo-200 mb-2">Contextual Translation</h3>
            <p className="text-sm text-indigo-300">Like a local speaking to locals</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-900/40 to-green-800/40 rounded-xl border border-green-500/30 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105">
            <Eye className="w-12 h-12 text-green-400 mx-auto mb-3 animate-pulse" />
            <h3 className="font-bold text-green-200 mb-2">Perfect Clone</h3>
            <p className="text-sm text-green-300">Identical design, translated content</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🧠</span>
            </div>
            <div>
              <h4 className="font-bold text-yellow-200 mb-2">Neuronix Brain Technology</h4>
              <p className="text-blue-200 text-sm leading-relaxed">
                Our neural translation network understands cultural nuances, local expressions, humor, and context. 
                It's not just word conversion - it's cultural adaptation that makes your content feel native to each market.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="bg-yellow-600/20 text-yellow-200 border border-yellow-500/30">Cultural Context</Badge>
                <Badge className="bg-orange-600/20 text-orange-200 border border-orange-500/30">Local Expressions</Badge>
                <Badge className="bg-red-600/20 text-red-200 border border-red-500/30">Humor Preservation</Badge>
                <Badge className="bg-pink-600/20 text-pink-200 border border-pink-500/30">Tone Matching</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
