import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Globe, Bot, Shield, Sparkles, Download, Copy, Settings, CreditCard, BarChart3, LogIn, LogOut, Users } from 'lucide-react';
import { AgentStatus } from '@/components/AgentStatus';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ToneSelector } from '@/components/ToneSelector';
import { TranslationPreview } from '@/components/TranslationPreview';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PricingPlans } from '@/components/PricingPlans';
import { UsageDashboard } from '@/components/UsageDashboard';
import { AuthModal } from '@/components/AuthModal';
import { SettingsPanel } from '@/components/SettingsPanel';
import { LyraOverlay } from '@/components/LyraOverlay';
import { AdminDashboard } from '@/components/AdminDashboard';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const Index = () => {
  const [inputText, setInputText] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState('natural');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('translate');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [agentProgress, setAgentProgress] = useState<Record<string, 'idle' | 'processing' | 'complete'>>({
    security: 'idle',
    prism: 'idle',
    syntax: 'idle',
    voca: 'idle',
    lyra: 'idle'
  });

  // Authentication handling with better error handling
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        toast.success(`Welcome back, ${session.user.email}!`);
      } else if (event === 'SIGNED_OUT') {
        toast.info('Signed out successfully');
      }
    });

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        toast.error('Authentication error occurred');
      } else {
        setUser(session?.user ?? null);
        console.log('Initial session:', session?.user?.email);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile with role and subscriptions
  const { data: userProfile, error: profileError } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      console.log('Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*, subscriptions(*)')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      console.log('Profile data:', data);
      return data;
    },
    enabled: !!user,
  });

  // Fetch real usage data
  const { data: usageData } = useQuery({
    queryKey: ['usage', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's usage
      const { data: todayUsage } = await supabase
        .from('usage_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
      
      // Get subscription data for limits
      const subscription = userProfile?.subscriptions?.[0];
      const tier = subscription?.tier || 'free';
      
      // Define limits based on tier
      const limits = {
        free: { words: 500, languages: 3 },
        professional: { words: 10000, languages: 10 },
        premium: { words: 50000, languages: 25 },
        business: { words: 200000, languages: 50 }
      };
      
      const tierLimits = limits[tier as keyof typeof limits] || limits.free;
      
      return {
        wordsUsed: todayUsage?.words_translated || 0,
        wordsLimit: tierLimits.words,
        languagesUsed: selectedLanguages.length,
        languagesLimit: tierLimits.languages,
        currentPlan: tier,
        daysUntilReset: 30 - new Date().getDate(),
        translationsToday: todayUsage?.requests_made || 0
      };
    },
    enabled: !!user && !!userProfile,
  });

  // Show profile error if exists
  useEffect(() => {
    if (profileError) {
      console.error('Profile error:', profileError);
      toast.error('Failed to load user profile. Please try refreshing the page.');
    }
  }, [profileError]);

  // Get current plan from user profile
  const currentPlan = userProfile?.subscriptions?.[0]?.tier || 'free';

  const handleTranslate = async () => {
    if (!inputText.trim() || selectedLanguages.length === 0) return;
    
    setIsTranslating(true);
    setTranslations({});
    
    // Simulate agent pipeline
    const agents = ['security', 'prism', 'syntax', 'voca', 'lyra'];
    
    for (const agent of agents) {
      setAgentProgress(prev => ({ ...prev, [agent]: 'processing' }));
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
      setAgentProgress(prev => ({ ...prev, [agent]: 'complete' }));
    }
    
    try {
      if (user) {
        // Call real translation API
        const { data, error } = await supabase.functions.invoke('ai-translate', {
          body: {
            text: inputText,
            targetLanguages: selectedLanguages,
            tone: selectedTone
          }
        });

        if (error) throw error;
        setTranslations(data.translations);
      } else {
        // Mock translations for non-authenticated users
        const mockTranslations: Record<string, string> = {};
        selectedLanguages.forEach(lang => {
          mockTranslations[lang] = `[${selectedTone.toUpperCase()}] ${inputText} (contextually translated to ${lang}) - Sign in for real AI translations`;
        });
        setTranslations(mockTranslations);
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Please try again.');
      // Fallback to mock translations
      const mockTranslations: Record<string, string> = {};
      selectedLanguages.forEach(lang => {
        mockTranslations[lang] = `Translation error occurred. Please try again.`;
      });
      setTranslations(mockTranslations);
    }
    
    setIsTranslating(false);
  };

  const handleSelectPlan = (planId: string) => {
    console.log('Selected plan:', planId);
    toast.info('Stripe integration will be configured for plan selection');
  };

  const handleAuthSuccess = () => {
    console.log('Authentication successful');
    setIsAuthModalOpen(false);
    toast.success('Successfully signed in!');
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    } else {
      setUser(null);
      setActiveTab('translate');
    }
  };

  // Check if user is admin (owner or manager)
  const isAdmin = userProfile?.role === 'owner' || userProfile?.role === 'manager';

  // Free tier ads component (only show for free users)
  const AdBanner = ({ position }: { position: 'top' | 'middle' | 'bottom' }) => {
    if (!user || currentPlan !== 'free') return null;
    
    return (
      <div className={`bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center ${
        position === 'top' ? 'mb-8' : position === 'middle' ? 'my-8' : 'mt-8'
      }`}>
        <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
          📢 Remove ads and unlock premium features
        </p>
        <Button size="sm" onClick={() => setActiveTab('pricing')} className="bg-amber-600 hover:bg-amber-700">
          Upgrade Now
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Premium gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-purple-500/20 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl shadow-purple-500/25 relative overflow-hidden">
                <img 
                  src="/lovable-uploads/56b3973a-75ee-45d3-8670-40289d5fab04.png" 
                  alt="Linguista Logo" 
                  className="w-8 h-8 object-contain relative z-10"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Linguista
                </h1>
                <p className="text-sm text-purple-300 font-semibold">by Neuronix ~ Language Rewired</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-purple-200 border-purple-400/30 px-3 py-1 font-bold">
                <Bot className="w-3 h-3 mr-1" />
                5 AI Agents Active
              </Badge>
              {userProfile && (
                <Badge variant="outline" className="px-3 py-1 font-bold border-purple-400 text-purple-200">
                  <Shield className="w-3 h-3 mr-1" />
                  {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                </Badge>
              )}
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-purple-200 font-medium">
                    Welcome, {userProfile?.full_name || user.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleSignOut} className="border-red-400 text-red-300 hover:bg-red-900/20">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsAuthModalOpen(true)} size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Free tier top ad */}
      <div className="container mx-auto px-4">
        <AdBanner position="top" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 h-12 bg-black/50 backdrop-blur-sm border border-purple-500/30">
            <TabsTrigger value="translate" className="flex items-center space-x-2 text-sm font-bold data-[state=active]:bg-purple-600/40 data-[state=active]:text-white">
              <Sparkles className="w-4 h-4" />
              <span>Translate</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2 text-sm font-bold data-[state=active]:bg-purple-600/40 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center space-x-2 text-sm font-bold data-[state=active]:bg-purple-600/40 data-[state=active]:text-white">
                <Users className="w-4 h-4" />
                <span>Admin</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="pricing" className="flex items-center space-x-2 text-sm font-bold data-[state=active]:bg-purple-600/40 data-[state=active]:text-white">
              <CreditCard className="w-4 h-4" />
              <span>Pricing</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2 text-sm font-bold data-[state=active]:bg-purple-600/40 data-[state=active]:text-white">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Translation Tab */}
          <TabsContent value="translate" className="space-y-8">
            {/* Hero Section with 3D Earth */}
            <div className="text-center space-y-6 mb-12 relative">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/20 to-green-500/20 animate-spin-slow border-2 border-blue-400/30" 
                       style={{ animationDuration: '20s' }}>
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600/40 to-green-600/40 flex items-center justify-center">
                      <Globe className="w-16 h-16 text-blue-300 animate-pulse" />
                    </div>
                  </div>
                </div>
                <h2 className="text-6xl font-black text-white mb-6 relative z-10 pt-8">
                  Transform Your Content for
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent block mt-2">
                    Global Audiences
                  </span>
                </h2>
              </div>
              <p className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed font-medium">
                Our AI agent team delivers contextual, culturally-rich translations that capture tone, humor, and local nuances—not just literal word conversion.
              </p>
            </div>

            {/* AI Agents Status */}
            <AgentStatus agentProgress={agentProgress} />

            {/* Main Translation Interface */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <Card className="shadow-2xl border border-purple-500/30 bg-black/60 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 rounded-t-lg border-b border-purple-500/30">
                  <CardTitle className="flex items-center space-x-2 text-purple-100">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <span>Content Input</span>
                  </CardTitle>
                  <CardDescription className="text-purple-200">
                    Paste your content, upload a file, or enter a URL for translation
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <Tabs defaultValue="text" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="text">Text Input</TabsTrigger>
                      <TabsTrigger value="file" disabled={currentPlan === 'free'}>
                        File Upload {currentPlan === 'free' && '(Premium+)'}
                      </TabsTrigger>
                      <TabsTrigger value="url" disabled={currentPlan === 'free'}>
                        URL Crawler {currentPlan === 'free' && '(Premium+)'}
                      </TabsTrigger>
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
                        <p className="text-muted-foreground mb-2">Drop your file here or click to browse</p>
                        <p className="text-sm text-muted-foreground/70">Supports CSV, TXT, DOCX files up to 10MB</p>
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
              <Card className="shadow-2xl border border-purple-500/30 bg-black/60 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-emerald-900/80 to-cyan-900/80 rounded-t-lg border-b border-purple-500/30">
                  <CardTitle className="flex items-center justify-between text-emerald-100">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-emerald-400" />
                      <span>Translations</span>
                    </div>
                    {Object.keys(translations).length > 0 && (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-emerald-400 text-emerald-300 hover:bg-emerald-900/20">
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                        <Button size="sm" variant="outline" className="border-emerald-400 text-emerald-300 hover:bg-emerald-900/20">
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription className="text-emerald-200">
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

            {/* Middle ad for free tier */}
            <AdBanner position="middle" />

            {/* Feedback Panel */}
            {Object.keys(translations).length > 0 && (
              <FeedbackPanel translations={translations} />
            )}
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            {user ? (
              usageData ? (
                <UsageDashboard 
                  usage={usageData}
                  onUpgrade={() => setActiveTab('pricing')}
                />
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-purple-200">Loading your dashboard...</p>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <p className="text-purple-200 mb-4">Please sign in to view your dashboard</p>
                <Button onClick={() => setIsAuthModalOpen(true)}>Sign In</Button>
              </div>
            )}
          </TabsContent>

          {/* Admin Tab */}
          {isAdmin && (
            <TabsContent value="admin">
              <AdminDashboard />
            </TabsContent>
          )}

          {/* Pricing Tab */}
          <TabsContent value="pricing">
            <PricingPlans 
              onSelectPlan={handleSelectPlan}
              currentPlan={currentPlan}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            {user ? (
              <SettingsPanel 
                currentPlan={currentPlan}
                onUpgrade={() => setActiveTab('pricing')}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-purple-200 mb-4">Please sign in to access settings</p>
                <Button onClick={() => setIsAuthModalOpen(true)}>Sign In</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Bottom ad for free tier */}
        <AdBanner position="bottom" />
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Lyra Overlay */}
      <LyraOverlay />
    </div>
  );
};

export default Index;
