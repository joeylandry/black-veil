/** The River Trade: everyone who profits from what the river carries. */
import { find, money, motiveChain, nightcapChain, offerChain, role, secretOf, seek, story, swap } from "./build";
import type { Character } from "./types";

export const river: Character[] = [
  {
    id: "tim",
    realNames: ["Tim McGinley", "Timothy McGinley", "Tim"],
    circle: "river",
    name: "Timothy “Gin” McGinley",
    occupation: "Bathtub-gin baron",
    publicBio: "The man who made the cheapest gin in New Hampshire into the most respectable. Claims to be going straight.",
    background: {
      history:
        "You are in your second year of going straight, which means your gin now has a license plate. You ran the launch at the foot of the river steps in 1924 and have been trying to forget what you saw.",
      people: [
        "Rebecca Chou: the House's Butler; you supply the House, and what it does not know about your gin is little.",
        "Rhea Mallya: stocks your gin in the Emporium's back room under the label of a tonic.",
        "Anthony Huang: your lawyer; you do not pay him on time.",
      ],
      wardrobe: "A gangster's pinstripe, a flask-shaped bulge, and a black half-mask with a gin-green ribbon.",
    },
    secrets: [{ text: "Your gin travels in the hearse of Dolan's Funeral Home, where a coffin holds forty bottles.", share: "secret" }],
    smallSecret: { text: "Your gin travels in the hearse of Dolan's Funeral Home, where a coffin holds forty bottles.", key: ["hearse"], confidant: "rebecca" },
    startingCash: 150,
    carries: ["gin-flask"],
    objectives: [
      find("tim-1", "cigarette-case"),
      secretOf("tim-2", "joel", "mihir", ["beaumont"]),
      swap("tim-3", "rhea", "gin-flask", "silk-handkerchief"),
      money("tim-4", 200, "A baron's business is the margin. Sell, trade and bargain. Leave with at least $200."),
      story("tim-5", "A wall too thick", "Somebody knows why a wall in the Merrimack Room is thicker than it should be. Learn the word they use for it.", "How the wall is described", "josh", ["arjun"], [["thick"]]),
    ],
  },
  {
    id: "rebecca",
    realNames: ["Rebecca Chou", "Becca Chou", "Rebecca"],
    circle: "river",
    name: "Rebecca “Chow” Chou",
    occupation: "Butler of the Black Veil",
    publicBio:
      "The Black Veil's Butler: keeper of its keys, its tin, and every secret that ever crossed the bar. Self-made, a little sketchy, and for sale to anyone who can pay.",
    background: {
      history:
        "You run the House: the bar, the locks, the tin box that holds the night's takings. You also keep a boarding house on the West Side, which is where a certain lady hid on the night of 31 October 1924 with a bandaged shoulder. Someone paid you $200 to forget her.",
      people: [
        "Tim McGinley: supplies the House, and has seen what is under your bar.",
        "Leon Ge: you have a message of his you have never delivered.",
        "Erika Lam: a boarder you hid at the House once, and would again, for the right fee.",
      ],
      wardrobe: "A Butler's black coat with silver buttons, white gloves, a ring of keys, and an expression of discretion for hire.",
    },
    secrets: [
      { text: "The House whiskey is cut with cold tea; nobody has ever noticed.", share: "secret" },
      { text: "On 1 November 1924 you took $200 from “Mr. K.” to forget the lady in Room 3. You took it.", share: "secret" },
      { text: "You sell alibis at $20 each, and silence at more.", share: "trade" },
    ],
    smallSecret: { text: "The House whiskey is cut with cold tea; nobody has ever noticed.", key: ["tea"], confidant: "tim" },
    startingCash: 120,
    carries: [],
    role: "butler",
    roleCard: [
      "You are the Butler. At the bar you hold the House Tin, the House Book and a single bottle of the House's own tincture for “river rats.”",
      "The bottle sells once a night, and only against a numbered marker handed to you by its owner. When a guest offers a marker, open the House panel on your phone, type the five-character code printed on it, and the phone tells you whether to sell. If it says sold, hand over the vial. If it says sold out, hand the marker back. The House counts every offer.",
      "Whatever you do, never reveal who bought the tincture until after the body is found. After that, you may sell the answer or keep it: $75 is a fair price.",
      "At a quarter to nine you take the Keeper his rye. You will find him. Scream.",
      "Nobody takes the marker from you, and you take nothing from anyone: it is all deals, always.",
    ],
    objectives: [
      find("rebecca-1", "black-frog"),
      secretOf("rebecca-2", "silas", "leon", ["hartford"]),
      money("rebecca-3", 175, "The House runs on cash, favours and silence. Sell alibis, sell silence, sell the answer. Leave with at least $175."),
      role("rebecca-4", "The House's one sale", "Sell the House's single bottle to the owner of a numbered marker, once, before the nightcap is served at half past eight. Record the sale on your House panel.", "In a sentence, who did you sell to?", { kind: "butler-sale" }),
      role("rebecca-5", "The scream", "At a quarter to nine, go to the Merrimack Room, find the Keeper and scream. Submit the time you screamed.", "The time you screamed (e.g. 8:46)", { kind: "clock", from: "20:44", to: "20:52" }),
    ],
  },
  {
    id: "angelos",
    realNames: ["Angelos Boules", "Angelos"],
    circle: "river",
    name: "Angelos “Bowled Over” Boules",
    occupation: "Lawn-bowls hustler",
    publicBio: "Has never lost a game of boules with money on it. Has lost several without, on purpose, to raise the stakes.",
    background: {
      history:
        "You read tells for a living: a twitch, a hesitation, a glass left untouched. You hustle boules on the lawn and cards in the back room and you have sat across from every guest here at least once.",
      people: [
        "Luke Sheldon: your partner on the midway; he works the shell while you read the mark.",
        "Mihir Nagarkatti: your bookmaker and your best friend, in that order.",
        "Diwakar Sandhu: the prizefighter whose hands you cannot stop watching.",
      ],
      wardrobe: "A bowler hat, a waistcoat full of loose coin, and a single lucky boule in your pocket.",
    },
    secrets: [{ text: "Your lucky boule, Sophia, is weighted with lead.", share: "secret" }],
    smallSecret: { text: "Your lucky boule, Sophia, is weighted with lead.", key: ["sophia"], confidant: "luke" },
    startingCash: 120,
    carries: ["lucky-boule"],
    objectives: [
      find("angelos-1", "dice-pair"),
      secretOf("angelos-2", "diwakar", "mihir", ["eleven"]),
      swap("angelos-3", "luke", "lucky-boule", "carnival-ticket"),
      seek("angelos-4", [["anthony", "rhea"], ["jack", "tiffany"]]),
      money("angelos-5", 180, "Win a few hands, a few bets, a few boules. Leave with at least $180."),
    ],
  },
  {
    id: "erika",
    realNames: ["Erika Lam", "Erika"],
    circle: "river",
    name: "Erika “On the” Lam",
    occupation: "Fugitive",
    publicBio: "Has been “on the lam” since the spring and sees no reason to stop now. The authorities have a sketch; so far it looks like several people.",
    background: {
      history:
        "You bought a false name from a masked man at the river steps on 31 October 1924 and you have been using a different one every season since. You hid at Rebecca's boarding house more than once.",
      people: [
        "Rebecca Chou: has hidden you, for money, and will again.",
        "Ananya Koduru: sold you a blank telegram form without asking why.",
        "Theodor Farag: the Sheriff who wants you, and has never recognised you in a hat.",
      ],
      wardrobe: "A travelling coat with the collar up, a hat pulled low, and a false moustache you may or may not wear.",
    },
    secrets: [{ text: "You are wanted in Vermont for stealing a church organ.", share: "secret" }],
    smallSecret: { text: "You are wanted in Vermont for stealing a church organ.", key: ["organ"], confidant: "rebecca" },
    startingCash: 60,
    carries: ["false-papers"],
    habit: "You check the exits wherever you go and sit where you can see the door. A fugitive's habit.",
    objectives: [
      find("erika-1", "pocket-mirror"),
      secretOf("erika-2", "eric", "anthony", ["doorstop"]),
      swap("erika-3", "ananya", "false-papers", "telegram-form"),
      story("erika-4", "The Montreal postmark", "The wire that raised this party was filed from a certain city. Learn which, from someone who has seen the slip.", "The city", "ananya", ["molly", "luke"], [["montreal"]]),
      money("erika-5", 90, "A fugitive travels light and needs bus fare. Leave with at least $90."),
    ],
  },
  {
    id: "sidd",
    realNames: ["Siddarth Arvind", "Sidd Arvind", "Sid Arvind", "Sidd"],
    circle: "river",
    name: "Siddarth “Air-Wind” Arvind",
    occupation: "Aviator and barnstormer",
    publicBio: "Flies anything that will lift him off the ground, and a few things that won't. Has landed in every field in New England and is still looking for a better one.",
    background: {
      history:
        "You barnstorm the county's fairs and carry mail when the roads are mud. You are always the first to ask which way the door is, and the last to say why.",
      people: [
        "Jack Hudson: the motorcar man who says cars will beat planes and has the loudest laugh in the room.",
        "Tiffany Liu: sold you a lamp for your hangar, and a story for it.",
        "Leon Ge: reads your weather on the air, wrongly.",
      ],
      wardrobe: "A flying jacket and leather helmet, goggles pushed up on your forehead, and a white silk scarf.",
    },
    secrets: [{ text: "You get airsick above a thousand feet.", share: "secret" }],
    smallSecret: { text: "You get airsick above a thousand feet.", key: ["airsick"], confidant: "molly" },
    startingCash: 140,
    carries: [],
    survivor: {
      veilName: "Dominic Marek",
      veilTitle: "The Doorman",
      markerNo: 21,
      markerCode: "H3T4V",
      tell: "You never sit with your back to a door, and you count the exits in every room you enter.",
      skillLeak: "You remember every face and name after a single introduction, and you can tell a lie by the feet.",
      realStory:
        "You are Dominic Marek, the Black Veil's Doorman, who held the river door. On the night of the Exit you let two people out at 23:47 and barred the door behind them. You have never gone through a door with your back to the room since.",
      escape:
        "You ran. You learned to fly because the sky is the one place nobody can follow you, and took the name of a flier you met at a fair.",
      grievance: "The Keeper had Ignatius Bell shot in the shed on Granite Street. Bell had held the second door beside you for three years.",
      motiveKeys: [
        ["partner", "bell", "ignatius", "friend", "second door", "second doorman"],
        ["killed", "shot", "murdered", "murder"],
      ],
      motiveFact: "motive-21",
      memorial: undefined,
    },
    objectives: [
      find("sidd-1", "green-glove"),
      secretOf("sidd-2", "tiffany", "josh", ["frog"]),
      nightcapChain("sidd-3"),
      offerChain("sidd-4"),
      motiveChain("sidd-5", ["theodor", "adam", "angelos"], [
        ["partner", "bell", "ignatius", "friend", "second door", "second doorman"],
        ["killed", "shot", "murdered", "murder"],
      ]),
    ],
  },
];
