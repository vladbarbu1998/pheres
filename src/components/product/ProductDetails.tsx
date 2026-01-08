import { Truck, Shield, Award, Gem } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { sanitizeHtml } from "@/lib/sanitize";

interface ProductDetailsProps {
  description?: string | null;
  certification?: string | null;
}

export function ProductDetails({ description, certification }: ProductDetailsProps) {
  return (
    <section className="border-t border-border pt-12">
      {/* 2x2 Accordion Grid */}
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {/* Craftsmanship & Materials */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="craftsmanship" className="border-b-0">
            <AccordionTrigger className="font-label text-base font-medium">
              <span className="flex items-center gap-3">
                <Gem className="h-5 w-5 text-primary" />
                Craftsmanship & Materials
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {description ? (
                <div 
                  className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
                />
              ) : (
                <p>
                  Every piece is handcrafted by skilled artisans using time-honored 
                  techniques passed down through generations. We source only the finest 
                  materials—ethically mined gemstones and responsibly sourced precious metals.
                </p>
              )}
              {certification && (
                <p className="mt-4 font-medium text-foreground">
                  {certification}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Shipping & Delivery */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="shipping" className="border-b-0">
            <AccordionTrigger className="font-label text-base font-medium">
              <span className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                Shipping & Delivery
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              <ul className="space-y-2">
                <li>Complimentary insured shipping on all orders</li>
                <li>Discreet, secure packaging</li>
                <li>Signature required upon delivery</li>
                <li>International shipping available to select destinations</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Returns & Warranty */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="returns" className="border-b-0">
            <AccordionTrigger className="font-label text-base font-medium">
              <span className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                Returns & Warranty
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              <ul className="space-y-2">
                <li>30-day return policy for unworn items</li>
                <li>Lifetime warranty on craftsmanship</li>
                <li>Complimentary cleaning and inspection</li>
                <li>Resize service available for rings</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Care Instructions */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="care" className="border-b-0">
            <AccordionTrigger className="font-label text-base font-medium">
              <span className="flex items-center gap-3">
                <Award className="h-5 w-5 text-primary" />
                Care Instructions
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              <ul className="space-y-2">
                <li>Store separately in the provided jewelry box</li>
                <li>Avoid contact with perfumes, lotions, and chemicals</li>
                <li>Clean gently with a soft, lint-free cloth</li>
                <li>Remove before swimming or bathing</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Trust badges */}
      <div className="mt-12 border-t border-border pt-8">
        <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          <div>
            <p className="font-label text-sm font-semibold text-foreground">Certified</p>
            <p className="mt-1 text-xs text-muted-foreground">GIA Certified Diamonds</p>
          </div>
          <div>
            <p className="font-label text-sm font-semibold text-foreground">Handcrafted</p>
            <p className="mt-1 text-xs text-muted-foreground">Master Artisans</p>
          </div>
          <div>
            <p className="font-label text-sm font-semibold text-foreground">Secure</p>
            <p className="mt-1 text-xs text-muted-foreground">Insured Shipping</p>
          </div>
          <div>
            <p className="font-label text-sm font-semibold text-foreground">Lifetime</p>
            <p className="mt-1 text-xs text-muted-foreground">Warranty & Care</p>
          </div>
        </div>
      </div>
    </section>
  );
}
