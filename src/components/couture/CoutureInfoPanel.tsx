import { Link } from "react-router-dom";
import { useState } from "react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, Share2, Link2, Check } from "lucide-react";
import { toast } from "sonner";

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
  productImageUrl?: string | null;
  onInquire: () => void;
}

function formatSpecs(metals: Metal[], stones: Stone[], grossWeight?: string | null): string[] {
  const specs: string[] = [];
  
  if (metals.length > 0) {
    const primaryMetal = metals[0];
    specs.push(primaryMetal.metal_type);
  }
  
  if (stones.length > 0) {
    const primaryStone = stones[0];
    if (primaryStone.stone_carat) {
      specs.push(`${primaryStone.stone_type} (${primaryStone.stone_carat})`);
    } else {
      specs.push(primaryStone.stone_type);
    }
  }
  
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
  productImageUrl,
  onInquire,
}: CoutureInfoPanelProps) {
  const specs = formatSpecs(metals, stones, grossWeight);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Discover ${productName} - One of a Kind piece by PHERES`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error - ignore
      }
    }
  };

  const socialLinks = [
    {
      name: "Pinterest",
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(productImageUrl || "")}&description=${encodeURIComponent(shareText)}`,
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "X",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
  ];

  const supportsNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="flex flex-col h-full lg:sticky lg:top-24">
      {/* Collection Link */}
      {collectionName && collectionSlug && (
        <Link 
          to={`/couture/${collectionSlug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group animate-fade-in"
          style={{ animationDelay: "0ms", animationFillMode: "both" }}
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          {collectionName}
        </Link>
      )}

      {/* Product Name */}
      <h1 
        className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-semibold tracking-wide text-foreground leading-tight mb-3 animate-fade-in"
        style={{ animationDelay: "50ms", animationFillMode: "both" }}
      >
        {productName}
      </h1>

      {/* One of a Kind Label */}
      <p 
        className="font-label text-xs uppercase tracking-[0.25em] text-muted-foreground mb-8 animate-fade-in"
        style={{ animationDelay: "100ms", animationFillMode: "both" }}
      >
        One of a Kind
      </p>

      {/* Short Description */}
      {shortDescription && (
        <div 
          className="text-base text-muted-foreground leading-relaxed mb-8 max-w-prose prose prose-sm animate-fade-in"
          style={{ animationDelay: "150ms", animationFillMode: "both" }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(shortDescription) }}
        />
      )}

      <Separator 
        className="mb-8 animate-fade-in" 
        style={{ animationDelay: "200ms", animationFillMode: "both" }} 
      />

      {/* Compact Specs */}
      {specs.length > 0 && (
        <>
          <p 
            className="text-sm text-foreground/80 tracking-wide mb-8 animate-fade-in"
            style={{ animationDelay: "250ms", animationFillMode: "both" }}
          >
            {specs.join("  ·  ")}
          </p>
          <Separator 
            className="mb-8 animate-fade-in" 
            style={{ animationDelay: "300ms", animationFillMode: "both" }} 
          />
        </>
      )}

      {/* Primary CTA */}
      <Button
        onClick={onInquire}
        size="lg"
        className="w-full h-14 text-base font-medium tracking-wide mb-4 animate-fade-in"
        style={{ animationDelay: "350ms", animationFillMode: "both" }}
      >
        Request Information
      </Button>

      {/* Secondary CTA */}
      <Link
        to="/contact"
        className="text-sm text-center text-muted-foreground hover:text-primary transition-colors mb-8 animate-fade-in"
        style={{ animationDelay: "400ms", animationFillMode: "both" }}
      >
        Contact a PHERES Advisor
      </Link>

      {/* Share Button */}
      <div 
        className="flex justify-center animate-fade-in"
        style={{ animationDelay: "450ms", animationFillMode: "both" }}
      >
        {supportsNativeShare ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNativeShare}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share This Piece
          </Button>
        ) : (
          <Popover open={shareOpen} onOpenChange={setShareOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share This Piece
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="center">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
                Copy Link
              </button>
              <Separator className="my-1" />
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShareOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </PopoverContent>
          </Popover>
        )}
      </div>
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
      <Skeleton className="h-4 w-40 mx-auto mb-8" />
      <Skeleton className="h-8 w-32 mx-auto" />
    </div>
  );
}
