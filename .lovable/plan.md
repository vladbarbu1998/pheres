

# Fix Vault Secret for Order Email Notifications

## Problem
The `notify_order_status_change` database trigger reads `service_role_key` from the Supabase Vault to call the `order-emails` edge function. Currently, the vault entry contains a placeholder value (`"YOUR_SERVICE_ROLE_KEY"`) instead of the actual key, so order confirmation emails are never sent.

## Solution
Run a SQL migration that:
1. Deletes the existing placeholder vault secret named `service_role_key`
2. Re-creates it using `current_setting('supabase.service_role_key', true)`, which automatically pulls the real service role key from the running Supabase config -- no manual copy-paste needed

## Technical Details

### SQL Migration
```sql
DELETE FROM vault.secrets WHERE name = 'service_role_key';
SELECT vault.create_secret(
  current_setting('supabase.service_role_key', true),
  'service_role_key'
);
```

### Why this works
- `current_setting('supabase.service_role_key', true)` reads the actual service role key from the Supabase runtime configuration
- The `notify_order_status_change` trigger already queries `vault.decrypted_secrets WHERE name = 'service_role_key'` to build the Authorization header for the `order-emails` edge function call
- Once the vault has the real key, the trigger will successfully authenticate against the edge function

### Also verify `supabase_url` vault entry
The same trigger also reads a vault secret named `supabase_url`. We should verify this is also set correctly, and fix it if needed using:
```sql
DELETE FROM vault.secrets WHERE name = 'supabase_url';
SELECT vault.create_secret(
  current_setting('supabase.supabase_url', true),
  'supabase_url'
);
```

