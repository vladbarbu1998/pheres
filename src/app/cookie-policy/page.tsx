import type { Metadata } from "next";
import CookiePolicy from "@/views/CookiePolicy";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "PHERES cookie policy — how we use cookies and similar technologies on our website.",
  alternates: { canonical: "https://pheres.com/cookie-policy" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <CookiePolicy />;
}
