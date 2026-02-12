

# Add Admin Email Notifications for Form Submissions

## Overview
The `notify-admin-form` edge function and the frontend integration code do not exist in the project yet. They need to be created and wired up.

## Steps

### 1. Create the Edge Function
Create `supabase/functions/notify-admin-form/index.ts` with the code prepared by Claude Code:
- Accepts POST with `{ type, ...data }` where type is `contact`, `couture_inquiry`, or `concierge_inquiry`
- Sends a branded HTML email via Resend to `andrei@pheres.com` and `stanoiloren20@gmail.com`
- HTML-escapes all user input to prevent injection
- Uses the existing `RESEND_API_KEY` secret

### 2. Register in `supabase/config.toml`
Add the function config with `verify_jwt = false` (public forms, no auth required):
```
[functions.notify-admin-form]
verify_jwt = false
```

### 3. Update Frontend to Call the Function (fire-and-forget)
After each successful database insert, add a non-blocking call:

- **Contact** (`src/pages/Contact.tsx`): After `supabase.from("contact_messages").insert(...)` succeeds, call `supabase.functions.invoke("notify-admin-form", { body: { type: "contact", name, email, subject, message } }).catch(() => {})`

- **Couture Inquiry** (`src/hooks/useCoutureInquiry.ts`): After successful insert, call with `{ type: "couture_inquiry", name, email, productName, country, preferredContact, phone, message, interestedInViewing }`

- **Concierge Inquiry** (`src/hooks/useConciergeInquiry.ts`): After successful insert, call with `{ type: "concierge_inquiry", name, email, country, preferredContact, phone, message }`

All calls are fire-and-forget so the user experience is unaffected if the email fails.

### 4. Deploy
The edge function deploys automatically after creation.

## Technical Notes
- **Sender**: `orders@pheres.com` via Resend (existing secret)
- **Recipients**: Hardcoded `andrei@pheres.com`, `stanoiloren20@gmail.com`
- **Security**: No JWT needed since it only sends to hardcoded admin addresses; all input is HTML-escaped
- **No database changes needed**

