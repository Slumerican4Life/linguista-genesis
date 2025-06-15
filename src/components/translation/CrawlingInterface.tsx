
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Eye, CheckCircle, Zap } from 'lucide-react';
import { CrawlingAgents } from '../CrawlingAgents';
import { ProgressMeter } from '../ProgressMeter';
import { NeuronixBrain } from '../NeuronixBrain';

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
}

interface CrawlingInterfaceProps {
  crawlingStatus: any;
  onViewResult: () => void;
  onFinishCrawling: () => void;
  onShowPreview: () => void;
}

export const CrawlingInterface: React.FC<CrawlingInterfaceProps> = ({
  crawlingStatus,
  onViewResult,
  onFinishCrawling,
  onShowPreview
}) => {
  if (!crawlingStatus) return null;

  const progressData = crawlingStatus.progress as any;
  const steps = (progressData?.steps || []) as ProgressStep[];
  const isComplete = crawlingStatus.status === 'completed';
  const currentStep = progressData?.currentStep || 0;

  return (
    <div className="space-y-8 relative">
      {/* Crawling Agents Animation */}
      <CrawlingAgents isActive={!isComplete} currentStep={steps[currentStep]?.id || ''} />
      
      {/* Enhanced Header with Neuronix Brain */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-6">
          <NeuronixBrain size="lg" isActive={!isComplete} />
          <div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-purple-300 via-red-300 to-blue-300 bg-clip-text text-transparent">
              Neuronix Translation Engine
            </h2>
            <p className="text-xl text-purple-200 mt-2">AI Agents at Work</p>
          </div>
        </div>
      </div>

      {/* Enhanced Progress Display */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-2 border-purple-500/40 bg-gradient-to-br from-black/80 to-purple-900/20 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-purple-100">
              <Globe className="w-6 h-6 text-purple-400" />
              <span>Website Translation</span>
            </CardTitle>
            <CardDescription className="text-purple-200">
              {crawlingStatus.url}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressMeter steps={steps} currentStep={currentStep} />
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500/40 bg-gradient-to-br from-black/80 to-blue-900/20 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-blue-100">Live Translation Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-64 bg-black/60 rounded-lg p-4 border border-blue-500/30 overflow-y-auto">
              {steps.map((step, index) => (
                <div key={step.id} className={`text-sm mb-2 ${
                  step.status === 'completed' ? 'text-green-400' :
                  step.status === 'processing' ? 'text-yellow-400' : 'text-gray-500'
                }`}>
                  [{new Date().toLocaleTimeString()}] {step.description}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Completion Section */}
      {isComplete && (
        <Card className="border-2 border-green-500/40 bg-gradient-to-br from-green-900/20 to-black/80 backdrop-blur-lg">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto animate-pulse" />
              <h3 className="text-3xl font-black text-green-300">Translation Complete!</h3>
              <p className="text-green-200 text-lg">Your website has been successfully translated and is ready to view.</p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button
                onClick={onViewResult}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-8 py-4 text-lg"
              >
                <Eye className="w-5 h-5 mr-2" />
                View Translated Site
              </Button>
              <Button
                onClick={onFinishCrawling}
                variant="outline"
                className="border-green-500 text-green-400 hover:bg-green-900/20 font-bold px-8 py-4 text-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Finish
              </Button>
              <Button
                onClick={onShowPreview}
                className="bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white font-bold px-8 py-4 text-lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                Live Preview Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
