

# Wire Up Branded Auth Emails via Resend

## Problem
Custom SMTP configuration is not available through Lovable Cloud. The Register and Forgot Password pages currently use default authentication methods that send generic, unbranded emails.

## Solution
Your project already has two custom edge functions (`custom-signup` and `custom-reset-password`) that send beautifully branded Pheres emails via Resend from `noreply@pheres.com`. We just need to connect them.

## Changes

### 1. Update AuthContext (`src/contexts/AuthContext.tsx`)
- Modify the `signUp` method to call the `custom-signup` edge function instead of `supabase.auth.signUp`
- Modify the `resetPassword` method to call the `custom-reset-password` edge function instead of `supabase.auth.resetPasswordForEmail`
- Both functions will use the existing `RESEND_API_KEY` secret to send branded emails

### 2. Register `custom-signup` and `custom-reset-password` in config.toml
- Add `[functions.custom-signup]` and `[functions.custom-reset-password]` with `verify_jwt = false` so they can be called from the frontend without authentication

### 3. Update Register Page (`src/pages/account/Register.tsx`)
- Minor adjustment: the `signUp` method signature stays the same, so no changes needed here -- the AuthContext handles it transparently

### 4. Update ForgotPassword Page (`src/pages/account/ForgotPassword.tsx`)
- No changes needed -- the `resetPassword` method signature stays the same

## What customers will experience
- **Signup**: Branded confirmation email from `noreply@pheres.com` with Pheres logo, luxury styling, and "Confirm Email Address" button
- **Password Reset**: Branded reset email from `noreply@pheres.com` with Pheres logo, luxury styling, and "Reset Password" button
- **Sender name**: "Pheres" (already configured in the edge functions)

## Technical Details

### AuthContext `signUp` change
Instead of calling `supabase.auth.signUp()`, the function will call the `custom-signup` edge function via `supabase.functions.invoke('custom-signup', { body: { email, password, firstName, lastName, redirectTo } })`. This edge function uses `supabase.auth.admin.generateLink()` to create the user and generate a confirmation link, then sends the branded email via Resend.

### AuthContext `resetPassword` change
Instead of calling `supabase.auth.resetPasswordForEmail()`, the function will call the `custom-reset-password` edge function via `supabase.functions.invoke('custom-reset-password', { body: { email, redirectTo } })`. This edge function generates a recovery link and sends the branded email via Resend.

### Edge function registration in config.toml
```text
[functions.custom-signup]
verify_jwt = false

[functions.custom-reset-password]
verify_jwt = false
```

## Risk mitigation
- The edge functions already handle email enumeration protection (always return success for reset)
- Error mapping for "already registered" is built into the custom-signup function
- The existing Turnstile verification and rate limiting on the frontend remain unchanged
- No duplicate emails: by using `admin.generateLink()` instead of `signUp()`, the default Supabase email is suppressed

