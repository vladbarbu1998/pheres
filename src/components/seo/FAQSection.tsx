import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What materials does PHERES use?",
    answer:
      "PHERES uses only the finest materials, including 18K gold, platinum, and responsibly sourced diamonds and rare gemstones. Each stone is hand-selected for its exceptional quality, color, and brilliance by our founder, Narcisa Pheres.",
  },
  {
    question: "Where is PHERES located?",
    answer:
      "PHERES is headquartered in Hong Kong at Level 29, Infinitus Plaza, 199 Des Voeux Road, Sheung Wan. You can reach us by phone at +852 3182 7554 or through our contact form.",
  },
  {
    question: "What is the difference between Couture and Ready to Wear?",
    answer:
      "Couture pieces are one-of-a-kind, high-jewelry masterpieces crafted with the rarest gemstones, available by inquiry only. Ready to Wear pieces are refined luxury jewelry designed for everyday elegance, available for immediate purchase through our online store.",
  },
  {
    question: "How do I inquire about a Couture piece?",
    answer:
      "To inquire about a Couture creation, visit the piece's page and click 'Inquire About This Piece,' or contact our Concierge team directly through our contact page. We will respond within 24-48 hours.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, PHERES ships worldwide. All shipments are fully insured and handled with the utmost care. For high-value Couture pieces, we also offer a Concierge Delivery service by request.",
  },
  {
    question: "What is your return policy?",
    answer:
      "PHERES offers returns within 14 days of delivery for Ready to Wear pieces in their original, unworn condition with all packaging and documentation. Couture pieces and custom orders are final sale. Please visit our Returns page for full details.",
  },
];

export function FAQSection() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqJsonLd)}
        </script>
      </Helmet>

      <section className="border-t border-border/50 py-16 md:py-24">
        <div className="container max-w-3xl">
          <div className="mb-10 text-center">
            <p className="mb-2 font-label text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Common Questions
            </p>
            <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
