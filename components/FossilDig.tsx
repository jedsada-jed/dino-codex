"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BodyPlan } from "@/lib/sizes";
import { getDictionary } from "@/lib/dictionaries";
import { formatNumber, href, type Locale } from "@/lib/i18n";
import { DINO_SHAPES } from "@/components/Silhouettes";

export interface DigDino {
  slug: string;
  name: string;
  localName: string | null;
  lengthM: number;
  plan: BodyPlan;
  thumbnail: string | null;
}

/** The dig site: COLS × ROWS square cells, 10 units each, drawn in a 100 × 60 viewBox. */
const COLS = 10;
const ROWS = 6;
const CELL = 10;
/** Digs allowed on top of the number of bone cells, so a careful player always has room. */
const SPARE_DIGS = 10;
/** A cell counts as bone when at least this share of its sample points falls inside the skeleton. */
const BONE_COVERAGE = 0.2;
const SAMPLES = 5;

/** Fixed soil colours (theme-independent, like the map's): near bones warm, far cool. */
const SOIL = "#7a5c3e";
const DUG = { near: "#d9822b", mid: "#d8b46a", far: "#a8a29e" } as const;

type Status = "playing" | "won" | "lost";

interface Round {
  dino: DigDino;
  /** Where the silhouette sits in the viewBox: translate x/y and scale. */
  place: { x: number; y: number; s: number };
  bones: Set<number>;
  dug: Set<number>;
  digsLeft: number;
  status: Status;
}

const cellIndex = (col: number, row: number) => row * COLS + col;

/** Which cells the skeleton covers, by sampling points against the real silhouette path. */
function boneCells(plan: BodyPlan, place: Round["place"]): Set<number> {
  const shape = DINO_SHAPES[plan];
  const path = new Path2D(shape.d);
  const ctx = document.createElement("canvas").getContext("2d")!;
  const cells = new Set<number>();
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      let inside = 0;
      for (let i = 0; i < SAMPLES; i++) {
        for (let j = 0; j < SAMPLES; j++) {
          // Back from viewBox units into the shape's own units.
          const x = (col * CELL + ((i + 0.5) * CELL) / SAMPLES - place.x) / place.s;
          const y = (row * CELL + ((j + 0.5) * CELL) / SAMPLES - place.y) / place.s;
          if (ctx.isPointInPath(path, x, y, "evenodd")) inside++;
        }
      }
      if (inside / (SAMPLES * SAMPLES) >= BONE_COVERAGE) cells.add(cellIndex(col, row));
    }
  }
  return cells;
}

function newRound(pool: DigDino[], previous?: string): Round {
  const choices = pool.length > 1 ? pool.filter((d) => d.slug !== previous) : pool;
  const dino = choices[Math.floor(Math.random() * choices.length)];
  const shape = DINO_SHAPES[dino.plan];
  // Fill most of the width, centred vertically, so every body plan gives a fair number of cells.
  const s = Math.min(92 / shape.w, 52 / shape.h);
  const place = { x: (COLS * CELL - shape.w * s) / 2, y: (ROWS * CELL - shape.h * s) / 2, s };
  const bones = boneCells(dino.plan, place);
  return { dino, place, bones, dug: new Set(), digsLeft: bones.size + SPARE_DIGS, status: "playing" };
}

/** Distance in cells (king's moves) from a cell to the nearest bone. */
function distanceToBone(index: number, bones: Set<number>): number {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  let best = Infinity;
  for (const b of bones) best = Math.min(best, Math.max(Math.abs((b % COLS) - col), Math.abs(Math.floor(b / COLS) - row)));
  return best;
}

export function FossilDig({ pool, lang }: { pool: DigDino[]; lang: Locale }) {
  const t = getDictionary(lang).dig;
  // Rounds are random and need a canvas to measure the skeleton, so they start on click.
  const [round, setRound] = useState<Round | null>(null);

  const start = () => setRound(newRound(pool, round?.dino.slug));

  if (!round) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-100 p-6 text-center sm:p-10">
        <p className="text-5xl" aria-hidden="true">
          ⛏️🦴
        </p>
        <p className="mx-auto mt-4 max-w-md text-stone-700">{t.intro}</p>
        <button
          type="button"
          onClick={start}
          className="mt-6 min-h-11 rounded-full bg-emerald-700 px-8 font-semibold text-stone-50 transition-colors hover:bg-emerald-800"
        >
          {t.start}
        </button>
      </div>
    );
  }

  const { dino, place, bones, dug, digsLeft, status } = round;
  const found = [...bones].filter((b) => dug.has(b)).length;
  const done = status !== "playing";
  const name = dino.localName ?? dino.name;
  const shape = DINO_SHAPES[dino.plan];

  // Functional update, so quick taps in a row each build on the latest state.
  const dig = (index: number) =>
    setRound((r) => {
      if (!r || r.status !== "playing" || r.dug.has(index)) return r;
      const nextDug = new Set(r.dug).add(index);
      const allFound = [...r.bones].every((b) => nextDug.has(b));
      const left = r.digsLeft - 1;
      return { ...r, dug: nextDug, digsLeft: left, status: allFound ? "won" : left === 0 ? "lost" : "playing" };
    });

  const cellFill = (index: number) => {
    if (!dug.has(index) && !done) return SOIL;
    if (bones.has(index)) return "#f5efe1";
    if (!dug.has(index)) return SOIL;
    const d = distanceToBone(index, bones);
    return d <= 1 ? DUG.near : d === 2 ? DUG.mid : DUG.far;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-stone-600">
        <span>{t.found(found, bones.size)}</span>
        <span>{t.digsLeft(digsLeft)}</span>
      </div>

      <div className="relative mt-3 overflow-hidden rounded-2xl border border-stone-300">
        <svg viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`} className="block h-auto w-full" aria-hidden="true">
          <defs>
            {/* The skeleton only shows through dug bone cells, or everywhere once the round ends. */}
            <clipPath id="dug-bones">
              {[...bones]
                .filter((b) => done || dug.has(b))
                .map((b) => (
                  <rect key={b} x={(b % COLS) * CELL} y={Math.floor(b / COLS) * CELL} width={CELL} height={CELL} />
                ))}
            </clipPath>
          </defs>
          {Array.from({ length: COLS * ROWS }, (_, i) => (
            <rect
              key={i}
              x={(i % COLS) * CELL}
              y={Math.floor(i / COLS) * CELL}
              width={CELL}
              height={CELL}
              fill={cellFill(i)}
              stroke="#5a4330"
              strokeWidth={0.3}
            />
          ))}
          {/* Clip on the group, transform on the path: a clip on the transformed path itself would
              be scaled along with it and land on the wrong cells. */}
          <g clipPath={done ? undefined : "url(#dug-bones)"}>
            <path
              d={shape.d}
              fillRule="evenodd"
              fill={status === "lost" ? "#9a8d7d" : "#6b5b4b"}
              transform={`translate(${place.x} ${place.y}) scale(${place.s})`}
            />
          </g>
        </svg>
        {/* Real buttons over the drawing, so digging works by keyboard and screen reader too. */}
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {Array.from({ length: COLS * ROWS }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => dig(i)}
              disabled={done || dug.has(i)}
              aria-label={
                dug.has(i)
                  ? bones.has(i)
                    ? t.cellBone
                    : t.cellEmpty(distanceToBone(i, bones))
                  : t.cellDig(Math.floor(i / COLS) + 1, (i % COLS) + 1)
              }
              className="focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-amber-300 enabled:hover:bg-white/15"
            />
          ))}
        </div>
      </div>

      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600" aria-label={t.legendLabel}>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: DUG.near }} aria-hidden="true" />
          {t.legendNear}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: DUG.mid }} aria-hidden="true" />
          {t.legendMid}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: DUG.far }} aria-hidden="true" />
          {t.legendFar}
        </li>
      </ul>

      {done && (
        <div className="mt-5 grid gap-4 rounded-2xl border border-stone-200 bg-stone-100 p-4 sm:grid-cols-[10rem_1fr]" aria-live="polite">
          {dino.thumbnail && (
            <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-stone-200">
              <Image src={dino.thumbnail} alt={name} fill sizes="160px" className="object-cover" />
            </div>
          )}
          <div>
            <p className={`font-semibold ${status === "won" ? "text-emerald-700" : "text-amber-700"}`}>
              {status === "won" ? t.won(bones.size + SPARE_DIGS - digsLeft) : t.lost}
            </p>
            <p className="mt-1 text-lg font-bold text-stone-900">{t.reveal(name)}</p>
            {dino.localName && <p className="text-sm italic text-stone-500">{dino.name}</p>}
            <p className="mt-1 text-sm text-stone-700">{t.length(formatNumber(lang, dino.lengthM))}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={start}
                className="min-h-11 rounded-full bg-emerald-700 px-6 font-semibold text-stone-50 transition-colors hover:bg-emerald-800"
              >
                {t.again}
              </button>
              <Link
                href={href(lang, `/dinosaurs/${dino.slug}`)}
                className="inline-flex min-h-11 items-center rounded-full border border-stone-300 px-6 font-semibold text-stone-700 hover:border-emerald-600 hover:text-emerald-700"
              >
                {t.readAbout(name)}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
