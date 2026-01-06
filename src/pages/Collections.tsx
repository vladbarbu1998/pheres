import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

interface FloatingCardProps {
  title: string;
  overline: string;
  subtitle: string;
  cta: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
}

function FloatingCard({ title, overline, subtitle, cta, href, imageUrl, imageAlt }: FloatingCardProps) {
  return (
    <Link
      to={href}
      className="group relative block overflow-hidden bg-background shadow-2xl transition-transform duration-500 hover:-translate-y-2"
    >
      {/* Image */}
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
      </div>
      
      {/* Content */}
      <div className="bg-background p-6 md:p-8">
        {/* Overline */}
        <p className="mb-2 font-label text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          {overline}
        </p>
        
        {/* Title */}
        <h2 className="font-serif text-2xl font-light tracking-wide text-foreground md:text-3xl">
          {title}
        </h2>
        
        {/* Subtitle */}
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
        
        {/* CTA */}
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-primary transition-all duration-300 group-hover:gap-3">
          <span className="relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 group-hover:after:w-full">
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
      {/* Full-bleed Hero with Floating Cards */}
      <section className="relative min-h-screen overflow-hidden">
        
        {/* Full-bleed Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-model.webp"
            alt="Pheres Collections"
            className="h-full w-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        </div>
        
        {/* Hero Text - Centered at top */}
        <div className="relative z-10 flex flex-col items-center px-6 pt-20 text-center md:pt-28 lg:pt-32">
          <p className="mb-4 font-label text-xs font-medium uppercase tracking-[0.4em] text-white/70 md:text-sm">
            The Pheres Universe
          </p>
          <h1 className="font-serif text-4xl font-light tracking-wide text-white md:text-5xl lg:text-6xl">
            Two Worlds, One Vision
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/70 md:text-base">
            From bespoke haute joaillerie to refined everyday elegance, 
            discover the artistry that defines Pheres.
          </p>
        </div>
        
        {/* Floating Cards - Overlapping the hero */}
        <div className="relative z-20 mx-auto mt-12 max-w-5xl px-6 pb-16 md:mt-16 md:pb-20 lg:mt-20 lg:pb-24">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {/* Couture Card */}
            <FloatingCard
              overline="By Appointment"
              title="Couture"
              subtitle="Exceptional high jewelry, crafted with rare gemstones and unparalleled artistry."
              cta="Explore Couture"
              href="/collections/couture"
              imageUrl="/images/hero-model.webp"
              imageAlt="Couture high jewelry collection"
            />
            
            {/* Ready to Wear Card */}
            <FloatingCard
              overline="Available Now"
              title="Ready to Wear"
              subtitle="Refined luxury jewelry, designed for everyday elegance."
              cta="Explore Collection"
              href="/collections/ready-to-wear"
              imageUrl="/images/story-hero.webp"
              imageAlt="Ready to Wear jewelry collection"
            />
          </div>
        </div>
      </section>
      
      {/* Story Link Section */}
      <section className="border-t border-border bg-background py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-sm text-muted-foreground md:text-base">
              Each creation embodies our dedication to artistry and timeless elegance.
            </p>
            <Link
              to="/story"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-primary transition-colors hover:text-primary/80"
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
