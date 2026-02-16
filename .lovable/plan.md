

# Migrate Legacy Metal Data to product_metals Table

## Problem
67 products have metal information stored in the old single-column fields (`metal_type` and `metal_weight` on the `products` table) but do NOT have entries in the `product_metals` join table. The admin product form only reads from `product_metals`, so for these products the Metals section shows "No metals added yet" -- even though the data exists in the old columns.

## Solution
Run a one-time SQL migration that copies the old `metal_type` / `metal_weight` values into the `product_metals` table for every product that has old data but no new entries.

### Step 1 -- Data Migration (SQL)
Insert one row per product into `product_metals` using the existing `metal_type` and `metal_weight` values from the `products` table, but only for products that don't already have entries in `product_metals`.

```sql
INSERT INTO product_metals (product_id, metal_type, metal_weight, display_order)
SELECT p.id, p.metal_type, p.metal_weight, 0
FROM products p
WHERE p.metal_type IS NOT NULL
  AND p.metal_type != ''
  AND p.id NOT IN (SELECT DISTINCT product_id FROM product_metals);
```

This will migrate all 67 products in one step.

### Step 2 -- Verify
After migration, confirm that the metals now appear in the admin product form when editing any of these products.

## What This Does NOT Change
- No frontend code changes needed -- the form already reads from `product_metals` correctly.
- The old `metal_type` / `metal_weight` columns on the `products` table are left untouched (they may still be referenced elsewhere).
- Products that already have `product_metals` entries (61 products) are not affected.

## Risk
Very low. This is an additive INSERT only -- no existing data is modified or deleted.
