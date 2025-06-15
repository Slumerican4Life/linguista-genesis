
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Globe, Users, Zap, Brain, Star } from 'lucide-react';

const weeklyData = [
  { day: 'Mon', translations: 1200, words: 45000, users: 89 },
  { day: 'Tue', translations: 1500, words: 52000, users: 112 },
  { day: 'Wed', translations: 1800, words: 67000, users: 134 },
  { day: 'Thu', translations: 2100, words: 78000, users: 156 },
  { day: 'Fri', translations: 2400, words: 89000, users: 178 },
  { day: 'Sat', translations: 1900, words: 71000, users: 145 },
  { day: 'Sun', translations: 1600, words: 58000, users: 123 }
];

const languageData = [
  { name: 'Spanish', value: 28, color: '#8b5cf6' },
  { name: 'French', value: 22, color: '#3b82f6' },
  { name: 'German', value: 18, color: '#10b981' },
  { name: 'Chinese', value: 15, color: '#f59e0b' },
  { name: 'Japanese', value: 10, color: '#ef4444' },
  { name: 'Others', value: 7, color: '#6b7280' }
];

const neuralPerformance = [
  { metric: 'Accuracy', score: 98.7, trend: '+2.3%' },
  { metric: 'Speed', score: 94.2, trend: '+5.1%' },
  { metric: 'Context', score: 96.8, trend: '+1.8%' },
  { metric: 'Cultural', score: 92.4, trend: '+3.2%' }
];

export const AdvancedAnalytics = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Neural Performance Metrics */}
      <Card className="border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-100">
            <Brain className="w-5 h-5 text-purple-400" />
            <span>Neural Performance</span>
          </CardTitle>
          <CardDescription className="text-purple-200">
            Neuronix AI translation quality metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {neuralPerformance.map((metric) => (
            <div key={metric.metric} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-purple-500/20">
              <div>
                <p className="font-semibold text-white">{metric.metric}</p>
                <p className="text-sm text-purple-300">AI Accuracy</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-400">{metric.score}%</p>
                <Badge className="bg-green-600 text-white text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {metric.trend}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Translation Volume Chart */}
      <Card className="border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-100">
            <BarChart className="w-5 h-5 text-blue-400" />
            <span>Weekly Volume</span>
          </CardTitle>
          <CardDescription className="text-blue-200">
            Translation requests and word processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorTranslations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #8b5cf6',
                  borderRadius: '12px',
                  color: '#fff'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="translations" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTranslations)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Language Distribution */}
      <Card className="border border-green-500/30 bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-100">
            <Globe className="w-5 h-5 text-green-400" />
            <span>Language Mix</span>
          </CardTitle>
          <CardDescription className="text-green-200">
            Most requested translation languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={languageData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                strokeWidth={2}
                stroke="#000"
              >
                {languageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #10b981',
                  borderRadius: '12px',
                  color: '#fff'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Real-time Stats */}
      <Card className="col-span-full border border-yellow-500/30 bg-gradient-to-br from-yellow-900/20 via-orange-900/20 to-red-900/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-100">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span>Live System Performance</span>
          </CardTitle>
          <CardDescription className="text-yellow-200">
            Real-time Neuronix neural network activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded-2xl border border-purple-500/30">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-purple-400">2,847</p>
              <p className="text-sm text-purple-300 font-medium">Active Users</p>
              <Badge className="mt-2 bg-purple-600/30 text-purple-200">+12% today</Badge>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-2xl border border-blue-500/30">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-blue-400">1.2M</p>
              <p className="text-sm text-blue-300 font-medium">Words Today</p>
              <Badge className="mt-2 bg-blue-600/30 text-blue-200">+8% vs yesterday</Badge>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-900/40 to-green-800/40 rounded-2xl border border-green-500/30">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-green-400">98.7%</p>
              <p className="text-sm text-green-300 font-medium">Satisfaction</p>
              <Badge className="mt-2 bg-green-600/30 text-green-200">+0.3% this week</Badge>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-yellow-900/40 to-orange-800/40 rounded-2xl border border-yellow-500/30">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-yellow-400">0.3s</p>
              <p className="text-sm text-yellow-300 font-medium">Avg Response</p>
              <Badge className="mt-2 bg-yellow-600/30 text-yellow-200">-15% faster</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
