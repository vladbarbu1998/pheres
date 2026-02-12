-- Convert any existing "processing" orders to "paid" (they're equivalent)
UPDATE orders SET status = 'paid' WHERE status = 'processing';

-- Recreate the enum without "processing"
ALTER TYPE order_status RENAME TO order_status_old;
CREATE TYPE order_status AS ENUM ('pending','paid','shipped','delivered','cancelled','refunded');
ALTER TABLE orders ALTER COLUMN status TYPE order_status USING status::text::order_status;
DROP TYPE order_status_old;
