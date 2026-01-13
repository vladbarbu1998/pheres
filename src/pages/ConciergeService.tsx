import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ConciergeInquiryDialog } from "@/components/concierge/ConciergeInquiryDialog";
import conciergeHero from "@/assets/concierge-hero.png";

export default function ConciergeService() {
  const [inquiryOpen, setInquiryOpen] = useState(false);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] lg:min-h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src={conciergeHero}
            alt="Pheres fine jewelry pieces elegantly displayed"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />
        </div>
        <div className="container relative z-10 py-20 lg:py-32">
          <div className="max-w-xl">
            <p className="mb-4 font-label text-sm font-medium uppercase tracking-[0.3em] text-primary animate-fade-in">
              Exclusive Service
            </p>
            <h1 className="font-serif text-4xl font-light tracking-wide text-foreground md:text-5xl lg:text-6xl animate-fade-in text-balance">
              Concierge Service
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl animate-fade-in leading-relaxed">
              Personalized luxury assistance tailored to your desires
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 lg:py-28 bg-secondary/30">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              At Pheres, we understand that exceptional jewelry deserves an equally considered level of service. Our Concierge Service is designed to offer a discreet, personalized experience for clients seeking an elevated level of care, attention, and convenience.
            </p>
          </div>
        </div>
      </section>

      {/* Two Column: Personalized Assistance */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="font-display text-3xl lg:text-4xl font-semibold mb-6 text-foreground">
                Personalized Assistance
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Our concierge support is available by request and is intended to complement our standard client services. From detailed information about selected pieces to guidance on care and handling, each interaction is approached with professionalism, discretion, and respect for the individual needs of our clients.
              </p>
            </div>
            <div className="relative aspect-[4/3] lg:aspect-square overflow-hidden rounded-sm">
              <img
                src={conciergeHero}
                alt="Exquisite Pheres jewelry collection"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Concierge Delivery */}
      <section className="py-20 lg:py-28 bg-secondary/30">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl lg:text-4xl font-semibold mb-6 text-foreground text-center">
              Concierge Delivery
            </h2>
            <p className="text-sm uppercase tracking-widest text-primary mb-8 text-center">
              By Request
            </p>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                For selected high-value pieces, concierge delivery may be arranged by request, subject to availability and location. When applicable, this service is offered as an alternative to insured courier shipping, providing an additional option for clients who prefer a more personal handover experience.
              </p>
              <p className="text-sm border-l-2 border-primary/30 pl-6 italic">
                Concierge delivery is not a standard service and is not guaranteed. Availability is assessed on a case-by-case basis, following the completion of purchase.
              </p>
              <p>During concierge delivery, a brand representative may:</p>
              <ul className="grid sm:grid-cols-2 gap-4">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                  <span>Personally hand over the purchased piece</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                  <span>Verify the recipient's identity</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                  <span>Provide information regarding the jewelry and its care</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                  <span>Obtain confirmation of receipt</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Discretion */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl lg:text-4xl font-semibold mb-6 text-foreground">
              Discretion and Responsibility
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              All concierge interactions are conducted with the highest level of discretion and professionalism. The concierge service is limited strictly to delivery and post-purchase assistance and does not involve sales, solicitation, or commercial transactions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-secondary/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-muted-foreground leading-relaxed text-lg mb-10">
              For further details or to inquire about concierge availability for a specific purchase, clients are invited to contact our Client Services team.
            </p>
            <Button
              size="lg"
              className="h-14 px-12 text-base"
              onClick={() => setInquiryOpen(true)}
            >
              Contact Our Concierge Team
            </Button>
          </div>
        </div>
      </section>

      <ConciergeInquiryDialog
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
      />
    </Layout>
  );
}
