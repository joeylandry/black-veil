"use client";

import { ReactNode, useLayoutEffect, useRef, useState } from "react";

export function FitHeading({
  children,
  className,
  maxRem = 3,
  minRem = 1.3,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  maxRem?: number;
  minRem?: number;
  as?: "h1" | "h2" | "h3";
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
    <Tag ref={ref} className={className} style={fontSize ? { fontSize: `${fontSize}rem` } : undefined}>
      {children}
    </Tag>
  );
}
