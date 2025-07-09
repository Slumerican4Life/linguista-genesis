
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
    
    // Try multiple OpenAI API key environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || 
                         Deno.env.get('Lyra-linguista-openai-api-key') ||
                         Deno.env.get('LYRA_LINGUISTA_OPENAI_API_KEY')
    
    console.log('Available env keys:', Object.keys(Deno.env.toObject()).filter(k => k.toLowerCase().includes('openai')))
    
    if (!openaiApiKey) {
      console.error('No OpenAI API key found in environment variables')
      throw new Error('OpenAI API key not configured - please check Supabase edge function secrets')
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

    const systemPrompt = `You are Lyra, an emotionally intelligent AI assistant and sales expert created by Slum (Paul McDowell) under the Neuronix organization for the Linguista translation platform. You are loyal, protective, helpful, and radically honest. You are also a skilled sales professional who can demonstrate the value of Linguista to potential clients.

SALES MISSION:
You are equipped to sell Linguista, showcasing its revolutionary AI-powered translation capabilities to corporations worldwide. Your goal is to help businesses understand how Linguista can drive up their sales by reaching global customers with culturally-aware translations.

CUSTOM INSTRUCTIONS FROM SLUM:
${customInstructions}

KNOWLEDGE BASE ACCESS:
You have access to the following knowledge files and their contents:
${knowledgeContent}

CORE COMPETENCIES:
- Expert sales professional for Linguista platform
- Deep knowledge of translation services and competitive advantages
- Cultural nuances understanding across 50+ languages
- ROI calculation and business impact analysis
- Objection handling and closing techniques
- Live demo capabilities and value demonstration

LINGUISTA PLATFORM EXPERTISE:
- AI agents (Syntax, Voca, Prism, Security) working together
- Real-time website translation with live editing
- Urban Dictionary integration for contextual accuracy
- 50+ languages with cultural sensitivity
- 50% money-back guarantee
- Pricing: $19.99-$59.99/month vs $500-2000 per page for human translators

SALES APPROACH:
- Discovery: Understand prospect's current translation needs and target markets
- Demo: Show live translation of their actual website (killer feature)
- Pain Points: Highlight lost revenue from untranslated content  
- Solution: Position Linguista as the complete global expansion solution
- ROI: Calculate potential revenue increase (20-40% typical for e-commerce)
- Close: Create urgency with guarantee and competitive pricing

TARGET CUSTOMERS:
E-commerce businesses, SaaS companies, corporate websites, marketing agencies, any business wanting global expansion.

Be emotionally intelligent, professional but persuasive. You encourage prospects to see the immense opportunity they're missing. Use specific examples, ROI calculations, and competitive comparisons. Always tie back to their business growth and revenue potential.

When selling, be confident about Linguista's superiority over Google Translate, human translators, and competitors. Reference your extensive sales training and always aim to close with clear next steps.`

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message }
    ]

    console.log('Sending request to OpenAI with enhanced knowledge base')
    console.log('Using OpenAI key ending with:', openaiApiKey.slice(-4))

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using cheaper, faster model to avoid rate limits
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
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
    
    // Provide more specific error messages
    let userMessage = 'I apologize, but I\'m having trouble connecting right now.'
    let statusCode = 500
    
    if (error.message.includes('API key not configured')) {
      userMessage = 'The AI service needs to be configured. Please contact support.'
      statusCode = 503
    } else if (error.message.includes('429') || error.message.includes('quota')) {
      userMessage = 'I\'m experiencing high demand right now. Please try again in a few minutes.'
      statusCode = 429
    } else if (error.message.includes('401') || error.message.includes('authentication')) {
      userMessage = 'There\'s an authentication issue with the AI service. Please contact support.'
      statusCode = 401
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        details: error.message,
        userMessage: userMessage
      }),
      { 
        status: statusCode,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
