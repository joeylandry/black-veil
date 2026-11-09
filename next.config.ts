import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * PGlite ships a wasm build that loads its own files at runtime; bundling it breaks that.
   * It backs the SQL simulation sandbox and the optional local `pglite:` database.
   */
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
