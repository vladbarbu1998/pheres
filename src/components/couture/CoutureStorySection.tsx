import { Gem, Hand, Shield, Lock } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

interface CoutureStorySectionProps {
  description?: string | null;
  editorialImageUrl?: string | null;
  productName: string;
}

const craftsmanshipItems = [
  {
    icon: Gem,
    title: "Certified Stones",
    description: "GIA-certified diamonds and ethically sourced gemstones",
  },
  {
    icon: Hand,
    title: "Master Artisans",
    description: "Handcrafted by expert jewelers with decades of experience",
  },
  {
    icon: Shield,
    title: "Lifetime Care",
    description: "Complimentary cleaning, polishing, and maintenance",
  },
  {
    icon: Lock,
    title: "Secured Handling",
    description: "Insured shipping and discrete, secure delivery worldwide",
  },
];

export function CoutureStorySection({
  description,
  editorialImageUrl,
  productName,
}: CoutureStorySectionProps) {
  return (
    <section className="bg-secondary/20 py-16 md:py-24">
      <div className="container max-w-7xl mx-auto px-4">
        {/* About This Piece */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-16 md:mb-24">
          {/* Text */}
          <div className="flex flex-col justify-center">
            <h2 className="text-xs uppercase tracking-[0.25em] text-primary mb-4">
              About This Piece
            </h2>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
              The Story Behind the Creation
            </h3>
            {description ? (
              <div
                className="prose prose-stone max-w-none text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
              />
            ) : (
              <p className="text-muted-foreground leading-relaxed">
                Each PHERES couture piece is a singular expression of artistry and craftsmanship. 
                Born from the imagination of our master designers, this creation represents countless 
                hours of meticulous handwork, rare materials sourced from around the world, and an 
                unwavering commitment to perfection. Like all PHERES couture pieces, it exists as 
                a unique work of art — never to be replicated.
              </p>
            )}
          </div>

          {/* Editorial Image */}
          <div className="relative">
            {editorialImageUrl ? (
              <div className="aspect-[4/5] overflow-hidden rounded-sm bg-stone-100">
                <img
                  src={editorialImageUrl}
                  alt={`${productName} - Editorial`}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[4/5] bg-gradient-to-br from-stone-100 to-stone-200 rounded-sm flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Editorial image</p>
              </div>
            )}
          </div>
        </div>

        {/* Craftsmanship & Materials */}
        <div>
          <h2 className="text-xs uppercase tracking-[0.25em] text-primary mb-4 text-center">
            Craftsmanship & Materials
          </h2>
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-12 text-center">
            Excellence in Every Detail
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {craftsmanshipItems.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-6 bg-background rounded-sm border border-border/30"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-display font-semibold text-foreground mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
