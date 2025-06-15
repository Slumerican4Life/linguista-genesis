
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface TranslationProjectFormProps {
  onCreateProject: (name: string, url: string, languages: string[]) => void;
  isCreating: boolean;
}

export const TranslationProjectForm: React.FC<TranslationProjectFormProps> = ({
  onCreateProject,
  isCreating
}) => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

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

    onCreateProject(projectName, websiteUrl, selectedLanguages);
    setWebsiteUrl('');
    setProjectName('');
    setSelectedLanguages([]);
  };

  return (
    <div className="space-y-6">
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
        disabled={isCreating}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        {isCreating ? (
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
    </div>
  );
};
