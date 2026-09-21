import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * PGlite ships a wasm build that loads its own files at runtime; bundling it into
   * the route handler breaks that path resolution. The RST-10 bench needs it in the
   * Node runtime, so it is required natively instead of bundled.
   */
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
