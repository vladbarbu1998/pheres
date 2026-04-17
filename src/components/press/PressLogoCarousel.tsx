"use client";

import { useEffect, useRef } from "react";

// Static logos for the carousel - these are independent of press_outlets table
const carouselLogos = [
  { name: "Golden Globes", src: "/images/press/golden-globes-logo.png" },
  { name: "Katerina Perez", src: "/images/press/katerina-perez-logo.png" },
  { name: "Luxe Gulf", src: "/images/press/luxe-gulf-logo.png" },
  { name: "Rapaport", src: "/images/press/rapaport-logo.png" },
  { name: "Vogue", src: "/images/press/vogue-logo.avif" },
  { name: "Forbes", src: "/images/press/forbes-logo.avif" },
  { name: "Harper's Bazaar", src: "/images/press/harpers-bazaar-logo.webp" },
  { name: "Elle", src: "/images/press/elle-logo.webp" },
  { name: "Gafencu", src: "/images/press/gafencu-logo.avif" },
  { name: "Hashtag Legend", src: "/images/press/hashtag-legend-logo.avif" },
  { name: "Beyoncé", src: "/images/press/beyonce-logo.webp" },
  { name: "South China Morning Post", src: "/images/press/scmp-logo.webp" },
  { name: "OK! Magazine", src: "/images/press/ok-magazine-logo.avif" },
  { name: "People Style", src: "/images/press/people-style-logo.avif" },
  { name: "Us Weekly", src: "/images/press/us-weekly-logo.avif" },
  { name: "Prestige", src: "/images/press/prestige-logo.webp" },
  { name: "HK Tatler", src: "/images/press/hk-tatler-logo.avif" },
  { name: "Manila House", src: "/images/press/manila-house-logo.avif" },
  { name: "Destination Deluxe", src: "/images/press/destination-deluxe-logo.avif" },
  { name: "Lifestyle Journal", src: "/images/press/lifestyle-journal-logo.webp" },
  { name: "Vanity Fair", src: "/images/press/vanity-fair-logo.avif" },
  { name: "Popsugar", src: "/images/press/popsugar-logo.avif" },
  { name: "RCFA", src: "/images/press/rcfa-logo.avif" },
  { name: "Daily Mail", src: "/images/press/daily-mail-logo.avif" },
  { name: "Elle Blog", src: "/images/press/elle-blog-logo.avif" },
  { name: "Fashion One", src: "/images/press/fashion-one-logo.avif" },
  { name: "Fashion Maniac", src: "/images/press/fashion-maniac-logo.webp" },
  { name: "Just Jared", src: "/images/press/just-jared-logo.avif" },
  { name: "Elite Traveler", src: "/images/press/elite-traveler-logo.webp" },
  { name: "Observer", src: "/images/press/observer-logo.avif" },
  { name: "Who Wore What Daily", src: "/images/press/who-wore-what-daily-logo.avif" },
  { name: "Diamond World", src: "/images/press/diamond-world-logo.avif" },
  { name: "TasteTV", src: "/images/press/tastetv-logo.avif" },
  { name: "National Jeweler", src: "/images/press/national-jeweler-logo.webp" },
  { name: "MSN", src: "/images/press/msn-logo.avif" },
  { name: "The Telegraph", src: "/images/press/the-telegraph-logo.avif" },
  { name: "Yahoo", src: "/images/press/yahoo-logo.avif" },
  { name: "The New Daily", src: "/images/press/the-new-daily-logo.avif" },
  { name: "The Fashion Spot", src: "/images/press/the-fashion-spot-logo.webp" },
  { name: "My Hong Kong Wedding", src: "/images/press/my-hong-kong-wedding-logo.avif" },
  { name: "Elle Vietnam", src: "/images/press/elle-vietnam-logo.avif" },
];

export function PressLogoCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Duplicate logos for seamless looping
  const duplicatedLogos = [...carouselLogos, ...carouselLogos];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || carouselLogos.length === 0) return;

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
  }, []);

  return (
    <div className="w-full overflow-hidden bg-muted/30 py-8 pointer-events-none">
      <div
        ref={scrollRef}
        className="flex w-max animate-marquee gap-16"
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={`${logo.name}-${index}`}
            className="flex-shrink-0 grayscale opacity-50"
          >
            <img
              src={logo.src}
              alt={logo.name}
              className="h-8 w-auto max-w-[140px] object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}