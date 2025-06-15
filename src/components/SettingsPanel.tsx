import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, RefreshCw, Shield, Lock, Key, DollarSign, Archive, Trash2, CreditCard, Users, Eye, BarChart3, Zap, Download, CheckCircle, Mail } from "lucide-react";

interface SettingsPanelProps {
  currentPlan: string;
  onUpgrade: () => void;
  onOpenPreferences: () => void;
  onOpenSecurity: () => void;
  onOpenBilling: () => void;
  onOpenAnalytics: () => void;
  onOpenExport: () => void;
  onOpenPerformance: () => void;
  onOpenHistory: () => void;
  onOpenComparePlans: () => void;
  onOpenUpgradeNow: () => void;
  onOpenEnterprise: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  currentPlan, 
  onUpgrade,
  onOpenPreferences,
  onOpenSecurity,
  onOpenBilling,
  onOpenAnalytics,
  onOpenExport,
  onOpenPerformance,
  onOpenHistory,
  onOpenComparePlans,
  onOpenUpgradeNow,
  onOpenEnterprise,
}) => {
  return (
    <div className="space-y-10">
      {/* Preferences */}
      <Card className="bg-black/80 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-200"><Edit className="w-5 h-5" /><span>Configure Preferences</span></CardTitle>
          <CardDescription className="text-purple-300/70">Customize your Linguista experience</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onOpenPreferences} className="w-full bg-purple-600 hover:bg-purple-700 mb-2">
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
          <Button onClick={onOpenSecurity} className="w-full bg-blue-600 hover:bg-blue-700 mb-2">
            <Lock className="w-4 h-4 mr-2" />Manage
          </Button>
          <Button onClick={onOpenSecurity} variant="outline" className="w-full">
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
          <Button onClick={onOpenBilling} className="w-full bg-green-600 hover:bg-green-700 mb-2">
            <DollarSign className="w-4 h-4 mr-2" />View Bills
          </Button>
          <Button onClick={onOpenBilling} variant="outline" className="w-full">
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
            <Button onClick={onOpenAnalytics} className="w-full bg-purple-600 hover:bg-purple-700 mb-2">
              <BarChart3 className="w-4 h-4 mr-2" />View Analytics
            </Button>
            <Button variant="outline" className="w-full" onClick={onOpenExport}>
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
            <Button onClick={onOpenPerformance} className="w-full bg-blue-600 hover:bg-blue-700 mb-2">
              <Zap className="w-4 h-4 mr-2" />Performance
            </Button>
            <Button variant="outline" className="w-full" onClick={onOpenHistory}>
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
            <Button onClick={onOpenComparePlans} className="w-full bg-yellow-600 hover:bg-yellow-700 mb-2">
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
            <Button onClick={onOpenUpgradeNow} className="w-full bg-green-600 hover:bg-green-700 mb-2">
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
            <Button onClick={onOpenEnterprise} className="w-full bg-blue-600 hover:bg-blue-700 mb-2">
              <Users className="w-4 h-4 mr-2" />Contact Sales
            </Button>
            <Button onClick={onOpenEnterprise} variant="outline" className="w-full">
              <Mail className="w-4 h-4 mr-2" />Get Quote
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
