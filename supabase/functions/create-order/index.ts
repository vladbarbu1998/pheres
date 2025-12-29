import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Security: Restrict CORS to allowed origins
const ALLOWED_ORIGINS = [
  "https://lovable.dev",
  "https://www.lovable.dev",
  "https://pheres.com",
  "https://www.pheres.com",
  "https://sbyfgresripeilehcoru.lovableproject.com",
  "https://pheres.lovable.app",
];

const getCorsHeaders = (origin: string | null) => {
  // Check if origin is allowed (includes *.lovable.dev, *.lovableproject.com, *.lovable.app)
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || 
    origin.endsWith('.lovable.dev') || 
    origin.endsWith('.lovableproject.com') ||
    origin.endsWith('.lovable.app')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

// Input validation constants
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_ADDRESS_LENGTH = 200;
const MAX_NOTES_LENGTH = 2000;
const MAX_QUANTITY_PER_ITEM = 10;
const MAX_CART_ITEMS = 50;

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
  // Honeypot fields for bot detection
  _hp_name?: string;
  _hp_email?: string;
  _hp_time?: number;
}

// Validation helper functions
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const sanitizeString = (str: string, maxLength: number): string => {
  return str.trim().slice(0, maxLength);
};

const isValidPhoneNumber = (phone: string): boolean => {
  // Allow international phone formats
  const phoneRegex = /^[\d\s\-\+\(\)\.]{6,30}$/;
  return phoneRegex.test(phone);
};

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
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

    let body: OrderRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { customer_email, shipping_address, cart_items, customer_notes, _hp_name, _hp_email, _hp_time } = body;

    // ====== HONEYPOT VALIDATION (Bot Detection) ======
    
    // Check if honeypot fields are filled (bots will fill these)
    if (_hp_name || _hp_email) {
      console.log("Honeypot triggered - bot detected, rejecting order");
      return new Response(
        JSON.stringify({ error: "Order validation failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if form was submitted too quickly (less than 3 seconds)
    if (_hp_time !== undefined && _hp_time < 3000) {
      console.log(`Form submitted too quickly (${_hp_time}ms) - potential bot, rejecting order`);
      return new Response(
        JSON.stringify({ error: "Order validation failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ====== INPUT VALIDATION ======

    // Validate required fields exist
    if (!customer_email || !shipping_address || !cart_items) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: customer_email, shipping_address, cart_items" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format and length
    if (typeof customer_email !== "string" || customer_email.length > MAX_EMAIL_LENGTH) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email.trim())) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate cart_items is an array with items
    if (!Array.isArray(cart_items) || cart_items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Cart cannot be empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate cart size limit
    if (cart_items.length > MAX_CART_ITEMS) {
      return new Response(
        JSON.stringify({ error: `Cart cannot contain more than ${MAX_CART_ITEMS} items` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate each cart item
    for (const item of cart_items) {
      // Validate productId is a valid UUID
      if (!item.productId || typeof item.productId !== "string" || !isValidUUID(item.productId)) {
        return new Response(
          JSON.stringify({ error: "Invalid product ID in cart" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate variantId if present
      if (item.variantId !== null && item.variantId !== undefined) {
        if (typeof item.variantId !== "string" || !isValidUUID(item.variantId)) {
          return new Response(
            JSON.stringify({ error: "Invalid variant ID in cart" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Validate quantity is a positive integer within limits
      if (
        typeof item.quantity !== "number" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > MAX_QUANTITY_PER_ITEM
      ) {
        return new Response(
          JSON.stringify({ error: `Quantity must be between 1 and ${MAX_QUANTITY_PER_ITEM}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate shipping address
    if (typeof shipping_address !== "object" || shipping_address === null) {
      return new Response(
        JSON.stringify({ error: "Invalid shipping address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requiredAddressFields = ["first_name", "last_name", "address_line_1", "city", "postal_code", "country"];
    for (const field of requiredAddressFields) {
      const value = (shipping_address as any)[field];
      if (!value || typeof value !== "string" || value.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: `Missing required address field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate address field lengths
    if (shipping_address.first_name.length > MAX_NAME_LENGTH ||
        shipping_address.last_name.length > MAX_NAME_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Name fields must be less than ${MAX_NAME_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (shipping_address.address_line_1.length > MAX_ADDRESS_LENGTH ||
        (shipping_address.address_line_2 && shipping_address.address_line_2.length > MAX_ADDRESS_LENGTH) ||
        shipping_address.city.length > MAX_ADDRESS_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Address fields must be less than ${MAX_ADDRESS_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate phone if provided
    if (shipping_address.phone && shipping_address.phone.trim().length > 0) {
      if (!isValidPhoneNumber(shipping_address.phone)) {
        return new Response(
          JSON.stringify({ error: "Invalid phone number format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate customer notes length
    if (customer_notes && customer_notes.length > MAX_NOTES_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Notes must be less than ${MAX_NOTES_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ====== SANITIZE INPUTS ======
    const sanitizedEmail = customer_email.trim().toLowerCase();
    const sanitizedAddress = {
      first_name: sanitizeString(shipping_address.first_name, MAX_NAME_LENGTH),
      last_name: sanitizeString(shipping_address.last_name, MAX_NAME_LENGTH),
      address_line_1: sanitizeString(shipping_address.address_line_1, MAX_ADDRESS_LENGTH),
      address_line_2: shipping_address.address_line_2 
        ? sanitizeString(shipping_address.address_line_2, MAX_ADDRESS_LENGTH) 
        : null,
      city: sanitizeString(shipping_address.city, MAX_ADDRESS_LENGTH),
      state: shipping_address.state 
        ? sanitizeString(shipping_address.state, MAX_ADDRESS_LENGTH) 
        : null,
      postal_code: sanitizeString(shipping_address.postal_code, 20),
      country: sanitizeString(shipping_address.country, MAX_NAME_LENGTH),
      phone: shipping_address.phone 
        ? sanitizeString(shipping_address.phone, 30) 
        : null,
    };
    const sanitizedNotes = customer_notes 
      ? sanitizeString(customer_notes, MAX_NOTES_LENGTH) 
      : null;

    // ====== FETCH AND VALIDATE PRODUCTS ======
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
    const shippingAmount = 0;
    const taxAmount = 0;
    const discountAmount = 0;
    const total = subtotal + shippingAmount + taxAmount - discountAmount;

    // Create the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user?.id || null,
        customer_email: sanitizedEmail,
        status: "pending",
        subtotal,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total,
        shipping_first_name: sanitizedAddress.first_name,
        shipping_last_name: sanitizedAddress.last_name,
        shipping_address_line_1: sanitizedAddress.address_line_1,
        shipping_address_line_2: sanitizedAddress.address_line_2,
        shipping_city: sanitizedAddress.city,
        shipping_state: sanitizedAddress.state,
        shipping_postal_code: sanitizedAddress.postal_code,
        shipping_country: sanitizedAddress.country,
        shipping_phone: sanitizedAddress.phone,
        customer_notes: sanitizedNotes,
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

    console.log(`Order created successfully: ${order.order_number}`);

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
