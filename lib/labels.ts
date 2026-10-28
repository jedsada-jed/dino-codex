import type { Clade, Diet } from "@/types/dinosaur";
import type { Locale } from "@/lib/i18n";

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
