import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

serve(async (req) => {
  // Only allow POST (Stripe sends POST webhooks)
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSigningSecret = Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET");

    if (!stripeSecretKey || !webhookSigningSecret) {
      console.error("Stripe secrets not configured");
      return new Response("Server configuration error", { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Get the raw body and signature header
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("Missing stripe-signature header");
      return new Response("Missing signature", { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSigningSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    console.log(`Received Stripe event: ${event.type} (${event.id})`);

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      const orderNumber = session.metadata?.order_number;

      if (!orderId) {
        console.error("No order_id in session metadata");
        return new Response("Missing order_id in metadata", { status: 400 });
      }

      console.log(`Processing payment for order ${orderNumber} (${orderId})`);

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      // Update order status to paid
      const { data: order, error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          payment_status: "paid",
          stripe_payment_intent_id: session.payment_intent as string || session.id,
        })
        .eq("id", orderId)
        .select("user_id")
        .single();

      if (updateError) {
        console.error("Error updating order:", updateError);
        return new Response("Error updating order", { status: 500 });
      }

      console.log(`Order ${orderNumber} marked as paid`);

      // Clear the user's cart if they were authenticated
      if (order?.user_id) {
        const { error: cartError } = await supabaseAdmin
          .from("cart_items")
          .delete()
          .eq("user_id", order.user_id);

        if (cartError) {
          console.error("Error clearing cart:", cartError);
          // Don't fail the webhook for cart clearing errors
        } else {
          console.log(`Cart cleared for user ${order.user_id}`);
        }
      }
    }

    // Return 200 to acknowledge receipt (Stripe expects this)
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected webhook error:", error);
    return new Response("Unexpected error", { status: 500 });
  }
});
