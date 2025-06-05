
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
    const { message, conversationHistory = [] } = await req.json()
    
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
    let userId = null
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
      userId = user?.id
    }

    const systemPrompt = `You are Lyra, an emotionally intelligent AI assistant created by Neuronix for the Linguista translation platform. You are helpful, professional, and knowledgeable about:

- Translation services and language support
- Cultural nuances in different languages
- Linguista's features: AI agents (Syntax, Voca, Prism, Security), subscription plans, usage limits
- Technical support for the platform
- File uploads, batch processing, and API integrations

You have access to the platform's knowledge base and can help users with:
- Understanding translation options and tone settings
- Troubleshooting platform issues
- Explaining subscription benefits and pricing
- Guiding users through features

Be concise, helpful, and always maintain a professional but warm tone. If users ask about technical issues, provide specific guidance.`

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message }
    ]

    console.log('Sending request to OpenAI with message:', message)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    // Store conversation in database if user is authenticated
    if (userId) {
      await supabase.from('admin_logs').insert({
        admin_id: userId,
        action: 'lyra_conversation',
        details: { message, response: aiResponse }
      })
    }

    console.log('Lyra response:', aiResponse)

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in lyra-chat function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
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
