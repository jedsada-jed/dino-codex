import Link from "next/link";
import { ArrowRightIcon } from "./Icons";

/** Shared section header: small eyebrow, title, optional description and "see all" pill link. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  icon,
  description,
  href,
  linkLabel,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{eyebrow}</p>
        <h2 id={id} className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-stone-900 sm:text-3xl">
          {icon}
          {title}
        </h2>
        {description && <p className="mt-2 text-stone-600">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-stone-300 px-4 text-sm font-medium text-stone-800 transition-colors hover:border-emerald-600 hover:text-emerald-700"
        >
          {linkLabel}
          <ArrowRightIcon className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
