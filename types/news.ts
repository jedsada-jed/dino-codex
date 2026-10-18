export interface NewsItem {
  id: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD) the source published the story. */
  date: string;
  source: string;
  url: string;
  /** Local image path, or null to show the placeholder. */
  cover: string | null;
}
