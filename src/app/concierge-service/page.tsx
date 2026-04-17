import type { Metadata } from "next";
import ConciergeService from "@/views/ConciergeService";

export const metadata: Metadata = {
  title: "Concierge Service",
  description:
    "PHERES Concierge — private appointments, custom commissions, and bespoke jewelry services for the most discerning clients.",
  alternates: { canonical: "https://pheres.com/concierge-service" },
  openGraph: {
    title: "Concierge Service | PHERES",
    description: "Private appointments and bespoke jewelry services.",
    url: "https://pheres.com/concierge-service",
  },
};

export default function Page() {
  return <ConciergeService />;
}
