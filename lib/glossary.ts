import type { Locale } from "@/lib/i18n";

/**
 * Terms for /glossary. Definitions are written for this site in plain language; each names the
 * encyclopedia entry it follows so readers can check it, and may point to a page here that goes
 * deeper. Period dates follow the ICS chart, as on /timeline.
 */
export interface GlossaryTerm {
  id: string;
  category: GlossaryCategory;
  /** Scientific or English term shown under the Thai one. */
  latin: string;
  text: Record<Locale, { term: string; definition: string }>;
  /** English Wikipedia article title (underscored). */
  wikipedia: string;
  /** A page on this site that explains more, as a path without the language prefix. */
  seeAlso?: string;
}

export type GlossaryCategory = "groups" | "fossils" | "time" | "names";

export const GLOSSARY_CATEGORIES: GlossaryCategory[] = ["groups", "fossils", "time", "names"];

export const GLOSSARY: GlossaryTerm[] = [
  // ---- Dinosaur groups ----
  {
    id: "dinosaur",
    category: "groups",
    latin: "Dinosauria",
    wikipedia: "Dinosaur",
    seeAlso: "/articles/not-dinosaurs",
    text: {
      th: {
        term: "ไดโนเสาร์",
        definition:
          "สัตว์เลื้อยคลานกลุ่มหนึ่งที่สืบเชื้อสายมาจากบรรพบุรุษเดียวกัน มีขาตั้งตรงอยู่ใต้ลำตัว ปรากฏขึ้นในยุคไทรแอสซิกเมื่อราว 230 ล้านปีก่อน นกในปัจจุบันก็นับเป็นไดโนเสาร์ด้วย",
      },
      en: {
        term: "Dinosaur",
        definition:
          "A group of reptiles descended from one common ancestor, with legs held straight under the body. They appeared in the Triassic about 230 million years ago, and today's birds count as dinosaurs too.",
      },
    },
  },
  {
    id: "non-avian",
    category: "groups",
    latin: "Non-avian dinosaurs",
    wikipedia: "Dinosaur",
    seeAlso: "/articles/birds-are-dinosaurs",
    text: {
      th: {
        term: "ไดโนเสาร์ที่ไม่ใช่นก",
        definition: "ไดโนเสาร์ทุกกลุ่มยกเว้นนก ซึ่งสูญพันธุ์ไปทั้งหมดเมื่อ 66 ล้านปีก่อน เป็นความหมายที่คนทั่วไปนึกถึงเวลาพูดว่า \"ไดโนเสาร์\"",
      },
      en: {
        term: "Non-avian dinosaurs",
        definition: "All dinosaurs except birds. They all died out 66 million years ago, and they are what most people mean by \"dinosaurs\".",
      },
    },
  },
  {
    id: "saurischia",
    category: "groups",
    latin: "Saurischia",
    wikipedia: "Saurischia",
    text: {
      th: {
        term: "ซอริสเชีย (สะโพกแบบกิ้งก่า)",
        definition:
          "หนึ่งในสองกลุ่มใหญ่ของไดโนเสาร์ตามการแบ่งแบบดั้งเดิม รวมเทอโรพอดและซอโรพอโดมอร์ฟ งานวิจัยบางชิ้นเสนอการแบ่งกลุ่มแบบอื่น การจัดกลุ่มนี้จึงยังถกเถียงกันอยู่",
      },
      en: {
        term: "Saurischia (lizard-hipped)",
        definition:
          "One of the two traditional main groups of dinosaurs, made up of theropods and sauropodomorphs. Some studies propose a different split, so this grouping is still debated.",
      },
    },
  },
  {
    id: "ornithischia",
    category: "groups",
    latin: "Ornithischia",
    wikipedia: "Ornithischia",
    text: {
      th: {
        term: "ออร์นิธิสเชีย (สะโพกแบบนก)",
        definition:
          "ไดโนเสาร์กินพืชกลุ่มใหญ่ที่มีกระดูกจะงอยปากที่ขากรรไกรล่าง เช่น สเตโกซอรัส แองคิโลซอรัส ไทรเซราทอปส์ และไดโนเสาร์ปากเป็ด แม้ชื่อจะแปลว่าสะโพกแบบนก แต่นกไม่ได้อยู่ในกลุ่มนี้",
      },
      en: {
        term: "Ornithischia (bird-hipped)",
        definition:
          "A large group of plant-eating dinosaurs with an extra beak bone at the front of the lower jaw, such as Stegosaurus, Ankylosaurus, Triceratops and duck-billed dinosaurs. Despite the name, birds are not in this group.",
      },
    },
  },
  {
    id: "theropod",
    category: "groups",
    latin: "Theropoda",
    wikipedia: "Theropoda",
    text: {
      th: {
        term: "เทอโรพอด",
        definition: "ไดโนเสาร์ที่เดินสองขา ส่วนใหญ่กินเนื้อ เช่น ไทแรนโนซอรัส เวโลซีแรปเตอร์ และสยามแรปเตอร์ นกในปัจจุบันก็สืบเชื้อสายมาจากเทอโรพอด",
      },
      en: {
        term: "Theropod",
        definition: "Two-legged dinosaurs, mostly meat-eaters, such as Tyrannosaurus, Velociraptor and Siamraptor. Today's birds descend from theropods.",
      },
    },
  },
  {
    id: "sauropodomorph",
    category: "groups",
    latin: "Sauropodomorpha",
    wikipedia: "Sauropodomorpha",
    text: {
      th: {
        term: "ซอโรพอโดมอร์ฟ",
        definition: "ไดโนเสาร์กินพืชคอยาว รวมทั้งบรรพบุรุษรุ่นแรกที่ยังตัวเล็กและบางตัวเดินสองขา จนถึงซอโรพอดขนาดยักษ์",
      },
      en: {
        term: "Sauropodomorph",
        definition: "Long-necked plant-eating dinosaurs, from small early forms, some of them two-legged, to the giant sauropods.",
      },
    },
  },
  {
    id: "sauropod",
    category: "groups",
    latin: "Sauropoda",
    wikipedia: "Sauropoda",
    seeAlso: "/dinosaurs/phuwiangosaurus",
    text: {
      th: {
        term: "ซอโรพอด",
        definition: "ไดโนเสาร์กินพืชเดินสี่ขา คอและหางยาวมาก รวมสัตว์บกที่ใหญ่ที่สุดเท่าที่เคยมีมา เช่น แบรคิโอซอรัส และภูเวียงโกซอรัสของไทย",
      },
      en: {
        term: "Sauropod",
        definition: "Four-legged plant-eating dinosaurs with very long necks and tails, including the largest land animals ever, such as Brachiosaurus and Thailand's Phuwiangosaurus.",
      },
    },
  },
  {
    id: "titanosaur",
    category: "groups",
    latin: "Titanosauria",
    wikipedia: "Titanosauria",
    seeAlso: "/size-compare",
    text: {
      th: {
        term: "ไททันโนซอร์",
        definition: "ซอโรพอดกลุ่มที่อยู่มาจนปลายยุคครีเทเชียส มีหลายชนิดที่ตัวใหญ่ที่สุดในโลก เช่น อาร์เจนติโนซอรัส และพาทาโกไททัน",
      },
      en: {
        term: "Titanosaur",
        definition: "Sauropods that lasted to the end of the Cretaceous, including several of the biggest dinosaurs, such as Argentinosaurus and Patagotitan.",
      },
    },
  },
  {
    id: "ceratopsian",
    category: "groups",
    latin: "Ceratopsia",
    wikipedia: "Ceratopsia",
    text: {
      th: {
        term: "เซราทอปเซียน",
        definition: "ไดโนเสาร์กินพืชที่มีจะงอยปากคล้ายนกแก้ว หลายชนิดมีแผงคอและเขา เช่น ไทรเซราทอปส์ ซิตตะโกซอรัสที่พบในไทยก็อยู่ในกลุ่มนี้",
      },
      en: {
        term: "Ceratopsian",
        definition: "Plant-eating dinosaurs with parrot-like beaks, many with frills and horns, such as Triceratops. Psittacosaurus, found in Thailand, belongs here too.",
      },
    },
  },
  {
    id: "ankylosaur",
    category: "groups",
    latin: "Ankylosauria",
    wikipedia: "Ankylosauria",
    text: {
      th: {
        term: "แองคิโลซอร์ (ไดโนเสาร์หุ้มเกราะ)",
        definition: "ไดโนเสาร์กินพืชตัวเตี้ย ลำตัวกว้าง หลังปกคลุมด้วยแผ่นกระดูกเกราะ บางชนิดมีตะบองกระดูกที่ปลายหาง",
      },
      en: {
        term: "Ankylosaur (armored dinosaur)",
        definition: "Low, wide plant-eating dinosaurs whose backs were covered in bony armor plates; some had a bony club at the end of the tail.",
      },
    },
  },
  {
    id: "hadrosaur",
    category: "groups",
    latin: "Hadrosauridae",
    wikipedia: "Hadrosauridae",
    text: {
      th: {
        term: "ฮาโดรซอร์ (ไดโนเสาร์ปากเป็ด)",
        definition: "ไดโนเสาร์กินพืชปลายยุคครีเทเชียสที่มีปากแบนกว้างคล้ายปากเป็ด และมีฟันเรียงกันหลายร้อยซี่ไว้บดพืช บางชนิดมีหงอนบนหัว เช่น พาราซอโรโลฟัส",
      },
      en: {
        term: "Hadrosaur (duck-billed dinosaur)",
        definition: "Late Cretaceous plant-eaters with broad, flat duck-like bills and hundreds of grinding teeth; some had head crests, such as Parasaurolophus.",
      },
    },
  },
  {
    id: "archosaur",
    category: "groups",
    latin: "Archosauria",
    wikipedia: "Archosaur",
    seeAlso: "/articles/not-dinosaurs",
    text: {
      th: {
        term: "อาร์โคซอร์",
        definition: "สัตว์เลื้อยคลานกลุ่มใหญ่ที่รวมจระเข้ เทอโรซอร์ และไดโนเสาร์ (รวมนก) ไว้ด้วยกัน จระเข้จึงเป็นญาติที่ใกล้ชิดไดโนเสาร์ที่สุดที่ยังมีชีวิตอยู่ รองจากนก",
      },
      en: {
        term: "Archosaur",
        definition: "The larger reptile group that includes crocodiles, pterosaurs and dinosaurs (birds included), which is why crocodiles are the closest living relatives of dinosaurs after birds.",
      },
    },
  },
  {
    id: "pterosaur",
    category: "groups",
    latin: "Pterosauria",
    wikipedia: "Pterosaur",
    seeAlso: "/articles/not-dinosaurs",
    text: {
      th: {
        term: "เทอโรซอร์",
        definition: "สัตว์เลื้อยคลานที่บินได้ด้วยปีกหนังที่ขึงบนนิ้วที่สี่ เป็นญาติใกล้ชิดของไดโนเสาร์ แต่ไม่ใช่ไดโนเสาร์",
      },
      en: {
        term: "Pterosaur",
        definition: "Flying reptiles with skin wings stretched along the fourth finger: close relatives of dinosaurs, but not dinosaurs.",
      },
    },
  },

  // ---- Fossils and how they're studied ----
  {
    id: "fossil",
    category: "fossils",
    latin: "Fossil",
    wikipedia: "Fossil",
    seeAlso: "/articles/fossil-not-bone",
    text: {
      th: {
        term: "ซากดึกดำบรรพ์ (ฟอสซิล)",
        definition: "ซากหรือร่องรอยของสิ่งมีชีวิตในอดีตที่เก็บรักษาไว้ในหิน ไม่ได้มีแค่กระดูก แต่รวมถึงฟัน ไข่ รอยผิวหนัง และรอยเท้าด้วย",
      },
      en: {
        term: "Fossil",
        definition: "The remains or traces of ancient life preserved in rock: not only bones, but also teeth, eggs, skin impressions and footprints.",
      },
    },
  },
  {
    id: "permineralization",
    category: "fossils",
    latin: "Permineralization",
    wikipedia: "Permineralization",
    seeAlso: "/articles/fossil-not-bone",
    text: {
      th: {
        term: "การแทรกซึมของแร่",
        definition: "กระบวนการที่น้ำใต้ดินพาแร่ธาตุเข้าไปตกผลึกในรูพรุนของกระดูกที่ถูกฝัง จนกระดูกแข็งและหนักแบบหิน เป็นวิธีที่กระดูกไดโนเสาร์ส่วนใหญ่กลายเป็นฟอสซิล",
      },
      en: {
        term: "Permineralization",
        definition: "Groundwater carries minerals into the pores of buried bone, where they crystallize until the bone is hard and heavy like stone. It is how most dinosaur bones became fossils.",
      },
    },
  },
  {
    id: "trace-fossil",
    category: "fossils",
    latin: "Trace fossil",
    wikipedia: "Trace_fossil",
    seeAlso: "/articles/dinosaur-footprints",
    text: {
      th: {
        term: "ซากดึกดำบรรพ์ร่องรอย",
        definition: "ร่องรอยที่สัตว์ทิ้งไว้ตอนยังมีชีวิต เช่น รอยเท้า รัง และมูล ซึ่งบอกพฤติกรรมของสัตว์ได้ ต่างจากกระดูกที่บอกแค่รูปร่าง",
      },
      en: {
        term: "Trace fossil",
        definition: "Traces an animal left while alive, such as footprints, nests and droppings, which record behavior rather than just body shape.",
      },
    },
  },
  {
    id: "coprolite",
    category: "fossils",
    latin: "Coprolite",
    wikipedia: "Coprolite",
    text: {
      th: {
        term: "มูลสัตว์กลายเป็นหิน",
        definition: "มูลของสัตว์ดึกดำบรรพ์ที่กลายเป็นฟอสซิล ช่วยให้รู้ว่าสัตว์ตัวนั้นกินอะไร",
      },
      en: {
        term: "Coprolite",
        definition: "Fossilized dung, which helps show what an ancient animal ate.",
      },
    },
  },
  {
    id: "formation",
    category: "fossils",
    latin: "Geological formation",
    wikipedia: "Geological_formation",
    seeAlso: "/articles/thai-dinosaurs",
    text: {
      th: {
        term: "หมวดหิน",
        definition: "ชั้นหินที่มีลักษณะและอายุเดียวกัน แผ่กว้างจนทำแผนที่ได้ เช่น หมวดหินเสาขัวในภาคอีสาน ไดโนเสาร์ที่พบในหมวดหินเดียวกันจึงอยู่ในพื้นที่และช่วงเวลาใกล้กัน",
      },
      en: {
        term: "Formation",
        definition: "A body of rock with the same character and age that is large enough to map, such as the Sao Khua Formation in northeastern Thailand. Dinosaurs from one formation lived in the same region at roughly the same time.",
      },
    },
  },
  {
    id: "radiometric-dating",
    category: "fossils",
    latin: "Radiometric dating",
    wikipedia: "Radiometric_dating",
    seeAlso: "/articles/dating-dinosaur-fossils",
    text: {
      th: {
        term: "การหาอายุด้วยไอโซโทปกัมมันตรังสี",
        definition: "การวัดอายุหินจากธาตุกัมมันตรังสีที่สลายตัวในอัตราคงที่ เช่น ยูเรเนียมในแร่เซอร์คอนของเถ้าภูเขาไฟ ใช้หาอายุชั้นหินที่อยู่เหนือหรือใต้ฟอสซิล",
      },
      en: {
        term: "Radiometric dating",
        definition: "Measuring the age of rock from radioactive elements that decay at a steady rate, such as uranium in zircon from volcanic ash, to date the layers above or below a fossil.",
      },
    },
  },
  {
    id: "paleontology",
    category: "fossils",
    latin: "Paleontology",
    wikipedia: "Paleontology",
    text: {
      th: {
        term: "บรรพชีวินวิทยา",
        definition: "วิชาที่ศึกษาสิ่งมีชีวิตในอดีตจากซากดึกดำบรรพ์ นักวิทยาศาสตร์ที่ศึกษาเรื่องนี้เรียกว่านักบรรพชีวินวิทยา",
      },
      en: {
        term: "Paleontology",
        definition: "The study of ancient life through fossils; the scientists who do it are paleontologists.",
      },
    },
  },
  {
    id: "paleoart",
    category: "fossils",
    latin: "Paleoart",
    wikipedia: "Paleoart",
    text: {
      th: {
        term: "ภาพวาดบรรพชีวิน",
        definition: "ภาพที่วาดสัตว์ดึกดำบรรพ์ให้มีชีวิตขึ้นมาใหม่ตามหลักฐานจากฟอสซิล ส่วนที่ไม่มีหลักฐาน เช่น สีผิว ผู้วาดต้องคาดเดาอย่างมีเหตุผล",
      },
      en: {
        term: "Paleoart",
        definition: "Art that brings extinct animals back to life following the fossil evidence; where there is none, such as skin color, the artist makes a reasoned guess.",
      },
    },
  },

  // ---- Geologic time ----
  {
    id: "mesozoic",
    category: "time",
    latin: "Mesozoic Era",
    wikipedia: "Mesozoic",
    seeAlso: "/timeline",
    text: {
      th: { term: "มหายุคมีโซโซอิก", definition: "ช่วงเวลา 251.9–66 ล้านปีก่อน แบ่งเป็นยุคไทรแอสซิก จูแรสซิก และครีเทเชียส มักเรียกว่ายุคของไดโนเสาร์" },
      en: { term: "Mesozoic Era", definition: "The span from 251.9 to 66 million years ago, divided into the Triassic, Jurassic and Cretaceous, often called the age of dinosaurs." },
    },
  },
  {
    id: "triassic",
    category: "time",
    latin: "Triassic",
    wikipedia: "Triassic",
    seeAlso: "/timeline",
    text: {
      th: { term: "ยุคไทรแอสซิก", definition: "251.9–201.4 ล้านปีก่อน ไดโนเสาร์รุ่นแรกปรากฏขึ้นในยุคนี้ ตอนนั้นแผ่นดินเกือบทั้งหมดยังรวมเป็นมหาทวีปแพนเจีย" },
      en: { term: "Triassic", definition: "251.9–201.4 million years ago. The first dinosaurs appeared, while nearly all land was still joined in the supercontinent Pangaea." },
    },
  },
  {
    id: "jurassic",
    category: "time",
    latin: "Jurassic",
    wikipedia: "Jurassic",
    seeAlso: "/timeline",
    text: {
      th: { term: "ยุคจูแรสซิก", definition: "201.4–145 ล้านปีก่อน ซอโรพอดขนาดยักษ์และสเตโกซอรัสรุ่งเรือง และนกรุ่นแรกเริ่มปรากฏ" },
      en: { term: "Jurassic", definition: "201.4–145 million years ago, when giant sauropods and Stegosaurus thrived and the first birds appeared." },
    },
  },
  {
    id: "cretaceous",
    category: "time",
    latin: "Cretaceous",
    wikipedia: "Cretaceous",
    seeAlso: "/timeline",
    text: {
      th: { term: "ยุคครีเทเชียส", definition: "145–66 ล้านปีก่อน ยุคสุดท้ายของไดโนเสาร์ที่ไม่ใช่นก ไดโนเสาร์ไทยที่ตั้งชื่อแล้วส่วนใหญ่มาจากยุคนี้ และพืชดอกเริ่มแพร่หลาย" },
      en: { term: "Cretaceous", definition: "145–66 million years ago, the last period of the non-avian dinosaurs. Most named Thai dinosaurs come from it, and flowering plants spread." },
    },
  },
  {
    id: "k-pg",
    category: "time",
    latin: "Cretaceous–Paleogene extinction",
    wikipedia: "Cretaceous%E2%80%93Paleogene_extinction_event",
    seeAlso: "/articles/dinosaur-extinction",
    text: {
      th: { term: "การสูญพันธุ์ครั้งใหญ่ K–Pg", definition: "เหตุการณ์เมื่อ 66 ล้านปีก่อนที่ดาวเคราะห์น้อยพุ่งชนโลก ทำให้สิ่งมีชีวิตราวสามในสี่สูญพันธุ์ รวมถึงไดโนเสาร์ที่ไม่ใช่นกทั้งหมด" },
      en: { term: "K–Pg extinction", definition: "The event 66 million years ago when an asteroid hit the Earth and about three-quarters of species died out, including all non-avian dinosaurs." },
    },
  },

  // ---- Scientific names ----
  {
    id: "genus",
    category: "names",
    latin: "Genus / species",
    wikipedia: "Genus",
    seeAlso: "/articles/naming-dinosaurs",
    text: {
      th: {
        term: "สกุลและชนิด",
        definition: "ชื่อวิทยาศาสตร์มีสองส่วน เช่น Tyrannosaurus rex ส่วนแรกคือชื่อสกุล (genus) ส่วนหลังคือชื่อชนิด (species) เว็บไซต์นี้นับไดโนเสาร์เป็นสกุล",
      },
      en: {
        term: "Genus and species",
        definition: "A scientific name has two parts, as in Tyrannosaurus rex: the genus, then the species. This site counts dinosaurs by genus.",
      },
    },
  },
  {
    id: "holotype",
    category: "names",
    latin: "Holotype",
    wikipedia: "Holotype",
    seeAlso: "/articles/naming-dinosaurs",
    text: {
      th: {
        term: "ตัวอย่างต้นแบบ (โฮโลไทป์)",
        definition: "ฟอสซิลชิ้นที่ใช้ตั้งชื่อสัตว์ชนิดใหม่ เก็บไว้ในพิพิธภัณฑ์หรือสถาบันวิจัย เพื่อให้นักวิทยาศาสตร์คนอื่นตรวจสอบได้ว่าชื่อนั้นหมายถึงสัตว์ตัวไหน",
      },
      en: {
        term: "Holotype",
        definition: "The fossil a new species is named from, kept in a museum or research institution so other scientists can check which animal the name refers to.",
      },
    },
  },
];
