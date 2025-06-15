
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
      <h5 className="text-sm text-purple-200 font-bold mb-1">Lyra Knowledge Base</h5>
      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
        {files && files.length > 0 ? (
          files.map((file: any) => (
            <div key={file.id} className="flex items-center justify-between px-2 py-1 bg-purple-950/40 rounded text-xs">
              <span className="truncate text-purple-100">{file.file_name}</span>
              <span className="ml-3 text-purple-300">{(file.file_size/1024).toFixed(1)} KB</span>
              <Badge className={`ml-2 ${file.is_active ? "bg-purple-700 text-white" : "bg-gray-700 text-purple-200"}`}>
                {file.is_active ? "Active":"Inactive"}
              </Badge>
            </div>
          ))
        ) : (
          <span className="text-purple-500">No knowledge yet</span>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseList;
