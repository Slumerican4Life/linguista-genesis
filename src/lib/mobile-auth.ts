
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

export const configureMobileAuth = () => {
  if (Capacitor.isNativePlatform()) {
    console.log('Configuring mobile authentication...');
    
    // Configure auth for mobile context
    const platform = Capacitor.getPlatform();
    console.log('Platform detected:', platform);
    
    // Handle auth state changes specifically for mobile
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Mobile auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in on mobile');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out on mobile');
      }
    });
  }
};

export const getMobileRedirectUrl = () => {
  if (Capacitor.isNativePlatform()) {
    // For mobile apps, use the app scheme
    return 'app.lovable.37d442fb04ac4adf9e464dcbef9cf99d://';
  }
  
  // For web, use the current origin
  return window.location.origin;
};
