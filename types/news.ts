export interface NewsItem {
  id: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD) the source published the story. */
  date: string;
  source: string;
  url: string;
  /** The source article's og:image (remote, hotlinked). Falls back to `cover` if it fails to load. */
  image: string | null;
  /** Local image path, or null to show the placeholder. */
  cover: string | null;
}
