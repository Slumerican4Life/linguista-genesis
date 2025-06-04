
import React from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Plus, Globe } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onLanguageChange: (languages: string[]) => void;
}

const popularLanguages = [
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
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' }
];

const allLanguages = [
  ...popularLanguages,
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

  const displayLanguages = showAll ? allLanguages : popularLanguages;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold flex items-center space-x-2">
          <Globe className="w-4 h-4" />
          <span>Target Languages ({selectedLanguages.length}/40)</span>
        </Label>
        <div className="flex space-x-2">
          {selectedLanguages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={addPopular}>
            <Plus className="w-3 h-3 mr-1" />
            Add Popular
          </Button>
        </div>
      </div>

      {/* Selected Languages */}
      {selectedLanguages.length > 0 && (
        <Card className="border-2 border-ai-blue-200 bg-ai-blue-50">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {selectedLanguages.map(langCode => {
                const lang = allLanguages.find(l => l.code === langCode);
                return (
                  <Badge
                    key={langCode}
                    variant="secondary"
                    className="bg-ai-blue-100 text-ai-blue-800 hover:bg-ai-blue-200 cursor-pointer pr-1"
                    onClick={() => toggleLanguage(langCode)}
                  >
                    <span className="mr-1">{lang?.flag}</span>
                    {lang?.name}
                    <X className="w-3 h-3 ml-1 hover:text-red-600" />
                  </Badge>
                );
              })}
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
              className={`justify-start h-10 ${
                selectedLanguages.includes(lang.code)
                  ? 'bg-ai-blue-500 hover:bg-ai-blue-600 text-white'
                  : 'hover:bg-ai-blue-50'
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
            className="text-ai-blue-600 hover:text-ai-blue-700"
          >
            {showAll ? 'Show Less Languages' : `Show All ${allLanguages.length} Languages`}
          </Button>
        </div>
      </div>
    </div>
  );
};
