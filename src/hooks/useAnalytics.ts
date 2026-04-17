// Google Analytics 4 & Facebook Pixel E-commerce Tracking Hook
// Uses gtag.js and fbq for event tracking with consent management

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
  }
}

const GA_MEASUREMENT_ID = 'G-VT4Q7FEFJ7';
const FB_PIXEL_ID = '333602597245288';
const CONSENT_KEY = 'pheres_analytics_consent';
const MARKETING_CONSENT_KEY = 'pheres_marketing_consent';

export type ConsentStatus = 'granted' | 'denied' | 'pending';

export interface AnalyticsProduct {
  id: string;
  name: string;
  price: number;
  category?: string | null;
  variant?: string | null;
  quantity?: number;
}

export interface AnalyticsOrder {
  orderId: string;
  orderNumber: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  items: AnalyticsProduct[];
}

// Get consent status from localStorage
export function getConsentStatus(): ConsentStatus {
  if (typeof window === 'undefined') return 'pending';
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored === 'granted' || stored === 'denied') return stored;
  return 'pending';
}

// Get marketing consent status from localStorage
export function getMarketingConsentStatus(): ConsentStatus {
  if (typeof window === 'undefined') return 'pending';
  const stored = localStorage.getItem(MARKETING_CONSENT_KEY);
  if (stored === 'granted' || stored === 'denied') return stored;
  return 'pending';
}

// Set analytics consent and update gtag
export function setAnalyticsConsent(status: 'granted' | 'denied') {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(CONSENT_KEY, status);
  
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': status
    });
  }
}

// Set marketing consent and update gtag + fbq
export function setMarketingConsent(status: 'granted' | 'denied') {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(MARKETING_CONSENT_KEY, status);
  
  // Update Google Ads consent
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'ad_storage': status,
      'ad_user_data': status,
      'ad_personalization': status
    });
  }
  
  // Update Facebook Pixel consent
  if (window.fbq) {
    if (status === 'granted') {
      window.fbq('consent', 'grant');
      // Send PageView after granting consent
      window.fbq('track', 'PageView');
    } else {
      window.fbq('consent', 'revoke');
    }
  }
}

// Check if analytics tracking is allowed
function canTrack(): boolean {
  return getConsentStatus() === 'granted' && typeof window !== 'undefined' && !!window.gtag;
}

// Check if marketing/Facebook tracking is allowed
function canTrackMarketing(): boolean {
  return getMarketingConsentStatus() === 'granted' && typeof window !== 'undefined' && !!window.fbq;
}

// Track page view
export function trackPageView(path?: string) {
  // GA4 tracking
  if (canTrack()) {
    window.gtag!('event', 'page_view', {
      page_path: path || window.location.pathname,
      page_location: window.location.href,
      page_title: document.title
    });
  }
  
  // Facebook Pixel tracking
  if (canTrackMarketing()) {
    window.fbq!('track', 'PageView');
  }
}

// Track product view
export function trackViewItem(product: AnalyticsProduct) {
  // GA4 tracking
  if (canTrack()) {
    window.gtag!('event', 'view_item', {
      currency: 'USD',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category || undefined,
        item_variant: product.variant || undefined,
        quantity: 1
      }]
    });
  }
  
  // Facebook Pixel tracking
  if (canTrackMarketing()) {
    window.fbq!('track', 'ViewContent', {
      content_ids: [product.id],
      content_type: 'product',
      content_name: product.name,
      content_category: product.category || '',
      currency: 'USD',
      value: product.price
    });
  }
}

// Track add to cart
export function trackAddToCart(product: AnalyticsProduct, quantity: number = 1) {
  // GA4 tracking
  if (canTrack()) {
    window.gtag!('event', 'add_to_cart', {
      currency: 'USD',
      value: product.price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category || undefined,
        item_variant: product.variant || undefined,
        quantity
      }]
    });
  }
  
  // Facebook Pixel tracking
  if (canTrackMarketing()) {
    window.fbq!('track', 'AddToCart', {
      content_ids: [product.id],
      content_type: 'product',
      content_name: product.name,
      content_category: product.category || '',
      currency: 'USD',
      value: product.price * quantity,
      num_items: quantity
    });
  }
}

// Track remove from cart (GA4 only - no FB equivalent)
export function trackRemoveFromCart(product: AnalyticsProduct, quantity: number = 1) {
  if (!canTrack()) return;
  
  window.gtag!('event', 'remove_from_cart', {
    currency: 'USD',
    value: product.price * quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      item_category: product.category || undefined,
      item_variant: product.variant || undefined,
      quantity
    }]
  });
}

// Track view cart (GA4 only)
export function trackViewCart(items: AnalyticsProduct[], totalValue: number) {
  if (!canTrack()) return;
  
  window.gtag!('event', 'view_cart', {
    currency: 'USD',
    value: totalValue,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      item_category: item.category || undefined,
      item_variant: item.variant || undefined,
      quantity: item.quantity || 1
    }))
  });
}

// Track begin checkout
export function trackBeginCheckout(items: AnalyticsProduct[], totalValue: number) {
  // GA4 tracking
  if (canTrack()) {
    window.gtag!('event', 'begin_checkout', {
      currency: 'USD',
      value: totalValue,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        item_category: item.category || undefined,
        item_variant: item.variant || undefined,
        quantity: item.quantity || 1
      }))
    });
  }
  
  // Facebook Pixel tracking
  if (canTrackMarketing()) {
    const numItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    window.fbq!('track', 'InitiateCheckout', {
      content_ids: items.map(item => item.id),
      content_type: 'product',
      currency: 'USD',
      value: totalValue,
      num_items: numItems
    });
  }
}

// Track purchase
export function trackPurchase(order: AnalyticsOrder) {
  // GA4 tracking
  if (canTrack()) {
    window.gtag!('event', 'purchase', {
      currency: 'USD',
      transaction_id: order.orderId,
      value: order.total,
      shipping: order.shipping,
      tax: order.tax,
      coupon: order.discount ? 'discount_applied' : undefined,
      items: order.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        item_category: item.category || undefined,
        item_variant: item.variant || undefined,
        quantity: item.quantity || 1
      }))
    });
  }
  
  // Facebook Pixel tracking
  if (canTrackMarketing()) {
    const numItems = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    window.fbq!('track', 'Purchase', {
      content_ids: order.items.map(item => item.id),
      content_type: 'product',
      currency: 'USD',
      value: order.total,
      num_items: numItems
    });
  }
}

// Track payment info added (Facebook only)
export function trackAddPaymentInfo(totalValue: number) {
  if (canTrackMarketing()) {
    window.fbq!('track', 'AddPaymentInfo', {
      currency: 'USD',
      value: totalValue
    });
  }
}

// Hook for components
export function useAnalytics() {
  return {
    trackPageView,
    trackViewItem,
    trackAddToCart,
    trackRemoveFromCart,
    trackViewCart,
    trackBeginCheckout,
    trackPurchase,
    trackAddPaymentInfo,
    getConsentStatus,
    getMarketingConsentStatus,
    setAnalyticsConsent,
    setMarketingConsent
  };
}
