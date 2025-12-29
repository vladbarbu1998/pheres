import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/layout/PageHero";
import { Diamond, Gem, Globe, Leaf } from "lucide-react";
import narcisaPhoto from "@/assets/narcisa-pheres-founder.jpg";
const values = [
  {
    icon: Diamond,
    title: "Exceptional Craftsmanship",
    description: "Every piece is meticulously handcrafted by master artisans, honoring centuries-old techniques while embracing modern precision.",
  },
  {
    icon: Gem,
    title: "Uncompromising Rarity",
    description: "We source only the finest diamonds and gemstones, each selected for its exceptional quality and unique character.",
  },
  {
    icon: Leaf,
    title: "Responsible Luxury",
    description: "Our commitment to ethical sourcing and sustainable practices ensures beauty without compromise.",
  },
  {
    icon: Globe,
    title: "Global Perspective",
    description: "From Milan to Hong Kong, our designs reflect a worldly appreciation for diverse cultures and timeless elegance.",
  },
];

export default function Story() {
  return (
    <Layout>
      <PageHero
        label="PHERES"
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
                  className="h-full w-full object-cover transition-luxury hover:scale-105"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">
                  The Founder
                </p>
                <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  Narcisa Pheres
                </h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  PHERES brings luxury back to its roots by creating very exclusive products of extremely high quality that the niche market of connoisseurs truly appreciates.
                </p>
                <p>
                  Narcisa Pheres, a line dedicated exclusively for fine jewelry enthuses with one-of-a-kind diamonds and resonates opulence for the high-end market.
                </p>
                <p>
                  Founded by designer Narcisa Pheres over a decade ago, as a highly exclusive Italian fashion house, PHERES has taken on a new life of its own.
                </p>
                <p>
                  PHERES maintains its focus on creating unique luxury experiences that walk the fine line between elegance and extravagance—tearing down walls of limitation and boldly innovating a symbiosis of style.
                </p>
                <p>
                  Among the PHERES brand are the Narcisa Pheres Fine Jewelry pieces that have been gracing many a red carpet event. With these pieces, in the belief that true opulence is in the detail, the greatest of consideration and care is paid to even the smallest of steps in the design and creation process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Our Principles
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              The values that guide every piece we create and every relationship we build.
            </p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <div 
                key={value.title} 
                className="group text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-luxury group-hover:bg-primary/20">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/50 py-16 md:py-20">
        <div className="container max-w-3xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Experience the Extraordinary
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Discover our collection of one-of-a-kind pieces, each crafted to become 
            part of your legacy.
          </p>
          <div className="mt-8">
            <a
              href="/shop"
              className="inline-flex items-center justify-center rounded-sm bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-luxury hover:bg-primary/90"
            >
              Explore the Collection
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
