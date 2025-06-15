
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Globe, Bot, Sparkles, Copy, Download } from 'lucide-react';
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
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <Card className="shadow-2xl border border-blue-600 bg-black">
        <CardHeader className="bg-blue-900 rounded-t-lg border-b border-blue-600">
          <CardTitle className="flex items-center space-x-2 text-white">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Content Input</span>
          </CardTitle>
          <CardDescription className="text-blue-200">
            Paste your content, upload a file, or enter a URL for translation
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black border border-blue-600">
              <TabsTrigger value="text" className="data-[state=active]:bg-blue-700 text-blue-200">Text Input</TabsTrigger>
              <TabsTrigger value="file" disabled={currentPlan === 'free'} className="data-[state=active]:bg-blue-700 text-blue-200">
                File Upload {currentPlan === 'free' && '(Premium+)'}
              </TabsTrigger>
              <TabsTrigger value="url" disabled={currentPlan === 'free'} className="data-[state=active]:bg-blue-700 text-blue-200">
                URL Crawler {currentPlan === 'free' && '(Premium+)'}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="space-y-4">
              <Textarea
                placeholder="Paste your website content, social media posts, marketing copy, or any text you want to translate..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px] resize-none border-2 border-blue-600 focus:border-purple-500 bg-black text-white transition-colors"
              />
              <div className="text-sm text-blue-300 flex justify-between">
                <span>{inputText.length} characters</span>
                <span>Supports up to 10,000 characters</span>
              </div>
            </TabsContent>
            <TabsContent value="file" className="space-y-4">
              <div className="border-2 border-dashed border-blue-600/30 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer bg-blue-900/20">
                <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <p className="text-blue-600 mb-2">Drop your file here or click to browse</p>
                <p className="text-sm text-blue-600/70">Supports CSV, TXT, DOCX files up to 10MB</p>
                <Button variant="outline" className="mt-4" disabled={currentPlan === 'free'}>
                  Choose File
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Website or Social Media URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com or https://twitter.com/user/status/..."
                    className="w-full p-3 border rounded-lg mt-2"
                    disabled={currentPlan === 'free'}
                  />
                </div>
                <Button variant="outline" className="w-full" disabled={currentPlan === 'free'}>
                  Extract Content
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <LanguageSelector 
            selectedLanguages={selectedLanguages}
            onLanguageChange={setSelectedLanguages}
          />

          <ToneSelector 
            selectedTone={selectedTone}
            onToneChange={setSelectedTone}
          />

          <Button 
            onClick={onTranslate}
            disabled={!inputText.trim() || selectedLanguages.length === 0 || isTranslating}
            className="w-full h-12 bg-purple-700 hover:bg-purple-800 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
          >
            {isTranslating ? (
              <>
                <Bot className="w-5 h-5 mr-2 animate-spin" />
                AI Agents Working...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Translate with AI Agents
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output Section */}
      <Card className="shadow-2xl border border-blue-600 bg-black">
        <CardHeader className="bg-blue-900 rounded-t-lg border-b border-blue-600">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-400" />
              <span>Translations</span>
            </div>
            {Object.keys(translations).length > 0 && (
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="border-blue-500 text-blue-200 hover:bg-blue-900 bg-black">
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" className="border-blue-500 text-blue-200 hover:bg-blue-900 bg-black">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-blue-200">
            Culturally-aware translations with tone adaptation
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
