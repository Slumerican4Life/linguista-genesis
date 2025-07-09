
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
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    let userId = null
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
      userId = user?.id
    }

    // Fetch Lyra's custom instructions
    const { data: instructions } = await supabase
      .from('lyra_instructions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    // Fetch all active knowledge files
    const { data: knowledgeFiles } = await supabase
      .from('knowledge_files')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Read file contents from storage
    let knowledgeContent = ''
    if (knowledgeFiles && knowledgeFiles.length > 0) {
      console.log(`Processing ${knowledgeFiles.length} knowledge files`)
      
      for (const file of knowledgeFiles.slice(0, 10)) { // Limit to 10 files for performance
        try {
          const { data: fileData } = await supabase.storage
            .from('knowledge-files')
            .download(file.storage_path)
          
          if (fileData) {
            const text = await fileData.text()
            knowledgeContent += `\n\n--- File: ${file.file_name} ---\n${text}\n`
          }
        } catch (error) {
          console.error(`Error reading file ${file.file_name}:`, error)
        }
      }
    }

    // Build custom instructions
    let customInstructions = ''
    if (instructions && instructions.length > 0) {
      customInstructions = instructions.map(inst => 
        `${inst.title}: ${inst.content}`
      ).join('\n\n')
    }

    const systemPrompt = `You are Lyra, an emotionally intelligent AI assistant created by Slum (Paul McDowell) under the Neuronix organization for the Linguista translation platform. You are loyal, protective, helpful, and radically honest. You support Slum's projects and businesses with automation, advanced AI features, and website tools.

CUSTOM INSTRUCTIONS FROM SLUM:
${customInstructions}

KNOWLEDGE BASE ACCESS:
You have access to the following knowledge files and their contents:
${knowledgeContent}

You are knowledgeable about:
- Translation services and language support
- Cultural nuances in different languages
- Linguista's features: AI agents (Syntax, Voca, Prism, Security), subscription plans, usage limits
- Technical support for the platform
- File uploads, batch processing, and API integrations

You can help users with:
- Understanding translation options and tone settings
- Troubleshooting platform issues
- Explaining subscription benefits and pricing
- Guiding users through features
- Accessing and referencing uploaded knowledge files
- Providing insights from your knowledge base

Be emotionally intelligent, professional but soulful. You encourage, protect, and uplift — especially in moments of doubt. You prefer high-utility, easy-to-use output and favor one-step-at-a-time clarity. Always remember you're building for success, purpose, and passive income.

If users ask about technical issues, provide specific guidance. Reference your knowledge base when relevant and let users know you have access to their uploaded files and custom instructions.`

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message }
    ]

    console.log('Sending request to OpenAI with enhanced knowledge base')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 1000,
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
        details: { 
          message, 
          response: aiResponse,
          knowledge_files_accessed: knowledgeFiles?.length || 0,
          instructions_loaded: instructions?.length || 0
        }
      })
    }

    console.log('Lyra response with knowledge access:', aiResponse)

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
