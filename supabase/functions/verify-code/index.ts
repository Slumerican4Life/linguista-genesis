
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
    const { type, phoneNumber, code } = await req.json()
    
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

    if (type === 'phone') {
      // Find the verification attempt
      const { data: attempt, error: attemptError } = await supabaseClient
        .from('verification_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('verification_type', 'phone')
        .eq('contact_info', phoneNumber)
        .eq('verification_code', code)
        .gt('expires_at', new Date().toISOString())
        .is('verified_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (attemptError) throw attemptError
      if (!attempt) {
        throw new Error('Invalid or expired verification code')
      }

      // Mark as verified
      await supabaseClient
        .from('verification_attempts')
        .update({ verified_at: new Date().toISOString() })
        .eq('id', attempt.id)

      return new Response(
        JSON.stringify({ success: true, message: 'Phone number verified successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid verification type')

  } catch (error) {
    console.error('Verification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
