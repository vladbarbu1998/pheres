import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/layout/PageHero";

export default function PressPage() {
  return (
    <Layout>
      <PageHero
        label="In the Spotlight"
        title="Press"
        intro="Pheres in the world's most prestigious publications and media. Discover our latest features, interviews, and editorial coverage."
      />

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Content Section - Placeholder */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-muted-foreground">
              Press content coming soon...
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
