import type { Metadata } from "next";
import PrivacyPolicy from "@/views/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "PHERES privacy policy — how we collect, use, and protect your personal information.",
  alternates: { canonical: "https://pheres.com/privacy-policy" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <PrivacyPolicy />;
}
