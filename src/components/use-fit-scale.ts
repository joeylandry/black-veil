"use client";

import { useEffect, useRef, useState } from "react";

export function useFitScale<Outer extends HTMLElement, Inner extends HTMLElement>(enabled: boolean) {
  const outerRef = useRef<Outer>(null);
  const innerRef = useRef<Inner>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const update = () => {
      const containerWidth = outer.clientWidth;
      const naturalWidth = inner.offsetWidth;
      const naturalHeight = inner.offsetHeight;
      if (!containerWidth || !naturalWidth) return;
      const nextScale = Math.min(1, containerWidth / naturalWidth);
      setScale(nextScale);
      setHeight(naturalHeight * nextScale);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [enabled]);

  return { outerRef, innerRef, scale, height };
}

export function useIsMobile(breakpoint = 700) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}
