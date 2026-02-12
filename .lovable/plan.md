

# Fix "Already Registered" Error Handling

## Problem
When someone tries to sign up with an email that already has a confirmed account, the edge function returns a 422 status with `{ error: "User already registered" }`. However, `supabase.functions.invoke()` treats any non-2xx response by setting `fnError` with a generic message ("Edge Function returned a non-2xx status code") and discarding the JSON body. The Register page's check for "already registered" in the error message never matches, so the user sees a confusing generic toast.

## Solution
Change the `custom-signup` edge function to always return HTTP 200, and move the error information into the JSON body. This way `supabase.functions.invoke()` passes the response through `data` (not `fnError`), and the AuthContext can read the specific error message.

## Changes

### 1. Update `supabase/functions/custom-signup/index.ts`
- Change the "User already registered" response from `status: 422` to `status: 200` with `{ error: "User already registered" }`
- Change the generic error response from `status: 400` to `status: 200` with `{ error: error.message }`
- Keep the JSON body exactly the same -- only the HTTP status codes change
- Keep the 405 (method not allowed) and input validation responses as-is since those indicate programming errors, not user-facing errors

### 2. Redeploy `custom-signup`

## Why this works
- The AuthContext already checks `data?.error` (line 70) and returns it as an `Error` object
- The Register page already checks `error.message.includes("already registered")` (line 88) and shows "This email is already registered. Please sign in instead."
- By returning 200, the Supabase client passes the body through `data` instead of swallowing it in `fnError`

## No other files need changes
The error propagation chain (edge function -> AuthContext -> Register page) is already correctly wired -- it just needs the HTTP status to be 200 so the Supabase client doesn't intercept the response.

