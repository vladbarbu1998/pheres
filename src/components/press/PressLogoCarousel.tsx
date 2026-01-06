import { useEffect, useRef } from "react";
import type { PressOutlet } from "@/hooks/usePressOutlets";

interface PressLogoCarouselProps {
  outlets: PressOutlet[];
}

export function PressLogoCarousel({ outlets }: PressLogoCarouselProps) {
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
      scrollPosition += scrollSpeed;
      
      // Reset to start when we've scrolled past the first set
      const halfWidth = scrollContainer.scrollWidth / 2;
      if (scrollPosition >= halfWidth) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [outlets.length]);

  if (outlets.length === 0) return null;

  return (
    <div className="w-full overflow-hidden bg-muted/30 py-8 pointer-events-none">
      <div
        ref={scrollRef}
        className="flex w-max animate-marquee gap-16"
      >
        {duplicatedOutlets.map((outlet, index) => (
          <div
            key={`${outlet.id}-${index}`}
            className="flex-shrink-0 grayscale opacity-50"
          >
            <img
              src={outlet.logo_url}
              alt={outlet.name}
              className="h-8 w-auto max-w-[140px] object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
