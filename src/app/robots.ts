import type { MetadataRoute } from "next";

/** File 245 is for the people in the program, not for search engines. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
