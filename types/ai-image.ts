export interface AiImageCheck {
  /** Matches a rule id in scripts/generate-ai-images.ts. */
  id: string;
  /** Thai description of what the image should show. */
  label: string;
}

export interface AiImageReview {
  /** Who judged the image, e.g. "Claude Opus 5.5 (ตรวจด้วยภาพ)". */
  reviewer: string;
  reviewedAt: string;
  /** One verdict per checklist item, in checklist order. */
  results: { id: string; pass: boolean; note?: string }[];
}

export interface AiImage {
  /** Same size pair as DinosaurImage so the existing image components can render it. */
  localSmall: string;
  localLarge: string;
  width: number;
  height: number;
  /** Provider model ID, e.g. "@cf/black-forest-labs/flux-2-dev". */
  model: string;
  /** Human-readable model and provider, shown in the AI disclosure. */
  modelLabel: string;
  /** The exact prompt sent to the model. */
  prompt: string;
  /** Requirements taken from the prompt, used to score the image. */
  checklist: AiImageCheck[];
  review?: AiImageReview;
  /** Where the scientific facts in the prompt came from. */
  promptSources: { label: string; url: string }[];
  createdAt: string;
}

/** Keyed by dinosaur slug; several images per dinosaur are allowed. */
export type AiImageData = Record<string, AiImage[]>;
