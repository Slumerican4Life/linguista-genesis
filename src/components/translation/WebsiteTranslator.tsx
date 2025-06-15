
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CrawlingStatusTracker } from '../CrawlingStatusTracker';
import { TranslationInstructions } from './TranslationInstructions';
import { TranslationProjectForm } from './TranslationProjectForm';
import { TranslationProjectList } from './TranslationProjectList';

interface CrawlingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description?: string;
  [key: string]: any;
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
        const defaultSteps: CrawlingStep[] = [
          { id: 'init', label: 'Deploying AI crawlers', status: 'pending', description: 'Initializing intelligent web crawlers' },
          { id: 'crawl', label: 'Crawlers crawling the site', status: 'pending', description: 'Deep-scanning all pages and content' },
          { id: 'extract', label: 'Crawlers returned', status: 'pending', description: 'Processing and extracting translatable content' },
          { id: 'translate', label: 'Translating content', status: 'pending', description: 'AI contextual translation in progress' },
          { id: 'rebuild', label: 'Rebuilding site', status: 'pending', description: 'Creating translated website version' },
          { id: 'deploy', label: 'Site ready', status: 'pending', description: 'Finalizing translated website' }
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

        toast.success('🚀 Website translation started! AI crawlers deployed.');
        return crawlData;
      } catch (error) {
        console.error('Failed to create project:', error);
        toast.error('Failed to start website translation');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translation-projects'] });
    },
  });

  // Simulate realistic crawling progress
  const simulateCrawlingProgress = async (
    projectId: string, 
    initialSteps: CrawlingStep[], 
    projectName: string, 
    targetLanguages: string[]
  ) => {
    const stepOrder = ['init', 'crawl', 'extract', 'translate', 'rebuild', 'deploy'];
    
    for (let i = 0; i < stepOrder.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      const updatedSteps = initialSteps.map((step, index) => ({
        ...step,
        status: index < i ? 'completed' as const : 
               index === i ? 'processing' as const : 
               'pending' as const
      }));

      const progressData = {
        projectName,
        targetLanguages,
        steps: updatedSteps,
        currentStep: i
      };

      const { error } = await supabase
        .from('website_crawl_status')
        .update({
          status: i === stepOrder.length - 1 ? 'completed' : 'crawling',
          progress: progressData as any,
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
    toast.success('🎉 Opening your translated website in new tab!');
    if (crawlingStatus) {
      window.open(crawlingStatus.url, '_blank');
    }
  };

  const handleFinishCrawling = () => {
    setCurrentCrawlingProject(null);
    toast.success('✨ Project saved to your dashboard!');
  };

  const handleViewProject = (projectId: string) => {
    setCurrentCrawlingProject(projectId);
  };

  // Show crawling status if there's an active project
  if (currentCrawlingProject && crawlingStatus) {
    const progressData = crawlingStatus.progress as any;
    const steps = (progressData?.steps || []) as CrawlingStep[];
    const isComplete = crawlingStatus.status === 'completed';

    return (
      <div className="space-y-6">
        <CrawlingStatusTracker
          url={crawlingStatus.url}
          steps={steps}
          onViewResult={handleViewResult}
          onFinish={handleFinishCrawling}
          isComplete={isComplete}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TranslationInstructions />

      {/* Main Translation Interface */}
      <Card className="border-purple-500/30 bg-gradient-to-br from-black/80 to-purple-900/20 backdrop-blur-lg shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 rounded-t-lg border-b border-purple-500/30">
          <CardTitle className="flex items-center space-x-2 text-purple-100">
            <Globe className="w-6 h-6 text-purple-400" />
            <span>Website Translation Control Center</span>
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
