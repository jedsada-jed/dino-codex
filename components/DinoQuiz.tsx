"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { QuizItem, QuizLevel } from "@/lib/quiz";
import { DIET_LABELS, PERIOD_LABELS } from "@/lib/labels";
import { getDictionary } from "@/lib/dictionaries";
import { formatNumber, href, type Locale } from "@/lib/i18n";
import { AiBadge } from "@/components/AiImageDisclosure";

const ROUND_KINDS = {
  easy: ["image", "image", "image", "period", "period", "diet", "diet", "longer", "longer", "thailand"],
  hard: ["image", "image", "period", "diet", "longer", "longer", "thailand", "together", "together", "together"],
} as const;
type Kind = (typeof ROUND_KINDS)[QuizLevel][number];
const ROUND_LENGTH = ROUND_KINDS.easy.length;
/** "Which is longer?" only asks about pairs at least this far apart, so estimates can't flip the answer. */
const MIN_LENGTH_RATIO = 1.3;

interface Question {
  kind: Kind;
  prompt: string;
  image?: QuizItem;
  /** `sub` is the scientific name under a Thai name. */
  options: { id: string; label: string; sub?: string }[];
  answer: string;
  explain: string;
  /** Dinosaur pages the explanation links to. */
  links: QuizItem[];
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = <T,>(list: T[]): T | undefined => list[Math.floor(Math.random() * list.length)];

function buildRound(pool: QuizItem[], lang: Locale, level: QuizLevel): Question[] {
  const t = getDictionary(lang).quiz;
  const label = (d: QuizItem) => d.localName ?? d.name;
  // The hard pool has many genera without a Thai name. Leading every option with its scientific
  // name keeps a lone Thai name from giving away the "found in Thailand" answer.
  const dinoOption = (d: QuizItem) =>
    level === "hard"
      ? { id: d.slug, label: d.name, sub: d.localName ?? undefined }
      : { id: d.slug, label: label(d), sub: d.localName ? d.name : undefined };
  // Each dinosaur is the subject of at most one question per round.
  const used = new Set<string>();
  const fresh = (filter: (d: QuizItem) => boolean) => pool.filter((d) => !used.has(d.slug) && filter(d));
  const take = (d: QuizItem) => (used.add(d.slug), d);

  const make: Record<Kind, () => Question | null> = {
    image: () => {
      const subject = pick(fresh(() => true));
      if (!subject) return null;
      take(subject);
      const others = shuffle(pool.filter((d) => d.slug !== subject.slug)).slice(0, 3);
      return {
        kind: "image",
        prompt: t.qImage,
        image: subject,
        options: shuffle([subject, ...others]).map(dinoOption),
        answer: subject.slug,
        explain: t.explainImage(label(subject)),
        links: [subject],
      };
    },
    period: () => {
      const subject = pick(fresh((d) => d.period !== null));
      if (!subject?.period) return null;
      take(subject);
      return {
        kind: "period",
        prompt: t.qPeriod(label(subject)),
        options: ["Triassic", "Jurassic", "Cretaceous"].map((p) => ({ id: p, label: PERIOD_LABELS[lang][p] })),
        answer: subject.period,
        explain: t.explainPeriod(label(subject), PERIOD_LABELS[lang][subject.period], `${subject.ageRangeMa[0]}–${subject.ageRangeMa[1]}`),
        links: [subject],
      };
    },
    diet: () => {
      const subject = pick(fresh((d) => d.diet !== null));
      if (!subject?.diet) return null;
      take(subject);
      return {
        kind: "diet",
        prompt: t.qDiet(label(subject)),
        options: (["carnivore", "herbivore", "omnivore"] as const).map((d) => ({ id: d, label: DIET_LABELS[lang][d] })),
        answer: subject.diet,
        explain: t.explainDiet(label(subject), DIET_LABELS[lang][subject.diet]),
        links: [subject],
      };
    },
    longer: () => {
      const a = pick(fresh((d) => d.lengthM !== null));
      if (!a?.lengthM) return null;
      const b = pick(fresh((d) => d.lengthM !== null && Math.max(d.lengthM, a.lengthM!) / Math.min(d.lengthM, a.lengthM!) >= MIN_LENGTH_RATIO));
      if (!b?.lengthM) return null;
      take(a);
      take(b);
      const [long, short] = a.lengthM > b.lengthM ? [a, b] : [b, a];
      const m = (n: number) => formatNumber(lang, n);
      return {
        kind: "longer",
        prompt: t.qLonger,
        options: shuffle([a, b]).map(dinoOption),
        answer: long.slug,
        explain: t.explainLonger(label(long), m(long.lengthM!), label(short), m(short.lengthM!)),
        links: [long, short],
      };
    },
    thailand: () => {
      const subject = pick(fresh((d) => d.thailand));
      if (!subject) return null;
      take(subject);
      const others = shuffle(pool.filter((d) => !d.thailand)).slice(0, 3);
      return {
        kind: "thailand",
        prompt: t.qThailand,
        options: shuffle([subject, ...others]).map(dinoOption),
        answer: subject.slug,
        explain: t.explainThailand(label(subject)),
        links: [subject],
      };
    },
    together: () => {
      const subject = pick(fresh((d) => d.formation !== null && pool.some((o) => o.slug !== d.slug && o.formation === d.formation)));
      if (!subject?.formation) return null;
      const mate = pick(pool.filter((d) => d.slug !== subject.slug && d.formation === subject.formation));
      const others = shuffle(pool.filter((d) => d.formation !== null && d.formation !== subject.formation)).slice(0, 3);
      if (!mate || others.length < 3) return null;
      take(subject);
      return {
        kind: "together",
        prompt: t.qTogether(label(subject)),
        options: shuffle([mate, ...others]).map(dinoOption),
        answer: mate.slug,
        explain: t.explainTogether(label(subject), label(mate), subject.formation),
        links: [subject, mate],
      };
    },
  };

  return shuffle([...ROUND_KINDS[level]])
    .map((kind) => make[kind]() ?? make.image())
    .filter((q): q is Question => q !== null);
}

export function DinoQuiz({ pools, lang }: { pools: Record<QuizLevel, QuizItem[]>; lang: Locale }) {
  const t = getDictionary(lang).quiz;
  // Questions are random, so they're only built on click: building them during render would
  // differ between the static HTML and the browser.
  const [round, setRound] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [shared, setShared] = useState(false);

  const [level, setLevel] = useState<QuizLevel>("easy");

  const start = (chosen: QuizLevel = level) => {
    setLevel(chosen);
    setRound(buildRound(pools[chosen], lang, chosen));
    setIndex(0);
    setPicked(null);
    setScore(0);
    setShared(false);
  };

  if (!round) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-100 p-6 text-center sm:p-10">
        <p className="text-5xl" aria-hidden="true">
          🦖❓
        </p>
        <p className="mx-auto mt-4 max-w-md text-stone-700">{t.intro(ROUND_LENGTH)}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => start("easy")}
            className="min-h-11 rounded-full bg-emerald-700 px-8 font-semibold text-stone-50 transition-colors hover:bg-emerald-800"
          >
            {t.startEasy}
          </button>
          <button
            type="button"
            onClick={() => start("hard")}
            className="min-h-11 rounded-full border-2 border-emerald-700 px-8 font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
          >
            {t.startHard}
          </button>
        </div>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone-500">{t.hardNote}</p>
      </div>
    );
  }

  if (index >= round.length) {
    const total = round.length;
    const verdict = score === total ? t.verdictPerfect : score >= total * 0.7 ? t.verdictGreat : score >= total * 0.4 ? t.verdictOk : t.verdictTryAgain;
    const shareText = t.shareText(score, total);
    const share = async () => {
      const url = window.location.href;
      try {
        if (navigator.share) await navigator.share({ text: shareText, url });
        else {
          await navigator.clipboard.writeText(`${shareText} ${url}`);
          setShared(true);
        }
      } catch {
        // The user closed the share sheet; nothing to do.
      }
    };
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-100 p-6 text-center sm:p-10" aria-live="polite">
        <p className="text-sm font-semibold text-stone-500">{t.resultLabel}</p>
        <p className="mt-2 text-5xl font-extrabold text-emerald-700">
          {score}/{total}
        </p>
        <p className="mt-3 text-lg font-semibold text-stone-900">{verdict}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => start()}
            className="min-h-11 rounded-full bg-emerald-700 px-6 font-semibold text-stone-50 transition-colors hover:bg-emerald-800"
          >
            {t.playAgain}
          </button>
          <button
            type="button"
            onClick={share}
            className="min-h-11 rounded-full border border-stone-300 px-6 font-semibold text-stone-700 transition-colors hover:border-emerald-600 hover:text-emerald-700"
          >
            {shared ? t.copied : t.share}
          </button>
        </div>
      </div>
    );
  }

  const q = round[index];
  const answered = picked !== null;
  const choose = (id: string) => {
    if (answered) return;
    setPicked(id);
    if (id === q.answer) setScore((s) => s + 1);
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-100 p-4 sm:p-6">
      <div className="flex items-center justify-between text-sm text-stone-500">
        <span>{t.progress(index + 1, round.length)}</span>
        <span>{t.score(score)}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200" aria-hidden="true">
        <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${((index + (answered ? 1 : 0)) / round.length) * 100}%` }} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-stone-900">{q.prompt}</h2>

      {q.image && (
        <div className="relative mx-auto mt-4 aspect-4/3 w-full max-w-md overflow-hidden rounded-xl bg-stone-200">
          {/* The answer is the subject's name, so the alt text can't give it away. */}
          <Image src={q.image.thumbnail} alt={t.imageAlt} fill sizes="(min-width: 640px) 448px, 90vw" className="object-cover" />
          {q.image.thumbnailIsAi && <AiBadge lang={lang} className="absolute left-2 top-2" />}
        </div>
      )}

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {q.options.map((o) => {
          const isAnswer = o.id === q.answer;
          const isPicked = o.id === picked;
          const state = !answered
            ? "border-stone-300 bg-stone-50 hover:border-emerald-600 hover:bg-emerald-50"
            : isAnswer
              ? "border-emerald-600 bg-emerald-50 text-emerald-900"
              : isPicked
                ? "border-danger bg-stone-50 text-danger"
                : "border-stone-200 bg-stone-50 opacity-60";
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => choose(o.id)}
                disabled={answered}
                className={`flex min-h-12 w-full items-center justify-between gap-2 rounded-xl border-2 px-4 py-2 text-left font-medium text-stone-800 transition-colors ${state}`}
              >
                <span>
                  {o.label}
                  {o.sub && <span className="block text-xs font-normal italic text-stone-500">{o.sub}</span>}
                </span>
                {answered && (isAnswer || isPicked) && <span aria-hidden="true">{isAnswer ? "✓" : "✗"}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {answered && (
        <div className="mt-5" aria-live="polite">
          <p className={`font-semibold ${picked === q.answer ? "text-emerald-700" : "text-danger"}`}>
            {picked === q.answer ? t.correct : t.wrong}
          </p>
          <p className="mt-1 text-stone-700">{q.explain}</p>
          <p className="mt-1 flex flex-wrap gap-x-4 text-sm">
            {q.links.map((d) => (
              <Link key={d.slug} href={href(lang, `/dinosaurs/${d.slug}`)} className="inline-flex min-h-11 items-center text-emerald-700 underline hover:text-emerald-800">
                {t.readAbout(d.localName ?? d.name)}
              </Link>
            ))}
          </p>
          <button
            type="button"
            onClick={() => {
              setIndex((i) => i + 1);
              setPicked(null);
            }}
            autoFocus
            className="mt-3 min-h-11 rounded-full bg-emerald-700 px-6 font-semibold text-stone-50 transition-colors hover:bg-emerald-800"
          >
            {index + 1 < round.length ? t.next : t.seeResult}
          </button>
        </div>
      )}
    </div>
  );
}
