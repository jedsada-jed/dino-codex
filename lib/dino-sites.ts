import type { Locale } from "@/lib/i18n";

/**
 * Places in Thailand where visitors can see dinosaur fossils, for the /thailand page. Only facts
 * that don't go stale (where it is, what's there, what was found nearby); opening hours and fees
 * change, so the page sends readers to check those themselves.
 */
export interface DinoSite {
  id: string;
  /** Free-text Google Maps search, so a renamed or moved listing still resolves. */
  mapsQuery: string;
  /** Thai genera found in the same area, in the order the page shows them. */
  dinosaurs: string[];
  text: Record<Locale, { name: string; place: string; about: string }>;
}

export const DINO_SITES: DinoSite[] = [
  {
    id: "sirindhorn-museum",
    mapsQuery: "Sirindhorn Museum Kalasin",
    dinosaurs: ["phuwiangosaurus", "minimocursor", "uragasaurus"],
    text: {
      th: {
        name: "พิพิธภัณฑ์สิรินธร และหลุมขุดค้นภูกุ้มข้าว",
        place: "อำเภอสหัสขันธ์ จังหวัดกาฬสินธุ์",
        about:
          "พิพิธภัณฑ์ไดโนเสาร์ขนาดใหญ่ของกรมทรัพยากรธรณี ข้างกันคือหลุมขุดค้นภูกุ้มข้าวที่มีหลังคาคลุม ซึ่งยังเห็นกระดูกภูเวียงโกซอรัสหลายร้อยชิ้นจากหลายตัววางอยู่ในตำแหน่งที่พบ",
      },
      en: {
        name: "Sirindhorn Museum and the Phu Kum Khao dig site",
        place: "Sahatsakhan District, Kalasin",
        about:
          "A large dinosaur museum run by the Department of Mineral Resources. Next to it, a roofed dig site at Phu Kum Khao still shows hundreds of Phuwiangosaurus bones from several animals lying where they were found.",
      },
    },
  },
  {
    id: "phu-wiang",
    mapsQuery: "Phu Wiang Dinosaur Museum Khon Kaen",
    dinosaurs: ["phuwiangosaurus", "siamotyrannus", "phuwiangvenator", "kinnareemimus"],
    text: {
      th: {
        name: "พิพิธภัณฑ์ไดโนเสาร์ภูเวียง และอุทยานแห่งชาติภูเวียง",
        place: "อำเภอเวียงเก่า จังหวัดขอนแก่น",
        about:
          "ภูเวียงคือจุดที่พบฟอสซิลไดโนเสาร์ชิ้นแรกของไทยเมื่อ พ.ศ. 2519 พิพิธภัณฑ์เล่าเรื่องการค้นพบในพื้นที่ และในอุทยานแห่งชาติภูเวียงมีหลุมขุดค้นที่เปิดให้ชม",
      },
      en: {
        name: "Phu Wiang Dinosaur Museum and Phu Wiang National Park",
        place: "Wiang Kao District, Khon Kaen",
        about:
          "Phu Wiang is where Thailand's first dinosaur fossil was found, in 1976. The museum tells the story of the finds in the area, and the national park has dig sites open to visitors.",
      },
    },
  },
  {
    id: "khorat-geopark",
    mapsQuery: "Khorat Fossil Museum Nakhon Ratchasima",
    dinosaurs: ["siamraptor", "sirindhorna", "ratchasimasaurus", "siamodon"],
    text: {
      th: {
        name: "พิพิธภัณฑ์ไดโนเสาร์ อุทยานธรณีโลกโคราช",
        place: "จังหวัดนครราชสีมา",
        about:
          "โคราชได้รับการรับรองเป็นอุทยานธรณีโลกของยูเนสโกในปี พ.ศ. 2566 พิพิธภัณฑ์ซากดึกดำบรรพ์ของมหาวิทยาลัยราชภัฏนครราชสีมาจัดแสดงไดโนเสาร์ที่พบในจังหวัด ไม้กลายเป็นหิน และช้างดึกดำบรรพ์",
      },
      en: {
        name: "Dinosaur Museum, Khorat UNESCO Global Geopark",
        place: "Nakhon Ratchasima",
        about:
          "Khorat became a UNESCO Global Geopark in 2023. The fossil museums run by Nakhon Ratchasima Rajabhat University show dinosaurs found in the province, along with petrified wood and ancient elephants.",
      },
    },
  },
  {
    id: "phu-faek",
    mapsQuery: "Phu Faek Forest Park dinosaur footprints Kalasin",
    dinosaurs: [],
    text: {
      th: {
        name: "รอยเท้าไดโนเสาร์ วนอุทยานภูแฝก",
        place: "จังหวัดกาฬสินธุ์",
        about: "รอยเท้าไดโนเสาร์หลายรอยบนลานหินทราย เป็นจุดหนึ่งในเส้นทางท่องเที่ยวไดโนเสาร์ที่เชื่อมภูเวียงกับภูกุ้มข้าว",
      },
      en: {
        name: "Dinosaur footprints, Phu Faek Forest Park",
        place: "Kalasin",
        about: "A trackway of dinosaur footprints on a sandstone surface, one stop on the dinosaur route linking Phu Wiang and Phu Kum Khao.",
      },
    },
  },
  {
    id: "phu-luang",
    mapsQuery: "Phu Luang Wildlife Sanctuary dinosaur footprints Loei",
    dinosaurs: [],
    text: {
      th: {
        name: "รอยเท้าไดโนเสาร์ เขตรักษาพันธุ์สัตว์ป่าภูหลวง",
        place: "จังหวัดเลย",
        about: "รอยเท้าไดโนเสาร์บนหินทรายในพื้นที่ป่าบนภูเขา เหมาะกับคนที่อยากเห็นรอยเท้าในธรรมชาติ ควรติดต่อเจ้าหน้าที่ก่อนเข้าพื้นที่",
      },
      en: {
        name: "Dinosaur footprints, Phu Luang Wildlife Sanctuary",
        place: "Loei",
        about: "Dinosaur footprints in sandstone in a mountain forest, for visitors who want to see tracks in the wild. Contact the sanctuary staff before visiting.",
      },
    },
  },
];

export function mapsUrl(site: DinoSite): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapsQuery)}`;
}
