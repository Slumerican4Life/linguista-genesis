
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ToneSelector } from '@/components/ToneSelector';
import { TranslationPreview } from '@/components/TranslationPreview';
import { Bot, Zap, Globe, Brain, Sparkles } from 'lucide-react';

interface TranslationSectionProps {
  inputText: string;
  setInputText: (text: string) => void;
  selectedLanguages: string[];
  setSelectedLanguages: (languages: string[]) => void;
  selectedTone: string;
  setSelectedTone: (tone: string) => void;
  isTranslating: boolean;
  translations: Record<string, string>;
  onTranslate: () => void;
  currentPlan: string;
}

export const TranslationSection: React.FC<TranslationSectionProps> = ({
  inputText,
  setInputText,
  selectedLanguages,
  setSelectedLanguages,
  selectedTone,
  setSelectedTone,
  isTranslating,
  translations,
  onTranslate,
  currentPlan
}) => {
  const [contentDomain, setContentDomain] = React.useState('general');
  const [culturalContext, setCulturalContext] = React.useState('neutral');

  const handleTranslate = () => {
    if (!inputText.trim()) return;
    if (selectedLanguages.length === 0) return;
    onTranslate();
  };

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-br from-black/80 to-purple-900/20 border-2 border-purple-500/30 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-black bg-gradient-to-r from-purple-300 via-blue-300 to-green-300 bg-clip-text text-transparent flex items-center justify-center space-x-3">
            <Bot className="w-8 h-8 text-purple-400" />
            <span>Neural Translation Hub</span>
            <Brain className="w-8 h-8 text-blue-400" />
          </CardTitle>
          <CardDescription className="text-blue-200 text-lg">
            Powered by 5 specialized AI agents for contextually perfect translations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Input Section */}
          <div className="space-y-4">
            <label className="text-purple-200 font-semibold text-lg flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>Enter your text</span>
            </label>
            <Textarea
              placeholder="Type or paste your text here for AI-powered translation..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] bg-black/50 border-purple-500/50 text-white placeholder-purple-300/70 text-lg focus:border-purple-400 focus:ring-purple-400/50 resize-none"
            />
          </div>

          {/* Context Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-purple-200 font-semibold flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Content Domain</span>
              </label>
              <Select value={contentDomain} onValueChange={setContentDomain}>
                <SelectTrigger className="bg-black/50 border-purple-500/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-purple-500">
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-purple-200 font-semibold flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>Cultural Context</span>
              </label>
              <Select value={culturalContext} onValueChange={setCulturalContext}>
                <SelectTrigger className="bg-black/50 border-purple-500/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-purple-500">
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Language and Tone Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LanguageSelector
              selectedLanguages={selectedLanguages}
              onLanguageChange={setSelectedLanguages}
            />
            <ToneSelector
              selectedTone={selectedTone}
              onToneChange={setSelectedTone}
            />
          </div>

          {/* Translate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleTranslate}
              disabled={!inputText.trim() || selectedLanguages.length === 0 || isTranslating}
              className="px-12 py-4 text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isTranslating ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Neural Processing...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6 mr-3" />
                  Activate Translation
                </>
              )}
            </Button>
          </div>

          {/* Plan Limitation Notice */}
          {currentPlan === 'free' && (
            <div className="text-center">
              <Badge variant="outline" className="border-yellow-500 text-yellow-300 bg-yellow-900/20 px-4 py-2">
                Free Plan: Limited to 3 languages and basic features
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Translation Results */}
      {Object.keys(translations).length > 0 && (
        <TranslationPreview
          translations={translations}
        />
      )}
    </div>
  );
};
