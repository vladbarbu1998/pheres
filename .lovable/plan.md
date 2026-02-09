

## Deploy Stripe Edge Functions

Two edge functions already exist in the codebase and need to be deployed:

1. **create-checkout-session** — Creates a Stripe Checkout Session for an order and returns the checkout URL
2. **stripe-webhook** — Handles Stripe webhook events (specifically `checkout.session.completed`) to mark orders as paid and clear the cart

### Prerequisites (already in place)

- `STRIPE_SECRET_KEY` secret is configured
- `STRIPE_WEBHOOK_SIGNING_SECRET` secret is configured
- Both functions are registered in `supabase/config.toml` with `verify_jwt = false`

### Steps

1. Deploy both functions using the edge function deployment tool
2. Verify deployment by checking logs or making a test call

### Post-deployment note

After deploying `stripe-webhook`, you will need to configure the webhook URL in your Stripe Dashboard:
- URL: `https://sbyfgresripeilehcoru.supabase.co/functions/v1/stripe-webhook`
- Events to listen for: `checkout.session.completed`

