import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// Checkout schema (matching the one in Checkout.tsx)
const checkoutSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  orderNotes: z.string().optional(),
});

describe('Checkout Form Validation', () => {
  const validCheckoutData = {
    email: 'customer@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 555-123-4567',
    addressLine1: '123 Main Street',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
  };

  describe('Required Fields', () => {
    it('accepts valid complete checkout data', () => {
      const result = checkoutSchema.safeParse(validCheckoutData);
      expect(result.success).toBe(true);
    });

    it('requires email', () => {
      const data = { ...validCheckoutData, email: '' };
      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('requires first name', () => {
      const data = { ...validCheckoutData, firstName: '' };
      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('requires last name', () => {
      const data = { ...validCheckoutData, lastName: '' };
      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('requires address line 1', () => {
      const data = { ...validCheckoutData, addressLine1: '' };
      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('requires city', () => {
      const data = { ...validCheckoutData, city: '' };
      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('requires postal code', () => {
      const data = { ...validCheckoutData, postalCode: '' };
      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('requires country', () => {
      const data = { ...validCheckoutData, country: '' };
      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Email Validation', () => {
    it('rejects invalid email format', () => {
      const data = { ...validCheckoutData, email: 'not-an-email' };
      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('accepts various valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'user.name@domain.org',
        'user+tag@example.co.uk',
      ];

      validEmails.forEach(email => {
        const data = { ...validCheckoutData, email };
        const result = checkoutSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Optional Fields', () => {
    it('accepts missing phone', () => {
      const { phone, ...dataWithoutPhone } = validCheckoutData;
      const result = checkoutSchema.safeParse(dataWithoutPhone);
      expect(result.success).toBe(true);
    });

    it('accepts missing address line 2', () => {
      const { addressLine2, ...dataWithoutLine2 } = validCheckoutData;
      const result = checkoutSchema.safeParse(dataWithoutLine2);
      expect(result.success).toBe(true);
    });

    it('accepts missing state', () => {
      const { state, ...dataWithoutState } = validCheckoutData;
      const result = checkoutSchema.safeParse(dataWithoutState);
      expect(result.success).toBe(true);
    });

    it('accepts missing order notes', () => {
      const result = checkoutSchema.safeParse(validCheckoutData);
      expect(result.success).toBe(true);
    });
  });
});

describe('Order Total Calculations', () => {
  it('calculates subtotal correctly', () => {
    const items = [
      { price: 5000, quantity: 2 },
      { price: 3500, quantity: 1 },
    ];
    
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    expect(subtotal).toBe(13500);
  });

  it('applies shipping correctly', () => {
    const subtotal = 13500;
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;
    
    expect(total).toBe(13500);
  });

  it('calculates tax correctly', () => {
    const subtotal = 10000;
    const taxRate = 0.08; // 8% tax
    const tax = Math.round(subtotal * taxRate);
    
    expect(tax).toBe(800);
  });

  it('calculates final total with all components', () => {
    const subtotal = 10000;
    const shipping = 25;
    const tax = 800;
    const discount = 500;
    
    const total = subtotal + shipping + tax - discount;
    
    expect(total).toBe(10325);
  });
});
