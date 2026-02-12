import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const ALLOWED_ORIGINS = [
  "https://lovable.dev",
  "https://www.lovable.dev",
  "https://sbyfgresripeilehcoru.lovableproject.com",
  "https://pheres.com",
  "https://www.pheres.com",
  "https://pheres.lovable.app",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed =>
    origin === allowed || origin.endsWith('.lovable.dev') || origin.endsWith('.lovableproject.com')
  ) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

const escapeHtml = (str: string): string => {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
};

// Branded confirmation email template
const confirmationEmailHtml = (firstName: string, confirmUrl: string) => `<!DOCTYPE html>
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
            <p style="font-family:'Times New Roman',Times,serif;font-size:20px;font-weight:400;color:#1f1915;margin:0 0 28px 0;line-height:1.4;">Welcome to Pheres${firstName ? `, ${escapeHtml(firstName)}` : ''},</p>
            <p style="font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.75;color:#1f1915;margin:0 0 22px 0;">
              Thank you for creating your account. Please confirm your email address to complete your registration.
            </p>
            <!-- BUTTON -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0;">
              <tr><td align="center" style="text-align:center;">
                <a href="${escapeHtml(confirmUrl)}" style="display:inline-block;background-color:#785829;color:#faf6f3;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:500;letter-spacing:0.08em;text-decoration:none;padding:14px 36px;border-radius:3px;text-transform:uppercase;" target="_blank">Confirm Email Address</a>
              </td></tr>
            </table>
            <p style="font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;line-height:1.6;color:#9a9590;margin:0;">
              If you did not create an account, you may safely ignore this email.
            </p>
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

serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: { email: string; password: string; firstName?: string; lastName?: string; redirectTo?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { email, password, firstName, lastName, redirectTo } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Generate signup link via admin API — this does NOT send the default Supabase email
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: {
          first_name: firstName || "",
          last_name: lastName || "",
        },
        redirectTo: redirectTo || "https://pheres.com/",
      },
    });

    if (error) {
      console.error("generateLink error:", error);
      // Map common errors to user-friendly messages
      if (error.message.includes("already been registered") || error.message.includes("already registered")) {
        return new Response(JSON.stringify({ error: "User already registered" }), {
          status: 422, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const confirmUrl = data?.properties?.action_link;
    if (!confirmUrl) {
      console.error("No action_link returned from generateLink");
      return new Response(JSON.stringify({ error: "Failed to generate confirmation link" }), {
        status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send branded confirmation email via Resend
    console.log(`Sending branded confirmation email to: ${email}`);
    const emailResponse = await resend.emails.send({
      from: "Pheres <noreply@pheres.com>",
      to: [email],
      subject: "Confirm Your Email \u2014 Pheres",
      html: confirmationEmailHtml(firstName || "", confirmUrl),
    });

    console.log("Confirmation email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in custom-signup:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
