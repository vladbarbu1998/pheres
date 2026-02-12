import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_RECIPIENTS = ["andrei@pheres.com", "stanoiloren20@gmail.com"];

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

// Reusable inline styles (matching order-emails branding)
const S = {
  label: `font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#785829;margin:0 0 6px 0;`,
  value: `font-family:'Times New Roman',Times,serif;font-size:16px;color:#1f1915;margin:0;line-height:1.5;`,
  detailBox: `background-color:#faf6f3;border:1px solid #e5e0dd;padding:28px 28px 24px 28px;margin:28px 0;`,
  divider: `border:none;border-top:1px solid #e5e0dd;margin:18px 0;`,
  heading: `font-family:'Times New Roman',Times,serif;font-size:22px;font-weight:400;color:#1f1915;margin:0 0 8px 0;`,
  subtext: `font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;color:#9a9590;margin:0;`,
};

const wrapEmail = (title: string, content: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
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

// Helper to build a detail row
const row = (label: string, value: string) => `
  <p style="${S.label}">${label}</p>
  <p style="${S.value}">${value}</p>
  <hr style="${S.divider}">`;

// Strip trailing divider from last row
const lastRow = (label: string, value: string) => `
  <p style="${S.label}">${label}</p>
  <p style="${S.value}">${value}</p>`;

// ============================================================
// TEMPLATES
// ============================================================

interface ContactData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

interface CoutureInquiryData {
  name: string;
  email: string;
  country: string;
  productName: string;
  preferredContact: string;
  phone?: string;
  message?: string;
  interestedInViewing?: boolean;
}

interface ConciergeInquiryData {
  name: string;
  email: string;
  country: string;
  preferredContact: string;
  phone?: string;
  message?: string;
}

const templates = {
  contact: {
    subject: (data: ContactData) => `New Contact Message: ${data.name}`,
    getHtml: (data: ContactData) => wrapEmail("New Contact Message", `
      <p style="${S.heading}">New Contact Message</p>
      <p style="${S.subtext}">Received from the website contact form</p>
      <div style="${S.detailBox}">
        ${row("Name", escapeHtml(data.name))}
        ${row("Email", escapeHtml(data.email))}
        ${data.subject ? row("Subject", escapeHtml(data.subject)) : ""}
        ${lastRow("Message", escapeHtml(data.message).replace(/\n/g, "<br>"))}
      </div>
    `),
  },

  couture_inquiry: {
    subject: (data: CoutureInquiryData) => `New Couture Inquiry: ${data.productName}`,
    getHtml: (data: CoutureInquiryData) => wrapEmail("New Couture Inquiry", `
      <p style="${S.heading}">New Couture Inquiry</p>
      <p style="${S.subtext}">A client has expressed interest in a couture piece</p>
      <div style="${S.detailBox}">
        ${row("Product", escapeHtml(data.productName))}
        ${row("Name", escapeHtml(data.name))}
        ${row("Email", escapeHtml(data.email))}
        ${row("Country", escapeHtml(data.country))}
        ${row("Preferred Contact", escapeHtml(data.preferredContact))}
        ${data.phone ? row("Phone", escapeHtml(data.phone)) : ""}
        ${row("Interested in Viewing", data.interestedInViewing ? "Yes" : "No")}
        ${data.message ? lastRow("Message", escapeHtml(data.message).replace(/\n/g, "<br>")) : ""}
      </div>
    `),
  },

  concierge_inquiry: {
    subject: (data: ConciergeInquiryData) => `New Concierge Inquiry: ${data.name}`,
    getHtml: (data: ConciergeInquiryData) => wrapEmail("New Concierge Inquiry", `
      <p style="${S.heading}">New Concierge Inquiry</p>
      <p style="${S.subtext}">A client has requested concierge services</p>
      <div style="${S.detailBox}">
        ${row("Name", escapeHtml(data.name))}
        ${row("Email", escapeHtml(data.email))}
        ${row("Country", escapeHtml(data.country))}
        ${row("Preferred Contact", escapeHtml(data.preferredContact))}
        ${data.phone ? row("Phone", escapeHtml(data.phone)) : ""}
        ${data.message ? lastRow("Message", escapeHtml(data.message).replace(/\n/g, "<br>")) : ""}
      </div>
    `),
  },
};

type FormType = keyof typeof templates;
const VALID_TYPES: FormType[] = ["contact", "couture_inquiry", "concierge_inquiry"];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    let body: { type: string; [key: string]: unknown };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { type, ...data } = body;

    if (!type || !VALID_TYPES.includes(type as FormType)) {
      return new Response(
        JSON.stringify({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const template = templates[type as FormType];
    const subject = template.subject(data as any);
    const html = template.getHtml(data as any);

    console.log(`Sending admin notification for ${type} form submission`);

    const emailResponse = await resend.emails.send({
      from: "Pheres <orders@pheres.com>",
      to: ADMIN_RECIPIENTS,
      subject,
      html,
    });

    console.log("Admin notification sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-admin-form:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
