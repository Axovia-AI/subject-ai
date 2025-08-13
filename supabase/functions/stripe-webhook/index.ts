import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Load both live and test secrets/keys so we can handle either mode
    const liveKey = Deno.env.get("STRIPE_API_KEY");
    const testKey = Deno.env.get("STRIPE_TEST_KEY");
    const liveWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const testWebhookSecret = Deno.env.get("STRIPE_TEST_WEBHOOK_SECRET");
    if (!liveWebhookSecret && !testWebhookSecret) {
      throw new Error("No webhook secret configured. Set STRIPE_WEBHOOK_SECRET and/or STRIPE_TEST_WEBHOOK_SECRET");
    }

    const bodyText = await req.text();
    const sig = req.headers.get("stripe-signature") || "";

    let event: Stripe.Event;
    // Try to verify against test secret first, then live (order doesn't matter much)
    const verifier = new Stripe(liveKey || testKey || "", { apiVersion: "2023-10-16" }).webhooks;
    const trySecrets: Array<{ label: string; secret?: string | null }> = [
      { label: "test", secret: testWebhookSecret },
      { label: "live", secret: liveWebhookSecret },
    ];
    let lastErr: unknown = null;
    for (const s of trySecrets) {
      if (!s.secret) continue;
      try {
        event = verifier.constructEvent(bodyText, sig, s.secret);
        logStep("Signature verified", { using: s.label, eventType: event.type, id: event.id });
        // Successfully verified
        // Pick the appropriate API key based on livemode
        const keyToUse = event.livemode ? liveKey : testKey;
        if (!keyToUse) {
          throw new Error(`Missing API key for ${event.livemode ? "live" : "test"} mode`);
        }
        // Recreate Stripe client with the correct key for any follow-up API calls
        var stripe = new Stripe(keyToUse, { apiVersion: "2023-10-16" });
        // break out with event and stripe set
        // deno-lint-ignore no-explicit-any
        (globalThis as any)._stripe_client = stripe; // helper to keep reference in this scope
        break;
      } catch (err) {
        lastErr = err;
        continue;
      }
    }
    // If event is still undefined, both secrets failed
    // deno-lint-ignore no-explicit-any
    const stripe = (globalThis as any)._stripe_client as Stripe | undefined;
    if (!stripe || !event) {
      logStep("Invalid signature", { message: (lastErr as Error)?.message });
      return new Response("Invalid signature", { status: 400 });
    }

    logStep("Event received", { id: event.id, type: event.type });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const handleCustomerUpsert = async (email: string | null | undefined, userId?: string | null, stripeCustomerId?: string | null, subscribed?: boolean | null, tier?: string | null, endIso?: string | null) => {
      if (!email) return;
      await supabaseClient.from("subscribers").upsert({
        email,
        user_id: userId ?? null,
        stripe_customer_id: stripeCustomerId ?? null,
        subscribed: subscribed ?? null,
        subscription_tier: tier ?? null,
        subscription_end: endIso ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
    };

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // email may be in customer_details or on the session
        const email = session.customer_details?.email ?? session.customer_email ?? null;
        const customerId = (session.customer as string) ?? null;
        // mark as subscribed; actual tier determination happens when subscription is active
        await handleCustomerUpsert(email, null, customerId, true, null, null);
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = (subscription.customer as string) ?? null;
        const status = subscription.status;
        const subscribed = status === 'active' || status === 'trialing';
        const endIso = subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null;
        let priceId: string | undefined;
        if (subscription.items.data[0]?.price?.id) {
          priceId = subscription.items.data[0].price.id;
        }
        // Try to find the customer's email (requires extra call)
        let email: string | null = null;
        if (customerId) {
          const customer = await stripe.customers.retrieve(customerId);
          if (!('deleted' in customer)) {
            email = customer.email ?? null;
          }
        }
        // Minimal upsert; tier can be computed by check-subscription flow or by adding mapping here in future
        await handleCustomerUpsert(email, null, customerId, subscribed, null, endIso);
        break;
      }
      default:
        logStep("Unhandled event", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

