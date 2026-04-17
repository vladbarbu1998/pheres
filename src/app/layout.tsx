import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./Providers";

export const metadata: Metadata = {
  title: {
    default: "PHERES | Luxury Fine Jewelry | Hong Kong",
    template: "%s | PHERES",
  },
  description:
    "PHERES is a luxury fine jewelry house based in Hong Kong, crafting exceptional couture and ready-to-wear pieces with rare diamonds and gemstones since 2006.",
  metadataBase: new URL("https://pheres.com"),
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
