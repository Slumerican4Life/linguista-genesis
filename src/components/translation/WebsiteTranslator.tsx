import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LiveDemoSection } from './LiveDemoSection';
import { CrawlingInterface } from './CrawlingInterface';
import { WebsiteTranslatorMain } from './WebsiteTranslatorMain';
import { MaskedPreviewOverlay } from "./MaskedPreviewOverlay";

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
}

interface ProgressData {
  projectName?: string;
  targetLanguages?: string[];
  steps?: ProgressStep[];
  error?: string;
}

export const WebsiteTranslator: React.FC = () => {
  const [currentCrawlingProject, setCurrentCrawlingProject] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewProject, setPreviewProject] = useState<any | null>(null);
  const [projectToPreview, setProjectToPreview] = useState<{name: string, url: string, languages: string[]} | null>(null);
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
    refetchInterval: (query) => (query.state.data?.status === 'crawling' || query.state.data?.status === 'pending') ? 2000 : false,
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
    free: 1, // Trial allows 1 site
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
          { id: 'translate', label: 'Bulk Translation', status: 'pending', description: 'Neural networks processing language conversion' },
          { id: 'quality-check', label: 'Quality Check', status: 'pending', description: 'AI agents reviewing for contextual accuracy' },
          { id: 'rebuild', label: 'Rebuilding Site', status: 'pending', description: 'Reconstructing site with new language' },
          { id: 'deploy', label: 'Site Ready', status: 'pending', description: 'Your translated website is ready!' }
        ];

        const progressData = { 
          projectName: name,
          targetLanguages: languages,
          steps: defaultSteps
        };

        const trialExpiresAt = currentPlan === 'free'
          ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          : null;

        const { data: crawlData, error: crawlError } = await supabase
          .from('website_crawl_status')
          .insert({
            url,
            status: 'pending',
            user_id: user.id,
            progress: progressData as any,
            project_name: name,
            trial_expires_at: trialExpiresAt,
          })
          .select()
          .single();

        if (crawlError) {
          console.error('Crawl insert error:', crawlError);
          throw crawlError;
        }

        setCurrentCrawlingProject(crawlData.id);

        // Invoke the edge function to start the real crawl
        const { error: invokeError } = await supabase.functions.invoke('crawl-website', {
          body: { projectId: crawlData.id, url: crawlData.url },
        });

        if (invokeError) {
          // If invoking fails, update the status to 'failed'
          await supabase
            .from('website_crawl_status')
            .update({ status: 'failed', progress: { ...progressData, error: 'Failed to start crawlers.' } as any })
            .eq('id', crawlData.id);
          throw invokeError;
        }

        toast.success('🚀 Neural crawlers deployed! Watch the AI agents work.');
        return crawlData;
      } catch (error: any) {
        console.error('Failed to create project:', error);
        toast.error(`Failed to deploy neural crawlers: ${error.message}`);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translation-projects'] });
    },
  });

  const handleCreateProject = (name: string, url: string, languages: string[]) => {
    if (!user) {
      toast.error('Please log in to create translation projects');
      return;
    }
    setProjectToPreview({ name, url, languages });
  };
  
  const confirmAndCreateProject = () => {
    if (projectToPreview) {
      createProject.mutate(projectToPreview);
      setProjectToPreview(null);
    }
  };

  const handleViewResult = () => {
    if (crawlingStatus && currentPlan === 'free' && crawlingStatus.trial_expires_at && new Date(crawlingStatus.trial_expires_at) < new Date()) {
      toast.error("Your 24-hour trial for this website has expired. Please upgrade to continue accessing it.");
      return;
    }
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
    const project = projects?.find(p => p.id === projectId);
    if (project && currentPlan === 'free' && project.trial_expires_at && new Date(project.trial_expires_at) < new Date()) {
      toast.error("Your 24-hour trial for this website has expired. Please upgrade to continue managing it.");
      return;
    }
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
      toast.success('Website unmasked (removed) successfully!');
    } catch (e: any) {
      toast.error('Failed to unmask website: ' + e.message);
    }
  };

  const handleStartDemo = () => {
    setPreviewProject({
      url: "https://example.com",
      progress: {
        targetLanguages: ["spanish", "french", "german", "japanese"]
      }
    });
    setShowPreview(true);
  };

  const handleShowPreview = () => {
    if (crawlingStatus && currentPlan === 'free' && crawlingStatus.trial_expires_at && new Date(crawlingStatus.trial_expires_at) < new Date()) {
      toast.error("Your 24-hour trial for this website has expired. Please upgrade to see the preview.");
      return;
    }
    setShowPreview(true);
  };

  // Show login message if not authenticated
  if (!user) {
    return (
      <div className="space-y-6">
        <LiveDemoSection onStartDemo={handleStartDemo} isLoggedIn={false} />
        
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

        {/* Live Preview Overlay */}
        {showPreview && previewProject && (
          <MaskedPreviewOverlay
            url={previewProject.url}
            languages={(previewProject.progress as ProgressData)?.targetLanguages || ["spanish", "french", "german", "japanese"]}
            defaultLanguage={(previewProject.progress as ProgressData)?.targetLanguages?.[0] || "spanish"}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    );
  }

  // Show enhanced crawling status if there's an active project
  if (currentCrawlingProject && crawlingStatus) {
    return (
      <div className="space-y-8">
        <CrawlingInterface
          crawlingStatus={crawlingStatus}
          onViewResult={handleViewResult}
          onFinishCrawling={handleFinishCrawling}
          onShowPreview={handleShowPreview}
        />

        {/* Render the Masked Preview Overlay */}
        {crawlingStatus.status === 'completed' && showPreview && (
          <MaskedPreviewOverlay
            url={crawlingStatus.url}
            languages={(crawlingStatus.progress as ProgressData)?.targetLanguages || []}
            defaultLanguage={((crawlingStatus.progress as ProgressData)?.targetLanguages || [])[0]}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WebsiteTranslatorMain
        projects={projects || []}
        isLoading={isLoading}
        onCreateProject={handleCreateProject}
        isCreating={createProject.isPending}
        onViewProject={handleViewProject}
        onUnmaskProject={handleUnmaskProject}
      />

      {/* Preview before creating project */}
      {projectToPreview && (
        <MaskedPreviewOverlay
          url={projectToPreview.url}
          languages={projectToPreview.languages}
          defaultLanguage={projectToPreview.languages[0]}
          onClose={() => setProjectToPreview(null)}
          onConfirm={confirmAndCreateProject}
          isConfirming={createProject.isPending}
        />
      )}
    </div>
  );
};
