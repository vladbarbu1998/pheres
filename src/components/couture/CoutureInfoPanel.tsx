import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

interface Metal {
  id: string;
  metal_type: string;
  metal_weight: string | null;
}

interface Stone {
  id: string;
  stone_type: string;
  stone_carat: string | null;
  stone_clarity: string | null;
  stone_color: string | null;
  stone_cut: string | null;
}

interface CoutureInfoPanelProps {
  productName: string;
  shortDescription?: string | null;
  collectionName?: string | null;
  collectionSlug?: string | null;
  metals?: Metal[];
  stones?: Stone[];
  grossWeight?: string | null;
  size?: string | null;
  certification?: string | null;
  onInquire: () => void;
}

function formatSpecs(metals: Metal[], stones: Stone[], grossWeight?: string | null): string[] {
  const specs: string[] = [];
  
  // Add primary metal
  if (metals.length > 0) {
    const primaryMetal = metals[0];
    specs.push(primaryMetal.metal_type);
  }
  
  // Add primary stone with carat
  if (stones.length > 0) {
    const primaryStone = stones[0];
    if (primaryStone.stone_carat) {
      specs.push(`${primaryStone.stone_type} (${primaryStone.stone_carat})`);
    } else {
      specs.push(primaryStone.stone_type);
    }
  }
  
  // Add gross weight if available
  if (grossWeight) {
    specs.push(grossWeight);
  }
  
  return specs;
}

export function CoutureInfoPanel({
  productName,
  shortDescription,
  collectionName,
  collectionSlug,
  metals = [],
  stones = [],
  grossWeight,
  onInquire,
}: CoutureInfoPanelProps) {
  const specs = formatSpecs(metals, stones, grossWeight);

  return (
    <div className="flex flex-col h-full lg:sticky lg:top-24">
      {/* Collection Link */}
      {collectionName && collectionSlug && (
        <Link 
          to={`/couture/${collectionSlug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          {collectionName}
        </Link>
      )}

      {/* Product Name */}
      <h1 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-semibold tracking-wide text-foreground leading-tight mb-3">
        {productName}
      </h1>

      {/* One of a Kind Label */}
      <p className="font-label text-xs uppercase tracking-[0.25em] text-muted-foreground mb-8">
        One of a Kind
      </p>

      {/* Short Description */}
      {shortDescription && (
        <div 
          className="text-base text-muted-foreground leading-relaxed mb-8 max-w-prose prose prose-sm"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(shortDescription) }}
        />
      )}

      <Separator className="mb-8" />

      {/* Compact Specs */}
      {specs.length > 0 && (
        <>
          <p className="text-sm text-foreground/80 tracking-wide mb-8">
            {specs.join("  ·  ")}
          </p>
          <Separator className="mb-8" />
        </>
      )}

      {/* Primary CTA */}
      <Button
        onClick={onInquire}
        size="lg"
        className="w-full h-14 text-base font-medium tracking-wide mb-4"
      >
        Request Information
      </Button>

      {/* Secondary CTA */}
      <Link
        to="/contact"
        className="text-sm text-center text-muted-foreground hover:text-primary transition-colors"
      >
        Contact a PHERES Advisor
      </Link>
    </div>
  );
}

export function CoutureInfoPanelSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="h-4 w-32 mb-8" />
      <Skeleton className="h-12 w-full mb-3" />
      <Skeleton className="h-4 w-24 mb-8" />
      <Skeleton className="h-20 w-full mb-8" />
      <Skeleton className="h-px w-full mb-8" />
      <Skeleton className="h-4 w-48 mb-8" />
      <Skeleton className="h-px w-full mb-8" />
      <Skeleton className="h-14 w-full mb-4" />
      <Skeleton className="h-4 w-40 mx-auto" />
    </div>
  );
}
