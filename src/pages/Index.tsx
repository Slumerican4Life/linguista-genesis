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
import { WebsiteTranslator } from '@/components/translation/WebsiteTranslator';
import { AdSenseAd } from '@/components/AdSenseAd';
import { AdSenseScript } from '@/components/AdSenseScript';
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
  const [isSignUp, setIsSignUp] = useState(false);
  const [agentProgress, setAgentProgress] = useState<Record<string, 'idle' | 'processing' | 'complete'>>({
    security: 'idle',
    prism: 'idle',
    syntax: 'idle',
    voca: 'idle',
    lyra: 'idle'
  });

  // Enhanced authentication handling with better session management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        toast.success(`Welcome back, ${session.user.email}!`);
        // Close auth modal if it's open
        setIsAuthModalOpen(false);
      } else if (event === 'SIGNED_OUT') {
        toast.info('Signed out successfully');
      }
    });

    // Check for existing session on page load
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
      <div className={`${
        position === 'top' ? 'mb-8' : position === 'middle' ? 'my-8' : 'mt-8'
      }`}>
        <AdSenseAd
          adSlot="1234567890" // Replace with your actual ad slot ID
          adFormat="auto"
          className="max-w-full"
          style={{ minHeight: '100px', backgroundColor: '#1a1a1a', border: '1px solid #3b82f6' }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20">
      {/* Add AdSense script to head */}
      <AdSenseScript />
      
      {/* Enhanced Header */}
      <header className="relative z-10 border-b border-gradient-to-r from-purple-600/50 via-blue-600/50 to-indigo-600/50 bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-indigo-600/5"></div>
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center border-2 border-purple-400/30 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105">
                  <img 
                    src="/lovable-uploads/56b3973a-75ee-45d3-8670-40289d5fab04.png" 
                    alt="Linguista Logo" 
                    className="w-10 h-10 object-contain filter brightness-200 contrast-150 drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]"
                    style={{ 
                      filter: 'brightness(2.5) contrast(1.8) drop-shadow(0 0 15px rgba(255,255,255,0.9))',
                      imageRendering: 'crisp-edges'
                    }}
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center border-2 border-white/20 animate-pulse">
                  <span className="text-xs">🧠</span>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-2xl">
                  Linguista
                </h1>
                <p className="text-sm bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent font-bold">
                  by Neuronix ~ Language Rewired with AI
                </p>
              </div>
              
              {/* Enhanced Neuronix Brain Visual */}
              <div className="hidden md:flex items-center space-x-4 ml-8 p-4 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-indigo-900/40 rounded-2xl border border-purple-500/30 backdrop-blur-sm shadow-2xl">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border border-white/30 animate-bounce"></div>
                </div>
                <div>
                  <p className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Neuronix Neural Core
                  </p>
                  <p className="text-xs text-purple-300 font-medium">Advanced AI Translation Engine</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400 font-bold">Neural Pathways Active</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-700/80 to-blue-700/80 text-white border border-purple-500/30 px-4 py-2 font-bold shadow-lg">
                <Bot className="w-4 h-4 mr-2" />
                5 AI Agents Online
              </Badge>
              {userProfile && (
                <Badge variant="outline" className="px-4 py-2 font-bold border-blue-500/50 text-blue-200 bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-sm">
                  <Shield className="w-4 h-4 mr-2" />
                  {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                </Badge>
              )}
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-blue-200 font-medium bg-gradient-to-r from-blue-900/30 to-purple-900/30 px-3 py-1 rounded-lg backdrop-blur-sm">
                    Welcome, {userProfile?.full_name || user.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleSignOut} className="border-red-500/50 text-red-400 hover:bg-red-900/30 bg-black/50 backdrop-blur-sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button onClick={() => { setIsSignUp(false); setIsAuthModalOpen(true); }} size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                  <Button onClick={() => { setIsSignUp(true); setIsAuthModalOpen(true); }} size="sm" variant="outline" className="border-blue-500/50 text-blue-200 hover:bg-blue-900/30 bg-black/50 backdrop-blur-sm">
                    Sign Up
                  </Button>
                </div>
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
        {/* Enhanced Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full h-14 bg-gradient-to-r from-black via-gray-900 to-black border border-purple-600/30 backdrop-blur-xl rounded-2xl shadow-2xl" style={{
            gridTemplateColumns: isAdmin ? 'repeat(6, 1fr)' : 'repeat(5, 1fr)'
          }}>
            <TabsTrigger value="translate" className="flex items-center justify-center space-x-2 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-700 data-[state=active]:to-blue-700 data-[state=active]:text-white text-purple-200 px-3 rounded-xl transition-all duration-300">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Translate</span>
              <span className="sm:hidden">Text</span>
            </TabsTrigger>
            <TabsTrigger value="website" className="flex items-center justify-center space-x-2 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-700 data-[state=active]:to-blue-700 data-[state=active]:text-white text-purple-200 px-3 rounded-xl transition-all duration-300">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Website</span>
              <span className="sm:hidden">Web</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center justify-center space-x-2 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-700 data-[state=active]:to-blue-700 data-[state=active]:text-white text-purple-200 px-3 rounded-xl transition-all duration-300">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center justify-center space-x-2 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-700 data-[state=active]:to-blue-700 data-[state=active]:text-white text-purple-200 px-3 rounded-xl transition-all duration-300">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
                <span className="sm:hidden">Admin</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="pricing" className="flex items-center justify-center space-x-2 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-700 data-[state=active]:to-blue-700 data-[state=active]:text-white text-purple-200 px-3 rounded-xl transition-all duration-300">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Pricing</span>
              <span className="sm:hidden">Plans</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center space-x-2 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-700 data-[state=active]:to-blue-700 data-[state=active]:text-white text-purple-200 px-3 rounded-xl transition-all duration-300">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Translation Tab */}
          <TabsContent value="translate" className="space-y-8">
            {/* Enhanced Hero Section */}
            <div className="text-center space-y-8 mb-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 animate-pulse rounded-3xl"></div>
              <div className="relative z-10 p-8">
                <div className="flex items-center justify-center mb-8">
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-600/30 via-blue-600/30 to-indigo-600/30 animate-spin-slow border-4 border-purple-500/50 shadow-2xl" 
                         style={{ animationDuration: '20s' }}>
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-700/50 via-blue-700/50 to-indigo-700/50 flex items-center justify-center backdrop-blur-sm">
                        <Globe className="w-20 h-20 text-blue-300 animate-pulse" />
                      </div>
                    </div>
                    {/* Enhanced Brain Technology Indicator */}
                    <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center border-4 border-white/30 animate-bounce shadow-2xl">
                      <span className="text-3xl">🧠</span>
                    </div>
                    {/* Neural network dots */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 bg-purple-500 rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>
                <h2 className="text-7xl font-black text-white mb-8 relative z-10">
                  Transform Your Content with
                  <span className="block mt-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 via-indigo-500 to-purple-500 animate-gradient">
                    Neuronix Brain Power
                  </span>
                </h2>
                <p className="text-2xl text-purple-200 max-w-4xl mx-auto leading-relaxed font-medium relative z-10 mb-8">
                  Our AI agent team powered by Neuronix neural networks delivers contextual, culturally-rich translations that capture tone, humor, and local nuances—not just literal word conversion.
                </p>
                <div className="flex justify-center space-x-8 mt-8 relative z-10">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 text-lg font-bold shadow-2xl">
                    🧠 Neural Translation
                  </Badge>
                  <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 text-lg font-bold shadow-2xl">
                    🌍 Cultural Context
                  </Badge>
                  <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 text-lg font-bold shadow-2xl">
                    ⚡ Real-time Processing
                  </Badge>
                </div>
              </div>
            </div>

            {/* AI Agents Status */}
            <AgentStatus agentProgress={agentProgress} />

            {/* Advanced Analytics */}
            {user && (
              <div className="mt-12">
                <h3 className="text-3xl font-bold text-white mb-8 text-center">
                  Advanced Analytics & Insights
                </h3>
                <AdvancedAnalytics />
              </div>
            )}

            {/* Main Translation Interface */}
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
                    onClick={handleTranslate}
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

            {/* Middle ad for free tier */}
            <AdBanner position="middle" />

            {/* Feedback Panel */}
            {Object.keys(translations).length > 0 && (
              <FeedbackPanel translations={translations} />
            )}
          </TabsContent>

          {/* Website Translation Tab */}
          <TabsContent value="website">
            <WebsiteTranslator />
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
                    <p className="text-blue-200">Loading your dashboard...</p>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <p className="text-blue-200 mb-4">Please sign in to view your dashboard</p>
                <Button onClick={() => setIsAuthModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">Sign In</Button>
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

          {/* Enhanced Settings Tab with Billing History */}
          <TabsContent value="settings">
            {user ? (
              <div className="space-y-8">
                <SettingsPanel 
                  currentPlan={currentPlan}
                  onUpgrade={() => setActiveTab('pricing')}
                />
                <BillingHistory userId={user.id} />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-blue-200 mb-4">Please sign in to access settings</p>
                <Button onClick={() => setIsAuthModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">Sign In</Button>
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
        isLogin={!isSignUp}
      />

      {/* Lyra Overlay */}
      <LyraOverlay />
    </div>
  );
};

export default Index;
