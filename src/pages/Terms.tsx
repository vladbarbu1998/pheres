import { LegalLayout } from "@/components/layout/LegalLayout";

export default function Terms() {
  return (
    <LegalLayout title="Terms & Conditions">
      {/* 
        Add your terms and conditions content here.
        You can use standard HTML elements or React components.
        
        Example structure:
        <h2>1. Acceptance of Terms</h2>
        <p>Your content here...</p>
        
        <h2>2. Use of Service</h2>
        <p>Your content here...</p>
      */}
      <div className="space-y-8 text-muted-foreground">
        <section>
          <p className="text-lg">
            These Terms & Conditions will be updated with official content.
          </p>
          <p className="mt-4 text-sm">
            Last updated: {new Date().toLocaleDateString("en-US", { 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </p>
        </section>

        {/* Placeholder sections - replace with your actual content */}
        <section className="rounded-lg border border-dashed p-6">
          <p className="text-center text-sm">
            Terms and conditions content will be added here.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}