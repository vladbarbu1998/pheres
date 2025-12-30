import { Header } from "./Header";
import { Footer } from "./Footer";
import { BackToTop } from "./BackToTop";
import { PageTransition } from "./PageTransition";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <PageTransition key={location.pathname}>
        <main className="flex-1">{children}</main>
      </PageTransition>
      <Footer />
      <BackToTop />
    </div>
  );
}
