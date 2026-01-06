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
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
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
      <button
        className={cn(
          "font-sans text-sm font-medium transition-colors hover:text-foreground flex items-center gap-1.5 bg-transparent border-none cursor-pointer",
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
      </button>

      {/* Dropdown Panel */}
      <div
        className={cn(
          "absolute left-1/2 top-full z-50",
          "transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
          isOpen
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-2.5 pointer-events-none"
        )}
        style={{ transform: `translateX(-50%) ${isOpen ? "translateY(0)" : "translateY(-10px)"}` }}
      >
        {/* Invisible bridge to prevent gap hover-out */}
        <div className="h-4" />
        
        <div className="bg-background border border-border/60 shadow-2xl w-[900px] max-w-[95vw]">
          {/* Top decorative line */}
          <div className="h-[2px] bg-primary/80" />
          
          <div className="grid grid-cols-2">
            {/* Couture Section */}
            <div className="p-10 border-r border-border/40">
              <div className="flex gap-8">
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-2xl font-normal italic text-foreground mb-3 tracking-wide">
                    Couture
                  </h3>
                  <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-[280px]">
                    {data?.couture?.parent.description || "One-of-a-kind pieces. High Jewelry available by inquiry only."}
                  </p>

                  {/* Child collections */}
                  <nav className="space-y-3 mb-8">
                    {data?.couture?.children.map((child) => (
                      <Link
                        key={child.id}
                        to={`/shop/collection/${child.slug}`}
                        className="block text-[15px] text-foreground/90 hover:text-primary transition-colors duration-200"
                      >
                        {child.name}
                      </Link>
                    ))}
                    {(!data?.couture?.children || data.couture.children.length === 0) && (
                      <p className="text-sm text-muted-foreground/60 italic">Coming soon</p>
                    )}
                  </nav>

                  {/* CTA */}
                  <Link
                    to="/collections#couture"
                    className="group inline-flex items-center text-xs font-medium tracking-widest text-foreground uppercase"
                  >
                    <span className="relative">
                      Discover Couture
                      <span className="absolute left-0 -bottom-0.5 w-full h-[1px] bg-foreground origin-left transition-transform duration-300 group-hover:scale-x-110" />
                    </span>
                  </Link>
                </div>

                {/* Image */}
                {data?.couture?.children[0]?.image_url && (
                  <div className="w-36 h-36 flex-shrink-0 overflow-hidden">
                    <img
                      src={data.couture.children[0].image_url}
                      alt="Couture collection"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Ready To Wear Section */}
            <div className="p-10">
              <div className="flex gap-8">
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-2xl font-normal text-foreground mb-3 tracking-wide">
                    Ready to Wear
                  </h3>
                  <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-[280px]">
                    {data?.readyToWear?.parent.description || "Elegant pieces available online. Shop our iconic collections."}
                  </p>

                  {/* Child collections */}
                  <nav className="space-y-3 mb-8">
                    {data?.readyToWear?.children.map((child) => (
                      <Link
                        key={child.id}
                        to={`/shop/collection/${child.slug}`}
                        className="block text-[15px] text-foreground/90 hover:text-primary transition-colors duration-200"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </nav>

                  {/* CTA */}
                  <Link
                    to="/shop"
                    className="group inline-flex items-center text-xs font-medium tracking-widest text-foreground uppercase"
                  >
                    <span className="relative">
                      Shop Online
                      <span className="absolute left-0 -bottom-0.5 w-full h-[1px] bg-foreground origin-left transition-transform duration-300 group-hover:scale-x-110" />
                    </span>
                  </Link>
                </div>

                {/* Image */}
                {data?.readyToWear?.children[0]?.image_url && (
                  <div className="w-36 h-36 flex-shrink-0 overflow-hidden">
                    <img
                      src={data.readyToWear.children[0].image_url}
                      alt="Ready To Wear collection"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
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