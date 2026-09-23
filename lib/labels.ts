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
