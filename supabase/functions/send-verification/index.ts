
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
    const { type, phoneNumber, email } = await req.json()
    
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

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes (was 10)

    if (type === 'phone') {
      // Store verification attempt
      await supabaseClient.from('verification_attempts').insert({
        user_id: user.id,
        verification_type: 'phone',
        verification_code: verificationCode,
        contact_info: phoneNumber,
        expires_at: expiresAt.toISOString()
      })

      // In a real implementation, you would send SMS here
      // For now, we'll log the code (in production, integrate with Twilio/etc)
      console.log(`SMS verification code for ${phoneNumber}: ${verificationCode}`)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification code sent',
          // In development, return the code for testing
          ...(Deno.env.get('NODE_ENV') === 'development' && { code: verificationCode })
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (type === 'email') {
      // Use Supabase's built-in email verification
      const { error } = await supabaseClient.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, message: 'Verification email sent' }),
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
