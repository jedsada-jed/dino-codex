import type { Metadata } from "next";
import { getAllNews } from "@/lib/news";
import { NewsCard } from "@/components/NewsCard";

const description = "รวมข่าวสารการค้นพบไดโนเสาร์ล่าสุด เน้นการค้นพบในประเทศไทย เช่น นาคาไททัน และอุรคาซอรัส";

export const metadata: Metadata = {
  title: "ข่าวสารไดโนเสาร์",
  description,
  alternates: { canonical: "/news" },
  openGraph: { title: "ข่าวสารไดโนเสาร์", description },
};

export default function NewsPage() {
  const news = getAllNews();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">ข่าวสารไดโนเสาร์</h1>
      <p className="mt-2 max-w-2xl text-stone-600">
        รวมข่าวการค้นพบไดโนเสาร์และซากดึกดำบรรพ์ล่าสุด โดยเฉพาะในประเทศไทย คลิกที่ข่าวเพื่ออ่านต่อที่เว็บไซต์ต้นทาง
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
