import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// Contact form schema (matching the one in Contact.tsx)
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

describe('Contact Form Validation', () => {
  describe('Name Field', () => {
    it('accepts valid names', () => {
      const result = contactSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a valid message.',
      });
      
      expect(result.success).toBe(true);
    });

    it('rejects names that are too short', () => {
      const result = contactSchema.safeParse({
        name: 'J',
        email: 'john@example.com',
        message: 'This is a valid message.',
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('2 characters');
      }
    });

    it('rejects empty name', () => {
      const result = contactSchema.safeParse({
        name: '',
        email: 'john@example.com',
        message: 'This is a valid message.',
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('Email Field', () => {
    it('accepts valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.org',
        'user+tag@example.co.uk',
      ];

      validEmails.forEach(email => {
        const result = contactSchema.safeParse({
          name: 'John Doe',
          email,
          message: 'This is a valid message.',
        });
        
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid email addresses', () => {
      const invalidEmails = [
        'not-an-email',
        'missing@domain',
        '@nodomain.com',
        'spaces in@email.com',
      ];

      invalidEmails.forEach(email => {
        const result = contactSchema.safeParse({
          name: 'John Doe',
          email,
          message: 'This is a valid message.',
        });
        
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Message Field', () => {
    it('accepts messages of valid length', () => {
      const result = contactSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a valid message that is long enough.',
      });
      
      expect(result.success).toBe(true);
    });

    it('rejects messages that are too short', () => {
      const result = contactSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Short',
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('Optional Fields', () => {
    it('accepts submission without phone', () => {
      const result = contactSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a valid message.',
      });
      
      expect(result.success).toBe(true);
    });

    it('accepts submission with phone', () => {
      const result = contactSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 555-123-4567',
        message: 'This is a valid message.',
      });
      
      expect(result.success).toBe(true);
    });
  });
});
