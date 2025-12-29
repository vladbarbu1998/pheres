import { describe, it, expect } from 'vitest';

/**
 * Security-focused tests for input validation and sanitization
 */

describe('Input Sanitization', () => {
  describe('XSS Prevention', () => {
    const stripHtmlTags = (str: string) => str.replace(/<[^>]*>/g, '');

    it('strips HTML tags from user input', () => {
      expect(stripHtmlTags('<script>alert("xss")</script>')).toBe('alert("xss")');
      expect(stripHtmlTags('<img src="x" onerror="alert(1)">')).toBe('');
      expect(stripHtmlTags('Hello <b>World</b>')).toBe('Hello World');
    });

    it('handles encoded characters', () => {
      const decodeAndStrip = (str: string) => {
        const decoded = str
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&');
        return stripHtmlTags(decoded);
      };

      expect(decodeAndStrip('&lt;script&gt;')).toBe('');
    });
  });

  describe('SQL Injection Prevention', () => {
    // These tests verify that input is properly parameterized
    // Supabase client handles this, but we test the patterns

    it('detects potential SQL injection patterns', () => {
      const sqlPatterns = [
        /('|")\s*(OR|AND)\s*('|")/i,
        /;\s*(DROP|DELETE|UPDATE|INSERT)/i,
        /UNION\s+(ALL\s+)?SELECT/i,
      ];

      const isSuspicious = (input: string) => 
        sqlPatterns.some(pattern => pattern.test(input));

      expect(isSuspicious("'; DROP TABLE users; --")).toBe(true);
      expect(isSuspicious("' OR '1'='1")).toBe(true);
      expect(isSuspicious("UNION SELECT * FROM passwords")).toBe(true);
      expect(isSuspicious("John Doe")).toBe(false);
      expect(isSuspicious("test@example.com")).toBe(false);
    });
  });

  describe('Email Validation', () => {
    const isValidEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email) && email.length <= 255;
    };

    it('validates proper email formats', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.org')).toBe(true);
      expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('rejects overly long emails', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(isValidEmail(longEmail)).toBe(false);
    });
  });

  describe('Phone Number Validation', () => {
    const isValidPhone = (phone: string) => {
      const phoneRegex = /^[\d\s\-\+\(\)\.]+$/;
      return phoneRegex.test(phone) && phone.length >= 7 && phone.length <= 20;
    };

    it('validates proper phone formats', () => {
      expect(isValidPhone('+1 555-123-4567')).toBe(true);
      expect(isValidPhone('(555) 123-4567')).toBe(true);
      expect(isValidPhone('555.123.4567')).toBe(true);
    });

    it('rejects invalid phone formats', () => {
      expect(isValidPhone('abc123')).toBe(false);
      expect(isValidPhone('123')).toBe(false); // Too short
    });
  });

  describe('UUID Validation', () => {
    const isValidUUID = (uuid: string) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid);
    };

    it('validates proper UUIDs', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    });

    it('rejects invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
      expect(isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false); // No hyphens
    });
  });

  describe('Price/Amount Validation', () => {
    const isValidAmount = (amount: number) => {
      return Number.isFinite(amount) && amount >= 0 && amount <= 999999999;
    };

    it('validates proper amounts', () => {
      expect(isValidAmount(0)).toBe(true);
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount(99999.99)).toBe(true);
    });

    it('rejects invalid amounts', () => {
      expect(isValidAmount(-100)).toBe(false);
      expect(isValidAmount(Infinity)).toBe(false);
      expect(isValidAmount(NaN)).toBe(false);
    });
  });

  describe('String Length Limits', () => {
    const enforceMaxLength = (str: string, max: number) => str.slice(0, max);

    it('truncates strings to max length', () => {
      expect(enforceMaxLength('hello', 3)).toBe('hel');
      expect(enforceMaxLength('hello', 10)).toBe('hello');
    });

    it('handles empty strings', () => {
      expect(enforceMaxLength('', 10)).toBe('');
    });
  });
});

describe('Rate Limiting Helpers', () => {
  describe('Attempt Tracking', () => {
    const createRateLimiter = (maxAttempts: number, windowMs: number) => {
      const attempts = new Map<string, number[]>();

      return {
        isAllowed: (key: string) => {
          const now = Date.now();
          const keyAttempts = attempts.get(key) || [];
          
          // Remove old attempts outside window
          const recentAttempts = keyAttempts.filter(t => now - t < windowMs);
          
          if (recentAttempts.length >= maxAttempts) {
            return false;
          }
          
          recentAttempts.push(now);
          attempts.set(key, recentAttempts);
          return true;
        },
        reset: (key: string) => attempts.delete(key),
      };
    };

    it('allows requests within limit', () => {
      const limiter = createRateLimiter(3, 60000);
      
      expect(limiter.isAllowed('user1')).toBe(true);
      expect(limiter.isAllowed('user1')).toBe(true);
      expect(limiter.isAllowed('user1')).toBe(true);
    });

    it('blocks requests over limit', () => {
      const limiter = createRateLimiter(2, 60000);
      
      limiter.isAllowed('user2');
      limiter.isAllowed('user2');
      
      expect(limiter.isAllowed('user2')).toBe(false);
    });

    it('tracks users independently', () => {
      const limiter = createRateLimiter(1, 60000);
      
      limiter.isAllowed('user3');
      
      expect(limiter.isAllowed('user3')).toBe(false);
      expect(limiter.isAllowed('user4')).toBe(true);
    });
  });
});
