

# Apply CORS Fix to Auth Edge Functions

## Problem
The CORS fix from the previous step was not saved. Both `custom-signup` and `custom-reset-password` still use a hardcoded `ALLOWED_ORIGINS` list that blocks requests from `localhost` and the Lovable preview domain.

## Changes

### 1. Fix `supabase/functions/custom-signup/index.ts`
- Remove the `ALLOWED_ORIGINS` array (lines 7-14) and `getCorsHeaders` function (lines 16-25)
- Replace with a simple `corsHeaders` constant using `Access-Control-Allow-Origin: *` and the full set of Supabase client headers
- Remove the `const origin = ...` and `const corsHeaders = getCorsHeaders(origin)` lines inside `serve()`

### 2. Fix `supabase/functions/custom-reset-password/index.ts`
- Same changes as above

### 3. Redeploy both edge functions

## Why this is safe
These functions validate input server-side (email, password format), use Supabase Auth admin APIs for token generation, and are protected by Turnstile on the frontend. CORS origin restrictions add no meaningful security since they only apply to browsers, not server-to-server calls.

