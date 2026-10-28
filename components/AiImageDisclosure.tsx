import type { AiImage } from "@/types/ai-image";
import type { AiImageScore } from "@/lib/ai-images";
import { aiText } from "@/lib/ai-text";
import { getDictionary } from "@/lib/dictionaries";
import { formatDate, type Locale } from "@/lib/i18n";

/** Small pill marking an image as AI-generated, with its prompt-accuracy score when reviewed. */
export function AiBadge({ lang, className = "", percent }: { lang: Locale; className?: string; percent?: number }) {
  const t = getDictionary(lang).ai;
  return (
    <span
      className={`inline-flex items-center rounded-full bg-[#1c2e22]/85 px-2 py-0.5 text-[11px] font-semibold text-[#f4f7ef] backdrop-blur ${className}`}
      title={t.badgeTitle(percent)}
    >
      {t.badge}
      {percent !== undefined && ` · ${percent}%`}
    </span>
  );
}

function scoreTone(percent: number) {
  if (percent >= 90) return { bar: "bg-emerald-600", text: "text-emerald-800" };
  if (percent >= 75) return { bar: "bg-amber-700", text: "text-amber-700" };
  return { bar: "bg-danger", text: "text-danger" };
}

/**
 * Full disclosure for an AI image: model, date, how much of its prompt it got right (with the
 * per-item checklist), the exact prompt, and the sources the prompt was built from.
 */
export function AiImageDisclosure({ image, score, lang }: { image: AiImage; score: AiImageScore | null; lang: Locale }) {
  const t = getDictionary(lang).ai;
  const when = (iso: string) => formatDate(lang, iso, { timeZone: "Asia/Bangkok" });
  const verdicts = new Map(image.review?.results.map((r) => [r.id, r]));
  const tone = score ? scoreTone(score.percent) : null;
  const mismatches = image.checklist.filter((item) => verdicts.get(item.id)?.pass === false);
  const label = (thai: string) => aiText(lang, "labels", thai);
  const note = (thai: string) => aiText(lang, "notes", thai);

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-100 p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <AiBadge lang={lang} />
        <span className="text-stone-700">
          {t.createdWith} <span className="font-semibold text-stone-900">{aiText(lang, "other", image.modelLabel)}</span>{" "}
          {t.on} {when(image.createdAt)}
        </span>
      </div>

      {image.caveat && (
        <p className="mt-3 rounded-xl border border-amber-700/40 bg-amber-50 p-3 text-stone-800">
          <span className="font-semibold">{t.caveat} </span>
          {aiText(lang, "other", image.caveat)}
        </p>
      )}

      <div className="mt-3">
        {score && tone ? (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-semibold text-stone-900">{t.accuracy}</p>
              <p className={`text-lg font-bold ${tone.text}`}>
                {score.percent}% <span className="text-xs font-normal text-stone-600">{t.items(score.passed, score.total)}</span>
              </p>
            </div>
            <div
              className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-200"
              role="meter"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={score.percent}
              aria-label={t.accuracy}
            >
              <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${score.percent}%` }} />
            </div>
            {mismatches.length > 0 && (
              <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
                <p className="font-semibold text-stone-900">{t.mismatches}</p>
                <ul className="mt-1.5 space-y-1.5">
                  {mismatches.map((item) => {
                    const verdictNote = verdicts.get(item.id)?.note;
                    return (
                      <li key={item.id} className="flex gap-2">
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger text-xs font-bold text-stone-50"
                          aria-hidden="true"
                        >
                          ✕
                        </span>
                        <span className="text-stone-800">
                          {verdictNote ? note(verdictNote) : label(item.label)}
                          {verdictNote && (
                            <span className="block text-xs text-stone-500">
                              {t.shouldBe} {label(item.label)}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className="text-stone-600">{t.notReviewed}</p>
        )}
      </div>

      <details className="group mt-3">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 font-medium text-emerald-700">
          <span className="transition-transform group-open:rotate-90" aria-hidden="true">
            ›
          </span>
          {t.details}
        </summary>

        <ul className="mt-1 space-y-1.5">
          {image.checklist.map((item) => {
            const verdict = verdicts.get(item.id);
            const status = verdict ? (verdict.pass ? t.pass : t.fail) : t.pending;
            return (
              <li key={item.id} className="flex gap-2">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    verdict?.pass ? "bg-emerald-600 text-stone-50" : verdict ? "bg-danger text-stone-50" : "bg-stone-200 text-stone-600"
                  }`}
                  aria-label={status}
                >
                  {verdict ? (verdict.pass ? "✓" : "✕") : "?"}
                </span>
                <span className="text-stone-800">
                  {label(item.label)}
                  {verdict?.note && <span className="block text-xs text-stone-500">{note(verdict.note)}</span>}
                </span>
              </li>
            );
          })}
        </ul>
        {image.review && (
          <p className="mt-2 text-xs text-stone-500">
            {t.reviewedBy(aiText(lang, "other", image.review.reviewer), when(image.review.reviewedAt))}
          </p>
        )}

        <p className="mt-4 font-semibold text-stone-900">{t.promptTitle}</p>
        <p className="mt-1 whitespace-pre-wrap rounded-xl bg-stone-50 p-3 font-mono text-xs leading-relaxed text-stone-700">
          {image.prompt}
        </p>

        <p className="mt-3 text-xs text-stone-600">
          {t.promptSources}{" "}
          {image.promptSources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && (lang === "th" ? " และ " : " and ")}
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700">
                {s.label}
              </a>
            </span>
          ))}
        </p>
      </details>
    </div>
  );
}
