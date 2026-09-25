"use client";

import { useEffect } from "react";

/** Opens a page at its very top; Next.js otherwise stops at the segment, below the site header. */
export function ScrollToTop() {
  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
  return null;
}
