
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
  [key: string]: any; // Add index signature for Json compatibility
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
      setWebsiteUrl('');
      setProjectName('');
      setSelectedLanguages([]);
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
      {/* Enhanced Instructions Card with Neuronix Branding */}
      <Card className="border-blue-500/30 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 animate-pulse"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center space-x-3 text-2xl font-bold text-blue-100">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white animate-spin-slow" />
            </div>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Website Translation Condom™
            </span>
          </CardTitle>
          <CardDescription className="text-blue-200 text-lg">
            Slip a translation layer over any website - preserving design, functionality, and user experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-6 bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105">
              <Globe className="w-12 h-12 text-blue-400 mx-auto mb-3 animate-bounce" />
              <h3 className="font-bold text-blue-200 mb-2">Enter Website</h3>
              <p className="text-sm text-blue-300">Any URL - ecommerce, blogs, social media</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105">
              <Settings className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-spin-slow" />
              <h3 className="font-bold text-purple-200 mb-2">AI Crawlers Deploy</h3>
              <p className="text-sm text-purple-300">Scan, extract, and understand context</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 rounded-xl border border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300 transform hover:scale-105">
              <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-3 animate-pulse" />
              <h3 className="font-bold text-indigo-200 mb-2">Contextual Translation</h3>
              <p className="text-sm text-indigo-300">Like a local speaking to locals</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-900/40 to-green-800/40 rounded-xl border border-green-500/30 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105">
              <Eye className="w-12 h-12 text-green-400 mx-auto mb-3 animate-pulse" />
              <h3 className="font-bold text-green-200 mb-2">Perfect Clone</h3>
              <p className="text-sm text-green-300">Identical design, translated content</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-xl border border-blue-500/30">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <h4 className="font-bold text-yellow-200 mb-2">Neuronix Brain Technology</h4>
                <p className="text-blue-200 text-sm leading-relaxed">
                  Our neural translation network understands cultural nuances, local expressions, humor, and context. 
                  It's not just word conversion - it's cultural adaptation that makes your content feel native to each market.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge className="bg-yellow-600/20 text-yellow-200 border border-yellow-500/30">Cultural Context</Badge>
                  <Badge className="bg-orange-600/20 text-orange-200 border border-orange-500/30">Local Expressions</Badge>
                  <Badge className="bg-red-600/20 text-red-200 border border-red-500/30">Humor Preservation</Badge>
                  <Badge className="bg-pink-600/20 text-pink-200 border border-pink-500/30">Tone Matching</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-purple-200 mb-2 block">
                    Project Name
                  </label>
                  <Input
                    placeholder="e.g., Company Website, Blog, E-commerce Store"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="bg-purple-900/20 border-purple-500/30 text-white placeholder:text-purple-300 focus:border-purple-400"
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
                    className="bg-purple-900/20 border-purple-500/30 text-white placeholder:text-purple-300 focus:border-purple-400"
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
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {createProject.isPending ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Deploying AI Crawlers...
                  </>
                ) : (
                  <>
                    <Globe className="w-5 h-5 mr-2" />
                    Start Website Translation
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-purple-200">Loading projects...</div>
              ) : projects?.length === 0 ? (
                <div className="text-center py-12">
                  <Globe className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                  <p className="text-purple-200 mb-2 text-lg font-semibold">No translation projects yet</p>
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
                      <Card key={project.id} className="border-purple-500/20 bg-gradient-to-r from-purple-900/10 to-blue-900/10 hover:from-purple-900/20 hover:to-blue-900/20 transition-all duration-300">
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
