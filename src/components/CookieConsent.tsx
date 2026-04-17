"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  getConsentStatus, 
  getMarketingConsentStatus,
  setAnalyticsConsent, 
  setMarketingConsent,
  type ConsentStatus 
} from "@/hooks/useAnalytics";

export function CookieConsent() {
  const [analyticsStatus, setAnalyticsStatus] = useState<ConsentStatus>('pending');
  const [marketingStatus, setMarketingStatus] = useState<ConsentStatus>('pending');
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(true);
  const [marketingChecked, setMarketingChecked] = useState(true);

  useEffect(() => {
    // Check consent status on mount
    const currentAnalytics = getConsentStatus();
    const currentMarketing = getMarketingConsentStatus();
    setAnalyticsStatus(currentAnalytics);
    setMarketingStatus(currentMarketing);
    
    // Show banner if either consent is pending
    if (currentAnalytics === 'pending' || currentMarketing === 'pending') {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    setAnalyticsConsent('granted');
    setMarketingConsent('granted');
    setAnalyticsStatus('granted');
    setMarketingStatus('granted');
    setIsVisible(false);
  };

  const handleDeclineAll = () => {
    setAnalyticsConsent('denied');
    setMarketingConsent('denied');
    setAnalyticsStatus('denied');
    setMarketingStatus('denied');
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    setAnalyticsConsent(analyticsChecked ? 'granted' : 'denied');
    setMarketingConsent(marketingChecked ? 'granted' : 'denied');
    setAnalyticsStatus(analyticsChecked ? 'granted' : 'denied');
    setMarketingStatus(marketingChecked ? 'granted' : 'denied');
    setIsVisible(false);
  };

  // Don't render if both already responded
  const bothResponded = analyticsStatus !== 'pending' && marketingStatus !== 'pending';
  if (bothResponded && !isVisible) return null;

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
                onClick={handleDeclineAll}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Decline cookies"
              >
                <X className="h-4 w-4" />
              </button>

              {!showPreferences ? (
                // Simple view
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="hidden sm:flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Cookie className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 pr-6 sm:pr-0">
                    <p className="text-sm text-foreground">
                      We use cookies to enhance your experience and analyze site traffic.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      By clicking "Accept All", you consent to analytics and marketing cookies.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreferences(true)}
                      className="text-xs"
                    >
                      <Settings2 className="h-3.5 w-3.5 mr-1" />
                      Preferences
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeclineAll}
                      className="flex-1 sm:flex-none"
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAcceptAll}
                      className="flex-1 sm:flex-none"
                    >
                      Accept All
                    </Button>
                  </div>
                </div>
              ) : (
                // Preferences view
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pr-6">
                    <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-primary/10">
                      <Settings2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Cookie Preferences</h3>
                      <p className="text-xs text-muted-foreground">
                        Choose which cookies you'd like to accept.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-b py-4">
                    {/* Essential cookies - always on */}
                    <div className="flex items-start gap-3">
                      <Checkbox checked disabled className="mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Essential</p>
                        <p className="text-xs text-muted-foreground">
                          Required for the website to function properly.
                        </p>
                      </div>
                    </div>

                    {/* Analytics cookies */}
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={analyticsChecked}
                        onCheckedChange={(checked) => setAnalyticsChecked(!!checked)}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="text-sm font-medium">Analytics</p>
                        <p className="text-xs text-muted-foreground">
                          Help us understand how visitors use our site (Google Analytics).
                        </p>
                      </div>
                    </div>

                    {/* Marketing cookies */}
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={marketingChecked}
                        onCheckedChange={(checked) => setMarketingChecked(!!checked)}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="text-sm font-medium">Marketing</p>
                        <p className="text-xs text-muted-foreground">
                          Used for personalized advertising (Facebook Pixel).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreferences(false)}
                    >
                      Back
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSavePreferences}
                    >
                      Save Preferences
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}