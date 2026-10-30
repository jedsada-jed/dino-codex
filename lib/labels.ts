import type { Clade, Diet } from "@/types/dinosaur";
import type { Locale } from "@/lib/i18n";
import type { NewsTag } from "@/types/news";

export const DIET_LABELS: Record<Locale, Record<Diet, string>> = {
  th: {
    carnivore: "กินเนื้อ",
    herbivore: "กินพืช",
    omnivore: "กินทั้งพืชและเนื้อ",
    unknown: "ไม่ทราบชนิดอาหาร",
  },
  en: {
    carnivore: "Carnivore",
    herbivore: "Herbivore",
    omnivore: "Omnivore",
    unknown: "Unknown diet",
  },
};

export const CLADE_LABELS: Record<Locale, Record<Clade, string>> = {
  th: {
    Theropoda: "เทอโรพอด (นักล่าสองขา)",
    Sauropodomorpha: "ซอโรพอโดมอร์ฟ (คอยาว)",
    Ornithischia: "ออร์นิธิสเชีย (สะโพกคล้ายนก)",
    unclassified: "ยังไม่จัดกลุ่มแน่ชัด",
  },
  en: {
    Theropoda: "Theropod (two-legged predators)",
    Sauropodomorpha: "Sauropodomorph (long-necked)",
    Ornithischia: "Ornithischian (bird-hipped)",
    unclassified: "Not yet classified",
  },
};

export const PERIOD_LABELS: Record<Locale, Record<string, string>> = {
  th: {
    Triassic: "ไทรแอสซิก",
    Jurassic: "จูแรสซิก",
    Cretaceous: "ครีเทเชียส",
    unknown: "ไม่ทราบยุค",
  },
  en: {
    Triassic: "Triassic",
    Jurassic: "Jurassic",
    Cretaceous: "Cretaceous",
    unknown: "Unknown period",
  },
};

/**
 * Fixed (theme-independent) period fills, dark enough that white text on them passes
 * WCAG AA in both light and dark mode. Shared by the homepage period strip and /timeline.
 */
export const PERIOD_COLORS: Record<string, string> = {
  Triassic: "#a14c12",
  Jurassic: "#1f6b4a",
  Cretaceous: "#0369a1",
  unknown: "#545f4d",
};

/** News is Thai-only, so these labels have no English version. Ordered as the news filter shows them. */
export const NEWS_TAGS: Record<NewsTag, { label: string; color: string }> = {
  thailand: { label: "ในไทย", color: "#2f9e6a" },
  "new-species": { label: "ชนิดใหม่", color: "#e0a352" },
  discovery: { label: "การค้นพบ", color: "#c2410c" },
  research: { label: "งานวิจัย", color: "#3f86ad" },
  footprints: { label: "รอยเท้า", color: "#a16207" },
  learning: { label: "แหล่งเรียนรู้", color: "#8b5cf6" },
  "other-animals": { label: "สัตว์ดึกดำบรรพ์อื่น", color: "#0e9384" },
  general: { label: "ข่าวทั่วไป", color: "#78716c" },
};
