import type { Metadata } from "next";
import { getThailandDinosaurs } from "@/lib/dinosaurs";
import { DinosaurCard } from "@/components/DinosaurCard";

const description = "รวมไดโนเสาร์ที่พบซากดึกดำบรรพ์ในประเทศไทย เช่น ภูเวียงโกซอรัส สยามโมไทรันนัส และสยามแรปเตอร์";

export const metadata: Metadata = {
  title: "ไดโนเสาร์ในประเทศไทย",
  description,
  alternates: { canonical: "/thailand" },
  openGraph: { title: "ไดโนเสาร์ในประเทศไทย", description },
};

export default function ThailandPage() {
  const dinosaurs = getThailandDinosaurs();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">🇹🇭 ไดโนเสาร์ในประเทศไทย</h1>
      <p className="mt-2 max-w-2xl text-stone-600">
        นักบรรพชีวินวิทยาพบซากดึกดำบรรพ์ไดโนเสาร์ในประเทศไทยมาตั้งแต่ปี พ.ศ. 2519 ส่วนใหญ่พบในภาคตะวันออกเฉียงเหนือ
        เช่น จังหวัดขอนแก่น กาฬสินธุ์ และนครราชสีมา ปัจจุบันมีการตั้งชื่อไดโนเสาร์สายพันธุ์ใหม่จากประเทศไทยแล้ว{" "}
        {dinosaurs.length} สายพันธุ์
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {dinosaurs.map((d) => (
          <DinosaurCard key={d.slug} dinosaur={d} />
        ))}
      </div>
    </div>
  );
}
