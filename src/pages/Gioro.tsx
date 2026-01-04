import { Layout } from "@/components/layout/Layout";
import gioroRing from "@/assets/gioro-ring.png";
import gioroRingMobile from "@/assets/gioro-ring-mobile.png";

export default function GioroPage() {
  return (
    <Layout>
      {/* Editorial Asymmetric Layout */}
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
        <div className="flex min-h-[calc(100vh-5rem)] flex-col lg:flex-row">
          {/* Image Section - Square on mobile, 70% on desktop */}
          <div className="relative aspect-square w-full lg:aspect-auto lg:h-auto lg:w-[70%]">
            {/* Mobile image */}
            <img
              src={gioroRingMobile}
              alt="Gioro by Pheres"
              className="h-full w-full object-cover lg:hidden"
            />
            {/* Desktop image */}
            <img
              src={gioroRing}
              alt="Gioro by Pheres"
              className="hidden h-full w-full object-cover scale-110 lg:block"
            />
          </div>

          {/* Content Section - 30% on desktop, overlaps image slightly */}
          <div className="relative flex w-full flex-col justify-center bg-background px-8 py-16 lg:-ml-20 lg:w-[35%] lg:py-0">
            {/* Decorative line */}
            <div className="mb-8 h-px w-16" style={{ backgroundColor: '#765228' }} />
            
            <p className="mb-4 font-label text-xs font-medium uppercase tracking-[0.4em]" style={{ color: '#765228' }}>
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
