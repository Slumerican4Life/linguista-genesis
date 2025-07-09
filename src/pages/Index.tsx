import React, { useState, useEffect } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { AppBackground } from '@/components/layout/AppBackground';
import { AppHeader } from '@/components/layout/AppHeader';
import { NavigationTabs } from '@/components/navigation/NavigationTabs';
import { TabContent } from '@/components/tabs/TabContent';
import { AdBanner } from '@/components/ads/AdBanner';
import { AuthModal } from '@/components/AuthModal';
import { LyraOverlay } from '@/components/LyraOverlay';
import { AdSenseScript } from '@/components/AdSenseScript';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AnalyticsModal } from '@/components/analytics/AnalyticsModal';
import { PerformanceModal } from '@/components/analytics/PerformanceModal';
import { BillingModal } from '@/components/payment/BillingModal';
import { ComparePlansModal } from '@/components/pricing/ComparePlansModal';
import { autoDetectTargetLanguages, isAutoDetectionSupported } from '@/lib/language-detection';

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
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isComparePlansModalOpen, setIsComparePlansModalOpen] = useState(false);
  const [agentProgress, setAgentProgress] = useState<Record<string, 'idle' | 'processing' | 'complete'>>({
    security: 'idle',
    prism: 'idle',
    syntax: 'idle',
    voca: 'idle',
    lyra: 'idle'
  });

  // Initialize auto-detection on first load if no languages selected
  React.useEffect(() => {
    if (selectedLanguages.length === 0 && isAutoDetectionSupported()) {
      const autoLanguages = autoDetectTargetLanguages();
      if (autoLanguages.length > 0) {
        setSelectedLanguages(autoLanguages.slice(0, 2)); // Start with top 2 detected languages
      }
    }
  }, []); // Only run on initial mount

  // Enhanced authentication handling with better session management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        toast.success(`Welcome back, ${session.user.email}!`);
        setIsAuthModalOpen(false);
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
      
      const { data: todayUsage } = await supabase
        .from('usage_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
      
      const subscription = userProfile?.subscriptions?.[0];
      const tier = subscription?.tier || 'free';
      
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

  const currentPlan = userProfile?.subscriptions?.[0]?.tier || 'free';
  // Identify creator by hardcoding email (production: maybe by role field)
  const isCreator = userProfile?.email === 'cleanasawhistle1000@gmail.com';
  const isOwner = userProfile?.role === 'owner' && !isCreator;
  const isManager = userProfile?.role === 'manager' && !isCreator;
  const isAdmin = isCreator || isOwner || isManager;

  const handleTranslate = async () => {
    if (!inputText.trim() || selectedLanguages.length === 0) return;
    
    setIsTranslating(true);
    setTranslations({});
    
    const agents = ['security', 'prism', 'syntax', 'voca', 'lyra'];
    
    for (const agent of agents) {
      setAgentProgress(prev => ({ ...prev, [agent]: 'processing' }));
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
      setAgentProgress(prev => ({ ...prev, [agent]: 'complete' }));
    }
    
    try {
      if (user) {
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
        const mockTranslations: Record<string, string> = {};
        selectedLanguages.forEach(lang => {
          mockTranslations[lang] = `[${selectedTone.toUpperCase()}] ${inputText} (contextually translated to ${lang}) - Sign in for real AI translations`;
        });
        setTranslations(mockTranslations);
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Please try again.');
      const mockTranslations: Record<string, string> = {};
      selectedLanguages.forEach(lang => {
        mockTranslations[lang] = `Translation error occurred. Please try again.`;
      });
      setTranslations(mockTranslations);
    }
    
    setIsTranslating(false);
  };

  const handleSelectPlan = async (priceId: string) => {
    if (!user) {
      toast.error("Please log in to upgrade your plan.");
      handleOpenAuthModal();
      return;
    }

    const toastId = toast.loading("Creating checkout session...");

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.url) {
        toast.success("Redirecting to Stripe...", { id: toastId });
        window.open(data.url, '_blank');
      } else {
        throw new Error("Could not create Stripe checkout session.");
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`, { id: toastId });
      console.error('Error creating checkout session:', error);
    }
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

  const handleOpenAuthModal = (signUp: boolean = false) => {
    setIsSignUp(signUp);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-blue-950/30 relative overflow-hidden">
      <AppBackground />
      <AdSenseScript />
      
      <AppHeader 
        user={user}
        userProfile={userProfile}
        onSignOut={handleSignOut}
        onOpenAuthModal={handleOpenAuthModal}
      />

      <div className="container mx-auto px-4">
        <AdBanner position="top" user={user} currentPlan={currentPlan} />
      </div>

      <main className="relative z-10 container mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <NavigationTabs isAdmin={isAdmin} />
          
          <TabContent
            inputText={inputText}
            setInputText={setInputText}
            selectedLanguages={selectedLanguages}
            setSelectedLanguages={setSelectedLanguages}
            selectedTone={selectedTone}
            setSelectedTone={setSelectedTone}
            isTranslating={isTranslating}
            translations={translations}
            agentProgress={agentProgress}
            onTranslate={handleTranslate}
            user={user}
            usageData={usageData}
            userProfile={userProfile}
            currentPlan={currentPlan}
            isAdmin={isAdmin}
            onSelectPlan={handleSelectPlan}
            onOpenAuthModal={() => handleOpenAuthModal(false)}
            setActiveTab={setActiveTab}
            onOpenAnalytics={() => setIsAnalyticsModalOpen(true)}
            onOpenPerformance={() => setIsPerformanceModalOpen(true)}
            onOpenBilling={() => setIsBillingModalOpen(true)}
            onOpenComparePlans={() => setIsComparePlansModalOpen(true)}
          />

          {isAdmin && activeTab === "admin" && (
            <div className="mt-12">
              {isCreator && (
                // Enhanced admin interface for the creator
                <React.Suspense fallback={<div>Loading Enhanced User Management...</div>}>
                  {/** Dynamically import for code splitting if desired */}
                  {React.createElement(require('@/components/admin/EnhancedUserManagement').EnhancedUserManagement)}
                </React.Suspense>
              )}
              {!isCreator && (isOwner || isManager) && (
                // Classic user management (without gifting interface)
                <React.Suspense fallback={<div>Loading User Management...</div>}>
                  {React.createElement(require('@/components/admin/UserManagement').UserManagement)}
                </React.Suspense>
              )}
              {/* No admin UI for all others */}
            </div>
          )}

          <AdBanner position="middle" user={user} currentPlan={currentPlan} />
        </Tabs>

        <AdBanner position="bottom" user={user} currentPlan={currentPlan} />
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        isLogin={!isSignUp}
      />

      <AnalyticsModal open={isAnalyticsModalOpen} onClose={() => setIsAnalyticsModalOpen(false)} />
      <PerformanceModal open={isPerformanceModalOpen} onClose={() => setIsPerformanceModalOpen(false)} />
      <BillingModal open={isBillingModalOpen} onClose={() => setIsBillingModalOpen(false)} user={user} />
      <ComparePlansModal open={isComparePlansModalOpen} onClose={() => setIsComparePlansModalOpen(false)} />

      <LyraOverlay />
    </div>
  );
};

export default Index;
