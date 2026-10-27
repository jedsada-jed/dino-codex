export interface PopularityItem {
  slug: string;
  /** English Wikipedia article title the views were counted on. */
  wikipediaTitle: string;
  /** Total user (non-bot) pageviews over the period. */
  views: number;
}

export interface PopularityData {
  generatedAt: string;
  /** Inclusive YYYY-MM-DD range the pageviews cover. */
  periodStart: string;
  periodEnd: string;
  /** Sorted by views, highest first. */
  items: PopularityItem[];
}
