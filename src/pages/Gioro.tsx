import { Layout } from "@/components/layout/Layout";
import gioroRing from "@/assets/gioro-ring.png";

export default function GioroPage() {
  return (
    <Layout>
      {/* Editorial Asymmetric Layout */}
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
        <div className="flex min-h-[calc(100vh-5rem)] flex-col lg:flex-row">
          {/* Image Section - 70% on desktop */}
          <div className="relative h-[50vh] w-full lg:h-auto lg:w-[70%]">
            <img
              src={gioroRing}
              alt="Gioro by Pheres"
              className="h-full w-full object-contain bg-muted/30"
            />
          </div>

          {/* Content Section - 30% on desktop, overlaps image slightly */}
          <div className="relative flex w-full flex-col justify-center bg-background px-8 py-16 lg:-ml-20 lg:w-[35%] lg:py-0">
            {/* Decorative line */}
            <div className="mb-8 h-px w-16 bg-brand" />
            
            <p className="mb-4 font-label text-xs font-medium uppercase tracking-[0.4em] text-muted-foreground">
              Coming Soon
            </p>
            
            <h1 className="mb-6 font-serif text-3xl font-light tracking-wide text-foreground md:text-4xl lg:text-5xl">
              Gioro
              <span className="mt-1 block text-2xl text-muted-foreground md:text-3xl lg:text-4xl">
                <span style={{ color: '#765228' }}>by</span> <span className="tracking-[0.2em]" style={{ color: '#765228' }}>PHERES</span>
              </span>
            </h1>
            
            <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
              A new dimension of luxury is coming. 
              An extraordinary experience awaits.
            </p>

            {/* Decorative element */}
            <div className="mt-12 flex items-center gap-4">
              <div className="h-px flex-1 max-w-24 bg-border" />
              <span className="font-label text-xs uppercase tracking-widest text-muted-foreground/60">
                2026
              </span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
