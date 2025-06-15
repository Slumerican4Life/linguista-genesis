
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Check, Clock, AlertTriangle, Brain, Shield, Globe, Palette, Zap } from 'lucide-react';

interface AgentStatusProps {
  agentProgress: Record<string, 'idle' | 'processing' | 'complete'>;
}

const agents = [
  {
    id: 'zane',
    name: 'Zane',
    role: 'Security Filter',
    description: 'Scanning for abuse and spam',
    color: 'from-red-600 via-red-500 to-pink-600',
    borderColor: 'border-red-500/50',
    bgColor: 'bg-red-900/20',
    textColor: 'text-red-300',
    icon: Shield,
    accentColor: 'shadow-red-500/30'
  },
  {
    id: 'lexi',
    name: 'Lexi',
    role: 'Content Extractor',
    description: 'Extracting text and metadata',
    color: 'from-emerald-600 via-green-500 to-teal-600',
    borderColor: 'border-emerald-500/50',
    bgColor: 'bg-emerald-900/20',
    textColor: 'text-emerald-300',
    icon: Globe,
    accentColor: 'shadow-emerald-500/30'
  },
  {
    id: 'poly',
    name: 'Poly',
    role: 'Core Translator',
    description: 'Performing contextual translation',
    color: 'from-blue-600 via-cyan-500 to-sky-600',
    borderColor: 'border-blue-500/50',
    bgColor: 'bg-blue-900/20',
    textColor: 'text-blue-300',
    icon: Brain,
    accentColor: 'shadow-blue-500/30'
  },
  {
    id: 'vera',
    name: 'Vera',
    role: 'Cultural Adapter',
    description: 'Adding local idioms and culture',
    color: 'from-amber-600 via-yellow-500 to-orange-600',
    borderColor: 'border-amber-500/50',
    bgColor: 'bg-amber-900/20',
    textColor: 'text-amber-300',
    icon: Palette,
    accentColor: 'shadow-amber-500/30'
  },
  {
    id: 'tala',
    name: 'Tala',
    role: 'Tone Specialist',
    description: 'Adjusting style and phrasing',
    color: 'from-purple-600 via-violet-500 to-indigo-600',
    borderColor: 'border-purple-500/50',
    bgColor: 'bg-purple-900/20',
    textColor: 'text-purple-300',
    icon: Zap,
    accentColor: 'shadow-purple-500/30'
  }
];

export const AgentStatus: React.FC<AgentStatusProps> = ({ agentProgress }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-5 h-5 animate-spin" />;
      case 'complete':
        return <Check className="w-5 h-5" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  const isAnyAgentActive = Object.values(agentProgress).some(status => status === 'processing');

  return (
    <Card className="border border-purple-500/30 bg-gradient-to-br from-black/95 via-purple-900/10 to-blue-900/10 backdrop-blur-xl shadow-2xl">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl border border-purple-400/30">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center border-2 border-white/20 animate-bounce">
                <span className="text-sm">🧠</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Neuronix AI Agent Pipeline</h3>
              <p className="text-purple-200 font-medium">Multi-agent neural translation system</p>
              <div className="flex items-center space-x-3 mt-2">
                <Badge className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white font-bold">
                  Neural Core Active
                </Badge>
                <Badge className="bg-gradient-to-r from-green-600/80 to-emerald-600/80 text-white font-bold">
                  5 Agents Ready
                </Badge>
              </div>
            </div>
          </div>
          {isAnyAgentActive && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full animate-pulse"></div>
              <Badge className="relative bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-lg px-6 py-2 animate-pulse">
                🚀 Processing
              </Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {agents.map((agent, index) => {
            const status = agentProgress[agent.id];
            const IconComponent = agent.icon;
            
            // Golden ratio based scaling
            const goldenRatio = 1.618;
            const scale = status === 'processing' ? goldenRatio * 0.618 : 1;
            
            return (
              <div
                key={agent.id}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-500 transform hover:scale-105 ${
                  status === 'processing' 
                    ? `${agent.borderColor} ${agent.bgColor} scale-110 ${agent.accentColor} shadow-2xl` 
                    : status === 'complete'
                    ? `border-green-400/50 bg-green-900/20 shadow-green-500/20 shadow-xl`
                    : `border-gray-600/30 bg-gray-900/20 hover:${agent.borderColor} hover:${agent.bgColor}`
                }`}
                style={{
                  transform: `scale(${scale})`,
                  aspectRatio: `${goldenRatio}:1`
                }}
              >
                {/* Agent Number with Fibonacci positioning */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-white to-gray-200 border-2 border-gray-800 rounded-full flex items-center justify-center shadow-xl">
                  <span className="text-sm font-black text-gray-800">{index + 1}</span>
                </div>

                <div className="flex flex-col items-center text-center space-y-4 h-full">
                  <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${agent.color} shadow-2xl border border-white/20`}>
                    <IconComponent className="w-8 h-8 text-white" />
                    {status === 'processing' && (
                      <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse"></div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="font-bold text-lg text-white mb-1">{agent.name}</h4>
                    <p className={`text-sm font-semibold ${agent.textColor} mb-2`}>{agent.role}</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{agent.description}</p>
                  </div>

                  <Badge 
                    className={`font-bold ${
                      status === 'processing' 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black animate-pulse' 
                        : status === 'complete'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-200'
                    }`}
                  >
                    {getStatusIcon(status)}
                    <span className="ml-2 capitalize">{status}</span>
                  </Badge>
                </div>

                {/* Neural network animation for active agents */}
                {status === 'processing' && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Neural network connection visualization */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-indigo-900/30 rounded-2xl border border-purple-500/30">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
            <div className="flex-1 h-1 bg-gradient-to-r from-purple-500/30 via-blue-500/50 to-indigo-500/30 rounded-full"></div>
            <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-xs">🧠</span>
            </div>
            <div className="flex-1 h-1 bg-gradient-to-r from-orange-500/30 via-yellow-500/50 to-red-500/30 rounded-full"></div>
            <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-center text-purple-200 text-sm font-medium mt-3">
            Neural pathways synchronized • Processing with Neuronix intelligence
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
