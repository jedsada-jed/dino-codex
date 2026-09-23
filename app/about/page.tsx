import type { Metadata } from "next";
import { getMeta } from "@/lib/dinosaurs";

const description = "ที่มาของข้อมูล วิธีการสร้างเว็บไซต์ และสัญญาอนุญาตของข้อมูลและภาพประกอบ";

export const metadata: Metadata = {
  title: "เกี่ยวกับเว็บไซต์นี้",
  description,
  alternates: { canonical: "/about" },
  openGraph: { title: "เกี่ยวกับเว็บไซต์นี้", description },
};

export default function AboutPage() {
  const meta = getMeta();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">เกี่ยวกับเว็บไซต์นี้</h1>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-stone-900">ที่มาของข้อมูล</h2>
        <p className="mt-2 leading-relaxed text-stone-700">
          ข้อมูลทางวิทยาศาสตร์ทั้งหมด (การจัดหมวดหมู่ ช่วงเวลาที่มีชีวิตอยู่ ประเทศที่พบซากดึกดำบรรพ์ ผู้ตั้งชื่อ)
          รวบรวมโดยอัตโนมัติจากฐานข้อมูลสาธารณะ 3 แห่ง ส่วนเนื้อหาภาษาไทย (ความหมายของชื่อ คำอธิบาย
          เกร็ดความรู้) เขียนขึ้นเองทั้งหมด ไม่ได้แปลหรือคัดลอกจากวิกิพีเดีย
        </p>

        <ul className="mt-4 space-y-3">
          <li className="rounded-xl border border-stone-200 bg-stone-100 p-4">
            <p className="font-semibold text-stone-900">{meta.sources.pbdb.name}</p>
            <p className="text-sm text-stone-600">
              ข้อมูลการจัดหมวดหมู่ ช่วงอายุ และตำแหน่งที่พบซากดึกดำบรรพ์ ·{" "}
              <a href={meta.sources.pbdb.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700">
                {meta.sources.pbdb.url}
              </a>{" "}
              · สัญญาอนุญาต {meta.sources.pbdb.license}
            </p>
          </li>
          <li className="rounded-xl border border-stone-200 bg-stone-100 p-4">
            <p className="font-semibold text-stone-900">{meta.sources.wikidata.name}</p>
            <p className="text-sm text-stone-600">
              ใช้จับคู่ชื่อไดโนเสาร์กับรูปภาพประกอบ ·{" "}
              <a
                href={meta.sources.wikidata.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-emerald-700"
              >
                {meta.sources.wikidata.url}
              </a>{" "}
              · สัญญาอนุญาต {meta.sources.wikidata.license}
            </p>
          </li>
          <li className="rounded-xl border border-stone-200 bg-stone-100 p-4">
            <p className="font-semibold text-stone-900">{meta.sources.wikimediaCommons.name}</p>
            <p className="text-sm text-stone-600">
              แหล่งที่มาของภาพประกอบทั้งหมด แต่ละภาพแสดงชื่อผู้สร้างและสัญญาอนุญาตของตัวเองกำกับไว้ใต้ภาพ ·{" "}
              <a
                href={meta.sources.wikimediaCommons.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-emerald-700"
              >
                {meta.sources.wikimediaCommons.url}
              </a>
            </p>
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-stone-900">วิธีการสร้างเว็บไซต์นี้</h2>
        <p className="mt-2 leading-relaxed text-stone-700">
          ข้อมูลไดโนเสาร์ดึงมาจาก Paleobiology Database และจับคู่กับรูปภาพจาก Wikidata/Wikimedia Commons
          ด้วยสคริปต์อัตโนมัติ ภาพทั้งหมดถูกดาวน์โหลดและแปลงเป็นไฟล์ในเว็บไซต์นี้ล่วงหน้า
          (ไม่ได้เรียกใช้ภาพจาก Wikimedia โดยตรงขณะเปิดเว็บ) เว็บไซต์นี้อัปเดตข้อมูลล่าสุดเมื่อ{" "}
          {new Date(meta.generatedAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}{" "}
          ปัจจุบันมีข้อมูลไดโนเสาร์ทั้งหมด {meta.dinosaurCount.toLocaleString("th-TH")} สายพันธุ์
          มีภาพประกอบ {meta.withImageCount.toLocaleString("th-TH")} สายพันธุ์ และพบในประเทศไทย{" "}
          {meta.thailandCount.toLocaleString("th-TH")} สายพันธุ์
        </p>
      </section>
    </div>
  );
}
