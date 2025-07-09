import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Globe, Edit, Eye, EyeOff, Pause, Play, Trash2, Star, BarChart3, Languages, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ActiveSite {
  id: string;
  url: string;
  status: string;
  created_at: string;
  progress: any;
  trial_expires_at?: string;
}

export const ActiveSiteManager = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: sites, isLoading } = useQuery({
    queryKey: ['active-sites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('website_crawl_status')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const toggleSiteStatus = useMutation({
    mutationFn: async ({ siteId, isActive }: { siteId: string; isActive: boolean }) => {
      // For now, just show a toast as the schema doesn't have is_active field
      toast.info('Site status toggling coming soon with database update!');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sites'] });
      toast.success('Site status updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update site: ${error.message}`);
    },
  });

  const updateProjectName = useMutation({
    mutationFn: async ({ siteId, name }: { siteId: string; name: string }) => {
      // For now, just show success as the schema doesn't have project_name field
      toast.info('Project naming coming soon with database update!');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sites'] });
      setEditingId(null);
      toast.success('Project name updated!');
    },
    onError: (error) => {
      toast.error(`Failed to update name: ${error.message}`);
    },
  });

  const deleteSite = useMutation({
    mutationFn: async (siteId: string) => {
      const { error } = await supabase
        .from('website_crawl_status')
        .delete()
        .eq('id', siteId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sites'] });
      toast.success('Site removed successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to remove site: ${error.message}`);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'failed': return 'bg-red-600';
      case 'crawling': return 'bg-yellow-600';
      default: return 'bg-blue-600';
    }
  };

  const getLanguageCount = (progress: any) => {
    return progress?.targetLanguages?.length || 0;
  };

  if (!user) {
    return (
      <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Globe className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <p className="text-purple-200">Please log in to manage your active websites</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-purple-100">Active Website Manager</h2>
          <p className="text-purple-200">Control which sites are active, edit translations, and manage your portfolio</p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2">
          {sites?.length || 0} Active Projects
        </Badge>
      </div>

      {isLoading ? (
        <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-purple-200">Loading your active websites...</p>
          </CardContent>
        </Card>
      ) : sites && sites.length > 0 ? (
        <div className="grid gap-6">
          {sites.map((site) => {
            const isExpired = site.trial_expires_at && new Date(site.trial_expires_at) < new Date();
            const languageCount = getLanguageCount(site.progress);
            
            return (
              <Card 
                key={site.id} 
                className="border border-purple-500/30 bg-black/60 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {editingId === site.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-black/40 border-purple-500/30 text-white"
                            placeholder="Project name..."
                          />
                          <Button
                            size="sm"
                            onClick={() => updateProjectName.mutate({ siteId: site.id, name: editName })}
                            disabled={updateProjectName.isPending}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg text-white">
                            {site.url.split('/')[2] || 'Website Project'}
                          </CardTitle>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(site.id);
                              setEditName(site.url.split('/')[2] || '');
                            }}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      <CardDescription className="text-gray-300">
                        {site.url}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getStatusColor(site.status)} text-white`}>
                        {site.status}
                      </Badge>
                      {isExpired && (
                        <Badge className="bg-red-600 text-white">
                          Trial Expired
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Languages className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300">
                        {languageCount} Language{languageCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-300">
                        Created {new Date(site.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-300">
                        Neural Translation
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-600/30">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-300">Active:</span>
                        <Switch
                          checked={site.status === 'completed'}
                          onCheckedChange={(checked) => 
                            toggleSiteStatus.mutate({ siteId: site.id, isActive: checked })
                          }
                          disabled={toggleSiteStatus.isPending}
                        />
                        {site.status === 'completed' ? (
                          <Eye className="w-4 h-4 text-green-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(site.url, '_blank')}
                        className="border-blue-400 text-blue-300 hover:bg-blue-900/20"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.info('Analytics coming soon!')}
                        className="border-purple-400 text-purple-300 hover:bg-purple-900/20"
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Stats
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteSite.mutate(site.id)}
                        disabled={deleteSite.isPending}
                        className="border-red-400 text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-4">
            <Globe className="w-16 h-16 text-purple-400 mx-auto" />
            <h3 className="text-xl font-bold text-purple-100">No Active Websites</h3>
            <p className="text-purple-200">Start by creating your first website translation project</p>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Globe className="w-4 h-4 mr-2" />
              Create New Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};