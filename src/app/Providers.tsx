"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { CookieConsent } from "@/components/CookieConsent";
import { useState, Suspense } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Suspense fallback={null}>{children}</Suspense>
              <Toaster />
              <Sonner />
              <Suspense fallback={null}>
                <CookieConsent />
              </Suspense>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
