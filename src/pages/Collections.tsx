import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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

function UniverseCard({ title, overline, subtitle, cta, href, imageUrl, imageAlt }: UniverseCardProps) {
  return (
    <Link
      to={href}
      className="group relative block aspect-[4/5] overflow-hidden bg-muted md:aspect-[3/4] lg:aspect-[4/5]"
    >
      {/* Image */}
      <img
        src={imageUrl}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-500 group-hover:from-black/70" />
      
      {/* Content overlay */}
      <div className="relative flex h-full flex-col justify-end p-6 md:p-8 lg:p-10">
        {/* Overline */}
        <p className="mb-2 font-label text-xs font-medium uppercase tracking-[0.3em] text-white/70">
          {overline}
        </p>
        
        {/* Title */}
        <h2 className="font-serif text-3xl font-light tracking-wide text-white md:text-4xl lg:text-5xl">
          {title}
        </h2>
        
        {/* Subtitle */}
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70 md:text-base">
          {subtitle}
        </p>
        
        {/* CTA */}
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-white transition-all duration-300 group-hover:gap-3">
          <span className="relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-white after:transition-all after:duration-300 group-hover:after:w-full">
            {cta}
          </span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default function CollectionsPage() {
  return (
    <Layout>
      {/* Hero Section - inspired by CollectionType page */}
      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden bg-muted/30 py-20 md:min-h-[60vh] md:py-24 lg:py-32">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            {/* Overline */}
            <p className="mb-4 font-label text-xs font-medium uppercase tracking-[0.4em] text-muted-foreground md:text-sm">
              The Pheres Universe
            </p>
            
            {/* Main Title */}
            <h1 className="font-serif text-4xl font-light tracking-wide text-foreground md:text-5xl lg:text-6xl xl:text-7xl">
              Two Worlds, One Vision
            </h1>
            
            {/* Description */}
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              From exceptional high jewelry crafted by appointment to refined pieces 
              available for immediate discovery—each creation embodies the same 
              dedication to artistry and timeless elegance.
            </p>
          </div>
        </div>
      </section>

      {/* Universe Cards Grid */}
      <section className="bg-background">
        <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2">
          {/* Couture Universe */}
          <UniverseCard
            overline="By Appointment"
            title="Couture"
            subtitle="Exceptional high jewelry, crafted with rare gemstones and unparalleled artistry for the most discerning collectors."
            cta="Explore Couture"
            href="/collections/couture"
            imageUrl="/images/hero-model.webp"
            imageAlt="Couture high jewelry collection"
          />
          
          {/* Ready to Wear Universe */}
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
      </section>
      
      {/* Optional: CTA Section */}
      <section className="border-t border-border bg-background py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-xl text-center">
            <Link
              to="/story"
              className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-primary transition-colors hover:text-primary/80"
            >
              Discover Our Story
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
