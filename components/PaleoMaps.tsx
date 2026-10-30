import paleoMapsData from "@/data/paleo-maps.json";
import { getDictionary } from "@/lib/dictionaries";
import { formatNumber, type Locale } from "@/lib/i18n";

/**
 * Reconstructed coastlines from scripts/build-paleo-maps.ts, already projected to SVG paths.
 * JSON infers `thailand` as number[], so the tuple cast goes through unknown (as in lib/dinosaurs).
 */
const PALEO = paleoMapsData as unknown as {
  width: number;
  height: number;
  sphere: string;
  maps: { ma: number; d: string; thailand: [number, number] | null }[];
};

/** Numbered like an article's sources; [n] markers below point into this list. */
const SOURCES = [
  {
    label: "Müller, R. D. et al. (2019). A global plate model including lithospheric deformation along major rifts and orogens since the Triassic. Tectonics 38, 1884–1907.",
    url: "https://doi.org/10.1029/2018TC005462",
  },
  { label: "GPlates Web Service (EarthByte, University of Sydney)", url: "https://gws.gplates.org/" },
  { label: "Müller et al. (2019) plate model data on Zenodo (CC BY 4.0)", url: "https://zenodo.org/records/10525287" },
  { label: "Wikipedia: Pangaea", url: "https://en.wikipedia.org/wiki/Pangaea" },
  { label: "Wikipedia: Atlantic Ocean", url: "https://en.wikipedia.org/wiki/Atlantic_Ocean" },
  {
    label: "Merdith, A. S. et al. (2021). Extending full-plate tectonic models into deep time. Earth-Science Reviews 214, 103477.",
    url: "https://doi.org/10.1016/j.earscirev.2020.103477",
  },
  {
    label: "Seton, M. et al. (2012). Global continental and ocean basin reconstructions since 200 Ma. Earth-Science Reviews 113, 212–270.",
    url: "https://doi.org/10.1016/j.earscirev.2012.03.002",
  },
  { label: "Scotese, C. R. (2016). PALEOMAP PaleoAtlas for GPlates", url: "https://www.earthbyte.org/paleomap-paleoatlas-for-gplates/" },
];
const CAPTION_CITES: Record<number, number[]> = { 220: [4, 1], 170: [4, 1], 100: [5, 1], 66: [1] };
const MAP_CITES = [1, 2, 3];
/**
 * The four plate models whose reconstructed position for Khon Kaen was compared through the GPlates
 * service (MULLER2019, MERDITH2021, SETON2012, PALEOMAP); at 170 Ma they put it between ~17° and ~35° N.
 */
const THAILAND_CITES = [1, 6, 7, 8];

function Cite({ nums, label }: { nums: number[]; label: (n: number) => string }) {
  return (
    <sup className="ml-0.5 whitespace-nowrap text-xs">
      {nums.map((n) => (
        <a key={n} href={`#paleo-source-${n}`} aria-label={label(n)} className="text-emerald-700 hover:underline">
          [{n}]
        </a>
      ))}
    </sup>
  );
}

/** Where the continents were at four moments in the age of dinosaurs, with Thailand marked. */
export function PaleoMaps({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const t = dict.timeline;
  const citeLabel = dict.articles.citeLabel;
  return (
    <section id="continents" className="mt-10 scroll-mt-20 border-t border-stone-200 pt-6">
      <h2 className="text-xl font-bold text-stone-900">{t.paleoTitle}</h2>
      <p className="mt-1 max-w-3xl text-stone-600">{t.paleoLead}</p>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {PALEO.maps.map((m) => (
          <li key={m.ma}>
            <figure className="rounded-2xl border border-stone-200 bg-stone-100 p-3">
              <svg viewBox={`0 0 ${PALEO.width} ${PALEO.height}`} className="h-auto w-full" role="img" aria-label={t.paleoAlt(formatNumber(lang, m.ma))}>
                <path d={PALEO.sphere} className="fill-stone-200" />
                <path d={m.d} className="fill-emerald-600" />
                {m.thailand && (
                  <g>
                    <circle cx={m.thailand[0]} cy={m.thailand[1]} r={7} className="fill-amber-700 stroke-stone-50" strokeWidth={2.5} />
                    {/* Light outline under the label so it stays readable on top of land. */}
                    <text
                      x={m.thailand[0] + 11}
                      y={m.thailand[1] + 5}
                      fontSize={16}
                      fontWeight={700}
                      className="fill-stone-900 stroke-stone-50"
                      strokeWidth={4}
                      paintOrder="stroke"
                      strokeLinejoin="round"
                    >
                      {t.paleoThailand}
                    </text>
                  </g>
                )}
              </svg>
              <figcaption className="mt-2 px-1">
                <p className="font-semibold text-stone-900">{t.paleoWhen(formatNumber(lang, m.ma))}</p>
                <p className="text-sm text-stone-600">
                  {t.paleoCaptions[m.ma as 220 | 170 | 100 | 66]}
                  <Cite nums={CAPTION_CITES[m.ma] ?? []} label={citeLabel} />
                </p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <aside className="mt-4 max-w-3xl rounded-2xl border border-amber-700/40 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-700">{t.paleoThailandNoteTitle}</h3>
        <p className="mt-1 text-sm leading-relaxed text-stone-800">
          {t.paleoThailandNote}
          <Cite nums={THAILAND_CITES} label={citeLabel} />
        </p>
      </aside>
      <p className="mt-3 max-w-3xl text-xs leading-relaxed text-stone-500">
        {t.paleoNote}
        <Cite nums={MAP_CITES} label={citeLabel} />
      </p>

      <div className="mt-3 max-w-3xl text-xs text-stone-600">
        <h3 className="font-semibold text-stone-700">{dict.articles.sources}</h3>
        <ol className="mt-1 space-y-1">
          {SOURCES.map((s, i) => (
            <li key={s.url} id={`paleo-source-${i + 1}`} className="flex scroll-mt-20 gap-2">
              <span className="shrink-0 tabular-nums text-stone-500">[{i + 1}]</span>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline hover:text-emerald-800">
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
