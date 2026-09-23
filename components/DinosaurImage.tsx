import Image from "next/image";
import type { DinosaurImage as DinosaurImageData } from "@/types/dinosaur";

function PlaceholderImage({ name }: { name: string }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-stone-200 text-emerald-800"
      role="img"
      aria-label={`ยังไม่มีภาพประกอบสำหรับ ${name}`}
    >
      <span className="text-5xl" aria-hidden="true">
        🦴
      </span>
    </div>
  );
}

export function DinosaurImage({
  image,
  name,
  size = "small",
  priority = false,
}: {
  image: DinosaurImageData | undefined;
  name: string;
  size?: "small" | "large";
  priority?: boolean;
}) {
  const src = size === "large" ? image?.localLarge ?? image?.localSmall : image?.localSmall;

  if (!image || !src) {
    return <PlaceholderImage name={name} />;
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

export function ImageAttribution({ image }: { image: DinosaurImageData }) {
  return (
    <p className="text-xs text-stone-500">
      ภาพโดย {image.author} ·{" "}
      <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700">
        {image.license}
      </a>{" "}
      ·{" "}
      <a href={image.commonsPageUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700">
        ดูที่ Wikimedia Commons
      </a>
    </p>
  );
}
