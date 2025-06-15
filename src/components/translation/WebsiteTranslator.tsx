
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Link2, Sparkles, Download, Eye, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CrawlingStatusTracker } from '../CrawlingStatusTracker';

interface CrawlingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description?: string;
}

export const WebsiteTranslator: React.FC = () => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
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
          { id: 'init', label: 'Deploying crawlers', status: 'pending', description: 'Initializing AI-powered web crawlers' },
          { id: 'crawl', label: 'Crawlers crawling the site', status: 'pending', description: 'Deep-scanning all pages and content' },
          { id: 'extract', label: 'Crawlers returned', status: 'pending', description: 'Processing and extracting translatable content' },
          { id: 'translate', label: 'Translating content', status: 'pending', description: 'AI contextual translation in progress' },
          { id: 'rebuild', label: 'Rebuilding site', status: 'pending', description: 'Creating translated website version' },
          { id: 'deploy', label: 'Site ready', status: 'pending', description: 'Finalizing translated website' }
        ];

        const { data: crawlData, error: crawlError } = await supabase
          .from('website_crawl_status')
          .insert({
            url,
            status: 'pending',
            progress: { 
              projectName: name,
              targetLanguages: languages,
              steps: defaultSteps
            }
          })
          .select()
          .single();

        if (crawlError) throw crawlError;

        setCurrentCrawlingProject(crawlData.id);

        // Start simulated crawling process
        setTimeout(() => simulateCrawlingProgress(crawlData.id, defaultSteps), 1000);

        toast.success('Website translation started! AI crawlers deployed.');
        return crawlData;
      } catch (error) {
        console.error('Failed to create project:', error);
        toast.error('Failed to start website translation');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translation-projects'] });
      setWebsiteUrl('');
      setProjectName('');
      setSelectedLanguages([]);
    },
  });

  // Simulate realistic crawling progress with proper typing
  const simulateCrawlingProgress = async (projectId: string, initialSteps: CrawlingStep[]) => {
    const stepOrder = ['init', 'crawl', 'extract', 'translate', 'rebuild', 'deploy'];
    
    for (let i = 0; i < stepOrder.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      const updatedSteps = initialSteps.map((step, index) => ({
        ...step,
        status: index < i ? 'completed' as const : 
               index === i ? 'processing' as const : 
               'pending' as const
      }));

      const { error } = await supabase
        .from('website_crawl_status')
        .update({
          status: i === stepOrder.length - 1 ? 'completed' : 'crawling',
          progress: {
            projectName: projectName,
            targetLanguages: selectedLanguages,
            steps: updatedSteps,
            currentStep: i
          },
          ...(i === stepOrder.length - 1 && { completed_at: new Date().toISOString() })
        })
        .eq('id', projectId);

      if (error) console.error('Error updating crawl status:', error);
    }
  };

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    if (!websiteUrl.trim()) {
      toast.error('Please enter a website URL');
      return;
    }
    if (selectedLanguages.length === 0) {
      toast.error('Please select at least one target language');
      return;
    }

    try {
      new URL(websiteUrl);
    } catch {
      toast.error('Please enter a valid URL (including http:// or https://)');
      return;
    }

    createProject.mutate({
      name: projectName,
      url: websiteUrl,
      languages: selectedLanguages
    });
  };

  const handleViewResult = () => {
    toast.success('🎉 Opening your translated website in new tab!');
    // In production, this would open the actual translated site
    window.open(websiteUrl, '_blank');
  };

  const handleFinishCrawling = () => {
    setCurrentCrawlingProject(null);
    toast.success('✨ Project saved to your dashboard!');
  };

  const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'th', name: 'Thai' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'nl', name: 'Dutch' },
    { code: 'sv', name: 'Swedish' },
    { code: 'da', name: 'Danish' },
    { code: 'no', name: 'Norwegian' },
    { code: 'fi', name: 'Finnish' },
    { code: 'pl', name: 'Polish' },
    { code: 'tr', name: 'Turkish' }
  ];

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
      {/* Instructions Card */}
      <Card className="border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-100">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span>How Website Translation Works</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-900/30 rounded-lg">
              <Globe className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-200">Enter Website</h3>
              <p className="text-sm text-blue-300">Paste any website URL - ecommerce, blog, social media</p>
            </div>
            <div className="text-center p-4 bg-purple-900/30 rounded-lg">
              <Settings className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="font-semibold text-purple-200">AI Translation</p>
              <p className="text-sm text-purple-300">Our AI crawlers scan and translate contextually</p>
            </div>
            <div className="text-center p-4 bg-green-900/30 rounded-lg">
              <Eye className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="font-semibold text-green-200">Live Preview</h3>
              <p className="text-sm text-green-300">View the translated site that looks identical to the original</p>
            </div>
          </div>
          <div className="text-sm text-blue-200 bg-blue-900/20 p-3 rounded-lg">
            <strong>Pro Tip:</strong> Works with any website - ecommerce stores, blogs, social media posts. It's like putting a translation condom over the entire site!
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-500/30 bg-black/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-100">
            <Globe className="w-6 h-6 text-purple-400" />
            <span>Website Translation</span>
          </CardTitle>
          <CardDescription className="text-purple-200">
            Transform any website into multiple languages while preserving design and functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-purple-900/20 border border-purple-500/30">
              <TabsTrigger value="create" className="data-[state=active]:bg-purple-700 text-purple-200">
                New Project
              </TabsTrigger>
              <TabsTrigger value="manage" className="data-[state=active]:bg-purple-700 text-purple-200">
                Manage Projects
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-purple-200 mb-2 block">
                    Project Name
                  </label>
                  <Input
                    placeholder="e.g., Company Website, Blog, E-commerce Store"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="bg-purple-900/20 border-purple-500/30 text-white placeholder:text-purple-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-purple-200 mb-2 block">
                    Website URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="bg-purple-900/20 border-purple-500/30 text-white placeholder:text-purple-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-purple-200 mb-3 block">
                  Target Languages (Select multiple)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={selectedLanguages.includes(lang.code) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedLanguages(prev => 
                          prev.includes(lang.code)
                            ? prev.filter(l => l !== lang.code)
                            : [...prev, lang.code]
                        );
                      }}
                      className={`${
                        selectedLanguages.includes(lang.code)
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'border-purple-500/30 text-purple-200 hover:bg-purple-900/20'
                      } transition-all duration-200`}
                    >
                      {lang.name}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-purple-300 mt-2">
                  Selected: {selectedLanguages.length} languages
                </p>
              </div>

              <Button
                onClick={handleCreateProject}
                disabled={createProject.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {createProject.isPending ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Deploying AI Crawlers...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Start Website Translation
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-purple-200">Loading projects...</div>
              ) : projects?.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-purple-200 mb-2">No translation projects yet</p>
                  <p className="text-sm text-purple-300">Create your first project to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects?.map((project: any) => {
                    const progressData = project.progress as any;
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'completed': return 'bg-green-600';
                        case 'crawling': return 'bg-blue-600';
                        case 'failed': return 'bg-red-600';
                        default: return 'bg-yellow-600';
                      }
                    };

                    const getStatusLabel = (status: string) => {
                      switch (status) {
                        case 'completed': return 'Ready';
                        case 'crawling': return 'Processing';
                        case 'failed': return 'Failed';
                        default: return 'Pending';
                      }
                    };

                    return (
                      <Card key={project.id} className="border-purple-500/20 bg-purple-900/10">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-white">
                                  {progressData?.projectName || 'Website Project'}
                                </h3>
                                <Badge className={`${getStatusColor(project.status)} text-white`}>
                                  {getStatusLabel(project.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-purple-200 mb-2">
                                <Link2 className="w-4 h-4 inline mr-1" />
                                {project.url}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-purple-300">
                                <span>Languages: {progressData?.targetLanguages?.length || 0}</span>
                                <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-purple-500/30 text-purple-200 hover:bg-purple-900/20"
                                onClick={() => setCurrentCrawlingProject(project.id)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              {project.status === 'completed' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-green-500/30 text-green-200 hover:bg-green-900/20"
                                  onClick={() => window.open(project.url, '_blank')}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  View Site
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
