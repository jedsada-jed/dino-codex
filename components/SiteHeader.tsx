"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "./LogoMark";
import { ThemeToggle } from "./ThemeToggle";
import { CloseIcon, MenuIcon } from "./Icons";

const NAV_LINKS = [
  { href: "/", label: "หน้าแรก" },
  { href: "/dinosaurs", label: "ไดโนเสาร์ทั้งหมด" },
  { href: "/thailand", label: "ไดโนเสาร์ไทย" },
  { href: "/timeline", label: "ไทม์ไลน์" },
  { href: "/articles", label: "บทความ" },
  { href: "/news", label: "ข่าวสาร" },
  { href: "/about", label: "เกี่ยวกับ" },
];

function isActive(pathname: string, href: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
}

/** Inline nav from lg up; below that a menu button opens a full-width list with 44px rows. */
export function SiteHeader() {
  const pathname = usePathname();
  // Remember which page the menu was opened on, so navigating closes it without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const menuOpen = openOn === pathname;

  return (
    <header
      className="border-b border-stone-200 bg-stone-100"
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpenOn(null);
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <Link href="/" className="flex min-h-11 items-center gap-2 text-lg font-bold text-emerald-800">
          <LogoMark className="h-7 w-7" />
          สารานุกรมไดโนเสาร์
        </Link>

        <div className="flex items-center gap-2">
          <nav aria-label="เมนูหลัก" className="hidden lg:block">
            <ul className="flex gap-1 text-sm font-medium">
              {NAV_LINKS.map((link) => {
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
          <ThemeToggle />
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-stone-700 transition-colors hover:bg-stone-200 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"}
            onClick={() => setOpenOn(menuOpen ? null : pathname)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <nav id="mobile-nav" aria-label="เมนูหลัก" hidden={!menuOpen} className="border-t border-stone-200 lg:hidden">
        <ul className="mx-auto max-w-6xl px-2 py-2">
          {NAV_LINKS.map((link) => {
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
