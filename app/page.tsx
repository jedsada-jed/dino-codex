import Link from "next/link";
import { getFeaturedDinosaurs, getThailandDinosaurs, getMeta, getAllDinosaurs } from "@/lib/dinosaurs";
import { PERIOD_LABELS_TH } from "@/lib/labels";
import { DinosaurCard } from "@/components/DinosaurCard";

export default function Home() {
  const featured = getFeaturedDinosaurs(6);
  const thailandDinosaurs = getThailandDinosaurs().slice(0, 6);
  const meta = getMeta();
  const all = getAllDinosaurs();

  const periodCounts = { Triassic: 0, Jurassic: 0, Cretaceous: 0, unknown: 0 } as Record<string, number>;
  for (const d of all) {
    const mid = (d.ageRangeMa[0] + d.ageRangeMa[1]) / 2;
    if (mid >= 201.4) periodCounts.Triassic++;
    else if (mid >= 145) periodCounts.Jurassic++;
    else periodCounts.Cretaceous++;
  }

  return (
    <div>
      <section className="bg-gradient-to-b from-emerald-50 to-stone-50 py-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-extrabold text-stone-900 sm:text-5xl">สารานุกรมไดโนเสาร์</h1>
          <p className="mt-4 text-lg text-stone-600">
            สำรวจไดโนเสาร์ {meta.dinosaurCount.toLocaleString("th-TH")} สายพันธุ์ พร้อมภาพประกอบและข้อมูลไดโนเสาร์ที่พบในประเทศไทย
          </p>
          <form action="/dinosaurs" className="mx-auto mt-6 flex max-w-md gap-2">
            <input
              type="text"
              name="q"
              placeholder="ค้นหาชื่อไดโนเสาร์ เช่น ไทแรนโนซอรัส"
              className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
            >
              ค้นหา
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="text-xl font-bold text-stone-900">เรียกดูตามยุค</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(["Triassic", "Jurassic", "Cretaceous"] as const).map((p) => (
            <Link
              key={p}
              href={`/timeline#${p.toLowerCase()}`}
              className="rounded-xl border border-stone-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-2xl font-bold text-emerald-800">{PERIOD_LABELS_TH[p]}</p>
              <p className="mt-1 text-sm text-stone-500">{periodCounts[p].toLocaleString("th-TH")} สายพันธุ์</p>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-900">ไดโนเสาร์แนะนำ</h2>
            <Link href="/dinosaurs" className="text-sm font-medium text-emerald-700 hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {featured.map((d) => (
              <DinosaurCard key={d.slug} dinosaur={d} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl bg-amber-50 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-900">🇹🇭 ไดโนเสาร์ในประเทศไทย</h2>
            <Link href="/thailand" className="text-sm font-medium text-amber-700 hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <p className="mt-2 text-stone-700">
            ประเทศไทยพบซากดึกดำบรรพ์ไดโนเสาร์แล้วอย่างน้อย {getThailandDinosaurs().length} สายพันธุ์ ส่วนใหญ่พบที่ภาคอีสาน
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {thailandDinosaurs.map((d) => (
              <DinosaurCard key={d.slug} dinosaur={d} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
