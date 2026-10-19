/** The Gilded: money, old and new, and the people who spend it loudly. */
import { find, hide, money, motiveChain, nightcapChain, offerChain, secretOf, story, swap } from "./build";
import type { Character } from "./types";

export const gilded: Character[] = [
  {
    id: "anika",
    realNames: ["Anika Mahns", "Anika"],
    circle: "gilded",
    name: "Anika Mahns of Mahns Manor",
    occupation: "Heir to the Mahns fortune, and host",
    publicBio:
      "Lives in the largest house in the North End and reminds everyone of it. The Mahns Manor garden party is the only invitation harder to get than this one.",
    background: {
      history:
        "Your late father was the Black Veil's Silent Partner from the first night: the standing reservation upstairs, the drafts paid to a vault and never to a bank. He left you the Manor, its mortgage, and a brass key on a ribbon he called “the Silent Partner's tooth.”",
      people: [
        "Jack Hudson: the Hudson dealer who took your crested spoon in trade and means to sell it back to you at a profit.",
        "Molly Daniel: rents your cellar for a still of her own, and pays you in gossip.",
        "J. Bruce Wayne: the oil man who holds your mortgage and has never once mentioned it.",
      ],
      wardrobe: "A black velvet ribbon at the throat, gloves, and the airs of a woman who does not need to count.",
    },
    secrets: [
      { text: "You pawned your mother's pearls at Dutton's Pawn and told the whole North End they were at the cleaners.", share: "secret" },
      { text: "You carry your father's brass key. You do not know what it opens.", share: "secret" },
    ],
    smallSecret: { text: "You pawned your mother's pearls at Dutton's Pawn and told the whole North End they were at the cleaners.", key: ["dutton", "duttons"], confidant: "rhea" },
    startingCash: 40,
    carries: ["mahns-spoon"],
    objectives: [
      find("anika-1", "pocket-mirror"),
      secretOf("anika-2", "angelos", "luke", ["sophia"]),
      swap("anika-3", "jack", "mahns-spoon", "hudson-key"),
      money("anika-4", 140, "You are nearly broke, and every guest here is someone's chance. Leave with at least $140."),
      story("anika-5", "The Silent Partner's tooth", "Your father's brass key must open something. Learn what, from someone who sold or built it.", "What it opens", "adam", ["josh"], [["vault", "safe"]]),
    ],
  },
  {
    id: "joel",
    realNames: ["Joel Indipiginja", "Joel I", "Joel"],
    circle: "gilded",
    name: "J. Bruce Wayne",
    occupation: "Oil tycoon",
    publicBio:
      "New money from a place nobody can quite name. Holds the Mahns mortgage, buys rounds without looking at the bill, and is always somewhere you cannot see him.",
    background: {
      history:
        "Wayne Petroleum arrived in Manchester in 1925 with a leased derrick, a Packard, and no past anyone has been able to find. J. Bruce Wayne bought the Mahns mortgage the week he arrived, and nobody has asked why.",
      people: [
        "Anika Mahns: your mortgage, and your reason to be seen at her parties.",
        "Mihir Nagarkatti: the other money in the room; you do not like how he looks at your books.",
        "Jack Hudson: sold you the Packard and talks about engines more than you would like.",
      ],
      wardrobe: "Dinner jacket, a tycoon's cigar you never light, and a black mask that does not quite cover your eyes.",
    },
    secrets: [{ text: "Wayne Petroleum owns exactly one leased derrick, near Beaumont, Texas. It has never struck oil.", share: "secret" }],
    smallSecret: { text: "Wayne Petroleum owns exactly one leased derrick, near Beaumont, Texas. It has never struck oil.", key: ["beaumont"], confidant: "mihir" },
    startingCash: 200,
    carries: [],
    survivor: {
      veilName: "Walter “Wren” Pike",
      veilTitle: "The Wren",
      markerNo: 22,
      markerCode: "XRTG9",
      tell: "You wet a fingertip and lift it, as if to test the wind, even indoors, when you think.",
      skillLeak: "You can name an engine by ear and you know what the upper air is doing.",
      realStory:
        "You are Walter “Wren” Pike, the Black Veil's courier and pilot: the river runs, the Canadian mail, the quick exits. On 31 October 1924 you flew nothing and heard everything.",
      escape:
        "In the spring of 1925 you went under. You borrowed a name off a cinema poster and a mortgage off a failing bank, and became a man nobody would suspect of being anyone.",
      grievance: "The Keeper paid a mechanic to cut the fuel line of the aeroplane you and Cal Yates were flying. Cal drowned. You lived to remember it.",
      motiveKeys: [
        ["co-pilot", "copilot", "cal", "yates", "partner", "friend"],
        ["fuel line", "fuel", "sabotage", "sabotaged", "crash", "plane", "aeroplane", "airplane", "massabesic"],
      ],
      motiveFact: "motive-22",
      memorial: undefined,
    },
    objectives: [
      find("joel-1", "silver-dollar"),
      secretOf("joel-2", "rhea", "anika", ["granite"]),
      nightcapChain("joel-3"),
      offerChain("joel-4"),
      motiveChain("joel-5", ["tim", "jack", "theodor"], [
        ["co-pilot", "copilot", "cal", "yates", "partner", "friend"],
        ["fuel line", "fuel", "sabotage", "sabotaged", "crash", "plane", "aeroplane", "airplane", "massabesic"],
      ]),
    ],
  },
  {
    id: "mihir",
    realNames: ["Mihir Nagarkatti", "Mihir"],
    circle: "gilded",
    name: "Mihir “Nag” Nagarkatti",
    occupation: "Racetrack bookmaker and businessman",
    publicBio:
      "Takes bets on horses, fights and the weather, and never loses a ledger. Famously cheerful about other people's luck.",
    background: {
      history:
        "You have run a book at Rockingham Park since 1919 and have lent money to half this room. A private ledger stays with you at all times; you have never shown it to anyone.",
      people: [
        "Angelos Boules: your best customer and your worst loser.",
        "Diwakar Sandhu: the prizefighter whose losses you bank on, and are curious about.",
        "Arjun Bhat: a slugger who owes you a favour from the Textiles championship.",
      ],
      wardrobe: "A bookmaker's check waistcoat, a pocket full of bills in a tidy roll, and a black half-mask.",
    },
    secrets: [{ text: "You fixed the fourth at Rockingham Park by buying off a jockey to ride the long shot Marigold's Pride.", share: "secret" }],
    smallSecret: { text: "You fixed the fourth at Rockingham Park by buying off a jockey to ride the long shot Marigold's Pride.", key: ["marigold"], confidant: "angelos" },
    startingCash: 200,
    carries: [],
    habit: "You count money left-handed with a flick of the thumb, the bookmaker's way. Do it whenever bills change hands.",
    objectives: [
      find("mihir-1", "matchbook"),
      secretOf("mihir-2", "arjun", "josh", ["august"]),
      money("mihir-3", 260, "A bookmaker lives on other people's hope. Make book at the table, lay odds and take your cut. Leave with at least $260."),
      story("mihir-4", "Which markers are left?", "A marker is a House promise. Learn which numbers still have a claim on the House, and who holds that knowledge.", "The marker numbers", "rebecca", ["leon", "josh"], [["18 to 22", "18 22", "eighteen", "twenty two"]]),
      story("mihir-5", "Whose name was on the draft?", "A Hudson was bought with a draft from a Boston account. Learn the name that signed it.", "The name on the draft", "jack", ["adam"], [["kessler"]]),
    ],
  },
  {
    id: "rhea",
    realNames: ["Rhea Mallya", "Rhea"],
    circle: "gilded",
    name: "Rhea “Emporium” Mallya",
    occupation: "Owner, Mallya's Department Emporium",
    publicBio:
      "Sells everything a lady needs and several things a gentleman shouldn't ask about. The Emporium's sign says “Established, Unencumbered.”",
    background: {
      history:
        "Mallya's Emporium has three floors, a druggist's counter, and a standing account with half this room. You know what everyone buys, which is more than most of them know about themselves.",
      people: [
        "Tim McGinley: you stock his gin in the back room under the label of a tonic.",
        "Anika Mahns: an unpaid account the size of a small house.",
        "Silas “Duke” Palmer: dresses his band at your counter, on a ring-dotted signature.",
      ],
      wardrobe: "The newest silk you stock, a mask in a matching shade, and an air of closing a sale.",
    },
    secrets: [{ text: "The Emporium is mortgaged to the Granite State Trust, and the sign still says “Established, Unencumbered.”", share: "secret" }],
    smallSecret: { text: "The Emporium is mortgaged to the Granite State Trust, and the sign still says “Established, Unencumbered.”", key: ["granite"], confidant: "anika" },
    startingCash: 150,
    carries: ["silk-handkerchief"],
    objectives: [
      find("rhea-1", "perfume-bottle"),
      secretOf("rhea-2", "jack", "tiffany", ["lowell"]),
      swap("rhea-3", "tim", "silk-handkerchief", "gin-flask"),
      hide("rhea-4", "anthony"),
      story("rhea-5", "A wall too thick", "Somebody knows why a wall in the Merrimack Room is thicker than it should be. Learn the word they use for it.", "How the wall is described", "arjun", ["josh"], [["thick"]]),
    ],
  },
  {
    id: "jack",
    realNames: ["Jack Hudson", "John Hudson", "Jack"],
    circle: "gilded",
    name: "John “Jack” Hudson (no relation to the motorcar)",
    occupation: "Automobile dealer",
    publicBio:
      "Sells the new Hudson to anyone with a down payment and the old Hudson to anyone who didn't read the contract. Insists, at some length, that he is no relation to the motorcar.",
    background: {
      history:
        "Hudson & Co. sells more cars than any dealer between Concord and Nashua, and keeps a sales book that records the buyer, the draft and the colour. You never forget a draft.",
      people: [
        "Anika Mahns: you took her crested spoon in trade for a Packard and have been looking for a buyer since.",
        "Tiffany Liu: has been commissioning a showroom lamp for a year, and is not quite finished.",
        "J. Bruce Wayne: the Packard buyer who diagnosed his own engine by ear.",
      ],
      wardrobe: "A salesman's checked suit, a Hudson pin, a half-mask and a handshake that lasts one second too long.",
    },
    secrets: [{ text: "The “gleaming new” Hudson on your showroom floor is rebuilt from a Lowell salvage-yard wreck.", share: "secret" }],
    smallSecret: { text: "The “gleaming new” Hudson on your showroom floor is rebuilt from a Lowell salvage-yard wreck.", key: ["lowell"], confidant: "tiffany" },
    startingCash: 120,
    carries: ["hudson-key"],
    objectives: [
      find("jack-1", "green-glove"),
      secretOf("jack-2", "sidd", "molly", ["airsick"]),
      swap("jack-3", "anika", "hudson-key", "mahns-spoon"),
      hide("jack-4", "tiffany"),
      story("jack-5", "How many were there?", "Seventeen strangers died in accidents in one county. Learn the count from someone who counted.", "The number", "theodor", ["emre"], [["seventeen", "17"]]),
    ],
  },
];
