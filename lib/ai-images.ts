import aiImagesData from "@/data/ai-images.json";
import type { AiImage, AiImageData } from "@/types/ai-image";
import type { DinosaurImage } from "@/types/dinosaur";

const aiImages = aiImagesData as AiImageData;

/** An AI image only replaces the real cover once its review matches at least this share of its prompt. */
export const MIN_COVER_SCORE = 0.9;

export interface AiImageScore {
  passed: number;
  total: number;
  /** 0–100, rounded. */
  percent: number;
}

export function getAiImages(slug: string): AiImage[] {
  return aiImages[slug] ?? [];
}

/** Null until someone has reviewed the image against its checklist. */
export function aiImageScore(image: AiImage): AiImageScore | null {
  const results = image.review?.results;
  if (!results || results.length === 0) return null;
  const passed = results.filter((r) => r.pass).length;
  return { passed, total: results.length, percent: Math.round((passed / results.length) * 100) };
}

function coverAiImage(slug: string): AiImage | null {
  const eligible = getAiImages(slug)
    .map((image) => ({ image, score: aiImageScore(image) }))
    .filter(({ score }) => score && score.passed / score.total >= MIN_COVER_SCORE)
    .sort((a, b) => b.score!.percent - a.score!.percent);
  return eligible[0]?.image ?? null;
}

export type CoverImage = Pick<DinosaurImage, "localSmall" | "localLarge">;

/** The image cards and heroes should show: a well-reviewed AI image, else the Commons image. */
export function getCoverImage(d: { slug: string; images: DinosaurImage[] }): { image: CoverImage | undefined; ai: AiImage | null } {
  const ai = coverAiImage(d.slug);
  return ai ? { image: ai, ai } : { image: d.images[0], ai: null };
}
