import type { AiImage } from "@/types/ai-image";
import type { AiImageScore } from "@/lib/ai-images";

const formatDateTh = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" });

/** Small pill marking an image as AI-generated. */
export function AiBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-[#1c2e22]/85 px-2 py-0.5 text-[11px] font-semibold text-[#f4f7ef] backdrop-blur ${className}`}
    >
      ภาพจาก AI
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
export function AiImageDisclosure({ image, score }: { image: AiImage; score: AiImageScore | null }) {
  const verdicts = new Map(image.review?.results.map((r) => [r.id, r]));
  const tone = score ? scoreTone(score.percent) : null;

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-100 p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <AiBadge />
        <span className="text-stone-700">
          สร้างด้วย <span className="font-semibold text-stone-900">{image.modelLabel}</span> เมื่อ{" "}
          {formatDateTh(image.createdAt)}
        </span>
      </div>

      <div className="mt-3">
        {score && tone ? (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-semibold text-stone-900">ความถูกต้องตาม prompt</p>
              <p className={`text-lg font-bold ${tone.text}`}>
                {score.percent}%{" "}
                <span className="text-xs font-normal text-stone-600">
                  ({score.passed}/{score.total} ข้อ)
                </span>
              </p>
            </div>
            <div
              className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-200"
              role="meter"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={score.percent}
              aria-label="ความถูกต้องตาม prompt"
            >
              <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${score.percent}%` }} />
            </div>
          </>
        ) : (
          <p className="text-stone-600">ยังไม่ได้ตรวจความถูกต้องตาม prompt</p>
        )}
      </div>

      <details className="group mt-3">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 font-medium text-emerald-700">
          <span className="transition-transform group-open:rotate-90" aria-hidden="true">
            ›
          </span>
          ดูรายการตรวจ, prompt และแหล่งข้อมูล
        </summary>

        <ul className="mt-1 space-y-1.5">
          {image.checklist.map((item) => {
            const verdict = verdicts.get(item.id);
            const status = verdict ? (verdict.pass ? "ผ่าน" : "ไม่ผ่าน") : "ยังไม่ตรวจ";
            return (
              <li key={item.id} className="flex gap-2">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    verdict?.pass
                      ? "bg-emerald-600 text-stone-50"
                      : verdict
                        ? "bg-danger text-stone-50"
                        : "bg-stone-200 text-stone-600"
                  }`}
                  aria-label={status}
                >
                  {verdict ? (verdict.pass ? "✓" : "✕") : "?"}
                </span>
                <span className="text-stone-800">
                  {item.label}
                  {verdict?.note && <span className="block text-xs text-stone-500">{verdict.note}</span>}
                </span>
              </li>
            );
          })}
        </ul>
        {image.review && (
          <p className="mt-2 text-xs text-stone-500">
            ตรวจโดย {image.review.reviewer} เมื่อ {formatDateTh(image.review.reviewedAt)} · คะแนนคือสัดส่วนข้อที่ภาพทำได้ตรงกับ
            prompt ไม่ใช่การรับรองความถูกต้องทางวิทยาศาสตร์โดยผู้เชี่ยวชาญ
          </p>
        )}

        <p className="mt-4 font-semibold text-stone-900">Prompt ที่ใช้สร้างภาพ</p>
        <p className="mt-1 whitespace-pre-wrap rounded-xl bg-stone-50 p-3 font-mono text-xs leading-relaxed text-stone-700">
          {image.prompt}
        </p>

        <p className="mt-3 text-xs text-stone-600">
          ข้อมูลใน prompt อ้างอิงจาก{" "}
          {image.promptSources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && " และ "}
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
