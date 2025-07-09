
import React from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Plus, Globe, Zap, Eye, AlertCircle } from 'lucide-react';
import { 
  detectBrowserLanguages, 
  autoDetectTargetLanguages, 
  isAutoDetectionSupported,
  getPrimaryLanguage 
} from '@/lib/language-detection';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onLanguageChange: (languages: string[]) => void;
}

const popularLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
];

const allLanguages = [
  ...popularLanguages,
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'ta', name: 'Tamil', flag: '🇱🇰' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' }
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguages,
  onLanguageChange
}) => {
  const [showAll, setShowAll] = React.useState(false);
  const [showAutoDetection, setShowAutoDetection] = React.useState(false);
  
  // Auto-detection capabilities
  const isAutoSupported = isAutoDetectionSupported();
  const detectedLanguages = React.useMemo(() => {
    return isAutoSupported ? detectBrowserLanguages() : [];
  }, [isAutoSupported]);
  const primaryLanguage = getPrimaryLanguage();
  
  const toggleLanguage = (langCode: string) => {
    if (selectedLanguages.includes(langCode)) {
      onLanguageChange(selectedLanguages.filter(l => l !== langCode));
    } else {
      onLanguageChange([...selectedLanguages, langCode]);
    }
  };

  const clearAll = () => {
    onLanguageChange([]);
  };

  const addPopular = () => {
    const popular = popularLanguages.slice(0, 6).map(l => l.code);
    const newLanguages = [...new Set([...selectedLanguages, ...popular])];
    onLanguageChange(newLanguages);
  };

  const addAutoDetected = () => {
    const autoLanguages = autoDetectTargetLanguages();
    const newLanguages = [...new Set([...selectedLanguages, ...autoLanguages])];
    onLanguageChange(newLanguages);
  };

  const displayLanguages = showAll ? allLanguages : popularLanguages;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold flex items-center space-x-2">
          <Globe className="w-4 h-4" />
          <span>Target Languages ({selectedLanguages.length}/40)</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {selectedLanguages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={addPopular}>
            <Plus className="w-3 h-3 mr-1" />
            Add Popular
          </Button>
          {isAutoSupported && (
            <Button variant="outline" size="sm" onClick={addAutoDetected} className="bg-gradient-to-r from-primary/10 to-secondary/10">
              <Zap className="w-3 h-3 mr-1" />
              Auto-Detect
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAutoDetection(!showAutoDetection)}
            className="text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            {showAutoDetection ? 'Hide' : 'Show'} Detection
          </Button>
        </div>
      </div>

      {/* Selected Languages */}
      {selectedLanguages.length > 0 && (
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {selectedLanguages.map(langCode => {
                const lang = allLanguages.find(l => l.code === langCode);
                return (
                  <Badge
                    key={langCode}
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer pr-1 transition-colors"
                    onClick={() => toggleLanguage(langCode)}
                  >
                    <span className="mr-1">{lang?.flag}</span>
                    {lang?.name}
                    <X className="w-3 h-3 ml-1 hover:text-destructive transition-colors" />
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-Detection Info */}
      {showAutoDetection && (
        <Card className="border border-muted bg-muted/5">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-primary" />
                <Label className="text-sm font-medium">Auto-Detection Results</Label>
              </div>
              
              {isAutoSupported ? (
                <div className="space-y-2">
                  {primaryLanguage && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Badge variant="outline" className="bg-primary/10">
                        <span className="mr-1">{primaryLanguage.flag}</span>
                        {primaryLanguage.name}
                        <span className="ml-1 text-xs opacity-70">
                          ({Math.round(primaryLanguage.confidence * 100)}%)
                        </span>
                      </Badge>
                      <span className="text-muted-foreground">Primary detected language</span>
                    </div>
                  )}
                  
                  {detectedLanguages.length > 1 && (
                    <div className="text-xs text-muted-foreground">
                      Other detected: {detectedLanguages.slice(1, 3).map(lang => 
                        `${lang.flag} ${lang.name}`
                      ).join(', ')}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Auto-detection reads your browser's language preferences to suggest relevant target languages.
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  <span>Auto-detection not supported in this browser</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Languages */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {displayLanguages.map(lang => (
            <Button
              key={lang.code}
              variant={selectedLanguages.includes(lang.code) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLanguage(lang.code)}
              className={`justify-start h-10 transition-colors ${
                selectedLanguages.includes(lang.code)
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
              disabled={selectedLanguages.length >= 40 && !selectedLanguages.includes(lang.code)}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </Button>
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            {showAll ? 'Show Less Languages' : `Show All ${allLanguages.length} Languages`}
          </Button>
        </div>
      </div>
    </div>
  );
};
