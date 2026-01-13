import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { ConciergeInquiryDialog } from "@/components/concierge/ConciergeInquiryDialog";

export default function ConciergeService() {
  const [inquiryOpen, setInquiryOpen] = useState(false);

  return (
    <Layout>
      <PageHero
        title="Concierge Service"
        intro="Personalized luxury assistance tailored to your desires"
      />

      <section className="container py-16 lg:py-24">
        <div className="mx-auto max-w-3xl">
          {/* Intro */}
          <p className="text-lg text-muted-foreground leading-relaxed mb-12">
            At Pheres, we understand that exceptional jewelry deserves an equally considered level of service. Our Concierge Service is designed to offer a discreet, personalized experience for clients seeking an elevated level of care, attention, and convenience.
          </p>

          {/* Personalized Assistance */}
          <div className="mb-12">
            <h2 className="font-display text-2xl font-semibold mb-4 text-foreground">
              Personalized Assistance
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our concierge support is available by request and is intended to complement our standard client services. From detailed information about selected pieces to guidance on care and handling, each interaction is approached with professionalism, discretion, and respect for the individual needs of our clients.
            </p>
          </div>

          {/* Concierge Delivery */}
          <div className="mb-12">
            <h2 className="font-display text-2xl font-semibold mb-4 text-foreground">
              Concierge Delivery (by request)
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For selected high-value pieces, concierge delivery may be arranged by request, subject to availability and location. When applicable, this service is offered as an alternative to insured courier shipping, providing an additional option for clients who prefer a more personal handover experience.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Concierge delivery is not a standard service and is not guaranteed. Availability is assessed on a case-by-case basis, following the completion of purchase.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              During concierge delivery, a brand representative may:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 ml-4">
              <li>personally hand over the purchased piece;</li>
              <li>verify the recipient's identity;</li>
              <li>provide information regarding the jewelry and its care;</li>
              <li>obtain confirmation of receipt.</li>
            </ul>
          </div>

          {/* Discretion and Responsibility */}
          <div className="mb-12">
            <h2 className="font-display text-2xl font-semibold mb-4 text-foreground">
              Discretion and Responsibility
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              All concierge interactions are conducted with the highest level of discretion and professionalism. The concierge service is limited strictly to delivery and post-purchase assistance and does not involve sales, solicitation, or commercial transactions.
            </p>
          </div>

          {/* Call to action */}
          <div className="mb-12">
            <p className="text-muted-foreground leading-relaxed mb-8">
              For further details or to inquire about concierge availability for a specific purchase, clients are invited to contact our Client Services team.
            </p>
          </div>

          {/* Contact Button */}
          <div className="text-center">
            <Button
              size="lg"
              className="h-14 px-10 text-base"
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
