"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface RateLimitConfig {
  /** Maximum number of attempts allowed within the time window */
  maxAttempts: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Lockout duration in milliseconds after hitting the limit */
  lockoutMs?: number;
  /** Unique key to store rate limit data (for persistence across page reloads) */
  storageKey?: string;
}

interface RateLimitState {
  attempts: number;
  firstAttemptTime: number | null;
  lockedUntil: number | null;
}

interface UseRateLimitReturn {
  /** Check if action is allowed (returns true) or rate limited (returns false) */
  checkRateLimit: () => boolean;
  /** Record an attempt - call this when user performs the action */
  recordAttempt: () => void;
  /** Whether currently rate limited */
  isRateLimited: boolean;
  /** Remaining attempts in current window */
  remainingAttempts: number;
  /** Time until rate limit resets (in seconds) */
  secondsUntilReset: number;
  /** Reset the rate limit state */
  reset: () => void;
}

const DEFAULT_CONFIG: Required<RateLimitConfig> = {
  maxAttempts: 5,
  windowMs: 60 * 1000, // 1 minute
  lockoutMs: 5 * 60 * 1000, // 5 minutes
  storageKey: "",
};

/**
 * Client-side rate limiting hook.
 * 
 * Note: This is a first layer of defense for UX purposes.
 * Server-side rate limiting should also be implemented for security.
 */
export function useRateLimit(config: RateLimitConfig): UseRateLimitReturn {
  const { maxAttempts, windowMs, lockoutMs, storageKey } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const getInitialState = (): RateLimitState => {
    if (storageKey && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`rate_limit_${storageKey}`);
        if (stored) {
          const parsed = JSON.parse(stored) as RateLimitState;
          // Check if lockout has expired
          if (parsed.lockedUntil && Date.now() > parsed.lockedUntil) {
            return { attempts: 0, firstAttemptTime: null, lockedUntil: null };
          }
          // Check if window has expired
          if (parsed.firstAttemptTime && Date.now() - parsed.firstAttemptTime > windowMs) {
            return { attempts: 0, firstAttemptTime: null, lockedUntil: null };
          }
          return parsed;
        }
      } catch {
        // Ignore storage errors
      }
    }
    return { attempts: 0, firstAttemptTime: null, lockedUntil: null };
  };

  const [state, setState] = useState<RateLimitState>(getInitialState);
  const [secondsUntilReset, setSecondsUntilReset] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Persist to localStorage when state changes
  useEffect(() => {
    if (storageKey && typeof window !== "undefined") {
      try {
        localStorage.setItem(`rate_limit_${storageKey}`, JSON.stringify(state));
      } catch {
        // Ignore storage errors
      }
    }
  }, [state, storageKey]);

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      
      if (state.lockedUntil && now < state.lockedUntil) {
        setSecondsUntilReset(Math.ceil((state.lockedUntil - now) / 1000));
      } else if (state.firstAttemptTime && now - state.firstAttemptTime < windowMs) {
        const windowEnd = state.firstAttemptTime + windowMs;
        setSecondsUntilReset(Math.ceil((windowEnd - now) / 1000));
      } else {
        setSecondsUntilReset(0);
        // Window expired, reset state
        if (state.attempts > 0 || state.lockedUntil) {
          setState({ attempts: 0, firstAttemptTime: null, lockedUntil: null });
        }
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.lockedUntil, state.firstAttemptTime, windowMs, state.attempts]);

  const isRateLimited = state.lockedUntil !== null && Date.now() < state.lockedUntil;

  const remainingAttempts = Math.max(0, maxAttempts - state.attempts);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();

    // Check if currently locked out
    if (state.lockedUntil && now < state.lockedUntil) {
      return false;
    }

    // Check if window has expired (reset if so)
    if (state.firstAttemptTime && now - state.firstAttemptTime > windowMs) {
      setState({ attempts: 0, firstAttemptTime: null, lockedUntil: null });
      return true;
    }

    // Check if within limits
    return state.attempts < maxAttempts;
  }, [state.lockedUntil, state.firstAttemptTime, state.attempts, windowMs, maxAttempts]);

  const recordAttempt = useCallback(() => {
    const now = Date.now();

    setState((prev) => {
      // If locked, don't record
      if (prev.lockedUntil && now < prev.lockedUntil) {
        return prev;
      }

      // If window expired, start fresh
      if (prev.firstAttemptTime && now - prev.firstAttemptTime > windowMs) {
        return {
          attempts: 1,
          firstAttemptTime: now,
          lockedUntil: null,
        };
      }

      const newAttempts = prev.attempts + 1;
      const firstTime = prev.firstAttemptTime || now;

      // Check if we've hit the limit
      if (newAttempts >= maxAttempts && lockoutMs) {
        return {
          attempts: newAttempts,
          firstAttemptTime: firstTime,
          lockedUntil: now + lockoutMs,
        };
      }

      return {
        attempts: newAttempts,
        firstAttemptTime: firstTime,
        lockedUntil: null,
      };
    });
  }, [windowMs, maxAttempts, lockoutMs]);

  const reset = useCallback(() => {
    setState({ attempts: 0, firstAttemptTime: null, lockedUntil: null });
    if (storageKey && typeof window !== "undefined") {
      try {
        localStorage.removeItem(`rate_limit_${storageKey}`);
      } catch {
        // Ignore storage errors
      }
    }
  }, [storageKey]);

  return {
    checkRateLimit,
    recordAttempt,
    isRateLimited,
    remainingAttempts,
    secondsUntilReset,
    reset,
  };
}

// Preset configurations for common use cases
export const RATE_LIMIT_PRESETS = {
  /** Login: 5 attempts per minute, 5 min lockout */
  login: {
    maxAttempts: 5,
    windowMs: 60 * 1000,
    lockoutMs: 5 * 60 * 1000,
    storageKey: "login",
  },
  /** Contact form: 3 submissions per 10 minutes, 15 min lockout */
  contactForm: {
    maxAttempts: 3,
    windowMs: 10 * 60 * 1000,
    lockoutMs: 15 * 60 * 1000,
    storageKey: "contact",
  },
  /** Checkout: 3 attempts per 5 minutes, 10 min lockout */
  checkout: {
    maxAttempts: 3,
    windowMs: 5 * 60 * 1000,
    lockoutMs: 10 * 60 * 1000,
    storageKey: "checkout",
  },
  /** Password reset: 3 attempts per 15 minutes, 30 min lockout */
  passwordReset: {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000,
    lockoutMs: 30 * 60 * 1000,
    storageKey: "password_reset",
  },
} as const;