// Google Analytics 4 E-commerce Tracking Hook
// Uses gtag.js for event tracking with consent management

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const GA_MEASUREMENT_ID = 'G-VT4Q7FEFJ7';
const CONSENT_KEY = 'pheres_analytics_consent';

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

// Set consent and update gtag
export function setAnalyticsConsent(status: 'granted' | 'denied') {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(CONSENT_KEY, status);
  
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'ad_storage': status,
      'ad_user_data': status,
      'ad_personalization': status,
      'analytics_storage': status
    });
  }
}

// Check if tracking is allowed
function canTrack(): boolean {
  return getConsentStatus() === 'granted' && typeof window !== 'undefined' && !!window.gtag;
}

// Track page view
export function trackPageView(path?: string) {
  if (!canTrack()) return;
  
  window.gtag!('event', 'page_view', {
    page_path: path || window.location.pathname,
    page_location: window.location.href,
    page_title: document.title
  });
}

// Track product view
export function trackViewItem(product: AnalyticsProduct) {
  if (!canTrack()) return;
  
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

// Track add to cart
export function trackAddToCart(product: AnalyticsProduct, quantity: number = 1) {
  if (!canTrack()) return;
  
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

// Track remove from cart
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

// Track view cart
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
  if (!canTrack()) return;
  
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

// Track purchase
export function trackPurchase(order: AnalyticsOrder) {
  if (!canTrack()) return;
  
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
    getConsentStatus,
    setAnalyticsConsent
  };
}
