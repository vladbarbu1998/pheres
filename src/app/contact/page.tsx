import type { Metadata } from "next";
import Contact from "@/views/Contact";

export const metadata: Metadata = {
  title: { absolute: "Contact PHERES | Hong Kong Office" },
  description:
    "Get in touch with PHERES. Visit our Hong Kong atelier or contact our concierge for private appointments and inquiries.",
  alternates: { canonical: "https://pheres.com/contact" },
  openGraph: {
    title: "Contact | PHERES",
    description: "Reach out to PHERES luxury fine jewelry.",
    url: "https://pheres.com/contact",
  },
};

export default function Page() {
  return <Contact />;
}
