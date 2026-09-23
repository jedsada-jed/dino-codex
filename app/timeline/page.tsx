import type { Metadata } from "next";
import { getAllDinosaurs, getPeriod, PERIODS } from "@/lib/dinosaurs";
import { PERIOD_LABELS_TH } from "@/lib/labels";
import { DinosaurCard } from "@/components/DinosaurCard";

export const metadata: Metadata = {
  title: "ไทม์ไลน์ไดโนเสาร์",
  description: "ไทม์ไลน์ยุคไทรแอสซิก จูแรสซิก และครีเทเชียส ที่ไดโนเสาร์อาศัยอยู่",
};

export default function TimelinePage() {
  const all = getAllDinosaurs();
  const byPeriod = { Triassic: [] as typeof all, Jurassic: [] as typeof all, Cretaceous: [] as typeof all };
  for (const d of all) {
    const p = getPeriod(d);
    if (p !== "unknown") byPeriod[p].push(d);
  }

  const totalDuration = PERIODS.reduce((sum, p) => sum + (p.maxMa - p.minMa), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">ไทม์ไลน์ไดโนเสาร์</h1>
      <p className="mt-2 max-w-2xl text-stone-600">
        ไดโนเสาร์มีชีวิตอยู่บนโลกตั้งแต่ยุคไทรแอสซิกจนถึงปลายยุคครีเทเชียส เป็นเวลากว่า 180 ล้านปี ก่อนจะสูญพันธุ์ไปเมื่อ
        66 ล้านปีก่อน
      </p>

      <div className="mt-6 flex h-12 overflow-hidden rounded-full text-sm font-medium text-white" role="img" aria-label="แถบไทม์ไลน์แสดงสัดส่วนความยาวของแต่ละยุค">
        {PERIODS.map((p) => {
          const duration = p.maxMa - p.minMa;
          const widthPercent = (duration / totalDuration) * 100;
          const color = p.key === "Triassic" ? "bg-orange-500" : p.key === "Jurassic" ? "bg-emerald-600" : "bg-sky-700";
          return (
            <div key={p.key} className={`flex items-center justify-center ${color}`} style={{ width: `${widthPercent}%` }}>
              {PERIOD_LABELS_TH[p.key]}
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-xs text-stone-500">
        <span>251.9 ล้านปีก่อน</span>
        <span>66 ล้านปีก่อน (ปัจจุบัน)</span>
      </div>

      {PERIODS.map((p) => (
        <section key={p.key} id={p.key.toLowerCase()} className="mt-10 scroll-mt-20 border-t border-stone-200 pt-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold text-stone-900">{PERIOD_LABELS_TH[p.key]}</h2>
            <p className="text-sm text-stone-500">
              {p.maxMa}–{p.minMa} ล้านปีก่อน · {byPeriod[p.key].length.toLocaleString("th-TH")} สายพันธุ์
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {byPeriod[p.key]
              .filter((d) => d.images.length > 0)
              .slice(0, 12)
              .map((d) => (
                <DinosaurCard key={d.slug} dinosaur={d} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
