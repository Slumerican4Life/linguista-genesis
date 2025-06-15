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
import { MaskedPreviewOverlay } from "./MaskedPreviewOverlay";

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
}

export const WebsiteTranslator: React.FC = () => {
  const [currentCrawlingProject, setCurrentCrawlingProject] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewProject, setPreviewProject] = useState<any | null>(null);
  const queryClient = useQueryClient();

  // Check if user is authenticated
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch user AND their profile/subscription
  const { data: userProfile } = useQuery({
    queryKey: ['current-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*, subscriptions(*)')
        .eq('id', user.id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!user,
  });

  // Fetch crawling status for active project
  const { data: crawlingStatus } = useQuery({
    queryKey: ['crawling-status', currentCrawlingProject],
    queryFn: async () => {
      if (!currentCrawlingProject || !user) return null;
      
      const { data, error } = await supabase
        .from('website_crawl_status')
        .select('*')
        .eq('id', currentCrawlingProject)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching crawl status:', error);
        return null;
      }
      return data;
    },
    enabled: !!currentCrawlingProject && !!user,
    refetchInterval: 2000,
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ['translation-projects'],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('website_crawl_status')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.warn('Website crawl status table not yet available');
        return [];
      }
    },
    enabled: !!user,
  });

  // Site limit enforcement logic
  const ownerUnlimited = userProfile?.role === 'owner';
  const subscription = userProfile?.subscriptions?.[0];
  const currentPlan = subscription?.tier || 'free';
  const planLimits: Record<string, number> = {
    free: 0,
    professional: 1,
    premium: 2,
    business: Infinity
  };
  const sitesAllowed = ownerUnlimited ? Infinity : (planLimits[currentPlan] ?? 0);

  // Create new translation project with enforcement
  const createProject = useMutation({
    mutationFn: async ({ name, url, languages }: { name: string; url: string; languages: string[] }) => {
      if (!user) {
        throw new Error('User must be authenticated to create projects');
      }
      // ENFORCE LIMIT for non-owners
      const { data: existing, error: countError } = await supabase
        .from('website_crawl_status')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      const projectCount = existing?.length || 0;
      if (!ownerUnlimited && projectCount >= sitesAllowed) {
        throw new Error(`You have reached your plan's limit for masked websites. Please upgrade your subscription for more.`);
      }
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
            user_id: user.id,
            progress: progressData as any
          })
          .select()
          .single();

        if (crawlError) {
          console.error('Crawl insert error:', crawlError);
          throw crawlError;
        }

        setCurrentCrawlingProject(crawlData.id);

        // Start simulated crawling process
        setTimeout(() => simulateCrawlingProgress(crawlData.id, defaultSteps, name, languages), 1000);

        toast.success('🚀 Neural crawlers deployed! Watch the AI agents work.');
        return crawlData;
      } catch (error) {
        console.error('Failed to create project:', error);
        toast.error(`Failed to deploy neural crawlers: ${error.message}`);
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
    if (!user) return;

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
          .eq('id', projectId)
          .eq('user_id', user.id);

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
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) console.error('Error updating crawl status:', error);
    }
  };

  const handleCreateProject = (name: string, url: string, languages: string[]) => {
    if (!user) {
      toast.error('Please log in to create translation projects');
      return;
    }
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

  const handleUnmaskProject = async (projectId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('website_crawl_status')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['translation-projects'] });
      queryClient.invalidateQueries({ queryKey: ['crawling-status'] });
      if (projectId === currentCrawlingProject) {
        setCurrentCrawlingProject(null);
      }
      // Use toast for confirmation
      // (On this codebase, "sonner" can be used directly)
      // @ts-ignore
      if (window.toast) window.toast.success('Website unmasked (removed) successfully!');
    } catch (e: any) {
      // @ts-ignore
      if (window.toast) window.toast.error('Failed to unmask website: ' + e.message);
    }
  };

  // Show login message if not authenticated
  if (!user) {
    return (
      <div className="space-y-6">
        <TranslationInstructions />
        
        <Card className="border-purple-500/30 bg-gradient-to-br from-black/80 to-purple-900/20 backdrop-blur-lg shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-4">
              <Globe className="w-16 h-16 text-purple-400 mx-auto" />
              <h3 className="text-2xl font-bold text-purple-100">Authentication Required</h3>
              <p className="text-purple-200">Please log in to access the Neural Translation Engine and create website translation projects.</p>
            </div>
            
            <Button
              onClick={() => window.location.hash = '#auth'}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-8 py-4 text-lg"
            >
              <Globe className="w-5 h-5 mr-2" />
              Log In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show enhanced crawling status if there's an active project
  if (currentCrawlingProject && crawlingStatus) {
    const progressData = crawlingStatus.progress as any;
    const steps = (progressData?.steps || []) as ProgressStep[];
    const isComplete = crawlingStatus.status === 'completed';
    const currentStep = progressData?.currentStep || 0;

    // Show preview overlay if user requests live masked preview, only if completed
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

        {/* Render the Masked Preview Overlay */}
        {isComplete && showPreview && (
          <MaskedPreviewOverlay
            url={crawlingStatus.url}
            languages={progressData?.targetLanguages || []}
            defaultLanguage={(progressData?.targetLanguages || [])[0]}
            onClose={() => setShowPreview(false)}
          />
        )}

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
                {/* New: Masked Preview button */}
                <Button
                  onClick={() => setShowPreview(true)}
                  variant="outline"
                  className="border-purple-500 text-purple-200 hover:bg-purple-900/20 font-bold px-8 py-4 text-lg"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  Live Masked Preview
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
                onCreateProject={(name, url, languages) =>
                  createProject.mutate({ name, url, languages })
                }
                isCreating={createProject.isPending}
              />
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              <TranslationProjectList
                projects={projects || []}
                isLoading={isLoading}
                onViewProject={handleViewProject}
                onUnmaskProject={handleUnmaskProject}
                canUnmask={true}
                onShowPreview={(proj) => {
                  setPreviewProject(proj);
                  setShowPreview(true);
                }}
              />
              {/* Masked Preview overlay for projects */}
              {showPreview && previewProject && (
                <MaskedPreviewOverlay
                  url={previewProject.url}
                  languages={previewProject.progress?.targetLanguages || []}
                  defaultLanguage={previewProject.progress?.targetLanguages?.[0]}
                  onClose={() => setShowPreview(false)}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
