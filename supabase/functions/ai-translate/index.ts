
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DictionaryEntry {
  word: string;
  definitions: string[];
  examples: string[];
  synonyms: string[];
}

interface TranslationContext {
  domain: string;
  tone: string;
  cultural_context: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, targetLanguages, tone = 'natural', context = {} } = await req.json()
    
    // Get all API keys from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const dictionaryApiKey = Deno.env.get('DICTIONARY_API_KEY')
    const merriamWebsterKey = Deno.env.get('MERRIAM_WEBSTER_API_KEY')
    const oxfordApiKey = Deno.env.get('OXFORD_DICTIONARY_API_KEY')
    const lingueeApiKey = Deno.env.get('LINGUEE_API_KEY')
    const reversoApiKey = Deno.env.get('REVERSO_API_KEY')
    const deepLApiKey = Deno.env.get('DEEPL_API_KEY')
    const googleTranslateKey = Deno.env.get('GOOGLE_TRANSLATE_API_KEY')
    const azureTranslateKey = Deno.env.get('AZURE_TRANSLATE_API_KEY')

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', '') || '')
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const wordCount = text.split(' ').length
    const translations: Record<string, string> = {}

    // Enhanced dictionary lookup function
    const getDictionaryContext = async (word: string): Promise<DictionaryEntry | null> => {
      try {
        // Try multiple dictionary APIs for better context
        const dictionaries = [
          { key: dictionaryApiKey, url: `https://api.dictionaryapi.dev/api/v2/entries/en/${word}` },
          { key: merriamWebsterKey, url: `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${merriamWebsterKey}` },
          { key: oxfordApiKey, url: `https://od-api.oxforddictionaries.com/api/v2/entries/en-us/${word}` }
        ];

        for (const dict of dictionaries) {
          if (!dict.key) continue;
          
          try {
            const response = await fetch(dict.url, {
              headers: dict.key === oxfordApiKey ? {
                'app_id': 'your_app_id',
                'app_key': dict.key
              } : {}
            });
            
            if (response.ok) {
              const data = await response.json();
              return {
                word,
                definitions: data[0]?.meanings?.[0]?.definitions?.map((d: any) => d.definition) || [],
                examples: data[0]?.meanings?.[0]?.definitions?.map((d: any) => d.example).filter(Boolean) || [],
                synonyms: data[0]?.meanings?.[0]?.synonyms || []
              };
            }
          } catch (e) {
            console.warn(`Dictionary API ${dict.url} failed:`, e);
          }
        }
        return null;
      } catch (error) {
        console.warn('Dictionary lookup failed:', error);
        return null;
      }
    };

    // Enhanced translation with multiple API fallbacks
    const translateWithAPIs = async (text: string, targetLang: string): Promise<string> => {
      const translationServices = [
        {
          name: 'DeepL',
          key: deepLApiKey,
          translate: async () => {
            if (!deepLApiKey) return null;
            const response = await fetch('https://api-free.deepl.com/v2/translate', {
              method: 'POST',
              headers: {
                'Authorization': `DeepL-Auth-Key ${deepLApiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: `text=${encodeURIComponent(text)}&target_lang=${targetLang.toUpperCase()}`
            });
            if (response.ok) {
              const data = await response.json();
              return data.translations[0]?.text;
            }
            return null;
          }
        },
        {
          name: 'Google Translate',
          key: googleTranslateKey,
          translate: async () => {
            if (!googleTranslateKey) return null;
            const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${googleTranslateKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                q: text,
                target: targetLang,
                source: 'en'
              })
            });
            if (response.ok) {
              const data = await response.json();
              return data.data?.translations[0]?.translatedText;
            }
            return null;
          }
        }
      ];

      // Try each translation service
      for (const service of translationServices) {
        try {
          const result = await service.translate();
          if (result) return result;
        } catch (e) {
          console.warn(`${service.name} translation failed:`, e);
        }
      }

      return null;
    };

    // Process each target language with enhanced context
    for (const langCode of targetLanguages) {
      const languageNames: Record<string, string> = {
        'es': 'Spanish', 'fr': 'French', 'de': 'German', 'it': 'Italian',
        'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese', 'ko': 'Korean',
        'zh': 'Chinese', 'ar': 'Arabic', 'hi': 'Hindi', 'th': 'Thai',
        'nl': 'Dutch', 'pl': 'Polish', 'sv': 'Swedish', 'da': 'Danish',
        'no': 'Norwegian', 'fi': 'Finnish', 'tr': 'Turkish', 'he': 'Hebrew'
      }

      const targetLanguage = languageNames[langCode] || langCode;

      // Try API translation first
      let apiTranslation = await translateWithAPIs(text, langCode);

      // Get dictionary context for key words
      const words = text.split(/\s+/).filter(word => word.length > 3);
      const contextPromises = words.slice(0, 5).map(word => getDictionaryContext(word.toLowerCase().replace(/[^\w]/g, '')));
      const contexts = await Promise.all(contextPromises);
      const validContexts = contexts.filter(Boolean) as DictionaryEntry[];

      // Enhanced AI prompt with dictionary context
      const contextInfo = validContexts.length > 0 
        ? `Dictionary context: ${validContexts.map(ctx => 
            `${ctx.word}: ${ctx.definitions.slice(0, 2).join('; ')} (examples: ${ctx.examples.slice(0, 1).join(', ')})`
          ).join(' | ')}`
        : '';

      const prompt = `You are Lyra, part of the Neuronix Linguista AI translation team. You specialize in extraordinary, culturally-aware translations that preserve meaning while adapting perfectly to the target culture.

CONTEXT:
${contextInfo}
Tone: ${tone}
Domain: ${context.domain || 'general'}
Cultural Context: ${context.cultural_context || 'standard'}

TRANSLATION TASK:
Translate the following text to ${targetLanguage} with exceptional quality:

"${text}"

${apiTranslation ? `Reference translation from external API: "${apiTranslation}"` : ''}

REQUIREMENTS:
- Use the dictionary context to ensure precise word choices
- Adapt cultural references and idioms naturally
- Maintain the ${tone} tone while being culturally appropriate
- Preserve formatting and structure
- Make it sound like a native speaker wrote it
- If the API translation exists, improve upon it using your cultural knowledge

Provide ONLY the final translation, no explanations.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: Math.min(wordCount * 4, 2000),
          temperature: 0.2,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        translations[langCode] = data.choices[0].message.content.trim()
      } else {
        // Fallback to API translation if available
        translations[langCode] = apiTranslation || `Translation failed for ${targetLanguage}`
      }
    }

    // Store enhanced translation request in database
    await supabase.from('translation_requests').insert({
      user_id: user.id,
      source_language: 'en',
      target_languages: targetLanguages,
      original_text: text,
      translated_text: translations,
      tone: tone,
      context: context,
      status: 'completed',
      word_count: wordCount,
      completed_at: new Date().toISOString(),
      api_services_used: ['openai', 'dictionary_apis', 'deepl', 'google_translate'].filter(Boolean)
    })

    // Update usage metrics
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('usage_metrics').upsert({
      user_id: user.id,
      date: today,
      words_translated: wordCount,
      requests_made: 1
    }, {
      onConflict: 'user_id,date',
      ignoreDuplicates: false
    })

    return new Response(
      JSON.stringify({ 
        translations,
        context_used: validContexts.length > 0,
        api_services_available: {
          deepl: !!deepLApiKey,
          google_translate: !!googleTranslateKey,
          dictionary_apis: !!dictionaryApiKey,
          merriam_webster: !!merriamWebsterKey,
          oxford: !!oxfordApiKey
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Enhanced translation error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Translation failed',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
