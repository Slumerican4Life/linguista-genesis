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
  slangMeaning?: string;
  urbanDefinition?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { originalText, targetLanguage, includeUrbanDictionary = true, includeSlang = true, contextualReferences = true } = await req.json()
    
    // Get API keys from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const dictionaryApiKey = Deno.env.get('DICTIONARY_API_KEY')
    const merriamWebsterKey = Deno.env.get('MERRIAM_WEBSTER_API_KEY')
    const oxfordApiKey = Deno.env.get('OXFORD_DICTIONARY_API_KEY')
    
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

    console.log(`Enhancing translation for: "${originalText}" -> ${targetLanguage}`)

    // Enhanced dictionary lookup with multiple sources
    const getEnhancedDictionary = async (word: string): Promise<DictionaryEntry | null> => {
      try {
        const dictionaries = [];
        
        // Standard dictionary
        if (dictionaryApiKey) {
          dictionaries.push({
            name: 'dictionary-api',
            url: `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
            headers: {}
          });
        }
        
        // Merriam-Webster
        if (merriamWebsterKey) {
          dictionaries.push({
            name: 'merriam-webster',
            url: `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${merriamWebsterKey}`,
            headers: {}
          });
        }
        
        // Oxford Dictionary
        if (oxfordApiKey) {
          dictionaries.push({
            name: 'oxford',
            url: `https://od-api.oxforddictionaries.com/api/v2/entries/en-us/${word}`,
            headers: {
              'app_id': 'your_app_id',
              'app_key': oxfordApiKey
            }
          });
        }

        let bestEntry: DictionaryEntry | null = null;

        for (const dict of dictionaries) {
          try {
            const response = await fetch(dict.url, { headers: dict.headers });
            
            if (response.ok) {
              const data = await response.json();
              
              if (dict.name === 'dictionary-api' && data.length > 0) {
                const entry = data[0];
                bestEntry = {
                  word,
                  definitions: entry.meanings?.[0]?.definitions?.map((d: any) => d.definition) || [],
                  examples: entry.meanings?.[0]?.definitions?.map((d: any) => d.example).filter(Boolean) || [],
                  synonyms: entry.meanings?.[0]?.synonyms || []
                };
                break;
              }
            }
          } catch (e) {
            console.warn(`Dictionary API ${dict.name} failed:`, e);
          }
        }

        // Add Urban Dictionary if enabled
        if (includeUrbanDictionary && bestEntry) {
          try {
            // Note: Urban Dictionary API is unofficial, implement carefully
            const urbanResponse = await fetch(`https://api.urbandictionary.com/v0/define?term=${word}`);
            if (urbanResponse.ok) {
              const urbanData = await urbanResponse.json();
              if (urbanData.list && urbanData.list.length > 0) {
                bestEntry.urbanDefinition = urbanData.list[0].definition;
              }
            }
          } catch (e) {
            console.warn('Urban Dictionary lookup failed:', e);
          }
        }

        return bestEntry;
      } catch (error) {
        console.warn('Enhanced dictionary lookup failed:', error);
        return null;
      }
    };

    // Extract key words for dictionary lookup
    const words = originalText.split(/\s+/)
      .filter(word => word.length > 3)
      .map(word => word.replace(/[^\w]/g, '').toLowerCase())
      .slice(0, 5); // Limit to 5 key words

    console.log('Looking up words:', words);

    const dictionaryPromises = words.map(word => getEnhancedDictionary(word));
    const dictionaryResults = await Promise.all(dictionaryPromises);
    const validDictionary = dictionaryResults.filter(Boolean) as DictionaryEntry[];

    // Language-specific cultural context
    const getCulturalContext = (lang: string): string => {
      const contexts: Record<string, string> = {
        'es': 'Latin American Spanish with casual, friendly tone. Use local expressions and avoid overly formal language.',
        'fr': 'European French with elegant phrasing. Incorporate cultural politeness and sophistication.',
        'de': 'German with directness and clarity. Use compound words naturally and maintain professional tone.',
        'it': 'Italian with warmth and expressiveness. Include emotional undertones and family-oriented language.',
        'pt': 'Brazilian Portuguese with rhythm and warmth. Use colloquial expressions that feel native.',
        'ja': 'Japanese with appropriate politeness levels (keigo). Consider social context and formality.',
        'ko': 'Korean with proper honorifics and cultural sensitivity. Match the social relationship context.',
        'zh': 'Simplified Chinese with cultural metaphors and appropriate formality for business context.',
        'ar': 'Modern Standard Arabic with cultural respect and appropriate religious/social sensitivity.',
        'hi': 'Hindi with cultural warmth and family-oriented expressions. Include respectful language patterns.',
        'th': 'Thai with appropriate wai culture and respectful language patterns.',
        'ru': 'Russian with directness balanced by warmth. Use cultural expressions that resonate locally.'
      };
      return contexts[lang] || 'Standard translation with cultural awareness.';
    };

    // Build enhanced context
    const dictionaryContext = validDictionary.length > 0 
      ? `Dictionary insights: ${validDictionary.map(entry => 
          `${entry.word}: ${entry.definitions.slice(0, 2).join('; ')}${entry.urbanDefinition ? ` (slang: ${entry.urbanDefinition})` : ''}`
        ).join(' | ')}`
      : '';

    const culturalContext = getCulturalContext(targetLanguage);

    // Enhanced AI prompt for contextual translation
    const enhancedPrompt = `You are Lyra, the lead translator of the Neuronix Linguista team. Create an enhanced, culturally-aware translation that feels like it was written by a local native speaker.

CONTEXT ENHANCEMENT:
${dictionaryContext}

CULTURAL GUIDELINES:
${culturalContext}

REQUIREMENTS:
- Translate from English to ${targetLanguage}
- Use local slang and cultural references where appropriate
- Make it sound natural and engaging for local customers
- Incorporate cultural context that builds trust and familiarity
- Adapt tone to feel more personal and less corporate
- Use expressions that locals would actually use

Original text: "${originalText}"

Provide 3 alternative translations:
1. Enhanced contextual translation (main result)
2. More casual/local version with slang
3. Professional but culturally adapted version

Format as JSON:
{
  "enhancedTranslation": "main enhanced translation",
  "alternatives": ["casual version", "professional version"],
  "culturalNotes": "brief explanation of cultural adaptations made"
}`;

    console.log('Sending enhanced translation request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: enhancedPrompt }],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();

    let enhancedResult;
    try {
      enhancedResult = JSON.parse(aiResponse);
    } catch (e) {
      // Fallback if JSON parsing fails
      enhancedResult = {
        enhancedTranslation: aiResponse,
        alternatives: [],
        culturalNotes: "Enhanced with AI contextual understanding"
      };
    }

    // Store the enhancement request for analytics
    await supabase.from('translation_requests').insert({
      user_id: user.id,
      source_language: 'en',
      target_languages: [targetLanguage],
      original_text: originalText,
      translated_text: { enhanced: enhancedResult },
      tone: 'contextual_enhanced',
      context: {
        dictionary_used: validDictionary.length > 0,
        urban_dictionary: includeUrbanDictionary,
        cultural_context: culturalContext
      },
      status: 'completed',
      word_count: originalText.split(' ').length,
      completed_at: new Date().toISOString(),
      api_services_used: ['openai', 'dictionary_apis', 'urban_dictionary'].filter(Boolean)
    });

    console.log('Enhancement completed successfully');

    return new Response(
      JSON.stringify({ 
        ...enhancedResult,
        dictionaryContext: validDictionary,
        culturalAdaptations: culturalContext,
        servicesUsed: {
          dictionary_apis: validDictionary.length > 0,
          urban_dictionary: includeUrbanDictionary,
          ai_enhancement: true
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Enhancement error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Enhancement failed',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});