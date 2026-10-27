import Link from "next/link";
import { DinosaurImage } from "./DinosaurImage";
import { FlameIcon } from "./Icons";
import { getPopularDinosaurs, getPopularityPeriod, pageviewsToolUrl } from "@/lib/popularity";

const formatDateTh = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** Homepage top-10 ranked by English Wikipedia pageviews (data/popularity.json). */
export function PopularDinosaurs({ limit = 10 }: { limit?: number }) {
  const popular = getPopularDinosaurs(limit);
  if (popular.length === 0) return null;

  const period = getPopularityPeriod();
  const maxViews = popular[0].views;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6" aria-labelledby="popular-heading">
      <h2 id="popular-heading" className="flex items-center gap-2 text-xl font-bold text-stone-900">
        <FlameIcon className="h-5 w-5 text-amber-700" />
        ไดโนเสาร์ยอดฮิต
      </h2>
      <p className="mt-1 text-sm text-stone-500">จัดอันดับจากจำนวนครั้งที่คนทั่วโลกเปิดอ่านบทความใน Wikipedia ช่วง 12 เดือนล่าสุด</p>

      <ol className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {popular.map(({ rank, dinosaur, nameTh, views }) => (
          <li key={dinosaur.slug}>
            <Link
              href={`/dinosaurs/${dinosaur.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-stone-100 shadow-sm transition motion-safe:hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
                <DinosaurImage image={dinosaur.images[0]} name={nameTh ?? dinosaur.name} />
                <span
                  className={`absolute left-2 top-2 flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-bold shadow ${
                    rank <= 3 ? "bg-amber-50 text-amber-700" : "bg-stone-100 text-stone-700"
                  }`}
                  aria-label={`อันดับ ${rank}`}
                >
                  {rank}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <p className="font-semibold text-stone-900 group-hover:text-emerald-700">{nameTh ?? dinosaur.name}</p>
                {nameTh && <p className="text-sm italic text-stone-500">{dinosaur.name}</p>}
                <div className="mt-auto pt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200" aria-hidden="true">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${(views / maxViews) * 100}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-stone-600">
                    <span className="font-semibold text-stone-800">{views.toLocaleString("th-TH")}</span> ครั้ง/ปี
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-3 text-xs text-stone-500">
        ที่มา: ยอดเข้าชมบทความ Wikipedia ภาษาอังกฤษ (ไม่นับ bot) {formatDateTh(period.start)} – {formatDateTh(period.end)} จาก{" "}
        <a
          href="https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/reference/page-views.html"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-emerald-700"
        >
          Wikimedia Pageviews API
        </a>{" "}
        ·{" "}
        <a
          href={pageviewsToolUrl(
            popular.map((p) => p.wikipediaTitle),
            period,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-emerald-700"
        >
          ตรวจสอบตัวเลข
        </a>
      </p>
    </section>
  );
}
