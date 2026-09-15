import { BlackVeilInsignia } from "./black-veil-insignia";
import { DecoDivider } from "./deco-divider";

export function Masthead({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`masthead ${compact ? "masthead-compact" : ""}`}>
      <BlackVeilInsignia />
      <p className="established">Established 1921</p>
      <h1>The Black Veil</h1>
      <DecoDivider compact />
      <p className="masthead-subtitle">Fine Spirits <span>•</span> Music <span>•</span> Private Company</p>
    </div>
  );
}
