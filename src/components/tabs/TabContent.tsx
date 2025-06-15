
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Globe, BarChart3, CreditCard, Settings, Zap, Download, FileText, Shield } from 'lucide-react';

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
      <TabsContent value="website" className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/80 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-200">
                <Globe className="w-5 h-5" />
                <span>Website Crawling</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Download className="w-4 h-4 mr-2" />
                Extract Content
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-200">
                <FileText className="w-5 h-5" />
                <span>Bulk Translation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Zap className="w-4 h-4 mr-2" />
                Process Pages
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-200">
                <Shield className="w-5 h-5" />
                <span>Quality Check</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Shield className="w-4 h-4 mr-2" />
                Validate Output
              </Button>
            </CardContent>
          </Card>
        </div>

        <WebsiteTranslator />
      </TabsContent>

      {/* Dashboard Tab */}
      <TabsContent value="dashboard" className="space-y-8">
        {user ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-black/80 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-purple-200">
                    <BarChart3 className="w-5 h-5" />
                    <span>Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    View Reports
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-200">
                    <Download className="w-5 h-5" />
                    <span>Export Data</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Download CSV
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-200">
                    <Zap className="w-5 h-5" />
                    <span>Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Optimize
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-yellow-200">
                    <FileText className="w-5 h-5" />
                    <span>History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                    View All
                  </Button>
                </CardContent>
              </Card>
            </div>

            {usageData ? (
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
            )}
          </>
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
      <TabsContent value="pricing" className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/80 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-200">
                <CreditCard className="w-5 h-5" />
                <span>Compare Plans</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                View Details
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-200">
                <Zap className="w-5 h-5" />
                <span>Upgrade Now</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Get Premium
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-200">
                <Shield className="w-5 h-5" />
                <span>Enterprise</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>

        <PricingPlans 
          onSelectPlan={onSelectPlan}
          currentPlan={currentPlan}
        />
      </TabsContent>

      {/* Settings Tab */}
      <TabsContent value="settings" className="space-y-8">
        {user ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-black/80 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-purple-200">
                    <Settings className="w-5 h-5" />
                    <span>Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Configure
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-200">
                    <Shield className="w-5 h-5" />
                    <span>Security</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Manage
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-200">
                    <CreditCard className="w-5 h-5" />
                    <span>Billing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    View Bills
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-yellow-200">
                    <Download className="w-5 h-5" />
                    <span>Export</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                    Download Data
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-12">
              <SettingsPanel 
                currentPlan={currentPlan}
                onUpgrade={() => setActiveTab('pricing')}
              />
              <BillingHistory userId={user.id} />
            </div>
          </>
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
