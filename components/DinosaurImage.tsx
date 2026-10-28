import Image from "next/image";
import { BoneIcon } from "./Icons";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { DinosaurImage as DinosaurImageData } from "@/types/dinosaur";

function PlaceholderImage({ name, lang }: { name: string; lang: Locale }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-stone-200 text-emerald-800"
      role="img"
      aria-label={getDictionary(lang).common.noImage(name)}
    >
      <BoneIcon className="h-10 w-10 opacity-60" />
    </div>
  );
}

export function DinosaurImage({
  image,
  name,
  lang,
  size = "small",
  priority = false,
}: {
  image: Pick<DinosaurImageData, "localSmall" | "localLarge"> | undefined;
  name: string;
  lang: Locale;
  size?: "small" | "large";
  priority?: boolean;
}) {
  const src = size === "large" ? image?.localLarge ?? image?.localSmall : image?.localSmall;

  if (!image || !src) {
    return <PlaceholderImage name={name} lang={lang} />;
  }

  return (
    <Image
      src={src}
      alt={name}
      fill
      sizes={size === "large" ? "(min-width: 768px) 500px, 100vw" : "(min-width: 768px) 300px, 50vw"}
      className="object-cover"
      priority={priority}
    />
  );
}

export function ImageAttribution({ image, lang }: { image: DinosaurImageData; lang: Locale }) {
  const t = getDictionary(lang).gallery;
  return (
    <p className="text-xs text-stone-500">
      {t.by} {image.author} ·{" "}
      <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700">
        {image.license}
      </a>{" "}
      ·{" "}
      <a href={image.commonsPageUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700">
        {t.viewOnCommons}
      </a>
    </p>
  );
}
