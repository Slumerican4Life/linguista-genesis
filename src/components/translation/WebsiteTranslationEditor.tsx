import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Edit3, 
  Save, 
  Globe, 
  BookOpen, 
  Sparkles, 
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface WebsiteSection {
  id: string;
  element: string;
  originalText: string;
  translatedText: string;
  isEditing: boolean;
  alternatives?: string[];
  confidence?: number;
}

interface WebsiteTranslationEditorProps {
  projectId: string;
  websiteUrl: string;
  targetLanguage: string;
  onClose: () => void;
}

const LEGAL_DISCLAIMER = `
⚠️ AI EXPERIMENTATION NOTICE ⚠️

This translation service uses experimental AI technology and may contain inaccuracies. 
By using this service, you acknowledge that:

• Translations are AI-generated and may not be 100% accurate
• Cultural context and slang interpretation is experimental
• Results should be reviewed by human translators for critical content
• We provide a 50% money-back guarantee for paid subscriptions
• Use at your own discretion for business-critical applications

See our Terms of Service for full legal disclaimers.
`;

export const WebsiteTranslationEditor: React.FC<WebsiteTranslationEditorProps> = ({
  projectId,
  websiteUrl,
  targetLanguage,
  onClose
}) => {
  const [sections, setSections] = useState<WebsiteSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [dictionaryData, setDictionaryData] = useState<any>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Mock data - replace with real data from Supabase
  useEffect(() => {
    loadWebsiteSections();
  }, [projectId]);

  const loadWebsiteSections = async () => {
    setIsLoading(true);
    try {
      // In production, fetch real website sections from Supabase
      // For now, using mock data to demonstrate functionality
      const mockSections: WebsiteSection[] = [
        {
          id: '1',
          element: 'header-title',
          originalText: 'Welcome to Our Store',
          translatedText: 'Bienvenido a Nuestra Tienda',
          isEditing: false,
          alternatives: ['Bienvenidos a Nuestra Tienda', 'Te damos la bienvenida a nuestra tienda'],
          confidence: 95
        },
        {
          id: '2',
          element: 'nav-menu',
          originalText: 'Shop Now',
          translatedText: 'Compra Ahora',
          isEditing: false,
          alternatives: ['Comprar Ahora', 'Ir de Compras'],
          confidence: 92
        },
        {
          id: '3',
          element: 'product-description',
          originalText: 'This awesome product will change your life!',
          translatedText: 'Este producto increíble cambiará tu vida!',
          isEditing: false,
          alternatives: ['Este producto genial transformará tu vida!', 'Este fantástico producto revolucionará tu vida!'],
          confidence: 88
        },
        {
          id: '4',
          element: 'footer-contact',
          originalText: 'Get in touch with us',
          translatedText: 'Ponte en contacto con nosotros',
          isEditing: false,
          alternatives: ['Contáctanos', 'Comunícate con nosotros'],
          confidence: 94
        }
      ];
      
      setSections(mockSections);
    } catch (error) {
      console.error('Error loading website sections:', error);
      toast.error('Failed to load website content');
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceWithDictionary = async (text: string, sectionId: string) => {
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-translation', {
        body: {
          originalText: text,
          targetLanguage,
          includeUrbanDictionary: true,
          includeSlang: true,
          contextualReferences: true
        }
      });

      if (error) throw error;

      setSections(prev => prev.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              alternatives: data.alternatives || section.alternatives,
              translatedText: data.enhancedTranslation || section.translatedText
            }
          : section
      ));

      setDictionaryData(data.dictionaryContext);
      toast.success('Translation enhanced with contextual references!');
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error('Failed to enhance translation');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleEdit = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isEditing: true }
        : { ...section, isEditing: false }
    ));
    setSelectedSection(sectionId);
  };

  const handleSave = async (sectionId: string, newText: string) => {
    setIsSaving(true);
    try {
      // Save to Supabase
      setSections(prev => prev.map(section => 
        section.id === sectionId 
          ? { ...section, translatedText: newText, isEditing: false }
          : section
      ));
      
      toast.success('Translation updated successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isEditing: false }
        : section
    ));
    setSelectedSection(null);
  };

  const handleUseAlternative = (sectionId: string, alternative: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, translatedText: alternative }
        : section
    ));
  };

  const filteredSections = sections.filter(section =>
    section.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.translatedText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.element.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'bg-gray-500';
    if (confidence >= 95) return 'bg-green-500';
    if (confidence >= 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[90vh] bg-gradient-to-br from-black/90 to-purple-900/20 border-purple-500/30">
        <CardHeader className="border-b border-purple-500/30 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-purple-100 flex items-center space-x-2">
                <Globe className="w-6 h-6" />
                <span>Website Translation Editor</span>
              </CardTitle>
              <p className="text-purple-300 mt-1">{websiteUrl} → {targetLanguage.toUpperCase()}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="border-purple-500/50"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
              <Button variant="ghost" onClick={onClose} className="text-purple-300">
                ✕
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <Input
              placeholder="Search website elements, original text, or translations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/50 border-purple-500/50 text-white"
            />
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Translation Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-purple-200 flex items-center space-x-2">
                  <Edit3 className="w-5 h-5" />
                  <span>Website Elements ({filteredSections.length})</span>
                </h3>
                <Badge variant="outline" className="border-blue-500 text-blue-300">
                  Live Editor
                </Badge>
              </div>

              <ScrollArea className="h-[60vh]">
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
                      <p className="text-purple-300 mt-2">Loading website content...</p>
                    </div>
                  ) : (
                    filteredSections.map((section) => (
                      <Card key={section.id} className="border-purple-500/30 bg-black/40">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Element Info */}
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {section.element}
                              </Badge>
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${getConfidenceColor(section.confidence)}`} />
                                <span className="text-xs text-gray-400">{section.confidence}%</span>
                              </div>
                            </div>

                            {/* Original Text */}
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Original:</p>
                              <p className="text-white bg-gray-800/50 p-2 rounded text-sm">
                                {section.originalText}
                              </p>
                            </div>

                            {/* Translation */}
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Translation:</p>
                              {section.isEditing ? (
                                <div className="space-y-2">
                                  <Textarea
                                    defaultValue={section.translatedText}
                                    className="bg-black/50 border-purple-500/50 text-white"
                                    rows={2}
                                    id={`edit-${section.id}`}
                                  />
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        const textarea = document.getElementById(`edit-${section.id}`) as HTMLTextAreaElement;
                                        handleSave(section.id, textarea.value);
                                      }}
                                      disabled={isSaving}
                                    >
                                      <Save className="w-3 h-3 mr-1" />
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCancel(section.id)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-purple-200 bg-purple-900/30 p-2 rounded text-sm">
                                    {section.translatedText}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEdit(section.id)}
                                      className="border-purple-500/50"
                                    >
                                      <Edit3 className="w-3 h-3 mr-1" />
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => enhanceWithDictionary(section.originalText, section.id)}
                                      disabled={isEnhancing}
                                      className="border-blue-500/50"
                                    >
                                      <BookOpen className="w-3 h-3 mr-1" />
                                      Enhance
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Alternatives */}
                            {section.alternatives && section.alternatives.length > 0 && (
                              <div>
                                <p className="text-sm text-gray-400 mb-2">Alternative translations:</p>
                                <div className="space-y-1">
                                  {section.alternatives.map((alt, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between bg-gray-800/30 p-2 rounded text-sm cursor-pointer hover:bg-gray-700/30"
                                      onClick={() => handleUseAlternative(section.id, alt)}
                                    >
                                      <span className="text-gray-300">{alt}</span>
                                      <Button size="sm" variant="ghost" className="h-6 px-2">
                                        Use
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Preview Panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-purple-200 flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Live Preview</span>
                </h3>
                {showPreview && (
                  <Badge variant="outline" className="border-green-500 text-green-300">
                    Real-time
                  </Badge>
                )}
              </div>

              {showPreview ? (
                <Card className="border-purple-500/30 bg-black/40 h-[60vh]">
                  <CardContent className="p-4 h-full">
                    <iframe
                      src={`/api/preview?projectId=${projectId}&lang=${targetLanguage}`}
                      className="w-full h-full border-0 rounded"
                      title="Translation Preview"
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-purple-500/30 bg-black/40 h-[60vh] flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Click "Show Preview" to see your translated website</p>
                  </div>
                </Card>
              )}

              {/* Dictionary Context */}
              {dictionaryData && (
                <Card className="border-blue-500/30 bg-blue-900/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-blue-200 flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Dictionary Context</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-blue-100">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(dictionaryData, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Legal Disclaimer */}
          <Separator className="my-6 bg-purple-500/30" />
          
          <Alert className="border-yellow-500/50 bg-yellow-900/20">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-100 text-xs">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="link" className="h-auto p-0 text-yellow-300 underline">
                    ⚠️ AI Experimentation & Legal Notice - 50% Money Back Guarantee
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle className="text-red-400">Legal Disclaimer & Terms</SheetTitle>
                    <SheetDescription>
                      Please read these important terms before using our AI translation service.
                    </SheetDescription>
                  </SheetHeader>
                  <ScrollArea className="h-[80vh] mt-4">
                    <div className="space-y-4 text-sm">
                      <pre className="whitespace-pre-wrap text-gray-300">{LEGAL_DISCLAIMER}</pre>
                      
                      <div className="mt-6 p-4 bg-green-900/20 border border-green-500/50 rounded">
                        <h4 className="text-green-400 font-semibold mb-2">50% Money Back Guarantee</h4>
                        <p className="text-green-200 text-xs">
                          If you're not satisfied with our AI translation service within 30 days, 
                          we'll refund 50% of your subscription fee. This promotes moving forward 
                          with experimental AI technology while acknowledging its current limitations.
                        </p>
                      </div>

                      <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/50 rounded">
                        <h4 className="text-blue-400 font-semibold mb-2">Quality Assurance</h4>
                        <p className="text-blue-200 text-xs">
                          Our AI agents use advanced dictionary APIs including Urban Dictionary 
                          for contextual and cultural translations. However, human review is 
                          recommended for business-critical content.
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};