/** The Working Folk: hands, trades and the muscle of Manchester. */
import { find, hide, motiveChain, nightcapChain, offerChain, secretOf, story, swap } from "./build";
import type { Character } from "./types";

export const working: Character[] = [
  {
    id: "josh",
    realNames: ["Josh Kaminsky", "Joshua Kaminsky", "Josh"],
    circle: "working",
    name: "Joshua “Chimney Sweep” Kaminsky",
    occupation: "Chimney sweep",
    publicBio: "Knows every roof in Manchester and every secret that ever went up a flue. Nobody looks at a sweep, which suits him.",
    background: {
      history:
        "Your family came from Poland to work the mills; you took the brush instead. A sweep sees every room's chimney and every room's fire, and notices what people burn.",
      people: [
        "Tiffany Liu: your windows-and-roofs partner; you fix what she makes.",
        "Arjun Bhat: a fellow mill family; you have known him since you were both small.",
        "Adam Ouldsfiya: you sweep his shop's chimney and he sweeps your debts.",
      ],
      wardrobe: "A sweep's soot-streaked coat, a top hat and a brush over one shoulder. It is a Friday night, so you feel the Sabbath keenly.",
    },
    secrets: [
      { text: "Your horse, Pumpernickel, is the only horse in Manchester who has been to the opera.", share: "secret" },
      { text: "If anyone asks you for a Yiddish word to shout at an umpire, give them “shmendrik.” It means a fool, and it is the funniest word you know.", share: "free" },
    ],
    smallSecret: { text: "Your horse, Pumpernickel, is the only horse in Manchester who has been to the opera.", key: ["pumpernickel"], confidant: "adam" },
    startingCash: 80,
    carries: ["brass-brush"],
    objectives: [
      find("josh-1", "candle-stub"),
      secretOf("josh-2", "adam", "theodor", ["pigeon"]),
      swap("josh-3", "tiffany", "brass-brush", "glass-charm"),
      story("josh-4", "A name on a car", "A hitman bought a car, and a gun, from guests here. Learn his name.", "The hitman's name", "jack", ["adam"], [["quill"]]),
      story("josh-5", "Who is K.K.?", "A page you swept out of a flue says “K.” Learn who K. Kessler was, from people who knew him.", "His name", "rebecca", ["anthony", "tiffany"], [["kessler"]]),
    ],
  },
  {
    id: "arjun",
    realNames: ["Arjun Bhat", "Arjun"],
    circle: "working",
    name: "Arjun “The Bat” Bhat",
    occupation: "Slugger, Manchester Textiles baseball club",
    publicBio: "Hit .412 last season and wants a word with anyone who mentions the Babe. Brought the bat to the party for “sentimental reasons.”",
    background: {
      history:
        "You grew up in a mill family and hauled bricks as a boy. You were offered $500 to strike out in the 1925 mill championship and never quite decided whether the money was taken.",
      people: [
        "Josh Kaminsky: a boyhood friend and the only person who laughs at your jokes.",
        "Mihir Nagarkatti: the bookmaker whose offer you took, or did not.",
        "Adam Ouldsfiya: sold you your first glove and has opinions about your swing.",
      ],
      wardrobe: "A Textiles team jersey, a cap, and a bat you insist is for sentimental reasons.",
    },
    secrets: [{ text: "You struck out on purpose on August 14 for $500.", share: "secret" }],
    smallSecret: { text: "You struck out on purpose on August 14 for $500.", key: ["august"], confidant: "josh" },
    startingCash: 80,
    carries: ["baseball"],
    habit: "You wet a finger and hold it up to check the wind, a batter's habit. Do it whenever you are thinking.",
    objectives: [
      find("arjun-1", "spare-button"),
      secretOf("arjun-2", "rebecca", "tim", ["tea"]),
      swap("arjun-3", "adam", "baseball", "cartridge-box"),
      story("arjun-4", "How many were there?", "Seventeen strangers died in accidents in one county. Learn the count from someone who counted.", "The number", "theodor", ["emre"], [["seventeen", "17"]]),
      story("arjun-5", "A word for the umpire", "You want a Yiddish word to shout at an umpire. Josh knows one. Get it, and say it.", "The word", "josh", ["adam"], [["shmendrik"]]),
    ],
  },
  {
    id: "adam",
    realNames: ["Adam Ouldsfiya", "Adam"],
    circle: "working",
    name: "Adam “Holds Fire” Ouldsfiya",
    occupation: "Gunsmith and hardware, West Side",
    publicBio: "Makes the finest revolvers in Hillsborough County and has famously never fired one. His motto: a good gun, like a good argument, works best when it stays holstered.",
    background: {
      history:
        "You sell guns, locks and nails. You keep a register of every poison and every cartridge you have ever sold, and you have a very long memory for who bought what.",
      people: [
        "Theodor Farag: the Sheriff whose revolver you built and who has never loaded it.",
        "Josh Kaminsky: sweeps your chimney; taught you a Yiddish word you are proud of.",
        "Arjun Bhat: bought his bat from your hardware counter.",
      ],
      wardrobe: "A gunsmith's leather apron over a good shirt, a monocle, and a half-mask with a brass finish.",
    },
    secrets: [
      { text: "You fired a gun once, at a pigeon, and missed.", share: "secret" },
      { text: "You picked up one Yiddish word from Josh, “shmendrik,” and use it more than you should.", share: "free" },
    ],
    smallSecret: { text: "You fired a gun once, at a pigeon, and missed.", key: ["pigeon"], confidant: "theodor" },
    startingCash: 100,
    carries: ["cartridge-box"],
    objectives: [
      find("adam-1", "brass-key"),
      secretOf("adam-2", "ananya", "leon", ["hatbox"]),
      swap("adam-3", "arjun", "cartridge-box", "baseball"),
      story("adam-4", "What the House takes", "The House sells something that is on no menu. Learn what it accepts in place of cash.", "What it accepts", "angelos", ["tim", "mihir"], [["marker", "markers"]]),
      story("adam-5", "How many were there?", "Seventeen strangers died in accidents in one county. Learn the count from someone who counted.", "The number", "emre", ["theodor"], [["17", "seventeen"]]),
    ],
  },
  {
    id: "tiffany",
    realNames: ["Tiffany Liu", "Tiffany"],
    circle: "working",
    name: "Tiffany Liu, of the Lamps",
    occupation: "Stained-glass artisan",
    publicBio: "Makes the lamps that light half the Manchester drawing rooms and the windows of most of its churches. Reads a monogram under a loupe faster than a clerk reads a ledger.",
    background: {
      history:
        "You have your own glass studio and a loupe you never leave behind. Your lamps hang in the Sheriff's office and your windows hang in the churches, and you have cut a brass plate or two for the Veil itself.",
      people: [
        "Jack Hudson: has been waiting a year for a showroom lamp, and will wait longer.",
        "Josh Kaminsky: sweeps what your windows let in.",
        "Theodor Farag: the Sheriff's office windows are yours.",
      ],
      wardrobe: "A glassworker's apron, a loupe on a ribbon, and a mask of stained-glass shards.",
    },
    secrets: [{ text: "Every window you make hides a tiny frog in the glass as your signature.", share: "secret" }],
    smallSecret: { text: "Every window you make hides a tiny frog in the glass as your signature.", key: ["frog"], confidant: "josh" },
    startingCash: 100,
    carries: ["glass-charm"],
    objectives: [
      find("tiffany-1", "perfume-bottle"),
      secretOf("tiffany-2", "erika", "rebecca", ["organ"]),
      swap("tiffany-3", "josh", "glass-charm", "brass-brush"),
      hide("tiffany-4", "jack"),
      story("tiffany-5", "The thing behind the wall", "A wall in the Merrimack Room hides something. Learn what, from those who built or swept it.", "What it hides", "adam", ["josh"], [["vault", "safe"]]),
    ],
  },
  {
    id: "diwakar",
    realNames: ["Diwakar Sandhu", "Diwakar"],
    circle: "working",
    name: "Diwakar “Sandbag” Sandhu",
    occupation: "Prizefighter",
    publicBio: "Undefeated in every fight he was supposed to win and mysteriously knocked out in every one with real money on it.",
    background: {
      history:
        "You fight the river-town circuit and nobody has ever seen you in the Manchester ring. You are a man who loses in the third round exactly when the odds say you should.",
      people: [
        "Mihir Nagarkatti: the bookmaker who keeps your fights, and does not ask why.",
        "Angelos Boules: studies you at every table.",
        "Arjun Bhat: a fellow sportsman who trades stories and bruises.",
      ],
      wardrobe: "A boxer's robe over a dinner jacket, taped knuckles, and a mask that is not meant to hide a broken nose.",
    },
    secrets: [{ text: "You've thrown eleven fights, and the next one you plan to win for real.", share: "secret" }],
    smallSecret: { text: "You've thrown eleven fights, and the next one you plan to win for real.", key: ["eleven"], confidant: "mihir" },
    startingCash: 100,
    carries: [],
    survivor: {
      veilName: "Bertrand “Barty” Crane",
      veilTitle: "The Teller",
      markerNo: 18,
      markerCode: "JCPP2",
      tell: "You count invisible bills with your thumb across your fingertips whenever money, a price or the odds come up.",
      skillLeak: "You can count a stack of bills by feel and know any sum to the cent.",
      realStory:
        "You are Bertrand “Barty” Crane, the Black Veil's Teller. You counted the vault's exit advance by hand on 31 October 1924. “Sandbag” is a name you took from a stable of fighters you bet on; you learned to throw a punch and to lose on purpose, because losing on purpose is only arithmetic.",
      escape:
        "Someone came for you at Hosmer's rooms on Spring Street. You left a body-sized fire in the room and a memorial notice, “Bertrand Crane,” in the Farrago that autumn, and that ended the search.",
      grievance: "The Keeper paid the hitman out of your own share of the exit money. Your savings bought the bullets.",
      motiveKeys: [
        ["share", "own money", "advance", "savings", "pocket"],
        ["hitman", "quill", "killer", "killers", "assassin", "murder", "killings", "killed"],
      ],
      motiveFact: "motive-18",
      memorial: "In memoriam, Bertrand Crane",
    },
    objectives: [
      find("diwakar-1", "lipstick"),
      secretOf("diwakar-2", "molly", "anika", ["dolly"]),
      nightcapChain("diwakar-3"),
      offerChain("diwakar-4"),
      motiveChain("diwakar-5", ["jack", "adam", "tim"], [
        ["share", "own money", "advance", "savings", "pocket"],
        ["hitman", "quill", "killer", "killers", "assassin", "murder", "killings", "killed"],
      ]),
    ],
  },
];
