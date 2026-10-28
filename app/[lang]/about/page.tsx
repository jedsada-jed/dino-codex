import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMeta } from "@/lib/dinosaurs";
import { formatDate, formatNumber, href, isLocale, languageAlternates, type Locale } from "@/lib/i18n";
import { AUTHOR } from "@/lib/author";

/** Page-specific prose, kept here rather than in the shared dictionary. */
const COPY = {
  th: {
    title: "เกี่ยวกับเว็บไซต์นี้",
    creatorTitle: "ผู้จัดทำ",
    creatorBody:
      "เว็บไซต์นี้จัดทำโดย Jedsada Saengow โดยมี AI (Claude) ช่วยเขียนโค้ด เขียนบทความและคำแปลภาษาอังกฤษ และตรวจภาพที่สร้างด้วย AI ผู้จัดทำเป็นผู้ตรวจและรับผิดชอบเนื้อหาทั้งหมด หากพบข้อมูลที่ไม่ถูกต้อง แจ้งได้ผ่านเว็บไซต์ของผู้จัดทำ",
    creatorLink: "เว็บไซต์ของผู้จัดทำ",
    description: "ที่มาของข้อมูล วิธีการสร้างเว็บไซต์ และสัญญาอนุญาตของข้อมูลและภาพประกอบ",
    sourcesTitle: "ที่มาของข้อมูล",
    sourcesLead:
      "ข้อมูลทางวิทยาศาสตร์ทั้งหมด (การจัดหมวดหมู่ ช่วงเวลาที่มีชีวิตอยู่ ประเทศที่พบซากดึกดำบรรพ์ ผู้ตั้งชื่อ) รวบรวมโดยอัตโนมัติจากฐานข้อมูลสาธารณะ 3 แห่ง ส่วนเนื้อหาที่เป็นข้อความ (ความหมายของชื่อ คำอธิบาย เกร็ดความรู้ และบทความ) เขียนขึ้นเองทั้งหมด ไม่ได้แปลหรือคัดลอกจากวิกิพีเดีย",
    pbdb: "ข้อมูลการจัดหมวดหมู่ ช่วงอายุ และตำแหน่งที่พบซากดึกดำบรรพ์",
    wikidata: "ใช้จับคู่ชื่อไดโนเสาร์กับรูปภาพประกอบ",
    commons: "แหล่งที่มาของภาพประกอบที่ไม่ใช่ภาพ AI แต่ละภาพแสดงชื่อผู้สร้างและสัญญาอนุญาตของตัวเองกำกับไว้ใต้ภาพ",
    license: "สัญญาอนุญาต",
    aiTitle: "ภาพที่สร้างด้วย AI",
    aiBody:
      "ไดโนเสาร์ยอดฮิตและไดโนเสาร์ไทยมีภาพที่สร้างด้วย AI ประกอบด้วย ทุกภาพมีป้าย \"ภาพจาก AI\" บอกชื่อ model, prompt ที่ใช้สร้าง แหล่งข้อมูลที่ใช้เขียน prompt และคะแนนว่าภาพทำได้ตรงกับ prompt กี่เปอร์เซ็นต์ คะแนนนี้ไม่ใช่การรับรองความถูกต้องทางวิทยาศาสตร์ ภาพ AI จะใช้เป็นภาพหลักก็ต่อเมื่อได้คะแนนอย่างน้อย 75%",
    howTitle: "วิธีการสร้างเว็บไซต์นี้",
    how: (date: string, total: string, withImage: string, thailand: string) =>
      `ข้อมูลไดโนเสาร์ดึงมาจาก Paleobiology Database และจับคู่กับรูปภาพจาก Wikidata/Wikimedia Commons ด้วยสคริปต์อัตโนมัติ ภาพทั้งหมดถูกดาวน์โหลดและแปลงเป็นไฟล์ในเว็บไซต์นี้ล่วงหน้า (ไม่ได้เรียกใช้ภาพจาก Wikimedia โดยตรงขณะเปิดเว็บ) เว็บไซต์นี้อัปเดตข้อมูลล่าสุดเมื่อ ${date} ปัจจุบันมีข้อมูลไดโนเสาร์ทั้งหมด ${total} สายพันธุ์ มีภาพประกอบ ${withImage} สายพันธุ์ และพบในประเทศไทย ${thailand} สายพันธุ์`,
  },
  en: {
    title: "About this site",
    creatorTitle: "Creator",
    creatorBody:
      "This site is made by Jedsada Saengow, with help from AI (Claude) for writing code, articles and English translations, and for checking the AI-generated images. The creator reviews and is responsible for all content. If you spot a mistake, please get in touch through the creator's website.",
    creatorLink: "Creator's website",
    description: "Where the data comes from, how the site is built, and the licenses for data and images.",
    sourcesTitle: "Data sources",
    sourcesLead:
      "All scientific data (classification, age range, countries with fossils, naming author) is collected automatically from three public databases. The written content (name meanings, descriptions, fun facts and articles) is written for this site, not translated or copied from Wikipedia.",
    pbdb: "Classification, age ranges and fossil localities",
    wikidata: "Used to match each dinosaur with an illustration",
    commons: "Source of all non-AI illustrations. Each image shows its own author and license below it.",
    license: "License",
    aiTitle: "AI-generated images",
    aiBody:
      "The most popular dinosaurs and the Thai dinosaurs also have AI-generated images. Every one is labeled \"AI image\" and lists the model, the exact prompt, the sources used to write the prompt, and a score for how much of the prompt the image gets right. The score is not a scientific endorsement. An AI image only becomes the main image when it scores at least 75%.",
    howTitle: "How this site is built",
    how: (date: string, total: string, withImage: string, thailand: string) =>
      `Dinosaur data is pulled from the Paleobiology Database and matched with images from Wikidata and Wikimedia Commons by automated scripts. All images are downloaded and converted ahead of time, so the site never hotlinks Wikimedia. The data was last updated on ${date}. The site currently covers ${total} dinosaur genera, ${withImage} with illustrations, including ${thailand} found in Thailand.`,
  },
} satisfies Record<Locale, unknown>;

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const c = COPY[lang];
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: href(lang, "/about"), languages: languageAlternates("/about") },
    openGraph: { title: c.title, description: c.description },
  };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const c = COPY[lang];
  const meta = getMeta();
  const linkClass = "underline hover:text-emerald-700";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">{c.title}</h1>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-stone-900">{c.sourcesTitle}</h2>
        <p className="mt-2 leading-relaxed text-stone-700">{c.sourcesLead}</p>

        <ul className="mt-4 space-y-3">
          <li className="rounded-xl border border-stone-200 bg-stone-100 p-4">
            <p className="font-semibold text-stone-900">{meta.sources.pbdb.name}</p>
            <p className="text-sm text-stone-600">
              {c.pbdb} ·{" "}
              <a href={meta.sources.pbdb.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {meta.sources.pbdb.url}
              </a>{" "}
              · {c.license} {meta.sources.pbdb.license}
            </p>
          </li>
          <li className="rounded-xl border border-stone-200 bg-stone-100 p-4">
            <p className="font-semibold text-stone-900">{meta.sources.wikidata.name}</p>
            <p className="text-sm text-stone-600">
              {c.wikidata} ·{" "}
              <a href={meta.sources.wikidata.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {meta.sources.wikidata.url}
              </a>{" "}
              · {c.license} {meta.sources.wikidata.license}
            </p>
          </li>
          <li className="rounded-xl border border-stone-200 bg-stone-100 p-4">
            <p className="font-semibold text-stone-900">{meta.sources.wikimediaCommons.name}</p>
            <p className="text-sm text-stone-600">
              {c.commons} ·{" "}
              <a href={meta.sources.wikimediaCommons.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {meta.sources.wikimediaCommons.url}
              </a>
            </p>
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-stone-900">{c.creatorTitle}</h2>
        <p className="mt-2 leading-relaxed text-stone-700">{c.creatorBody}</p>
        <a
          href={AUTHOR.url}
          target="_blank"
          rel="noopener author"
          className="mt-3 inline-flex min-h-11 items-center gap-1 rounded-full border border-stone-300 px-4 text-sm font-medium text-stone-800 transition-colors hover:border-emerald-600 hover:text-emerald-700"
        >
          {c.creatorLink}: {AUTHOR.name} ↗
        </a>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-stone-900">{c.aiTitle}</h2>
        <p className="mt-2 leading-relaxed text-stone-700">{c.aiBody}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-stone-900">{c.howTitle}</h2>
        <p className="mt-2 leading-relaxed text-stone-700">
          {c.how(
            formatDate(lang, meta.generatedAt, { month: "long" }),
            formatNumber(lang, meta.dinosaurCount),
            formatNumber(lang, meta.withImageCount),
            formatNumber(lang, meta.thailandCount),
          )}
        </p>
      </section>
    </div>
  );
}
