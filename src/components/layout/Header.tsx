import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, Search, ShoppingBag, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { SearchDialog } from "@/components/search/SearchDialog";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Our Story", href: "/story" },
  { name: "Celebrities", href: "/celebrities" },
  { name: "Press", href: "/press" },
  { name: "Contact", href: "/contact" },
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
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <Logo className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0" />

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  location.pathname === item.href 
                    ? "text-foreground" 
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 lg:gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Favorites"
              onClick={handleFavoritesClick}
              className="hidden sm:flex"
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Account"
              onClick={handleAccountClick}
              className="hidden sm:flex"
            >
              <User className="h-5 w-5" />
            </Button>
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

        {/* Mobile menu */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 ease-out",
            mobileMenuOpen ? "max-h-[32rem]" : "max-h-0"
          )}
        >
          <div className="container py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "block py-3 text-base font-medium transition-colors hover:text-foreground",
                  location.pathname === item.href 
                    ? "text-foreground" 
                    : "text-muted-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-border/50 pt-4 mt-4 space-y-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="flex w-full items-center gap-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Search className="h-5 w-5" />
                Search
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleAccountClick();
                }}
                className="flex w-full items-center gap-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <User className="h-5 w-5" />
                {user ? "My Account" : "Sign In"}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleFavoritesClick();
                }}
                className="flex w-full items-center gap-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Heart className="h-5 w-5" />
                Favorites
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleCartClick();
                }}
                className="flex w-full items-center gap-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ShoppingBag className="h-5 w-5" />
                Cart
                {itemCount > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}