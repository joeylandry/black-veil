"use client";

import type { SideStoryTier } from "@/data/archive";
import { ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export type SideStory = { headline: string; body: string; tier: SideStoryTier };

/** How far the columns may differ before it is worth cutting another story. */
const tolerancePx = 16;

type Balance = { cut: number; pass: number; done: boolean; lastDiff: number };

/** Natural height of a column's content, ignoring the stretch the grid row gives its box. */
function contentHeight(column: Element) {
  let total = 0;
  for (const child of Array.from(column.children)) {
    if (!(child instanceof HTMLElement) || child.hidden) continue;
    const style = getComputedStyle(child);
    // `.continued` is pushed down with margin-top: auto; count only its own height.
    const marginTop = child.classList.contains("continued") ? 0 : parseFloat(style.marginTop) || 0;
    total += child.offsetHeight + marginTop + (parseFloat(style.marginBottom) || 0);
  }
  return total;
}

/**
 * The right-hand column of a paper. Recurring notices, then local color, are cut bottom
 * up until the column ends as nearly level with the story beside it as it can, so the
 * slip below them no longer leaves the left column short. News always prints.
 */
export function NewspaperSide({ stories, children }: { stories: SideStory[]; children?: ReactNode }) {
  const asideRef = useRef<HTMLElement>(null);
  const [{ cut, pass, done, lastDiff }, setBalance] = useState<Balance>({ cut: 0, pass: 0, done: false, lastDiff: 0 });

  const cutOrder = useMemo(
    () => {
      const bottomUp = stories.map((_, index) => index).reverse();
      return [
        ...bottomUp.filter((index) => stories[index].tier === "recurring"),
        ...bottomUp.filter((index) => stories[index].tier === "color"),
      ];
    },
    [stories],
  );
  const hidden = useMemo(() => new Set(cutOrder.slice(0, cut)), [cutOrder, cut]);

  useLayoutEffect(() => {
    const aside = asideRef.current;
    const copy = aside?.parentElement?.querySelector(".newspaper-copy");
    if (done || !aside || !copy) return;
    const diff = contentHeight(aside) - contentHeight(copy);
    // The last cut overshot, leaving the right column shorter by more than it was long: put it back.
    if (cut > 0 && diff < 0 && -diff > lastDiff) {
      setBalance({ cut: cut - 1, pass, done: true, lastDiff });
    } else if (diff > tolerancePx && cut < cutOrder.length) {
      setBalance({ cut: cut + 1, pass, done: false, lastDiff: diff });
    } else {
      setBalance({ cut, pass, done: true, lastDiff: diff });
    }
  }, [cut, pass, done, lastDiff, cutOrder.length]);

  // Fonts arriving or the paper changing width both change every height; start over.
  const remeasure = useCallback(
    () => setBalance((current) => ({ cut: 0, pass: current.pass + 1, done: false, lastDiff: 0 })),
    [],
  );
  useEffect(() => {
    const copy = asideRef.current?.parentElement?.querySelector(".newspaper-copy");
    if (!copy) return;
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) remeasure();
    });
    let width = copy.clientWidth;
    const observer = new ResizeObserver(() => {
      if (copy.clientWidth === width) return;
      width = copy.clientWidth;
      remeasure();
    });
    observer.observe(copy);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [remeasure]);

  return (
    <aside ref={asideRef} className="newspaper-side" aria-label="Neighboring stories">
      {stories.map((story, index) => (
        <div key={story.headline} hidden={hidden.has(index)}>
          <h4>{story.headline}</h4>
          <p>{story.body}</p>
        </div>
      ))}
      {children}
    </aside>
  );
}
