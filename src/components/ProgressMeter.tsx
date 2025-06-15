
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Zap } from 'lucide-react';

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed';
  description: string;
}

interface ProgressMeterProps {
  steps: ProgressStep[];
  currentStep: number;
}

export const ProgressMeter: React.FC<ProgressMeterProps> = ({ steps, currentStep }) => {
  const progress = ((currentStep + 1) / steps.length) * 100;
  
  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-purple-900/60 to-blue-900/60 rounded-2xl border-2 border-purple-500/40 backdrop-blur-xl">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-black bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
          Neural Translation Progress
        </h3>
        <Progress value={progress} className="h-4 bg-purple-900/40" />
        <p className="text-purple-200 font-semibold">{Math.round(progress)}% Complete</p>
      </div>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {step.status === 'completed' ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : step.status === 'processing' ? (
                <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
              ) : (
                <Clock className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <span className={`font-bold ${
                  step.status === 'completed' ? 'text-green-300' :
                  step.status === 'processing' ? 'text-yellow-300' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
                {step.status === 'processing' && (
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold animate-pulse">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-purple-300 mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
