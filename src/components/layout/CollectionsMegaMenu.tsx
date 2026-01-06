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
          "font-sans text-sm font-medium transition-colors hover:text-foreground flex items-center gap-1.5 bg-transparent border-none cursor-pointer py-6",
          isOpen || isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        Collections
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-300 ease-out",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Compact dropdown panel */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 z-50 bg-background border border-border/50 rounded-lg",
          "transition-all duration-300 ease-out",
          "shadow-lg",
          "top-full mt-2",
          "w-[580px]",
          isOpen
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-2 pointer-events-none"
        )}
      >
        <div className="flex divide-x divide-border/30">
          {/* Couture Column */}
          <div className="flex-1 p-6 transition-colors duration-300 hover:bg-muted/20 rounded-l-lg">
            <div className="flex items-start gap-4">
              {/* Image - small circular */}
              {data?.couture?.children[0]?.image_url && (
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={data.couture.children[0].image_url}
                    alt="Couture collection"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1">
                {/* Title */}
                <h3 className="font-heading text-lg font-normal text-foreground mb-1 tracking-wide">
                  Couture
                </h3>
                
                {/* Description */}
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  One-of-a-kind pieces by inquiry only.
                </p>

                {/* Child collection links */}
                <nav className="space-y-1.5 mb-3">
                  {data?.couture?.children.map((child) => (
                    <Link
                      key={child.id}
                      to={`/shop/collection/${child.slug}`}
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {child.name}
                    </Link>
                  ))}
                  {(!data?.couture?.children || data.couture.children.length === 0) && (
                    <p className="text-xs text-muted-foreground/60 italic">Coming soon</p>
                  )}
                </nav>

                {/* CTA */}
                <Link
                  to="/collections#couture"
                  className="inline-flex items-center text-xs font-medium tracking-wide text-primary hover:text-primary/80 transition-colors"
                >
                  Discover Couture
                  <ChevronDown className="h-3 w-3 ml-1 -rotate-90" />
                </Link>
              </div>
            </div>
          </div>

          {/* Ready To Wear Column */}
          <div className="flex-1 p-6 transition-colors duration-300 hover:bg-muted/20 rounded-r-lg">
            <div className="flex items-start gap-4">
              {/* Image - small circular */}
              {data?.readyToWear?.children[0]?.image_url && (
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={data.readyToWear.children[0].image_url}
                    alt="Ready To Wear collection"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1">
                {/* Title */}
                <h3 className="font-heading text-lg font-normal text-foreground mb-1 tracking-wide">
                  Ready to Wear
                </h3>
                
                {/* Description */}
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Elegant pieces available online.
                </p>

                {/* Child collection links */}
                <nav className="space-y-1.5 mb-3">
                  {data?.readyToWear?.children.map((child) => (
                    <Link
                      key={child.id}
                      to={`/shop/collection/${child.slug}`}
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {child.name}
                    </Link>
                  ))}
                </nav>

                {/* CTA */}
                <Link
                  to="/shop"
                  className="inline-flex items-center text-xs font-medium tracking-wide text-primary hover:text-primary/80 transition-colors"
                >
                  Shop Online
                  <ChevronDown className="h-3 w-3 ml-1 -rotate-90" />
                </Link>
              </div>
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
        className={cn(
          "font-sans flex w-full items-center justify-between py-3 text-base font-medium transition-colors hover:text-foreground",
          isExpanded ? "text-foreground" : "text-muted-foreground"
        )}
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
          isExpanded ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="ml-2 pl-4 border-l-2 border-primary/30 space-y-6 pb-6">
          {/* Couture Section */}
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <Link
                to="/collections#couture"
                onClick={onNavigate}
                className="font-sans text-base font-medium tracking-wide text-foreground hover:text-primary transition-colors mb-2 inline-block"
              >
                Couture
              </Link>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
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
                className="inline-flex items-center text-sm font-medium tracking-wide text-primary"
              >
                Discover Couture
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {/* Image */}
            {data?.couture?.children[0]?.image_url && (
              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={data.couture.children[0].image_url}
                  alt="Couture"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border/40 my-2" />

          {/* Ready To Wear Section */}
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <Link
                to="/collections#ready-to-wear"
                onClick={onNavigate}
                className="font-sans text-base font-medium tracking-wide text-foreground hover:text-primary transition-colors mb-2 inline-block"
              >
                Ready to Wear
              </Link>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
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
                className="inline-flex items-center text-sm font-medium tracking-wide text-primary"
              >
                Shop Online
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {/* Image */}
            {data?.readyToWear?.children[0]?.image_url && (
              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={data.readyToWear.children[0].image_url}
                  alt="Ready To Wear"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}