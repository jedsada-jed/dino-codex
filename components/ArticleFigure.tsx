import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

/**
 * Hand-drawn explanatory diagrams for /articles, one per article. Drawn as inline SVG (not
 * AI images or photos) so every label is accurate, translatable and follows the light/dark
 * theme through the --fig-* and palette tokens in globals.css.
 *
 * `compact` drops the text labels for the small thumbnail on the article list.
 */
interface FigureProps {
  lang: Locale;
  compact: boolean;
}

interface FigureDef {
  /** Index of the section the figure follows; -1 places it right after the summary. */
  afterSection: number;
  alt: Record<Locale, string>;
  caption: Record<Locale, string>;
  Draw: (props: FigureProps) => ReactNode;
}

const INK = "var(--stone-900)";
const MUTED = "var(--stone-600)";
const ACCENT = "var(--emerald-700)";
const WARM = "var(--amber-700)";

/** A three-toed (theropod) footprint, about 40 × 50 units, centered on (0, 0). */
function Track({ x, y, scale = 1, rotate = 0 }: { x: number; y: number; scale?: number; rotate?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}
      d="M0 20 C-9 20 -11 9 -7 2 L-20 -20 C-23 -26 -16 -29 -13 -23 L-3 -6 L-3 -28 C-3 -35 4 -35 4 -28 L4 -6 L14 -23 C17 -29 24 -26 21 -20 L7 2 C11 9 9 20 0 20 Z"
      fill="var(--fig-mud-dark)"
    />
  );
}

function Arrow({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <g stroke={MUTED} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M${x1} ${y} H${x2}`} />
      <path d={`M${x2 - 8} ${y - 7} L${x2} ${y} L${x2 - 8} ${y + 7}`} />
    </g>
  );
}

/** A cartoon fossil bone, 86 units long, centered on (x, y). */
function Bone({ x, y, rotate = -8 }: { x: number; y: number; rotate?: number }) {
  return (
    <g transform={`rotate(${rotate} ${x} ${y})`} fill="var(--fig-bone)">
      <rect x={x - 35} y={y - 6} width={70} height={12} rx={6} />
      <circle cx={x - 35} cy={y - 7} r={8} />
      <circle cx={x - 35} cy={y + 7} r={8} />
      <circle cx={x + 35} cy={y - 7} r={8} />
      <circle cx={x + 35} cy={y + 7} r={8} />
    </g>
  );
}

/* ---------- 1. Footprints: mud → hardened → buried → exposed ---------- */

const PANEL_W = 145;
/** Mud surface with a footprint-shaped dip, closed along the panel's rounded bottom. */
const MUD = "M0 120 H45 C52 120 55 138 72 138 C89 138 92 120 99 120 H145 V188 Q145 200 133 200 H12 Q0 200 0 188 Z";
const MUD_SURFACE = "M0 120 H45 C52 120 55 138 72 138 C89 138 92 120 99 120 H145";

function FootprintsFigure({ lang, compact }: FigureProps) {
  const steps =
    lang === "th"
      ? ["เหยียบโคลนชื้น", "แดดเผาจนผิวแข็ง", "ตะกอนทับถมเป็นหิน", "กัดเซาะจนรอยโผล่"]
      : ["Step in damp mud", "Sun firms it up", "Buried, turns to rock", "Erosion reveals it"];
  const panels: ReactNode[] = [
    <>
      <path d={MUD} fill="var(--fig-mud)" />
      <path d="M72 48 V104" stroke={WARM} strokeWidth={4} strokeLinecap="round" />
      <path d="M62 94 L72 106 L82 94" stroke={WARM} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    <>
      <path d={MUD} fill="var(--fig-mud)" />
      <path d={MUD_SURFACE} stroke="var(--fig-mud-dark)" strokeWidth={6} fill="none" />
      <path d="M30 150 l6 14 l-4 10 M112 146 l-5 12 l5 12" stroke="var(--fig-mud-dark)" strokeWidth={2} fill="none" />
      <circle cx={110} cy={58} r={14} fill={WARM} />
      <g stroke={WARM} strokeWidth={3} strokeLinecap="round">
        <path d="M110 34 v-6 M110 82 v6 M86 58 h-6 M134 58 h6 M93 41 l-4 -4 M127 41 l4 -4 M93 75 l-4 4 M127 75 l4 4" />
      </g>
    </>,
    <>
      <path d="M0 52 Q0 40 12 40 H133 Q145 40 145 52 V70 H0 Z" fill="var(--fig-rock)" />
      <rect x={0} y={70} width={PANEL_W} height={26} fill="var(--fig-mud-dark)" />
      <path d="M0 96 H145 V120 H99 C92 120 89 138 72 138 C55 138 52 120 45 120 H0 Z" fill="var(--fig-sand)" />
      <path d={MUD} fill="var(--fig-mud)" />
    </>,
    <>
      <path d="M0 80 L40 70 H145 V188 Q145 200 133 200 H12 Q0 200 0 188 Z" fill="var(--fig-rock)" />
      <Track x={40} y={175} scale={0.62} rotate={-8} />
      <Track x={78} y={135} scale={0.62} rotate={6} />
      <Track x={108} y={98} scale={0.55} rotate={-4} />
    </>,
  ];

  return (
    <svg viewBox={`0 0 640 ${compact ? 210 : 250}`} className="h-auto w-full">
      {panels.map((panel, i) => (
        <g key={i} transform={`translate(${10 + i * 158} 0)`}>
          <rect x={0} y={20} width={PANEL_W} height={180} rx={12} fill="var(--fig-sky)" />
          {panel}
          {!compact && (
            <g>
              <circle cx={20} cy={38} r={11} fill={ACCENT} />
              <text x={20} y={42.5} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--stone-50)">
                {i + 1}
              </text>
              <text x={PANEL_W / 2} y={230} textAnchor="middle" fontSize={13.5} fontWeight={600} fill={INK}>
                {steps[i]}
              </text>
              {i === 3 && (
                <text x={PANEL_W - 10} y={42} textAnchor="end" fontSize={11} fill={MUTED}>
                  {lang === "th" ? "มองจากด้านบน" : "seen from above"}
                </text>
              )}
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ---------- 2. Fossilization: porous bone → permineralization → replacement ---------- */

/** Pore positions inside a 70-unit radius, fixed so the drawing is the same every render. */
const PORES: [number, number, number][] = [
  [-38, -30, 9], [-8, -46, 8], [24, -36, 10], [48, -8, 8], [-52, 4, 7], [-22, -8, 11], [10, -6, 8],
  [36, 22, 10], [-36, 34, 9], [-4, 26, 9], [20, 50, 7], [-18, 54, 6], [52, -34, 5], [-54, -20, 5],
];

function BoneSection({ cx, bone, pore }: { cx: number; bone: string; pore: string }) {
  return (
    <g transform={`translate(${cx} 112)`}>
      <circle r={78} fill={bone} stroke="var(--stone-500)" strokeWidth={2} />
      {PORES.map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.8} fill={pore} />
      ))}
    </g>
  );
}

function FossilizationFigure({ lang, compact }: FigureProps) {
  const labels =
    lang === "th"
      ? [
          ["กระดูกมีรูพรุน", ""],
          ["แร่ในน้ำใต้ดินซึมเข้าเติมรูพรุน", "permineralization"],
          ["แร่ค่อยๆ แทนที่เนื้อกระดูก", "replacement"],
        ]
      : [
          ["Bone is full of pores", ""],
          ["Minerals fill the pores", "permineralization"],
          ["Minerals replace the bone", "replacement"],
        ];
  const xs = [105, 320, 535];
  return (
    <svg viewBox={`0 0 640 ${compact ? 200 : 260}`} className="h-auto w-full">
      <BoneSection cx={xs[0]} bone="var(--fig-bone)" pore="var(--fig-sky)" />
      <BoneSection cx={xs[1]} bone="var(--fig-bone)" pore="var(--fig-mineral)" />
      <BoneSection cx={xs[2]} bone="var(--fig-rock)" pore="var(--fig-mineral)" />
      <Arrow x1={192} x2={232} y={112} />
      <Arrow x1={407} x2={447} y={112} />
      {!compact &&
        labels.map(([main, term], i) => (
          <g key={i}>
            <text x={xs[i]} y={220} textAnchor="middle" fontSize={14} fontWeight={600} fill={INK}>
              {main}
            </text>
            {term && (
              <text x={xs[i]} y={240} textAnchor="middle" fontSize={12.5} fontStyle="italic" fill={MUTED}>
                {term}
              </text>
            )}
          </g>
        ))}
    </svg>
  );
}

/* ---------- 3. Dating: superposition plus two dated ash beds ---------- */

function DatingFigure({ lang, compact }: FigureProps) {
  const th = lang === "th";
  return (
    <svg viewBox={compact ? "-90 20 640 260" : "0 0 640 300"} className="h-auto w-full">
      <rect x={150} y={196} width={210} height={74} rx={10} fill="var(--fig-rock)" />
      <rect x={150} y={30} width={210} height={60} rx={10} fill="var(--fig-sand)" />
      <rect x={150} y={98} width={210} height={90} fill="var(--fig-mud)" />
      <rect x={150} y={80} width={210} height={18} fill="var(--fig-ash)" />
      <rect x={150} y={188} width={210} height={18} fill="var(--fig-ash)" />
      <Bone x={255} y={143} />

      <g stroke={MUTED} strokeWidth={3} strokeLinecap="round" fill="none">
        <path d="M110 46 V254" />
        <path d="M102 244 L110 256 L118 244" strokeLinejoin="round" />
      </g>

      {!compact && (
        <g fontSize={13.5} fill={INK}>
          <text x={110} y={26} textAnchor="middle" fill={MUTED}>
            {th ? "ใหม่กว่า" : "younger"}
          </text>
          <text x={110} y={282} textAnchor="middle" fill={MUTED}>
            {th ? "เก่ากว่า" : "older"}
          </text>

          <g stroke={ACCENT} strokeWidth={2.5} fill="none">
            <path d="M372 89 H384 V197 H372" />
          </g>
          <text x={396} y={93}>
            <tspan fontWeight={700}>{th ? "75.0 ล้านปี" : "75.0 million years"}</tspan>
            <tspan fill={MUTED}>{th ? " · เถ้าภูเขาไฟ" : " · volcanic ash"}</tspan>
          </text>
          <text x={396} y={201}>
            <tspan fontWeight={700}>{th ? "76.2 ล้านปี" : "76.2 million years"}</tspan>
            <tspan fill={MUTED}>{th ? " · เถ้าภูเขาไฟ" : " · volcanic ash"}</tspan>
          </text>
          <text x={396} y={140} fontWeight={700} fill={ACCENT}>
            {th ? "ฟอสซิลมีอายุ" : "The fossil is"}
          </text>
          <text x={396} y={160} fontWeight={700} fill={ACCENT}>
            {th ? "75.0–76.2 ล้านปี" : "75.0–76.2 million years old"}
          </text>
        </g>
      )}
    </svg>
  );
}

/* ---------- 4. History: from "giant's bone" to Thailand's first find ---------- */

function HistoryFigure({ lang, compact }: FigureProps) {
  const events: { year: string; sub?: string; lines: string[]; thai?: boolean }[] =
    lang === "th"
      ? [
          { year: "1676", lines: ["พล็อตบรรยาย", "กระดูก \"มนุษย์ยักษ์\""] },
          { year: "1824", lines: ["เมกาโลซอรัส", "ไดโนเสาร์ชื่อแรก"] },
          { year: "1825", lines: ["อิกัวโนดอน", "ตั้งชื่อจากฟัน"] },
          { year: "1842", lines: ["โอเวนตั้งคำว่า", "Dinosauria"] },
          { year: "1976", sub: "พ.ศ. 2519", lines: ["ฟอสซิลชิ้นแรก", "ของไทย ที่ภูเวียง"], thai: true },
        ]
      : [
          { year: "1676", lines: ["Plot describes a", "\"giant's\" bone"] },
          { year: "1824", lines: ["Megalosaurus,", "the first name"] },
          { year: "1825", lines: ["Iguanodon,", "named from teeth"] },
          { year: "1842", lines: ["Owen coins", "Dinosauria"] },
          { year: "1976", lines: ["Thailand's first", "find, Phu Wiang"], thai: true },
        ];
  const x = (i: number) => 68 + i * 126;
  return (
    <svg viewBox={`0 0 640 ${compact ? 150 : 210}`} className="h-auto w-full">
      <path d={`M${x(0)} 90 H${x(3)}`} stroke={ACCENT} strokeWidth={4} strokeLinecap="round" />
      <path d={`M${x(3)} 90 H${x(4)}`} stroke={ACCENT} strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" />
      {events.map((e, i) => (
        <g key={e.year}>
          <circle cx={x(i)} cy={90} r={e.thai ? 13 : 10} fill={e.thai ? WARM : ACCENT} stroke="var(--stone-50)" strokeWidth={4} />
          <text x={x(i)} y={58} textAnchor="middle" fontSize={22} fontWeight={800} fill={e.thai ? WARM : INK}>
            {e.year}
          </text>
          {!compact && (
            <g fontSize={13} textAnchor="middle">
              {e.sub && (
                <text x={x(i)} y={30} fill={MUTED}>
                  {e.sub}
                </text>
              )}
              {e.lines.map((line, j) => (
                <text key={j} x={x(i)} y={132 + j * 19} fill={j === 0 ? INK : MUTED} fontWeight={j === 0 ? 600 : 400}>
                  {line}
                </text>
              ))}
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ---------- 5. Naming: the parts of Kinnareemimus khonkaenensis ---------- */

function NamingFigure({ lang, compact }: FigureProps) {
  const th = lang === "th";
  const parts = [
    { text: "Kinnaree", x: 20, w: 150, meaning: th ? ["กินรี", "สัตว์ในวรรณคดีไทย"] : ["kinnaree, a bird-woman", "of Thai literature"], root: true },
    { text: "mimus", x: 174, w: 110, meaning: th ? ["เลียนแบบ"] : ["mimic"] },
    { text: "khonkaen", x: 314, w: 160, meaning: th ? ["ขอนแก่น", "จังหวัดที่พบ"] : ["Khon Kaen,", "where it was found"], root: true },
    { text: "ensis", x: 478, w: 142, meaning: th ? ["มาจาก / แห่ง"] : ["from"] },
  ];
  const top = compact ? 30 : 80;
  return (
    <svg viewBox={`0 0 640 ${compact ? 110 : 215}`} className="h-auto w-full">
      {!compact && (
        <g fontSize={14} fontWeight={700} textAnchor="middle" fill={INK}>
          <path d="M22 66 V56 H282 V66 M316 66 V56 H618 V66" stroke={MUTED} strokeWidth={2.5} fill="none" />
          <text x={152} y={44}>
            {th ? "ชื่อสกุล (genus)" : "genus name"}
          </text>
          <text x={467} y={44}>
            {th ? "ชื่อชนิด (species)" : "species name"}
          </text>
        </g>
      )}
      {parts.map((p) => (
        <g key={p.text}>
          <rect
            x={p.x}
            y={top}
            width={p.w}
            height={50}
            rx={10}
            fill={p.root ? "var(--emerald-50)" : "var(--amber-50)"}
            stroke={p.root ? ACCENT : WARM}
            strokeWidth={2}
          />
          <text x={p.x + p.w / 2} y={top + 33} textAnchor="middle" fontSize={24} fontStyle="italic" fontWeight={600} fill={INK}>
            {p.text}
          </text>
          {!compact &&
            p.meaning.map((line, j) => (
              <text
                key={j}
                x={p.x + p.w / 2}
                y={top + 82 + j * 19}
                textAnchor="middle"
                fontSize={j === 0 ? 14 : 12.5}
                fontWeight={j === 0 ? 600 : 400}
                fill={j === 0 ? INK : MUTED}
              >
                {line}
              </text>
            ))}
        </g>
      ))}
    </svg>
  );
}

/* ---------- 6. Thai dinosaurs: which formation each species came from ---------- */

const THAI_LAYERS = [
  {
    fill: "var(--fig-sand)",
    height: 92,
    th: {
      name: "หมวดหินโคกกรวด",
      age: "ราว 120–100 ล้านปี",
      dinos: ["สยามโมดอน · ราชสีมาซอรัส · สิรินธรนา · สยามแรปเตอร์", "ซิตตะโกซอรัส สัตยารักษ์กิ · นาคาไททัน"],
      where: "นครราชสีมา · ชัยภูมิ",
    },
    en: {
      name: "Khok Kruat Formation",
      age: "about 120–100 million years",
      dinos: ["Siamodon · Ratchasimasaurus · Sirindhorna · Siamraptor", "Psittacosaurus sattayaraki · Nagatitan"],
      where: "Nakhon Ratchasima · Chaiyaphum",
    },
    count: 6,
  },
  {
    fill: "var(--fig-mud)",
    height: 92,
    th: {
      name: "หมวดหินเสาขัว",
      age: "ราว 125 ล้านปี",
      dinos: ["ภูเวียงโกซอรัส · สยามโมไทรันนัส · สยามโมซอรัส", "กินรีมิมัส · ภูเวียงเวเนเตอร์ · วายุแรปเตอร์"],
      where: "ขอนแก่น · หนองบัวลำภู",
    },
    en: {
      name: "Sao Khua Formation",
      age: "about 125 million years",
      dinos: ["Phuwiangosaurus · Siamotyrannus · Siamosaurus", "Kinnareemimus · Phuwiangvenator · Vayuraptor"],
      where: "Khon Kaen · Nong Bua Lamphu",
    },
    count: 6,
  },
  {
    fill: "var(--fig-rock)",
    height: 72,
    th: { name: "หมวดหินภูกระดาน", age: "ราว 150 ล้านปี", dinos: ["มินิโมเคอร์เซอร์ · อุรคะซอรัส"], where: "กาฬสินธุ์" },
    en: { name: "Phu Kradung Formation", age: "about 150 million years", dinos: ["Minimocursor · Uragasaurus"], where: "Kalasin" },
    count: 2,
  },
  {
    fill: "var(--fig-mud-dark)",
    height: 72,
    th: { name: "หมวดหินน้ำพอง", age: "ยุคจูแรสซิกตอนต้น", dinos: ["อีสานโนซอรัส"], where: "ชัยภูมิ" },
    en: { name: "Nam Phong Formation", age: "Early Jurassic", dinos: ["Isanosaurus"], where: "Chaiyaphum" },
    count: 1,
  },
];

function ThaiDinosaursFigure({ lang, compact }: FigureProps) {
  const tops = THAI_LAYERS.map((_, i) => 10 + THAI_LAYERS.slice(0, i).reduce((sum, l) => sum + l.height, 0));
  const last = THAI_LAYERS.length - 1;
  const bottom = tops[last] + THAI_LAYERS[last].height;

  if (compact) {
    return (
      <svg viewBox={`-120 0 880 ${bottom + 10}`} className="h-auto w-full">
        {THAI_LAYERS.map((layer, i) => (
          <g key={i}>
            <rect x={40} y={tops[i]} width={560} height={layer.height} fill={layer.fill} />
            {Array.from({ length: layer.count }, (_, j) => (
              <circle key={j} cx={320 + (j - (layer.count - 1) / 2) * 56} cy={tops[i] + layer.height / 2} r={14} fill="var(--fig-bone)" />
            ))}
          </g>
        ))}
      </svg>
    );
  }

  return (
    <svg viewBox={`0 0 640 ${bottom + 10}`} className="h-auto w-full">
      {THAI_LAYERS.map((layer, i) => {
        const t = layer[lang];
        const y = tops[i];
        return (
          <g key={i}>
            <rect x={16} y={y} width={44} height={layer.height} fill={layer.fill} />
            {i > 0 && <path d={`M76 ${y} H624`} stroke="var(--stone-300)" strokeWidth={1.5} />}
            <text x={76} y={y + 24} fontSize={14.5} fill={INK}>
              <tspan fontWeight={700}>{t.name}</tspan>
              <tspan fill={MUTED} fontSize={13}>{`  ${t.age}`}</tspan>
            </text>
            {t.dinos.map((line, j) => (
              <text key={j} x={76} y={y + 44 + j * 19} fontSize={13.5} fill={INK}>
                {line}
              </text>
            ))}
            <text x={76} y={y + 44 + t.dinos.length * 19} fontSize={12.5} fill={MUTED}>
              {t.where}
            </text>
            <text x={624} y={y + 34} textAnchor="end" fontSize={28} fontWeight={800} fill={ACCENT}>
              {layer.count}
            </text>
            <text x={624} y={y + 52} textAnchor="end" fontSize={12.5} fill={MUTED}>
              {lang === "th" ? "ชนิด" : "species"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- 7. Birds are dinosaurs: a simplified family tree ---------- */

const TREE_LEAVES = [
  { x: 60, th: "ไทรเซราทอปส์", en: "Triceratops" },
  { x: 160, th: "สเตโกซอรัส", en: "Stegosaurus" },
  { x: 270, th: "แบรคิโอซอรัส", en: "Brachiosaurus" },
  { x: 380, th: "ไทแรนโนซอรัส", en: "Tyrannosaurus" },
  { x: 480, th: "เวโลซีแรปเตอร์", en: "Velociraptor" },
  { x: 580, th: "นก", en: "Birds" },
];

function BirdsFigure({ lang, compact }: FigureProps) {
  const th = lang === "th";
  const branches =
    "M60 70 V130 M160 70 V130 M60 130 H160 M110 130 V250 " +
    "M480 70 V110 M580 70 V110 M480 110 H580 M530 110 V160 " +
    "M380 70 V160 M380 160 H530 M455 160 V205 " +
    "M270 70 V205 M270 205 H455 M362.5 205 V250 " +
    "M110 250 H362.5 M236.25 250 V272";
  return (
    <svg viewBox={compact ? "0 50 640 235" : "0 0 640 300"} className="h-auto w-full">
      <path d={branches} stroke={MUTED} strokeWidth={3} strokeLinecap="round" fill="none" />
      <path
        d="M580 70 V110 H530 V160 H455 V205 H362.5 V250 H236.25 V272"
        stroke={WARM}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {TREE_LEAVES.map((leaf, i) => (
        <circle key={leaf.en} cx={leaf.x} cy={70} r={i === 5 ? 9 : 7} fill={i === 5 ? WARM : MUTED} />
      ))}
      <circle cx={455} cy={160} r={7} fill={ACCENT} stroke="var(--stone-100)" strokeWidth={3} />
      <circle cx={530} cy={110} r={7} fill={ACCENT} stroke="var(--stone-100)" strokeWidth={3} />

      {!compact && (
        <g fontSize={13.5}>
          {TREE_LEAVES.map((leaf, i) => (
            <text key={leaf.en} x={leaf.x} y={52} textAnchor="middle" fontWeight={i === 5 ? 800 : 600} fill={i === 5 ? WARM : INK}>
              {th ? leaf.th : leaf.en}
            </text>
          ))}
          <text x={580} y={30} textAnchor="middle" fontSize={12} fill={WARM}>
            {th ? "ยังมีชีวิตอยู่" : "still alive"}
          </text>
          <text x={464} y={185} fontSize={12.5} fill={ACCENT} fontWeight={600}>
            {th ? "กระดูก wishbone" : "wishbone"}
          </text>
          <text x={539} y={135} fontSize={12.5} fill={ACCENT} fontWeight={600}>
            {th ? "ขนแบบขนนก" : "vaned feathers"}
          </text>
          <text x={236.25} y={292} textAnchor="middle" fontSize={12.5} fill={MUTED}>
            {th ? "บรรพบุรุษร่วมของไดโนเสาร์ทั้งหมด" : "common ancestor of all dinosaurs"}
          </text>
        </g>
      )}
    </svg>
  );
}

/* ---------- 8. Extinction: the Cretaceous–Paleogene boundary clay ---------- */

function ExtinctionFigure({ lang, compact }: FigureProps) {
  const th = lang === "th";
  return (
    <svg viewBox={compact ? "-110 10 640 275" : "0 0 640 290"} className="h-auto w-full">
      <rect x={150} y={124} width={180} height={146} rx={10} fill="var(--fig-mud)" />
      <rect x={150} y={30} width={180} height={100} rx={10} fill="var(--fig-sand)" />
      <rect x={150} y={120} width={180} height={12} fill={WARM} />
      <Bone x={240} y={200} rotate={10} />

      <g stroke={WARM} strokeWidth={3} strokeLinecap="round" opacity={0.7}>
        <path d="M48 0 L84 30 M34 12 L76 40 M60 -4 L90 22" />
      </g>
      <circle cx={98} cy={44} r={13} fill="var(--fig-rock)" stroke={WARM} strokeWidth={2} />

      {!compact && (
        <g fontSize={13.5}>
          <text x={350} y={72} fontWeight={700} fill={INK}>
            {th ? "ยุคพาลีโอจีน" : "Paleogene"}
          </text>
          <text x={350} y={92} fontSize={12.5} fill={MUTED}>
            {th ? "ไม่พบไดโนเสาร์ที่ไม่ใช่นกอีกเลย" : "no more non-avian dinosaurs"}
          </text>

          <path d="M336 126 H344" stroke={WARM} strokeWidth={2.5} />
          <text x={350} y={131} fontWeight={700} fill={WARM}>
            {th ? "ชั้นดินเหนียวรอยต่อ · 66 ล้านปีก่อน" : "Boundary clay · 66 million years ago"}
          </text>
          <text x={350} y={151} fontSize={12.5} fill={MUTED}>
            {th ? "อิริเดียมสูง · ควอตซ์ที่ถูกแรงกระแทก · เม็ดแก้ว" : "iridium · shocked quartz · glass beads"}
          </text>

          <text x={350} y={200} fontWeight={700} fill={INK}>
            {th ? "ยุคครีเทเชียส" : "Cretaceous"}
          </text>
          <text x={350} y={220} fontSize={12.5} fill={MUTED}>
            {th ? "พบฟอสซิลไดโนเสาร์" : "dinosaur fossils"}
          </text>
        </g>
      )}
    </svg>
  );
}

/* ---------- 9. Extinction: what happened after the impact, minutes to 700,000 years ---------- */

/** The first `IMPACT_PHASE` stops are the disaster, drawn warm; the rest are the recovery. */
const IMPACT_PHASE = 5;

function ImpactTimelineFigure({ lang, compact }: FigureProps) {
  const stops: { when: string; lines: [string, string] }[] =
    lang === "th"
      ? [
          { when: "0 วินาที", lines: ["ดาวเคราะห์น้อย ~10 กม.", "พุ่งชนยูกาตัง"] },
          { when: "ไม่กี่นาที", lines: ["เกิดหลุมกว้าง", "ราว 200 กม."] },
          { when: "ไม่กี่ชั่วโมง", lines: ["สึนามิยักษ์", "เศษหินร้อนตกทั่วโลก"] },
          { when: "วัน–สัปดาห์", lines: ["เขม่าและฝุ่น", "ปกคลุมท้องฟ้า"] },
          { when: "เดือน–ปี", lines: ["มืดและหนาว", "ห่วงโซ่อาหารพัง"] },
          { when: "หลายพันปี", lines: ["เฟิร์นขึ้นเต็ม", "พื้นที่ที่ถูกทำลาย"] },
          { when: "1 แสนปี", lines: ["พืชและสัตว์เลี้ยง", "ลูกด้วยนมฟื้นตัว"] },
          { when: "7 แสนปี", lines: ["สัตว์เลี้ยงลูกด้วยนม", "หนักถึงราว 45 กก."] },
        ]
      : [
          { when: "0 seconds", lines: ["a ~10 km asteroid", "hits the Yucatán"] },
          { when: "Minutes", lines: ["a crater about", "200 km wide forms"] },
          { when: "Hours", lines: ["giant tsunamis,", "hot debris everywhere"] },
          { when: "Days–weeks", lines: ["soot and dust", "fill the sky"] },
          { when: "Months–years", lines: ["dark and cold,", "food chains collapse"] },
          { when: "Millennia", lines: ["ferns cover", "the burned land"] },
          { when: "100,000 yrs", lines: ["plants and mammals", "bounce back"] },
          { when: "700,000 yrs", lines: ["mammals reach", "about 45 kg"] },
        ];
  const x = (i: number) => 75 + i * 70;
  const lineY = compact ? 70 : 118;
  const last = stops.length - 1;
  return (
    <svg viewBox={`0 0 640 ${compact ? 140 : 230}`} className="h-auto w-full">
      <path d={`M${x(0)} ${lineY} H${x(IMPACT_PHASE - 1)}`} stroke={WARM} strokeWidth={4} strokeLinecap="round" />
      <path d={`M${x(IMPACT_PHASE - 1)} ${lineY} H${x(last)}`} stroke={ACCENT} strokeWidth={4} strokeLinecap="round" />
      {stops.map((s, i) => {
        const color = i < IMPACT_PHASE ? WARM : ACCENT;
        // Alternate labels above and below the line so neighbours have room.
        const above = i % 2 === 0;
        const whenY = above ? lineY - 68 : lineY + 44;
        return (
          <g key={s.when}>
            <circle cx={x(i)} cy={lineY} r={i === 0 ? 12 : 9} fill={color} stroke="var(--stone-50)" strokeWidth={4} />
            {!compact && (
              <g textAnchor="middle">
                <path d={`M${x(i)} ${above ? lineY - 14 : lineY + 14} V${above ? lineY - 22 : lineY + 22}`} stroke={MUTED} strokeWidth={1.5} />
                <text x={x(i)} y={whenY} fontSize={14} fontWeight={800} fill={color}>
                  {s.when}
                </text>
                {s.lines.map((line, j) => (
                  <text key={j} x={x(i)} y={whenY + 19 + j * 17} fontSize={12} fill={j === 0 ? INK : MUTED}>
                    {line}
                  </text>
                ))}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Most articles have one figure; a few have more, each placed after its own section. */
const FIGURES: Record<string, FigureDef[]> = {
  "dinosaur-footprints": [{
    afterSection: 0,
    alt: {
      th: "ภาพสี่ขั้นตอน: ไดโนเสาร์เหยียบโคลนชื้น แดดเผาผิวให้แข็ง ตะกอนทับถมจนกลายเป็นหิน และการกัดเซาะเผยให้เห็นรอยเท้า",
      en: "Four steps: a dinosaur steps in damp mud, the sun firms the surface, sediment buries it and turns to rock, and erosion exposes the trackway.",
    },
    caption: {
      th: "ภาพตัดขวางของชั้นดิน: รอยเท้าจะกลายเป็นฟอสซิลได้ ต้องผ่านทั้งสี่ขั้นตอนนี้ครบ",
      en: "Cross-section through the ground: a footprint has to go through all four steps to become a fossil.",
    },
    Draw: FootprintsFigure,
  }],
  "fossil-not-bone": [{
    afterSection: 1,
    alt: {
      th: "ภาพขยายเนื้อกระดูกสามขั้น: กระดูกที่มีรูพรุนว่าง แร่สีฟ้าเข้าไปเติมรูพรุน และเนื้อกระดูกถูกแทนที่ด้วยหิน",
      en: "Three magnified views of bone: empty pores, pores filled with blue minerals, and the bone itself replaced by rock.",
    },
    caption: {
      th: "ภาพขยายเนื้อกระดูก (แผนภาพอย่างง่าย): สีฟ้าคือแร่ที่ตกผลึกในรูพรุน สีเทาคือแร่ที่เข้าแทนที่เนื้อกระดูกเดิม",
      en: "Magnified bone (simplified): blue is mineral crystallizing in the pores, grey is mineral that has replaced the original bone.",
    },
    Draw: FossilizationFigure,
  }],
  "dating-dinosaur-fossils": [{
    afterSection: 2,
    alt: {
      th: "ภาพชั้นหิน มีชั้นเถ้าภูเขาไฟอายุ 75.0 ล้านปีอยู่ด้านบน และ 76.2 ล้านปีอยู่ด้านล่างของชั้นที่มีฟอสซิล",
      en: "A column of rock layers with a 75.0-million-year ash bed above the fossil layer and a 76.2-million-year ash bed below it.",
    },
    caption: {
      th: "ชั้นล่างเก่ากว่าชั้นบน และเถ้าภูเขาไฟที่หาอายุได้ช่วยกำหนดกรอบอายุของฟอสซิล (ตัวเลขในภาพเป็นตัวอย่าง)",
      en: "Lower layers are older than upper ones, and dated volcanic ash brackets the fossil's age. (The numbers are an example.)",
    },
    Draw: DatingFigure,
  }],
  "first-dinosaur-fossil": [{
    afterSection: -1,
    alt: {
      th: "เส้นเวลา: ค.ศ. 1676 พล็อตบรรยายกระดูก, 1824 เมกาโลซอรัส, 1825 อิกัวโนดอน, 1842 คำว่า Dinosauria, 1976 ฟอสซิลชิ้นแรกของไทยที่ภูเวียง",
      en: "Timeline: 1676 Plot's bone, 1824 Megalosaurus, 1825 Iguanodon, 1842 the word Dinosauria, 1976 Thailand's first fossil at Phu Wiang.",
    },
    caption: {
      th: "เหตุการณ์สำคัญในบทความนี้ (ระยะห่างบนเส้นไม่ได้เป็นสัดส่วนกับเวลาจริง)",
      en: "Key moments in this article (spacing is not to scale).",
    },
    Draw: HistoryFigure,
  }],
  "naming-dinosaurs": [{
    afterSection: 0,
    alt: {
      th: "ชื่อ Kinnareemimus khonkaenensis แยกเป็นส่วน: Kinnaree (กินรี) mimus (เลียนแบบ) khonkaen (ขอนแก่น) ensis (มาจาก)",
      en: "The name Kinnareemimus khonkaenensis split into parts: Kinnaree (a kinnaree), mimus (mimic), khonkaen (Khon Kaen), ensis (from).",
    },
    caption: {
      th: "ชื่อกินรีมิมัส ขอนแก่นเอนซิส แปลรวมกันได้ว่า \"ผู้เลียนแบบกินรี จากขอนแก่น\"",
      en: "Put together, Kinnareemimus khonkaenensis means roughly \"kinnaree mimic from Khon Kaen\".",
    },
    Draw: NamingFigure,
  }],
  "thai-dinosaurs": [{
    afterSection: 1,
    alt: {
      th: "แผนภาพชั้นหินสี่หมวดในภาคอีสาน พร้อมรายชื่อไดโนเสาร์ไทยทั้ง 15 ชนิดและจังหวัดที่พบ เรียงจากหมวดหินโคกกรวดด้านบนถึงหมวดหินน้ำพองด้านล่าง",
      en: "Four rock formations in Isan with all 15 Thai dinosaur species and the provinces they came from, from the Khok Kruat Formation at the top to the Nam Phong Formation at the bottom.",
    },
    caption: {
      th: "ไดโนเสาร์ไทย 15 ชนิด แยกตามหมวดหินที่พบ ชั้นบนอายุน้อยกว่าชั้นล่าง (แผนภาพอย่างง่าย ความหนาไม่ได้ย่อส่วน แสดงเฉพาะหมวดหินที่พบไดโนเสาร์ที่ตั้งชื่อแล้ว อายุเป็นค่าประมาณ และรวมชื่อที่ยังถกเถียงว่าใช้ได้หรือไม่)",
      en: "The 15 Thai dinosaur species by formation; upper layers are younger. (Simplified: thickness not to scale, only formations with named dinosaurs are shown, ages are estimates, and the list includes names whose validity is debated.)",
    },
    Draw: ThaiDinosaursFigure,
  }],
  "birds-are-dinosaurs": [{
    afterSection: 0,
    alt: {
      th: "แผนภาพต้นไม้ครอบครัวอย่างง่าย: ไทรเซราทอปส์ สเตโกซอรัส แบรคิโอซอรัส ไทแรนโนซอรัส เวโลซีแรปเตอร์ และนก แยกจากบรรพบุรุษร่วมกัน โดยนกอยู่ในสายเดียวกับไทแรนโนซอรัสและเวโลซีแรปเตอร์",
      en: "A simplified family tree: Triceratops, Stegosaurus, Brachiosaurus, Tyrannosaurus, Velociraptor and birds branch from one ancestor, with birds on the same branch as Tyrannosaurus and Velociraptor.",
    },
    caption: {
      th: "เส้นสีส้มคือสายวิวัฒนาการที่นำมาสู่นก จุดสีเขียวบอกว่าลักษณะแบบนกปรากฏขึ้นตรงไหน (แผนภาพอย่างง่าย แสดงไดโนเสาร์เพียงบางตัว และการแบ่งกลุ่มช่วงโคนต้นไม้ยังเป็นที่ถกเถียง)",
      en: "The orange line is the lineage that leads to birds; green dots mark where bird-like features appear. (Simplified, showing only a few dinosaurs; how the base of the tree splits is still debated.)",
    },
    Draw: BirdsFigure,
  }],
  "dinosaur-extinction": [{
    afterSection: 0,
    alt: {
      th: "ภาพชั้นหิน: หินยุคครีเทเชียสที่มีฟอสซิลไดโนเสาร์อยู่ด้านล่าง ชั้นดินเหนียวบางๆ อายุ 66 ล้านปีที่มีอิริเดียมสูงอยู่ตรงกลาง และหินยุคพาลีโอจีนที่ไม่พบไดโนเสาร์ที่ไม่ใช่นกอยู่ด้านบน",
      en: "Rock layers: Cretaceous rock with dinosaur fossils at the bottom, a thin 66-million-year-old clay rich in iridium in the middle, and Paleogene rock with no non-avian dinosaurs on top.",
    },
    caption: {
      th: "ชั้นหินรอยต่อระหว่างยุคครีเทเชียสกับยุคพาลีโอจีน (แผนภาพอย่างง่าย ไม่ได้ย่อส่วน) ชั้นดินเหนียวที่คั่นอยู่บางเพียงราวหนึ่งเซนติเมตรในหลายแหล่ง",
      en: "The boundary between the Cretaceous and the Paleogene (simplified, not to scale). In many places the clay between them is only about a centimeter thick.",
    },
    Draw: ExtinctionFigure,
  }, {
    afterSection: 2,
    alt: {
      th: "เส้นเวลาหลังการชน: 0 วินาที ดาวเคราะห์น้อยชนยูกาตัง, ไม่กี่นาที เกิดหลุมกว้างราว 200 กม., ไม่กี่ชั่วโมง สึนามิและเศษหินร้อนตกทั่วโลก, วันถึงสัปดาห์ เขม่าและฝุ่นปกคลุมท้องฟ้า, เดือนถึงปี โลกมืดและหนาวจนห่วงโซ่อาหารพัง, หลายพันปี เฟิร์นขึ้นเต็มพื้นที่, หนึ่งแสนปี พืชและสัตว์เลี้ยงลูกด้วยนมฟื้นตัว, เจ็ดแสนปี สัตว์เลี้ยงลูกด้วยนมหนักถึงราว 45 กิโลกรัม",
      en: "Timeline after the impact: 0 seconds, the asteroid hits the Yucatán; minutes, a crater about 200 km wide forms; hours, tsunamis and hot debris; days to weeks, soot and dust fill the sky; months to years, darkness and cold collapse food chains; millennia, ferns cover the land; 100,000 years, plants and mammals bounce back; 700,000 years, mammals reach about 45 kg.",
    },
    caption: {
      th: "ลำดับเหตุการณ์หลังการชน สีส้มคือช่วงหายนะ สีเขียวคือช่วงฟื้นตัว (ระยะห่างบนเส้นไม่ได้เป็นสัดส่วนกับเวลาจริง ช่วงฟื้นตัวอ้างอิงฟอสซิลจาก Corral Bluffs รัฐโคโลราโด สหรัฐอเมริกา)",
      en: "What happened after the impact: orange is the disaster, green the recovery. (Spacing is not to scale; the recovery stops are based on fossils from Corral Bluffs, Colorado, USA.)",
    },
    Draw: ImpactTimelineFigure,
  }],
};

function figuresAt(slug: string, afterSection: number): FigureDef[] {
  return (FIGURES[slug] ?? []).filter((f) => f.afterSection === afterSection);
}

export function hasArticleFigure(slug: string, afterSection: number): boolean {
  return figuresAt(slug, afterSection).length > 0;
}

/** The article's diagrams placed after `afterSection`, each with its caption, for the article page. */
export function ArticleFigure({ slug, lang, afterSection }: { slug: string; lang: Locale; afterSection: number }) {
  return figuresAt(slug, afterSection).map(({ Draw, alt, caption }) => (
    <figure key={alt.en} className="mt-8">
      {/* Below ~520px the labels get too small to read, so the diagram scrolls sideways instead. */}
      <div role="img" aria-label={alt[lang]} className="overflow-x-auto rounded-2xl border border-stone-200 bg-stone-100 p-3 sm:p-5">
        <div className="min-w-[520px]">
          <Draw lang={lang} compact={false} />
        </div>
      </div>
      <figcaption className="mt-2 text-sm leading-relaxed text-stone-600">{caption[lang]}</figcaption>
    </figure>
  ));
}

/** Label-free version for the article list card; decorative, since the card has the title. */
export function ArticleThumbnail({ slug, lang }: { slug: string; lang: Locale }) {
  // The first figure stands for the article on its list card.
  const figure = FIGURES[slug]?.[0];
  if (!figure) return null;
  const { Draw } = figure;
  return (
    <div aria-hidden="true" className="mb-4 flex aspect-[16/7] items-center overflow-hidden rounded-xl bg-stone-50 px-3">
      <Draw lang={lang} compact />
    </div>
  );
}
