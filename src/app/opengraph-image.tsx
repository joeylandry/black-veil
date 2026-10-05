import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { eventConfig } from "@/config/event";

// The link preview is the first thing an invited guest sees, so it reads as an invitation:
// what, when, and the reply date. It must never carry the old words that unseal the register.
export const alt = `You are invited to The Black Veil, a murder mystery masquerade, Friday, October 23, Manchester, N.H. Kindly reply by ${eventConfig.rsvpDeadlineShort}.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontDir = join(process.cwd(), "src/app/fonts");
const geist = readFile(join(fontDir, "geist-600.ttf"));
const bodoni = readFile(join(fontDir, "bodoni-moda-display-600.ttf"));

const gold = "#aa8a4b";
const cream = "#e9dfc9";

export default async function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#171513", padding: 28 }}>
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `2px solid ${gold}`, color: cream }}>
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 8, color: gold, textTransform: "uppercase" }}>You are invited</div>
        <div style={{ display: "flex", marginTop: 18, fontFamily: "Bodoni", fontSize: 124, letterSpacing: -2, lineHeight: 1, textTransform: "uppercase" }}>The Black Veil</div>
        <div style={{ display: "flex", width: 560, height: 1, background: gold, margin: "28px 0 24px" }} />
        <div style={{ display: "flex", fontFamily: "Bodoni", fontSize: 44, letterSpacing: 1 }}>A Murder Mystery Masquerade</div>
        <div style={{ display: "flex", marginTop: 18, fontSize: 24, letterSpacing: 5, color: gold, textTransform: "uppercase" }}>Friday, October 23 · Eight o’clock · Manchester, N.H.</div>
        <div style={{ display: "flex", marginTop: 40, padding: "10px 22px", border: "2px solid #7b2530", color: "#c68a90", fontSize: 20, letterSpacing: 6, textTransform: "uppercase", transform: "rotate(-2deg)" }}>
          {`Kindly reply by ${eventConfig.rsvpDeadlineShort}`}
        </div>
      </div>
    </div>,
    {
      ...size,
      // The first font is the default, so the small lines get Geist and only the display lines ask for Bodoni.
      fonts: [
        { name: "Geist", data: await geist, style: "normal", weight: 600 },
        { name: "Bodoni", data: await bodoni, style: "normal", weight: 600 },
      ],
    },
  );
}
