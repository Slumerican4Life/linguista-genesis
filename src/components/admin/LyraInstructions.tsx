
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Save, X, Brain } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Instruction {
  id: string;
  title: string;
  content: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

export const LyraInstructions = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newInstruction, setNewInstruction] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const queryClient = useQueryClient();

  // Fetch instructions directly from the table
  const { data: instructions, isLoading } = useQuery({
    queryKey: ['lyra-instructions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lyra_instructions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Instruction[];
    },
  });

  // Create instruction mutation
  const createInstruction = useMutation({
    mutationFn: async (instruction: typeof newInstruction) => {
      const { error } = await supabase
        .from('lyra_instructions')
        .insert([instruction]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lyra-instructions'] });
      setNewInstruction({ title: '', content: '', category: 'general' });
      setIsCreating(false);
      toast.success('Instruction added to Lyra\'s knowledge base');
    },
    onError: (error) => {
      toast.error(`Failed to create instruction: ${error.message}`);
    },
  });

  // Update instruction mutation
  const updateInstruction = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Instruction> }) => {
      const { error } = await supabase
        .from('lyra_instructions')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lyra-instructions'] });
      setEditingId(null);
      toast.success('Instruction updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update instruction: ${error.message}`);
    },
  });

  // Delete instruction mutation
  const deleteInstruction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lyra_instructions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lyra-instructions'] });
      toast.success('Instruction removed from Lyra\'s knowledge base');
    },
    onError: (error) => {
      toast.error(`Failed to delete instruction: ${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!newInstruction.title.trim() || !newInstruction.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    createInstruction.mutate(newInstruction);
  };

  const handleToggleActive = (instruction: Instruction) => {
    updateInstruction.mutate({
      id: instruction.id,
      updates: { is_active: !instruction.is_active }
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'behavior': return 'bg-purple-600';
      case 'knowledge': return 'bg-blue-600';
      case 'interaction': return 'bg-green-600';
      case 'platform': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  if (isLoading) return <div className="text-purple-400">Loading Lyra's instructions...</div>;

  return (
    <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-purple-100 flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span>Lyra's Instructions & Knowledge</span>
        </CardTitle>
        <CardDescription className="text-purple-200">
          Configure Lyra's behavior, knowledge, and interaction guidelines. She has full access to all these instructions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create new instruction */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-purple-100">Custom Instructions</h4>
            <Button
              onClick={() => setIsCreating(!isCreating)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Instruction
            </Button>
          </div>

          {isCreating && (
            <Card className="border border-purple-500/30 bg-purple-900/20">
              <CardContent className="p-4 space-y-4">
                <Input
                  placeholder="Instruction title..."
                  value={newInstruction.title}
                  onChange={(e) => setNewInstruction({ ...newInstruction, title: e.target.value })}
                  className="bg-black/50 border-purple-500/30 text-white"
                />
                <Select
                  value={newInstruction.category}
                  onValueChange={(value) => setNewInstruction({ ...newInstruction, category: value })}
                >
                  <SelectTrigger className="bg-black/50 border-purple-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="behavior">Behavior</SelectItem>
                    <SelectItem value="knowledge">Knowledge</SelectItem>
                    <SelectItem value="interaction">User Interaction</SelectItem>
                    <SelectItem value="platform">Platform Rules</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Detailed instructions for Lyra..."
                  value={newInstruction.content}
                  onChange={(e) => setNewInstruction({ ...newInstruction, content: e.target.value })}
                  className="min-h-[100px] bg-black/50 border-purple-500/30 text-white"
                />
                <div className="flex space-x-2">
                  <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Instruction
                  </Button>
                  <Button
                    onClick={() => setIsCreating(false)}
                    variant="outline"
                    className="border-gray-500 text-gray-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Instructions list */}
        <div className="space-y-3">
          {instructions && instructions.length > 0 ? (
            instructions.map((instruction) => (
              <Card key={instruction.id} className="border border-purple-500/30 bg-purple-900/10">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <h5 className="font-medium text-white">{instruction.title}</h5>
                        <Badge className={`text-white text-xs ${getCategoryColor(instruction.category)}`}>
                          {instruction.category}
                        </Badge>
                        <Badge
                          variant={instruction.is_active ? 'default' : 'secondary'}
                          className={instruction.is_active ? 'bg-green-600 text-white' : ''}
                        >
                          {instruction.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-purple-200 text-sm leading-relaxed">{instruction.content}</p>
                      <p className="text-xs text-purple-400">
                        Created: {new Date(instruction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        onClick={() => handleToggleActive(instruction)}
                        size="sm"
                        variant="outline"
                        className="border-purple-400/50 text-purple-300 hover:bg-purple-900/30"
                      >
                        {instruction.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        onClick={() => deleteInstruction.mutate(instruction.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-400/50 text-red-300 hover:bg-red-900/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border border-dashed border-purple-500/30 bg-purple-900/10">
              <CardContent className="p-8 text-center">
                <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h4 className="text-purple-200 font-medium mb-2">No Custom Instructions</h4>
                <p className="text-purple-300 text-sm">
                  Add instructions to customize Lyra's behavior and knowledge.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
