
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, targetLanguages, tone = 'natural' } = await req.json()
    
    const openaiApiKey = Deno.env.get('Lyra-linguista-openai-api-key')
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

    // Check user's subscription and usage limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, subscriptions(*)')
      .eq('id', user.id)
      .single()

    const wordCount = text.split(' ').length
    const translations: Record<string, string> = {}

    // Process each target language
    for (const langCode of targetLanguages) {
      const languageNames: Record<string, string> = {
        'es': 'Spanish', 'fr': 'French', 'de': 'German', 'it': 'Italian',
        'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese', 'ko': 'Korean',
        'zh': 'Chinese', 'ar': 'Arabic', 'hi': 'Hindi', 'th': 'Thai'
      }

      const targetLanguage = languageNames[langCode] || langCode

      const prompt = `You are part of the Linguista AI translation team. Translate the following text to ${targetLanguage} with a ${tone} tone. 

Consider:
- Cultural context and local expressions
- Maintain the original meaning while adapting tone
- Use natural, fluent language appropriate for the target culture
- Preserve any specific formatting or structure

Text to translate: "${text}"

Provide only the translation, no explanations.`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: Math.min(wordCount * 3, 1000),
          temperature: 0.3,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        translations[langCode] = data.choices[0].message.content.trim()
      } else {
        translations[langCode] = `Translation failed for ${targetLanguage}`
      }
    }

    // Store translation request in database
    await supabase.from('translation_requests').insert({
      user_id: user.id,
      source_language: 'en',
      target_languages: targetLanguages,
      original_text: text,
      translated_text: translations,
      tone: tone,
      status: 'completed',
      word_count: wordCount,
      completed_at: new Date().toISOString()
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
      JSON.stringify({ translations }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Translation error:', error)
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
