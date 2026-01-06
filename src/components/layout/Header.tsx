import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, Search, ShoppingBag, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { SearchDialog } from "@/components/search/SearchDialog";
import { Logo } from "@/components/layout/Logo";
import { CollectionsMegaMenuDesktop, CollectionsMegaMenuMobile } from "@/components/layout/CollectionsMegaMenu";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Collections", href: "/collections", hasMegaMenu: true },
  { name: "Our Story", href: "/story" },
  { name: "Celebrities", href: "/celebrities" },
  { name: "Press", href: "/press" },
  { name: "Gioro", href: "/gioro" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAccountClick = () => {
    if (user) {
      navigate("/account");
    } else {
      navigate(`/account/login?redirect=${encodeURIComponent("/account")}`);
    }
  };

  const handleFavoritesClick = () => {
    if (user) {
      navigate("/account/favorites");
    } else {
      navigate(`/account/login?redirect=${encodeURIComponent("/account/favorites")}`);
    }
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <nav className="container flex h-16 items-center justify-between lg:h-20">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo - centered on mobile */}
          <Logo className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0" />

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {navigation.map((item) =>
              item.hasMegaMenu ? (
                <CollectionsMegaMenuDesktop
                  key={item.name}
                  isActive={location.pathname.startsWith("/collections") || location.pathname.startsWith("/shop/collection")}
                />
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "font-sans text-sm font-medium transition-colors hover:text-foreground relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left",
                    location.pathname === item.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </Link>
              )
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 lg:gap-2">
            {/* Desktop only actions */}
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="hidden lg:flex"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Favorites"
              onClick={handleFavoritesClick}
              className="hidden lg:flex"
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Account"
              onClick={handleAccountClick}
              className="hidden lg:flex"
            >
              <User className="h-5 w-5" />
            </Button>
            
            {/* Cart - always visible */}
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Cart" 
              className="relative"
              onClick={handleCartClick}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Button>
          </div>
        </nav>
      </header>

      {/* Mobile slide-out menu overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile slide-out menu */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-background shadow-xl transition-transform duration-300 ease-out lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Menu header */}
          <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
            <Logo />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Main navigation */}
            <nav className="space-y-1">
              {navigation.map((item) =>
                item.hasMegaMenu ? (
                  <CollectionsMegaMenuMobile
                    key={item.name}
                    onNavigate={() => setMobileMenuOpen(false)}
                  />
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "font-sans block py-3 text-base font-medium transition-colors hover:text-foreground",
                      location.pathname === item.href
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </nav>

            {/* Divider */}
            <div className="my-6 border-t border-border/50" />

            {/* Secondary actions */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="font-sans flex w-full items-center gap-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Search className="h-5 w-5" />
                Search
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleAccountClick();
                }}
                className="font-sans flex w-full items-center gap-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <User className="h-5 w-5" />
                {user ? "My Account" : "Sign In"}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleFavoritesClick();
                }}
                className="font-sans flex w-full items-center gap-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Heart className="h-5 w-5" />
                Favorites
              </button>
            </div>
          </div>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
