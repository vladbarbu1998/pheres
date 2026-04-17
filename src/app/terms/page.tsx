import type { Metadata } from "next";
import Terms from "@/views/Terms";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "PHERES terms and conditions of sale and use of our website and services.",
  alternates: { canonical: "https://pheres.com/terms" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <Terms />;
}
