import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/layout/PageHero";

export default function GioroPage() {
  return (
    <Layout>
      <PageHero
        label="New Chapter"
        title="Gioro"
        intro="A new dimension of luxury is coming. Stay tuned for an extraordinary experience."
      />

      {/* Coming Soon Section */}
      <section className="border-t border-border/50 py-20 md:py-28 lg:py-36">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-label text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Coming Soon
            </p>
            <h2 className="mt-4 font-serif text-2xl font-light tracking-wide text-foreground md:text-3xl lg:text-4xl">
              Something Extraordinary Awaits
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              We are crafting something truly special. A new vision of luxury that transcends expectations. 
              Subscribe to be the first to discover what's next.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
