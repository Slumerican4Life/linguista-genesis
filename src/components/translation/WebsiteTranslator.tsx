import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Globe, Eye, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TranslationInstructions } from './TranslationInstructions';
import { TranslationProjectForm } from './TranslationProjectForm';
import { TranslationProjectList } from './TranslationProjectList';
import { CrawlingAgents } from '../CrawlingAgents';
import { ProgressMeter } from '../ProgressMeter';
import { NeuronixBrain } from '../NeuronixBrain';

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
}

export const WebsiteTranslator: React.FC = () => {
  const [currentCrawlingProject, setCurrentCrawlingProject] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch crawling status for active project
  const { data: crawlingStatus } = useQuery({
    queryKey: ['crawling-status', currentCrawlingProject],
    queryFn: async () => {
      if (!currentCrawlingProject) return null;
      
      const { data, error } = await supabase
        .from('website_crawl_status')
        .select('*')
        .eq('id', currentCrawlingProject)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentCrawlingProject,
    refetchInterval: 2000,
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ['translation-projects'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('website_crawl_status')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.warn('Website crawl status table not yet available');
        return [];
      }
    },
  });

  // Create new translation project
  const createProject = useMutation({
    mutationFn: async ({ name, url, languages }: { name: string; url: string; languages: string[] }) => {
      try {
        const defaultSteps: ProgressStep[] = [
          { id: 'init', label: 'Deploying AI Crawlers', status: 'pending', description: 'Neuronix agents launching into cyberspace' },
          { id: 'crawl', label: 'Crawlers Crawling Site', status: 'pending', description: 'AI agents scanning every page and element' },
          { id: 'extract', label: 'Crawlers Returning', status: 'pending', description: 'Agents returning with extracted content' },
          { id: 'translate', label: 'Translation in Effect', status: 'pending', description: 'Neural networks processing language conversion' },
          { id: 'rebuild', label: 'Rebuilding Site', status: 'pending', description: 'Reconstructing site with new language' },
          { id: 'deploy', label: 'Site Ready', status: 'pending', description: 'Your translated website is ready!' }
        ];

        const progressData = { 
          projectName: name,
          targetLanguages: languages,
          steps: defaultSteps
        };

        const { data: crawlData, error: crawlError } = await supabase
          .from('website_crawl_status')
          .insert({
            url,
            status: 'pending',
            progress: progressData as any
          })
          .select()
          .single();

        if (crawlError) throw crawlError;

        setCurrentCrawlingProject(crawlData.id);

        // Start simulated crawling process
        setTimeout(() => simulateCrawlingProgress(crawlData.id, defaultSteps, name, languages), 1000);

        toast.success('🚀 Neural crawlers deployed! Watch the AI agents work.');
        return crawlData;
      } catch (error) {
        console.error('Failed to create project:', error);
        toast.error('Failed to deploy neural crawlers');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translation-projects'] });
    },
  });

  // Enhanced crawling simulation with realistic timing
  const simulateCrawlingProgress = async (
    projectId: string, 
    initialSteps: ProgressStep[], 
    projectName: string, 
    targetLanguages: string[]
  ) => {
    const stepOrder = ['init', 'crawl', 'extract', 'translate', 'rebuild', 'deploy'];
    
    for (let i = 0; i < stepOrder.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
      
      const updatedSteps = initialSteps.map((step, index) => ({
        ...step,
        status: index < i ? 'completed' as const : 
               index === i ? 'processing' as const : 
               'pending' as const
      }));

      // Mark current step as processing first
      if (i < stepOrder.length) {
        updatedSteps[i].status = 'processing';
        
        const progressData = {
          projectName,
          targetLanguages,
          steps: updatedSteps,
          currentStep: i
        };

        await supabase
          .from('website_crawl_status')
          .update({
            status: 'crawling',
            progress: progressData as any
          })
          .eq('id', projectId);

        // Wait a bit then mark as completed
        await new Promise(resolve => setTimeout(resolve, 2000));
        updatedSteps[i].status = 'completed';
      }

      const finalProgressData = {
        projectName,
        targetLanguages,
        steps: updatedSteps,
        currentStep: i
      };

      const { error } = await supabase
        .from('website_crawl_status')
        .update({
          status: i === stepOrder.length - 1 ? 'completed' : 'crawling',
          progress: finalProgressData as any,
          ...(i === stepOrder.length - 1 && { completed_at: new Date().toISOString() })
        })
        .eq('id', projectId);

      if (error) console.error('Error updating crawl status:', error);
    }
  };

  const handleCreateProject = (name: string, url: string, languages: string[]) => {
    createProject.mutate({ name, url, languages });
  };

  const handleViewResult = () => {
    toast.success('🎉 Opening your translated website!');
    if (crawlingStatus) {
      window.open(crawlingStatus.url, '_blank');
    }
  };

  const handleFinishCrawling = () => {
    setCurrentCrawlingProject(null);
    toast.success('✨ Translation project completed!');
  };

  const handleViewProject = (projectId: string) => {
    setCurrentCrawlingProject(projectId);
  };

  // Show enhanced crawling status if there's an active project
  if (currentCrawlingProject && crawlingStatus) {
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
                  onClick={handleViewResult}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-8 py-4 text-lg"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  View Translated Site
                </Button>
                <Button
                  onClick={handleFinishCrawling}
                  variant="outline"
                  className="border-green-500 text-green-400 hover:bg-green-900/20 font-bold px-8 py-4 text-lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Finish
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TranslationInstructions />

      {/* Main Translation Interface with Neuronix Brain */}
      <Card className="border-purple-500/30 bg-gradient-to-br from-black/80 to-purple-900/20 backdrop-blur-lg shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 rounded-t-lg border-b border-purple-500/30">
          <CardTitle className="flex items-center space-x-4 text-purple-100">
            <NeuronixBrain size="md" />
            <div>
              <span className="text-2xl font-black">Neuronix Website Translation</span>
              <p className="text-purple-200 text-sm font-normal mt-1">Powered by AI Neural Networks</p>
            </div>
          </CardTitle>
          <CardDescription className="text-purple-200">
            Transform any website into multiple languages while preserving design and functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/60 border border-purple-500/30">
              <TabsTrigger value="create" className="data-[state=active]:bg-purple-700 text-purple-200">
                New Project
              </TabsTrigger>
              <TabsTrigger value="manage" className="data-[state=active]:bg-purple-700 text-purple-200">
                Manage Projects
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              <TranslationProjectForm
                onCreateProject={handleCreateProject}
                isCreating={createProject.isPending}
              />
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              <TranslationProjectList
                projects={projects || []}
                isLoading={isLoading}
                onViewProject={handleViewProject}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
