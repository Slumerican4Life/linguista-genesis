import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe, 
  CheckCircle, 
  Clock, 
  XCircle, 
  BarChart3, 
  ExternalLink,
  Eye,
  RefreshCw,
  Languages
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WebsitePage {
  url: string;
  status: 'completed' | 'processing' | 'pending' | 'error';
  languages: string[];
  lastUpdated: string;
  wordCount: number;
  translationAccuracy: number;
}

interface WebsiteProject {
  id: string;
  name: string;
  baseUrl: string;
  totalPages: number;
  completedPages: number;
  targetLanguages: string[];
  overallProgress: number;
  pages: WebsitePage[];
  createdAt: string;
  lastActivity: string;
}

interface WebsiteCoverageTrackerProps {
  userId: string;
}

export const WebsiteCoverageTracker: React.FC<WebsiteCoverageTrackerProps> = ({ userId }) => {
  const [projects, setProjects] = useState<WebsiteProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, [userId]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      // In production, fetch real data from Supabase
      // For demo, using mock data
      const mockProjects: WebsiteProject[] = [
        {
          id: 'proj-1',
          name: 'E-commerce Store',
          baseUrl: 'https://mystore.com',
          totalPages: 25,
          completedPages: 18,
          targetLanguages: ['Spanish', 'French', 'German'],
          overallProgress: 72,
          createdAt: '2024-01-15',
          lastActivity: '2024-01-20',
          pages: [
            {
              url: 'https://mystore.com/',
              status: 'completed',
              languages: ['Spanish', 'French', 'German'],
              lastUpdated: '2024-01-20',
              wordCount: 450,
              translationAccuracy: 96
            },
            {
              url: 'https://mystore.com/products',
              status: 'completed',
              languages: ['Spanish', 'French', 'German'],
              lastUpdated: '2024-01-20',
              wordCount: 320,
              translationAccuracy: 94
            },
            {
              url: 'https://mystore.com/about',
              status: 'processing',
              languages: ['Spanish', 'French'],
              lastUpdated: '2024-01-20',
              wordCount: 280,
              translationAccuracy: 0
            },
            {
              url: 'https://mystore.com/contact',
              status: 'pending',
              languages: [],
              lastUpdated: '2024-01-20',
              wordCount: 150,
              translationAccuracy: 0
            }
          ]
        },
        {
          id: 'proj-2',
          name: 'Restaurant Website',
          baseUrl: 'https://myrestaurant.com',
          totalPages: 12,
          completedPages: 12,
          targetLanguages: ['Spanish', 'Italian'],
          overallProgress: 100,
          createdAt: '2024-01-10',
          lastActivity: '2024-01-18',
          pages: [
            {
              url: 'https://myrestaurant.com/',
              status: 'completed',
              languages: ['Spanish', 'Italian'],
              lastUpdated: '2024-01-18',
              wordCount: 320,
              translationAccuracy: 98
            },
            {
              url: 'https://myrestaurant.com/menu',
              status: 'completed',
              languages: ['Spanish', 'Italian'],
              lastUpdated: '2024-01-18',
              wordCount: 680,
              translationAccuracy: 95
            }
          ]
        }
      ];

      setProjects(mockProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load website coverage data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'pending': return 'text-gray-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4 animate-pulse" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  if (isLoading) {
    return (
      <Card className="border-purple-500/30 bg-gradient-to-br from-black/80 to-purple-900/20">
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-purple-300">Loading website coverage data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <Card className="border-purple-500/30 bg-gradient-to-br from-black/80 to-purple-900/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-purple-100 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6" />
            <span>Website Translation Coverage</span>
            <Badge variant="outline" className="border-green-500 text-green-300">
              {projects.length} Active Projects
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-black/40 rounded-lg">
              <div className="text-3xl font-bold text-white">
                {projects.reduce((acc, p) => acc + p.totalPages, 0)}
              </div>
              <div className="text-purple-300 text-sm">Total Pages</div>
            </div>
            <div className="text-center p-4 bg-black/40 rounded-lg">
              <div className="text-3xl font-bold text-green-400">
                {projects.reduce((acc, p) => acc + p.completedPages, 0)}
              </div>
              <div className="text-purple-300 text-sm">Translated Pages</div>
            </div>
            <div className="text-center p-4 bg-black/40 rounded-lg">
              <div className="text-3xl font-bold text-blue-400">
                {Math.round(projects.reduce((acc, p) => acc + p.overallProgress, 0) / projects.length)}%
              </div>
              <div className="text-purple-300 text-sm">Average Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Overview */}
        <Card className="border-purple-500/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-lg text-purple-200 flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Active Projects</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedProject === project.id
                        ? 'border-purple-500 bg-purple-900/30'
                        : 'border-purple-500/30 bg-black/20 hover:border-purple-500/50'
                    }`}
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{project.name}</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(project.baseUrl, '_blank');
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-purple-300 mb-3">{project.baseUrl}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{project.completedPages}/{project.totalPages} pages</span>
                      </div>
                      <Progress value={project.overallProgress} className="h-2" />
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.targetLanguages.map((lang) => (
                          <Badge key={lang} variant="outline" className="text-xs border-blue-500/50 text-blue-300">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card className="border-purple-500/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-lg text-purple-200 flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>
                {selectedProjectData ? `${selectedProjectData.name} Details` : 'Select a Project'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProjectData ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {/* Project Info */}
                  <div className="p-3 bg-purple-900/20 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Created:</span>
                        <div className="text-white">{new Date(selectedProjectData.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Last Activity:</span>
                        <div className="text-white">{new Date(selectedProjectData.lastActivity).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Pages List */}
                  <div className="space-y-2">
                    <h5 className="font-semibold text-purple-200 flex items-center space-x-2">
                      <Languages className="w-4 h-4" />
                      <span>Page Translation Status</span>
                    </h5>
                    {selectedProjectData.pages.map((page, index) => (
                      <div key={index} className="p-3 border border-purple-500/30 rounded-lg bg-black/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white font-mono">{page.url}</span>
                          <div className={`flex items-center space-x-1 ${getStatusColor(page.status)}`}>
                            {getStatusIcon(page.status)}
                            <span className="text-xs capitalize">{page.status}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                          <div>Words: <span className="text-white">{page.wordCount}</span></div>
                          <div>Accuracy: <span className="text-white">{page.translationAccuracy}%</span></div>
                        </div>
                        
                        {page.languages.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {page.languages.map((lang) => (
                              <Badge key={lang} variant="outline" className="text-xs border-green-500/50 text-green-300">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-center">
                <div className="text-gray-400">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a project to view detailed coverage information</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};