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
    <section className="border-t border-border pt-16">
      {/* 2x2 Accordion Grid */}
      <div className="grid gap-6 pb-4 md:grid-cols-2 md:gap-8">
        {/* Craftsmanship & Materials */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="craftsmanship" className="border-b-0 border border-border/30 rounded-sm bg-card/50 transition-all duration-200 hover:border-primary/20 hover:shadow-sm cursor-pointer">
            <AccordionTrigger className="font-label text-base font-medium justify-start gap-3 [&>svg]:ml-auto p-4">
              <span className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Gem className="h-4 w-4 text-primary" />
                </span>
                Craftsmanship & Materials
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed px-4 pb-4">
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
          <AccordionItem value="shipping" className="border-b-0 border border-border/30 rounded-sm bg-card/50 transition-all duration-200 hover:border-primary/20 hover:shadow-sm cursor-pointer">
            <AccordionTrigger className="font-label text-base font-medium justify-start gap-3 [&>svg]:ml-auto p-4">
              <span className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Truck className="h-4 w-4 text-primary" />
                </span>
                Shipping & Delivery
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed px-4 pb-4">
              <ul className="space-y-2">
                <li>Worldwide delivery through secure, fully insured logistics partners</li>
                <li>Shipping, insurance, taxes and duties borne by the client</li>
                <li>Up to 30 business days lead time from order confirmation</li>
                <li>Final delivery charges communicated for approval prior to dispatch</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Returns & Exchange */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="returns" className="border-b-0 border border-border/30 rounded-sm bg-card/50 transition-all duration-200 hover:border-primary/20 hover:shadow-sm cursor-pointer">
            <AccordionTrigger className="font-label text-base font-medium justify-start gap-3 [&>svg]:ml-auto p-4">
              <span className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-primary" />
                </span>
                Returns & Exchange
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed px-4 pb-4">
              <ul className="space-y-2">
                <li>Exchange or store credit within 3 days of delivery</li>
                <li>Items must be unworn, unused, and in original packaging</li>
                <li>Return Merchandise Number (RMN) required</li>
                <li>Sale items are final sale – no returns or exchanges</li>
                <li>Customer responsible for return shipping costs</li>
              </ul>
              <p className="mt-3 text-sm">
                Contact <a href="mailto:customercare@pheres.com" className="text-primary hover:underline">customercare@pheres.com</a> for assistance.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Care Instructions */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="care" className="border-b-0 border border-border/30 rounded-sm bg-card/50 transition-all duration-200 hover:border-primary/20 hover:shadow-sm cursor-pointer">
            <AccordionTrigger className="font-label text-base font-medium justify-start gap-3 [&>svg]:ml-auto p-4">
              <span className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Award className="h-4 w-4 text-primary" />
                </span>
                Care Instructions
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed px-4 pb-4">
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
      <div className="mt-12 border-y border-border py-6">
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
            <p className="font-label text-sm font-semibold text-foreground">Insured</p>
            <p className="mt-1 text-xs text-muted-foreground">Worldwide Delivery</p>
          </div>
          <div>
            <p className="font-label text-sm font-semibold text-foreground">Secure</p>
            <p className="mt-1 text-xs text-muted-foreground">Protected Checkout</p>
          </div>
        </div>
      </div>
    </section>
  );
}
