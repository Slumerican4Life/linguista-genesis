
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Globe, Bot, Sparkles, Copy, Download, Brain, Zap } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ToneSelector } from '@/components/ToneSelector';
import { TranslationPreview } from '@/components/TranslationPreview';

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
  const [domain, setDomain] = React.useState('general');
  const [culturalContext, setCulturalContext] = React.useState('standard');

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Enhanced Input Section */}
      <Card className="shadow-2xl border-2 border-purple-500/40 bg-gradient-to-br from-black/90 to-purple-900/20 backdrop-blur-lg">
        <CardHeader className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 rounded-t-lg border-b border-purple-500/30">
          <CardTitle className="flex items-center space-x-2 text-purple-100">
            <Brain className="w-6 h-6 text-purple-400" />
            <span>Extraordinary Translation Engine</span>
          </CardTitle>
          <CardDescription className="text-purple-200">
            Powered by multiple AI systems and dictionary APIs for unmatched accuracy
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/60 border border-purple-500/30">
              <TabsTrigger value="text" className="data-[state=active]:bg-purple-700 text-purple-200">Text Input</TabsTrigger>
              <TabsTrigger value="file" disabled={currentPlan === 'free'} className="data-[state=active]:bg-purple-700 text-purple-200">
                File Upload {currentPlan === 'free' && '(Premium+)'}
              </TabsTrigger>
              <TabsTrigger value="url" disabled={currentPlan === 'free'} className="data-[state=active]:bg-purple-700 text-purple-200">
                URL Crawler {currentPlan === 'free' && '(Premium+)'}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="space-y-4">
              <Textarea
                placeholder="Enter your content for extraordinary AI-powered translation with dictionary context..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px] resize-none border-2 border-purple-500/40 focus:border-purple-400 bg-black/60 text-purple-100 placeholder-purple-300/60 transition-colors"
              />
              <div className="text-sm text-purple-300 flex justify-between">
                <span>{inputText.length} characters</span>
                <span className="flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  Enhanced with 7+ API integrations
                </span>
              </div>
            </TabsContent>
            <TabsContent value="file" className="space-y-4">
              <div className="border-2 border-dashed border-purple-500/40 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer bg-purple-900/20">
                <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-200 mb-2">Drop your file here or click to browse</p>
                <p className="text-sm text-purple-300/70">Supports CSV, TXT, DOCX files up to 10MB</p>
                <Button variant="outline" className="mt-4 border-purple-500 text-purple-200" disabled={currentPlan === 'free'}>
                  Choose File
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-purple-200">Website or Social Media URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com or https://twitter.com/user/status/..."
                    className="w-full p-3 border border-purple-500/40 rounded-lg mt-2 bg-black/60 text-purple-100 placeholder-purple-300/60"
                    disabled={currentPlan === 'free'}
                  />
                </div>
                <Button variant="outline" className="w-full border-purple-500 text-purple-200" disabled={currentPlan === 'free'}>
                  Extract Content with AI
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Enhanced Context Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-200">Content Domain</label>
              <Select value={domain} onValueChange={setDomain}>
                <SelectTrigger className="border-purple-500/40 bg-black/60 text-purple-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-purple-500/40">
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-200">Cultural Context</label>
              <Select value={culturalContext} onValueChange={setCulturalContext}>
                <SelectTrigger className="border-purple-500/40 bg-black/60 text-purple-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-purple-500/40">
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                  <SelectItem value="youth">Youth Culture</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <LanguageSelector 
            selectedLanguages={selectedLanguages}
            onLanguageChange={setSelectedLanguages}
          />

          <ToneSelector 
            selectedTone={selectedTone}
            onToneChange={setSelectedTone}
          />

          <Button 
            onClick={() => onTranslate({ domain, culturalContext })}
            disabled={!inputText.trim() || selectedLanguages.length === 0 || isTranslating}
            className="w-full h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl hover:shadow-purple-500/25"
          >
            {isTranslating ? (
              <>
                <Brain className="w-6 h-6 mr-3 animate-pulse" />
                Neural Networks Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-3" />
                Extraordinary AI Translation
              </>
            )}
          </Button>

          {/* API Status Indicators */}
          <div className="text-xs text-purple-300/70 space-y-1">
            <div className="flex items-center justify-between">
              <span>Translation APIs Available:</span>
              <span className="text-green-400">7+ Services Active</span>
            </div>
            <div className="text-purple-400">
              OpenAI GPT-4 • DeepL • Google Translate • Dictionary APIs • Oxford • Merriam-Webster • Linguee
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Output Section */}
      <Card className="shadow-2xl border-2 border-blue-500/40 bg-gradient-to-br from-black/90 to-blue-900/20 backdrop-blur-lg">
        <CardHeader className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 rounded-t-lg border-b border-blue-500/30">
          <CardTitle className="flex items-center justify-between text-blue-100">
            <div className="flex items-center space-x-2">
              <Globe className="w-6 h-6 text-blue-400" />
              <span>Extraordinary Translations</span>
            </div>
            {Object.keys(translations).length > 0 && (
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="border-blue-500 text-blue-200 hover:bg-blue-900/40 bg-black/60">
                  <Copy className="w-4 h-4 mr-1" />
                  Copy All
                </Button>
                <Button size="sm" variant="outline" className="border-blue-500 text-blue-200 hover:bg-blue-900/40 bg-black/60">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-blue-200">
            Culturally-aware translations with dictionary context and tone adaptation
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <TranslationPreview 
            originalText={inputText}
            translations={translations}
            isLoading={isTranslating}
          />
        </CardContent>
      </Card>
    </div>
  );
};
