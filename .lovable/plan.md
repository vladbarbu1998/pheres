

## Create a temporary edge function to retrieve the service role key

A new edge function will be created that returns the `SUPABASE_SERVICE_ROLE_KEY` value. This function will be admin-protected so only you can access it.

### How it works

1. Create a new edge function at `supabase/functions/get-service-key/index.ts`
2. The function will verify the caller is an admin (using the same `has_role` check your other functions use)
3. It returns the service role key value in the response

### Security

- The function requires a valid admin JWT token to return the key
- Non-admin users will receive a 403 error
- You should delete this function after copying the key, as it's only meant for temporary use

### Technical details

- New file: `supabase/functions/get-service-key/index.ts`
- Config update: `supabase/config.toml` — add `[functions.get-service-key]` with `verify_jwt = false` (JWT is validated manually in code)
- After deployment, you can call it from the browser console or I can call it for you directly

