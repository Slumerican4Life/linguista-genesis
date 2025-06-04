
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ThumbsUp, ThumbsDown, Copy, Volume2 } from 'lucide-react';

interface TranslationPreviewProps {
  originalText: string;
  translations: Record<string, string>;
  isLoading: boolean;
}

const languageNames: Record<string, { name: string; flag: string }> = {
  'es': { name: 'Spanish', flag: '🇪🇸' },
  'fr': { name: 'French', flag: '🇫🇷' },
  'de': { name: 'German', flag: '🇩🇪' },
  'it': { name: 'Italian', flag: '🇮🇹' },
  'pt': { name: 'Portuguese', flag: '🇵🇹' },
  'ru': { name: 'Russian', flag: '🇷🇺' },
  'ja': { name: 'Japanese', flag: '🇯🇵' },
  'ko': { name: 'Korean', flag: '🇰🇷' },
  'zh': { name: 'Chinese', flag: '🇨🇳' },
  'ar': { name: 'Arabic', flag: '🇸🇦' },
  'hi': { name: 'Hindi', flag: '🇮🇳' },
  'th': { name: 'Thai', flag: '🇹🇭' }
};

export const TranslationPreview: React.FC<TranslationPreviewProps> = ({
  originalText,
  translations,
  isLoading
}) => {
  const [feedback, setFeedback] = React.useState<Record<string, 'up' | 'down' | null>>({});

  const handleFeedback = (langCode: string, type: 'up' | 'down') => {
    setFeedback(prev => ({
      ...prev,
      [langCode]: prev[langCode] === type ? null : type
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-r from-ai-blue-500 to-ai-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <Volume2 className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">AI Agents are working on your translations...</p>
          <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
        </div>
        
        {/* Loading Skeletons */}
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-2 border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Skeleton className="w-6 h-6 rounded" />
                  <Skeleton className="w-20 h-4" />
                </div>
                <Skeleton className="w-full h-16 mb-3" />
                <div className="flex space-x-2">
                  <Skeleton className="w-8 h-8 rounded" />
                  <Skeleton className="w-8 h-8 rounded" />
                  <Skeleton className="w-8 h-8 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!originalText.trim()) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Volume2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg">Enter text to see translations here</p>
        <p className="text-sm">Select your target languages and tone to get started</p>
      </div>
    );
  }

  if (Object.keys(translations).length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Volume2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg">Ready to translate</p>
        <p className="text-sm">Click "Translate with AI Agents" to begin</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Original Text */}
      <Card className="border-2 border-gray-200 bg-gray-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center space-x-2">
            <span className="w-6 h-6 bg-gray-600 text-white rounded flex items-center justify-center text-xs font-bold">
              EN
            </span>
            <span>Original Text</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-gray-800 leading-relaxed">{originalText}</p>
        </CardContent>
      </Card>

      {/* Translations */}
      <div className="space-y-3">
        {Object.entries(translations).map(([langCode, translation]) => {
          const lang = languageNames[langCode] || { name: langCode.toUpperCase(), flag: '🌐' };
          const userFeedback = feedback[langCode];
          
          return (
            <Card key={langCode} className="border-2 border-green-100 hover:border-green-200 transition-colors animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      AI Translated
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(translation)}
                      className="h-8 w-8 p-0 hover:bg-green-100"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-green-100"
                    >
                      <Volume2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-800 leading-relaxed mb-4">{translation}</p>
                
                {/* Feedback Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Rate this translation:</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleFeedback(langCode, 'up')}
                      className={`h-8 w-8 p-0 ${
                        userFeedback === 'up' 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'hover:bg-green-50'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleFeedback(langCode, 'down')}
                      className={`h-8 w-8 p-0 ${
                        userFeedback === 'down' 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'hover:bg-red-50'
                      }`}
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">
                    Confidence: 95%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
