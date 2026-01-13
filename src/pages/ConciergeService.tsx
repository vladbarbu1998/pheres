import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/layout/PageHero";

export default function ConciergeService() {
  return (
    <Layout>
      <PageHero
        title="Concierge Service"
        intro="Personalized luxury assistance tailored to your desires"
      />
      <section className="container py-16 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Coming soon — Our dedicated concierge team is here to assist you with 
            bespoke consultations, private viewings, and personalized recommendations.
          </p>
        </div>
      </section>
    </Layout>
  );
}
