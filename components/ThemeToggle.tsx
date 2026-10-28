"use client";

import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

export function ThemeToggle({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = document.documentElement.dataset.theme;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(stored ? stored === "dark" : systemDark);
  }, []);

  function toggle() {
    const next = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    setIsDark(!isDark);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t.theme.toLight : t.theme.toDark}
      className="flex h-11 w-11 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-200"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M20.4 14.7A8.5 8.5 0 019.3 3.6a.5.5 0 00-.6-.7A9 9 0 1021.1 15.3a.5.5 0 00-.7-.6z" />
        </svg>
      )}
    </button>
  );
}
