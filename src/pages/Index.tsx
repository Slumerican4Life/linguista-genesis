
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Globe, Bot, Shield, Sparkles, ThumbsUp, ThumbsDown, Download, Copy } from 'lucide-react';
import { AgentStatus } from '@/components/AgentStatus';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ToneSelector } from '@/components/ToneSelector';
import { TranslationPreview } from '@/components/TranslationPreview';
import { FeedbackPanel } from '@/components/FeedbackPanel';

const Index = () => {
  const [inputText, setInputText] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState('natural');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [agentProgress, setAgentProgress] = useState<Record<string, 'idle' | 'processing' | 'complete'>>({
    lexi: 'idle',
    poly: 'idle',
    vera: 'idle',
    tala: 'idle',
    zane: 'idle'
  });

  const handleTranslate = async () => {
    if (!inputText.trim() || selectedLanguages.length === 0) return;
    
    setIsTranslating(true);
    setTranslations({});
    
    // Simulate agent pipeline
    const agents = ['zane', 'lexi', 'poly', 'vera', 'tala'];
    
    for (const agent of agents) {
      setAgentProgress(prev => ({ ...prev, [agent]: 'processing' }));
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      setAgentProgress(prev => ({ ...prev, [agent]: 'complete' }));
    }
    
    // Simulate translations
    const mockTranslations: Record<string, string> = {};
    selectedLanguages.forEach(lang => {
      mockTranslations[lang] = `[${selectedTone.toUpperCase()}] ${inputText} (translated to ${lang})`;
    });
    
    setTranslations(mockTranslations);
    setIsTranslating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Neural Pattern Background */}
      <div className="fixed inset-0 bg-neural-pattern opacity-30 pointer-events-none"></div>
      
      {/* Header */}
      <header className="relative z-10 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-ai-blue-500 to-ai-purple-500 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-ai-blue-600 to-ai-purple-600 bg-clip-text text-transparent">
                  Linguna AI
                </h1>
                <p className="text-sm text-gray-600">Culturally-aware global translation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700">
                <Bot className="w-3 h-3 mr-1" />
                5 AI Agents Active
              </Badge>
              <Button variant="outline" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                Secure
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transform Your Content for
            <span className="bg-gradient-to-r from-ai-blue-600 to-ai-purple-600 bg-clip-text text-transparent"> Global Audiences</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI agent team delivers contextual, culturally-rich translations that capture tone, humor, and local nuances—not just literal word conversion.
          </p>
        </div>

        {/* AI Agents Status */}
        <AgentStatus agentProgress={agentProgress} />

        {/* Main Translation Interface */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-ai-blue-50 to-ai-purple-50 rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-ai-blue-600" />
                <span>Content Input</span>
              </CardTitle>
              <CardDescription>
                Paste your content or upload a file for translation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Text Input</TabsTrigger>
                  <TabsTrigger value="file">File Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="space-y-4">
                  <Textarea
                    placeholder="Paste your website content, social media posts, marketing copy, or any text you want to translate..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[200px] resize-none border-2 focus:border-ai-blue-300 transition-colors"
                  />
                  <div className="text-sm text-gray-500 flex justify-between">
                    <span>{inputText.length} characters</span>
                    <span>Supports up to 10,000 characters</span>
                  </div>
                </TabsContent>
                <TabsContent value="file" className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-ai-blue-400 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drop your CSV file here or click to browse</p>
                    <p className="text-sm text-gray-500">Supports CSV, TXT files up to 10MB</p>
                    <Button variant="outline" className="mt-4">
                      Choose File
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Language Selection */}
              <LanguageSelector 
                selectedLanguages={selectedLanguages}
                onLanguageChange={setSelectedLanguages}
              />

              {/* Tone Selection */}
              <ToneSelector 
                selectedTone={selectedTone}
                onToneChange={setSelectedTone}
              />

              {/* Translate Button */}
              <Button 
                onClick={handleTranslate}
                disabled={!inputText.trim() || selectedLanguages.length === 0 || isTranslating}
                className="w-full h-12 bg-gradient-to-r from-ai-blue-500 to-ai-purple-500 hover:from-ai-blue-600 hover:to-ai-purple-600 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-emerald-600" />
                  <span>Translations</span>
                </div>
                {Object.keys(translations).length > 0 && (
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                )}
              </CardTitle>
              <CardDescription>
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

        {/* Feedback Panel */}
        {Object.keys(translations).length > 0 && (
          <FeedbackPanel translations={translations} />
        )}
      </main>
    </div>
  );
};

export default Index;
