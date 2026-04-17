"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseTurnstileReturn {
  token: string | null;
  isTokenReady: boolean;
  isVerifying: boolean;
  onVerify: (token: string) => void;
  onExpire: () => void;
  onError: () => void;
  verifyToken: () => Promise<boolean>;
  resetToken: () => void;
}

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export function useTurnstile(): UseTurnstileReturn {
  const [token, setToken] = useState<string | null>(isLocalhost ? "localhost-bypass" : null);
  const [isVerifying, setIsVerifying] = useState(false);

  const onVerify = useCallback((t: string) => {
    setToken(t);
  }, []);

  const onExpire = useCallback(() => {
    if (!isLocalhost) setToken(null);
  }, []);

  const onError = useCallback(() => {
    if (!isLocalhost) setToken(null);
  }, []);

  const verifyToken = useCallback(async (): Promise<boolean> => {
    if (isLocalhost) return true;

    if (!token) return false;

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-turnstile", {
        body: { token },
      });

      if (error) return false;
      return data?.success === true;
    } catch {
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [token]);

  const resetToken = useCallback(() => {
    if (!isLocalhost) setToken(null);
  }, []);

  return {
    token,
    isTokenReady: !!token,
    isVerifying,
    onVerify,
    onExpire,
    onError,
    verifyToken,
    resetToken,
  };
}