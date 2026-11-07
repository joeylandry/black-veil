import type { Exhibit } from "./types";

/**
 * The ten exhibits of File 245, one per sprint, in release order.
 *
 * Server-only by convention: pages render these after checking that the reader's run has
 * reached the week, so an unsealed exhibit's text never reaches a browser early. Do not
 * import this file from a "use client" component.
 *
 * Everything here is fiction. The Black Toad, the Hollis & Crane Leather Exchange and
 * every person named are invented; the real building at 245 Summer Street has nothing to
 * do with any of it. The story bible is docs/story/01-bible.md.
 */
export const exhibits: Exhibit[] = [
  {
    week: 1,
    slug: "nightmare-on-summer-street",
    number: "Exhibit 245-01",
    kind: "newspaper",
    title: "Nightmare on Summer Street",
    dated: "Monday, November 1, 1926",
    summary: "The Courier's extra: the Keeper of a cellar club found dead behind a bolted door.",
    damage: "Scanned from a water-stained copy. The plate split along the fold and the two halves were filed apart.",
    notes: [
      "On the night of October 31, 1926, a masquerade was held at The Black Toad, a club in the sub-cellar of 245 Summer Street.",
      "At 11:47 p.m. every light in the club failed for about four minutes.",
      "At 11:58 p.m. the club's Keeper, Kit Kessler, was found dead in his office, the Counting Room, behind a door bolted from the inside.",
      "Guests said a woman in a black veil crossed the room while the lights were out.",
      "Police padlocked the cellar before dawn.",
    ],
    persons: [
      { name: "Christopher “Kit” Kessler", role: "The Keeper of The Black Toad", note: "Found dead in the Counting Room at 11:58 p.m. Aged 38." },
      { name: "N. Shaw", role: "Reporter, Boston Night Courier", note: "Wrote the extra. Was in the club that night." },
      { name: "Capt. Ambrose Thayer", role: "Boston Police", note: "Took charge of the cellar and called the death natural." },
    ],
    finding: {
      prompt: "At what time did the lights fail at The Black Toad?",
      help: "As the Courier prints it. Hours and minutes.",
    },
    blocks: [
      { t: "masthead", name: "The Boston Night Courier", line: "EXTRA · Monday, November 1, 1926 · Two Cents" },
      { t: "headline", text: "Nightmare on Summer Street", size: "xl" },
      {
        t: "deck",
        text: "Club Keeper Found Dead Behind Bolted Door at No. 245 · Every Light Fails at 11:47 · Guests Tell of a Veiled Woman · Police Padlock Cellar Before Dawn",
      },
      { t: "byline", text: "By N. Shaw, of the Courier staff, who was present" },
      {
        t: "p",
        text: "Christopher Kessler, thirty-eight, known to two hundred masked guests last night as Kit and to the rest of the city as nobody in particular, was found dead at two minutes before midnight in a locked office beneath the Hollis & Crane Leather Exchange, 245 Summer Street.",
      },
      {
        t: "p",
        text: "The office lies at the back of a cellar resort its patrons call The Black Toad, reached through the Exchange's freight lift and ten steps down. Last night the Toad held a masquerade. At 11:47 by the clock over the bar, every light in the place went out at once.",
      },
      {
        t: "p",
        text: "For about four minutes the cellar was dark. The band stopped. Somebody laughed. Then, guests say, the piano began again by itself: three notes, over and over, a tune the older members knew as the song of the woman who used to own the room.",
      },
      {
        t: "p",
        text: "When the lights came back, a woman in a black veil was walking the length of the floor toward the back of the house. No fewer than six guests saw her. None saw her face. None saw her leave.",
      },
      {
        t: "p",
        text: "At 11:58 the head barman, finding the office door bolted and his knock unanswered, forced it with a bar from the cellar. Mr. Kessler sat at his desk with a glass of rye beside him and a ledger open in front of him. He was dead. The mantel clock in the room had stopped. Its hands stood at 11:47.",
      },
      {
        t: "p",
        text: "Police under Capt. Ambrose Thayer reached the cellar at twenty past twelve. By one o'clock the captain had told this reporter the death “appears natural,” the guests had been sent up into Summer Street, and a padlock was on the freight lift. Asked why the office had been bolted from within, the captain said a man is entitled to lock his own door.",
      },
      {
        t: "box",
        title: "Two Years to the Minute",
        text: [
          "Older patrons of the Toad were quick to point out the hour. On All Hallows' Eve 1924, the club's last masquerade under its founder, Miss Cassandra Castello, ended in shots, screams and a cellar emptied into the street. That night, too, the music stopped at 11:47.",
          "Miss Castello was not seen again. Mr. Kessler, who kept her books, kept her club.",
        ],
      },
      {
        t: "image",
        src: "/evidence/channel-alley.png",
        alt: "A wet brick lane along a waterfront warehouse at dawn, rail lines in the cobbles.",
        caption: "The Fort Point Channel side of No. 245 at dawn. Courier photograph.",
      },
    ],
  },
  {
    week: 2,
    slug: "report-of-death",
    number: "Exhibit 245-02",
    kind: "report",
    title: "Report of Death, Form 12",
    dated: "November 1, 1926, 12:20 a.m.",
    summary: "The police report: a bolted door, a glass of rye, a stopped clock and a page cut from the ledger.",
    damage: "Carbon copy. Lines of the original were blacked out by hand before filing, and the carbon has faded unevenly.",
    notes: [
      "The police report lists a half glass of rye, a mantel clock stopped at 11:47, a ledger with one page cut out, and a brass tag in the dead man's hand.",
      "It records wet marks on the floor, though the word for where they led from is blacked out.",
      "Capt. Thayer signed the cause of death: heart failure, no inquest.",
      "A note in the margin says Dr. Pratt asked to keep the glass and was refused.",
    ],
    persons: [
      { name: "Arthur “Artie” Moss", role: "Head barman", note: "Forced the Counting Room door at 11:58 p.m." },
      { name: "Dr. Lionel Pratt", role: "Medical examiner's office", note: "Asked for the glass. Refused." },
    ],
    finding: { prompt: "Who signed the cause of death on Form 12?", help: "Surname is enough." },
    blocks: [
      { t: "masthead", name: "Boston Police Department", line: "Form 12 · Report of Death · Summer Street Station" },
      {
        t: "fields",
        rows: [
          ["Date and hour", "November 1, 1926 · 12:20 a.m."],
          ["Place", "245 Summer Street, sub-cellar, rear office known as “the Counting Room”"],
          ["Deceased", "Christopher J. Kessler, aged 38, of {{x:22}}"],
          ["Occupation", "Manager of premises"],
          ["Found by", "Arthur Moss, barman, at 11:58 p.m., by forcing the door"],
          ["Condition of door", "Bolted on the inside. Bolt torn from the frame by forcing."],
          ["On the desk", "One glass, rye whiskey, half full. One ledger, open, one page cut out with a blade (page no. {{x:3}})."],
          ["In the room", "Mantel clock, stopped, hands at 11:47. Wet marks on the floor leading from the {{x:14}}."],
          ["On the person", "In the right hand, one brass tag, numbered (see attached). Wallet, $41."],
          ["Witnesses", "None to the death. Guests dismissed 12:50 a.m."],
          ["Cause of death", "Heart failure. No inquest required."],
        ],
      },
      { t: "margin", text: "Dr. Pratt asks to keep the glass. Refused. — A.T." },
      { t: "sign", name: "Ambrose Thayer", title: "Captain, Summer Street Station" },
      { t: "stamp", text: "CLOSED · NOV 1 1926", tone: "red" },
    ],
  },
  {
    week: 3,
    slug: "miss-castello-receives",
    number: "Exhibit 245-03",
    kind: "clipping",
    title: "Miss Castello Receives",
    dated: "Thursday, December 15, 1921",
    summary: "A society column from 1921: a new supper club ten steps beneath Summer Street.",
    damage: "Clipped from the society page and pasted into a scrapbook. The paste has browned through the type.",
    notes: [
      "The Black Toad opened in December 1921 under Miss Cassandra “Cassie” Castello, newly arrived from New York.",
      "Its emblem is a black toad caught mid-leap. Over the bar is carved: LOOK BEFORE YOU LEAP.",
      "Kit Kessler, once a bookkeeper at the Leather Exchange upstairs, came in to keep the club's accounts.",
      "Its money came from unnamed backers in the North End.",
    ],
    persons: [
      { name: "Cassandra “Cassie” Castello", role: "Founder of The Black Toad", note: "Opened the club in December 1921. Missing since October 31, 1924." },
    ],
    finding: { prompt: "What words are carved over the bar at The Black Toad?" },
    blocks: [
      { t: "masthead", name: "The Boston Night Courier", line: "Society · Thursday, December 15, 1921" },
      { t: "headline", text: "Miss Castello Receives", size: "l" },
      { t: "deck", text: "A New Supper Club Ten Steps Beneath Summer Street, and a Hostess Nobody Can Quite Place" },
      {
        t: "image",
        src: "/evidence/cassie-arrival.png",
        alt: "A woman in a fur coat and beaded dress steps from a motorcar at night as press photographers raise their cameras.",
        caption: "Miss Castello arrives. Courier photograph.",
      },
      {
        t: "p",
        text: "Boston has acquired, this week, a hostess and a hiding place. The hostess is Miss Cassandra Castello, lately of New York, who wears her pearls long and her opinions longer. The hiding place is hers: a supper club in the deep cellar of the Hollis & Crane Leather Exchange, 245 Summer Street, reached by the freight lift and ten steps down.",
      },
      {
        t: "p",
        text: "Its emblem, painted on a green door, is a black toad caught mid-leap. Its rooms have names. The Lily Pad is the long room with the bandstand. The Well is the bar below the bar. Over that bar, carved into a beam of oak, are four words: LOOK BEFORE YOU LEAP. Miss Castello says they are the only rule that matters.",
      },
      {
        t: "p",
        text: "The accounts will be kept by Mr. C. Kessler, until lately a bookkeeper to the Exchange upstairs, who is said to remember every figure he has ever written down. Asked who has backed the venture, Miss Castello said only that her friends live in the North End and prefer to stay there.",
      },
      {
        t: "p",
        text: "Membership, we are told, is by card, and the cards are issued sixty at a time.",
      },
    ],
  },
  {
    week: 4,
    slug: "members-card",
    number: "Exhibit 245-04",
    kind: "card",
    title: "Member's Card No. 060, and a Matchbook",
    dated: "c. 1922",
    summary: "A member's card with the house rules on the back, and a matchbook naming the four rooms.",
    damage: "Photographed both sides in one pass. The front and back came out as one image and have to be separated and aligned.",
    notes: [
      "The Toad had four rooms: the Lily Pad, the Well, the Counting Room and the Channel Door.",
      "House rules: the Counting Room was the Keeper's alone; the Channel Door was for deliveries and no one else.",
      "The Channel Door opens on a tunnel to the Fort Point Channel, where boats could come and go unseen.",
      "To enter: knock once, wait, knock twice.",
    ],
    persons: [],
    finding: { prompt: "According to the house rules, which room was the Keeper's alone?" },
    blocks: [
      { t: "headline", text: "The Black Toad", size: "m" },
      { t: "deck", text: "Member's card · No. 060 of the Sixty · 245 Summer Street (ask for the freight lift)" },
      {
        t: "fields",
        rows: [
          ["Member", "{{x:18}}"],
          ["Admitted", "March 1922"],
          ["Sponsored by", "C. Castello"],
        ],
      },
      { t: "rule" },
      { t: "headline", text: "House Rules", size: "m" },
      {
        t: "table",
        head: ["", "Rule"],
        rows: [
          ["I", "Knock once. Wait. Knock twice."],
          ["II", "Ten steps down. Count them."],
          ["III", "Masks are welcome. Names are not."],
          ["IV", "The Counting Room is the Keeper's alone."],
          ["V", "The Channel Door is for deliveries, and for no one else."],
          ["VI", "Look before you leap."],
        ],
      },
      { t: "sign", name: "C. Castello", title: "Proprietress · countersigned K. Kessler, Keeper" },
      { t: "rule" },
      {
        t: "box",
        title: "Matchbook, found in the same envelope",
        text: [
          "THE BLACK TOAD · the Lily Pad · the Well · the Counting Room · the Channel Door",
          "Inside the cover, in pencil: “Channel Door → tunnel → Fort Point. Boats at half past, tide willing.”",
        ],
      },
    ],
  },
  {
    week: 5,
    slug: "terror-at-the-black-toad",
    number: "Exhibit 245-05",
    kind: "newspaper",
    title: "Terror at the Black Toad?",
    dated: "Saturday, November 1, 1924",
    summary: "Two years earlier: shots at the 1924 masquerade, no bodies, and the founder gone.",
    damage: "Microfilmed in 1931 at the wrong exposure. The photograph is nearly black and the columns have drifted.",
    notes: [
      "On October 31, 1924, the Toad's masquerade ended in gunfire and panic. The music stopped at 11:47.",
      "Police found no bodies, only a red that came off on a handkerchief like paint.",
      "Cassie Castello vanished that night. Kit Kessler told the Courier she had gone, and the money with her.",
      "By spring 1925 the Toad had reopened with Kessler in charge.",
    ],
    persons: [],
    finding: { prompt: "Who told the Courier that Miss Castello had gone “and the money with her”?", help: "Surname is enough." },
    blocks: [
      { t: "masthead", name: "The Boston Night Courier", line: "Saturday, November 1, 1924 · Two Cents" },
      { t: "headline", text: "Terror at the Black Toad?", size: "xl" },
      { t: "deck", text: "Shots and Screams in Summer Street Cellar · Masked Guests Flee Into the Night · No Bodies Found · Proprietress Missing" },
      {
        t: "image",
        src: "/evidence/raid-1924.png",
        alt: "Police officers stand among overturned chairs and scattered masks in an empty ballroom.",
        caption: "The Lily Pad after the guests had fled. Courier photograph.",
      },
      {
        t: "p",
        text: "Something happened last night in the cellar of 245 Summer Street. What it was depends on whom you ask.",
      },
      {
        t: "p",
        text: "Guests at the All Hallows' masquerade of the club called The Black Toad say that at 11:47 the orchestra stopped mid-bar, the lights dropped, and shots were fired from the direction of the back rooms. Masked men and women poured up the freight lift and into Summer Street, some of them swearing they had seen bodies on the floor.",
      },
      {
        t: "p",
        text: "Police who went down at one o'clock found overturned chairs, a great many masks, and no bodies at all. Patrolman Joseph Healey showed this reporter a handkerchief he had pressed to a stain on the dance floor. The red came off on it like paint.",
      },
      {
        t: "p",
        text: "Of the club's proprietress, Miss Cassandra Castello, there is no sign. Her rooms upstairs are empty, her motorcar is in its garage, and her coat is on its hook. The club's bookkeeper, Mr. Christopher Kessler, met reporters at the freight lift at dawn. “Miss Castello has gone,” he said, “and the money with her. I am sorry for everyone she owed.”",
      },
      { t: "margin", text: "Reopened April 1925. K.K. in charge. — clipping filed with File 245" },
    ],
  },
  {
    week: 6,
    slug: "wires-from-montreal",
    number: "Exhibit 245-06",
    kind: "wire",
    title: "Two Wires from Montreal",
    dated: "October 24 and October 30, 1926",
    summary: "Two telegrams in the week before the murder: one to the Keeper, one to the coat room.",
    damage: "Telegraph strips pasted onto backing card. Several strips lifted and were re-pasted out of order.",
    notes: [
      "A week before his death, Kit Kessler received a wire from Montreal: “You kept the books, I kept the key.” It was signed C.",
      "The day before the masquerade, a second wire from Montreal reached the coat room at 245 Summer Street, addressed to B. Lorne.",
      "The second wire announced an arrival at North Station on the evening train on Sunday, October 31.",
    ],
    persons: [
      { name: "B. Lorne", role: "Coat room, The Black Toad", note: "Received a wire from Montreal the day before the masquerade." },
    ],
    finding: { prompt: "From which city were both wires sent?" },
    blocks: [
      { t: "masthead", name: "Dominion Wire & Cable", line: "Received at Boston · Two messages" },
      {
        t: "wire",
        meta: "MONTREAL QUE OCT 24 1926 · TO THE KEEPER 245 SUMMER ST BOSTON MASS",
        lines: ["TWO YEARS ON STOP THE TOAD REMEMBERS STOP", "YOU KEPT THE BOOKS I KEPT THE KEY STOP", "ELEVEN FORTY SEVEN STOP", "C"],
      },
      {
        t: "wire",
        meta: "MONTREAL QUE OCT 30 1926 · TO B LORNE CARE OF COAT ROOM 245 SUMMER ST BOSTON MASS",
        lines: ["ARRIVE NORTH STATION SUNDAY EVENING TRAIN STOP", "LEAVE THE CHANNEL DOOR ON THE LATCH STOP", "BRING NOTHING STOP"],
      },
      {
        t: "image",
        src: "/evidence/north-station-platform.png",
        alt: "A steam locomotive at a wet platform at dusk, one figure walking away down the platform.",
        caption: "The Montreal train at North Station. Undated; filed with the wires.",
      },
    ],
  },
  {
    week: 7,
    slug: "ledger-page-244",
    number: "Exhibit 245-07",
    kind: "ledger",
    title: "The Keeper's Ledger, Page 244",
    dated: "October 1926",
    summary: "The page before the one that was cut out: who the Keeper paid, and who paid him.",
    damage: "Bound ledger photographed open. The gutter is in shadow and the right-hand column is skewed off the frame.",
    notes: [
      "Kit Kessler's ledger shows payments for silence. The largest in October 1926 went to “Capt. A.T.”",
      "He was holding back the North End backers' share and owed the Fogarty brothers money for the use of the Channel Door.",
      "He wrote that page 245 held “the names that matter” and that he kept it on him. That page was cut out on the night he died.",
    ],
    persons: [
      { name: "The Delvecchio family", role: "North End backers", note: "Their share had been held back for three months." },
      { name: "The Fogarty brothers", role: "Harbor men", note: "Ran boats to the Channel Door. Owed $300." },
      { name: "Judge H. W.", role: "Named in the ledger", note: "Paid $250 for “papers.”" },
    ],
    finding: { prompt: "Who received the largest payment in October 1926?", help: "As the ledger names them." },
    blocks: [
      { t: "masthead", name: "Ledger · K. Kessler", line: "Page 244 · October 1926" },
      {
        t: "table",
        head: ["Name", "Paid", "For"],
        rows: [
          ["Capt. A.T.", "$400.00", "quiet"],
          ["Judge H.W.", "$250.00", "papers"],
          ["Lily Pad Seven (band)", "$60.00 / wk", "wages"],
          ["Delvecchio", "—", "share held back, 3 mos."],
          ["Fogarty Bros.", "owed $300.00", "Channel Door toll"],
          ["N.S., Courier", "$0.00", "refused"],
          ["B.L., coat room", "wages docked", "knows about the key"],
        ],
        note: "Figures as written. “Paid” is what Kessler paid out.",
      },
      { t: "margin", text: "Page 245: the names that matter. Keep it on me. — K." },
    ],
  },
  {
    week: 8,
    slug: "memorandum-not-filed",
    number: "Exhibit 245-08",
    kind: "memo",
    title: "Memorandum, Not Filed",
    dated: "November 1, 1926",
    summary: "The medical examiner's six minutes with the body, and why his notes never reached a file.",
    damage: "Typed on onionskin and folded into eighths. The creases have worn through whole words.",
    notes: [
      "Dr. Pratt was given six minutes with the body. He smelled bitter almonds and saw flushed lips: signs of cyanide, not heart failure.",
      "He judged that the poison worked within minutes. The barman told him the rye was poured at 11:40.",
      "Capt. Thayer's men took the glass before the doctor could keep it, and the captain told him the memorandum would not be filed.",
    ],
    persons: [],
    finding: { prompt: "What poison does Dr. Pratt name?" },
    blocks: [
      { t: "masthead", name: "Office of the Medical Examiner, Suffolk County", line: "Memorandum · Not for filing" },
      {
        t: "fields",
        rows: [
          ["To", "The File"],
          ["From", "L. Pratt, M.D."],
          ["Re", "C. J. Kessler, 245 Summer Street"],
        ],
      },
      {
        t: "p",
        text: "I was admitted to the office at 1:10 a.m. and permitted six minutes with the body before it was removed on the captain's order.",
      },
      {
        t: "p",
        text: "A smell of bitter almonds at the mouth. Pupils wide. Lips and face flushed red. These are the signs of cyanide poisoning, and they are not the signs of a failing heart. A dose of that kind acts within minutes.",
      },
      {
        t: "p",
        text: "The barman Moss tells me the deceased's rye was poured at 11:40 from the house bottle, and that the deceased carried it to his office himself. I asked to keep the glass. It was taken by the captain's men before I could.",
      },
      {
        t: "p",
        text: "I have been told by Capt. Thayer that this memorandum will not be filed. I am writing it anyway.",
      },
      { t: "sign", name: "Lionel Pratt, M.D.", title: "Associate Medical Examiner" },
    ],
  },
  {
    week: 9,
    slug: "shaws-notebook",
    number: "Exhibit 245-09",
    kind: "notebook",
    title: "Shaw's Notebook: Five Statements",
    dated: "November 1, 1926, 12:30 to 12:50 a.m.",
    summary: "The Courier reporter's notes from the twenty minutes before the guests were sent home.",
    damage: "Pencil on cheap paper, smudged by a wet sleeve. Two pages were scanned twice and one not at all.",
    notes: [
      "The barman saw a coat-check tag, number 60, in the dead man's fist.",
      "The drummer says the fuse box sits by the tunnel to the Channel Door.",
      "B. Lorne says she never left the coat room, and that the tag in Kessler's hand had come back to her that night with no coat to match.",
      "The Fogarty boat unloaded at the Channel Door and says it left by 11:45.",
      "A guest says the veiled woman “walked like Cassie” and smelled of the river.",
    ],
    persons: [
      { name: "Bea Lorne", role: "Coat room", note: "Says she never left the coat room." },
      { name: "Rudy Vance", role: "Drummer, the Lily Pad Seven", note: "Knows where the fuse box is." },
      { name: "Tommy Fogarty", role: "Harbor man", note: "Unloaded at the Channel Door that night." },
      { name: "Mrs. Philippa Cort", role: "Guest", note: "Saw the veiled woman up close." },
    ],
    finding: { prompt: "What number was on the coat-check tag in the Keeper's hand?" },
    blocks: [
      { t: "masthead", name: "Notebook · N. Shaw", line: "Taken in the Lily Pad, Nov. 1, 12:30–12:50 a.m. Not printed." },
      {
        t: "statement",
        who: "Artie Moss",
        role: "head barman",
        text: [
          "Poured his rye at twenty to twelve from the house bottle, same as every night. He took it back himself. He always did.",
          "When we got the door off, he had one of Bea's brass tags in his fist. Number 60. Had to open his fingers to read it.",
        ],
      },
      {
        t: "statement",
        who: "Rudy Vance",
        role: "drummer, the Lily Pad Seven",
        text: [
          "The lights didn't flicker. They went, like a hand on a switch. The fuse box is down the tunnel by the Channel Door. Everybody in the band knows that.",
          "The piano? Nobody was at the piano. I'd swear to it.",
        ],
      },
      {
        t: "statement",
        who: "Bea Lorne",
        role: "coat room",
        text: [
          "I never left the coat room. Ask anybody.",
          "Number 60 came back across my counter tonight with no coat to go with it. I put it on the hook and thought nothing of it. Then it was in his hand.",
        ],
      },
      {
        t: "statement",
        who: "Tommy Fogarty",
        role: "harbor man",
        text: ["Our boat was at the Channel Door at half past eleven. Six cases off, and we were back on the water by quarter to twelve. We never set foot past the tunnel."],
      },
      {
        t: "statement",
        who: "Mrs. Philippa Cort",
        role: "guest",
        text: ["She walked like Cassie. I knew Cassie. And when she passed me she smelled of the river."],
      },
      { t: "margin", text: "Thayer has taken the glass. Pratt is furious. — N.S." },
    ],
  },
  {
    week: 10,
    slug: "order-of-impoundment",
    number: "Exhibit 245-10",
    kind: "order",
    title: "Order of Impoundment",
    dated: "Tuesday, November 9, 1926",
    summary: "The court order that sealed everything for a hundred years, and a note left in the box.",
    damage: "The last sheet in the box. Foxed, torn at the seal, and stuck to a second slip of paper that has to be lifted off without losing either.",
    notes: [
      "On November 9, 1926, Judge Horace B. Whitcomb impounded every paper about Kessler's death until October 31, 2026.",
      "A note in the box, initialed N.S., says the missing ledger page never left the Toad.",
      "The file is open. Whoever reads it now knows more than the city was allowed to know in 1926.",
    ],
    persons: [
      { name: "Horace B. Whitcomb", role: "Justice, Suffolk Superior Court", note: "Sealed the file for one hundred years. Very likely the “Judge H.W.” of the ledger." },
    ],
    finding: { prompt: "Which judge signed the Order of Impoundment?", help: "Surname is enough." },
    blocks: [
      { t: "masthead", name: "Commonwealth of Massachusetts", line: "Suffolk Superior Court · In re: the death of C. J. Kessler" },
      { t: "headline", text: "Order of Impoundment", size: "l" },
      {
        t: "p",
        text: "Upon the motion of the Police Commissioner, and the Court finding that publication would endanger the public order, it is ORDERED that every report, statement, photograph, ledger and paper of any kind touching the death of Christopher J. Kessler at 245 Summer Street be placed under seal, and be opened to no person, until the thirty-first day of October, in the year two thousand and twenty-six, one hundred years hence.",
      },
      { t: "sign", name: "Horace B. Whitcomb", title: "Justice of the Superior Court · November 9, 1926" },
      { t: "stamp", text: "IMPOUNDED", tone: "red" },
      { t: "rule" },
      {
        t: "box",
        title: "Slip found stuck to the back of the order",
        text: [
          "To whoever opens this box:",
          "The page is not in here. It never left the Toad.",
          "Look before you leap. — N.S.",
        ],
      },
    ],
  },
];

export function getExhibit(slug: string) {
  return exhibits.find((exhibit) => exhibit.slug === slug);
}

export function getExhibitForWeek(week: number) {
  return exhibits.find((exhibit) => exhibit.week === week);
}
