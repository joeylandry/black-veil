import { ImageResponse } from "next/og";

export const alt = "The Black Veil — Established 1921";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#171513", color: "#e9dfc9", border: "24px solid #171513", outline: "2px solid #aa8a4b", outlineOffset: "-42px" }}>
      <div style={{ display: "flex", fontSize: 22, letterSpacing: 8, color: "#aa8a4b", textTransform: "uppercase" }}>Established 1921</div>
      <div style={{ display: "flex", marginTop: 20, fontFamily: "serif", fontSize: 118, letterSpacing: -5, textTransform: "uppercase" }}>The Black Veil</div>
      <div style={{ display: "flex", width: 580, height: 1, background: "#aa8a4b", margin: "22px 0" }} />
      <div style={{ display: "flex", fontSize: 24, letterSpacing: 7, textTransform: "uppercase" }}>Fine Spirits · Music · Private Company</div>
      <div style={{ display: "flex", marginTop: 52, padding: "10px 22px", border: "2px solid #7b2530", color: "#c68a90", fontSize: 21, letterSpacing: 6, textTransform: "uppercase", transform: "rotate(-2deg)" }}>Closed indefinitely</div>
    </div>,
    size,
  );
}
