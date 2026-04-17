"use client";

import { Gem, Hand, Shield, Lock } from "lucide-react";

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

export function CoutureStorySection() {
  return (
    <section className="bg-secondary/20 py-16 md:py-24">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Craftsmanship & Materials */}
        <div>
          <h2 className="font-label text-sm font-medium uppercase tracking-[0.2em] text-primary mb-4 text-center">
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
                <h4 className="font-label font-semibold text-foreground mb-2">
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