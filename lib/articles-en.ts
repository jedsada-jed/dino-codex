import type { ArticleBody } from "@/lib/articles";

/** English versions of the articles in lib/articles.ts, keyed by slug. */
export const ARTICLES_EN: Record<string, ArticleBody> = {
  "dinosaur-footprints": {
    title: "How dinosaur footprints form",
    topic: "Footprints",
    summary:
      "How did prints that dinosaurs left in mud more than a hundred million years ago turn to stone, and what can footprints tell us that bones cannot?",
    sections: [
      {
        heading: "From mud to rock",
        paragraphs: [
          "Most dinosaur footprints formed on ground that was damp but not too soft, such as riverbanks, lake shores or beaches. If the mud was too runny, the print collapsed; if it was too dry and hard, the foot left nothing behind. Sharp prints only form when conditions are \"just right\".",
          "After a dinosaur walked by, the print had to dry in the sun until its surface was firm, then be gently covered by a new layer of sediment, such as sand or mud washed in by water, without wiping it out. Layer after layer then built up on top, and their weight and the minerals seeping through slowly turned the sediment into rock over millions of years.",
          "When the Earth's crust was later uplifted and erosion stripped away the rock above, the prints hidden between the layers came back into view.",
        ],
      },
      {
        heading: "True tracks, undertracks and casts",
        paragraphs: [
          "Not every print on a rock surface is the original track. Sometimes it is an \"undertrack\", where the pressure of the foot was passed down into the layer below. Undertracks are usually larger and blurrier than true tracks.",
          "Sometimes the sediment that covered a print filled it completely, forming a \"natural cast\" that stands up from the rock surface like an upside-down mold of the dinosaur's foot.",
        ],
      },
      {
        heading: "What footprints tell us",
        paragraphs: [
          "Footprints are \"trace fossils\" that record the behavior of living animals, unlike bones, which only show an animal's shape after it died.",
          "From the length of a footprint and the distance between steps, scientists can estimate hip height and walking speed using formulas developed from living animals. Several parallel trackways suggest that some dinosaurs may have walked in groups, and the near absence of tail-drag marks confirms that dinosaurs held their tails off the ground.",
          "The catch is that we usually cannot tell exactly which dinosaur genus made a track. Scientists therefore name footprints separately from dinosaurs; these names are called \"ichnotaxa\".",
        ],
      },
      {
        heading: "Dinosaur footprints in Thailand",
        paragraphs: [
          "The sandstones of the Khorat Group in northeastern Thailand hold many footprint sites, with three-toed tracks of meat-eating dinosaurs as well as tracks of plant-eaters. Several are open to visitors in national parks and wildlife sanctuaries, such as Phu Luang in Loei province.",
          "If you visit, don't step on the prints or pour water on them for photos. Sandstone weathers easily, and tracks that have lasted more than a hundred million years can be damaged within a few years.",
        ],
      },
    ],
  },
  "fossil-not-bone": {
    title: "Why we say \"dinosaur fossils\", not \"dinosaur bones\"",
    topic: "Fossilization",
    summary:
      "Most of what you see in a museum is no longer bone at all, but rock in the shape of bone. Here is how bone turns to stone.",
    sections: [
      {
        heading: "What is a fossil?",
        paragraphs: [
          "The word fossil comes from the Latin fossilis, meaning \"dug up\". It refers to the remains or traces of ancient life preserved in rock.",
          "Fossils are not only bones. They include teeth, eggs, skin impressions, feather impressions, footprints and even fossilized dung (coprolites).",
        ],
      },
      {
        heading: "How bone turns to stone",
        paragraphs: [
          "Living bone is full of tiny pores. When a dinosaur carcass was quickly buried in sediment, groundwater carrying dissolved minerals such as silica, calcite or iron minerals seeped into those pores and crystallized. This process is called permineralization.",
          "Over millions of years, minerals may also gradually replace the original bone material (replacement), until what remains has the same shape, size and sometimes even the microscopic structure of the bone, but is made of rock. That is why fossils are much heavier than real bone.",
        ],
      },
      {
        heading: "Why fossils aren't bone-colored",
        paragraphs: [
          "A fossil's color comes from the minerals that replaced the bone, not from the bone itself. Fossils from iron-rich rock are often reddish-brown or black, while fossils from other sites may be gray or cream.",
          "Many skeletons on display in museums are casts made from real fossils, because the real fossils are too heavy and too valuable to mount as a whole skeleton.",
        ],
      },
      {
        heading: "Is any original bone left?",
        paragraphs: [
          "In a few cases, scientists have reported traces of proteins or soft-tissue-like structures in dinosaur fossils, but these finds are still debated and very rare. In general, what is dug up is rock that records the shape of a bone, not fresh bone, so we call it a \"fossil\" rather than a \"bone\".",
        ],
      },
    ],
  },
  "dating-dinosaur-fossils": {
    title: "How do we know how old a dinosaur is?",
    topic: "Dating",
    summary:
      "Numbers like \"66 million years ago\" aren't guesses. They come from reading the order of rock layers and from natural clocks in radioactive minerals.",
    sections: [
      {
        heading: "We don't date the fossil itself",
        paragraphs: [
          "Most dinosaur fossils cannot be dated directly. Instead, scientists date the rock layers the fossil is buried in, using two methods together: relative dating and absolute dating.",
        ],
      },
      {
        heading: "Relative dating: reading the layers",
        paragraphs: [
          "The basic rule is the \"law of superposition\": unless the layers have been overturned, lower layers formed before the layers above them, so fossils in lower layers are older than fossils higher up.",
          "Scientists also use \"index fossils\", such as ammonites or pollen and spores: organisms that were widespread but lived only for a short time. Finding the same index fossil in two places shows the rocks are of similar age. This tells us what is older than what, but not yet a number of years.",
        ],
      },
      {
        heading: "Absolute dating: radioactive clocks",
        paragraphs: [
          "Some minerals, such as zircon in volcanic ash, contain uranium that decays into lead at a constant rate. When the mineral crystallizes, the clock starts ticking. Measuring the ratio of uranium to lead (the U–Pb method) tells how many millions of years ago the mineral formed.",
          "If volcanic ash layers are found both above and below the layer with the fossil, they give an \"age bracket\": the dinosaur lived somewhere between those two dates.",
          "The well-known carbon-14 method cannot date dinosaurs. It only works for things up to about 50,000 years old, while dinosaurs are tens to hundreds of millions of years old.",
        ],
      },
      {
        heading: "An example from Thailand",
        paragraphs: [
          "Isanosaurus, a long-necked dinosaur from northeastern Thailand, was once thought to have lived in the Late Triassic, which would have made it one of the oldest sauropods in the world. In 2026, U–Pb dating of zircon showed that the rocks containing Isanosaurus formed in the Early Jurassic, a good example of how more precise dating can change what we thought we knew.",
        ],
      },
    ],
  },
  "first-dinosaur-fossil": {
    title: "The first dinosaur fossils (in the world and in Thailand)",
    topic: "History",
    summary:
      "Before the word \"dinosaur\" existed, people thought giant bones belonged to giant humans. A look back at the discoveries that changed how we see the world.",
    sections: [
      {
        heading: "Bones of \"giants\"",
        paragraphs: [
          "In 1676 the English naturalist Robert Plot described the end of a huge thighbone found in England. He thought it might belong to an elephant or a giant human. Today it is believed to have come from Megalosaurus, but the fossil itself has been lost; only a drawing in his book remains.",
        ],
      },
      {
        heading: "The first dinosaur to be named",
        paragraphs: [
          "In 1824 William Buckland named Megalosaurus from a jaw and bones found in England, the first non-avian dinosaur to receive a scientific name.",
          "A year later, in 1825, Gideon Mantell named Iguanodon from teeth that looked like an iguana's but were much larger.",
        ],
      },
      {
        heading: "Where the word \"dinosaur\" comes from",
        paragraphs: [
          "In 1842 the English anatomist Richard Owen noticed that Megalosaurus, Iguanodon and Hylaeosaurus shared features that set them apart from other reptiles. He named the new group Dinosauria, from the Greek deinos (fearfully great) and sauros (lizard).",
        ],
      },
      {
        heading: "The first dinosaurs that ever lived",
        paragraphs: [
          "Which dinosaur was the oldest keeps changing as new fossils are found. Well-known early dinosaurs such as Eoraptor and Herrerasaurus from Argentina are about 230 million years old, from the Late Triassic, and there may be even older relatives.",
        ],
      },
      {
        heading: "Thailand's first dinosaur fossil",
        paragraphs: [
          "In 1976 Sudham Yaemniyom, a geologist with Thailand's Department of Mineral Resources, found part of the thighbone of a long-necked dinosaur at Phu Wiang in Khon Kaen province. It was the first dinosaur fossil found in Thailand and the start of the exploration that has since produced more than ten named Thai dinosaur genera.",
          "He is also honored in the name of a Thai dinosaur: Phuwiangvenator yaemniyomi.",
        ],
      },
    ],
  },
  "naming-dinosaurs": {
    title: "How dinosaurs get their names",
    topic: "Naming",
    summary:
      "Why are dinosaur names so long and hard to say, who chooses them, and where do Thai names like Kinnareemimus and Nagatitan come from?",
    sections: [
      {
        heading: "Scientific names have two parts",
        paragraphs: [
          "Every dinosaur species has a scientific name following the binomial system laid down by Carl Linnaeus. It has a genus name, starting with a capital letter, and a species name, all lowercase, both written in italics, as in Tyrannosaurus rex.",
          "In everyday use we usually say only the genus name, such as \"Tyrannosaurus\", which is also what this site uses.",
        ],
      },
      {
        heading: "Who names a dinosaur?",
        paragraphs: [
          "The scientists who first describe a new dinosaur in a scientific journal name it. They must designate a \"type specimen\" (holotype), a fossil kept in a museum or institution where others can examine it, and follow the rules of the International Code of Zoological Nomenclature (ICZN).",
          "One key rule is \"priority\": if the same animal is named twice, the name published first is the one used. The famous case is Brontosaurus, which was long considered the same as Apatosaurus, so the name Brontosaurus was dropped for decades, until a 2015 study argued the two were different enough for Brontosaurus to be used again.",
        ],
      },
      {
        heading: "Common word roots",
        paragraphs: [
          "Most dinosaur names come from Greek and Latin, such as -saurus (lizard or reptile), -raptor (thief or seizer), -ceratops (horned face), -mimus (mimic), -titan (giant), -venator (hunter) and -don or -odon (tooth).",
          "A name may describe a distinctive feature (Triceratops means \"three-horned face\"), the place where the fossil was found, or honor a person.",
        ],
      },
      {
        heading: "Thai dinosaur names",
        paragraphs: [
          "Many Thai dinosaurs have names that reflect Thai culture and places. For example, Phuwiangosaurus sirindhornae is named after Phu Wiang and in honor of Her Royal Highness Princess Maha Chakri Sirindhorn.",
          "Kinnareemimus khonkaenensis comes from the kinnaree, a half-human, half-bird being from Thai literature. Ratchasimasaurus suranareae honors Thao Suranari, and Nagatitan chaiyaphumensis comes from the naga of Thai belief and from Chaiyaphum province, where the fossils were found.",
        ],
      },
    ],
  },
};
