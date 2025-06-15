
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const KnowledgeBaseList = () => {
  // Fetch knowledge files
  const { data: files, isLoading } = useQuery({
    queryKey: ["knowledge-files"],
    queryFn: async () => {
      const { data, error } = await supabase.from("knowledge_files").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-xs text-purple-400">Loading knowledge base...</p>;

  return (
    <div className="mt-4">
      <h5 className="text-sm text-purple-200 font-bold mb-2">Lyra Knowledge Base</h5>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {files && files.length > 0 ? (
          files.map((file: any) => (
            <div key={file.id} className="flex items-center justify-between px-3 py-2 bg-purple-950/50 rounded-lg text-xs shadow-md border border-purple-800/50 hover:bg-purple-950/80 transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
              <span className="truncate text-purple-100 font-medium">{file.file_name}</span>
              <div className="flex items-center space-x-3 shrink-0 ml-4">
                <span className="text-purple-300">{(file.file_size/1024).toFixed(1)} KB</span>
                <Badge className={`ml-2 text-xs ${file.is_active ? "bg-green-600 text-white" : "bg-gray-700 text-purple-200"}`}>
                  {file.is_active ? "Active":"Inactive"}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 border border-dashed border-purple-800/50 rounded-lg">
            <span className="text-purple-400 text-sm font-medium">No knowledge yet</span>
            <p className="text-xs text-purple-500 mt-1">Upload files to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseList;
