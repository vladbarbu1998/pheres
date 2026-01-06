import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";

interface UniverseCardProps {
  title: string;
  overline: string;
  subtitle: string;
  cta: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
}

function useParallax(speed: number = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the element is from the center of the viewport
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const distanceFromCenter = elementCenter - viewportCenter;
      
      // Apply parallax offset
      setOffset(distanceFromCenter * speed * -1);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return { ref, offset };
}

function UniverseCard({ title, overline, subtitle, cta, href, imageUrl, imageAlt }: UniverseCardProps) {
  const { ref, offset } = useParallax(0.15);

  return (
    <Link
      to={href}
      className="group relative block w-full overflow-hidden bg-muted"
    >
      {/* Image with parallax */}
      <div ref={ref} className="absolute inset-0">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="h-[120%] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          style={{ 
            transform: `translateY(${offset}px) scale(${1 + (offset > 0 ? 0 : 0)})`,
            willChange: "transform"
          }}
        />
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 transition-opacity duration-500 group-hover:from-black/60 group-hover:via-black/20" />
      
      {/* Content overlay */}
      <div className="relative flex h-full flex-col justify-end p-8 md:p-10 lg:p-12">
        {/* Overline */}
        <p className="mb-2 font-label text-xs font-medium uppercase tracking-[0.3em] text-white/80 md:text-sm">
          {overline}
        </p>
        
        {/* Title */}
        <h2 className="font-serif text-3xl font-light tracking-wide text-white md:text-4xl lg:text-5xl">
          {title}
        </h2>
        
        {/* Subtitle */}
        <p className="mt-3 max-w-sm text-sm text-white/70 md:text-base lg:text-lg">
          {subtitle}
        </p>
        
        {/* CTA */}
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-white transition-all duration-300 group-hover:gap-3 md:text-base">
          <span className="relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-white after:transition-all after:duration-300 group-hover:after:w-full">
            {cta}
          </span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function ContextBand() {
  return (
    <section className="border-t border-border bg-background py-16 md:py-20 lg:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h3 className="font-serif text-2xl font-light tracking-wide text-foreground md:text-3xl">
            Two Worlds, One Vision
          </h3>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            From exceptional high jewelry crafted by appointment to refined pieces 
            available for immediate discovery—each creation embodies the same 
            dedication to artistry and timeless elegance.
          </p>
          <Link
            to="/story"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-primary transition-colors hover:text-primary/80"
          >
            Discover Our Story
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function CollectionsPage() {
  return (
    <Layout>
      {/* Band 1: Universe Portal */}
      <section className="min-h-[85vh] md:min-h-[90vh]">
        <div className="grid h-full min-h-[85vh] grid-cols-1 gap-1 md:min-h-[90vh] md:grid-cols-2">
          {/* Couture Universe */}
          <div className="relative h-[50vh] md:h-auto md:min-h-[85vh]">
            <UniverseCard
              overline="By Appointment"
              title="Couture"
              subtitle="Exceptional high jewelry, crafted with rare gemstones and unparalleled artistry for the most discerning collectors."
              cta="Explore Couture"
              href="/collections/couture"
              imageUrl="/images/hero-model.webp"
              imageAlt="Couture high jewelry collection"
            />
          </div>
          
          {/* Ready to Wear Universe */}
          <div className="relative h-[50vh] md:h-auto md:min-h-[85vh]">
            <UniverseCard
              overline="Available Now"
              title="Ready to Wear"
              subtitle="Refined luxury jewelry, designed for everyday elegance and available for immediate discovery."
              cta="Explore Collection"
              href="/collections/ready-to-wear"
              imageUrl="/images/story-hero.webp"
              imageAlt="Ready to Wear jewelry collection"
            />
          </div>
        </div>
      </section>
      
      {/* Band 2: Context */}
      <ContextBand />
    </Layout>
  );
}
