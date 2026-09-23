import type { Metadata } from "next";
import { getBrowseIndex } from "@/lib/dinosaurs";
import { DinosaurBrowser } from "@/components/DinosaurBrowser";

export const metadata: Metadata = {
  title: "ไดโนเสาร์ทั้งหมด",
  description: "ค้นหาและกรองไดโนเสาร์กว่า 1,500 สายพันธุ์ ตามยุค ประเภทอาหาร และประเทศที่พบ",
};

export default function DinosaursPage() {
  const items = getBrowseIndex();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">ไดโนเสาร์ทั้งหมด</h1>
      <p className="mt-1 text-stone-600">ค้นหาและกรองไดโนเสาร์ {items.length.toLocaleString("th-TH")} สายพันธุ์</p>

      <div className="mt-6">
        <DinosaurBrowser items={items} />
      </div>
    </div>
  );
}
