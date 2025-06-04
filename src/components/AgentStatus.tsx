
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Check, Clock, AlertTriangle } from 'lucide-react';

interface AgentStatusProps {
  agentProgress: Record<string, 'idle' | 'processing' | 'complete'>;
}

const agents = [
  {
    id: 'zane',
    name: 'Zane',
    role: 'Security Filter',
    description: 'Scanning for abuse and spam',
    color: 'agent-zane',
    icon: AlertTriangle
  },
  {
    id: 'lexi',
    name: 'Lexi',
    role: 'Content Extractor',
    description: 'Extracting text and metadata',
    color: 'agent-lexi',
    icon: Bot
  },
  {
    id: 'poly',
    name: 'Poly',
    role: 'Core Translator',
    description: 'Performing contextual translation',
    color: 'agent-poly',
    icon: Bot
  },
  {
    id: 'vera',
    name: 'Vera',
    role: 'Cultural Adapter',
    description: 'Adding local idioms and culture',
    color: 'agent-vera',
    icon: Bot
  },
  {
    id: 'tala',
    name: 'Tala',
    role: 'Tone Specialist',
    description: 'Adjusting style and phrasing',
    color: 'agent-tala',
    icon: Bot
  }
];

export const AgentStatus: React.FC<AgentStatusProps> = ({ agentProgress }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-4 h-4 animate-spin" />;
      case 'complete':
        return <Check className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const isAnyAgentActive = Object.values(agentProgress).some(status => status === 'processing');

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-ai-blue-500 to-ai-purple-500 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Agent Pipeline</h3>
              <p className="text-sm text-gray-600">Multi-agent translation system</p>
            </div>
          </div>
          {isAnyAgentActive && (
            <Badge className="bg-gradient-to-r from-ai-blue-100 to-ai-purple-100 text-ai-blue-700 animate-pulse">
              Agents Active
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {agents.map((agent, index) => {
            const status = agentProgress[agent.id];
            const IconComponent = agent.icon;
            
            return (
              <div
                key={agent.id}
                className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                  status === 'processing' 
                    ? 'border-yellow-300 bg-yellow-50 transform scale-105' 
                    : status === 'complete'
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Agent Number */}
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                  {index + 1}
                </div>

                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    status === 'processing' 
                      ? 'bg-yellow-200' 
                      : status === 'complete'
                      ? 'bg-green-200'
                      : 'bg-gray-200'
                  }`}>
                    <IconComponent className={`w-6 h-6 ${
                      status === 'processing' 
                        ? 'text-yellow-700' 
                        : status === 'complete'
                        ? 'text-green-700'
                        : 'text-gray-500'
                    }`} />
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">{agent.name}</h4>
                    <p className="text-xs text-gray-600 font-medium">{agent.role}</p>
                    <p className="text-xs text-gray-500 mt-1">{agent.description}</p>
                  </div>

                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(status)}`}
                  >
                    {getStatusIcon(status)}
                    <span className="ml-1 capitalize">{status}</span>
                  </Badge>
                </div>

                {/* Progress indicator */}
                {status === 'processing' && (
                  <div className="absolute inset-0 rounded-lg opacity-20">
                    <div className="h-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
