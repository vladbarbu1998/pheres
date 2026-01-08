import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { CoutureKeyDetails } from "./CoutureKeyDetails";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

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

export function CoutureInfoPanel({
  productName,
  shortDescription,
  collectionName,
  collectionSlug,
  metals = [],
  stones = [],
  grossWeight,
  size,
  certification,
  onInquire,
}: CoutureInfoPanelProps) {
  return (
    <div className="flex flex-col h-full lg:sticky lg:top-24">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/collections/couture">Couture</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {collectionName && collectionSlug && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/couture/${collectionSlug}`}>{collectionName}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{productName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Label */}
      <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">
        Couture · One of a Kind
      </p>

      {/* Title */}
      <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-wide text-foreground mb-4">
        {productName}
      </h1>

      {/* Price */}
      <p className="text-lg italic text-muted-foreground mb-6">
        Price upon request
      </p>

      {/* Short Description */}
      {shortDescription && (
        <div 
          className="text-base text-muted-foreground leading-relaxed mb-8 max-w-prose prose prose-sm"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(shortDescription) }}
        />
      )}

      {/* Primary CTA */}
      <Button
        onClick={onInquire}
        size="lg"
        className="w-full h-14 text-base font-medium tracking-wide mb-4"
      >
        Inquire About This Piece
      </Button>

      {/* Secondary CTA */}
      <Link
        to="/contact"
        className="text-sm text-center text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
      >
        Contact a PHERES Advisor
      </Link>

      {/* Availability Note */}
      <div className="mt-8 p-4 bg-secondary/30 rounded-sm border border-border/30">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          This one-of-a-kind couture creation is not available for online purchase.
          <br />
          Availability and pricing upon request.
        </p>
      </div>

      {/* Key Details */}
      <CoutureKeyDetails
        metals={metals}
        stones={stones}
        grossWeight={grossWeight}
        size={size}
        collectionName={collectionName}
        certification={certification}
      />
    </div>
  );
}

export function CoutureInfoPanelSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="h-4 w-48 mb-6" />
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-12 w-full mb-4" />
      <Skeleton className="h-6 w-40 mb-6" />
      <Skeleton className="h-20 w-full mb-8" />
      <Skeleton className="h-14 w-full mb-4" />
      <Skeleton className="h-4 w-48 mx-auto" />
    </div>
  );
}
