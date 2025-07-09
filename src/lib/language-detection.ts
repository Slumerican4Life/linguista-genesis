/**
 * Language detection utilities for automatic target language detection
 */

export interface DetectedLanguage {
  code: string;
  name: string;
  flag: string;
  confidence: number;
}

// Language mappings with regional variants
const languageMappings: Record<string, { code: string; name: string; flag: string }> = {
  // English variants
  'en': { code: 'en', name: 'English', flag: '🇺🇸' },
  'en-US': { code: 'en', name: 'English', flag: '🇺🇸' },
  'en-GB': { code: 'en', name: 'English', flag: '🇬🇧' },
  'en-CA': { code: 'en', name: 'English', flag: '🇨🇦' },
  'en-AU': { code: 'en', name: 'English', flag: '🇦🇺' },
  
  // Spanish variants
  'es': { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  'es-ES': { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  'es-MX': { code: 'es', name: 'Spanish', flag: '🇲🇽' },
  'es-AR': { code: 'es', name: 'Spanish', flag: '🇦🇷' },
  
  // French variants
  'fr': { code: 'fr', name: 'French', flag: '🇫🇷' },
  'fr-FR': { code: 'fr', name: 'French', flag: '🇫🇷' },
  'fr-CA': { code: 'fr', name: 'French', flag: '🇨🇦' },
  
  // German variants
  'de': { code: 'de', name: 'German', flag: '🇩🇪' },
  'de-DE': { code: 'de', name: 'German', flag: '🇩🇪' },
  'de-AT': { code: 'de', name: 'German', flag: '🇦🇹' },
  'de-CH': { code: 'de', name: 'German', flag: '🇨🇭' },
  
  // Italian
  'it': { code: 'it', name: 'Italian', flag: '🇮🇹' },
  'it-IT': { code: 'it', name: 'Italian', flag: '🇮🇹' },
  
  // Portuguese variants
  'pt': { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  'pt-PT': { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  'pt-BR': { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  
  // Russian
  'ru': { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  'ru-RU': { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  
  // Japanese
  'ja': { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  'ja-JP': { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  
  // Korean
  'ko': { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  'ko-KR': { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  
  // Chinese variants
  'zh': { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  'zh-CN': { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  'zh-TW': { code: 'zh', name: 'Chinese', flag: '🇹🇼' },
  'zh-HK': { code: 'zh', name: 'Chinese', flag: '🇭🇰' },
  
  // Arabic
  'ar': { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  'ar-SA': { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  'ar-EG': { code: 'ar', name: 'Arabic', flag: '🇪🇬' },
  
  // Hindi
  'hi': { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  'hi-IN': { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  
  // Thai
  'th': { code: 'th', name: 'Thai', flag: '🇹🇭' },
  'th-TH': { code: 'th', name: 'Thai', flag: '🇹🇭' },
  
  // Dutch
  'nl': { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  'nl-NL': { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  'nl-BE': { code: 'nl', name: 'Dutch', flag: '🇧🇪' },
  
  // Swedish
  'sv': { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  'sv-SE': { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  
  // Norwegian
  'no': { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  'nb': { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  'nn': { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  
  // Danish
  'da': { code: 'da', name: 'Danish', flag: '🇩🇰' },
  'da-DK': { code: 'da', name: 'Danish', flag: '🇩🇰' },
  
  // Finnish
  'fi': { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  'fi-FI': { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  
  // Polish
  'pl': { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  'pl-PL': { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  
  // Turkish
  'tr': { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  'tr-TR': { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  
  // Vietnamese
  'vi': { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  'vi-VN': { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  
  // Indonesian
  'id': { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  'id-ID': { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
};

/**
 * Detects the user's browser language preferences
 */
export function detectBrowserLanguages(): DetectedLanguage[] {
  const detected: DetectedLanguage[] = [];
  
  // Get browser languages in order of preference
  const languages = navigator.languages || [navigator.language];
  
  languages.forEach((lang, index) => {
    // Calculate confidence based on position (first language has highest confidence)
    const confidence = Math.max(0.9 - (index * 0.1), 0.1);
    
    // Try exact match first
    if (languageMappings[lang]) {
      const mapping = languageMappings[lang];
      detected.push({
        ...mapping,
        confidence
      });
      return;
    }
    
    // Try base language (e.g., 'en' from 'en-US')
    const baseLang = lang.split('-')[0];
    if (languageMappings[baseLang]) {
      const mapping = languageMappings[baseLang];
      detected.push({
        ...mapping,
        confidence: confidence * 0.8 // Slightly lower confidence for base language match
      });
    }
  });
  
  // Remove duplicates and sort by confidence
  const unique = detected.filter((lang, index, self) => 
    index === self.findIndex(l => l.code === lang.code)
  );
  
  return unique.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Gets the primary detected language
 */
export function getPrimaryLanguage(): DetectedLanguage | null {
  const languages = detectBrowserLanguages();
  return languages.length > 0 ? languages[0] : null;
}

/**
 * Checks if auto-detection is supported
 */
export function isAutoDetectionSupported(): boolean {
  return typeof navigator !== 'undefined' && 
         !!(navigator.languages || navigator.language);
}

/**
 * Gets fallback language (English)
 */
export function getFallbackLanguage(): DetectedLanguage {
  return {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    confidence: 0.5
  };
}

/**
 * Auto-detects and suggests target languages
 */
export function autoDetectTargetLanguages(): string[] {
  if (!isAutoDetectionSupported()) {
    return ['en']; // Fallback to English
  }
  
  const detected = detectBrowserLanguages();
  
  // Take top 3 detected languages or fallback to English
  const suggestions = detected.slice(0, 3).map(lang => lang.code);
  
  // Always include English if not already present
  if (!suggestions.includes('en')) {
    suggestions.unshift('en');
  }
  
  return suggestions.slice(0, 3); // Limit to 3 languages
}

/**
 * Gets language display info for a language code
 */
export function getLanguageInfo(code: string): { name: string; flag: string } | null {
  const mapping = languageMappings[code];
  return mapping ? { name: mapping.name, flag: mapping.flag } : null;
}