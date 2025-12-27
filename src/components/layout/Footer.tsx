import { Link } from "react-router-dom";

const footerLinks = {
  shop: [
    { name: "All Jewelry", href: "/shop" },
    { name: "Collections", href: "/shop" },
    { name: "New Arrivals", href: "/shop?sort=newest" },
  ],
  about: [
    { name: "Our Story", href: "/story" },
    { name: "Press", href: "/press" },
    { name: "Contact", href: "/contact" },
  ],
  help: [
    { name: "Shipping & Returns", href: "/shipping" },
    { name: "Care Guide", href: "/care" },
    { name: "FAQ", href: "/faq" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-12 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block">
              <span className="font-display text-xl font-semibold tracking-[0.2em] text-foreground">
                PHERES
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Exquisite jewelry crafted with passion, precision, and timeless elegance.
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

          {/* Help */}
          <div>
            <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
              Help
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.help.map((link) => (
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

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Pheres. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
