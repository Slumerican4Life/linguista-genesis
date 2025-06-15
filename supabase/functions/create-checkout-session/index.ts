
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("create-checkout-session function invoked.");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      console.error("User not found.");
      throw new Error("User not found");
    }
    console.log("User authenticated:", user.id);

    const { priceId } = await req.json();
    if (!priceId) {
      console.error("priceId is required.");
      throw new Error("priceId is required");
    }
    console.log("Received priceId:", priceId);

    const stripeSecretKey = Deno.env.get("stripe_secret_linguista");
    if (!stripeSecretKey) {
        console.error("Stripe secret key not found.");
        throw new Error("Stripe secret key not configured.");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const { data: profileData } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profileData?.stripe_customer_id;
    console.log("Existing Stripe customer ID:", customerId);

    if (!customerId) {
        console.log("No Stripe customer ID found, creating a new one.");
        const customer = await stripe.customers.create({
            email: user.email!,
            metadata: { user_id: user.id },
        });
        customerId = customer.id;
        console.log("New Stripe customer created:", customerId);
        
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id);

        if (updateError) {
          console.error("Failed to update profile with Stripe customer ID:", updateError);
        } else {
            console.log("Profile updated with new Stripe customer ID.");
        }
    }

    const origin = req.headers.get("origin");
    console.log("Using origin for redirect URLs:", origin);

    console.log("Creating Stripe checkout session...");
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${origin}/`,
        cancel_url: `${origin}/`,
        client_reference_id: user.id,
      });
      console.log("Stripe checkout session created successfully:", session.id);
    } catch (stripeError) {
      console.error("Error from Stripe API:", stripeError);
      throw new Error(`Stripe Error: ${stripeError.message}`);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-checkout-session:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
