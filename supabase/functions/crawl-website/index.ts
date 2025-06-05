
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
    const { projectId, url } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Update project status to crawling
    await supabaseClient
      .from('translation_projects')
      .update({ 
        crawl_status: 'crawling',
        last_crawl_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', user.id)

    // Start the crawling process in the background
    EdgeRuntime.waitUntil(crawlWebsite(supabaseClient, projectId, url))

    return new Response(
      JSON.stringify({ success: true, message: 'Crawling started' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Crawl error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function crawlWebsite(supabaseClient: any, projectId: string, url: string) {
  try {
    // Validate URL
    const parsedUrl = new URL(url)
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`
    
    // Basic crawling - fetch main page
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`)
    }
    
    const html = await response.text()
    
    // Extract title and basic content
    const titleMatch = html.match(/<title>(.*?)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled'
    
    // Simple content extraction (remove HTML tags)
    const contentMatch = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                             .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                             .replace(/<[^>]*>/g, ' ')
                             .replace(/\s+/g, ' ')
                             .trim()
    
    const content = contentMatch.substring(0, 10000) // Limit content size
    
    // Create hash of content for change detection
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Insert/update page record
    const { error: pageError } = await supabaseClient
      .from('website_pages')
      .upsert({
        project_id: projectId,
        url: url,
        title: title,
        content: content,
        content_hash: contentHash,
        page_type: 'page',
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'project_id,url'
      })

    if (pageError) throw pageError

    // Update project with crawl results
    await supabaseClient
      .from('translation_projects')
      .update({ 
        crawl_status: 'completed',
        pages_found: 1,
        last_crawl_at: new Date().toISOString()
      })
      .eq('id', projectId)

    console.log(`Successfully crawled ${url}`)

  } catch (error) {
    console.error('Background crawl error:', error)
    
    // Update project status to failed
    await supabaseClient
      .from('translation_projects')
      .update({ 
        crawl_status: 'failed',
        last_crawl_at: new Date().toISOString()
      })
      .eq('id', projectId)
  }
}
