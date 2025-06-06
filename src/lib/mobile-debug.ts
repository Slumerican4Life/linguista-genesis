
import { Capacitor } from '@capacitor/core';

export const logMobileInfo = () => {
  if (Capacitor.isNativePlatform()) {
    console.log('=== MOBILE DEBUG INFO ===');
    console.log('Platform:', Capacitor.getPlatform());
    console.log('Is native app:', Capacitor.isNativePlatform());
    console.log('App info:', {
      appId: 'app.lovable.37d442fb04ac4adf9e464dcbef9cf99d',
      appName: 'linguista-genesis'
    });
    console.log('Current URL:', window.location.href);
    console.log('User Agent:', navigator.userAgent);
    console.log('=== END DEBUG INFO ===');
  }
};

export const testNetworkConnectivity = async () => {
  try {
    console.log('Testing network connectivity...');
    const response = await fetch('https://37d442fb-04ac-4adf-9e46-4dcbef9cf99d.lovableproject.com/');
    console.log('Network test successful:', response.status);
    return true;
  } catch (error) {
    console.error('Network test failed:', error);
    return false;
  }
};
