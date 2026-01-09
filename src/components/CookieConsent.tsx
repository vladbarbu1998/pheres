import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getConsentStatus, setAnalyticsConsent, type ConsentStatus } from "@/hooks/useAnalytics";

export function CookieConsent() {
  const [status, setStatus] = useState<ConsentStatus>('pending');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check consent status on mount
    const currentStatus = getConsentStatus();
    setStatus(currentStatus);
    
    // Show banner if consent is pending (with small delay for better UX)
    if (currentStatus === 'pending') {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setAnalyticsConsent('granted');
    setStatus('granted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    setAnalyticsConsent('denied');
    setStatus('denied');
    setIsVisible(false);
  };

  // Don't render if already responded
  if (status !== 'pending' && !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="mx-auto max-w-2xl">
            <div className="relative rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg p-4 md:p-6">
              {/* Close button */}
              <button
                onClick={handleDecline}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Decline cookies"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Icon */}
                <div className="hidden sm:flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 pr-6 sm:pr-0">
                  <p className="text-sm text-foreground">
                    We use cookies to enhance your experience and analyze site traffic.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    By clicking "Accept", you consent to our use of analytics cookies.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDecline}
                    className="flex-1 sm:flex-none"
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAccept}
                    className="flex-1 sm:flex-none"
                  >
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
