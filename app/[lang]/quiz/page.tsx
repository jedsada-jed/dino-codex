import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuizPool } from "@/lib/quiz";
import { getDictionary } from "@/lib/dictionaries";
import { href, isLocale, languageAlternates } from "@/lib/i18n";
import { DinoQuiz } from "@/components/DinoQuiz";

export async function generateMetadata({ params }: PageProps<"/[lang]/quiz">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).quiz;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: href(lang, "/quiz"), languages: languageAlternates("/quiz") },
    openGraph: { title: t.title, description: t.description },
  };
}

export default async function QuizPage({ params }: PageProps<"/[lang]/quiz">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).quiz;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">{t.title}</h1>
      <p className="mt-2 text-stone-600">{t.lead}</p>
      <div className="mt-6">
        <DinoQuiz pool={getQuizPool(lang)} lang={lang} />
      </div>
    </div>
  );
}
