import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  productId: string;
  variantId: string | null;
  quantity: number;
}

interface ShippingAddress {
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
}

interface OrderRequest {
  customer_email: string;
  shipping_address: ShippingAddress;
  cart_items: CartItem[];
  customer_notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Get auth header for user context
    const authHeader = req.headers.get("Authorization");
    
    // Create service client for server-side operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create user client to get user info if authenticated
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    // Get user if authenticated
    const { data: { user } } = await supabaseUser.auth.getUser();

    const body: OrderRequest = await req.json();
    const { customer_email, shipping_address, cart_items, customer_notes } = body;

    // Validate required fields
    if (!customer_email || !shipping_address || !cart_items || cart_items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate shipping address
    if (!shipping_address.first_name || !shipping_address.last_name ||
        !shipping_address.address_line_1 || !shipping_address.city ||
        !shipping_address.postal_code || !shipping_address.country) {
      return new Response(
        JSON.stringify({ error: "Missing required address fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch products and variants from database to calculate server-side totals
    const productIds = [...new Set(cart_items.map(item => item.productId))];
    const variantIds = cart_items.map(item => item.variantId).filter(Boolean) as string[];

    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select(`
        id,
        name,
        base_price,
        sku,
        is_active,
        product_images (
          image_url,
          is_primary
        )
      `)
      .in("id", productIds);

    if (productsError || !products) {
      console.error("Error fetching products:", productsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch products" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check all products are active
    const inactiveProducts = products.filter(p => !p.is_active);
    if (inactiveProducts.length > 0) {
      return new Response(
        JSON.stringify({ error: "Some products are no longer available" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let variants: any[] = [];
    if (variantIds.length > 0) {
      const { data: variantsData, error: variantsError } = await supabaseAdmin
        .from("product_variants")
        .select("id, name, price_adjustment, sku, is_active")
        .in("id", variantIds);

      if (variantsError) {
        console.error("Error fetching variants:", variantsError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch product variants" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      variants = variantsData || [];

      // Check all variants are active
      const inactiveVariants = variants.filter(v => !v.is_active);
      if (inactiveVariants.length > 0) {
        return new Response(
          JSON.stringify({ error: "Some product variants are no longer available" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Calculate order items and totals (SERVER-SIDE - source of truth)
    const orderItems: any[] = [];
    let subtotal = 0;

    for (const item of cart_items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return new Response(
          JSON.stringify({ error: `Product not found: ${item.productId}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const variant = item.variantId ? variants.find(v => v.id === item.variantId) : null;
      const unitPrice = product.base_price + (variant?.price_adjustment || 0);
      const totalPrice = unitPrice * item.quantity;

      const primaryImage = product.product_images?.find((img: any) => img.is_primary);
      const firstImage = product.product_images?.[0];

      orderItems.push({
        product_id: product.id,
        variant_id: item.variantId,
        product_name: product.name,
        variant_name: variant?.name || null,
        sku: variant?.sku || product.sku,
        unit_price: unitPrice,
        quantity: item.quantity,
        total_price: totalPrice,
        image_url: primaryImage?.image_url || firstImage?.image_url || null,
      });

      subtotal += totalPrice;
    }

    // TODO: Calculate shipping and tax based on address
    const shippingAmount = 0; // Placeholder
    const taxAmount = 0; // Placeholder
    const discountAmount = 0;
    const total = subtotal + shippingAmount + taxAmount - discountAmount;

    // Create the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user?.id || null,
        customer_email,
        status: "pending",
        subtotal,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total,
        shipping_first_name: shipping_address.first_name,
        shipping_last_name: shipping_address.last_name,
        shipping_address_line_1: shipping_address.address_line_1,
        shipping_address_line_2: shipping_address.address_line_2 || null,
        shipping_city: shipping_address.city,
        shipping_state: shipping_address.state || null,
        shipping_postal_code: shipping_address.postal_code,
        shipping_country: shipping_address.country,
        shipping_phone: shipping_address.phone || null,
        customer_notes: customer_notes || null,
        // TODO: Payment integration - mark payment_status when Stripe is added
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Error creating order:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Attempt to clean up the order
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return new Response(
        JSON.stringify({ error: "Failed to create order items" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clear the user's cart if authenticated
    if (user) {
      await supabaseAdmin
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);
    }

    // TODO: Send order confirmation email via order-emails function

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        order_number: order.order_number,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});