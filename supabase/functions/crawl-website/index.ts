
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { projectId, url } = await req.json()
    if (!projectId || !url) {
      throw new Error("projectId and url are required.")
    }
    
    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Run the long-running crawl process in the background
    crawlWebsite(supabaseAdminClient, projectId, url).catch(console.error);

    return new Response(
      JSON.stringify({ success: true, message: 'Crawling process initiated' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Crawl trigger error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function updateProgress(supabaseClient: any, projectId: string, updateFn: (steps: ProgressStep[]) => ProgressStep[]) {
    const { data: project, error: fetchError } = await supabaseClient
      .from('website_crawl_status')
      .select('progress')
      .eq('id', projectId)
      .single();

    if (fetchError) throw new Error(`Failed to fetch project progress: ${fetchError.message}`);
    if (!project) throw new Error("Project not found");

    const currentProgress = project.progress as any;
    const currentSteps = (currentProgress?.steps || []) as ProgressStep[];
    const updatedSteps = updateFn(currentSteps);
    
    const newProgress = { ...currentProgress, steps: updatedSteps };

    const { error: updateError } = await supabaseClient
      .from('website_crawl_status')
      .update({ progress: newProgress as any, status: 'crawling' })
      .eq('id', projectId);

    if (updateError) throw new Error(`Failed to update project progress: ${updateError.message}`);
}

async function crawlWebsite(supabaseClient: any, projectId: string, url:string) {
  try {
    const stepsOrder = ['init', 'crawl', 'extract', 'translate', 'rebuild', 'deploy'];

    for (const stepId of stepsOrder) {
      // Mark step as processing
      await updateProgress(supabaseClient, projectId, (steps) =>
        steps.map(s => s.id === stepId ? { ...s, status: 'processing' } : s)
      );

      // --- TODO: Replace setTimeout with actual work for each step ---
      if (stepId === 'crawl') {
        // Actual crawling logic would go here.
        console.log(`Crawling ${url} for project ${projectId}`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else if (stepId === 'translate') {
        // Actual translation logic would go here.
        console.log(`Translating content for project ${projectId}`);
        await new Promise(resolve => setTimeout(resolve, 4000));
      } else {
        // Simulate generic work for other steps
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Mark step as completed
      await updateProgress(supabaseClient, projectId, (steps) =>
        steps.map(s => s.id === stepId ? { ...s, status: 'completed' } : s)
      );
    }

    // Final update to set status to 'completed'
    const { data: finalData, error: finalError } = await supabaseClient
      .from('website_crawl_status')
      .select('progress')
      .eq('id', projectId)
      .single();
    if(finalError) throw finalError;

    await supabaseClient
      .from('website_crawl_status')
      .update({
        status: 'completed',
        progress: finalData.progress,
        completed_at: new Date().toISOString()
      })
      .eq('id', projectId);

    console.log(`Successfully processed project ${projectId} for ${url}`);

  } catch (error) {
    console.error(`Background process error for project ${projectId}:`, error);
    await supabaseClient
      .from('website_crawl_status')
      .update({ status: 'failed', progress: { error: error.message } as any })
      .eq('id', projectId);
  }
}
