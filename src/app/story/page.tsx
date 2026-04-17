import type { Metadata } from "next";
import Story from "@/views/Story";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Discover the story of PHERES, a luxury fine jewelry house founded in 2006 in Hong Kong by master craftspeople.",
  alternates: { canonical: "https://pheres.com/story" },
  openGraph: {
    title: "Our Story | PHERES",
    description:
      "The story of PHERES, a luxury fine jewelry house founded in Hong Kong.",
    url: "https://pheres.com/story",
  },
};

const storyJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "Our Story | PHERES",
  description: "The story of PHERES luxury jewelry house, founded by Narcisa Pheres in 2006.",
  url: "https://pheres.com/story",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [".space-y-4"],
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storyJsonLd) }}
      />
      <Story />
    </>
  );
}
