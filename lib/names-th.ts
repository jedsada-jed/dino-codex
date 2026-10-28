/**
 * Thai names for popular and Thai genera that don't have hand-written content yet, so cards
 * and pages don't fall back to scientific names. content-th.json wins when present.
 */
const FALLBACK_NAMES_TH: Record<string, string> = {
  spinosaurus: "สไปโนซอรัส",
  allosaurus: "อัลโลซอรัส",
  archaeopteryx: "อาร์คีออปเทอริกซ์",
  giganotosaurus: "จิกาโนโตซอรัส",
  ankylosaurus: "แองคิโลซอรัส",
  dilophosaurus: "ไดโลโฟซอรัส",
  therizinosaurus: "เทอริซิโนซอรัส",
  deinonychus: "ไดโนนิคัส",
  carnotaurus: "คาร์โนทอรัส",
  utahraptor: "ยูทาห์แรปเตอร์",
  diplodocus: "ดิพลอโดคัส",
  parasaurolophus: "พาราซอโรโลฟัส",
  pachycephalosaurus: "แพคีเซฟาโลซอรัส",
  iguanodon: "อิกัวโนดอน",
  brontosaurus: "บรอนโตซอรัส",
  argentinosaurus: "อาร์เจนติโนซอรัส",
  apatosaurus: "อะแพโทซอรัส",
  // Thai genera
  isanosaurus: "อีสานโนซอรัส",
  kinnareemimus: "กินรีมิมัส",
  mamenchisaurus: "มาเมนชิซอรัส",
  minimocursor: "มินิโมเคอร์เซอร์",
  nagatitan: "นาคาไททัน",
  phuwiangvenator: "ภูเวียงเวเนเตอร์",
  psittacosaurus: "ซิตตะโกซอรัส",
  ratchasimasaurus: "ราชสีมาซอรัส",
  siamodon: "สยามโมดอน",
  uragasaurus: "อุรคะซอรัส",
  vayuraptor: "วายุแรปเตอร์",
};

/** Thai name for a genus without hand-written content, if we have one. */
export function fallbackNameTh(slug: string): string | null {
  return FALLBACK_NAMES_TH[slug] ?? null;
}
