import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/_next/", "/private/"],
      },
      { userAgent: "GPTBot", allow: "/", disallow: ["/admin/", "/api/"] },
      { userAgent: "ChatGPT-User", allow: "/", disallow: ["/admin/", "/api/"] },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: ["/admin/", "/api/"] },
    ],
    host: new URL(baseUrl).host,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
