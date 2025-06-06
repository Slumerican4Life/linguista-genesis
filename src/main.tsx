
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Capacitor mobile support
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

// Initialize mobile features with error handling
const initializeMobileFeatures = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      console.log('Initializing mobile features...');
      
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#000000' });
      
      // Hide splash screen after a brief delay
      setTimeout(async () => {
        await SplashScreen.hide();
        console.log('Mobile features initialized successfully');
      }, 1000);
      
    } catch (error) {
      console.error('Error initializing mobile features:', error);
    }
  } else {
    console.log('Running in web browser');
  }
};

// Initialize mobile features
initializeMobileFeatures();

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
