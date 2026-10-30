/** One generated coloring page, keyed by dinosaur slug in data/coloring.json. */
export interface ColoringPage {
  /** Full-size PNG for printing. */
  image: string;
  thumb: string;
  width: number;
  height: number;
  model: string;
  prompt: string;
  /** Same idea as AiImage: what the page must show, so a person can check it. */
  checklist: { id: string; label: string }[];
  /**
   * Filled in by hand after looking at the image; pages without a passing review aren't shown.
   * `note` is Thai, `noteEn` its English version for the /en page.
   */
  review?: { reviewedAt: string; results: { id: string; pass: boolean; note?: string; noteEn?: string }[] };
  createdAt: string;
}

export type ColoringData = Record<string, ColoringPage>;
