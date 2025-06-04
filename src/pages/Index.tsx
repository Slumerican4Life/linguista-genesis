
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Globe, Bot, Shield, Sparkles, ThumbsUp, ThumbsDown, Download, Copy, Settings, CreditCard, BarChart3 } from 'lucide-react';
import { AgentStatus } from '@/components/AgentStatus';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ToneSelector } from '@/components/ToneSelector';
import { TranslationPreview } from '@/components/TranslationPreview';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PricingPlans } from '@/components/PricingPlans';
import { UsageDashboard } from '@/components/UsageDashboard';

const Index = () => {
  const [inputText, setInputText] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState('natural');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('translate');
  const [currentPlan, setCurrentPlan] = useState('free');
  const [agentProgress, setAgentProgress] = useState<Record<string, 'idle' | 'processing' | 'complete'>>({
    lyra: 'idle',
    syntax: 'idle',
    voca: 'idle',
    prism: 'idle'
  });

  // Mock usage data
  const usageData = {
    wordsUsed: 387,
    wordsLimit: 500,
    languagesUsed: 2,
    languagesLimit: 2,
    currentPlan: currentPlan,
    daysUntilReset: 15,
    translationsToday: 12
  };

  const handleTranslate = async () => {
    if (!inputText.trim() || selectedLanguages.length === 0) return;
    
    setIsTranslating(true);
    setTranslations({});
    
    // Simulate agent pipeline
    const agents = ['prism', 'syntax', 'voca', 'lyra'];
    
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

  const handleSelectPlan = (planId: string) => {
    setCurrentPlan(planId);
    console.log('Selected plan:', planId);
    // Here you would integrate with Stripe
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Premium gradient overlay for dark mode */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background/95 to-background opacity-90 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-purple-500/5 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 border-b bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-xl shadow-purple-500/25">
                <img 
                  src="/lovable-uploads/56b3973a-75ee-45d3-8670-40289d5fab04.png" 
                  alt="Linguista Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Linguista
                </h1>
                <p className="text-sm text-muted-foreground font-medium">by Neuronix ~ Language Rewired</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 px-3 py-1">
                <Bot className="w-3 h-3 mr-1" />
                4 AI Agents Active
              </Badge>
              <Badge variant="outline" className="px-3 py-1 font-medium">
                <Shield className="w-3 h-3 mr-1" />
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="translate" className="flex items-center space-x-2 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Translate</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2 text-sm font-medium">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center space-x-2 text-sm font-medium">
              <CreditCard className="w-4 h-4" />
              <span>Pricing</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2 text-sm font-medium">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Translation Tab */}
          <TabsContent value="translate" className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6 mb-12">
              <h2 className="text-5xl font-bold text-foreground mb-6">
                Transform Your Content for
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent block mt-2">
                  Global Audiences
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Our AI agent team delivers contextual, culturally-rich translations that capture tone, humor, and local nuances—not just literal word conversion.
              </p>
            </div>

            {/* AI Agents Status */}
            <AgentStatus agentProgress={agentProgress} />

            {/* Main Translation Interface */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <Card className="shadow-2xl border-0 bg-card/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-950/30 dark:to-blue-950/30 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-purple-600" />
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
                        className="min-h-[200px] resize-none border-2 focus:border-purple-400 dark:focus:border-purple-500 transition-colors bg-background/50"
                      />
                      <div className="text-sm text-muted-foreground flex justify-between">
                        <span>{inputText.length} characters</span>
                        <span>Supports up to 10,000 characters</span>
                      </div>
                    </TabsContent>
                    <TabsContent value="file" className="space-y-4">
                      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer bg-muted/20">
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">Drop your CSV file here or click to browse</p>
                        <p className="text-sm text-muted-foreground/70">Supports CSV, TXT files up to 10MB</p>
                        <Button variant="outline" className="mt-4">
                          Choose File
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
                    onClick={handleTranslate}
                    disabled={!inputText.trim() || selectedLanguages.length === 0 || isTranslating}
                    className="w-full h-12 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 hover:from-purple-600 hover:via-blue-600 hover:to-purple-600 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
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
              <Card className="shadow-2xl border-0 bg-card/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-cyan-50/80 dark:from-emerald-950/30 dark:to-cyan-950/30 rounded-t-lg">
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
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <UsageDashboard 
              usage={usageData}
              onUpgrade={() => setActiveTab('pricing')}
            />
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing">
            <PricingPlans 
              onSelectPlan={handleSelectPlan}
              currentPlan={currentPlan}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
