import { forwardRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Package, MapPin, Heart, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { name: "Overview", href: "/account", icon: User },
  { name: "Orders", href: "/account/orders", icon: Package },
  { name: "Addresses", href: "/account/addresses", icon: MapPin },
  { name: "Favorites", href: "/account/favorites", icon: Heart },
  { name: "Account Details", href: "/account/details", icon: Settings },
];

interface AccountLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export const AccountLayout = forwardRef<HTMLDivElement, AccountLayoutProps>(
  function AccountLayout({ children, title, description }, ref) {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut } = useAuth();

    const handleSignOut = async () => {
      await signOut();
      navigate("/");
    };

    return (
      <div ref={ref} className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-8 lg:py-12">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-muted-foreground">{description}</p>
              )}
            </div>

            <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
              {/* Sidebar Navigation */}
              <aside className="lg:w-64 lg:shrink-0">
                {/* Mobile: Horizontal scrollable navigation */}
                <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-col lg:gap-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.href ||
                      (item.href !== "/account" && location.pathname.startsWith(item.href));
                    
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:gap-3 lg:px-4 lg:py-3",
                          isActive
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0 lg:h-5 lg:w-5" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}

                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="flex items-center justify-start gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground lg:gap-3 lg:px-4 lg:py-3 h-auto"
                  >
                    <LogOut className="h-4 w-4 shrink-0 lg:h-5 lg:w-5" />
                    <span className="truncate">Sign Out</span>
                  </Button>
                </nav>
              </aside>

              {/* Main Content - consistent min height to prevent layout shift */}
              <div className="flex-1 min-w-0 min-h-[400px]">{children}</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
);
