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
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';
import { BillingHistory } from '@/components/payment/BillingHistory';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { NeuronixBrain } from '@/components/NeuronixBrain';

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

    let adContent: React.ReactNode;
    switch (position) {
      case 'top':
        adContent = (
          <div className="text-center">
            <p className="font-bold text-lg text-white">Sumerican Slang</p>
            <p className="text-sm text-purple-300">inspired by yelawolf</p>
          </div>
        );
        break;
      case 'middle':
        adContent = (
          <p className="font-bold text-lg text-center text-white">the losers win again.</p>
        );
        break;
      case 'bottom':
        adContent = (
          <p className="font-bold text-lg text-center text-white">better take a left mf.</p>
        );
        break;
      default:
        adContent = null;
    }
    
    return (
      <div className={`${
        position === 'top' ? 'mb-8' : position === 'middle' ? 'my-8' : 'mt-8'
      }`}>
        <div
          className="max-w-full p-4 rounded-lg flex items-center justify-center"
          style={{ minHeight: '100px', backgroundColor: '#1a1a1a', border: '1px dashed #4f46e5' }}
        >
          {adContent}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-blue-950/30 relative overflow-hidden">
      {/* Neuronix Neural Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-radial from-purple-600/30 to-transparent rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-radial from-blue-600/30 to-transparent rounded-full animate-pulse" style={{ animationDelay: '2s', animationDuration: '6s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial from-indigo-600/20 to-transparent rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
      </div>

      {/* Neural Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-grid-pattern bg-center"></div>
      </div>

      {/* Add AdSense script to head */}
      <AdSenseScript />
      
      {/* Ultra-Enhanced Premium Header with Neuronix Brain */}
      <header className="relative z-20 border-b-2 border-gradient-to-r from-purple-500/60 via-blue-500/60 to-indigo-500/60 bg-gradient-to-r from-slate-950/95 via-purple-950/50 to-blue-950/50 backdrop-blur-2xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 animate-shimmer"></div>
        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {/* Enhanced Neuronix Brain Logo */}
              <div className="relative group">
                <NeuronixBrain size="lg" isActive className="hover:scale-110 transition-transform duration-500" />
              </div>

              {/* Enhanced Brand Identity */}
              <div className="space-y-2">
                <h1 className="text-6xl font-black bg-gradient-to-r from-purple-300 via-red-300 via-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl animate-gradient bg-size-200">
                  Linguista
                </h1>
                <div className="flex items-center space-x-3">
                  <p className="text-lg bg-gradient-to-r from-purple-200 via-red-200 to-blue-200 bg-clip-text text-transparent font-bold">
                    Powered by Neuronix Neural Engine
                  </p>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
                <p className="text-sm text-purple-300/80 font-medium italic">
                  ⚡ Next-Gen Language AI • Beyond Human Translation
                </p>
              </div>
              
              {/* Advanced Neuronix System Status */}
              <div className="hidden lg:flex items-center space-x-6 ml-12 p-6 bg-gradient-to-br from-purple-900/60 via-red-900/30 to-blue-900/60 rounded-3xl border-2 border-purple-400/30 backdrop-blur-xl shadow-2xl">
                <NeuronixBrain size="sm" isActive />
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <p className="text-lg font-black bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      Neuronix Core
                    </p>
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xs px-3 py-1">
                      ONLINE
                    </Badge>
                  </div>
                  <p className="text-sm text-purple-200 font-semibold">Advanced Neural Translation Matrix</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-300 font-bold">Neural Paths: Active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-blue-300 font-bold">5 AI Agents Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-800/90 via-red-800/60 to-blue-800/90 text-white border-2 border-purple-400/40 px-6 py-3 font-black shadow-2xl text-lg">
                <Bot className="w-5 h-5 mr-3" />
                Neural Core Active
              </Badge>
              {userProfile && (
                <Badge variant="outline" className="px-6 py-3 font-black border-2 border-blue-400/60 text-blue-200 bg-gradient-to-r from-blue-900/60 to-purple-900/60 backdrop-blur-xl text-lg">
                  <Shield className="w-5 h-5 mr-3" />
                  {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                </Badge>
              )}
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right bg-gradient-to-r from-blue-900/40 to-purple-900/40 px-4 py-2 rounded-xl backdrop-blur-sm border border-blue-400/30">
                    <span className="text-lg text-blue-200 font-bold block">
                      {userProfile?.full_name || user.email}
                    </span>
                    <span className="text-sm text-purple-300">Neural User</span>
                  </div>
                  <Button variant="outline" size="lg" onClick={handleSignOut} className="border-2 border-red-400/60 text-red-300 hover:bg-red-900/40 bg-black/60 backdrop-blur-sm font-bold">
                    <LogOut className="w-5 h-5 mr-2" />
                    Neural Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button onClick={() => { setIsSignUp(false); setIsAuthModalOpen(true); }} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl font-bold px-8 py-3">
                    <LogIn className="w-5 h-5 mr-2" />
                    Neural Access
                  </Button>
                  <Button onClick={() => { setIsSignUp(true); setIsAuthModalOpen(true); }} size="lg" variant="outline" className="border-2 border-blue-400/60 text-blue-200 hover:bg-blue-900/40 bg-black/60 backdrop-blur-sm font-bold px-8 py-3">
                    Join Neuronix
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

      <main className="relative z-10 container mx-auto px-6 py-12">
        {/* Enhanced Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <TabsList className="grid w-full h-18 bg-gradient-to-r from-slate-950/95 via-purple-950/60 to-blue-950/60 border-2 border-purple-500/40 backdrop-blur-2xl rounded-3xl shadow-2xl" style={{
            gridTemplateColumns: isAdmin ? 'repeat(6, 1fr)' : 'repeat(5, 1fr)'
          }}>
            <TabsTrigger value="translate" className="flex items-center justify-center space-x-3 text-lg font-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-700 data-[state=active]:to-blue-700 data-[state=active]:text-white text-purple-200 px-6 py-4 rounded-2xl transition-all duration-500 hover:scale-105">
              <Sparkles className="w-6 h-6" />
              <span className="hidden sm:inline">Neural Translate</span>
              <span className="sm:hidden">Translate</span>
            </TabsTrigger>
            <TabsTrigger value="website" className="flex items-center justify-center space-x-3 text-lg font-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-700 data-[state=active]:to-blue-700 data-[state=active]:text-white text-purple-200 px-6 py-4 rounded-2xl transition-all duration-500 hover:scale-105">
              <Globe className="w-6 h-6" />
              <span className="hidden sm:inline">Website Engine</span>
              <span className="sm:hidden">Website</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center justify-center space-x-3 text-lg font-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-700 data-[state=active]:to-blue-700 data-[state=active]:text-white text-purple-200 px-6 py-4 rounded-2xl transition-all duration-500 hover:scale-105">
              <BarChart3 className="w-6 h-6" />
              <span className="hidden sm:inline">Neural Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center justify-center space-x-3 text-lg font-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-700 data-[state=active]:to-blue-700 data-[state=active]:text-white text-purple-200 px-6 py-4 rounded-2xl transition-all duration-500 hover:scale-105">
                <Users className="w-6 h-6" />
                <span className="hidden sm:inline">Neural Admin</span>
                <span className="sm:hidden">Admin</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="pricing" className="flex items-center justify-center space-x-3 text-lg font-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-700 data-[state=active]:to-blue-700 data-[state=active]:text-white text-purple-200 px-6 py-4 rounded-2xl transition-all duration-500 hover:scale-105">
              <CreditCard className="w-6 h-6" />
              <span className="hidden sm:inline">Neural Plans</span>
              <span className="sm:hidden">Plans</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center space-x-3 text-lg font-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-700 data-[state=active]:to-blue-700 data-[state=active]:text-white text-purple-200 px-6 py-4 rounded-2xl transition-all duration-500 hover:scale-105">
              <Settings className="w-6 h-6" />
              <span className="hidden sm:inline">Neural Config</span>
              <span className="sm:hidden">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Translation Tab */}
          <TabsContent value="translate" className="space-y-12">
            {/* Ultra-Enhanced Hero Section with Neuronix Brain */}
            <div className="text-center space-y-12 mb-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/15 via-red-600/10 to-blue-600/15 animate-pulse rounded-3xl"></div>
              <div className="relative z-10 p-12">
                <div className="flex items-center justify-center mb-12">
                  <NeuronixBrain size="xl" isActive className="animate-float" />
                </div>
                <h2 className="text-8xl font-black text-white mb-12 relative z-10 leading-tight">
                  <span className="block">Transform Content with</span>
                  <span className="block mt-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-red-400 via-blue-400 to-purple-400 animate-gradient bg-size-200">
                    Neuronix Intelligence
                  </span>
                </h2>
                <p className="text-3xl text-purple-200 max-w-5xl mx-auto leading-relaxed font-bold relative z-10 mb-12">
                  Our revolutionary AI agents powered by Neuronix neural networks deliver contextual, culturally-rich translations that capture tone, humor, and local nuances—transcending literal word conversion.
                </p>
                <div className="flex justify-center space-x-12 mt-12 relative z-10">
                  <Badge className="bg-gradient-to-r from-purple-600 to-red-600 text-white px-8 py-4 text-xl font-black shadow-2xl border-2 border-purple-300/40 rounded-2xl">
                    🧠 Neural Translation Matrix
                  </Badge>
                  <Badge className="bg-gradient-to-r from-red-600 to-blue-600 text-white px-8 py-4 text-xl font-black shadow-2xl border-2 border-red-300/40 rounded-2xl">
                    🌍 Cultural Intelligence Engine
                  </Badge>
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 text-xl font-black shadow-2xl border-2 border-blue-300/40 rounded-2xl">
                    ⚡ Quantum Processing Speed
                  </Badge>
                </div>
              </div>
            </div>

            {/* AI Agents Status */}
            <AgentStatus agentProgress={agentProgress} />

            {/* Advanced Analytics */}
            {user && (
              <div className="mt-16">
                <h3 className="text-4xl font-black text-white mb-12 text-center bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                  Neural Analytics & Intelligence Insights
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
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-6"></div>
                    <p className="text-blue-200 text-xl">Loading Neural Dashboard...</p>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-16">
                <p className="text-blue-200 mb-6 text-xl">Please access Neural Network to view dashboard</p>
                <Button onClick={() => setIsAuthModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-xl px-8 py-4">Neural Access</Button>
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
              <div className="space-y-12">
                <SettingsPanel 
                  currentPlan={currentPlan}
                  onUpgrade={() => setActiveTab('pricing')}
                />
                <BillingHistory userId={user.id} />
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-blue-200 mb-6 text-xl">Please access Neural Network to view settings</p>
                <Button onClick={() => setIsAuthModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-xl px-8 py-4">Neural Access</Button>
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
