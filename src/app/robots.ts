import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/account",
          "/cart",
          "/checkout",
          "/order-confirmation",
          "/api",
        ],
      },
    ],
    sitemap: "https://pheres.com/sitemap.xml",
    host: "https://pheres.com",
  };
}
