import Link from "next/link";
import { DinosaurImage } from "./DinosaurImage";
import { DIET_LABELS_TH, PERIOD_COLORS, PERIOD_LABELS_TH } from "@/lib/labels";
import { getPeriod, type DinosaurWithContent } from "@/lib/dinosaurs";
import { aiImageScore, getCoverImage } from "@/lib/ai-images";
import { AiBadge } from "./AiImageDisclosure";

export function DinosaurCard({ dinosaur }: { dinosaur: DinosaurWithContent }) {
  const nameTh = dinosaur.content?.nameTh;
  const period = getPeriod(dinosaur);
  const cover = getCoverImage(dinosaur);

  return (
    <Link
      href={`/dinosaurs/${dinosaur.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm transition hover:border-emerald-500 hover:shadow-lg motion-safe:hover:-translate-y-1"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-white">
        <div className="absolute inset-0 transition-transform duration-500 motion-safe:group-hover:scale-105">
          <DinosaurImage image={cover.image} name={nameTh ?? dinosaur.name} />
        </div>
        {cover.ai && <AiBadge className="absolute left-2 top-2" percent={aiImageScore(cover.ai)?.percent} />}
        <span className="absolute right-2 top-2 rounded-full bg-stone-900/75 px-2 py-0.5 text-[11px] font-medium text-stone-50 backdrop-blur">
          {DIET_LABELS_TH[dinosaur.diet]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="font-bold leading-snug text-stone-900 group-hover:text-emerald-700">{nameTh ?? dinosaur.name}</p>
        {nameTh && <p className="text-sm italic text-stone-500">{dinosaur.name}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs text-stone-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PERIOD_COLORS[period] }} aria-hidden="true" />
            {PERIOD_LABELS_TH[period]}
          </span>
          {dinosaur.countries.includes("TH") && <span className="font-medium text-amber-700">พบในไทย</span>}
        </div>
      </div>
    </Link>
  );
}
