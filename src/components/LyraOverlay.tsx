
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageCircle, X, Send, Upload, FileText } from 'lucide-react';
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
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Lyra, your AI assistant for Linguista. I can help you with translations, language questions, and platform guidance. How can I assist you today?",
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

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-400"
        >
          <Bot className="w-6 h-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="border border-purple-500/30 bg-black/95 backdrop-blur-lg shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-purple-700 to-blue-700 rounded-t-lg border-b border-purple-500/30 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">Lyra</CardTitle>
                <CardDescription className="text-purple-200 text-sm">
                  Your AI Translation Assistant
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsKnowledgeOpen(!isKnowledgeOpen)}
                size="sm"
                variant="outline"
                className="border-purple-400 text-purple-200 hover:bg-purple-900/20"
              >
                <Upload className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                size="sm"
                variant="ghost"
                className="text-purple-200 hover:bg-purple-900/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Badge className="w-fit bg-green-600 text-white text-xs">
            <div className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse" />
            Online & Ready
          </Badge>
        </CardHeader>

        {isKnowledgeOpen && (
          <div className="p-4 border-b border-purple-500/30">
            <LyraKnowledgeUpload />
          </div>
        )}

        <CardContent className="p-0">
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-black/50 to-purple-900/20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-blue-900/50 text-blue-100 border border-blue-500/30'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-blue-900/50 border border-blue-500/30 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-blue-200 text-xs">Lyra is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-purple-500/30 bg-black/80">
            <div className="flex space-x-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Lyra about translations, languages, or platform features..."
                className="flex-1 min-h-[2.5rem] max-h-24 bg-purple-900/20 border-purple-500/30 text-white placeholder:text-purple-300 resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
