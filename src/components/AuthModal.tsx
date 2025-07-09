import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Shield, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';
import { checkPasswordStrength, checkPasswordLeak } from '@/lib/password-security';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  isLogin?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, isLogin = true }) => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [currentMode, setCurrentMode] = useState(isLogin);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  // Password security state
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [], isStrong: false });
  const [isLeaked, setIsLeaked] = useState<boolean | undefined>(undefined);
  const [isCheckingLeak, setIsCheckingLeak] = useState(false);
  const [leakCheckTimeout, setLeakCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [leakCheckError, setLeakCheckError] = useState<string | null>(null); // New state for error message

  // Helper function to mask phone numbers for security
  const maskPhoneNumber = (phone: string) => {
    if (phone.length <= 2) return phone;
    const lastTwo = phone.slice(-2);
    const masked = '*'.repeat(phone.length - 2);
    return masked + lastTwo;
  };

  // Debounced password leak check
  const checkForLeaks = useCallback(async (password: string) => {
    if (password.length < 6) {
      setIsLeaked(undefined);
      setLeakCheckError(null);
      return;
    }

    setIsCheckingLeak(true);
    setLeakCheckError(null); // Reset error on new check
    try {
      const result = await checkPasswordLeak(password);
      setIsLeaked(result.isLeaked);
    } catch (error: any) {
      setIsLeaked(undefined); // Unset leak status on error
      setLeakCheckError(error.message); // Store the error message
      toast({
        title: "Security Check Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCheckingLeak(false);
    }
  }, []);

  // Handle password change with strength checking and leak detection
  const handlePasswordChange = (password: string) => {
    setFormData(prev => ({ ...prev, password }));
    
    // Check password strength immediately
    const strength = checkPasswordStrength(password);
    setPasswordStrength(strength);
    
    // Debounce leak checking
    if (leakCheckTimeout) {
      clearTimeout(leakCheckTimeout);
    }
    
    // Clear any previous leak check error when the user types
    setLeakCheckError(null);

    if (password.length >= 6) {
      const timeout = setTimeout(() => {
        checkForLeaks(password);
      }, 500);
      setLeakCheckTimeout(timeout);
    } else {
      setIsLeaked(undefined);
      setIsCheckingLeak(false);
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (leakCheckTimeout) {
        clearTimeout(leakCheckTimeout);
      }
    };
  }, [leakCheckTimeout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (currentMode) {
        // Login flow - FIXED: use proper API keys for email or phone
        let loginPayload: any = { password: formData.password };
        if (authMethod === 'email') {
          loginPayload.email = formData.email;
        } else if (authMethod === 'phone') {
          loginPayload.phone = formData.phone;
        }

        const { data, error } = await supabase.auth.signInWithPassword(loginPayload);

        if (error) throw error;
        
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in to Linguista."
        });
        
        onAuthSuccess();
        onClose();
      } else {
        // Sign up flow - validate password security
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords don't match");
        }

        if (!passwordStrength.isStrong) {
          throw new Error("Please create a stronger password following the requirements above");
        }

        // Check if leak check failed and block submission
        if (leakCheckError) {
          throw new Error(leakCheckError);
        }

        if (isLeaked) {
          throw new Error("This password has been compromised in data breaches. Please choose a different password.");
        }

        // If still checking for leaks, wait a moment
        if (isCheckingLeak) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          if (isLeaked) {
            throw new Error("This password has been compromised in data breaches. Please choose a different password.");
          }
        }

        // Use the current page URL as the redirect
        const redirectUrl = window.location.href;

        const { data, error } = await supabase.auth.signUp({
          email: authMethod === 'email' ? formData.email : formData.phone,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName
            },
            emailRedirectTo: redirectUrl
          }
        });

        if (error) throw error;

        console.log('Signup successful, redirect URL:', redirectUrl);
        
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account. You'll be redirected back here after verification."
        });
        
        onClose();
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Enhanced error handling with specific messages
      let title = "Authentication Error";
      let description = error.message;
      
      if (error.message?.includes('Invalid login credentials')) {
        if (currentMode) {
          // Login error
          title = "Login Failed";
          description = "The email/phone and password combination is incorrect. Please check your credentials and try again.";
        } else {
          // This shouldn't happen on signup, but just in case
          title = "Signup Failed";
          description = "There was an issue creating your account. Please try again.";
        }
      } else if (error.message?.includes('User already registered')) {
        title = "Account Already Exists";
        description = "An account with this email already exists. Please sign in instead or use a different email.";
      } else if (error.message?.includes('Email address') && error.message?.includes('invalid')) {
        title = "Invalid Email";
        description = "Please enter a valid email address and try again.";
      } else if (error.message?.includes('Password should be at least')) {
        title = "Password Too Short";
        description = "Your password must be at least 6 characters long.";
      } else if (error.message?.includes('Signup is disabled')) {
        title = "Signup Disabled";
        description = "New account creation is currently disabled. Please contact support.";
      } else if (error.message?.includes('Email not confirmed')) {
        title = "Email Not Verified";
        description = "Please check your email and click the verification link before signing in.";
      } else if (error.message?.includes('Too many requests')) {
        title = "Too Many Attempts";
        description = "Too many failed attempts. Please wait a few minutes before trying again.";
      } else if (error.message?.includes('Phone number')) {
        title = "Invalid Phone Number";
        description = "Please enter a valid phone number with country code (e.g., +1234567890).";
      }
      
      toast({
        title,
        description,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Make modal content always scrollable and visible on any screen height
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[98vh] h-auto overflow-y-auto"
        style={{ maxHeight: '98vh', overflowY: 'auto' }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {currentMode ? 'Welcome Back' : 'Join Linguista'}
          </DialogTitle>
          <DialogDescription>
            {currentMode 
              ? 'Sign in to continue your translation journey' 
              : 'Create your account to start translating with AI agents'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentMode ? 'login' : 'signup'} onValueChange={(value) => setCurrentMode(value === 'login')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sign In Method</CardTitle>
                <CardDescription>Choose how you'd like to sign in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-4">
                  <Button
                    variant={authMethod === 'email' ? 'default' : 'outline'}
                    onClick={() => setAuthMethod('email')}
                    className="flex-1"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    variant={authMethod === 'phone' ? 'default' : 'outline'}
                    onClick={() => setAuthMethod('phone')}
                    className="flex-1"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Phone
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor={authMethod}>
                      {authMethod === 'email' ? 'Email Address' : 'Phone Number'}
                    </Label>
                    <Input
                      id={authMethod}
                      type={authMethod === 'email' ? 'email' : 'tel'}
                      placeholder={authMethod === 'email' ? 'your@email.com' : '+1 (555) 123-4567'}
                      // Show actual value for typing (not masked on input)
                      value={authMethod === 'email' ? formData.email : formData.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [authMethod]: e.target.value
                      }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create Account</CardTitle>
                <CardDescription>Join thousands of users translating with AI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-4">
                  <Button
                    variant={authMethod === 'email' ? 'default' : 'outline'}
                    onClick={() => setAuthMethod('email')}
                    className="flex-1"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    variant={authMethod === 'phone' ? 'default' : 'outline'}
                    onClick={() => setAuthMethod('phone')}
                    className="flex-1"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Phone
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`signup-${authMethod}`}>
                      {authMethod === 'email' ? 'Email Address' : 'Phone Number'}
                    </Label>
                    <Input
                      id={`signup-${authMethod}`}
                      type={authMethod === 'email' ? 'email' : 'tel'}
                      placeholder={authMethod === 'email' ? 'your@email.com' : '+1 (555) 123-4567'}
                      value={authMethod === 'email' ? formData.email : (formData.phone ? maskPhoneNumber(formData.phone) : '')}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [authMethod]: e.target.value
                      }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    {/* Password Strength Meter */}
                    {formData.password && (
                      <div className="mt-3">
                        <PasswordStrengthMeter
                          score={passwordStrength.score}
                          feedback={passwordStrength.feedback}
                          isLeaked={isLeaked}
                          isCheckingLeak={isCheckingLeak}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <div className="flex items-center space-x-2 text-sm text-red-400 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Passwords do not match</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !passwordStrength.isStrong || isLeaked === true || isCheckingLeak || !!leakCheckError}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
