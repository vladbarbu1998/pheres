import { http, HttpResponse } from 'msw';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://sbyfgresripeilehcoru.supabase.co';

// Mock product data
const mockProducts = [
  {
    id: 'test-product-1',
    name: 'Diamond Eternity Ring',
    slug: 'diamond-eternity-ring',
    base_price: 4500,
    description: 'A stunning diamond eternity ring',
    short_description: 'Elegant diamond ring',
    is_active: true,
    is_featured: true,
    is_bestseller: true,
    is_new: false,
    metal_type: '18K White Gold',
    stone_type: 'Diamond',
    category_id: 'cat-rings',
    product_images: [
      {
        id: 'img-1',
        image_url: '/placeholder.svg',
        is_primary: true,
        display_order: 0,
      },
    ],
    product_collections: [
      { collection_id: 'col-eternity' },
    ],
  },
  {
    id: 'test-product-2',
    name: 'Sapphire Pendant',
    slug: 'sapphire-pendant',
    base_price: 2800,
    description: 'Beautiful sapphire pendant',
    short_description: 'Sapphire necklace',
    is_active: true,
    is_featured: false,
    is_bestseller: false,
    is_new: true,
    metal_type: '18K Yellow Gold',
    stone_type: 'Sapphire',
    category_id: 'cat-necklaces',
    product_images: [
      {
        id: 'img-2',
        image_url: '/placeholder.svg',
        is_primary: true,
        display_order: 0,
      },
    ],
    product_collections: [],
  },
];

const mockCategories = [
  { id: 'cat-rings', name: 'Rings', slug: 'rings', is_active: true },
  { id: 'cat-necklaces', name: 'Necklaces', slug: 'necklaces', is_active: true },
  { id: 'cat-earrings', name: 'Earrings', slug: 'earrings', is_active: true },
];

const mockCollections = [
  { id: 'col-eternity', name: 'Eternity', slug: 'eternity', is_active: true, is_featured: true },
  { id: 'col-bridal', name: 'Bridal', slug: 'bridal', is_active: true, is_featured: true },
];

export const handlers = [
  // Products
  http.get(`${SUPABASE_URL}/rest/v1/products`, ({ request }) => {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    
    if (slug) {
      const product = mockProducts.find(p => p.slug === slug.replace('eq.', ''));
      return HttpResponse.json(product ? [product] : []);
    }
    
    return HttpResponse.json(mockProducts);
  }),

  // Categories
  http.get(`${SUPABASE_URL}/rest/v1/categories`, () => {
    return HttpResponse.json(mockCategories);
  }),

  // Collections
  http.get(`${SUPABASE_URL}/rest/v1/collections`, () => {
    return HttpResponse.json(mockCollections);
  }),

  // Product images
  http.get(`${SUPABASE_URL}/rest/v1/product_images`, () => {
    return HttpResponse.json([]);
  }),

  // Product collections
  http.get(`${SUPABASE_URL}/rest/v1/product_collections`, () => {
    return HttpResponse.json([]);
  }),

  // Product stones
  http.get(`${SUPABASE_URL}/rest/v1/product_stones`, () => {
    return HttpResponse.json([]);
  }),

  // Product variants
  http.get(`${SUPABASE_URL}/rest/v1/product_variants`, () => {
    return HttpResponse.json([]);
  }),

  // Cart items
  http.get(`${SUPABASE_URL}/rest/v1/cart_items`, () => {
    return HttpResponse.json([]);
  }),

  // Favorites
  http.get(`${SUPABASE_URL}/rest/v1/favorites`, () => {
    return HttpResponse.json([]);
  }),

  // Contact messages
  http.post(`${SUPABASE_URL}/rest/v1/contact_messages`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: 'msg-1', ...body }, { status: 201 });
  }),

  // Press entries
  http.get(`${SUPABASE_URL}/rest/v1/press_entries`, () => {
    return HttpResponse.json([]);
  }),

  // News
  http.get(`${SUPABASE_URL}/rest/v1/news`, () => {
    return HttpResponse.json([]);
  }),

  // Create order edge function
  http.post(`${SUPABASE_URL}/functions/v1/create-order`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    
    // Validate required fields
    if (!body.cart_items || !Array.isArray(body.cart_items) || body.cart_items.length === 0) {
      return HttpResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      );
    }

    if (!body.shipping_address) {
      return HttpResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Return successful order
    return HttpResponse.json({
      success: true,
      order_id: 'order-test-123',
      order_number: 'PH-20250101-00001',
    });
  }),

  // Order emails edge function
  http.post(`${SUPABASE_URL}/functions/v1/order-emails`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as Record<string, unknown>;
    
    if (!body.order_id) {
      return HttpResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    return HttpResponse.json({ success: true, message: 'Email queued' });
  }),

  // Auth session
  http.get(`${SUPABASE_URL}/auth/v1/session`, () => {
    return HttpResponse.json({ user: null, session: null });
  }),
];

// Helper to create mock authenticated handlers
export const createAuthenticatedHandlers = (userId: string, email: string) => [
  http.get(`${SUPABASE_URL}/auth/v1/session`, () => {
    return HttpResponse.json({
      user: {
        id: userId,
        email,
        created_at: new Date().toISOString(),
      },
      session: {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_at: Date.now() + 3600000,
      },
    });
  }),
];
