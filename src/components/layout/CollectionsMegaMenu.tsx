import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  collection_type: "couture" | "ready_to_wear";
  parent_id: string | null;
}

interface CollectionGroup {
  parent: Collection;
  children: Collection[];
}

function useCollectionsGrouped() {
  return useQuery({
    queryKey: ["collections-grouped"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("id, name, slug, description, image_url, collection_type, parent_id")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;

      const collections = data as Collection[];
      const parents = collections.filter((c) => !c.parent_id);
      const children = collections.filter((c) => c.parent_id);

      const couture = parents.find((p) => p.collection_type === "couture");
      const readyToWear = parents.find((p) => p.collection_type === "ready_to_wear");

      return {
        couture: couture
          ? { parent: couture, children: children.filter((c) => c.parent_id === couture.id) }
          : null,
        readyToWear: readyToWear
          ? { parent: readyToWear, children: children.filter((c) => c.parent_id === readyToWear.id) }
          : null,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Desktop mega menu dropdown - Full width under header
export function CollectionsMegaMenuDesktop({ isActive }: { isActive: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data } = useCollectionsGrouped();

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Link */}
      <button
        className={cn(
          "font-sans text-sm font-medium transition-colors hover:text-foreground flex items-center gap-1.5 bg-transparent border-none cursor-pointer relative py-6",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        Collections
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-300 ease-out",
            isOpen && "rotate-180"
          )}
        />
        {/* Animated underline */}
        <span
          className={cn(
            "absolute bottom-5 left-0 h-[1px] bg-primary transition-all duration-300 ease-out",
            isOpen ? "w-full" : "w-0"
          )}
        />
      </button>

      {/* Full-width dropdown panel */}
      <div
        className={cn(
          "fixed left-0 right-0 z-50 bg-background border-b border-border/50",
          "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "shadow-[0_15px_40px_rgba(0,0,0,0.05)]",
          isOpen
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-4 pointer-events-none"
        )}
        style={{ top: "80px" }} // Match header height (h-20 = 80px)
      >
        <div className="flex">
          {/* Couture Column */}
          <div className="flex-1 border-r border-border/30 transition-colors duration-400 hover:bg-muted/30">
            <div className="container max-w-none px-12 lg:px-20 py-12 flex items-center justify-between gap-8">
              <div className="flex flex-col min-h-[280px]">
                <h3 className="font-label text-2xl font-light text-foreground mb-2 tracking-wide">
                  Couture
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-[280px]">
                  {data?.couture?.parent.description || "One-of-a-kind pieces created for unforgettable moments. By appointment only."}
                </p>

                {/* Child collection links */}
                <nav className="space-y-2.5 mb-auto">
                  {data?.couture?.children.map((child) => (
                    <Link
                      key={child.id}
                      to={`/shop/collection/${child.slug}`}
                      className="block font-label text-base font-normal text-foreground hover:text-primary hover:pl-1.5 transition-all duration-200"
                    >
                      {child.name}
                    </Link>
                  ))}
                  {(!data?.couture?.children || data.couture.children.length === 0) && (
                    <p className="font-label text-base text-muted-foreground/60 italic">Coming soon</p>
                  )}
                </nav>

                {/* CTA - aligned at bottom */}
                <Link
                  to="/collections#couture"
                  className="inline-block mt-6 text-xs font-bold tracking-[0.12em] text-foreground uppercase border-b border-foreground pb-0.5 hover:text-primary hover:border-primary transition-colors self-start"
                >
                  Discover Couture
                </Link>
              </div>

              {/* Image - circular */}
              {data?.couture?.children[0]?.image_url && (
                <div className="w-40 h-40 rounded-full overflow-hidden flex-shrink-0 transition-transform duration-[600ms] ease-out hover:scale-[1.08]">
                  <img
                    src={data.couture.children[0].image_url}
                    alt="Couture collection"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Ready To Wear Column */}
          <div className="flex-1 transition-colors duration-400 hover:bg-muted/30">
            <div className="container max-w-none px-12 lg:px-20 py-12 flex items-center justify-between gap-8">
              <div className="flex flex-col min-h-[280px]">
                <h3 className="font-label text-2xl font-light text-foreground mb-2 tracking-wide">
                  Ready to Wear
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-[280px]">
                  {data?.readyToWear?.parent.description || "Accessible refinement. Iconic collections available online."}
                </p>

                {/* Child collection links */}
                <nav className="space-y-2.5 mb-auto">
                  {data?.readyToWear?.children.map((child) => (
                    <Link
                      key={child.id}
                      to={`/shop/collection/${child.slug}`}
                      className="block font-label text-base font-normal text-foreground hover:text-primary hover:pl-1.5 transition-all duration-200"
                    >
                      {child.name}
                    </Link>
                  ))}
                </nav>

                {/* CTA - aligned at bottom */}
                <Link
                  to="/shop"
                  className="inline-block mt-6 text-xs font-bold tracking-[0.12em] text-foreground uppercase border-b border-foreground pb-0.5 hover:text-primary hover:border-primary transition-colors self-start"
                >
                  Shop Online
                </Link>
              </div>

              {/* Image - circular */}
              {data?.readyToWear?.children[0]?.image_url && (
                <div className="w-40 h-40 rounded-full overflow-hidden flex-shrink-0 transition-transform duration-[600ms] ease-out hover:scale-[1.08]">
                  <img
                    src={data.readyToWear.children[0].image_url}
                    alt="Ready To Wear collection"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// Mobile expandable section
export function CollectionsMegaMenuMobile({ onNavigate }: { onNavigate: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data } = useCollectionsGrouped();

  return (
    <div>
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="font-sans flex w-full items-center justify-between py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Collections
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-transform duration-300 ease-out",
            isExpanded && "rotate-90"
          )}
        />
      </button>

      {/* Expandable content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pb-6 pl-4 space-y-8">
          {/* Couture Section */}
          <div>
            <h4 className="font-heading text-lg font-normal italic text-foreground mb-2">
              Couture
            </h4>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              One-of-a-kind pieces by inquiry only.
            </p>
            <nav className="space-y-2.5 mb-4">
              {data?.couture?.children.map((child) => (
                <Link
                  key={child.id}
                  to={`/shop/collection/${child.slug}`}
                  onClick={onNavigate}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {child.name}
                </Link>
              ))}
              {(!data?.couture?.children || data.couture.children.length === 0) && (
                <p className="text-xs text-muted-foreground/60 italic">Coming soon</p>
              )}
            </nav>
            <Link
              to="/collections#couture"
              onClick={onNavigate}
              className="inline-flex items-center text-xs font-medium tracking-wide text-primary"
            >
              Discover Couture
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>

          {/* Ready To Wear Section */}
          <div>
            <h4 className="font-heading text-lg font-normal text-foreground mb-2">
              Ready to Wear
            </h4>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Elegant pieces available online.
            </p>
            <nav className="space-y-2.5 mb-4">
              {data?.readyToWear?.children.map((child) => (
                <Link
                  key={child.id}
                  to={`/shop/collection/${child.slug}`}
                  onClick={onNavigate}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {child.name}
                </Link>
              ))}
            </nav>
            <Link
              to="/shop"
              onClick={onNavigate}
              className="inline-flex items-center text-xs font-medium tracking-wide text-primary"
            >
              Shop Online
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}