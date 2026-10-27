import Link from "next/link";
import { DinosaurImage } from "./DinosaurImage";
import { FlameIcon } from "./Icons";
import { SectionHeading } from "./SectionHeading";
import { AiBadge } from "./AiImageDisclosure";
import { aiImageScore, getCoverImage } from "@/lib/ai-images";
import { getPopularDinosaurs, getPopularityPeriod, pageviewsToolUrl, type PopularDinosaur } from "@/lib/popularity";

const formatDateTh = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function ViewsBar({ views, maxViews }: { views: number; maxViews: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200" aria-hidden="true">
      <div className="h-full rounded-full bg-emerald-600" style={{ width: `${(views / maxViews) * 100}%` }} />
    </div>
  );
}

/** Top 3 as large podium cards. */
function PodiumCard({ item, maxViews }: { item: PopularDinosaur; maxViews: number }) {
  const { rank, dinosaur, nameTh, views } = item;
  const cover = getCoverImage(dinosaur);
  return (
    <Link
      href={`/dinosaurs/${dinosaur.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-stone-100 shadow-sm transition hover:border-emerald-500 hover:shadow-xl motion-safe:hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        <div className="absolute inset-0 transition-transform duration-500 motion-safe:group-hover:scale-105">
          <DinosaurImage image={cover.image} name={nameTh ?? dinosaur.name} />
        </div>
        {cover.ai && <AiBadge className="absolute bottom-3 left-3" percent={aiImageScore(cover.ai)?.percent} />}
        <span
          className={`absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-lg font-black shadow-lg ${
            rank === 1 ? "bg-[#e0a352] text-[#1c2e22]" : "bg-[#1c2e22] text-[#f4f7ef]"
          }`}
          aria-label={`อันดับ ${rank}`}
        >
          {rank}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-lg font-bold text-stone-900 group-hover:text-emerald-700">{nameTh ?? dinosaur.name}</p>
        {nameTh && <p className="text-sm italic text-stone-500">{dinosaur.name}</p>}
        <div className="mt-auto pt-3">
          <ViewsBar views={views} maxViews={maxViews} />
          <p className="mt-1.5 text-sm text-stone-600">
            <span className="font-bold text-stone-900">{views.toLocaleString("th-TH")}</span> ครั้ง/ปี
          </p>
        </div>
      </div>
    </Link>
  );
}

/** Ranks 4+ as a compact ranked list. */
function RankRow({ item, maxViews }: { item: PopularDinosaur; maxViews: number }) {
  const { rank, dinosaur, nameTh, views } = item;
  const cover = getCoverImage(dinosaur);
  return (
    <Link
      href={`/dinosaurs/${dinosaur.slug}`}
      className="group flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-stone-100"
    >
      <span className="w-7 shrink-0 text-center text-lg font-black text-stone-500" aria-label={`อันดับ ${rank}`}>
        {rank}
      </span>
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
        <DinosaurImage image={cover.image} name={nameTh ?? dinosaur.name} />
        {cover.ai && (
          <span className="absolute bottom-0.5 left-0.5 rounded bg-[#1c2e22]/85 px-1 text-[10px] font-bold text-[#f4f7ef]">AI</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-semibold text-stone-900 group-hover:text-emerald-700">{nameTh ?? dinosaur.name}</p>
          <p className="shrink-0 text-xs text-stone-600">
            <span className="font-semibold text-stone-800">{views.toLocaleString("th-TH")}</span> ครั้ง
          </p>
        </div>
        <div className="mt-1.5">
          <ViewsBar views={views} maxViews={maxViews} />
        </div>
      </div>
    </Link>
  );
}

/** Homepage top-10 ranked by English Wikipedia pageviews (data/popularity.json). */
export function PopularDinosaurs({ limit = 10 }: { limit?: number }) {
  const popular = getPopularDinosaurs(limit);
  if (popular.length === 0) return null;

  const period = getPopularityPeriod();
  const maxViews = popular[0].views;
  const podium = popular.slice(0, 3);
  const rest = popular.slice(3);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-labelledby="popular-heading">
      <SectionHeading
        id="popular-heading"
        eyebrow="Trending"
        title="ไดโนเสาร์ยอดฮิต"
        icon={<FlameIcon className="h-6 w-6 text-amber-700" />}
        description="จัดอันดับจากจำนวนครั้งที่คนทั่วโลกเปิดอ่านบทความใน Wikipedia ช่วง 12 เดือนล่าสุด"
      />

      <ol className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {podium.map((item) => (
          <li key={item.dinosaur.slug} className={item.rank === 1 ? "col-span-2 sm:col-span-1" : undefined}>
            <PodiumCard item={item} maxViews={maxViews} />
          </li>
        ))}
      </ol>

      {rest.length > 0 && (
        <ol start={4} className="mt-6 grid gap-x-8 gap-y-1 rounded-3xl border border-stone-200 p-2 sm:p-3 lg:grid-cols-2">
          {rest.map((item) => (
            <li key={item.dinosaur.slug}>
              <RankRow item={item} maxViews={maxViews} />
            </li>
          ))}
        </ol>
      )}

      <p className="mt-4 text-xs text-stone-500">
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
