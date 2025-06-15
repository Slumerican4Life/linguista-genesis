
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Bot, BarChart3, Settings, CreditCard, Users } from 'lucide-react';

interface NavigationTabsProps {
  isAdmin: boolean;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ isAdmin }) => {
  return (
    <TabsList className="grid w-full grid-cols-5 lg:grid-cols-6 bg-gradient-to-r from-purple-900/60 to-blue-900/60 border-2 border-purple-500/40 backdrop-blur-xl p-2 rounded-2xl shadow-2xl">
      <TabsTrigger 
        value="translate" 
        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-purple-200 font-bold text-sm lg:text-base transition-all duration-300"
      >
        <Bot className="w-4 h-4 mr-2" />
        Translate
      </TabsTrigger>
      
      <TabsTrigger 
        value="website" 
        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-purple-200 font-bold text-sm lg:text-base transition-all duration-300"
      >
        <Globe className="w-4 h-4 mr-2" />
        Website
      </TabsTrigger>
      
      <TabsTrigger 
        value="dashboard" 
        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-purple-200 font-bold text-sm lg:text-base transition-all duration-300"
      >
        <BarChart3 className="w-4 h-4 mr-2" />
        Dashboard
      </TabsTrigger>
      
      <TabsTrigger 
        value="pricing" 
        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-purple-200 font-bold text-sm lg:text-base transition-all duration-300"
      >
        <CreditCard className="w-4 h-4 mr-2" />
        Pricing
      </TabsTrigger>
      
      <TabsTrigger 
        value="settings" 
        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-purple-200 font-bold text-sm lg:text-base transition-all duration-300"
      >
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </TabsTrigger>
      
      {isAdmin && (
        <TabsTrigger 
          value="admin" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white text-red-200 font-bold text-sm lg:text-base transition-all duration-300"
        >
          <Users className="w-4 h-4 mr-2" />
          Admin
        </TabsTrigger>
      )}
    </TabsList>
  );
};
