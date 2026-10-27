import Image from "next/image";
import Link from "next/link";
import { SearchIcon } from "./Icons";

/** Decorative fern frond: leaflets placed along a gently curving stem. */
function Fern({ className }: { className?: string }) {
  const leaflets = Array.from({ length: 14 }, (_, i) => {
    const t = i / 13;
    const y = 20 + t * 360;
    const x = 200 + Math.sin(t * 2.2) * 30;
    const len = 90 - t * 55;
    return { x, y, len };
  });
  return (
    <svg viewBox="0 0 400 420" className={className} fill="currentColor" aria-hidden="true">
      <path d="M200 10 C230 140 190 260 215 410" fill="none" stroke="currentColor" strokeWidth="4" />
      {leaflets.map(({ x, y, len }, i) => (
        <g key={i}>
          <ellipse cx={x - len / 2} cy={y + 8} rx={len / 2} ry={9} transform={`rotate(-28 ${x} ${y})`} />
          <ellipse cx={x + len / 2} cy={y + 8} rx={len / 2} ry={9} transform={`rotate(28 ${x} ${y})`} />
        </g>
      ))}
    </svg>
  );
}

/**
 * Homepage hero. Uses a fixed deep-forest palette in both themes (like a museum hall at
 * dusk) so the white specimen card and light text always have the same contrast.
 */
export function Hero({ dinosaurCount, thailandCount }: { dinosaurCount: number; thailandCount: number }) {
  const stats = [
    { value: dinosaurCount.toLocaleString("th-TH"), label: "สายพันธุ์" },
    { value: thailandCount.toLocaleString("th-TH"), label: "พบในไทย" },
    { value: "3", label: "ยุคไดโนเสาร์" },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-[#0b2419] text-[#e3efe8]">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_20%,rgba(95,196,143,0.28),transparent_55%),radial-gradient(ellipse_at_10%_100%,rgba(224,163,82,0.18),transparent_50%)]"
        aria-hidden="true"
      />
      <Fern className="absolute -left-24 -top-10 -z-10 h-[460px] w-[440px] -rotate-12 text-[#1f6b4a] opacity-40" />
      <Fern className="absolute -bottom-40 -right-20 -z-10 h-[520px] w-[500px] rotate-[160deg] text-[#1f6b4a] opacity-30" />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-[#9fe0bc]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e0a352]" aria-hidden="true" />
            สารานุกรมไดโนเสาร์ภาษาไทย
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            ย้อนเวลา
            <span className="block bg-gradient-to-r from-[#9fe0bc] to-[#e0a352] bg-clip-text text-transparent">
              ไปพบไดโนเสาร์
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#c4d4c8]">
            ค้นหาข้อมูล ภาพประกอบ และเรื่องน่ารู้ของไดโนเสาร์จากทั่วโลก รวมถึงสายพันธุ์ที่ค้นพบในประเทศไทย
          </p>

          <form action="/dinosaurs" className="mt-8 flex max-w-xl gap-2 rounded-full border border-white/15 bg-white/10 p-1.5 backdrop-blur">
            <label htmlFor="home-search" className="sr-only">
              ค้นหาชื่อไดโนเสาร์
            </label>
            <div className="flex flex-1 items-center gap-2 pl-3">
              <SearchIcon className="h-5 w-5 shrink-0 text-[#9bb0a2]" />
              <input
                id="home-search"
                type="search"
                name="q"
                placeholder="เช่น ไทแรนโนซอรัส, สยามโมไทรันนัส"
                className="min-h-11 w-full bg-transparent text-base text-white placeholder:text-[#9bb0a2] focus-visible:outline-none sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="min-h-11 shrink-0 rounded-full bg-[#e0a352] px-6 text-sm font-semibold text-[#1c2e22] transition-colors hover:bg-[#ecb86f]"
            >
              ค้นหา
            </button>
          </form>

          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-xs text-[#9bb0a2] sm:text-sm">{s.label}</dt>
                <dd className="mt-1 text-2xl font-bold text-white sm:text-3xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Link
          href="/dinosaurs/tyrannosaurus"
          className="group relative block rounded-3xl bg-[#f4f7ef] p-3 shadow-2xl shadow-black/40 ring-1 ring-white/10 transition motion-safe:lg:rotate-2 motion-safe:hover:rotate-0"
        >
          <div className="relative aspect-[960/388] overflow-hidden rounded-2xl bg-white">
            <Image
              src="/images/dinos/tyrannosaurus-960.webp"
              alt="ไทแรนโนซอรัส"
              fill
              priority
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
            />
          </div>
          <div className="flex items-end justify-between gap-3 px-2 pb-1 pt-3 text-[#1c2e22]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a15c1f]">อันดับ 1 ยอดฮิต</p>
              <p className="text-xl font-bold">ไทแรนโนซอรัส</p>
              <p className="text-sm italic text-[#545f4d]">Tyrannosaurus rex · ยาว ~12 เมตร</p>
            </div>
            <span className="rounded-full bg-[#1f6b4a] px-3 py-1 text-xs font-medium text-white">ครีเทเชียส</span>
          </div>
        </Link>
      </div>
    </section>
  );
}
