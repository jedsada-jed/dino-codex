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
        debated: [
          "Did they really walk in herds? Parallel trackways may come from animals walking together, or from several animals passing at different times while a shoreline or riverbank funneled them in the same direction. Scientists look for more clues, such as even spacing between the trackways and prints of similar depth and sharpness, which suggest they were made close in time, but many sites remain unresolved.",
          "Speeds are estimates: the formulas have to guess hip height from footprint size and assume dinosaurs moved like living animals, so speeds worked out from tracks can be far off and should not be read as exact figures.",
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
        debated: [
          "In 2005 a team led by Mary Schweitzer reported flexible, vessel-like structures in a Tyrannosaurus leg bone, and later reported fragments of collagen protein. Supporters suggest iron from blood may have helped preserve the molecules for an unusually long time.",
          "Other scientists suggest the material could be a bacterial biofilm that formed later, or contamination from living organisms during digging and analysis. There is no consensus yet, and no one has found usable dinosaur DNA.",
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
        debated: [
          "Plot's bone has been lost, so identifying it as Megalosaurus rests only on the drawing in his book. That is enough to suggest a large meat-eating dinosaur, but not to confirm the genus.",
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
        debated: [
          "Nyasasaurus from Tanzania, about 243 million years old, may be the oldest known dinosaur, or it may be a close relative that does not count as a dinosaur, because only a few bones are known.",
          "Even for Eoraptor and Herrerasaurus, which have fairly good fossils, scientists disagree about where they sit on the dinosaur family tree. Eoraptor, for example, was first placed among early theropods, but some later studies put it closer to the long-necked dinosaurs.",
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
          "One key rule is \"priority\": if the same animal is named twice, the name published first is the one used. The famous case is Brontosaurus, which was long considered the same as Apatosaurus, so the name Brontosaurus was dropped for decades, until a 2015 study argued the two were different enough, and many scientists, though not all, went back to using Brontosaurus.",
        ],
        debated: [
          "The 2015 study by Emanuel Tschopp and colleagues compared a large number of skeletal features and concluded that Brontosaurus differs enough from Apatosaurus to be its own genus. Many scientists accept this, but some still treat Brontosaurus as a synonym of Apatosaurus, because the differences are small and there is no fixed rule for how different two animals must be to count as separate genera.",
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
  "thai-dinosaurs": {
    title: "How many Thai dinosaurs are there, and where were they found?",
    topic: "Thai dinosaurs",
    summary:
      "Since the first bone was found at Phu Wiang in 1976, Thailand has given the world 15 new dinosaur species, all from rocks in the Isan region. Here is which rock layer and which province each one came from.",
    sections: [
      {
        heading: "15 species in about 40 years",
        paragraphs: [
          "As of 2026, 15 dinosaur species new to science have been described from Thailand. The first was Siamosaurus suteethorni, a spinosaur named in 1986, and the two most recent are Nagatitan and Uragasaurus, both announced in 2026.",
          "Some are known from much more material than others. Siamosaurus is known only from teeth, so some scientists doubt there is enough to keep it as its own genus, while Phuwiangosaurus is known from bones of many individuals and its body shape is fairly well understood.",
          "The steady stream of finds comes from decades of fieldwork by Thailand's Department of Mineral Resources and several Thai universities, together with researchers from abroad. Many fossils take years of study before they can be published as a new species.",
        ],
        debated: [
          "The count of 15 is based on formally published names, but not every name is accepted by all scientists. Siamosaurus is known only from teeth, and one study argued that Ratchasimasaurus is a nomen dubium, a name that cannot be pinned to a distinct species, because its distinguishing features are common across its group.",
          "Psittacosaurus sattayaraki was named from a worn jaw. In 2000 Paul Sereno questioned whether it is really a Psittacosaurus. The original authors later published new images of its teeth to support it, but some still regard it as doubtful, so some sources give a different count of Thai dinosaurs.",
        ],
      },
      {
        heading: "Why Isan?",
        paragraphs: [
          "Most of Isan sits on the Khorat Plateau, which is built on a very thick pile of sedimentary rock called the Khorat Group. These rocks formed from sand and mud laid down by rivers and lakes during the Jurassic and Cretaceous. In settings like these, dead animals were buried quickly, which is ideal for fossils to form.",
          "Rock units with their own character and age are called formations. Named Thai dinosaurs come from three formations of the Khorat Group and from the Nam Phong Formation beneath it. The figure below puts the youngest layer at the top.",
        ],
      },
      {
        heading: "Dinosaurs layer by layer",
        paragraphs: [
          "The Nam Phong Formation is the oldest in the figure. It produced Isanosaurus, an early long-necked dinosaur from Chaiyaphum province, which zircon dating in 2026 placed in the Early Jurassic.",
          "The Phu Kradung Formation is usually estimated at about 150 million years old, from the Late Jurassic. The Phu Noi site in Kalasin province produced Minimocursor, a small two-legged plant-eater, and Uragasaurus, the first mamenchisaurid long-necked dinosaur named from Southeast Asia.",
          "The Sao Khua Formation, about 125 million years old and from the Early Cretaceous, has produced the most Thai dinosaurs, especially at Phu Wiang in Khon Kaen province: Phuwiangosaurus, Siamotyrannus, Phuwiangvenator and Kinnareemimus. Vayuraptor comes from Nong Bua Lamphu province, and the teeth of Siamosaurus were first found in this formation too.",
          "The Khok Kruat Formation is the youngest, about 120 to 100 million years old. Nakhon Ratchasima province produced Siamodon, Ratchasimasaurus and Sirindhorna, plant-eating iguanodonts related to duck-billed dinosaurs, as well as the large predator Siamraptor. Chaiyaphum province produced Psittacosaurus sattayaraki and Nagatitan, a sauropod estimated at about 27 meters long and the largest dinosaur yet found in Thailand and Southeast Asia.",
        ],
        debated: [
          "The age of the Phu Kradung Formation is still debated. Vertebrate fossils point to the Late Jurassic, but some pollen and spore (palynology) data suggest its upper part may be Early Cretaceous, so \"about 150 million years\" is an estimate.",
          "Nagatitan's size (about 27 meters long and 27 tonnes) is estimated from a partial skeleton: some vertebrae, part of the hips and parts of the limbs. Its true size could be larger or smaller if more bones are found.",
        ],
      },
      {
        heading: "Where to see Thai dinosaurs",
        paragraphs: [
          "The Sirindhorn Museum in Sahatsakhan district, Kalasin province, is a large dinosaur museum that displays many Thai species. It stands near the Phu Kum Khao dig site, where bones of many long-necked dinosaurs were found.",
          "In Khon Kaen province there is the Phu Wiang Dinosaur Museum and dig sites open to visitors in Phu Wiang National Park. To learn more about each Thai dinosaur, see the Thai dinosaurs page on this site.",
        ],
      },
    ],
  },
  "birds-are-dinosaurs": {
    title: "Are birds really dinosaurs?",
    topic: "Evolution",
    summary:
      "Scientists say dinosaurs are not all extinct, because the birds around us are dinosaurs too. Here is the evidence behind that conclusion.",
    sections: [
      {
        heading: "Birds belong to the dinosaur family tree",
        paragraphs: [
          "Biologists group living things by evolutionary history: a group has to include a common ancestor and all of its descendants. Since the evidence shows that birds descend from theropods, the meat-eating dinosaurs, birds count as dinosaurs, in the same way that humans count as mammals.",
          "That is why scientists often say \"non-avian dinosaurs\" for the dinosaurs that died out 66 million years ago. In terms of family history, Tyrannosaurus is a closer relative of a chicken than of Triceratops or Stegosaurus.",
        ],
        debated: [
          "That birds are dinosaurs is very widely accepted, but the base of the family tree is still debated. Dinosaurs are usually split into saurischians (theropods and long-necked dinosaurs) and ornithischians (such as Triceratops), as in the figure. A 2017 study proposed that theropods may be closer to ornithischians than to long-necked dinosaurs. If so, the base of the tree in the figure would change, but birds would still be theropods.",
        ],
      },
      {
        heading: "From Archaeopteryx to Deinonychus",
        paragraphs: [
          "In 1861 a fossil of Archaeopteryx was found in Germany. It had wings and feathers like a bird, but also teeth, clawed fingers and a long bony tail. A few years later Thomas Huxley pointed out how similar the skeletons of birds and small meat-eating dinosaurs are.",
          "The idea then went quiet for decades, until in 1969 John Ostrom described Deinonychus, a fast, agile predator, and showed that it shared many features with birds. His work brought scientists back to the question in earnest.",
        ],
      },
      {
        heading: "Evidence from bones and behavior",
        paragraphs: [
          "The V-shaped fused collarbone, or wishbone (furcula), that we see in chickens is found in many theropods, including Tyrannosaurus and Velociraptor.",
          "Theropods also had hollow bones with air spaces linked to air sacs, like the breathing system of birds, and many had a half-moon-shaped wrist bone (semilunate carpal) that let them fold their hands against the body, much as birds fold their wings.",
          "Some fossils even record behavior. Citipati from Mongolia died sitting on its nest with its arms spread over the eggs, the same pose birds use to brood today.",
        ],
      },
      {
        heading: "Dinosaurs had feathers",
        paragraphs: [
          "In 1996 scientists described Sinosauropteryx from Liaoning, China, the first non-avian dinosaur found with traces of a coat of filament-like feathers. Many more feathered dinosaurs followed, such as Microraptor, with long flight-style feathers on both arms and legs, and Yutyrannus, a feathered relative of Tyrannosaurus about 9 meters long.",
          "Even Velociraptor, whose feathers have not been found directly, has small bumps on its forearm bone (quill knobs) where feathers attach in modern birds. An accurate Velociraptor should have feathers, not the bare scaly skin seen in the movies.",
          "There are more than ten thousand species of birds alive today. Dinosaurs did not vanish completely: they still fly and walk all around us.",
        ],
        debated: [
          "Did all dinosaurs have feathers? Filament-like structures have been found in some ornithischians, such as Kulindadromeus, and in pterosaurs, so some teams suggest the ancestor of all dinosaurs already had simple feathers. Other studies argue some of these structures may be scales distorted during fossilization, and many large dinosaur groups are known only from scaly skin impressions.",
          "Quill knobs show that Velociraptor had long feathers on its arms. Feathers elsewhere on the body, and their color and length, are inferred from close relatives with preserved feathers, not from Velociraptor fossils themselves.",
        ],
      },
    ],
  },
  "dinosaur-extinction": {
    title: "The day the dinosaurs disappeared",
    topic: "Extinction",
    summary:
      "66 million years ago an asteroid about 10 kilometers wide hit the Earth. How do scientists know, what happened after the impact, and why did some animals survive?",
    sections: [
      {
        heading: "A clue in a thin layer of clay",
        paragraphs: [
          "In 1980 a team led by physicist Luis Alvarez and his son Walter Alvarez, a geologist, studied a thin layer of clay between Cretaceous rock and the rock above it near Gubbio, Italy, and found unusually high levels of iridium. This element is very rare at the Earth's surface but more common in meteorites, so they proposed that the Earth had been hit by an object from space about 10 kilometers across.",
          "The same iridium layer was later found in many places around the world, along with \"shocked quartz\", which only forms under enormous pressure, and tiny glass beads made from molten rock that was thrown into the sky and cooled.",
        ],
      },
      {
        heading: "The Chicxulub crater",
        paragraphs: [
          "The big question was where the crater was. The answer came in the early 1990s, when scientists confirmed that a buried ring structure about 200 kilometers wide under the Yucatán Peninsula in Mexico is an impact crater. It is named after Chicxulub, a community near its center.",
          "Dating shows the crater formed about 66 million years ago, at the same time non-avian dinosaur fossils disappear from rock layers all over the world.",
        ],
      },
      {
        heading: "After the impact",
        paragraphs: [
          "Within minutes to hours, the impact caused huge earthquakes, giant tsunamis and hot debris falling back all over the planet, which may have started wildfires in many areas.",
          "The worst came afterward. Huge amounts of dust, soot and sulfur droplets spread through the atmosphere, blocking sunlight so the Earth was dark and cold for years. Plants and plankton could not photosynthesize, and food chains on land and in the sea collapsed. About three-quarters of all species died out, including the non-avian dinosaurs, pterosaurs, large marine reptiles such as mosasaurs, and ammonites.",
          "At about the same time, enormous volcanic eruptions in India, called the Deccan Traps, went on for hundreds of thousands of years and released gases that changed the climate. Scientists still debate how much the volcanoes contributed, but most agree the asteroid impact was the main cause.",
        ],
        debated: [
          "Were dinosaurs already declining? Some studies suggest dinosaur diversity fell for millions of years before the impact. Many others argue that this pattern comes from patchy, sparse fossils from that time, and that dinosaurs were still doing well right up to the impact.",
          "How widespread were the fires? Some teams propose that heat from falling debris set fires around the world, but the amount of charcoal measured in the rock at many sites is lower than expected, so the scale of the fires is still uncertain.",
        ],
      },
      {
        heading: "Who survived",
        paragraphs: [
          "Survivors were usually small, could eat many kinds of food, or had places to shelter, such as small burrowing mammals, crocodiles, turtles, frogs, snakes and lizards. Freshwater animals had an advantage, because food chains in water rely on dead plant and animal matter that builds up there, not directly on living plants.",
          "Research suggests the birds that survived were probably ground-dwelling seed eaters, since seeds can last a long time in the soil without sunlight. These birds are the ancestors of every bird alive today. And once the large dinosaurs were gone, mammals had the chance to evolve into many new forms, including humans.",
          "Nature recovered faster than many people expect. Fossils from Corral Bluffs in Colorado, USA, where the rock layers record the first million years after the impact without a break, show that ferns dominated the land for the first few thousand years. About 100,000 years after the impact, the variety of plants and mammals was close to what it had been before, and by about 700,000 years later there were mammals weighing around 45 kilograms, bigger than any mammal known from the age of dinosaurs.",
          "In Thailand, every named dinosaur comes from rocks tens of millions of years older than this event, so we do not yet know what dinosaurs lived in what is now Thailand on that day.",
        ],
        debated: [
          "The idea that the surviving birds lived on the ground comes from a 2018 study that combined fossil pollen showing forests were destroyed on a large scale with an analysis of the family tree of living birds. Bird fossils from that time are very rare, so this conclusion could change with new evidence.",
        ],
      },
    ],
  },
  "not-dinosaurs": {
    title: "Animals people think are dinosaurs, but aren't",
    topic: "Not dinosaurs",
    summary:
      "Flying pterosaurs, mosasaurs in the sea, sail-backed Dimetrodon and Megalodon are often lumped in with dinosaurs, but none of them is one. So where is the line?",
    sections: [
      {
        heading: "What exactly is a dinosaur?",
        paragraphs: [
          "\"Dinosaur\" doesn't mean every big prehistoric animal. It is one group of reptiles that all come from a single ancestor. Scientists define dinosaurs as the most recent common ancestor of Triceratops and birds, plus all of its descendants. Under this definition, birds are dinosaurs too.",
          "What sets dinosaurs apart from other reptiles is legs held straight under the body, not sprawled out to the side like a lizard's or a crocodile's, and a hip socket that is an open hole. Every non-avian dinosaur lived on land. None lived mainly in the sea or flew on skin wings.",
          "The earliest known dinosaurs are about 230 million years old, from the Late Triassic. Animals from before then, or from after the non-avian dinosaurs died out 66 million years ago, are definitely not dinosaurs, birds aside.",
        ],
        debated: [
          "Some groups near the base of the dinosaur tree, such as the silesaurids, are still argued over. Some studies place them among the earliest plant-eating ornithischian dinosaurs, while many others keep them just outside the dinosaurs.",
        ],
      },
      {
        heading: "Pterosaurs: the flying cousins",
        paragraphs: [
          "Pterosaurs such as Pteranodon and Quetzalcoatlus were the first vertebrates to truly fly. Their wings were skin stretched along a very long fourth finger, unlike a bird's wing, which is feathers on the arm.",
          "Pterosaurs are close relatives of dinosaurs, on the same branch of the family tree, but they split off before dinosaurs appeared: cousins rather than siblings. Flying birds today don't come from pterosaurs but from small meat-eating dinosaurs.",
        ],
      },
      {
        heading: "Reptiles of the sea",
        paragraphs: [
          "Mosasaurs, the big ocean predators of the Late Cretaceous, are relatives of today's lizards and snakes, not dinosaurs, even though they lived at the same time and died out in the same extinction.",
          "Long-necked, four-flippered plesiosaurs and dolphin-shaped ichthyosaurs are also marine reptiles from lineages separate from dinosaurs. Their legs evolved into flippers for swimming.",
        ],
        debated: [
          "Exactly where plesiosaurs and ichthyosaurs sit on the reptile family tree is still debated, but scientists agree that neither group is inside the dinosaurs.",
        ],
      },
      {
        heading: "Dimetrodon: closer to us",
        paragraphs: [
          "Sail-backed Dimetrodon often turns up in sets of toy dinosaurs, but it lived in the Permian, about 294–271 million years ago, and died out some 40 million years before the first dinosaur.",
          "Dimetrodon was a synapsid, part of the same lineage that gave rise to mammals. In other words, Dimetrodon is more closely related to humans than to dinosaurs.",
        ],
      },
      {
        heading: "Megalodon and mammoths",
        paragraphs: [
          "Megalodon was a giant shark, not even a reptile. It lived about 23 to 3.6 million years ago, more than 40 million years after the non-avian dinosaurs were gone.",
          "Mammoths and saber-toothed cats were Ice Age mammals, much closer to our time than to the age of dinosaurs. Early humans lived alongside mammoths and hunted them, but no human has ever seen a non-avian dinosaur.",
        ],
      },
      {
        heading: "The closest living relatives",
        paragraphs: [
          "Apart from birds, which are dinosaurs themselves, the closest living relatives of dinosaurs are crocodiles. Both belong to a larger group called archosaurs, but the crocodile line split off before both dinosaurs and pterosaurs appeared.",
          "Lizards, snakes and turtles are reptiles too, but more distant relatives still. See the family tree above.",
        ],
      },
    ],
  },
};
