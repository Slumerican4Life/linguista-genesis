
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NeuronixBrain } from '../NeuronixBrain';
import { TranslationInstructions } from './TranslationInstructions';
import { TranslationProjectForm } from './TranslationProjectForm';
import { TranslationProjectList } from './TranslationProjectList';

interface WebsiteTranslatorMainProps {
  projects: any[];
  isLoading: boolean;
  onCreateProject: (name: string, url: string, languages: string[]) => void;
  isCreating: boolean;
  onViewProject: (projectId: string) => void;
  onUnmaskProject: (projectId: string) => Promise<void>;
}

export const WebsiteTranslatorMain: React.FC<WebsiteTranslatorMainProps> = ({
  projects,
  isLoading,
  onCreateProject,
  isCreating,
  onViewProject,
  onUnmaskProject
}) => {
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
                onCreateProject={onCreateProject}
                isCreating={isCreating}
              />
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              <TranslationProjectList
                projects={projects || []}
                isLoading={isLoading}
                onViewProject={onViewProject}
                onUnmaskProject={onUnmaskProject}
                canUnmask={true}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
