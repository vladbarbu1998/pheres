/**
 * Test data and fixtures for E2E tests
 */

export const testUser = {
  email: process.env.E2E_TEST_USER_EMAIL || 'test@pheres.com',
  password: process.env.E2E_TEST_USER_PASSWORD || 'TestPassword123!',
};

export const validShippingAddress = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 555-123-4567',
  addressLine1: '123 Main Street',
  addressLine2: 'Apt 4B',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'US',
};

export const invalidShippingAddress = {
  firstName: '',
  lastName: '',
  email: 'invalid-email',
  phone: '123',
  addressLine1: '',
  city: '',
  postalCode: '',
  country: '',
};

export const validContactForm = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  phone: '+1 555-987-6543',
  subject: 'Product Inquiry',
  message: 'I would like more information about your diamond collection.',
};

export const invalidContactForm = {
  name: '',
  email: 'not-an-email',
  message: '',
};

// Stripe test card numbers
export const stripeTestCards = {
  success: '4242424242424242',
  declined: '4000000000000002',
  insufficientFunds: '4000000000009995',
  expiredCard: '4000000000000069',
};

export const stripeTestCardDetails = {
  number: stripeTestCards.success,
  expMonth: '12',
  expYear: '2030',
  cvc: '123',
};

// Routes for navigation tests
export const routes = {
  home: '/',
  shop: '/shop',
  story: '/story',
  celebrities: '/celebrities',
  contact: '/contact',
  cart: '/cart',
  checkout: '/checkout',
  login: '/account/login',
  register: '/account/register',
  accountOverview: '/account',
  accountOrders: '/account/orders',
  accountAddresses: '/account/addresses',
  accountDetails: '/account/details',
  accountFavorites: '/account/favorites',
};
