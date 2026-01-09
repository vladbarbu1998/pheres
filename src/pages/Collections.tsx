import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { BrandWord } from "@/components/ui/brand-word";
import universeCouture from "@/assets/universe-couture.jpg";

interface UniverseCardProps {
  title: string;
  overline: string;
  subtitle: string;
  cta: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
  size?: "large" | "small";
}

function UniverseCard({ title, overline, subtitle, cta, href, imageUrl, imageAlt, size = "large" }: UniverseCardProps) {
  const isLarge = size === "large";

  return (
    <Link to={href} className="group relative block h-full overflow-hidden bg-muted">
      {/* Image */}
      <img
        src={imageUrl}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-500 group-hover:from-black/70" />

      {/* Content overlay */}
      <div className={`relative flex h-full flex-col justify-end ${isLarge ? "p-8 md:p-12 lg:p-16" : "p-6 md:p-8"}`}>
        {/* Overline */}
        <p
          className={`mb-2 font-label font-medium uppercase tracking-[0.3em] text-white/70 ${isLarge ? "text-xs md:text-sm" : "text-xs"}`}
        >
          {overline}
        </p>

        {/* Title */}
        <h2
          className={`font-serif font-light tracking-wide text-white ${isLarge ? "text-4xl md:text-5xl lg:text-6xl" : "text-2xl md:text-3xl"}`}
        >
          {title}
        </h2>

        {/* Subtitle */}
        <p
          className={`mt-3 leading-relaxed text-white/70 ${isLarge ? "max-w-md text-sm md:text-base lg:text-lg" : "max-w-xs text-sm"}`}
        >
          {subtitle}
        </p>

        {/* CTA */}
        <span
          className={`mt-6 inline-flex items-center gap-2 font-medium tracking-wide text-white transition-all duration-300 group-hover:gap-3 ${isLarge ? "text-sm md:text-base" : "text-sm"}`}
        >
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
      {/* Asymmetric Editorial Layout */}
      <section className="min-h-[calc(100vh-4rem)] bg-background md:min-h-[calc(100vh-5rem)]">
        <div className="grid h-full min-h-[calc(100vh-4rem)] grid-cols-1 gap-px bg-border md:min-h-[calc(100vh-5rem)] md:grid-cols-2 lg:grid-cols-[1.4fr_1fr]">
          {/* Left: Large Couture Card - 60% on desktop, 50% on tablet */}
          <div className="relative min-h-[50vh] md:min-h-0">
            <UniverseCard
              overline="On Request Only"
              title="Couture"
              subtitle="Exceptional high jewelry, crafted with rare gemstones and unparalleled artistry for the most discerning collectors."
              cta="Explore Couture"
              href="/collections/couture"
              imageUrl={universeCouture}
              imageAlt="Couture high jewelry collection"
              size="large"
            />
          </div>

          {/* Right: Stacked - Ready to Wear Card + Context */}
          <div className="flex flex-col gap-px bg-border">
            {/* Ready to Wear Card - takes ~60% of right side */}
            <div className="relative h-[50vh] md:h-[55%] lg:h-[60%]">
              <UniverseCard
                overline="Available Now"
                title="Ready to Wear"
                subtitle="Refined luxury jewelry, designed for everyday elegance."
                cta="Explore Collection"
                href="/collections/ready-to-wear"
                imageUrl="https://sbyfgresripeilehcoru.supabase.co/storage/v1/object/public/admin-uploads/collections/1766892837426-Color%20Me%20Yours.webp"
                imageAlt="Ready to Wear jewelry collection"
                size="small"
              />
            </div>

            {/* Context Text Block - takes ~40% of right side */}
            <div className="flex flex-1 flex-col justify-center bg-background px-8 py-12 md:px-10 lg:px-12 lg:py-0">
              <p className="brand-word mb-3 text-xs font-medium text-muted-foreground">The Pheres Universe</p>
              <h3 className="font-serif text-2xl font-light tracking-wide text-foreground md:text-3xl">
                Two Worlds, One Vision
              </h3>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground md:text-base">
                From bespoke haute joaillerie to refined everyday pieces, each creation embodies the same dedication to
                artistry and timeless elegance.
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
        </div>
      </section>
    </Layout>
  );
}
