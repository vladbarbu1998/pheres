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
    <div className="w-full overflow-hidden bg-muted/30 py-8">
      <div
        ref={scrollRef}
        className="flex w-max animate-marquee gap-16"
        style={{
          animationPlayState: isPaused ? "paused" : "running",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {duplicatedOutlets.map((outlet, index) => (
          <button
            key={`${outlet.id}-${index}`}
            onClick={() => onOutletClick?.(outlet.id)}
            className={cn(
              "flex-shrink-0 transition-all duration-300",
              "grayscale hover:grayscale-0 focus:grayscale-0",
              "opacity-50 hover:opacity-100 focus:opacity-100",
              selectedOutletId === outlet.id && "grayscale-0 opacity-100"
            )}
            aria-label={`Filter by ${outlet.name}`}
          >
            <img
              src={outlet.logo_url}
              alt={outlet.name}
              className="h-8 w-auto max-w-[140px] object-contain"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
