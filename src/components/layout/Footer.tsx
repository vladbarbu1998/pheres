import { Link } from "react-router-dom";
import { Logo } from "@/components/layout/Logo";

const footerLinks = {
  shop: [
    { name: "All Jewelry", href: "/shop" },
    { name: "Collections", href: "/collections" },
    { name: "New Arrivals", href: "/shop?sort=newest" },
  ],
  about: [
    { name: "Our Story", href: "/story" },
    { name: "Celebrities", href: "/celebrities" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Shipping & Returns", href: "/returns" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-12 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex-1">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Italian Luxury Brand; Fine Jewelry & Couture. A one-of-a-kind luxury experience for powerful and independent women.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
              Shop
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
              About
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Pheres. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}