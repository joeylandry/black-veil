/** The Black Toad's emblem: a toad mid-leap inside a ring, as painted on the green door. */
export function ToadMark({ size = 40, title = "The Black Toad" }: { size?: number; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={title} className="toad-mark">
      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
      {/* hind legs, stretched in the leap */}
      <path d="M24 40 L12 52 L16 53 L27 44 Z" fill="currentColor" />
      <path d="M40 40 L52 52 L48 53 L37 44 Z" fill="currentColor" />
      {/* body */}
      <ellipse cx="32" cy="34" rx="10" ry="12" fill="currentColor" />
      {/* forelegs, reaching */}
      <path d="M25 27 L17 17 L20 16 L28 25 Z" fill="currentColor" />
      <path d="M39 27 L47 17 L44 16 L36 25 Z" fill="currentColor" />
      {/* head and eyes */}
      <ellipse cx="32" cy="22" rx="7" ry="5.5" fill="currentColor" />
      <circle cx="27.5" cy="18.5" r="2.6" fill="currentColor" />
      <circle cx="36.5" cy="18.5" r="2.6" fill="currentColor" />
      <circle cx="27.5" cy="18.2" r="0.9" className="toad-eye" />
      <circle cx="36.5" cy="18.2" r="0.9" className="toad-eye" />
    </svg>
  );
}
