"use client";

import { useEffect, useState } from "react";

/**
 * The sticky header wrapper. It stays pinned to the top of the viewport; once the page
 * scrolls past a few pixels it sets `data-scrolled`, which globals.css uses to lift the
 * inner pill off the page (translucent blur, border and shadow). Keeping only this scroll
 * flag on the client lets the header's contents stay server-rendered.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="site-header" data-scrolled={scrolled}>
      {children}
    </header>
  );
}
