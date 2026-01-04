import { Layout } from "@/components/layout/Layout";
import gioroRing from "@/assets/gioro-ring.png";

export default function GioroPage() {
  return (
    <Layout>
      {/* Full Background Hero */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={gioroRing}
            alt="Gioro by Pheres"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-background/30" />
        </div>

        {/* Content */}
        <div className="container relative z-10 text-center">
          <p className="mb-4 font-label text-sm font-medium uppercase tracking-[0.3em] text-foreground/80 animate-fade-in">
            Coming Soon
          </p>
          <h1 className="font-serif text-3xl font-light tracking-wide text-foreground md:text-4xl lg:text-5xl animate-fade-in">
            Gioro by <span className="tracking-[0.2em]">PHERES</span>
          </h1>
        </div>
      </section>
    </Layout>
  );
}
