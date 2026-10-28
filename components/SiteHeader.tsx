"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "./LogoMark";
import { ThemeToggle } from "./ThemeToggle";
import { CloseIcon, MenuIcon } from "./Icons";
import { getDictionary } from "@/lib/dictionaries";
import { href, type Locale } from "@/lib/i18n";

/** News is written in Thai only, so English pages leave it out of the menu. */
const THAI_ONLY = new Set(["/news"]);

function isActive(pathname: string, target: string) {
  const path = pathname.replace(/\/$/, "");
  return path === target || (target.split("/").length > 2 && path.startsWith(`${target}/`));
}

/** Same page in the other language; Thai-only pages fall back to the English home page. */
function switchPath(pathname: string, from: Locale, to: Locale): string {
  const rest = pathname.replace(new RegExp(`^/${from}`), "") || "/";
  if (to === "en" && [...THAI_ONLY].some((p) => rest === p || rest.startsWith(`${p}/`))) return href(to, "/");
  return href(to, rest);
}

/** Inline nav from lg up; below that a menu button opens a full-width list with 44px rows. */
export function SiteHeader({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const pathname = usePathname();
  // Remember which page the menu was opened on, so navigating closes it without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const menuOpen = openOn === pathname;
  const other: Locale = lang === "th" ? "en" : "th";

  const links = [
    { path: "/", label: t.nav.home },
    { path: "/dinosaurs", label: t.nav.dinosaurs },
    { path: "/thailand", label: t.nav.thailand },
    { path: "/timeline", label: t.nav.timeline },
    { path: "/articles", label: t.nav.articles },
    { path: "/news", label: t.nav.news },
    { path: "/about", label: t.nav.about },
  ]
    .filter((l) => lang === "th" || !THAI_ONLY.has(l.path))
    .map((l) => ({ ...l, href: href(lang, l.path) }));

  const languageLink = (
    <Link
      href={switchPath(pathname, lang, other)}
      hrefLang={other}
      lang={other}
      aria-label={t.nav.switchLanguageLabel}
      className="flex min-h-11 items-center rounded-full border border-stone-300 px-3 text-sm font-medium text-stone-700 transition-colors hover:border-emerald-600 hover:text-emerald-700"
    >
      <span className="sm:hidden">{t.nav.switchLanguageShort}</span>
      <span className="hidden sm:inline">{t.nav.switchLanguage}</span>
    </Link>
  );

  return (
    <header
      className="border-b border-stone-200 bg-stone-100"
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpenOn(null);
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <Link href={href(lang, "/")} className="flex min-h-11 items-center gap-2 whitespace-nowrap text-lg font-bold text-emerald-800">
          <LogoMark className="h-7 w-7" />
          {t.siteName}
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <nav aria-label={t.nav.label} className="hidden lg:block">
            <ul className="flex gap-1 text-sm font-medium">
              {links.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center rounded-lg px-3 transition-colors ${
                        active ? "bg-emerald-50 text-emerald-800" : "text-stone-700 hover:bg-stone-200 hover:text-emerald-700"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {languageLink}
          <ThemeToggle lang={lang} />
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-200 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
            onClick={() => setOpenOn(menuOpen ? null : pathname)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <nav id="mobile-nav" aria-label={t.nav.label} hidden={!menuOpen} className="border-t border-stone-200 lg:hidden">
        <ul className="mx-auto max-w-6xl px-2 py-2">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center rounded-lg px-3 font-medium ${
                    active ? "bg-emerald-50 text-emerald-800" : "text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
