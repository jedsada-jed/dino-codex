import newsData from "@/data/news.json";
import type { NewsItem } from "@/types/news";

const news = [...(newsData as NewsItem[])].sort((a, b) => b.date.localeCompare(a.date));

export function getAllNews(): NewsItem[] {
  return news;
}

export function getLatestNews(count: number): NewsItem[] {
  return news.slice(0, count);
}
