"use client";

import { useLayoutEffect, useRef, useState } from "react";

export function FitHeading({
  children,
  className,
  maxRem = 3,
  minRem = 1.3,
}: {
  children: string;
  className?: string;
  maxRem?: number;
  minRem?: number;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      let size = maxRem;
      el.style.fontSize = `${size}rem`;
      while (el.scrollWidth > el.clientWidth && size > minRem) {
        size = Math.max(minRem, size - 0.05);
        el.style.fontSize = `${size}rem`;
      }
      setFontSize(size);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children, maxRem, minRem]);

  return (
    <h2 ref={ref} className={className} style={fontSize ? { fontSize: `${fontSize}rem` } : undefined}>
      {children}
    </h2>
  );
}
