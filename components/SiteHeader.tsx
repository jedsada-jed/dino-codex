"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "./LogoMark";
import { ThemeToggle } from "./ThemeToggle";
import { CloseIcon, MenuIcon, SearchIcon } from "./Icons";
import { getDictionary } from "@/lib/dictionaries";
import { href, type Locale } from "@/lib/i18n";

/** News is written in Thai only, so English pages leave it out of the menu. */
const THAI_ONLY = new Set(["/news"]);

interface NavLink {
  path: string;
  label: string;
}
interface NavGroup {
  id: string;
  label: string;
  links: NavLink[];
}
type NavEntry = NavLink | NavGroup;

const isGroup = (e: NavEntry): e is NavGroup => "links" in e;

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

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
      <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Pages are grouped (explore / read / activities) so the bar stays short. From lg up the groups are
 * dropdowns; below that a menu button opens a full-width list with each group as a heading.
 */
export function SiteHeader({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const pathname = usePathname();
  // Both menus remember which page they were opened on, so navigating closes them without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const menuOpen = openOn === pathname;
  const [dropdown, setDropdown] = useState<{ id: string; on: string } | null>(null);
  const openGroup = dropdown?.on === pathname ? dropdown.id : null;
  const [searchOn, setSearchOn] = useState<string | null>(null);
  const searchOpen = searchOn === pathname;
  const navRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const other: Locale = lang === "th" ? "en" : "th";

  // Close an open dropdown when clicking anywhere outside the nav.
  useEffect(() => {
    if (!openGroup) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setDropdown(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openGroup]);

  const local = (links: NavLink[]) =>
    links.filter((l) => lang === "th" || !THAI_ONLY.has(l.path)).map((l) => ({ ...l, path: href(lang, l.path) }));

  const entries: NavEntry[] = [
    { path: href(lang, "/"), label: t.nav.home },
    {
      id: "explore",
      label: t.nav.explore,
      links: local([
        { path: "/dinosaurs", label: t.nav.dinosaurs },
        { path: "/thailand", label: t.nav.thailand },
        { path: "/timeline", label: t.nav.timeline },
        { path: "/map", label: t.nav.fossilMap },
      ]),
    },
    {
      id: "read",
      label: t.nav.read,
      links: local([
        { path: "/articles", label: t.nav.articles },
        { path: "/news", label: t.nav.news },
      ]),
    },
    {
      id: "activities",
      label: t.nav.activities,
      links: local([
        { path: "/size-compare", label: t.nav.sizeCompare },
        { path: "/quiz", label: t.nav.quiz },
        { path: "/coloring", label: t.nav.coloring },
      ]),
    },
    { path: href(lang, "/about"), label: t.nav.about },
  ];

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

  const itemClass = (active: boolean) =>
    `flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 transition-colors ${
      active ? "bg-emerald-50 text-emerald-800" : "text-stone-700 hover:bg-stone-200 hover:text-emerald-700"
    }`;

  return (
    <header
      className="border-b border-stone-200 bg-stone-100"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpenOn(null);
          setDropdown(null);
          setSearchOn(null);
        }
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <Link href={href(lang, "/")} className="flex min-h-11 items-center gap-2 whitespace-nowrap text-lg font-bold text-emerald-800">
          <LogoMark className="h-7 w-7" />
          {/* On the narrowest phones the header's four buttons leave no room for the name. */}
          <span className="max-[399px]:sr-only">{t.siteName}</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <nav ref={navRef} aria-label={t.nav.label} className="hidden lg:block">
            <ul className="flex gap-1 text-sm font-medium">
              {entries.map((entry) => {
                if (!isGroup(entry)) {
                  const active = isActive(pathname, entry.path);
                  return (
                    <li key={entry.path}>
                      <Link href={entry.path} aria-current={active ? "page" : undefined} className={itemClass(active)}>
                        {entry.label}
                      </Link>
                    </li>
                  );
                }
                const open = openGroup === entry.id;
                const active = entry.links.some((l) => isActive(pathname, l.path));
                return (
                  <li key={entry.id} className="relative">
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`nav-${entry.id}`}
                      onClick={() => setDropdown(open ? null : { id: entry.id, on: pathname })}
                      className={`${itemClass(active)} gap-1`}
                    >
                      {entry.label}
                      <Chevron open={open} />
                    </button>
                    <ul
                      id={`nav-${entry.id}`}
                      hidden={!open}
                      className="absolute left-0 top-full z-20 mt-1 min-w-48 rounded-xl border border-stone-200 bg-stone-50 p-1 shadow-lg"
                    >
                      {entry.links.map((link) => {
                        const linkActive = isActive(pathname, link.path);
                        return (
                          <li key={link.path}>
                            <Link href={link.path} aria-current={linkActive ? "page" : undefined} className={itemClass(linkActive)}>
                              {link.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </nav>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-200"
            aria-expanded={searchOpen}
            aria-controls="site-search"
            aria-label={searchOpen ? t.nav.closeSearch : t.nav.search}
            onClick={() => {
              setSearchOn(searchOpen ? null : pathname);
              // The box is only un-hidden on the next render, so focus it after that.
              if (!searchOpen) requestAnimationFrame(() => searchRef.current?.focus());
            }}
          >
            {searchOpen ? <CloseIcon /> : <SearchIcon />}
          </button>
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

      {/* A plain GET form to the browse page, which already reads ?q=, so the header needs no index. */}
      <div id="site-search" hidden={!searchOpen} className="border-t border-stone-200">
        <form action={href(lang, "/dinosaurs")} role="search" className="mx-auto flex max-w-6xl gap-2 px-4 py-3 sm:px-6">
          <input
            type="search"
            name="q"
            required
            ref={searchRef}
            aria-label={t.hero.searchLabel}
            placeholder={t.hero.searchPlaceholder}
            className="min-h-11 flex-1 rounded-lg border border-stone-300 bg-stone-50 px-3 text-base sm:text-sm"
          />
          <button type="submit" className="min-h-11 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-stone-50 hover:bg-emerald-800">
            {t.hero.searchButton}
          </button>
        </form>
      </div>

      <nav id="mobile-nav" aria-label={t.nav.label} hidden={!menuOpen} className="border-t border-stone-200 lg:hidden">
        <ul className="mx-auto max-w-6xl px-2 py-2">
          {entries.map((entry) => {
            const links = isGroup(entry) ? entry.links : [entry];
            return (
              <li key={isGroup(entry) ? entry.id : entry.path}>
                {isGroup(entry) && <p className="px-3 pb-1 pt-3 text-xs font-semibold text-stone-500">{entry.label}</p>}
                <ul>
                  {links.map((link) => {
                    const active = isActive(pathname, link.path);
                    return (
                      <li key={link.path}>
                        <Link
                          href={link.path}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-h-11 items-center rounded-lg px-3 font-medium ${isGroup(entry) ? "pl-6" : ""} ${
                            active ? "bg-emerald-50 text-emerald-800" : "text-stone-700 hover:bg-stone-200"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
