export function DecoDivider({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`deco-divider ${compact ? "deco-divider-compact" : ""}`} aria-hidden="true">
      <span />
      <i>◆</i>
      <b>✦</b>
      <i>◆</i>
      <span />
    </div>
  );
}
