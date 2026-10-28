"use client";

import { useState } from "react";
import { DinosaurImage, ImageAttribution } from "./DinosaurImage";
import { AiBadge, AiImageDisclosure } from "./AiImageDisclosure";
import type { DinosaurImage as CommonsImage } from "@/types/dinosaur";
import type { AiImage } from "@/types/ai-image";
import type { AiImageScore } from "@/lib/ai-images";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

export type GalleryItem =
  | { kind: "commons"; image: CommonsImage }
  | { kind: "ai"; image: AiImage; score: AiImageScore | null };

/** Main image with its credit or AI disclosure, plus thumbnails when there is more than one. */
export function DinosaurGallery({ items, name, lang }: { items: GalleryItem[]; name: string; lang: Locale }) {
  const t = getDictionary(lang).gallery;
  const [index, setIndex] = useState(0);
  const current = items[index];

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-white">
        <DinosaurImage image={current?.image} name={name} lang={lang} size="large" priority />
        {current?.kind === "ai" && <AiBadge lang={lang} className="absolute left-3 top-3" />}
      </div>

      {items.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label={t.allImages}>
          {items.map((item, i) => (
            <li key={item.image.localSmall ?? i} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index}
                aria-label={t.imageN(i + 1, item.kind === "ai")}
                className={`relative block h-16 w-24 overflow-hidden rounded-xl bg-white ring-2 transition ${
                  i === index ? "ring-emerald-600" : "ring-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <DinosaurImage image={item.image} name={name} lang={lang} />
                {item.kind === "ai" && (
                  <span className="absolute bottom-1 left-1 rounded bg-[#1c2e22]/85 px-1 text-[10px] font-bold text-[#f4f7ef]">
                    AI
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3">
        {current?.kind === "commons" && <ImageAttribution image={current.image} lang={lang} />}
        {current?.kind === "ai" && <AiImageDisclosure image={current.image} score={current.score} lang={lang} />}
      </div>
    </div>
  );
}
