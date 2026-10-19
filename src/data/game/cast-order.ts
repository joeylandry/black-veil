/** Order & Letters: officials, professionals and the people who sign things. */
import { find, hide, motiveChain, nightcapChain, offerChain, role, secretOf, story } from "./build";
import { sceneCode } from "./props";
import type { Character } from "./types";

export const order: Character[] = [
  {
    id: "theodor",
    realNames: ["Theodor Farag", "Theo Farag", "Theodor"],
    circle: "order",
    name: "Sheriff Theodor “Farrago” Farag",
    occupation: "Sheriff of Hillsborough County",
    publicBio:
      "A lawman who reads the paper before the case file. Famous for never having lost an election and never having won an argument with WFEA's Leon Ge.",
    background: {
      history:
        "You have held the star for six years and your county has never been quiet. A feud with Leon Ge, who mocks your department on the radio every night, has become the best entertainment in the county.",
      people: [
        "Leon Ge: you suspect a second, unlicensed transmitter somewhere in town, and you intend to find it.",
        "Dr. Emre Sunar: the county physician reports to you, and examines every body you find.",
        "Adam Ouldsfiya: the gunsmith who sold you the revolver you have never fired.",
      ],
      wardrobe: "A tin star (a paper one is in your envelope), a Sheriff's hat, and a stern face for the photographs.",
    },
    secrets: [{ text: "You keep your revolver's bullets in your sock; the gun itself has never been loaded.", share: "secret" }],
    smallSecret: { text: "You keep your revolver's bullets in your sock; the gun itself has never been loaded.", key: ["sock"], confidant: "adam" },
    startingCash: 100,
    carries: [],
    role: "sheriff",
    roleCard: [
      "You are the Sheriff. The law of the night is yours: when the body is found, take charge, tell people to stand back, and keep the scene as you found it. Nothing leaves the room.",
      "You hold the Coroner's Folder, sealed until the scream. Open it at the scene. It holds the physician's printed report and a scene code.",
      "You may question anyone. Nobody has to answer, and the host will not rule on what they say. What you learn is yours to trade.",
    ],
    habit: "You check the exits of every room you enter, a lawman's habit. Let people see you do it.",
    objectives: [
      find("theodor-1", "hat"),
      secretOf("theodor-2", "leon", "ananya", ["st anne", "saint anne", "st annes"]),
      role("theodor-3", "First Responder", "When you hear the scream at about a quarter to nine, reach the body fast, walk, do not run, and read the scene code on the card by the table.", "The scene code", { kind: "code", codes: [sceneCode] }),
      role("theodor-4", "The Coroner's Folder", "Open the Coroner's Folder at the scene. File the report: type the filing code printed at the foot of the page.", "The filing code", { kind: "code", codes: ["YMYKK"] }),
      story("theodor-5", "Who sold the poison?", "The physician's report names the poison. Find out how much of it the House bought, and in what form.", "The poison, as it was sold", "adam", ["rhea"], [["nux vomica"]]),
    ],
  },
  {
    id: "eric",
    realNames: ["Eric Li", "Eric"],
    circle: "order",
    name: "Judge Eric “Leeway” Li",
    occupation: "Municipal court judge",
    publicBio:
      "Has dismissed every case that ever came before the bench, usually before the lawyers finished sitting down. Believes in giving everyone a little leeway.",
    background: {
      history:
        "You came to the bench in 1925 with excellent references and no previous court record anywhere. Your gavel falls like a metronome and the docket moves faster than any in the state.",
      people: [
        "Anthony Huang: argues before you and has never won an acquittal.",
        "Theodor Farag: the Sheriff, who watches your bench more closely than he admits.",
        "Mihir Nagarkatti: a regular in your corridors, and a decent source of racetrack tips.",
      ],
      wardrobe: "Judge's black robes, a powdered wig if you can find one, and a small half-mask.",
    },
    secrets: [{ text: "The gavel you bang is a doorstop from your mother's kitchen.", share: "secret" }],
    smallSecret: { text: "The gavel you bang is a doorstop from your mother's kitchen.", key: ["doorstop"], confidant: "anthony" },
    startingCash: 150,
    carries: [],
    survivor: {
      veilName: "Sylvester Ballard",
      veilTitle: "The Maestro",
      markerNo: 20,
      markerCode: "22RDE",
      tell: "You beat time in four-four with two fingers whenever there is music, or rhythm, or a long pause.",
      skillLeak: "You hear a wrong note across a room and cannot stop yourself from conducting.",
      realStory:
        "You are Sylvester Ballard, who led the Black Veil's orchestra until 1924. You became a judge because a bench is the one stage where nobody asks you to play.",
      escape:
        "You were at the Brass Rail on Canal Street when Quill's man came. The barman tipped you and you left through the coal cellar. A memorial notice, “Sylvester Ballard,” ran in the Farrago the following autumn; you placed it yourself and had it pulled before it printed twice.",
      grievance: "The Keeper had your band killed, one player at a time, so there would be nobody left to say who played at the Exit.",
      motiveKeys: [
        ["band", "orchestra", "musicians", "drummer", "pianist", "singer", "players"],
        ["killed", "murdered", "dead", "died", "killings", "murder"],
      ],
      motiveFact: "motive-20",
      memorial: "In memoriam, Sylvester Ballard",
    },
    objectives: [
      find("eric-1", "black-feather"),
      secretOf("eric-2", "mihir", "angelos", ["marigold"]),
      nightcapChain("eric-3"),
      offerChain("eric-4"),
      motiveChain("eric-5", ["molly", "emre", "luke"], [
        ["band", "orchestra", "musicians", "drummer", "pianist", "singer", "players"],
        ["killed", "murdered", "dead", "died", "killings", "murder"],
      ]),
    ],
  },
  {
    id: "anthony",
    realNames: ["Anthony Huang", "Tony Huang", "Anthony"],
    circle: "order",
    name: "Anthony “Hung Jury” Huang",
    occupation: "Defence attorney",
    publicBio:
      "Has never won an acquittal and never lost a conviction, because every jury he faces deadlocks. Clients pay for juries that argue.",
    background: {
      history:
        "You practise from a second-floor office above a dentist and read every contract twice. You have drawn papers for half the people in this room and remember what each of them tried to hide.",
      people: [
        "Rhea Mallya: the Emporium's counsel; you read her leases and you are not telling anyone what is in them.",
        "Eric Li: the judge who dismisses your cases and has never read your briefs.",
        "Tim McGinley: a client you have defended three times and billed once.",
      ],
      wardrobe: "A lawyer's three-piece suit, a flourish of a signature on every page, and a mask with an air of reasonable doubt.",
    },
    secrets: [{ text: "Your office sits above Dr. Pettibone the dentist, and every client leaves with a numb jaw and a retainer.", share: "secret" }],
    smallSecret: { text: "Your office sits above Dr. Pettibone the dentist, and every client leaves with a numb jaw and a retainer.", key: ["pettibone"], confidant: "theodor" },
    startingCash: 120,
    carries: [],
    habit: "You sign everything with a large flourish. Do it at every chance, on napkins if you must.",
    objectives: [
      find("anthony-1", "queen-card"),
      secretOf("anthony-2", "tim", "rebecca", ["hearse"]),
      hide("anthony-3", "rhea"),
      story("anthony-4", "Who is K. Kessler?", "A Boston firm took instructions from one “K. Kessler.” Learn from someone who knew him what he was.", "His name and trade", "tiffany", ["rebecca"], [["kessler"], ["keeper"]]),
      story("anthony-5", "The hand that was not hers", "You saw three orders in a court. Learn what Cassie's real hand looks like from someone who knows it.", "What is different about her hand", "leon", ["rebecca"], [["plain"]]),
    ],
  },
  {
    id: "emre",
    realNames: ["Emre Sunar", "Emre"],
    circle: "order",
    name: "Dr. Emre “Sooner or Later” Sunar",
    occupation: "County physician",
    publicBio:
      "Every patient is told the same thing: sooner or later, it will pass. Known to be right more often than the other doctors in the county.",
    background: {
      history:
        "You have been the county physician for four years and the Sheriff's examiner for three. You have seen what a stage looks like and what a body looks like, and you can tell the two apart.",
      people: [
        "Theodor Farag: the Sheriff, who asks you what killed them and rarely likes the answer.",
        "Rhea Mallya: the Emporium's druggist fills your prescriptions.",
        "Silas Palmer: the bandleader whose throat you treat.",
      ],
      wardrobe: "A doctor's bag, a stethoscope, a white coat over a dinner jacket, and a small black mask.",
    },
    secrets: [{ text: "You prescribe “medicinal whiskey” from Horne's Pharmacy, and Horne gives you a cut.", share: "secret" }],
    smallSecret: { text: "You prescribe “medicinal whiskey” from Horne's Pharmacy, and Horne gives you a cut.", key: ["horne", "hornes"], confidant: "rhea" },
    startingCash: 100,
    carries: [],
    role: "doctor",
    roleCard: [
      "You are the only one who may examine the body. When the Sheriff opens the scene, take your time and do it properly.",
      "What you will find: the arched back and fixed grin of strychnine; a bitter residue in the honeyed rye; a tincture bottle's label (the House's); and a time of death that fits a dose at about half past eight.",
      "You report to the Sheriff, but your findings are yours. Share them freely or trade them.",
    ],
    objectives: [
      find("emre-1", "spectacles"),
      secretOf("emre-2", "luke", "silas", ["goliath"]),
      role("emre-3", "The examination", "Examine the body. State what killed him, and what it was carried in.", "Cause of death", { kind: "pattern", all: [["strychnine", "nux vomica"], ["rye", "whiskey", "nightcap", "glass", "drink"]] }, ["theodor"]),
      role("emre-4", "The time", "State when the poison was taken, as closely as you can.", "Time the poison was taken", { kind: "pattern", all: [["half past eight", "8:30", "830", "eight thirty", "8 30"]] }),
      story("emre-5", "Where did it come from?", "The report says a house stock, not a druggist's pack. Learn whose house.", "Whose stock it was", "adam", ["rhea"], [["butler", "house", "chow", "rebecca"]]),
    ],
  },
];
