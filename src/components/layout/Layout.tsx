"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BackToTop } from "./BackToTop";
import { PageTransition } from "./PageTransition";
interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <PageTransition key={pathname}>
        <main className="flex-1">{children}</main>
      </PageTransition>
      <Footer />
      <BackToTop />
    </div>
  );
}