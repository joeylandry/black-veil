type InsigniaProps = {
  className?: string;
  interactive?: boolean;
};

export function BlackVeilInsignia({ className = "", interactive = false }: InsigniaProps) {
  return (
    <svg
      aria-hidden="true"
      className={`insignia ${interactive ? "insignia-interactive" : ""} ${className}`}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M80 8 95 32l28-5-4 29 26 13-18 23 13 26-29 4-13 26-23-18-26 13-4-29-26-13 18-23-13-26 29-4L57 21l23 18Z" stroke="currentColor" strokeWidth="2" />
      <circle cx="80" cy="80" r="45" stroke="currentColor" strokeWidth="1.5" />
      <path d="M80 42c-8 10-22 10-26 23 9-3 17 0 21 8-14 0-24 7-26 20 11-6 22-4 29 5l2 26 2-26c7-9 18-11 29-5-2-13-12-20-26-20 4-8 12-11 21-8-4-13-18-13-26-23Z" fill="currentColor" />
      <path d="M67 106c4-5 8-7 13-7s9 2 13 7M61 58l19 66 19-66" stroke="var(--paper, #e7ddc7)" strokeWidth="2" />
      <text x="80" y="87" textAnchor="middle" fill="var(--paper, #e7ddc7)" fontSize="18" fontFamily="serif" fontWeight="700">BV</text>
    </svg>
  );
}
