
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const KnowledgeBase = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  // Fetch knowledge base files
  const { data: knowledgeFiles } = useQuery({
    queryKey: ['knowledge-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_files')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Upload knowledge file mutation
  const uploadKnowledgeFile = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `knowledge/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('knowledge-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create database record
      const { error: dbError } = await supabase
        .from('knowledge_files')
        .insert({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath,
          description: 'Admin uploaded knowledge file'
        });

      if (dbError) throw dbError;

      // Log the action
      await supabase.from('admin_logs').insert({
        action: 'knowledge_upload',
        details: { file_name: file.name, file_size: file.size }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-files'] });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
      toast.success('Knowledge file uploaded successfully');
      setUploadedFile(null);
    },
    onError: (error) => {
      toast.error(`Failed to upload file: ${error.message}`);
    },
  });

  const handleFileUpload = () => {
    if (uploadedFile) {
      uploadKnowledgeFile.mutate(uploadedFile);
    }
  };

  return (
    <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-purple-100">Knowledge Base Management</CardTitle>
        <CardDescription className="text-purple-200">
          Upload files to enhance Lyra's knowledge and translation capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-purple-200">Upload knowledge files, dictionaries, or language resources</p>
              <p className="text-sm text-purple-300">Supports TXT, CSV, JSON, PDF files up to 10MB</p>
            </div>
            <div className="mt-4 space-y-2">
              <input
                type="file"
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                accept=".txt,.csv,.json,.pdf"
                className="hidden"
                id="knowledge-upload"
              />
              <label htmlFor="knowledge-upload">
                <Button variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-900/20" asChild>
                  <span>Choose File</span>
                </Button>
              </label>
              {uploadedFile && (
                <div className="space-y-2">
                  <p className="text-sm text-purple-200">Selected: {uploadedFile.name}</p>
                  <Button 
                    onClick={handleFileUpload}
                    disabled={uploadKnowledgeFile.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {uploadKnowledgeFile.isPending ? 'Uploading...' : 'Upload File'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Knowledge Files List */}
        <div className="space-y-2">
          <h4 className="font-semibold text-purple-100">Uploaded Files</h4>
          <div className="space-y-2">
            {knowledgeFiles?.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                <div>
                  <p className="font-medium text-white">{file.file_name}</p>
                  <p className="text-sm text-purple-300">
                    {(file.file_size / 1024).toFixed(1)} KB • {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={file.is_active ? 'default' : 'secondary'}>
                  {file.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
