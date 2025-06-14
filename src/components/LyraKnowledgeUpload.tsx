
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const LyraKnowledgeUpload = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const queryClient = useQueryClient();

  const uploadKnowledgeFile = useMutation({
    mutationFn: async (file: File) => {
      setUploadProgress('uploading');
      
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
          description: 'Lyra chat knowledge upload'
        });

      if (dbError) throw dbError;

      return { fileName: file.name, filePath };
    },
    onSuccess: (data) => {
      setUploadProgress('success');
      queryClient.invalidateQueries({ queryKey: ['knowledge-files'] });
      toast.success(`File "${data.fileName}" uploaded to Lyra's knowledge base!`);
      setTimeout(() => {
        setUploadedFile(null);
        setUploadProgress('idle');
      }, 2000);
    },
    onError: (error) => {
      setUploadProgress('error');
      toast.error(`Failed to upload file: ${error.message}`);
      setTimeout(() => setUploadProgress('idle'), 3000);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUploadProgress('idle');
    }
  };

  const handleUpload = () => {
    if (uploadedFile) {
      uploadKnowledgeFile.mutate(uploadedFile);
    }
  };

  const getStatusIcon = () => {
    switch (uploadProgress) {
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Upload className="w-4 h-4 text-purple-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (uploadProgress) {
      case 'uploading':
        return 'Uploading to my knowledge base...';
      case 'success':
        return 'Successfully added to my knowledge!';
      case 'error':
        return 'Upload failed. Please try again.';
      default:
        return 'Upload files to enhance my translation knowledge';
    }
  };

  return (
    <Card className="border border-purple-500/30 bg-black/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-purple-100 text-sm flex items-center space-x-2">
          {getStatusIcon()}
          <span>Knowledge Base Upload</span>
        </CardTitle>
        <CardDescription className="text-purple-200 text-xs">
          {getStatusMessage()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-4 text-center">
          <input
            type="file"
            onChange={handleFileSelect}
            accept=".txt,.csv,.json,.pdf,.docx"
            className="hidden"
            id="lyra-knowledge-upload"
            disabled={uploadProgress === 'uploading'}
          />
          <label htmlFor="lyra-knowledge-upload" className="cursor-pointer">
            <div className="space-y-2">
              <FileText className="w-8 h-8 text-purple-400 mx-auto" />
              <p className="text-xs text-purple-200">
                Drop files here or click to browse
              </p>
              <p className="text-xs text-purple-300">
                TXT, CSV, JSON, PDF, DOCX up to 10MB
              </p>
            </div>
          </label>
        </div>

        {uploadedFile && (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-purple-900/20 rounded">
              <span className="text-xs text-purple-200 truncate">{uploadedFile.name}</span>
              <span className="text-xs text-purple-300">{(uploadedFile.size / 1024).toFixed(1)} KB</span>
            </div>
            <Button 
              onClick={handleUpload}
              disabled={uploadProgress === 'uploading' || uploadProgress === 'success'}
              className="w-full h-8 bg-purple-600 hover:bg-purple-700 text-white text-xs"
            >
              {uploadProgress === 'uploading' ? 'Adding to Knowledge...' : 'Add to Lyra\'s Knowledge'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
