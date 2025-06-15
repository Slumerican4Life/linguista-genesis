
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TranslationSection } from '@/components/sections/TranslationSection';
import { WebsiteTranslator } from '@/components/translation/WebsiteTranslator';
import { UsageDashboard } from '@/components/UsageDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { PricingPlans } from '@/components/PricingPlans';
import { SettingsPanel } from '@/components/SettingsPanel';
import { BillingHistory } from '@/components/payment/BillingHistory';
import { AgentStatus } from '@/components/AgentStatus';
import { HeroSection } from '@/components/sections/HeroSection';
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import { User } from '@supabase/supabase-js';

interface TabContentProps {
  // Translation props
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
  
  // User and auth props
  user: User | null;
  usageData: any;
  userProfile: any;
  currentPlan: string;
  isAdmin: boolean;
  
  // Handlers
  onSelectPlan: (planId: string) => void;
  onOpenAuthModal: () => void;
  setActiveTab: (tab: string) => void;
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
  setActiveTab
}) => {
  return (
    <>
      {/* Translation Tab */}
      <TabsContent value="translate" className="space-y-12">
        <HeroSection />
        <AgentStatus agentProgress={agentProgress} />
        
        {user && (
          <div className="mt-16">
            <h3 className="text-4xl font-black text-white mb-12 text-center bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
              Neural Analytics & Intelligence Insights
            </h3>
            <AdvancedAnalytics />
          </div>
        )}

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
            <Button onClick={onOpenAuthModal} className="bg-blue-600 hover:bg-blue-700 text-xl px-8 py-4">Neural Access</Button>
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
          onSelectPlan={onSelectPlan}
          currentPlan={currentPlan}
        />
      </TabsContent>

      {/* Settings Tab */}
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
            <Button onClick={onOpenAuthModal} className="bg-blue-600 hover:bg-blue-700 text-xl px-8 py-4">Neural Access</Button>
          </div>
        )}
      </TabsContent>
    </>
  );
};
