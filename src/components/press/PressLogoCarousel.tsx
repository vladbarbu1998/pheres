import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { PressOutlet } from "@/hooks/usePressOutlets";

interface PressLogoCarouselProps {
  outlets: PressOutlet[];
  onOutletClick?: (outletId: string) => void;
  selectedOutletId?: string | null;
}

export function PressLogoCarousel({
  outlets,
  onOutletClick,
  selectedOutletId,
}: PressLogoCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Duplicate outlets for seamless looping
  const duplicatedOutlets = [...outlets, ...outlets];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || outlets.length === 0) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame

    const animate = () => {
      if (!isPaused) {
        scrollPosition += scrollSpeed;
        
        // Reset to start when we've scrolled past the first set
        const halfWidth = scrollContainer.scrollWidth / 2;
        if (scrollPosition >= halfWidth) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPaused, outlets.length]);

  if (outlets.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden py-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Gradient fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

      <div
        ref={scrollRef}
        className="flex gap-12 overflow-x-hidden scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {duplicatedOutlets.map((outlet, index) => (
          <button
            key={`${outlet.id}-${index}`}
            onClick={() => onOutletClick?.(outlet.id)}
            className={cn(
              "flex-shrink-0 transition-all duration-300",
              "grayscale hover:grayscale-0 focus:grayscale-0",
              "opacity-60 hover:opacity-100 focus:opacity-100",
              selectedOutletId === outlet.id && "grayscale-0 opacity-100"
            )}
            aria-label={`Filter by ${outlet.name}`}
          >
            <img
              src={outlet.logo_url}
              alt={outlet.name}
              className="h-10 w-auto max-w-[120px] object-contain"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
