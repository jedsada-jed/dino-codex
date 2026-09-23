import Link from "next/link";
import { DinosaurImage } from "./DinosaurImage";
import { DIET_LABELS_TH } from "@/lib/labels";
import type { DinosaurWithContent } from "@/lib/dinosaurs";

export function DinosaurCard({ dinosaur }: { dinosaur: DinosaurWithContent }) {
  return (
    <Link
      href={`/dinosaurs/${dinosaur.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-stone-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
        <DinosaurImage image={dinosaur.images[0]} name={dinosaur.content?.nameTh ?? dinosaur.name} />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="font-semibold text-stone-900 group-hover:text-emerald-700">
          {dinosaur.content?.nameTh ?? dinosaur.name}
        </p>
        <p className="text-sm italic text-stone-500">{dinosaur.name}</p>
        <div className="mt-auto flex flex-wrap gap-1 pt-2 text-xs">
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">{DIET_LABELS_TH[dinosaur.diet]}</span>
          {dinosaur.countries.includes("TH") && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">พบในไทย</span>
          )}
        </div>
      </div>
    </Link>
  );
}
