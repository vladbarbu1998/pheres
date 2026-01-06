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

// Desktop mega menu dropdown
export function CollectionsMegaMenuDesktop({ isActive }: { isActive: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
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
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to="/collections"
        className={cn(
          "font-sans text-sm font-medium transition-colors hover:text-foreground flex items-center gap-1",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        Collections
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </Link>

      {/* Dropdown Panel */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 top-full pt-4 transition-all duration-200",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
      >
        <div className="bg-background border border-border rounded-lg shadow-xl w-[800px] max-w-[90vw] overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-border">
            {/* Couture Section */}
            <div className="p-8">
              <div className="flex justify-between gap-6">
                <div className="flex-1">
                  <h3 className="font-heading text-2xl font-semibold text-foreground mb-2">
                    Couture
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {data?.couture?.parent.description || "One-of-a-kind pieces. High Jewelry available by inquiry only."}
                  </p>

                  {/* Child collections */}
                  <nav className="space-y-2 mb-6">
                    {data?.couture?.children.map((child) => (
                      <Link
                        key={child.id}
                        to={`/shop/collection/${child.slug}`}
                        className="block text-sm text-foreground hover:text-primary transition-colors"
                      >
                        {child.name}
                      </Link>
                    ))}
                    {(!data?.couture?.children || data.couture.children.length === 0) && (
                      <p className="text-sm text-muted-foreground italic">Coming soon</p>
                    )}
                  </nav>

                  {/* CTA */}
                  <Link
                    to="/collections#couture"
                    className="inline-block text-sm font-medium text-foreground border-b border-foreground pb-0.5 hover:text-primary hover:border-primary transition-colors"
                  >
                    DISCOVER COUTURE
                  </Link>
                </div>

                {/* Image */}
                {data?.couture?.children[0]?.image_url && (
                  <div className="w-32 h-32 flex-shrink-0">
                    <img
                      src={data.couture.children[0].image_url}
                      alt="Couture collection"
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Ready To Wear Section */}
            <div className="p-8">
              <div className="flex justify-between gap-6">
                <div className="flex-1">
                  <h3 className="font-heading text-2xl font-semibold text-foreground mb-2">
                    Ready To Wear
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {data?.readyToWear?.parent.description || "Elegant pieces available online. Shop our collections."}
                  </p>

                  {/* Child collections */}
                  <nav className="space-y-2 mb-6">
                    {data?.readyToWear?.children.map((child) => (
                      <Link
                        key={child.id}
                        to={`/shop/collection/${child.slug}`}
                        className="block text-sm text-foreground hover:text-primary transition-colors"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </nav>

                  {/* CTA */}
                  <Link
                    to="/shop"
                    className="inline-block text-sm font-medium text-foreground border-b border-foreground pb-0.5 hover:text-primary hover:border-primary transition-colors"
                  >
                    SHOP ONLINE
                  </Link>
                </div>

                {/* Image */}
                {data?.readyToWear?.children[0]?.image_url && (
                  <div className="w-32 h-32 flex-shrink-0">
                    <img
                      src={data.readyToWear.children[0].image_url}
                      alt="Ready To Wear collection"
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}
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
    <div className="border-b border-border/30 last:border-b-0">
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="font-sans flex w-full items-center justify-between py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Collections
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isExpanded && "rotate-90"
          )}
        />
      </button>

      {/* Expandable content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pb-4 pl-4 space-y-6">
          {/* Couture Section */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-foreground mb-1">
              Couture
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              One-of-a-kind pieces by inquiry only.
            </p>
            <nav className="space-y-2 mb-3">
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
                <p className="text-xs text-muted-foreground italic">Coming soon</p>
              )}
            </nav>
            <Link
              to="/collections#couture"
              onClick={onNavigate}
              className="text-xs font-medium text-primary hover:underline"
            >
              Discover Couture →
            </Link>
          </div>

          {/* Ready To Wear Section */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-foreground mb-1">
              Ready To Wear
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Elegant pieces available online.
            </p>
            <nav className="space-y-2 mb-3">
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
              className="text-xs font-medium text-primary hover:underline"
            >
              Shop Online →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
