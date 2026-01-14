import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/layout/PageHero";
import { BiographyViewer } from "@/components/story/BiographyViewer";
import { Diamond, Gem, Globe, Leaf } from "lucide-react";
import narcisaPhoto from "@/assets/narcisa-pheres-founder.jpg";
const values = [
  {
    id: "craftsmanship",
    icon: Diamond,
    title: "Exceptional Craftsmanship",
    description: "Every piece is meticulously handcrafted by master artisans, honoring centuries-old techniques while embracing modern precision.",
  },
  {
    id: "rarity",
    icon: Gem,
    title: "Uncompromising Rarity",
    description: "We source only the finest diamonds and gemstones, each selected for its exceptional quality and unique character.",
  },
  {
    id: "luxury",
    icon: Leaf,
    title: <>Responsible<br className="hidden lg:block" /> Luxury</>,
    description: "Our commitment to ethical sourcing and sustainable practices ensures beauty without compromise.",
  },
  {
    id: "transcendence",
    icon: Globe,
    title: "Cultural Transcendence",
    description: "East and West converge — symbolism and structure in a refined, timeless harmony; each piece becomes a bridge.",
  },
];

export default function Story() {
  return (
    <Layout>
      <PageHero
        label="Since 2006"
        title="Our Story"
        intro="Creating unique luxury experiences that walk the fine line between elegance and extravagance—boldly innovating a symbiosis of style."
      />

      {/* Founder Section */}
      <section className="border-t border-border/50 py-16 md:py-24">
        <div className="container max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <div className="aspect-[3/4] overflow-hidden bg-muted">
                <img
                  src={narcisaPhoto}
                  alt="Narcisa Pheres, Founder of Pheres"
                  className="h-full w-full object-cover transition-luxury hover:scale-105 object-top"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <p className="mb-2 font-label text-sm font-medium uppercase tracking-[0.2em] text-primary">
                  The Founder
                </p>
              <h2 className="brand-word text-2xl font-semibold md:text-3xl lg:text-4xl" style={{ color: '#765228' }}>
                  Narcisa Pheres
                </h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <span className="brand-word">Pheres</span> was founded in 2006 by designer <span className="brand-word">Narcisa Pheres</span>, with a focus on fine jewelry as a form of personal expression rather than ornament alone.
                </p>
                <p>
                  Inspired by the natural world and the passage of time, <span className="brand-word">Narcisa Pheres</span> approaches jewelry as something meant to last and be passed on. Diamonds and rare gems are central to her work, selected for their rarity, color as much as their brilliance.
                </p>
                <p>
                  Each piece is developed through a careful and deliberate process, where design and craftsmanship evolve together. The result is jewelry defined by clarity, balance, and attention to detail, rather than trends.
                </p>
                <p>
                  The <span className="brand-word">Narcisa Pheres</span> Fine Jewelry pieces have been seen on many celebrities at high-profile red carpet events (Oscars, Grammys, Golden Globes, Met Gala) and are valued for their refined simplicity, uniqueness, and quiet confidence, with rarity reflected in the exceptional gemstones selected.
                </p>
                <p>
                  The brand reflects the belief that jewelry should feel personal, unique and timeless.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Designer Biography Section */}
      <section className="border-t border-border/50 py-16 md:py-24">
        <div className="container max-w-6xl">
          <div className="mb-12 text-center md:mb-16">
            <p className="mb-2 font-label text-sm font-medium uppercase tracking-[0.2em] text-primary">
              The Journey
            </p>
            <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl lg:text-4xl">
              Designer Biography
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Discover the remarkable journey of <span className="brand-word">Narcisa Pheres</span> — from her education at 
              Instituto di Moda Burgo in Milan to becoming a globally recognized luxury jewelry 
              designer whose creations grace the world's most prestigious red carpets.
            </p>
          </div>

          <BiographyViewer />
        </div>
      </section>

      {/* Values Section */}
      <section className="border-t border-border/50 py-20 md:py-28">
        <div className="container max-w-6xl">
          <div className="mb-16 text-center md:mb-20">
            <p className="mb-3 font-label text-sm font-medium uppercase tracking-[0.3em] text-primary">
              What We Stand For
            </p>
            <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl lg:text-4xl">
              Our Principles
            </h2>
          </div>
          
          <div className="grid gap-px bg-border/50 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <div 
                key={value.id} 
                className="group relative bg-background p-8 transition-all duration-500 hover:bg-muted/30 lg:p-10"
              >
                {/* Decorative corner accent */}
                <div className="absolute right-6 top-6 h-8 w-8 border-r border-t border-primary/20 transition-all duration-500 group-hover:h-12 group-hover:w-12 group-hover:border-primary/40" />
                
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center">
                  <value.icon className="h-6 w-6 text-primary transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                </div>
                
                <h3 className="mb-3 font-label text-lg font-semibold tracking-tight text-foreground">
                  {value.title}
                </h3>
                
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
                
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/50 py-16 md:py-20">
        <div className="container max-w-3xl text-center">
          <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl lg:text-4xl">
            Experience the Extraordinary
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Discover our collection of one-of-a-kind pieces, each crafted to become 
            part of your legacy.
          </p>
          <div className="mt-8">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center rounded-sm bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-luxury hover:bg-primary/90"
            >
              Explore the Collection
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
