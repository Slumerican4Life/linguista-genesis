
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'npm:stripe'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Stripe client
const stripe = new Stripe(Deno.env.get('stripe_secret_linguista')!, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Supabase client
let supabaseAdmin: SupabaseClient;

async function getSupabaseAdmin() {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }
  supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  return supabaseAdmin;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();

  let event: Stripe.Event
  try {
    if (!signature) {
      throw new Error("Missing Stripe-Signature header");
    }
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new Response(err.message, { status: 400 })
  }

  const supabase = await getSupabaseAdmin();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        
        if (!userId) {
          throw new Error('Webhook Error: Missing client_reference_id (user_id) in checkout session.');
        }

        if (!session.subscription || !session.customer) {
          // This could be a one-time payment, not a subscription.
          // We can handle this case later if needed.
          console.log(`Checkout session ${session.id} completed but was not a subscription.`);
          break;
        }
        
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        const { data: subscription, error: subError } = await stripe.subscriptions.retrieve(subscriptionId);
        if (subError) throw subError;

        const priceId = subscription.items.data[0].price.id;
        const tier = subscription.items.data[0].price.nickname || 'unknown';

        console.log(`Updating profile for user ${userId} with customer ID ${customerId}`);
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId);
        if (profileError) throw profileError;
        
        console.log(`Upserting subscription for user ${userId}`);
        const { error: upsertError } = await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            stripe_price_id: priceId,
            status: subscription.status,
            tier: tier,
        }, { onConflict: 'stripe_subscription_id' });
        if (upsertError) throw upsertError;

        console.log(`✅ Successfully processed subscription ${subscriptionId} for user ${userId}`);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Updating subscription ${subscription.id} to status ${subscription.status}`);
        
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            stripe_price_id: subscription.items.data[0].price.id,
            tier: subscription.items.data[0].price.nickname || 'unknown',
          })
          .eq('stripe_subscription_id', subscription.id);
        
        if (updateError) throw updateError;
        console.log(`✅ Subscription ${subscription.id} status updated to ${subscription.status}`);
        break;
      }
      default:
        console.log(`🔔 Unhandled event type: ${event.type}`)
    }
  } catch(error) {
    console.error('Webhook handler error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json", ...corsHeaders } })
})
