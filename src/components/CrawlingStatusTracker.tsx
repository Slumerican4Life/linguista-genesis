
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Search, ArrowLeft, CheckCircle, Eye } from 'lucide-react';

interface CrawlingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description?: string;
}

interface CrawlingStatusTrackerProps {
  url: string;
  steps: CrawlingStep[];
  onViewResult?: () => void;
  onFinish?: () => void;
  isComplete?: boolean;
}

export const CrawlingStatusTracker: React.FC<CrawlingStatusTrackerProps> = ({
  url,
  steps,
  onViewResult,
  onFinish,
  isComplete = false
}) => {
  const getStepIcon = (status: CrawlingStep['status']) => {
    switch (status) {
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <div className="w-4 h-4 bg-red-400 rounded-full" />;
      default:
        return <div className="w-4 h-4 bg-gray-600 rounded-full" />;
    }
  };

  const getStepColor = (status: CrawlingStep['status']) => {
    switch (status) {
      case 'processing':
        return 'text-blue-300';
      case 'completed':
        return 'text-green-300';
      case 'error':
        return 'text-red-300';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Card className="border border-blue-500/30 bg-black/80 backdrop-blur-sm">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <Globe className="w-6 h-6 text-blue-400" />
          <div className="flex-1">
            <h3 className="font-semibold text-white">Website Translation Progress</h3>
            <p className="text-sm text-blue-200 truncate">{url}</p>
          </div>
          {isComplete && (
            <Badge className="bg-green-600 text-white">
              Complete
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getStepIcon(step.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`font-medium ${getStepColor(step.status)}`}>
                    {step.label}
                  </span>
                  {step.status === 'processing' && (
                    <Badge variant="outline" className="text-xs border-blue-500 text-blue-300">
                      In Progress
                    </Badge>
                  )}
                </div>
                {step.description && (
                  <p className="text-xs text-gray-400 mt-1">{step.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {isComplete && (
          <div className="flex space-x-3 pt-4 border-t border-gray-700">
            <Button
              onClick={onViewResult}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Translated Site
            </Button>
            <Button
              onClick={onFinish}
              variant="outline"
              className="border-green-500 text-green-400 hover:bg-green-900/20"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Finish
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
