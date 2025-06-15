import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageCircle, X, Send, Upload, FileText, Minimize2, Maximize2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LyraKnowledgeUpload } from './LyraKnowledgeUpload';
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'lyra';
  timestamp: Date;
}

export const LyraOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Lyra, your AI assistant powered by Neuronix brain technology. I can help you with translations, language questions, platform guidance, and accessing our knowledge base. How can I assist you today?",
      sender: 'lyra',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('lyra-chat', {
        body: {
          message: inputMessage,
          conversationHistory: messages.slice(-5).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          }))
        }
      });

      if (error) throw error;

      const lyraMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'lyra',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, lyraMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message to Lyra');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'lyra',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setIsKnowledgeOpen(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Change: reposition the main launcher button so it won't block Lyra or chat overlay
  if (!isOpen) {
    return (
      <div className="fixed bottom-8 right-8 z-50" style={{ pointerEvents: "all" }}>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 border-2 border-purple-400/50 backdrop-blur-sm relative overflow-hidden group"
          style={{ boxShadow: "0 6px 28px 6px rgba(100,0,150,0.20)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 flex flex-col items-center">
            <Bot className="w-7 h-7 text-white mb-1" />
            <span className="text-xs font-bold text-white">Lyra</span>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]" style={{ pointerEvents: "auto" }}>
      <Card className={`border border-purple-500/30 bg-black/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-auto'
      }`}>
        <CardHeader className="bg-gradient-to-r from-purple-700/90 via-blue-700/90 to-indigo-700/90 rounded-t-lg border-b border-purple-500/30 pb-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-lg font-bold">Lyra</CardTitle>
                <CardDescription className="text-purple-200 text-sm font-medium">
                  Neuronix AI Assistant
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isMinimized && (
                <Button
                  onClick={() => setIsKnowledgeOpen(!isKnowledgeOpen)}
                  size="sm"
                  variant="outline"
                  className="border-purple-400/50 text-purple-200 hover:bg-purple-900/30 bg-transparent"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={handleMinimize}
                size="sm"
                variant="ghost"
                className="text-purple-200 hover:bg-purple-900/30"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                onClick={handleClose}
                size="sm"
                variant="ghost"
                className="text-purple-200 hover:bg-red-900/30 hover:text-red-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {!isMinimized && (
            <div className="flex items-center space-x-2 mt-2 relative z-10">
              <Badge className="bg-green-600/80 text-white text-xs font-bold backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse" />
                Neural Network Active
              </Badge>
              <Badge className="bg-blue-600/80 text-white text-xs font-bold backdrop-blur-sm">
                <span className="text-xs">🧠</span>
                <span className="ml-1">Neuronix Core</span>
              </Badge>
            </div>
          )}
        </CardHeader>

        {!isMinimized && (
          <>
            {isKnowledgeOpen && (
              <div className="p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                <div className="mb-3">
                  <h4 className="text-white font-semibold mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-purple-400" />
                    Knowledge Base Upload
                  </h4>
                  <p className="text-xs text-purple-300">Upload files to enhance Lyra's knowledge and translation capabilities</p>
                </div>
                {/* Show book upload with live progress */}
                <LyraKnowledgeUpload />
                {/* --- Add visible knowledge base list --- */}
                <KnowledgeBaseList />
              </div>
            )}

            <CardContent className="p-0">
              <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-black/60 via-purple-900/10 to-blue-900/10 backdrop-blur-sm">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-4 backdrop-blur-sm ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-purple-600/90 to-blue-600/90 text-white border border-purple-400/30'
                          : 'bg-gradient-to-r from-blue-900/60 to-indigo-900/60 text-blue-100 border border-blue-500/30'
                      } shadow-lg`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                      <p className="text-xs opacity-70 mt-2 font-medium">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/30 rounded-xl p-4 max-w-[85%] backdrop-blur-sm shadow-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <span className="text-blue-200 text-xs font-medium">Lyra is thinking...</span>
                        <span className="text-xs">🧠</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-purple-500/30 bg-gradient-to-r from-black/80 to-purple-900/20 backdrop-blur-sm">
                <div className="flex space-x-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Lyra about translations, features, or upload knowledge..."
                    className="flex-1 min-h-[2.5rem] max-h-24 bg-purple-900/30 border-purple-500/30 text-white placeholder:text-purple-300 resize-none focus:border-purple-400/50 backdrop-blur-sm"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

// Helper component, shown in the Lyra overlay for non-admins.
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
          files.map(file => (
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
