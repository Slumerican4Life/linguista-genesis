import React, { useState } from 'react';
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

interface SettingsPanelProps {
  currentPlan: string;
  onUpgrade: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ currentPlan, onUpgrade }) => {
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black border border-blue-600">
          <TabsTrigger value="profile" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white text-blue-200">
            <User className="w-4 h-4 mr-2" />
            Profile
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
                <div>
                  <label className="text-sm font-medium text-blue-200 mb-2 block">
                    Email Address
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="bg-black border-blue-600 text-white placeholder:text-blue-300"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-500 text-blue-200 hover:bg-blue-900 bg-black"
                      onClick={() => {
                        if (email !== userProfile?.email) {
                          toast.info('Click Save Profile to update your email. You\'ll need to verify the new email address.');
                        }
                      }}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-blue-300 mt-1">You'll need to verify a new email address</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-200 mb-2 block">
                    Phone Number
                  </label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="bg-black border-blue-600 text-white placeholder:text-blue-300"
                  />
                </div>
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

        <TabsContent value="security" className="space-y-6">
          <EmailVerification
            email={userProfile?.email || ''}
            isVerified={emailVerified}
            onVerificationComplete={handleVerificationComplete}
          />
          
          <PhoneVerification
            phoneNumber={phoneNumber}
            isVerified={phoneVerified}
            onVerificationComplete={handleVerificationComplete}
          />
        </TabsContent>

        <TabsContent value="translation" className="space-y-6">
          <WebsiteTranslator />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
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
    </div>
  );
};
