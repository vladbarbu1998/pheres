"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { LegalLayout } from "@/components/layout/LegalLayout";
import { Button } from "@/components/ui/button";
import { 
  setAnalyticsConsent, 
  setMarketingConsent,
  getConsentStatus, 
  getMarketingConsentStatus 
} from "@/hooks/useAnalytics";
import { toast } from "sonner";

export default function CookiePolicy() {
  const [analyticsConsent, setAnalyticsConsentState] = useState(getConsentStatus());
  const [marketingConsent, setMarketingConsentState] = useState(getMarketingConsentStatus());

  useEffect(() => {
    setAnalyticsConsentState(getConsentStatus());
    setMarketingConsentState(getMarketingConsentStatus());
  }, []);

  const handleUpdateAnalytics = (status: 'granted' | 'denied') => {
    setAnalyticsConsent(status);
    setAnalyticsConsentState(status);
    toast.success(status === 'granted' 
      ? "Analytics cookies enabled" 
      : "Analytics cookies disabled"
    );
  };

  const handleUpdateMarketing = (status: 'granted' | 'denied') => {
    setMarketingConsent(status);
    setMarketingConsentState(status);
    toast.success(status === 'granted' 
      ? "Marketing cookies enabled" 
      : "Marketing cookies disabled"
    );
  };

  return (
    <Layout>
      <LegalLayout
        title="Cookie Policy"
        lastUpdated="January 9, 2026"
      >
        {/* Introduction */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            What Are Cookies?
          </h2>
          <p>
            Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help the website remember your preferences, understand how you use the site, and improve your overall experience.
          </p>
          <p>
            This Cookie Policy explains how <span className="brand-word">Pheres</span> ("we", "us", or "our") uses cookies and similar technologies on our website pheres.com.
          </p>
        </section>

        {/* Types of Cookies */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Types of Cookies We Use
          </h2>
          
          <div className="space-y-6">
            <div className="rounded-lg border border-border p-4">
              <h3 className="font-medium text-foreground mb-2">Essential Cookies</h3>
              <p className="text-sm text-muted-foreground mb-2">
                These cookies are necessary for the website to function properly. They enable core features such as security, network management, and accessibility. You cannot opt out of these cookies.
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li><strong>Authentication cookies</strong> – Remember your login status</li>
                <li><strong>Cart cookies</strong> – Store your shopping cart contents</li>
                <li><strong>Security cookies</strong> – Protect against fraudulent activity</li>
                <li><strong>Theme preference</strong> – Remember your light/dark mode choice</li>
                <li><strong>Cookie consent</strong> – Remember your cookie preferences</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border p-4">
              <h3 className="font-medium text-foreground mb-2">Analytics Cookies</h3>
              <p className="text-sm text-muted-foreground mb-2">
                These cookies help us understand how visitors interact with our website. We use this information to improve our site's performance and user experience. These cookies are optional.
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li><strong>Google Analytics (GA4)</strong> – Tracks page views, user sessions, and site interactions</li>
                <li><strong>E-commerce tracking</strong> – Measures product views, add-to-cart actions, and purchases</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Data collected:</strong> Pages visited, time spent on site, browser type, device type, geographic location (country/city level), referral source, and anonymized user behavior patterns.
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <h3 className="font-medium text-foreground mb-2">Marketing Cookies</h3>
              <p className="text-sm text-muted-foreground mb-2">
                These cookies are used to deliver personalized advertisements and measure the effectiveness of our marketing campaigns. These cookies are optional.
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li><strong>Facebook Pixel (Meta)</strong> – Tracks conversions, builds audiences for ad targeting, and measures ad performance</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Data collected:</strong> Product views, add-to-cart events, checkout initiation, purchases, and page views for remarketing purposes.
              </p>
            </div>
          </div>
        </section>

        {/* Data We Collect */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Data We Collect Through Forms
          </h2>
          <p>
            In addition to cookies, we collect personal information when you voluntarily submit it through our website forms:
          </p>
          
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-medium text-foreground mb-2">Account Registration & Login</h3>
              <p className="text-sm text-muted-foreground">
                First name, last name, email address, and password (encrypted).
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-medium text-foreground mb-2">Checkout & Orders</h3>
              <p className="text-sm text-muted-foreground">
                Email address, shipping address (first name, last name, street address, city, state/province, postal code, country), phone number (optional), and order notes.
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-medium text-foreground mb-2">Contact Form</h3>
              <p className="text-sm text-muted-foreground">
                Full name, email address, phone number (optional), subject (optional), and message.
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-medium text-foreground mb-2">Couture Inquiry</h3>
              <p className="text-sm text-muted-foreground">
                Full name, email address, country, phone number (optional), preferred contact method, interest in viewing pieces, and message.
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-medium text-foreground mb-2">Address Book</h3>
              <p className="text-sm text-muted-foreground">
                Label (e.g., Home, Office), first name, last name, address lines, city, state/province, postal code, country, and phone number.
              </p>
            </div>
          </div>
        </section>

        {/* Third-Party Cookies */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Third-Party Services
          </h2>
          <p>
            We use the following third-party services that may set cookies on your device:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>
              <strong>Google Analytics</strong> – For website analytics and performance measurement. 
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                Google's Privacy Policy
              </a>
            </li>
            <li>
              <strong>Facebook/Meta Pixel</strong> – For advertising measurement and audience building. 
              <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                Meta's Privacy Policy
              </a>
            </li>
          </ul>
        </section>

        {/* Your Choices */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Your Cookie Choices
          </h2>
          <p>
            When you first visit our website, you will see a cookie consent banner asking for your permission to use cookies. You can change your preferences at any time using the buttons below:
          </p>
          
          <div className="rounded-lg border border-border p-6 space-y-6">
            {/* Analytics Cookies */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">Analytics Cookies</h3>
                <span className="text-sm text-muted-foreground">
                  {analyticsConsent === 'granted' ? 'Enabled' : analyticsConsent === 'denied' ? 'Disabled' : 'Not Set'}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => handleUpdateAnalytics('granted')}
                  variant={analyticsConsent === 'granted' ? 'default' : 'outline'}
                  size="sm"
                >
                  Accept Analytics
                </Button>
                <Button 
                  onClick={() => handleUpdateAnalytics('denied')}
                  variant={analyticsConsent === 'denied' ? 'default' : 'outline'}
                  size="sm"
                >
                  Decline Analytics
                </Button>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">Marketing Cookies</h3>
                <span className="text-sm text-muted-foreground">
                  {marketingConsent === 'granted' ? 'Enabled' : marketingConsent === 'denied' ? 'Disabled' : 'Not Set'}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => handleUpdateMarketing('granted')}
                  variant={marketingConsent === 'granted' ? 'default' : 'outline'}
                  size="sm"
                >
                  Accept Marketing
                </Button>
                <Button 
                  onClick={() => handleUpdateMarketing('denied')}
                  variant={marketingConsent === 'denied' ? 'default' : 'outline'}
                  size="sm"
                >
                  Decline Marketing
                </Button>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            You can also control cookies through your browser settings. Most browsers allow you to block or delete cookies. However, if you block essential cookies, some parts of the website may not function properly.
          </p>
        </section>

        {/* Data Retention */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Data Retention
          </h2>
          <p>
            We retain cookie data and analytics information for up to 26 months. After this period, the data is automatically deleted. Personal information submitted through forms is retained as described in our{" "}
            <Link href="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </section>

        {/* Updates */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Updates to This Policy
          </h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We encourage you to review this page periodically for the latest information.
          </p>
        </section>

        {/* Contact */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Contact Us
          </h2>
          <p>
            If you have any questions about our use of cookies, please contact us:
          </p>
          <p>
            <Link href="/contact" className="text-primary hover:underline">
              Contact Form
            </Link>
          </p>
        </section>
      </LegalLayout>
    </Layout>
  );
}