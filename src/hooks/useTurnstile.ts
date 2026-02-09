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

export function useTurnstile(): UseTurnstileReturn {
  const [token, setToken] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const onVerify = useCallback((t: string) => {
    setToken(t);
  }, []);

  const onExpire = useCallback(() => {
    setToken(null);
  }, []);

  const onError = useCallback(() => {
    setToken(null);
  }, []);

  const verifyToken = useCallback(async (): Promise<boolean> => {
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
    setToken(null);
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
