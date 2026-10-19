/** The Wire & the Stage: performers, newsies and the people who carry news. */
import { find, money, motiveChain, nightcapChain, offerChain, secretOf, seek, story, swap } from "./build";
import type { Character } from "./types";

export const stage: Character[] = [
  {
    id: "molly",
    realNames: ["Molly Daniel", "Molly"],
    circle: "stage",
    name: "Molly “Extra!” Daniel",
    occupation: "Newsie, The Evening Farrago",
    publicBio: "Sells the news before it happens. Has never once been wrong about a rumour, only early.",
    background: {
      history:
        "You have sold the Farrago on the corner of Elm and Hanover since 1919, and your papers reach every door in this room. A still in the Mahns Manor cellar pays for the dress you are wearing.",
      people: [
        "Anika Mahns: your landlady in the cellar, and your best customer.",
        "Leon Ge: your headlines run on his radio the next morning, without credit.",
        "Eric Li: pays you to keep his name off the court column.",
      ],
      wardrobe: "A newsboy cap, a satchel of papers, and a bundle of the Extra to sell at the right moment.",
    },
    secrets: [{ text: "The still in the Mahns Manor cellar is named Dolly, and she turns out forty gallons a month.", share: "secret" }],
    smallSecret: { text: "The still in the Mahns Manor cellar is named Dolly, and she turns out forty gallons a month.", key: ["dolly"], confidant: "anika" },
    startingCash: 90,
    carries: [],
    habit: "You chant your headlines in a steady four-four beat, as you do on the corner. Do it whenever you sell a paper.",
    objectives: [
      find("molly-1", "velvet-ribbon"),
      secretOf("molly-2", "josh", "adam", ["pumpernickel"]),
      money("molly-3", 130, "Papers sell, and so does gossip. Sell news, an Extra or a rumour at a fair price. Leave with at least $130."),
      seek("molly-4", [["anthony", "rhea"], ["jack", "tiffany"]]),
      story("molly-5", "The Montreal postmark", "The wire that raised this party was filed from a certain city. Learn which, from someone who has seen the slip.", "The city", "ananya", ["luke"], [["montreal"]]),
    ],
  },
  {
    id: "leon",
    realNames: ["Leon Ge", "Leon"],
    circle: "stage",
    name: "Leon “Gee-Whiz” Ge",
    occupation: "Radio announcer, WFEA",
    publicBio: "The voice of WFEA, and the only man in Manchester who mocks the Sheriff nightly. Rarely wrong; always loud.",
    background: {
      history:
        "You came from Canton by way of Montreal. A certain lady sponsored your papers and your radio licence, and you owe her everything. You read the news at ten and a quiet message on alternate Sundays.",
      people: [
        "Theodor Farag: the Sheriff, who thinks you have a second transmitter and is correct.",
        "Ananya Koduru: your friend in the telegraph office; she keeps your secrets and you keep hers.",
        "Silas Palmer: the bandleader whose scat you recognise from somewhere you cannot place.",
      ],
      wardrobe: "A microphone prop if you have one, a headset, a snappy suit, and a white carnation.",
    },
    secrets: [{ text: "WFEA's second transmitter, the unlicensed one the Sheriff suspects, sits in the bell tower of St. Anne's.", share: "secret" }],
    smallSecret: { text: "WFEA's second transmitter, the unlicensed one the Sheriff suspects, sits in the bell tower of St. Anne's.", key: ["st anne", "saint anne", "st annes"], confidant: "ananya" },
    startingCash: 100,
    carries: [],
    objectives: [
      find("leon-1", "radio-tube"),
      secretOf("leon-2", "anthony", "theodor", ["pettibone"]),
      seek("leon-3", [["anthony", "rhea"], ["jack", "tiffany"]]),
      story("leon-4", "Counting the dead", "Seventeen strangers died in accidents in a county. Learn the count from someone who counted.", "The number", "emre", ["theodor"], [["17", "seventeen"]]),
      story("leon-5", "The type face", "No Manchester printer made the black envelopes. Learn the name of the type from someone who knows printing.", "The type face", "luke", ["molly"], [["cuthbert"]]),
    ],
  },
  {
    id: "ananya",
    realNames: ["Ananya Koduru", "Ananya"],
    circle: "stage",
    name: "Ananya “The Code-Ruler” Koduru",
    occupation: "Cipher clerk, Western Union",
    publicBio: "Reads Morse faster than most people read English. Every telegram in Manchester passes under her pencil.",
    background: {
      history:
        "Every telegram that has gone in or out of Manchester has passed through your hands. You decoded a wire in 1924 and were told to forget it. You wrote it down instead.",
      people: [
        "Leon Ge: your colleague at WFEA who sends messages that look innocent and are not.",
        "Luke Sheldon: sends coded wires to his carnival partners, and tips well.",
        "Erika Lam: wanted; has bought a telegram form from you and does not say why.",
      ],
      wardrobe: "A clerk's visor and sleeve garters, a telegraph pencil behind the ear, and a single green glove.",
    },
    secrets: [{ text: "You keep carbon copies of every wire in a hatbox under your bed.", share: "secret" }],
    smallSecret: { text: "You keep carbon copies of every wire in a hatbox under your bed.", key: ["hatbox"], confidant: "leon" },
    startingCash: 100,
    carries: ["telegram-form"],
    objectives: [
      find("ananya-1", "brass-key"),
      secretOf("ananya-2", "emre", "rhea", ["horne", "hornes"]),
      swap("ananya-3", "erika", "telegram-form", "false-papers"),
      story("ananya-4", "The type face", "No Manchester printer made the black envelopes. Learn the name of the type from someone who knows printing.", "The type face", "molly", ["luke"], [["cuthbert"]]),
      story("ananya-5", "Cassie's hand", "Cassie signed her notes in a particular way. Learn how, from someone who kept her correspondence.", "How she signed", "leon", ["rebecca"], [["plain"]]),
    ],
  },
  {
    id: "luke",
    realNames: ["Luke Sheldon", "Luke"],
    circle: "stage",
    name: "Luke “Shell Game” Sheldon",
    occupation: "Carnival barker",
    publicBio: "The loudest voice at every fair in the county. Will sell you a prize you cannot win and a smile you cannot refuse.",
    background: {
      history:
        "You have run the carnival's midway for six summers, and the stage effects for its sideshow. In October 1924 you built stage blood and breakaway furniture for a “private masquerade” and billed a post-office box. You never asked what it was for.",
      people: [
        "Angelos Boules: your hustling partner on the midway; he reads the marks, you work the shell.",
        "Silas Palmer: leads the band that plays your carnival, and cannot play a Charleston.",
        "Ananya Koduru: sends your wires to the carnival's other towns, and keeps your accounts straight.",
      ],
      wardrobe: "A barker's straw boater, a striped coat, a cane, and a mask with a painted grin.",
    },
    secrets: [{ text: "The world's strongest man, Goliath, is a hollow plaster dummy and you do the voice.", share: "secret" }],
    smallSecret: { text: "The world's strongest man, Goliath, is a hollow plaster dummy and you do the voice.", key: ["goliath"], confidant: "silas" },
    startingCash: 100,
    carries: ["carnival-ticket"],
    objectives: [
      find("luke-1", "dice-pair"),
      secretOf("luke-2", "anika", "rhea", ["dutton", "duttons"]),
      swap("luke-3", "angelos", "carnival-ticket", "lucky-boule"),
      story("luke-4", "No coroner came", "Your stage show was called a massacre. Learn from someone who knew the city that nobody official was ever called.", "Who was never called", "emre", ["molly"], [["coroner"]]),
      money("luke-5", 150, "A barker earns his living by the shell and the sideshow. Make a few dollars off the guests. Leave with at least $150."),
    ],
  },
  {
    id: "silas",
    realNames: ["Silas Palmer", "Silas"],
    circle: "stage",
    name: "Silas “Duke” Palmer",
    occupation: "Jazz bandleader and scat singer",
    publicBio:
      "Leads the finest dance orchestra in New England, with an Ellington-style polish: white tie, a long cigarette holder, and a piano he insists is a jungle of sound.",
    background: {
      history:
        "You have led the band since 1925 and are known for the scat that carries over any room. The papers like you; the booking agents like you more, because you never ask to be paid in anything but cash.",
      people: [
        "Leon Ge: broadcasts your records on WFEA, and says the scat reminds him of someone.",
        "Rhea Mallya: dresses your band at her counter on a signature you are careful about.",
        "Luke Sheldon: books your orchestra for the carnival.",
      ],
      wardrobe: "White tie and tails, a long cigarette holder, and a mask in black lace.",
    },
    secrets: [{ text: "Your “originals” are lifted note for note from a Hartford songbook.", share: "secret" }],
    smallSecret: { text: "Your “originals” are lifted note for note from a Hartford songbook.", key: ["hartford"], confidant: "leon" },
    startingCash: 120,
    carries: [],
    survivor: {
      veilName: "Edmund Lyle",
      veilTitle: "The Notary",
      markerNo: 19,
      markerCode: "PKCA9",
      tell: "You dot every i with a tiny ring and tap your pen twice after you sign anything.",
      skillLeak: "You spot a false signature at ten paces and could write any hand in the room.",
      realStory:
        "You are Edmund Lyle, the Black Veil's Notary. At 23:02 on 31 October 1924 you witnessed the Exit Compact on the private landing, one of four. You have not liked your own signature since.",
      escape:
        "A bandleader's job was open and nobody checks a bandleader's papers. You became Duke Palmer, a man with a baton instead of a seal, and stopped signing anything that mattered.",
      grievance: "The Keeper made you forge Cassie's orders under duress, framed her with your own ring-dotted hand, and put you on the List anyway.",
      motiveKeys: [
        ["forged", "forge", "forger", "forgery", "forging"],
        ["orders", "order", "cassie", "framed", "frame", "blame", "blamed"],
      ],
      motiveFact: "motive-19",
      memorial: undefined,
    },
    objectives: [
      find("silas-1", "queen-card"),
      secretOf("silas-2", "theodor", "adam", ["sock"]),
      nightcapChain("silas-3"),
      offerChain("silas-4"),
      motiveChain("silas-5", ["anthony", "ananya", "josh"], [
        ["forged", "forge", "forger", "forgery", "forging"],
        ["orders", "order", "cassie", "framed", "frame", "blame", "blamed"],
      ]),
    ],
  },
];
