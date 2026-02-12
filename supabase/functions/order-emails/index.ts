import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// URL validation helper
const isValidHttpUrl = (str: string): boolean => {
  try {
    const url = new URL(str);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

// HTML escape helper to prevent XSS in email templates
const escapeHtml = (str: string): string => {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
};

// Helper to build product name list from order items
const formatProductNames = (items: OrderItem[]): string => {
  if (!items || items.length === 0) return "Your Pheres creation";
  return items.map(item => {
    const name = escapeHtml(item.product_name);
    return item.quantity > 1 ? `${name} (&times;${item.quantity})` : name;
  }).join("<br>");
};

// ============================================================
// EMAIL LAYOUT — table-based for max email client compatibility
// Matches PHERES site design: #faf6f3 bg, #1f1915 text,
// Times New Roman headings, system sans body, #785829 bronze
// ============================================================

const wrapEmail = (content: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pheres</title>
  <!--[if mso]><style>body,table,td{font-family:Arial,Helvetica,sans-serif!important}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#faf6f3;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#faf6f3;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e5e0dd;">
        <!-- HEADER -->
        <tr>
          <td style="padding:44px 40px 0 40px;text-align:center;">
            <span style="font-family:'Times New Roman',Times,serif;font-size:28px;font-weight:400;letter-spacing:0.2em;color:#785829;">P H E R E S</span>
          </td>
        </tr>
        <!-- THIN GOLD LINE -->
        <tr>
          <td style="padding:20px 44px 0 44px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr><td style="border-top:1px solid #785829;font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>
        <!-- CONTENT -->
        <tr>
          <td style="padding:48px 44px 40px 44px;">
            ${content}
          </td>
        </tr>
        <!-- FOOTER DIVIDER -->
        <tr>
          <td style="padding:0 44px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr><td style="border-top:1px solid #e5e0dd;font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>
        <!-- FOOTER -->
        <tr>
          <td style="padding:28px 44px 36px 44px;text-align:center;">
            <p style="margin:0 0 8px 0;font-family:'Times New Roman',Times,serif;font-size:11px;letter-spacing:0.12em;color:#9a9590;text-transform:uppercase;">&copy; ${new Date().getFullYear()} Pheres</p>
            <a href="https://pheres.com" style="font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;color:#785829;text-decoration:none;letter-spacing:0.02em;">pheres.com</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// Reusable inline styles
const S = {
  greeting: `font-family:'Times New Roman',Times,serif;font-size:20px;font-weight:400;color:#1f1915;margin:0 0 28px 0;line-height:1.4;`,
  body: `font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.75;color:#1f1915;margin:0 0 22px 0;`,
  label: `font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#785829;margin:0 0 6px 0;`,
  value: `font-family:'Times New Roman',Times,serif;font-size:16px;color:#1f1915;margin:0 0 0 0;line-height:1.5;`,
  signature: `font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.7;color:#1f1915;margin:36px 0 0 0;`,
  sigName: `font-family:'Times New Roman',Times,serif;font-style:italic;color:#785829;`,
  detailBox: `background-color:#faf6f3;border:1px solid #e5e0dd;padding:28px 28px 24px 28px;margin:28px 0;`,
  divider: `border:none;border-top:1px solid #e5e0dd;margin:18px 0;`,
  btn: `display:inline-block;background-color:#785829;color:#faf6f3;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:500;letter-spacing:0.08em;text-decoration:none;padding:14px 32px;border-radius:3px;text-transform:uppercase;`,
};

// Email templates for each order status
// pending: NO customer email (admin notification only)
const emailTemplates = {
  paid: {
    subject: "Your Pheres Creation \u2014 Order Confirmed",
    getHtml: (order: OrderData) => wrapEmail(`
            <p style="${S.greeting}">Dear ${escapeHtml(order.shipping_first_name)},</p>
            <p style="${S.body}">
              Thank you for your order with Pheres. We are pleased to confirm that your
              creation has been received and has now entered its production stage.
            </p>
            <div style="${S.detailBox}">
              <p style="${S.label}">Creation</p>
              <p style="${S.value}">${formatProductNames(order.order_items)}</p>
              <hr style="${S.divider}">
              <p style="${S.label}">Order Reference</p>
              <p style="${S.value}">${escapeHtml(order.order_number)}</p>
            </div>
            <p style="${S.body}">
              Each Pheres piece is individually crafted upon order and finalized specifically
              for you, in accordance with our production and quality standards.
            </p>
            <p style="${S.body}">
              Our Client Relations team will keep you informed once your creation is ready
              for dispatch.
            </p>
            <p style="${S.signature}">
              Warm regards,<br>
              <span style="${S.sigName}">Pheres Client Relations</span>
            </p>
    `),
  },

  shipped: {
    subject: "Your Pheres Creation Has Been Dispatched",
    getHtml: (order: OrderData) => {
      const safeTrackingUrl = order.tracking_url && isValidHttpUrl(order.tracking_url)
        ? order.tracking_url
        : null;

      return wrapEmail(`
            <p style="${S.greeting}">Dear ${escapeHtml(order.shipping_first_name)},</p>
            <p style="${S.body}">
              We are pleased to inform you that your creation has been finalized and dispatched.
            </p>
            <div style="${S.detailBox}">
              <p style="${S.label}">Creation</p>
              <p style="${S.value}">${formatProductNames(order.order_items)}</p>
              ${order.carrier ? `
              <hr style="${S.divider}">
              <p style="${S.label}">Carrier</p>
              <p style="${S.value}">${escapeHtml(order.carrier)}</p>
              ` : ''}
              ${order.tracking_number ? `
              <hr style="${S.divider}">
              <p style="${S.label}">Tracking Number</p>
              <p style="${S.value}">${escapeHtml(order.tracking_number)}</p>
              ${safeTrackingUrl ? `
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr><td>
                  <a href="${escapeHtml(safeTrackingUrl)}" style="${S.btn}" target="_blank">Track Shipment</a>
                </td></tr>
              </table>` : ''}
              ` : ''}
            </div>
            <p style="${S.body}">
              We hope you will enjoy your Pheres creation.
            </p>
            <p style="${S.signature}">
              Sincerely,<br>
              <span style="${S.sigName}">Pheres Client Relations</span>
            </p>
      `);
    },
  },

  delivered: {
    subject: "From Pheres, With Our Warmest Regards",
    getHtml: (order: OrderData) => wrapEmail(`
            <p style="${S.greeting}">Dear ${escapeHtml(order.shipping_first_name)},</p>
            <p style="${S.body}">
              We hope your Pheres creation has arrived safely.
            </p>
            <p style="${S.body}">
              Each piece is crafted individually with the intention of becoming a lasting part
              of its owner's personal story.
            </p>
            <p style="${S.body}">
              Should you require any assistance or wish to receive personalized guidance for
              future creations, our Client Relations team remains at your disposal.
            </p>
            <p style="${S.body}">
              We look forward to welcoming you again.
            </p>
            <p style="${S.signature}">
              With our warmest regards,<br>
              <span style="${S.sigName}">Pheres Client Relations</span>
            </p>
    `),
  },

  cancelled: {
    subject: "Order Cancelled \u2014 Pheres",
    getHtml: (order: OrderData) => wrapEmail(`
            <p style="${S.greeting}">Dear ${escapeHtml(order.shipping_first_name)},</p>
            <p style="${S.body}">
              Your order has been cancelled as requested.
            </p>
            <div style="${S.detailBox}">
              <p style="${S.label}">Order Reference</p>
              <p style="${S.value}">${escapeHtml(order.order_number)}</p>
              <hr style="${S.divider}">
              <p style="font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#1f1915;margin:0;">If a payment was made, your refund will be processed within 5\u201310 business days.</p>
            </div>
            <p style="${S.body}">
              Should you have any questions or wish to place a new order in the future,
              our Client Relations team remains at your disposal.
            </p>
            <p style="${S.signature}">
              Warm regards,<br>
              <span style="${S.sigName}">Pheres Client Relations</span>
            </p>
    `),
  },

  refunded: {
    subject: "Refund Processed \u2014 Pheres",
    getHtml: (order: OrderData) => wrapEmail(`
            <p style="${S.greeting}">Dear ${escapeHtml(order.shipping_first_name)},</p>
            <p style="${S.body}">
              Your refund has been processed. The funds will be returned to your original payment method.
            </p>
            <div style="${S.detailBox}">
              <p style="${S.label}">Order Reference</p>
              <p style="${S.value}">${escapeHtml(order.order_number)}</p>
              <hr style="${S.divider}">
              <p style="${S.label}">Refund Amount</p>
              <p style="font-family:'Times New Roman',Times,serif;font-size:22px;color:#1f1915;margin:0;">$${Number(order.total).toFixed(2)}</p>
              <hr style="${S.divider}">
              <p style="font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;line-height:1.6;color:#9a9590;margin:0;">Please allow 5\u201310 business days for the refund to appear in your account.</p>
            </div>
            <p style="${S.body}">
              We hope to have the opportunity to welcome you again in the future.
            </p>
            <p style="${S.signature}">
              Warm regards,<br>
              <span style="${S.sigName}">Pheres Client Relations</span>
            </p>
    `),
  },
};

// Admin notification template
const adminOrderNotification = (order: OrderData) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;border:1px solid #e5e0dd;">
    <tr><td style="padding:30px;">
      <h1 style="color:#1f1915;font-size:20px;margin:0 0 20px 0;">New Order Received</h1>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#faf6f3;padding:20px;border-radius:4px;">
        <tr><td style="padding:10px 16px;border-bottom:1px solid #e5e0dd;color:#9a9590;font-size:14px;">Order Number</td><td style="padding:10px 16px;border-bottom:1px solid #e5e0dd;color:#1f1915;font-weight:600;font-size:14px;text-align:right;">${escapeHtml(order.order_number)}</td></tr>
        <tr><td style="padding:10px 16px;border-bottom:1px solid #e5e0dd;color:#9a9590;font-size:14px;">Customer</td><td style="padding:10px 16px;border-bottom:1px solid #e5e0dd;color:#1f1915;font-weight:600;font-size:14px;text-align:right;">${escapeHtml(order.shipping_first_name)} ${escapeHtml(order.shipping_last_name)}</td></tr>
        <tr><td style="padding:10px 16px;border-bottom:1px solid #e5e0dd;color:#9a9590;font-size:14px;">Email</td><td style="padding:10px 16px;border-bottom:1px solid #e5e0dd;color:#1f1915;font-weight:600;font-size:14px;text-align:right;">${order.customer_email ? escapeHtml(order.customer_email) : 'N/A'}</td></tr>
        <tr><td style="padding:10px 16px;border-bottom:1px solid #e5e0dd;color:#9a9590;font-size:14px;">Total</td><td style="padding:10px 16px;border-bottom:1px solid #e5e0dd;color:#1f1915;font-weight:600;font-size:14px;text-align:right;">$${Number(order.total).toFixed(2)}</td></tr>
        <tr><td style="padding:10px 16px;color:#9a9590;font-size:14px;">Status</td><td style="padding:10px 16px;text-align:right;"><span style="display:inline-block;padding:4px 12px;border-radius:4px;font-size:12px;text-transform:uppercase;background:#fff3cd;color:#856404;">${escapeHtml(order.status)}</span></td></tr>
      </table>
      <p style="color:#9a9590;font-size:13px;margin:20px 0 0 0;">Log in to the admin dashboard to view full order details.</p>
    </td></tr>
  </table>
</body>
</html>`;

interface OrderItem {
  product_name: string;
  quantity: number;
}

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  customer_email?: string;
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_address_line_1: string;
  shipping_address_line_2?: string;
  shipping_city: string;
  shipping_state?: string;
  shipping_postal_code: string;
  shipping_country: string;
  subtotal: number;
  shipping_amount: number;
  tax_amount: number;
  total: number;
  tracking_number?: string;
  tracking_url?: string;
  carrier?: string;
  order_items: OrderItem[];
}

interface EmailRequest {
  order_id: string;
  status: string;
  previous_status?: string;
  notify_admin?: boolean;
  admin_email?: string;
}

// Valid order statuses
const VALID_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"];

// Statuses that skip customer email
const SKIP_CUSTOMER_EMAIL = ["pending"];

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    // Initialize Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ====== AUTHORIZATION CHECK ======
    // Allow calls from: (1) internal services using service_role_key, (2) admin users
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if this is an internal service call (database trigger uses service_role_key)
    const token = authHeader.replace("Bearer ", "");
    const isServiceRoleCall = token === supabaseServiceKey;

    if (!isServiceRoleCall) {
      // Verify the caller is an admin user
      const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const { data: { user } } = await supabaseUser.auth.getUser();

      if (!user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check if user is admin
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: "Forbidden: Admin access required" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    let body: EmailRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { order_id, status, previous_status, notify_admin, admin_email } = body;

    // ====== INPUT VALIDATION ======
    if (!order_id || typeof order_id !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid order_id" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(order_id)) {
      return new Response(
        JSON.stringify({ error: "Invalid order_id format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return new Response(
        JSON.stringify({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate admin_email if provided
    if (admin_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(admin_email)) {
        return new Response(
          JSON.stringify({ error: "Invalid admin_email format" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    console.log(`Processing email for order ${order_id}, status: ${status}, previous: ${previous_status}`);
    console.log(`Received payload:`, JSON.stringify(body));

    // Fetch order details with order items
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(product_name, quantity)")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      console.error("Failed to fetch order:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get customer email - either from order or from profile
    let customerEmail = order.customer_email;
    if (!customerEmail && order.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("user_id", order.user_id)
        .single();
      customerEmail = profile?.email;
    }

    if (!customerEmail && !SKIP_CUSTOMER_EMAIL.includes(status)) {
      console.error("No customer email found for order:", order_id);
      return new Response(
        JSON.stringify({ error: "No customer email found" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const orderData: OrderData = {
      ...order,
      customer_email: customerEmail || "",
      order_items: order.order_items || [],
    };

    const results: { customer?: any; admin?: any } = {};

    // Send customer email (skip for pending status)
    if (!SKIP_CUSTOMER_EMAIL.includes(status)) {
      const template = emailTemplates[status as keyof typeof emailTemplates];
      if (template) {
        console.log(`Sending ${status} email to customer: ${customerEmail}`);

        const emailResponse = await resend.emails.send({
          from: "Pheres <orders@pheres.com>",
          to: [customerEmail],
          subject: template.subject,
          html: template.getHtml(orderData),
        });

        results.customer = emailResponse;
        console.log("Customer email sent:", emailResponse);
      } else {
        console.log(`No template found for status: ${status}`);
      }
    } else {
      console.log(`Skipping customer email for status: ${status}`);
    }

    // Send admin notification for new/paid orders (determine internally —
    // pg_net may not reliably pass the notify_admin boolean from the DB trigger)
    const shouldNotifyAdmin =
      status === "paid" ||
      notify_admin === true;

    if (shouldNotifyAdmin) {
      const defaultAdmins = ["andrei@pheres.com", "stanoiloren20@gmail.com"];
      const adminTo = admin_email ? [admin_email] : (Deno.env.get("ADMIN_EMAIL") ? Deno.env.get("ADMIN_EMAIL")!.split(",") : defaultAdmins);
      console.log(`Sending admin notification to: ${adminTo}`);

      const adminEmailResponse = await resend.emails.send({
        from: "Pheres Orders <orders@pheres.com>",
        to: adminTo,
        subject: `New Order: ${order.order_number}`,
        html: adminOrderNotification(orderData),
      });

      results.admin = adminEmailResponse;
      console.log("Admin email sent:", adminEmailResponse);
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in order-emails function:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
