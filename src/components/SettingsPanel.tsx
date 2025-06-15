
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, RefreshCw, Shield, Lock, Key, DollarSign, Archive, Trash2, CreditCard, Users, Eye, BarChart3, Zap, Download, CheckCircle, Mail } from "lucide-react";

// Modal/dialog components
import { UserPreferencesModal } from "@/components/preferences/UserPreferencesModal";
import { SecuritySettingsModal } from "@/components/security/SecuritySettingsModal";
import { AnalyticsModal } from "@/components/analytics/AnalyticsModal";
import { ExportDataModal } from "@/components/analytics/ExportDataModal";
import { PerformanceModal } from "@/components/analytics/PerformanceModal";
import { HistoryModal } from "@/components/analytics/HistoryModal";

// Placeholder BillingModal for demonstration
const BillingModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) =>
  open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white text-black rounded-lg p-6 min-w-[320px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Billing & Subscription</h2>
          <button onClick={onClose} className="ml-4 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">Close</button>
        </div>
        <p className="mb-2">Current Plan: (demo) Premium</p>
        <p className="mb-2">Renewal: (demo) 2025-07-01</p>
        <p className="mb-2">Payment Method: (demo) Visa ****1234</p>
        <Button className="w-full bg-green-600 mt-3">Manage Billing</Button>
      </div>
    </div>
  ) : null;

// Generic modal template for Compare Plans, Upgrade Now, Enterprise
const SimpleModal: React.FC<{ open: boolean; title: string; onClose: () => void; children: React.ReactNode }> = ({ open, title, onClose, children }) => 
  open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="bg-white text-black rounded-lg p-6 min-w-[340px] max-w-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="ml-4 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">Close</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  ) : null;

export const SettingsPanel: React.FC<{ currentPlan: string; onUpgrade: () => void }> = ({ currentPlan, onUpgrade }) => {
  // Modal State
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);

  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [isComparePlansOpen, setIsComparePlansOpen] = useState(false);
  const [isUpgradeNowOpen, setIsUpgradeNowOpen] = useState(false);
  const [isEnterpriseOpen, setIsEnterpriseOpen] = useState(false);

  return (
    <div className="space-y-10">
      {/* Preferences */}
      <Card className="bg-black/80 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-200"><Edit className="w-5 h-5" /><span>Configure Preferences</span></CardTitle>
          <CardDescription className="text-purple-300/70">Customize your Linguista experience</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsPreferencesOpen(true)} className="w-full bg-purple-600 hover:bg-purple-700 mb-2">
            <Edit className="w-4 h-4 mr-2" />Configure Preferences
          </Button>
          <Button variant="outline" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />Reset
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-black/80 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-200"><Shield className="w-5 h-5" /><span>Security</span></CardTitle>
          <CardDescription className="text-blue-300/70">
            Protect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsSecurityOpen(true)} className="w-full bg-blue-600 hover:bg-blue-700 mb-2">
            <Lock className="w-4 h-4 mr-2" />Manage
          </Button>
          <Button variant="outline" className="w-full">
            <Key className="w-4 h-4 mr-2" />Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card className="bg-black/80 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-200">
            <CreditCard className="w-5 h-5" /><span>Billing</span>
          </CardTitle>
          <CardDescription className="text-green-300/70">Payment methods and subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsBillingOpen(true)} className="w-full bg-green-600 hover:bg-green-700 mb-2">
            <DollarSign className="w-4 h-4 mr-2" />View Bills
          </Button>
          <Button variant="outline" className="w-full">
            <Edit className="w-4 h-4 mr-2" />Update Payment
          </Button>
        </CardContent>
      </Card>

      {/* Analytics & Export & Performance & History */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Analytics */}
        <Card className="bg-black/80 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-200">
              <BarChart3 className="w-5 h-5" /><span>Analytics</span>
            </CardTitle>
            <CardDescription className="text-purple-300/70">Usage insights</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsAnalyticsOpen(true)} className="w-full bg-purple-600 hover:bg-purple-700 mb-2">
              <BarChart3 className="w-4 h-4 mr-2" />View Analytics
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setIsExportOpen(true)}>
              <Download className="w-4 h-4 mr-2" />Export Data
            </Button>
          </CardContent>
        </Card>

        {/* Performance & History */}
        <Card className="bg-black/80 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-200">
              <Zap className="w-5 h-5" /><span>Performance</span>
            </CardTitle>
            <CardDescription className="text-blue-300/70">System status and translation history</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsPerformanceOpen(true)} className="w-full bg-blue-600 hover:bg-blue-700 mb-2">
              <Zap className="w-4 h-4 mr-2" />Performance
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setIsHistoryOpen(true)}>
              <Archive className="w-4 h-4 mr-2" />History
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Compare Plans/Upgrade/Enterprise (Pricing tab: for completeness, re-usable here) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
        {/* Compare Plans */}
        <Card className="bg-black/80 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-200">
              <Eye className="w-5 h-5" /><span>Compare Plans</span>
            </CardTitle>
            <CardDescription className="text-yellow-300/70">See all plan features</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsComparePlansOpen(true)} className="w-full bg-yellow-600 hover:bg-yellow-700 mb-2">
              <Eye className="w-4 h-4 mr-2" />View Details
            </Button>
          </CardContent>
        </Card>
        {/* Upgrade Now */}
        <Card className="bg-black/80 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-200">
              <CheckCircle className="w-5 h-5" /><span>Upgrade Now</span>
            </CardTitle>
            <CardDescription className="text-green-300/70">Instant activation</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsUpgradeNowOpen(true)} className="w-full bg-green-600 hover:bg-green-700 mb-2">
              <CheckCircle className="w-4 h-4 mr-2" />Get Premium
            </Button>
          </CardContent>
        </Card>
        {/* Enterprise */}
        <Card className="bg-black/80 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-200">
              <Users className="w-5 h-5" /><span>Enterprise</span>
            </CardTitle>
            <CardDescription className="text-blue-300/70">Custom solutions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsEnterpriseOpen(true)} className="w-full bg-blue-600 hover:bg-blue-700 mb-2">
              <Users className="w-4 h-4 mr-2" />Contact Sales
            </Button>
            <Button variant="outline" className="w-full">
              <Mail className="w-4 h-4 mr-2" />Get Quote
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* All Modals (all in one render tree, controlled by state) */}
      <UserPreferencesModal open={isPreferencesOpen} onClose={() => setIsPreferencesOpen(false)} />
      <SecuritySettingsModal open={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />
      <BillingModal open={isBillingOpen} onClose={() => setIsBillingOpen(false)} />

      <AnalyticsModal open={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />
      <ExportDataModal open={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <PerformanceModal open={isPerformanceOpen} onClose={() => setIsPerformanceOpen(false)} />
      <HistoryModal open={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      {/* Pricing tab feature-complete modals */}
      <SimpleModal open={isComparePlansOpen} title="Compare Plans" onClose={() => setIsComparePlansOpen(false)}>
        {/* Here you might render a feature comparison table if you have one; for now: */}
        <p className="mb-4">Full plan comparison table coming soon!</p>
        <ul className="list-disc mb-3 pl-6">
          <li>See which features are included in Free, Pro, Premium, Business, and Enterprise tiers.</li>
          <li>Choose the plan that fits your needs.</li>
        </ul>
      </SimpleModal>
      <SimpleModal open={isUpgradeNowOpen} title="Upgrade Now" onClose={() => setIsUpgradeNowOpen(false)}>
        <p className="mb-4">Click below to get instant Premium activation:</p>
        <Button className="w-full bg-green-600 hover:bg-green-700">Upgrade to Premium</Button>
      </SimpleModal>
      <SimpleModal open={isEnterpriseOpen} title="Enterprise Solutions" onClose={() => setIsEnterpriseOpen(false)}>
        <p className="mb-4">Ready for a custom plan, white-label, or AI integration?</p>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 mb-2">Contact Sales</Button>
        <Button variant="outline" className="w-full">Get Enterprise Quote</Button>
      </SimpleModal>
    </div>
  );
};
