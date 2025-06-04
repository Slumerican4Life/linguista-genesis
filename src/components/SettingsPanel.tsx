
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Shield, Globe, Palette, Bell, CreditCard, Users, Key, 
  Phone, Mail, Eye, EyeOff, Download, Upload, Trash2, Settings
} from 'lucide-react';

interface SettingsPanelProps {
  currentPlan: string;
  onUpgrade: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ currentPlan, onUpgrade }) => {
  const [settings, setSettings] = useState({
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      avatar: null
    },
    security: {
      twoFactorEnabled: false,
      emailVerified: true,
      phoneVerified: false,
      loginNotifications: true,
      sessionTimeout: '24h'
    },
    translation: {
      defaultSourceLang: 'en',
      defaultTargetLangs: ['es', 'fr'],
      defaultTone: 'natural',
      customTone: '',
      autoDetectLanguage: true,
      saveTranslationHistory: true,
      enableLearning: true
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      weeklyReports: true,
      usageAlerts: true,
      newFeatures: true
    },
    billing: {
      autoRenew: true,
      receiveInvoices: true,
      usageAlerts: true
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' }
  ];

  const tones = [
    { value: 'natural', label: 'Natural', description: 'Conversational and authentic' },
    { value: 'formal', label: 'Formal', description: 'Professional and polished' },
    { value: 'casual', label: 'Casual', description: 'Relaxed and friendly' },
    { value: 'humorous', label: 'Humorous', description: 'Light-hearted and witty' },
    { value: 'serious', label: 'Serious', description: 'Straightforward and direct' },
    { value: 'poetic', label: 'Poetic', description: 'Artistic and expressive' }
  ];

  const isPremiumOrBusiness = currentPlan === 'pro' || currentPlan === 'agency';
  const isBusiness = currentPlan === 'agency';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your account preferences and configurations</p>
        </div>
        <Badge variant={currentPlan === 'free' ? 'secondary' : 'default'} className="text-sm">
          {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="translation" className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Translation</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center space-x-2" disabled={!isBusiness}>
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your personal details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {settings.profile.firstName[0]}{settings.profile.lastName[0]}
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={settings.profile.firstName}
                    onChange={(e) => updateSetting('profile', 'firstName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={settings.profile.lastName}
                    onChange={(e) => updateSetting('profile', 'lastName', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="flex space-x-2">
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                    className="flex-1"
                  />
                  <Badge variant={settings.security.emailVerified ? 'default' : 'secondary'}>
                    {settings.security.emailVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex space-x-2">
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                    className="flex-1"
                  />
                  <Badge variant={settings.security.phoneVerified ? 'default' : 'secondary'}>
                    {settings.security.phoneVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security & Authentication</CardTitle>
              <CardDescription>Protect your account with advanced security features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  checked={settings.security.twoFactorEnabled}
                  onCheckedChange={(checked) => updateSetting('security', 'twoFactorEnabled', checked)}
                />
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Change Password</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <Button>Update Password</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Login Notifications</h4>
                    <p className="text-sm text-muted-foreground">Get notified of new device logins</p>
                  </div>
                  <Switch
                    checked={settings.security.loginNotifications}
                    onCheckedChange={(checked) => updateSetting('security', 'loginNotifications', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout</Label>
                  <Select value={settings.security.sessionTimeout} onValueChange={(value) => updateSetting('security', 'sessionTimeout', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="8h">8 hours</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="7d">7 days</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Translation Preferences</CardTitle>
              <CardDescription>Configure your default translation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultSourceLang">Default Source Language</Label>
                  <Select value={settings.translation.defaultSourceLang} onValueChange={(value) => updateSetting('translation', 'defaultSourceLang', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="defaultTargetLangs">Default Target Languages</Label>
                  <div className="space-y-2">
                    {settings.translation.defaultTargetLangs.map(langCode => {
                      const lang = languages.find(l => l.code === langCode);
                      return (
                        <Badge key={langCode} variant="outline" className="mr-2">
                          {lang?.flag} {lang?.name}
                        </Badge>
                      );
                    })}
                    <Button variant="outline" size="sm" className="w-full">
                      + Add Language
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="defaultTone">Default Tone</Label>
                <Select value={settings.translation.defaultTone} onValueChange={(value) => updateSetting('translation', 'defaultTone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map(tone => (
                      <SelectItem key={tone.value} value={tone.value}>
                        <div>
                          <div className="font-medium">{tone.label}</div>
                          <div className="text-sm text-muted-foreground">{tone.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                    {isPremiumOrBusiness && <SelectItem value="custom">Custom Tone</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              {isPremiumOrBusiness && settings.translation.defaultTone === 'custom' && (
                <div>
                  <Label htmlFor="customTone">Custom Tone Description</Label>
                  <Input
                    id="customTone"
                    placeholder="Describe your desired tone..."
                    value={settings.translation.customTone}
                    onChange={(e) => updateSetting('translation', 'customTone', e.target.value)}
                  />
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-Detect Language</h4>
                    <p className="text-sm text-muted-foreground">Automatically detect source language</p>
                  </div>
                  <Switch
                    checked={settings.translation.autoDetectLanguage}
                    onCheckedChange={(checked) => updateSetting('translation', 'autoDetectLanguage', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Save Translation History</h4>
                    <p className="text-sm text-muted-foreground">Keep a record of your translations</p>
                  </div>
                  <Switch
                    checked={settings.translation.saveTranslationHistory}
                    onCheckedChange={(checked) => updateSetting('translation', 'saveTranslationHistory', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable AI Learning</h4>
                    <p className="text-sm text-muted-foreground">Improve translations based on your feedback</p>
                  </div>
                  <Switch
                    checked={settings.translation.enableLearning}
                    onCheckedChange={(checked) => updateSetting('translation', 'enableLearning', checked)}
                  />
                </div>
              </div>

              {isPremiumOrBusiness && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium">Dictionary & Glossary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Dictionary
                      </Button>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Settings
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Reports</h4>
                    <p className="text-sm text-muted-foreground">Get weekly usage summaries</p>
                  </div>
                  <Switch
                    checked={settings.notifications.weeklyReports}
                    onCheckedChange={(checked) => updateSetting('notifications', 'weeklyReports', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Usage Alerts</h4>
                    <p className="text-sm text-muted-foreground">Notify when approaching limits</p>
                  </div>
                  <Switch
                    checked={settings.notifications.usageAlerts}
                    onCheckedChange={(checked) => updateSetting('notifications', 'usageAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">New Features</h4>
                    <p className="text-sm text-muted-foreground">Learn about new capabilities</p>
                  </div>
                  <Switch
                    checked={settings.notifications.newFeatures}
                    onCheckedChange={(checked) => updateSetting('notifications', 'newFeatures', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>Manage your subscription and payment settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Current Plan</h4>
                  <Badge variant={currentPlan === 'free' ? 'secondary' : 'default'}>
                    {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {currentPlan === 'free' && 'Get more features with a Premium or Business plan'}
                  {currentPlan === 'pro' && 'Premium Plan - Advanced features for professionals'}
                  {currentPlan === 'agency' && 'Business Plan - Full features for teams'}
                </p>
                {currentPlan === 'free' && (
                  <Button onClick={onUpgrade}>
                    Upgrade Plan
                  </Button>
                )}
              </div>

              {currentPlan !== 'free' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-Renewal</h4>
                      <p className="text-sm text-muted-foreground">Automatically renew subscription</p>
                    </div>
                    <Switch
                      checked={settings.billing.autoRenew}
                      onCheckedChange={(checked) => updateSetting('billing', 'autoRenew', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Invoices</h4>
                      <p className="text-sm text-muted-foreground">Receive invoices via email</p>
                    </div>
                    <Switch
                      checked={settings.billing.receiveInvoices}
                      onCheckedChange={(checked) => updateSetting('billing', 'receiveInvoices', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Invoice
                    </Button>
                    <Button variant="outline" className="w-full">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Update Payment Method
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>Manage your team members and collaboration settings</CardDescription>
            </CardHeader>
            <CardContent>
              {!isBusiness ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Team Features Unavailable</h3>
                  <p className="text-muted-foreground mb-4">
                    Upgrade to Business plan to manage team members and collaboration
                  </p>
                  <Button onClick={onUpgrade}>
                    Upgrade to Business
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Team Members (3/5)</h4>
                    <Button size="sm">
                      <Users className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { name: 'John Doe', email: 'john@example.com', role: 'Owner' },
                      { name: 'Jane Smith', email: 'jane@example.com', role: 'Admin' },
                      { name: 'Bob Johnson', email: 'bob@example.com', role: 'Member' }
                    ].map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                        <Badge variant="outline">{member.role}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
