import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Security: Restrict CORS to allowed origins
const ALLOWED_ORIGINS = [
  "https://lovable.dev",
  "https://www.lovable.dev",
  "https://sbyfgresripeilehcoru.lovableproject.com",
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

// Email templates for each order status
const emailTemplates = {
  pending: {
    subject: "Order Confirmation - Pheres",
    getHtml: (order: OrderData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Georgia', serif; background: #faf9f7; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: #1a1a1a; padding: 40px 30px; text-align: center; }
          .header h1 { color: #785829; margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 4px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 20px; }
          .message { color: #4a4a4a; line-height: 1.7; margin-bottom: 30px; }
          .order-details { background: #faf9f7; padding: 25px; border-radius: 4px; margin-bottom: 30px; }
          .order-number { font-size: 14px; color: #785829; margin-bottom: 15px; letter-spacing: 1px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e5e5; }
          .detail-row:last-child { border-bottom: none; font-weight: 600; }
          .detail-label { color: #666; }
          .detail-value { color: #1a1a1a; }
          .address-block { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5; }
          .address-title { font-size: 12px; color: #785829; letter-spacing: 1px; margin-bottom: 10px; }
          .address { color: #4a4a4a; line-height: 1.6; }
          .footer { background: #1a1a1a; padding: 30px; text-align: center; }
          .footer p { color: #888; font-size: 12px; margin: 5px 0; }
          .footer a { color: #785829; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PHERES</h1>
          </div>
          <div class="content">
            <p class="greeting">Dear ${escapeHtml(order.shipping_first_name)},</p>
            <p class="message">
              Thank you for your order. We're delighted to confirm that we've received your order and it's being prepared with care.
            </p>
            <div class="order-details">
              <div class="order-number">ORDER ${escapeHtml(order.order_number)}</div>
              <div class="detail-row">
                <span class="detail-label">Subtotal</span>
                <span class="detail-value">$${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Shipping</span>
                <span class="detail-value">$${Number(order.shipping_amount).toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Tax</span>
                <span class="detail-value">$${Number(order.tax_amount).toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total</span>
                <span class="detail-value">$${Number(order.total).toFixed(2)}</span>
              </div>
              <div class="address-block">
                <div class="address-title">SHIPPING TO</div>
                <div class="address">
                  ${escapeHtml(order.shipping_first_name)} ${escapeHtml(order.shipping_last_name)}<br>
                  ${escapeHtml(order.shipping_address_line_1)}<br>
                  ${order.shipping_address_line_2 ? escapeHtml(order.shipping_address_line_2) + '<br>' : ''}
                  ${escapeHtml(order.shipping_city)}, ${order.shipping_state ? escapeHtml(order.shipping_state) : ''} ${escapeHtml(order.shipping_postal_code)}<br>
                  ${escapeHtml(order.shipping_country)}
                </div>
              </div>
            </div>
            <p class="message">
              We'll send you another email when your order ships. If you have any questions, please don't hesitate to reach out.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Pheres. All rights reserved.</p>
            <p><a href="#">View your order</a> · <a href="#">Contact us</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  paid: {
    subject: "Payment Received - Pheres",
    getHtml: (order: OrderData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Georgia', serif; background: #faf9f7; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: #1a1a1a; padding: 40px 30px; text-align: center; }
          .header h1 { color: #785829; margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 4px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 20px; }
          .message { color: #4a4a4a; line-height: 1.7; margin-bottom: 30px; }
          .status-badge { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 8px 16px; border-radius: 4px; font-size: 14px; margin-bottom: 20px; }
          .order-summary { background: #faf9f7; padding: 25px; border-radius: 4px; }
          .order-number { font-size: 14px; color: #785829; margin-bottom: 10px; letter-spacing: 1px; }
          .total { font-size: 20px; color: #1a1a1a; }
          .footer { background: #1a1a1a; padding: 30px; text-align: center; }
          .footer p { color: #888; font-size: 12px; margin: 5px 0; }
          .footer a { color: #785829; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PHERES</h1>
          </div>
          <div class="content">
            <p class="greeting">Dear ${escapeHtml(order.shipping_first_name)},</p>
            <span class="status-badge">✓ Payment Confirmed</span>
            <p class="message">
              We've received your payment and your order is now being processed. Our artisans are preparing your jewelry with the utmost care.
            </p>
            <div class="order-summary">
              <div class="order-number">ORDER ${escapeHtml(order.order_number)}</div>
              <div class="total">Total Paid: $${Number(order.total).toFixed(2)}</div>
            </div>
            <p class="message" style="margin-top: 30px;">
              We'll notify you as soon as your order ships. Thank you for choosing Pheres.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Pheres. All rights reserved.</p>
            <p><a href="#">View your order</a> · <a href="#">Contact us</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  processing: {
    subject: "Your Order is Being Prepared - Pheres",
    getHtml: (order: OrderData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Georgia', serif; background: #faf9f7; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: #1a1a1a; padding: 40px 30px; text-align: center; }
          .header h1 { color: #785829; margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 4px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 20px; }
          .message { color: #4a4a4a; line-height: 1.7; margin-bottom: 30px; }
          .status-badge { display: inline-block; background: #e3f2fd; color: #1565c0; padding: 8px 16px; border-radius: 4px; font-size: 14px; margin-bottom: 20px; }
          .order-number { font-size: 14px; color: #785829; letter-spacing: 1px; }
          .footer { background: #1a1a1a; padding: 30px; text-align: center; }
          .footer p { color: #888; font-size: 12px; margin: 5px 0; }
          .footer a { color: #785829; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PHERES</h1>
          </div>
          <div class="content">
            <p class="greeting">Dear ${escapeHtml(order.shipping_first_name)},</p>
            <span class="status-badge">⏳ Processing</span>
            <p class="message">
              Great news! Your order is now being prepared by our skilled artisans. Each piece is carefully inspected to ensure it meets our exacting standards.
            </p>
            <p class="order-number">ORDER ${escapeHtml(order.order_number)}</p>
            <p class="message" style="margin-top: 30px;">
              You'll receive a shipping notification once your order is on its way.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Pheres. All rights reserved.</p>
            <p><a href="#">View your order</a> · <a href="#">Contact us</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  shipped: {
    subject: "Your Order Has Shipped! - Pheres",
    getHtml: (order: OrderData) => {
      // Validate tracking URL before including it
      const safeTrackingUrl = order.tracking_url && isValidHttpUrl(order.tracking_url) 
        ? order.tracking_url 
        : null;
      
      return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Georgia', serif; background: #faf9f7; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: #1a1a1a; padding: 40px 30px; text-align: center; }
          .header h1 { color: #785829; margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 4px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 20px; }
          .message { color: #4a4a4a; line-height: 1.7; margin-bottom: 30px; }
          .status-badge { display: inline-block; background: #e8eaf6; color: #3949ab; padding: 8px 16px; border-radius: 4px; font-size: 14px; margin-bottom: 20px; }
          .tracking-box { background: #faf9f7; padding: 25px; border-radius: 4px; margin-bottom: 30px; }
          .tracking-label { font-size: 12px; color: #785829; letter-spacing: 1px; margin-bottom: 10px; }
          .tracking-number { font-size: 18px; color: #1a1a1a; font-family: monospace; }
          .tracking-link { display: inline-block; background: #785829; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
          .address-block { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5; }
          .address-title { font-size: 12px; color: #785829; letter-spacing: 1px; margin-bottom: 10px; }
          .address { color: #4a4a4a; line-height: 1.6; }
          .footer { background: #1a1a1a; padding: 30px; text-align: center; }
          .footer p { color: #888; font-size: 12px; margin: 5px 0; }
          .footer a { color: #785829; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PHERES</h1>
          </div>
          <div class="content">
            <p class="greeting">Dear ${escapeHtml(order.shipping_first_name)},</p>
            <span class="status-badge">📦 Shipped</span>
            <p class="message">
              Your order is on its way! We've carefully packaged your jewelry and it's now en route to you.
            </p>
            <div class="tracking-box">
              <div class="tracking-label">TRACKING NUMBER</div>
              <div class="tracking-number">${order.tracking_number ? escapeHtml(order.tracking_number) : 'Tracking information will be available soon'}</div>
              ${safeTrackingUrl ? `<a href="${escapeHtml(safeTrackingUrl)}" class="tracking-link">Track Your Package</a>` : ''}
              <div class="address-block">
                <div class="address-title">DELIVERING TO</div>
                <div class="address">
                  ${escapeHtml(order.shipping_first_name)} ${escapeHtml(order.shipping_last_name)}<br>
                  ${escapeHtml(order.shipping_address_line_1)}<br>
                  ${order.shipping_address_line_2 ? escapeHtml(order.shipping_address_line_2) + '<br>' : ''}
                  ${escapeHtml(order.shipping_city)}, ${order.shipping_state ? escapeHtml(order.shipping_state) : ''} ${escapeHtml(order.shipping_postal_code)}<br>
                  ${escapeHtml(order.shipping_country)}
                </div>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Pheres. All rights reserved.</p>
            <p><a href="#">View your order</a> · <a href="#">Contact us</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
    },
  },

  delivered: {
    subject: "Your Order Has Been Delivered - Pheres",
    getHtml: (order: OrderData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Georgia', serif; background: #faf9f7; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: #1a1a1a; padding: 40px 30px; text-align: center; }
          .header h1 { color: #785829; margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 4px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 20px; }
          .message { color: #4a4a4a; line-height: 1.7; margin-bottom: 30px; }
          .status-badge { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 8px 16px; border-radius: 4px; font-size: 14px; margin-bottom: 20px; }
          .cta-box { background: #faf9f7; padding: 30px; border-radius: 4px; text-align: center; margin-bottom: 30px; }
          .cta-text { color: #4a4a4a; margin-bottom: 20px; }
          .cta-button { display: inline-block; background: #785829; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; }
          .footer { background: #1a1a1a; padding: 30px; text-align: center; }
          .footer p { color: #888; font-size: 12px; margin: 5px 0; }
          .footer a { color: #785829; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PHERES</h1>
          </div>
          <div class="content">
            <p class="greeting">Dear ${escapeHtml(order.shipping_first_name)},</p>
            <span class="status-badge">✓ Delivered</span>
            <p class="message">
              Your order has been delivered! We hope you love your new jewelry as much as we loved creating it for you.
            </p>
            <p class="message">
              Each Pheres piece is designed to be treasured for generations. We'd love to know what you think.
            </p>
            <div class="cta-box">
              <p class="cta-text">Continue your collection with more timeless pieces.</p>
              <a href="#" class="cta-button">Explore New Arrivals</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Pheres. All rights reserved.</p>
            <p><a href="#">Care instructions</a> · <a href="#">Contact us</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  cancelled: {
    subject: "Order Cancelled - Pheres",
    getHtml: (order: OrderData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Georgia', serif; background: #faf9f7; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: #1a1a1a; padding: 40px 30px; text-align: center; }
          .header h1 { color: #785829; margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 4px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 20px; }
          .message { color: #4a4a4a; line-height: 1.7; margin-bottom: 30px; }
          .status-badge { display: inline-block; background: #ffebee; color: #c62828; padding: 8px 16px; border-radius: 4px; font-size: 14px; margin-bottom: 20px; }
          .order-summary { background: #faf9f7; padding: 25px; border-radius: 4px; margin-bottom: 30px; }
          .order-number { font-size: 14px; color: #785829; margin-bottom: 10px; letter-spacing: 1px; }
          .refund-info { color: #4a4a4a; font-size: 14px; }
          .footer { background: #1a1a1a; padding: 30px; text-align: center; }
          .footer p { color: #888; font-size: 12px; margin: 5px 0; }
          .footer a { color: #785829; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PHERES</h1>
          </div>
          <div class="content">
            <p class="greeting">Dear ${escapeHtml(order.shipping_first_name)},</p>
            <span class="status-badge">✕ Order Cancelled</span>
            <p class="message">
              Your order has been cancelled as requested. We're sorry to see you go.
            </p>
            <div class="order-summary">
              <div class="order-number">ORDER ${escapeHtml(order.order_number)}</div>
              <p class="refund-info">If a payment was made, your refund will be processed within 5-10 business days.</p>
            </div>
            <p class="message">
              If you have any questions about your cancellation or would like assistance with a future order, please don't hesitate to contact us.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Pheres. All rights reserved.</p>
            <p><a href="#">Contact us</a> · <a href="#">Return to shop</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  refunded: {
    subject: "Refund Processed - Pheres",
    getHtml: (order: OrderData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Georgia', serif; background: #faf9f7; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: #1a1a1a; padding: 40px 30px; text-align: center; }
          .header h1 { color: #785829; margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 4px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 20px; }
          .message { color: #4a4a4a; line-height: 1.7; margin-bottom: 30px; }
          .status-badge { display: inline-block; background: #f5f5f5; color: #616161; padding: 8px 16px; border-radius: 4px; font-size: 14px; margin-bottom: 20px; }
          .refund-box { background: #faf9f7; padding: 25px; border-radius: 4px; margin-bottom: 30px; }
          .order-number { font-size: 14px; color: #785829; margin-bottom: 10px; letter-spacing: 1px; }
          .refund-amount { font-size: 24px; color: #1a1a1a; margin: 15px 0; }
          .refund-note { color: #666; font-size: 14px; }
          .footer { background: #1a1a1a; padding: 30px; text-align: center; }
          .footer p { color: #888; font-size: 12px; margin: 5px 0; }
          .footer a { color: #785829; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PHERES</h1>
          </div>
          <div class="content">
            <p class="greeting">Dear ${escapeHtml(order.shipping_first_name)},</p>
            <span class="status-badge">↩ Refund Processed</span>
            <p class="message">
              Your refund has been processed. The funds will be returned to your original payment method.
            </p>
            <div class="refund-box">
              <div class="order-number">ORDER ${escapeHtml(order.order_number)}</div>
              <div class="refund-amount">$${Number(order.total).toFixed(2)}</div>
              <p class="refund-note">Please allow 5-10 business days for the refund to appear in your account.</p>
            </div>
            <p class="message">
              We hope to have the opportunity to serve you again in the future.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Pheres. All rights reserved.</p>
            <p><a href="#">Contact us</a> · <a href="#">Return to shop</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
};

// Admin notification template
const adminOrderNotification = (order: OrderData) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; }
      h1 { color: #1a1a1a; font-size: 20px; margin-bottom: 20px; }
      .order-info { background: #f9f9f9; padding: 20px; border-radius: 4px; margin-bottom: 20px; }
      .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
      .row:last-child { border-bottom: none; }
      .label { color: #666; }
      .value { color: #1a1a1a; font-weight: 600; }
      .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; text-transform: uppercase; }
      .status.pending { background: #fff3cd; color: #856404; }
      .status.paid { background: #d1ecf1; color: #0c5460; }
      .status.shipped { background: #d4edda; color: #155724; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>New Order Received</h1>
      <div class="order-info">
        <div class="row">
          <span class="label">Order Number</span>
          <span class="value">${escapeHtml(order.order_number)}</span>
        </div>
        <div class="row">
          <span class="label">Customer</span>
          <span class="value">${escapeHtml(order.shipping_first_name)} ${escapeHtml(order.shipping_last_name)}</span>
        </div>
        <div class="row">
          <span class="label">Email</span>
          <span class="value">${order.customer_email ? escapeHtml(order.customer_email) : 'N/A'}</span>
        </div>
        <div class="row">
          <span class="label">Total</span>
          <span class="value">$${Number(order.total).toFixed(2)}</span>
        </div>
        <div class="row">
          <span class="label">Status</span>
          <span class="value"><span class="status ${escapeHtml(order.status)}">${escapeHtml(order.status)}</span></span>
        </div>
      </div>
      <p style="color: #666; font-size: 14px;">Log in to the admin dashboard to view full order details.</p>
    </div>
  </body>
  </html>
`;

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
}

interface EmailRequest {
  order_id: string;
  status: string;
  previous_status?: string;
  notify_admin?: boolean;
  admin_email?: string;
}

// Valid order statuses
const VALID_STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

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

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
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

    if (!customerEmail) {
      console.error("No customer email found for order:", order_id);
      return new Response(
        JSON.stringify({ error: "No customer email found" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const orderData: OrderData = {
      ...order,
      customer_email: customerEmail,
    };

    const results: { customer?: any; admin?: any } = {};

    // Get email template for this status
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

    // Send admin notification for new orders
    if (notify_admin && admin_email && status === "pending") {
      console.log(`Sending admin notification to: ${admin_email}`);
      
      const adminEmailResponse = await resend.emails.send({
        from: "Pheres Orders <orders@pheres.com>",
        to: [admin_email],
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
