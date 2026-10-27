import type { Clade, Diet } from "@/types/dinosaur";

export const DIET_LABELS_TH: Record<Diet, string> = {
  carnivore: "กินเนื้อ",
  herbivore: "กินพืช",
  omnivore: "กินทั้งพืชและเนื้อ",
  unknown: "ไม่ทราบชนิดอาหาร",
};

export const CLADE_LABELS_TH: Record<Clade, string> = {
  Theropoda: "เทอโรพอด (นักล่าสองขา)",
  Sauropodomorpha: "ซอโรพอโดมอร์ฟ (คอยาว)",
  Ornithischia: "ออร์นิธิสเชีย (สะโพกคล้ายนก)",
  unclassified: "ยังไม่จัดกลุ่มแน่ชัด",
};

export const PERIOD_LABELS_TH: Record<string, string> = {
  Triassic: "ไทรแอสซิก",
  Jurassic: "จูแรสซิก",
  Cretaceous: "ครีเทเชียส",
  unknown: "ไม่ทราบยุค",
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
