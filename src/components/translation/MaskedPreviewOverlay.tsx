import React, { useState } from "react";
import { X, Globe, Languages, Eye, Zap, RefreshCw, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { WebsiteTranslationEditor } from './WebsiteTranslationEditor';

interface MaskedPreviewOverlayProps {
  url: string;
  languages: string[];
  defaultLanguage?: string;
  onClose: () => void;
  onConfirm?: () => void;
  isConfirming?: boolean;
}

// Mock translated content for demonstration
const getMockTranslatedContent = (language: string, originalText: string) => {
  const translations: Record<string, Record<string, string>> = {
    spanish: {
      "Welcome to our website": "Bienvenido a nuestro sitio web",
      "About Us": "Acerca de nosotros",
      "Contact": "Contacto",
      "Home": "Inicio",
      "Services": "Servicios",
      "Get Started": "Empezar",
      "Learn More": "Aprende más"
    },
    french: {
      "Welcome to our website": "Bienvenue sur notre site web",
      "About Us": "À propos de nous",
      "Contact": "Contact",
      "Home": "Accueil",
      "Services": "Services",
      "Get Started": "Commencer",
      "Learn More": "En savoir plus"
    },
    german: {
      "Welcome to our website": "Willkommen auf unserer Website",
      "About Us": "Über uns",
      "Contact": "Kontakt",
      "Home": "Startseite",
      "Services": "Dienstleistungen",
      "Get Started": "Loslegen",
      "Learn More": "Mehr erfahren"
    },
    japanese: {
      "Welcome to our website": "私たちのウェブサイトへようこそ",
      "About Us": "私たちについて",
      "Contact": "お問い合わせ",
      "Home": "ホーム",
      "Services": "サービス",
      "Get Started": "始める",
      "Learn More": "詳細を見る"
    }
  };

  return translations[language.toLowerCase()]?.[originalText] || `[${language.toUpperCase()}] ${originalText}`;
};

export const MaskedPreviewOverlay: React.FC<MaskedPreviewOverlayProps> = ({
  url,
  languages,
  defaultLanguage,
  onClose,
  onConfirm,
  isConfirming,
}) => {
  const [selectedLang, setSelectedLang] = useState<string>(
    defaultLanguage || (languages.length > 0 ? languages[0] : "spanish")
  );
  const [loading, setLoading] = useState(false);
  const [demonstrationMode, setDemonstrationMode] = useState(true);
  const [showEditor, setShowEditor] = useState(false);

  // Mock website content for demonstration
  const mockWebsiteContent = {
    title: "Welcome to our website",
    navigation: ["Home", "About Us", "Services", "Contact"],
    content: [
      "Welcome to our website",
      "We provide excellent services for your business needs.",
      "Get Started",
      "Learn More"
    ]
  };

  const translateContent = (text: string) => {
    return getMockTranslatedContent(selectedLang, text);
  };

  const handleRefresh = () => {
    setLoading(true);
    toast.success(`🔄 Refreshing ${selectedLang.toUpperCase()} translation...`);
    setTimeout(() => {
      setLoading(false);
      toast.success(`✨ ${selectedLang.toUpperCase()} translation updated!`);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900/95 to-black/95 border-2 border-purple-500/50 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-800/90 to-blue-800/90 rounded-t-xl border-b border-purple-500/50">
          <div className="flex items-center gap-3 text-purple-100">
            <Globe className="w-6 h-6 animate-pulse" />
            <div>
              <h2 className="font-bold text-xl">Live Translation Preview</h2>
              <p className="text-sm text-purple-200">{onConfirm ? "Confirm your project details below" : "Real-time website translation demonstration"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="w-5 h-5 text-purple-200" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-6 py-3 bg-black/40 border-b border-purple-800/50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-purple-300" />
              <select
                className="bg-purple-950/80 text-purple-200 py-2 px-3 rounded-lg text-sm border border-purple-700/50 focus:border-purple-500"
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-purple-300 bg-purple-900/50 px-3 py-1 rounded-full">
              <Zap className="w-4 h-4 inline mr-1" />
              Neural AI Translation Active
            </div>
            <Button
              size="sm"
              onClick={() => setShowEditor(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Translation
            </Button>
          </div>
          <div className="text-xs text-purple-400 font-mono">
            Source: {url}
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-purple-200 animate-pulse">Translating website content...</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8 h-full">
              {/* Original Version */}
              <Card className="bg-black/60 border-purple-700/50 h-full flex flex-col">
                <div className="p-4 border-b border-purple-700/50 bg-purple-900/20">
                  <h3 className="font-semibold text-purple-100 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Original Website Preview
                  </h3>
                </div>
                <div className="p-1 flex-1 bg-white">
                  <iframe
                    src={url}
                    title="Original Website Preview"
                    className="w-full h-full border-0 rounded-b-md"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </Card>

              {/* Translated Version */}
              <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/50 h-full flex flex-col">
                <div className="p-4 border-b border-green-500/50 bg-green-900/20">
                  <h3 className="font-semibold text-green-100 flex items-center gap-2">
                    <Zap className="w-4 h-4 animate-pulse" />
                    Translated Demo ({selectedLang.charAt(0).toUpperCase() + selectedLang.slice(1)})
                  </h3>
                </div>
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                  {/* Translated Mock Website Layout */}
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-white animate-pulse">
                      {translateContent(mockWebsiteContent.title)}
                    </h1>
                    
                    <nav className="flex space-x-6">
                      {mockWebsiteContent.navigation.map((item, i) => (
                        <a key={i} href="#" className="text-green-400 hover:text-green-300 transition-colors animate-pulse" style={{animationDelay: `${i * 100}ms`}}>
                          {translateContent(item)}
                        </a>
                      ))}
                    </nav>
                    
                    <div className="space-y-4 pt-4">
                      {mockWebsiteContent.content.map((text, i) => (
                        <div key={i} className={`
                          ${i === 0 ? 'text-xl text-white animate-pulse' : ''}
                          ${i === 1 ? 'text-gray-300 animate-pulse' : ''}
                          ${i >= 2 ? 'inline-block bg-green-600 text-white px-4 py-2 rounded-lg mr-2 animate-pulse' : ''}
                        `} style={{animationDelay: `${i * 150}ms`}}>
                          {translateContent(text)}
                        </div>
                      ))}
                    </div>
                  </div>
                   <div className="text-center text-xs text-purple-300 pt-4 mt-auto border-t border-purple-700/30">
                    This is a demonstration of translation quality on sample text. Your actual website content will be translated like this.
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-black/40 border-t border-purple-800/50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-purple-300">
              <Eye className="w-4 h-4 inline mr-1" />
              {onConfirm ? "Preview of your website translation" : "Live demonstration of AI-powered website translation"}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-purple-400">
                Translation Engine: Neuronix AI v2.0
              </span>
              {onConfirm && (
                <Button
                  onClick={onConfirm}
                  disabled={isConfirming}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isConfirming ? "Deploying..." : "Confirm & Create Project"}
                </Button>
              )}
              <Button 
                onClick={onClose}
                variant={onConfirm ? "outline" : "default"}
                className={!onConfirm ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" : ""}
              >
                {onConfirm ? "Cancel" : "Close Preview"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Website Translation Editor */}
      {showEditor && (
        <WebsiteTranslationEditor
          projectId="demo-project"
          websiteUrl={url}
          targetLanguage={selectedLang}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};
