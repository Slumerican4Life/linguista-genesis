
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { TranslationSection } from '@/components/sections/TranslationSection';
import { WebsiteTranslator } from '@/components/translation/WebsiteTranslator';
import { PricingPlans } from '@/components/PricingPlans';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AuthSection } from '@/components/auth/AuthSection';
import { UsageDashboard } from '@/components/UsageDashboard';
import { SettingsPanel } from '@/components/SettingsPanel';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TabContentProps {
  inputText: string;
  setInputText: (text: string) => void;
  selectedLanguages: string[];
  setSelectedLanguages: (languages: string[]) => void;
  selectedTone: string;
  setSelectedTone: (tone: string) => void;
  isTranslating: boolean;
  translations: Record<string, string>;
  agentProgress: Record<string, 'idle' | 'processing' | 'complete'>;
  onTranslate: () => void;
  user: User | null;
  usageData: any;
  userProfile: any;
  currentPlan: string;
  isAdmin: boolean;
  onSelectPlan: (priceId: string) => void;
  onOpenAuthModal: () => void;
  setActiveTab: (tab: string) => void;
  onOpenAnalytics: () => void;
  onOpenPerformance: () => void;
  onOpenBilling: () => void;
  onOpenComparePlans: () => void;
}

export const TabContent: React.FC<TabContentProps> = ({
  inputText,
  setInputText,
  selectedLanguages,
  setSelectedLanguages,
  selectedTone,
  setSelectedTone,
  isTranslating,
  translations,
  agentProgress,
  onTranslate,
  user,
  usageData,
  userProfile,
  currentPlan,
  isAdmin,
  onSelectPlan,
  onOpenAuthModal,
  setActiveTab,
  onOpenAnalytics,
  onOpenPerformance,
  onOpenBilling,
  onOpenComparePlans,
}) => {
  // Handle manage subscription
  const handleManageSubscription = async () => {
    if (!user) {
      toast.error("Please log in to manage your subscription.");
      return;
    }

    const toastId = toast.loading("Processing...");

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: {},
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.url) {
        toast.success("Redirecting to customer portal...", { id: toastId });
        window.location.href = data.url;
      } else {
        throw new Error("Could not create customer portal session.");
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`, { id: toastId });
      console.error('Error creating customer portal session:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      setActiveTab('translate');
    }
  };

  const handleUpgrade = () => {
    setActiveTab('pricing');
    toast.info("Please select a new plan to upgrade.");
  };
  
  const handleContactSales = () => {
    window.location.href = "mailto:cleanasawhistle1000@gmail.com?subject=Inquiry about Enterprise Plan&body=Hello, I am interested in learning more about your Enterprise solutions.";
  };

  return (
    <>
      <TabsContent value="translate" className="mt-8">
        <TranslationSection
          inputText={inputText}
          setInputText={setInputText}
          selectedLanguages={selectedLanguages}
          setSelectedLanguages={setSelectedLanguages}
          selectedTone={selectedTone}
          setSelectedTone={setSelectedTone}
          isTranslating={isTranslating}
          translations={translations}
          onTranslate={onTranslate}
          currentPlan={currentPlan}
        />
      </TabsContent>

      <TabsContent value="website" className="mt-8">
        <WebsiteTranslator />
      </TabsContent>

      <TabsContent value="pricing" className="mt-8">
        <PricingPlans
          currentPlan={currentPlan}
          onSelectPlan={onSelectPlan}
        />
      </TabsContent>

      <TabsContent value="dashboard" className="mt-8">
        <UsageDashboard usage={usageData} onUpgrade={handleUpgrade} />
      </TabsContent>

      <TabsContent value="auth" className="mt-8">
        <AuthSection 
          user={user}
          userProfile={userProfile}
          onOpenAuthModal={onOpenAuthModal}
          onSignOut={handleSignOut}
        />
      </TabsContent>

      <TabsContent value="settings" className="mt-8">
        <SettingsPanel
          currentPlan={currentPlan}
          onUpgrade={handleUpgrade}
          onOpenPreferences={() => toast.info("Preferences are available inline.")}
          onOpenSecurity={() => toast.info("Security settings are available inline.")}
          onOpenBilling={onOpenBilling}
          onManageSubscription={handleManageSubscription}
          onOpenAnalytics={onOpenAnalytics}
          onOpenPerformance={onOpenPerformance}
          onOpenExport={() => toast.info("Data export is coming soon.")}
          onOpenHistory={() => toast.info("Translation history is coming soon.")}
          onOpenComparePlans={onOpenComparePlans}
          onOpenUpgradeNow={handleUpgrade}
          onOpenEnterprise={handleContactSales}
        />
      </TabsContent>

      {isAdmin && (
        <TabsContent value="admin" className="mt-8">
          <AdminDashboard />
        </TabsContent>
      )}
    </>
  );
};
