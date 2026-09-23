import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getDinosaurBySlug, countryNameTh } from "@/lib/dinosaurs";
import { DIET_LABELS_TH, CLADE_LABELS_TH } from "@/lib/labels";
import { DinosaurImage, ImageAttribution } from "@/components/DinosaurImage";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/dinosaurs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const dinosaur = getDinosaurBySlug(slug);
  if (!dinosaur) return {};

  const nameTh = dinosaur.content?.nameTh ?? dinosaur.name;
  const description =
    dinosaur.content?.descriptionTh ??
    `ข้อมูล ${dinosaur.name} ไดโนเสาร์กลุ่ม ${CLADE_LABELS_TH[dinosaur.clade]} ที่มีชีวิตอยู่เมื่อ ${dinosaur.ageRangeMa[1]}-${dinosaur.ageRangeMa[0]} ล้านปีก่อน`;
  const image = dinosaur.images[0]?.localLarge ?? dinosaur.images[0]?.localSmall;

  return {
    title: `${nameTh} (${dinosaur.name})`,
    description,
    alternates: { canonical: `/dinosaurs/${dinosaur.slug}` },
    openGraph: {
      title: `${nameTh} (${dinosaur.name})`,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function DinosaurDetailPage({ params }: PageProps<"/dinosaurs/[slug]">) {
  const { slug } = await params;
  const dinosaur = getDinosaurBySlug(slug);
  if (!dinosaur) notFound();

  const { content } = dinosaur;
  const nameTh = content?.nameTh ?? dinosaur.name;
  const image = dinosaur.images[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Thing",
    name: dinosaur.name,
    alternateName: nameTh,
    description: content?.descriptionTh,
    additionalType: "https://en.wikipedia.org/wiki/Dinosaur",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-sm text-stone-500">
        <Link href="/dinosaurs" className="hover:text-emerald-700">
          ไดโนเสาร์ทั้งหมด
        </Link>
        {" / "}
        {nameTh}
      </nav>

      {/* Simple layer */}
      <section className="mt-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-stone-100">
          <DinosaurImage image={image} name={nameTh} size="large" priority />
        </div>
        {image && (
          <div className="mt-2">
            <ImageAttribution image={image} />
          </div>
        )}

        <h1 className="mt-4 text-3xl font-bold text-stone-900">{nameTh}</h1>
        <p className="text-lg italic text-stone-500">{dinosaur.name}</p>
        {content?.nameMeaningTh && <p className="mt-2 text-stone-700">ความหมายของชื่อ: {content.nameMeaningTh}</p>}

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            {DIET_LABELS_TH[dinosaur.diet]}
          </span>
          {dinosaur.countries.includes("TH") && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
              พบในประเทศไทย
            </span>
          )}
        </div>

        {content?.sizeComparisonTh && (
          <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-emerald-900">📏 {content.sizeComparisonTh}</p>
        )}

        {content?.descriptionTh && <p className="mt-4 leading-relaxed text-stone-800">{content.descriptionTh}</p>}

        {content?.funFactsTh && content.funFactsTh.length > 0 && (
          <div className="mt-4">
            <h2 className="font-semibold text-stone-900">เกร็ดความรู้</h2>
            <ul className="mt-2 space-y-2">
              {content.funFactsTh.map((fact, i) => (
                <li key={i} className="flex gap-2 rounded-xl bg-stone-100 p-3 shadow-sm">
                  <span aria-hidden="true">✨</span>
                  <span className="text-stone-800">{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!content && (
          <p className="mt-4 rounded-xl bg-stone-100 p-4 text-sm text-stone-600">
            ยังไม่มีเนื้อหาภาษาไทยสำหรับไดโนเสาร์ตัวนี้ แต่ข้อมูลทางวิทยาศาสตร์ด้านล่างมีครบถ้วน
          </p>
        )}
      </section>

      {/* Deep layer */}
      <section className="mt-10 border-t border-stone-200 pt-6">
        <h2 className="text-xl font-bold text-stone-900">ข้อมูลเชิงลึก</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-stone-500">การจัดหมวดหมู่</dt>
            <dd className="text-stone-900">{CLADE_LABELS_TH[dinosaur.clade]}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">วงศ์ (Family)</dt>
            <dd className="text-stone-900">{dinosaur.family ?? "ไม่ทราบ"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">ช่วงเวลาที่มีชีวิตอยู่</dt>
            <dd className="text-stone-900">
              {dinosaur.ageRangeMa[1].toLocaleString("th-TH")}–{dinosaur.ageRangeMa[0].toLocaleString("th-TH")} ล้านปีก่อน
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">ยุคทางธรณีวิทยา</dt>
            <dd className="text-stone-900">
              {dinosaur.earlyInterval ?? "ไม่ทราบ"}
              {dinosaur.lateInterval && dinosaur.lateInterval !== dinosaur.earlyInterval ? ` – ${dinosaur.lateInterval}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">ผู้ตั้งชื่อทางวิทยาศาสตร์</dt>
            <dd className="text-stone-900">
              {dinosaur.namingAuthor}, {dinosaur.namingYear}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">จำนวนซากดึกดำบรรพ์ที่พบ</dt>
            <dd className="text-stone-900">{dinosaur.occurrenceCount.toLocaleString("th-TH")} แหล่ง</dd>
          </div>
        </dl>

        {dinosaur.countries.length > 0 && (
          <div className="mt-4">
            <dt className="text-sm font-medium text-stone-500">ประเทศที่พบซากดึกดำบรรพ์</dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {dinosaur.countries.map((cc) => (
                <span key={cc} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-700">
                  {countryNameTh(cc)}
                </span>
              ))}
            </dd>
          </div>
        )}

        <p className="mt-6 text-sm text-stone-500">
          ข้อมูลอ้างอิงจาก{" "}
          <a
            href={`https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=${dinosaur.pbdbTaxonId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-emerald-700"
          >
            Paleobiology Database
          </a>
          {dinosaur.wikidataId && (
            <>
              {" "}
              และ{" "}
              <a
                href={`https://www.wikidata.org/wiki/${dinosaur.wikidataId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-emerald-700"
              >
                Wikidata
              </a>
            </>
          )}
        </p>
      </section>
    </div>
  );
}
