import type { MetadataRoute } from "next";
import { archiveRecords } from "@/data/archive";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const staticRoutes = ["", "/archive", "/about", "/guest-ledger", "/invitation"];
  return [
    ...staticRoutes.map((path) => ({ url: `${base}${path}`, changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.7 })),
    ...archiveRecords.map(({ slug }) => ({ url: `${base}/archive/${slug}`, changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
