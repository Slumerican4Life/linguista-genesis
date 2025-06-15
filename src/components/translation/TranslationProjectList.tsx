
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Link2, Eye, Download } from 'lucide-react';

interface Project {
  id: string;
  url: string;
  status: string;
  created_at: string;
  progress: any;
}

interface TranslationProjectListProps {
  projects: Project[];
  isLoading: boolean;
  onViewProject: (projectId: string) => void;
}

export const TranslationProjectList: React.FC<TranslationProjectListProps> = ({
  projects,
  isLoading,
  onViewProject
}) => {
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

  if (isLoading) {
    return <div className="text-center py-8 text-purple-200">Loading projects...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
        <p className="text-purple-200 mb-2 text-lg font-semibold">No translation projects yet</p>
        <p className="text-sm text-purple-300">Create your first project to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const progressData = project.progress as any;
        
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
                    onClick={() => onViewProject(project.id)}
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
  );
};
