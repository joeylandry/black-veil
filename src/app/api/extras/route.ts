import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

/**
 * Extra credit: the CTF and the Easter eggs. Dark until siteConfig.extrasOpen is true.
 *
 * The 2026 party's seven trials and their flags are kept for reference in
 * docs/legacy/black-veil-party-2026/source-pre-game/. When the Boston versions are written,
 * check flags here (server-side, like the findings) and write solves under `extra-<id>`.
 */
export async function POST() {
  if (!siteConfig.extrasOpen) {
    return NextResponse.json({ error: "Nothing here. Yet." }, { status: 404 });
  }
  return NextResponse.json({ error: "No extras are loaded." }, { status: 404 });
}
