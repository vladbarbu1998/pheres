"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageTransition } from "@/components/layout/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  
  Star,
  Mail,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  FileText,
  Building2,
  Gem,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Collections", href: "/admin/collections", icon: FolderOpen },
  { title: "Categories", href: "/admin/categories", icon: FolderOpen },
  { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { title: "Customers", href: "/admin/customers", icon: Users },
  
  { title: "Celebrities", href: "/admin/celebrities", icon: Star },
  { title: "Press Outlets", href: "/admin/press-outlets", icon: Building2 },
  { title: "Press Articles", href: "/admin/press-articles", icon: FileText },
  { title: "Inbox", href: "/admin/inbox", icon: Mail },
  { title: "Couture Inquiries", href: "/admin/couture-inquiries", icon: Gem },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  backLink?: string;
}

export function AdminLayout({ children, title, description, backLink }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-muted/30 font-body">
      {/* Mobile header */}
      <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-semibold">Pheres Admin</span>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link href="/admin" className="text-lg font-semibold">
            Pheres Admin
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-3.5rem)]">
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : (pathname?.startsWith(item.href) ?? false);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Site
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </ScrollArea>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64">
        <PageTransition key={pathname}>
          <div className="py-6 px-4 lg:px-8 xl:px-12">
            {(title || backLink) && (
              <div className="mb-6">
                {backLink && (
                  <Link
                    href={backLink}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Link>
                )}
                {title && <h1 className="text-2xl font-semibold">{title}</h1>}
                {description && <p className="text-muted-foreground mt-1">{description}</p>}
              </div>
            )}
            {children}
          </div>
        </PageTransition>
      </main>
    </div>
  );
}