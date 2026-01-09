import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { LegalLayout } from "@/components/layout/LegalLayout";
import { Button } from "@/components/ui/button";
import { setAnalyticsConsent, getConsentStatus } from "@/hooks/useAnalytics";
import { toast } from "sonner";

export default function CookiePolicy() {
  const handleUpdateConsent = (status: 'granted' | 'denied') => {
    setAnalyticsConsent(status);
    toast.success(status === 'granted' 
      ? "Analytics cookies enabled" 
      : "Analytics cookies disabled"
    );
  };

  const currentConsent = getConsentStatus();

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
          </ul>
        </section>

        {/* Your Choices */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Your Cookie Choices
          </h2>
          <p>
            When you first visit our website, you will see a cookie consent banner asking for your permission to use analytics cookies. You can change your preferences at any time using the buttons below:
          </p>
          
          <div className="rounded-lg border border-border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Current preference: <strong className="text-foreground">{currentConsent === 'granted' ? 'Analytics Enabled' : currentConsent === 'denied' ? 'Analytics Disabled' : 'Not Set'}</strong>
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => handleUpdateConsent('granted')}
                variant={currentConsent === 'granted' ? 'default' : 'outline'}
              >
                Accept Analytics Cookies
              </Button>
              <Button 
                onClick={() => handleUpdateConsent('denied')}
                variant={currentConsent === 'denied' ? 'default' : 'outline'}
              >
                Decline Analytics Cookies
              </Button>
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
            <Link to="/privacy-policy" className="text-primary hover:underline">
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
            <Link to="/contact" className="text-primary hover:underline">
              Contact Form
            </Link>
          </p>
        </section>
      </LegalLayout>
    </Layout>
  );
}
