
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
import { Globe, BarChart3, CreditCard, Settings, Zap, Download, FileText, Shield, Users, Bot, Eye, Search, Target, Upload, Database, Cpu, AlertTriangle, CheckCircle, Clock, TrendingUp, DollarSign, Calendar, Mail, Phone, Lock, Key, Archive, Trash2, Edit, Copy, Share2, Filter, RefreshCw, HelpCircle, Star, Heart, Bookmark } from 'lucide-react';

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
        {/* Website Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/80 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-200">
                <Globe className="w-5 h-5" />
                <span>Website Crawling</span>
              </CardTitle>
              <CardDescription className="text-purple-300/70">
                Extract content from websites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 mb-2">
                <Download className="w-4 h-4 mr-2" />
                Extract Content
              </Button>
              <Button variant="outline" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Analyze Structure
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-200">
                <FileText className="w-5 h-5" />
                <span>Bulk Translation</span>
              </CardTitle>
              <CardDescription className="text-blue-300/70">
                Process multiple pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 mb-2">
                <Zap className="w-4 h-4 mr-2" />
                Process Pages
              </Button>
              <Button variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-200">
                <Shield className="w-5 h-5" />
                <span>Quality Check</span>
              </CardTitle>
              <CardDescription className="text-green-300/70">
                Validate translations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 hover:bg-green-700 mb-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                Validate Output
              </Button>
              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Preview Results
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Website Tools */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
            <Bot className="w-6 h-6" />
            <span>AI Crawler</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
            <Target className="w-6 h-6" />
            <span>SEO Analysis</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
            <Database className="w-6 h-6" />
            <span>Content DB</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
            <RefreshCw className="w-6 h-6" />
            <span>Auto Sync</span>
          </Button>
        </div>

        <WebsiteTranslator />
      </TabsContent>

      {/* Dashboard Tab */}
      <TabsContent value="dashboard" className="space-y-8">
        {user ? (
          <>
            {/* Dashboard Control Panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-black/80 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-purple-200">
                    <BarChart3 className="w-5 h-5" />
                    <span>Analytics</span>
                  </CardTitle>
                  <CardDescription className="text-purple-300/70">
                    Usage insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 mb-2">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Live Stats
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-200">
                    <Download className="w-5 h-5" />
                    <span>Export Data</span>
                  </CardTitle>
                  <CardDescription className="text-blue-300/70">
                    Download reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 mb-2">
                    <FileText className="w-4 h-4 mr-2" />
                    Download CSV
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Archive className="w-4 h-4 mr-2" />
                    Export All
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-200">
                    <Zap className="w-5 h-5" />
                    <span>Performance</span>
                  </CardTitle>
                  <CardDescription className="text-green-300/70">
                    System optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-green-600 hover:bg-green-700 mb-2">
                    <Cpu className="w-4 h-4 mr-2" />
                    Optimize
                  </Button>
                  <Button variant="outline" className="w-full">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Check Issues
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-yellow-200">
                    <Clock className="w-5 h-5" />
                    <span>History</span>
                  </CardTitle>
                  <CardDescription className="text-yellow-300/70">
                    Translation logs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700 mb-2">
                    <FileText className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter Results
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Additional Dashboard Tools */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-8">
              <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                <Star className="w-5 h-5" />
                <span className="text-xs">Favorites</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                <Bookmark className="w-5 h-5" />
                <span className="text-xs">Bookmarks</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                <Share2 className="w-5 h-5" />
                <span className="text-xs">Share</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                <Copy className="w-5 h-5" />
                <span className="text-xs">Copy</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                <Edit className="w-5 h-5" />
                <span className="text-xs">Edit</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                <HelpCircle className="w-5 h-5" />
                <span className="text-xs">Help</span>
              </Button>
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
        {/* Pricing Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/80 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-200">
                <CreditCard className="w-5 h-5" />
                <span>Compare Plans</span>
              </CardTitle>
              <CardDescription className="text-purple-300/70">
                Feature comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 mb-2">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
              <Button variant="outline" className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                Compare Features
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-200">
                <Zap className="w-5 h-5" />
                <span>Upgrade Now</span>
              </CardTitle>
              <CardDescription className="text-green-300/70">
                Instant activation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 hover:bg-green-700 mb-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                Get Premium
              </Button>
              <Button variant="outline" className="w-full">
                <DollarSign className="w-4 h-4 mr-2" />
                View Pricing
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-200">
                <Shield className="w-5 h-5" />
                <span>Enterprise</span>
              </CardTitle>
              <CardDescription className="text-blue-300/70">
                Custom solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 mb-2">
                <Users className="w-4 h-4 mr-2" />
                Contact Sales
              </Button>
              <Button variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Get Quote
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Pricing Options */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8">
          <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Monthly</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Yearly</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
            <Heart className="w-5 h-5" />
            <span className="text-xs">Student</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
            <Users className="w-5 h-5" />
            <span className="text-xs">Team</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
            <Star className="w-5 h-5" />
            <span className="text-xs">Enterprise</span>
          </Button>
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
            {/* Settings Control Panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-black/80 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-purple-200">
                    <Settings className="w-5 h-5" />
                    <span>Preferences</span>
                  </CardTitle>
                  <CardDescription className="text-purple-300/70">
                    User settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 mb-2">
                    <Edit className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-200">
                    <Shield className="w-5 h-5" />
                    <span>Security</span>
                  </CardTitle>
                  <CardDescription className="text-blue-300/70">
                    Account protection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 mb-2">
                    <Lock className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-200">
                    <CreditCard className="w-5 h-5" />
                    <span>Billing</span>
                  </CardTitle>
                  <CardDescription className="text-green-300/70">
                    Payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-green-600 hover:bg-green-700 mb-2">
                    <DollarSign className="w-4 h-4 mr-2" />
                    View Bills
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Update Payment
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-yellow-200">
                    <Download className="w-5 h-5" />
                    <span>Export</span>
                  </CardTitle>
                  <CardDescription className="text-yellow-300/70">
                    Data download
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700 mb-2">
                    <Archive className="w-4 h-4 mr-2" />
                    Download Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Additional Settings Options */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-8">
              <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                <Mail className="w-5 h-5" />
                <span className="text-xs">Email</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                <Phone className="w-5 h-5" />
                <span className="text-xs">Phone</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                <Bot className="w-5 h-5" />
                <span className="text-xs">AI Prefs</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                <Globe className="w-5 h-5" />
                <span className="text-xs">Language</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                <Eye className="w-5 h-5" />
                <span className="text-xs">Theme</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                <HelpCircle className="w-5 h-5" />
                <span className="text-xs">Support</span>
              </Button>
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
