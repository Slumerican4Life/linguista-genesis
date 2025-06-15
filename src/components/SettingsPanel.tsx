import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Upload, Save, Shield, CreditCard, Mail, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PhoneVerification } from './verification/PhoneVerification';
import { EmailVerification } from './verification/EmailVerification';
import { WebsiteTranslator } from './translation/WebsiteTranslator';
import { UserPreferencesModal } from "@/components/preferences/UserPreferencesModal";
import { SecuritySettingsModal } from "@/components/security/SecuritySettingsModal";
import { BillingHistory } from "@/components/payment/BillingHistory";
import { AnalyticsModal } from "@/components/analytics/AnalyticsModal";
import { ExportDataModal } from "@/components/analytics/ExportDataModal";
import { PerformanceModal } from "@/components/analytics/PerformanceModal";
import { HistoryModal } from "@/components/analytics/HistoryModal";

interface SettingsPanelProps {
  currentPlan: string;
  onUpgrade: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ currentPlan, onUpgrade }) => {
  // State for individual edit modes
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const queryClient = useQueryClient();

  // Fetch current user profile
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Set form values
      setFullName(data.full_name || '');
      setPhoneNumber(data.phone_number || '');
      setAvatarUrl(data.avatar_url || '');

      return data;
    },
  });

  // On successful load, set form values from profile if not already set (on every load)
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setPhoneNumber(userProfile.phone_number || '');
      setAvatarUrl(userProfile.avatar_url || '');
      setEmail(userProfile.email || ''); // Ensure email is picked up
    }
  }, [userProfile]);

  // Update profile mutation with email support
  const updateProfile = useMutation({
    mutationFn: async (updates: { full_name?: string; phone_number?: string; avatar_url?: string; email?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // If email is being updated, update auth email first
      if (updates.email && updates.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: updates.email
        });
        if (emailError) throw emailError;
      }

      // Update profile table
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone_number: updates.phone_number,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    },
  });

  // New individual save handlers for email and phone
  const handleSaveEmail = () => {
    updateProfile.mutate({ email });
    setIsEditingEmail(false);
  };
  const handleSavePhone = () => {
    updateProfile.mutate({ phone_number: phoneNumber });
    setIsEditingPhone(false);
  };

  const handleSaveProfile = () => {
    updateProfile.mutate({
      full_name: fullName,
      phone_number: phoneNumber,
      email: email
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    console.log('Starting image upload...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to upload an avatar');
        return;
      }

      console.log('User authenticated, proceeding with upload for user:', user.id);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      console.log('Uploading file to path:', fileName);

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').slice(-2).join('/'); // Get user_id/filename part
        console.log('Attempting to delete old avatar:', oldPath);
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload new avatar
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const newAvatarUrl = urlData.publicUrl;
      console.log('Generated public URL:', newAvatarUrl);
      setAvatarUrl(newAvatarUrl);

      // Update profile with new avatar URL
      updateProfile.mutate({ avatar_url: newAvatarUrl });

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleVerificationComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
  };

  // Masking Helpers
  const maskEmail = (email: string) => {
    if (!email || email.length <= 2) return email;
    const [local, domain] = email.split("@");
    if (!domain) return email;
    let maskedLocal = local.length > 2
      ? "*".repeat(local.length - 2) + local.slice(-2)
      : local;
    return maskedLocal + "@" + domain;
  };
  const maskPhone = (phone: string) => {
    if (!phone || phone.length <= 2) return phone;
    return "*".repeat(phone.length - 2) + phone.slice(-2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading your settings...</p>
        </div>
      </div>
    );
  }

  // Safe access to verification fields that may not exist yet
  const emailVerified = !!(userProfile as any)?.email_verified_at;
  const phoneVerified = !!(userProfile as any)?.phone_verified_at;

  // Modal states for new dashboard features
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPerfOpen, setIsPerfOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-black border border-blue-600">
          <TabsTrigger value="profile" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white text-blue-200">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white text-blue-200">
            <span className="mr-2">⚙️</span>
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white text-blue-200">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="translation" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white text-blue-200">
            <Globe className="w-4 h-4 mr-2" />
            Translation
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white text-blue-200">
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* MAIN TABS */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-black border-blue-600">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription className="text-blue-200">
                Update your profile information and avatar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarUrl} alt="Profile picture" />
                  <AvatarFallback className="bg-purple-700 text-white text-xl">
                    {fullName ? fullName.charAt(0).toUpperCase() : userProfile?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Button 
                    variant="outline" 
                    disabled={isUploading} 
                    className="border-blue-500 text-blue-200 hover:bg-blue-900 bg-black"
                    onClick={triggerFileInput}
                  >
                    {isUploading ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Change Avatar
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-blue-300 mt-2">
                    Upload a new profile picture. Max 5MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-blue-200 mb-2 block">
                    Full Name
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-black border-blue-600 text-white placeholder:text-blue-300"
                  />
                </div>
                {/* EMAIL, now masked and edit toggle */}
                <div>
                  <label className="text-sm font-medium text-blue-200 mb-2 block">
                    Email Address
                  </label>
                  {!isEditingEmail ? (
                    <div className="flex space-x-2 items-center">
                      <Input
                        type="text"
                        value={maskEmail(email)}
                        readOnly
                        className="bg-black border-blue-600 text-white placeholder:text-blue-300 cursor-default select-none"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-500 text-blue-200 hover:bg-blue-900 bg-black"
                        onClick={() => setIsEditingEmail(true)}
                        >
                        Change Email
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2 items-center">
                      <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-black border-blue-600 text-white placeholder:text-blue-300"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-purple-700 text-white"
                        onClick={handleSaveEmail}
                        disabled={updateProfile.isPending}
                      >
                        {updateProfile.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setIsEditingEmail(false); setEmail(userProfile?.email || ""); }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-blue-300 mt-1">
                    Only last two characters/letters are visible for security.
                    {emailVerified && (
                      <span className="ml-2 text-green-300 font-semibold">Verified</span>
                    )}
                  </p>
                </div>
                {/* PHONE, now masked and edit toggle */}
                <div>
                  <label className="text-sm font-medium text-blue-200 mb-2 block">
                    Phone Number
                  </label>
                  {!isEditingPhone ? (
                    <div className="flex space-x-2 items-center">
                      <Input
                        type="text"
                        value={maskPhone(phoneNumber)}
                        readOnly
                        className="bg-black border-blue-600 text-white placeholder:text-blue-300 cursor-default select-none"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-500 text-blue-200 hover:bg-blue-900 bg-black"
                        onClick={() => setIsEditingPhone(true)}
                      >
                        Change Number
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2 items-center">
                      <Input
                        type="tel"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        className="bg-black border-blue-600 text-white placeholder:text-blue-300"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-purple-700 text-white"
                        onClick={handleSavePhone}
                        disabled={updateProfile.isPending}
                      >
                        {updateProfile.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setIsEditingPhone(false); setPhoneNumber(userProfile?.phone_number || ""); }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-blue-300 mt-1">
                    Only last two digits are visible for security.
                    {phoneVerified && (
                      <span className="ml-2 text-green-300 font-semibold">Verified</span>
                    )}
                  </p>
                </div>
                {/* SAVE FULL PROFILE BUTTON (Full Name and avatar only) */}
                <div className="flex items-end">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateProfile.isPending}
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Save className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="preferences" className="space-y-6">
          <div className="flex items-center justify-between p-6 border border-blue-500/40 rounded-lg bg-black/60">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">User Preferences</h2>
              <div className="text-blue-200 mb-2">Manage themes, language, UI, and other personalization options.</div>
            </div>
            <Button onClick={() => setIsPreferencesOpen(true)} className="bg-purple-700 text-white">
              Configure Preferences
            </Button>
          </div>
          <UserPreferencesModal open={isPreferencesOpen} onClose={() => setIsPreferencesOpen(false)} />
        </TabsContent>
        <TabsContent value="security" className="space-y-6">
          <div className="flex items-center justify-between p-6 border border-blue-500/40 rounded-lg bg-black/60">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Security Settings</h2>
              <div className="text-blue-200 mb-2">Password, 2FA, login activity, and account management.</div>
            </div>
            <Button onClick={() => setIsSecurityOpen(true)} className="bg-purple-700 text-white">
              Open Security Panel
            </Button>
          </div>
          <SecuritySettingsModal open={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />
        </TabsContent>
        <TabsContent value="translation" className="space-y-6">
          <WebsiteTranslator />
        </TabsContent>
        <TabsContent value="billing" className="space-y-6">
          <div className="flex items-center justify-between p-6 border border-blue-500/40 rounded-lg bg-black/60">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Billing & Subscription</h2>
              <div className="text-blue-200 mb-2">Your current plan, subscription, and payment history.</div>
            </div>
            <Button onClick={() => setIsBillingOpen(v => !v)} className="bg-purple-700 text-white">
              View Billing History
            </Button>
          </div>
          {isBillingOpen && (
            <div className="mt-4">
              <BillingHistory userId={userProfile?.id} />
            </div>
          )}
          <Card className="bg-black border-blue-600">
            <CardHeader>
              <CardTitle className="text-white">Subscription & Billing</CardTitle>
              <CardDescription className="text-blue-200">
                Manage your subscription and view billing history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-blue-600 rounded-lg">
                <div>
                  <h3 className="font-semibold text-white">Current Plan</h3>
                  <p className="text-blue-200">
                    You are currently on the <Badge className="ml-1 bg-purple-700 text-white">{currentPlan}</Badge> plan
                  </p>
                </div>
                <Button onClick={onUpgrade} className="bg-purple-700 hover:bg-purple-800 text-white">
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Preferences Drawer */}
      <UserPreferencesModal open={isPreferencesOpen} onClose={() => setIsPreferencesOpen(false)} />
      {/* Security Dialog */}
      <SecuritySettingsModal open={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />
      {/* Example DASHBOARD BUTTON GRID for quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <button
          className="flex flex-col items-center justify-center bg-blue-900/60 p-6 rounded-xl hover:bg-blue-900 border border-blue-700 space-y-2"
          onClick={() => setIsAnalyticsOpen(true)}
          type="button"
        >
          <span className="text-lg font-bold text-white">Analytics</span>
          <span className="text-sm text-blue-200">View usage insights</span>
        </button>
        <button
          className="flex flex-col items-center justify-center bg-green-900/60 p-6 rounded-xl hover:bg-green-900 border border-green-700 space-y-2"
          onClick={() => setIsExportOpen(true)}
          type="button"
        >
          <span className="text-lg font-bold text-white">Export Data</span>
          <span className="text-sm text-green-200">Download activity CSV</span>
        </button>
        <button
          className="flex flex-col items-center justify-center bg-purple-900/60 p-6 rounded-xl hover:bg-purple-900 border border-purple-700 space-y-2"
          onClick={() => setIsPerfOpen(true)}
          type="button"
        >
          <span className="text-lg font-bold text-white">Performance</span>
          <span className="text-sm text-purple-200">System/AI health</span>
        </button>
        <button
          className="flex flex-col items-center justify-center bg-yellow-900/60 p-6 rounded-xl hover:bg-yellow-900 border border-yellow-700 space-y-2"
          onClick={() => setIsHistoryOpen(true)}
          type="button"
        >
          <span className="text-lg font-bold text-white">History</span>
          <span className="text-sm text-yellow-200">Recent activity</span>
        </button>
      </div>
      {/* Feature modals */}
      <AnalyticsModal open={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />
      <ExportDataModal open={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <PerformanceModal open={isPerfOpen} onClose={() => setIsPerfOpen(false)} />
      <HistoryModal open={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </div>
  );
};
