import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/layout/PageHero";
import gioroRing from "@/assets/gioro-ring.png";

export default function GioroPage() {
  return (
    <Layout>
      <PageHero
        label="New Chapter"
        title={<>Gioro by <span className="tracking-[0.2em]">PHERES</span></>}
        intro="A new dimension of luxury is coming. Stay tuned for an extraordinary experience."
      />

      {/* Coming Soon Section */}
      <section className="border-t border-border/50 py-20 md:py-28 lg:py-36">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            {/* Image */}
            <div className="mb-16 flex justify-center">
              <img
                src={gioroRing}
                alt="Gioro by Pheres - Coming Soon"
                className="w-full max-w-2xl object-contain"
              />
            </div>

            {/* Text */}
            <div className="text-center">
              <p className="font-label text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Coming Soon
              </p>
              <h2 className="mt-4 font-serif text-2xl font-light tracking-wide text-foreground md:text-3xl lg:text-4xl">
                Something Extraordinary Awaits
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                We are crafting something truly special. A new vision of luxury that transcends expectations. 
                Subscribe to be the first to discover what's next.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
