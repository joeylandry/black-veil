import { ReactNode } from "react";

export function InWorldNotice({ label = "Notice", children, className = "" }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <aside className={`in-world-notice ${className}`}>
      <p className="eyebrow">{label}</p>
      <div>{children}</div>
    </aside>
  );
}
