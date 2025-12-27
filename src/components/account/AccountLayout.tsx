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

export function AccountLayout({ children, title, description }: AccountLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
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
              <nav className="flex flex-row gap-1 overflow-x-auto pb-4 lg:flex-col lg:gap-1 lg:pb-0">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href ||
                    (item.href !== "/account" && location.pathname.startsWith(item.href));
                  
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                        isActive
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}

                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="flex items-center justify-start gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  Sign Out
                </Button>
              </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
