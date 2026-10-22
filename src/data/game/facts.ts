/**
 * Every clue in the game, as a fact plus the guests who hold it. A fact is held by at
 * least three guests (or two plus a printed exhibit) so one absence can never bury the
 * solution. Lines are written in the second person and contain the words a learner's
 * objective will look for. Survivors may hold facts about their own story, but never
 * alone: the validator insists non-survivors also hold every fact the mysteries need.
 */
import type { Fact } from "./types";

export const facts: Fact[] = [
  // ======================= THE OLD MYSTERY: 1924 =======================
  {
    id: "staged",
    kind: "old",
    truth: "The 1924 massacre was a stage show: stage blood, trick bottles, blank cartridges. Nobody died that night.",
    holders: [
      { guest: "luke", share: "paid", line: "In October 1924 you built stage blood, trick bottles and a rack of breakaway furniture for a “private masquerade,” billed to a post-office box. Nobody told you the show would be called a massacre." },
      { guest: "adam", share: "trade", line: "That October you sold six boxes of blank cartridges to a lady's agent, cash, no name. Blanks. Never a ball." },
      { guest: "emre", share: "free", line: "That night you were called to a fainting guest, not a wound: the “blood” on the glove smelled of beet and sugar. No coroner was ever summoned and you signed no certificate." },
      { guest: "molly", share: "free", line: "The Farrago ran “massacre” on 1 November 1924 and, in your hearing, the city desk admitted that not one coroner, ambulance or undertaker had been called." },
      { guest: "diwakar", share: "paid", line: "On Halloween night 1924 you took a paid fall in a river-town ring and were told to stay down until the music stopped. By morning the whole river knew the Veil's “massacre” was stage blood, and that no coroner had been called." },
      { guest: "leon", share: "free", line: "Your 1 November 1924 bulletin said “massacre.” Off the record, the Sheriff's office told you that no coroner, ambulance or undertaker had been called, and not a body had been found." },
    ],
    exhibits: ["clipping"],
  },
  {
    id: "exit-plan",
    kind: "old",
    truth: "The exit was Cassie's own plan: the Veil's members were to die publicly, take new names and be paid from the vault.",
    holders: [
      { guest: "krrish", share: "trade", line: "In the first days of November 1924 you delivered an odd number of cases of wine to a West Side boarding house, and every guest who signed for them said the same nervous thing: they had been told to be dead for a season, and been paid for it." },
      { guest: "anthony", share: "trade", line: "Late in October 1924 you drew name-change papers for a dozen strangers, “in case of a fire,” said the client. They never came back for copies." },
      { guest: "erika", share: "free", line: "That night you bought a false name from a masked man at the river steps, $20 and no questions. So did half the river. “The Exit,” he called it." },
      { guest: "anika", share: "secret", line: "Your father told you once, drunk, that Mahns money paid everyone's shares on the night of “the Exit,” and that the Veil was never meant to survive Halloween." },
    ],
    exhibits: ["register"],
  },
  {
    id: "kit-ouster",
    kind: "old",
    truth: "Kit Kessler ambushed Cassie at the river launch, ousted her, took the books, and told the members she was finished.",
    holders: [
      { guest: "josh", share: "trade", line: "In the flue of an empty room above the river you read the soot off half-burned pages: “C. is out. K. holds the books. Place them as I wrote.” You still have a torn register page." },
      { guest: "leon", share: "trade", line: "Cassie trusted nobody with the books but the Keeper. You know the books changed hands the night she vanished, and that she called it a betrayal in a note you were never meant to keep." },
      { guest: "tim", share: "secret", line: "You ran the launch at the foot of the river steps that night. Two passengers went down the stairs; one came back alone with blood on his cuff and told you to forget the second. You have not forgotten." },
      { guest: "rebecca", share: "secret", line: "Your boarding-house register still has a page for Room 3 on 31 October 1924: a lady with a bandaged shoulder, and a margin note that “Mr. K.” paid you $200 to forget her." },
    ],
    exhibits: ["register", "boarding"],
  },
  {
    id: "hitman",
    kind: "old",
    truth: "Kit hired hitmen, who settled seventeen members of the Veil over eleven months.",
    holders: [
      { guest: "krrish", share: "paid", line: "In November 1924 you delivered a crate of wine, billed to K. Kessler, to a grey Hudson waiting at the river steps. The driver never gave a name. The car turned up wrecked in the Merrimack that March." },
      { guest: "adam", share: "trade", line: "A stranger bought a short-barrel revolver from you, billed to “K. Kessler, c/o Fitch & Fitch, Boston.” You remember because nobody ever questioned the invoice." },
      { guest: "theodor", share: "free", line: "Between December 1924 and September 1925 seventeen people with no records and no families died in “accidents” in your county: a fire, a fall, a drowning, an aeroplane. You never found a link." },
      { guest: "emre", share: "paid", line: "You reviewed several of those “accidents” and noticed the same thing in each: a small number sewn inside the coat lining, running from 1 to 17 and never beyond." },
    ],
    exhibits: ["receipts"],
  },
  {
    id: "forged",
    kind: "old",
    truth: "The kill orders and receipts blamed on Cassie were forged. Her real hand dots its i's plainly; the forger dots every i with a ring.",
    holders: [
      { guest: "rebecca", share: "paid", line: "You keep the note Cassie left on your pillow in Room 3: “Thank you for the shoulder. — C.” She dots every i with a plain dot, never a ring." },
      { guest: "anthony", share: "paid", line: "In 1925 the court showed you three “orders in Cassie's hand.” You noticed the i's were dotted with tiny rings and the signature was too neat to be hers." },
      { guest: "ananya", share: "paid", line: "The telegram said to carry Cassie's orders was filed at Boston North Station in a clerk's block capitals, paid by a Boston account, on a day Cassie was last seen in Manchester." },
      { guest: "leon", share: "free", line: "Cassie signed with a plain “C.” and never a ring. She called anyone who dotted an i with a ring a show-off." },
    ],
    exhibits: ["forged", "card"],
  },
  {
    id: "cassie-alive",
    kind: "old",
    truth: "Cassie is alive and in hiding.",
    holders: [
      { guest: "tim", share: "trade", line: "You ran the launch the night of 31 October and saw a woman with a bandaged shoulder pull herself out of the water at the foot of the river steps, alive, while the Keeper's car drove away without her." },
      { guest: "rebecca", share: "secret", line: "Cassie hid in your boarding house on the night of 31 October with a bandaged shoulder. She lived, and left a note on your pillow." },
      { guest: "ananya", share: "trade", line: "The five unsigned envelopes were handed in at your counter by a woman in a veil with a stiff left shoulder. She paid in advance, in gold, and said they were from someone who was 'quite well.'" },
      { guest: "sidd", share: "trade", line: "Last winter you flew a woman with a stiff shoulder and a veil to a field outside Boston, no questions asked. She paid in gold and signed the logbook with a plain C." },
    ],
    exhibits: ["card", "wire"],
  },
  {
    id: "vault",
    kind: "old",
    truth: "A vault in the Merrimack Room holds the Veil's real books. It opens to three keys and a dial only Cassie can set.",
    holders: [
      { guest: "anika", share: "secret", line: "You inherited your father's brass key on a ribbon. He called it “the Silent Partner's tooth” and would never say what it opens." },
      { guest: "adam", share: "paid", line: "In 1921 you sold the Veil a vault lock with three keyways and a dial. The combination was set in your shop by one person, a lady, alone." },
      { guest: "josh", share: "paid", line: "The flue of the Merrimack Room runs behind a brick wall that is too thick on the inside. A safe lives there." },
      { guest: "arjun", share: "paid", line: "As a boy you hauled bricks for a wall in the Merrimack Room in 1921, double-thick behind the window. Nobody told you why." },
    ],
    exhibits: ["vault", "books"],
  },

  // ======================= THE NEW MYSTERY: 1926 =======================
  {
    id: "dead-kit",
    kind: "new",
    truth: "The man in the Merrimack Room is Kit Kessler, the Veil's Keeper and bookkeeper, who was thought dead in 1924.",
    holders: [
      { guest: "rebecca", share: "trade", line: "You knew him the moment he came to the river door on the 22nd: Kit Kessler, the Keeper. He asked for the Merrimack Room, and a rye at nine o'clock." },
      { guest: "anika", share: "paid", line: "“K.K.” endorsed every Mahns draft for three years: an old man with a white beard and a watch he never reset." },
      { guest: "anthony", share: "trade", line: "Fitch & Fitch of Boston, who sent you “K. Kessler's” instructions, had one client of that name: the old keeper of a supper club." },
      { guest: "tiffany", share: "free", line: "You cut the brass plate on the Veil's register: “KEEPER · K.K.” You know whose initials those are: Kit Kessler's." },
    ],
    exhibits: ["watch", "drafts", "ticket"],
  },
  {
    id: "nightcap",
    kind: "new",
    truth: "Kit takes a rye nightcap, one finger, with honey, at nine o'clock every night.",
    holders: [
      { guest: "rebecca", share: "trade", line: "His order for tonight: rye, one finger, a spoon of honey, nine o'clock sharp, in the Merrimack Room. You were to bring it." },
      { guest: "mihir", share: "paid", line: "You once lost a bet with him. His terms: “I will be drinking my rye at nine o'clock, with honey in it, wherever I am.”" },
      { guest: "molly", share: "free", line: "The Farrago's 1924 society column called it “the Keeper's nine-o'clock rye with honey.”" },
      { guest: "anika", share: "free", line: "Your father used to mock him: “Nine o'clock, honey in the rye, as if the clock needed him.”" },
      { guest: "silas", share: "free", line: "Before every set in 1924 the Keeper sent the band a note: nothing louder than a whisper at nine o'clock, when he took his rye with honey." },
    ],
    exhibits: ["nightcap"],
  },
  {
    id: "poison",
    kind: "new",
    truth: "He died of strychnine, taken as tincture of nux vomica, in his rye whiskey.",
    holders: [
      { guest: "emre", share: "trade", line: "As the county physician you are the only one who may examine the body. The signs you will find point to strychnine in sweetened rye." },
      { guest: "adam", share: "trade", line: "Your poison register shows the House bought four ounces of nux vomica tincture in September, “for river rats,” signed R. Chow." },
      { guest: "theodor", share: "paid", line: "You hold the Coroner's Folder, sealed until the body is found. Inside is the physician's printed report." },
      { guest: "rhea", share: "paid", line: "Your emporium's druggist sold the House the last bottle of nux vomica in September. The signature on the poison book: R. Chow." },
      { guest: "tim", share: "trade", line: "At the druggist's in September you saw R. Chow of the House sign the poison book for four ounces of nux vomica tincture, “for river rats.”" },
    ],
    exhibits: ["report", "vial"],
  },
  {
    id: "vial",
    kind: "new",
    truth: "The poison was the House's own stock. The Butler sold the single vial to one survivor, who paid with a marker.",
    holders: [
      { guest: "rebecca", share: "secret", line: "You alone sell the House's tincture. One bottle, one sale a night, and only against a numbered marker handed to you by its owner at the bar." },
      { guest: "tim", share: "free", line: "The House keeps a bottle of “rat tincture” under the bar for the river rats. You have seen the Butler lock it away: one sale a night, markers only." },
      { guest: "angelos", share: "trade", line: "Markers are the House's own currency. You have seen the Butler take one in place of cash for something that was on no menu." },
      { guest: "mihir", share: "free", line: "A Veil marker was a number and a promise. The old members carried them, and the House honoured one, once, from its owner only." },
    ],
    exhibits: ["housebook", "vial"],
  },
  {
    id: "marker-map",
    kind: "new",
    truth: "A marker's number is the member's number on the List; the five markers 18 to 22 belong to the five who escaped.",
    holders: [
      { guest: "rebecca", share: "paid", line: "Every marker carries the number of its owner on the Keeper's List. Markers 18 to 22 never came back to the House." },
      { guest: "leon", share: "paid", line: "Cassie's own roll names the five who may still live: Ballard, Crane, Lyle, Marek and Pike. Markers 18 to 22 are theirs." },
      { guest: "josh", share: "paid", line: "The burned sign-out slips from the flue all carried marker numbers. The unburned five, 18 to 22, were never signed back." },
    ],
    exhibits: ["list", "roll"],
  },

  // ======================= THE CONNECTION =======================
  {
    id: "list-prepared",
    kind: "connection",
    truth: "Kit prepared the List of twenty-two members to be placed and settled.",
    holders: [
      { guest: "ananya", share: "trade", line: "In 1925 an old man dictated twenty-two names for you to wire to a Boston lawyer. You wired them and kept the carbon; you understood only when you saw the same hand at the top of the Roll of Placements." },
      { guest: "molly", share: "trade", line: "A Boston courier left a ledger page with you in 1925 headed “Roll of Placements”: twenty-two names, seventeen crossed out in a clerk's hand. You kept it and told no one." },
      { guest: "joel", share: "paid", line: "In 1925 an old man wrote a list of twenty-two names on the counter of your hat shop and crossed them off one by one as the months went by." },
      { guest: "eric", share: "trade", line: "In 1925 a list of twenty-two names, in Kit Kessler's hand, crossed out one by one, came across your bench in a case that was never tried." },
    ],
    exhibits: ["list", "roll"],
  },
  {
    id: "survivors-exist",
    kind: "connection",
    truth: "Five of the twenty-two survived: the five marked unsettled on the List.",
    holders: [
      { guest: "theodor", share: "trade", line: "You counted seventeen “accidents.” A clerk's note you found says “twenty-two to be placed.” Five are unaccounted for." },
      { guest: "emre", share: "trade", line: "The numbers sewn into the coat linings ran 1 to 17. Never 18 to 22." },
      { guest: "molly", share: "paid", line: "Selling the Farrago outside the cemetery gate in 1925, you counted the new graves of the Veil's people: seventeen. A clerk's note you found said “twenty-two to be placed.”" },
      { guest: "leon", share: "trade", line: "Cassie's roll lists twenty-two names and puts a star beside five. “Bring them,” she wrote." },
    ],
    exhibits: ["roll", "list"],
  },
  {
    id: "kit-invites",
    kind: "connection",
    truth: "Kit, writing as the House, sent the nineteen regular guests their invitations. Each owes him something.",
    holders: [
      { guest: "angelos", share: "paid", line: "Your black envelope held a card on stiff House stock, ruled and sealed, signed only “The House.” It was a Boston printer's work. Nothing about it was Cassie's." },
      { guest: "tim", share: "paid", line: "Your invitation was on House stock, signed only “The House,” and posted from Boston. The House has not written to you since 1924, and you owe it a favour you have been dreading." },
      { guest: "sidd", share: "paid", line: "Your black envelope was on House stock, signed only “The House.” The man who used to write the House's notes had a stiff hand, and so did this one." },
    ],
    exhibits: ["invite", "veil-roll"],
  },
  {
    id: "succession",
    kind: "connection",
    truth: "At half past nine Kit meant to crown himself head of the Black Veil before the nineteen guests as witnesses, each of whom had to sign for him.",
    holders: [
      { guest: "theodor", share: "trade", line: "Your invitation carried a private line from the House: be ready at half past nine to swear a man in. It did not say who." },
      { guest: "eric", share: "paid", line: "Your invitation carried a private line from the House: be ready at half past nine to sign a charter. It did not say whose." },
      { guest: "emre", share: "trade", line: "Your invitation carried a private line from the House: be ready at half past nine to certify a death. It did not say whose." },
      { guest: "leon", share: "trade", line: "Your invitation carried a private line from the House: be ready at half past nine to read a bulletin aloud, and the House would supply the text." },
      { guest: "ananya", share: "trade", line: "Your invitation carried a private line from the House: be ready at half past nine to wire a piece of news to every paper in New England." },
      { guest: "rebecca", share: "trade", line: "Your invitation carried a private line from the House: be ready at half past nine to hand the House's keys to its new master." },
      { guest: "tiffany", share: "paid", line: "Your invitation carried a private line from the House: be ready at half past nine to engrave a seal. It did not say for whom." },
      { guest: "silas", share: "paid", line: "Your invitation carried a private line from the House: be ready at half past nine to play the Veil's old fanfare. Nobody has played it since 1924." },
    ],
    exhibits: ["veil-roll", "invite"],
  },
  {
    id: "invites-cassie",
    kind: "connection",
    truth: "Cassie, in hiding, sent the five survivors their own unsigned invitations, ending “The veil lifts.”",
    holders: [
      { guest: "ananya", share: "trade", line: "On 7 October twenty-four envelopes crossed your counter: nineteen signed “The House,” paid for by a Boston account, and five unsigned, in a woman's hand, ending “The veil lifts.”" },
      { guest: "leon", share: "trade", line: "“The veil lifts” is the closing phrase Cassie ended every note with, and it ended the five unsigned envelopes you saw on Ananya's counter. Nobody else writes it that way." },
      { guest: "silas", share: "free", line: "“The veil lifts” was Cassie's own toast to the band every closing night. You would know it anywhere, even in a stranger's hand on an unsigned card." },
    ],
    exhibits: ["wire", "roll"],
  },
  {
    id: "kit-why",
    kind: "connection",
    truth: "Kit came for the Veil. He needs Cassie declared dead and her pin and the dial to open the vault, whose books expose him.",
    holders: [
      { guest: "anika", share: "secret", line: "In 1925 he asked you in writing, three times, for your father's brass key. You never answered." },
      { guest: "josh", share: "trade", line: "In 1925 an old man hired you to read the soot in the Merrimack Room flue and asked, more than once, how thick the wall was behind the window." },
      { guest: "eric", share: "trade", line: "In 1925 an old man asked you, as a hypothetical, how long a person must be missing before a court will declare her dead." },
      { guest: "adam", share: "trade", line: "An old man came to your shop in 1925 and asked whether a safe could be drilled if the dial's combination were lost. You said no, not without the lady who set it." },
    ],
    exhibits: ["books", "vault", "drafts", "invite"],
  },

  // ======================= WHO THE FIVE REALLY ARE =======================
  // 18 · the Teller, in the guise of the oil master Mihir Nagarkatti
  {
    id: "tell-18",
    kind: "identity",
    truth: "No. 18, the Teller, counts imaginary bills with his thumb whenever money comes up.",
    holders: [
      { guest: "diwakar", share: "free", line: "The oilman counts invisible bills with his thumb across his fingertips whenever a purse is mentioned, even when his hands are empty. You have watched him do it across the ring." },
      { guest: "anika", share: "free", line: "At your table he fingers the air like a bank teller counting whenever a bill is mentioned, before the number is finished." },
      { guest: "joel", share: "free", line: "At the club he rubs thumb across fingers whenever anyone says “purse” or “stake,” the way a teller counts." },
    ],
    exhibits: ["list"],
  },
  {
    id: "crack-18",
    kind: "identity",
    truth: "The oilman's books do not fit an oilman; they fit a banker.",
    holders: [
      { guest: "eric", share: "trade", line: "Nag Oil's drilling leases carry no drilling permits, and every payment was counted out in gold by a man who counted like a banker." },
      { guest: "anthony", share: "trade", line: "You drew Nag Oil's incorporation in 1925: capital paid in by one stranger, in gold, and a signature in a clerk's neat hand." },
      { guest: "emre", share: "free", line: "His hands carry no oil. There are clerk's calluses on the right thumb, the kind you earn counting coin for a living." },
    ],
  },
  {
    id: "vouch-angelos",
    kind: "decoy",
    truth: "Angelos's thumb-counting is a card sharp's habit, not a teller's. He has played cards since 1919.",
    holders: [
      { guest: "arjun", share: "free", line: "Angelos counts the pot with his thumb across his fingertips the way every card sharp does. He did it when you were both at Rockingham Park in 1919." },
      { guest: "tim", share: "free", line: "You have lost to Angelos at cards since 1919. The way he counts chips with his thumb is just the trade." },
      { guest: "josh", share: "free", line: "You read his palm once: a gambler's lines and a gambler's habit. He has counted that way his whole life." },
    ],
  },
  {
    id: "motive-18",
    kind: "motive",
    truth: "Kit paid the hitman out of the Teller's own share of the exit money.",
    holders: [
      { guest: "krrish", share: "trade", line: "The draft that bought the hitman's grey Hudson was drawn on an account stubbed “Crane, advance.” The money was somebody's own share." },
      { guest: "anthony", share: "trade", line: "You drew the advance papers in 1924. The Teller's share sat in an account stubbed “Crane, advance,” and later you saw the same stub on the hitman's bills." },
      { guest: "tim", share: "trade", line: "The launch fare for the vault advance was paid out of “the Teller's share.” Later you learned that same share paid the hitman." },
    ],
    exhibits: ["receipts"],
  },

  // 19 · the Notary, in the guise of the carnival barker Luke Shelldon
  {
    id: "tell-19",
    kind: "identity",
    truth: "No. 19, the Notary, rings every i and taps the pen twice when signing.",
    holders: [
      { guest: "tiffany", share: "free", line: "Every handbill the barker paints has a tiny ring over each i, and when he signs for a delivery he taps his pen twice afterward, as if sealing it." },
      { guest: "arjun", share: "free", line: "The barker signed your ticket with a ring over every i and tapped his pen twice, like a notary sealing a deed." },
      { guest: "diwakar", share: "free", line: "On the fight poster the barker lettered, every i wears a tiny ring. He tapped his pen twice when he signed the purse." },
    ],
    exhibits: ["forged", "register", "list"],
  },
  {
    id: "crack-19",
    kind: "identity",
    truth: "The barker is a notary and forger; the megaphone is a cover.",
    holders: [
      { guest: "anthony", share: "trade", line: "He corrected the statute number in a carnival licence you drafted, without being asked. A barker should not know that." },
      { guest: "erika", share: "free", line: "He looked at your false papers for one second and named the stationer who printed them. Forgers know forgers." },
      { guest: "silas", share: "trade", line: "At your table he copied a signature onto a napkin so exactly that you could not tell it from the original, then burned it, laughing. A hand like that is a trade, not a hobby." },
    ],
  },
  {
    id: "vouch-emre",
    kind: "decoy",
    truth: "The Doctor's ringed i's are a physician's habit; his medical diploma is genuine.",
    holders: [
      { guest: "sidd", share: "free", line: "Dr. Sunner dots his i's with a tiny ring, as you saw on the prescription for your airsickness. Every prescription clerk in the county was taught to, and his diploma is genuine." },
      { guest: "joel", share: "free", line: "Dr. Sunner has written your headache powders with ringed i's since 1925. It is a pharmacy habit, nothing more." },
      { guest: "krrish", share: "free", line: "Dr. Sunner's prescription for the cough you catch in the cellar has ringed i's, like every physician's. It is the training, not a trick." },
    ],
  },
  {
    id: "motive-19",
    kind: "motive",
    truth: "Kit forced the Notary to sign the kill orders as Cassie's, then listed him for death.",
    holders: [
      { guest: "anthony", share: "trade", line: "The three forged orders carry the smudge of a notary's embossing seal, as if a notary had been made to sign them against his will." },
      { guest: "ananya", share: "trade", line: "A telegraph slip once passed under your pencil: “Notary to sign forged orders under duress; if he refuses, he joins the List.”" },
      { guest: "josh", share: "trade", line: "You read a half-burned notary's seal out of the flue, ringed with the letters E.L., together with scraps of forged orders signed in Cassie's name." },
    ],
    exhibits: ["forged", "register"],
  },

  // 20 · the Milliner, in the guise of the department-store owner Rhea Mallya
  {
    id: "tell-20",
    kind: "identity",
    truth: "No. 20, the Milliner, straightens every hat brim she passes.",
    holders: [
      { guest: "anika", share: "free", line: "At every party she straightens somebody's hat brim, hers, yours, a stranger's, without noticing she has done it." },
      { guest: "joel", share: "free", line: "She turned your hat a quarter inch in the cloakroom and did not say sorry." },
      { guest: "krrish", share: "free", line: "In your cellar she set a customer's hat straight on her way past and never broke step." },
    ],
    exhibits: ["list"],
  },
  {
    id: "crack-20",
    kind: "identity",
    truth: "The department-store owner prices cloth like a dressmaker and has a seamstress's hands.",
    holders: [
      { guest: "tiffany", share: "free", line: "She asked who cut your apron, and named the maker and the dye lot at a glance." },
      { guest: "silas", share: "free", line: "She priced your tails to the penny from across the room and told you where your tailor had cut a corner." },
      { guest: "emre", share: "free", line: "Her left forefinger carries a seamstress's pin-pricks. A shopkeeper's hands do not look like that." },
    ],
  },
  {
    id: "vouch-silas",
    kind: "decoy",
    truth: "Silas tips his hat and sets the brim straight because he is a bandleader.",
    holders: [
      { guest: "joel", share: "free", line: "Silas tips his hat to everyone and sets the brim straight afterward. You have seen it at every club since 1921: a bandleader's courtesy." },
      { guest: "arjun", share: "free", line: "The bandleader has tipped his hat to you across the dugout rail for three seasons. It is a stage habit." },
      { guest: "josh", share: "free", line: "You have the photographs: Silas tips his hat at every greeting, in every photograph, since the band began." },
    ],
  },
  {
    id: "motive-20",
    kind: "motive",
    truth: "Kit's hitman killed the Milliner's seamstresses, one at a time, so nobody could say who sewed the masks for the Exit.",
    holders: [
      { guest: "anika", share: "trade", line: "The seamstresses who made the gowns and masks for the Veil's last masquerade were dead within the year, one at a time, and the dressmaker who ran them was never found." },
      { guest: "emre", share: "trade", line: "You certified Olive Brandt, a seamstress, in February 1925 after a carriage ran her down. The pins in her hem were the Veil's masks. Every girl in her room died within the year." },
      { guest: "silas", share: "trade", line: "The girls who sewed the band's costumes were killed one by one that winter. You asked the costume mistress to dress the band again; she had vanished." },
    ],
    exhibits: ["list"],
  },

  // 21 · the Doorman, in the guise of the gunsmith Adam Holdsfire
  {
    id: "tell-21",
    kind: "identity",
    truth: "No. 21, the Doorman, will not sit with his back to a door and always counts the exits.",
    holders: [
      { guest: "erika", share: "free", line: "The gunsmith never sits with his back to a door and always counts the exits. You recognise it because you do it too." },
      { guest: "tiffany", share: "free", line: "He moved his chair twice tonight, until he could see the door." },
      { guest: "krrish", share: "free", line: "In your cellar he refused the armchair with its back to the door, and took a stool where he could see both entrances." },
    ],
    exhibits: ["list"],
  },
  {
    id: "crack-21",
    kind: "identity",
    truth: "The gunsmith's register is not a gunsmith's; his knuckles and memory are a doorman's.",
    holders: [
      { guest: "theodor", share: "free", line: "His register of every gun he has sold has never once been shown to you for a licence check, and he can name any customer's face after one look." },
      { guest: "arjun", share: "free", line: "His knuckles are split-scarred the way a bouncer's get, not powder-burned the way a gunsmith's do. You have seen enough scarred hands in the clubhouse to know." },
      { guest: "joel", share: "free", line: "He knew every name in the room after one introduction, like a man trained to remember who he lets through a door. You introduced him to forty people last night." },
    ],
  },
  {
    id: "vouch-erika",
    kind: "decoy",
    truth: "Erika checks exits because she is a fugitive.",
    holders: [
      { guest: "sidd", share: "free", line: "Erika has sat facing the door of every hangar you ever hid her in. It is a fugitive's habit, and everybody knows it." },
      { guest: "arjun", share: "free", line: "At the ballpark Erika sits in the top row facing the gate. A fugitive's habit, nothing more." },
      { guest: "ananya", share: "free", line: "Erika bought a telegram form from you and watched the door the whole time. A fugitive's habit, nothing more." },
    ],
  },
  {
    id: "vouch-theodor",
    kind: "decoy",
    truth: "The Sheriff checks exits because he is a lawman.",
    holders: [
      { guest: "tiffany", share: "free", line: "The Sheriff counts the windows and the doors of every room before he sits. You hung his office windows; he checked them for exits first." },
      { guest: "sidd", share: "free", line: "At the aerodrome the Sheriff checks every exit before he will stand beside a plane. A lawman's habit." },
      { guest: "erika", share: "free", line: "You have watched the Sheriff check every exit in every room for a year. It's habit, not guilt." },
    ],
  },
  {
    id: "motive-21",
    kind: "motive",
    truth: "Kit's hitmen killed the Doorman's partner, Ignatius Bell, who held the second door.",
    holders: [
      { guest: "theodor", share: "trade", line: "On 15 September 1925 a man named Ignatius Bell was shot in a “brawl” at a Granite Street shed. Nobody claimed his body." },
      { guest: "sidd", share: "trade", line: "A flier who barnstormed the Granite Street fairground that fall heard that Ignatius Bell, who held the second door at the Veil, was shot in the shed behind it, and that the big man who worked the other door was never found." },
      { guest: "angelos", share: "trade", line: "Ignatius Bell, who held the second door at the Veil, owed you twenty dollars. He was shot in a Granite Street shed, and the big man who worked the other door was never found." },
    ],
    exhibits: ["receipts"],
  },

  // 22 · the Runner, in the guise of the newsie Molly Daniel
  {
    id: "tell-22",
    kind: "identity",
    truth: "No. 22, the Runner, glances at the nearest clock every time a door opens.",
    holders: [
      { guest: "arjun", share: "free", line: "The newsie glances at the nearest clock every time a door opens, even in the dugout where nothing is ever late." },
      { guest: "ananya", share: "free", line: "At the telegraph office she looks at the clock whenever the bell on the door rings, as if she had a message to deliver." },
      { guest: "eric", share: "free", line: "In your corridor she checks the court clock every time a door opens, like a courier counting minutes." },
    ],
    exhibits: ["list"],
  },
  {
    id: "crack-22",
    kind: "identity",
    truth: "The newsie knows the town like a courier, not like a paper seller.",
    holders: [
      { guest: "diwakar", share: "free", line: "You asked her for a short cut to the ring, and she named the back stair behind the Farrago's pressroom that runs straight down to the river road. That is a runner's knowledge, not a newsie's." },
      { guest: "tim", share: "free", line: "She once walked from the river steps to Elm Street in four minutes by streets that are not on any map. A courier's trick." },
      { guest: "sidd", share: "free", line: "She read your logbook upside down across the table and corrected your arithmetic. A courier learns to read anything from any side." },
    ],
  },
  {
    id: "vouch-sidd",
    kind: "decoy",
    truth: "Sidd checks his watch because he is a flier.",
    holders: [
      { guest: "tiffany", share: "free", line: "Sidd checks his wristwatch every time a door opens. A flier counts minutes by habit and has done since the war." },
      { guest: "diwakar", share: "free", line: "The barnstormer glances at his wristwatch at every knock. He told you a flier is always late for something." },
      { guest: "krrish", share: "free", line: "Sidd checks his watch whenever you deliver a crate, which you have always taken for a flier's nerves." },
    ],
  },
  {
    id: "motive-22",
    kind: "motive",
    truth: "Kit had the Veil's runners killed one at a time, the last thrown into the river off the Granite Street steps, and paid for it out of the Runner's own share.",
    holders: [
      { guest: "tim", share: "trade", line: "That winter the Veil's runners died one at a time. The last was thrown into the river off the Granite Street steps, and the boatman who did it bragged that it was paid for out of the other runner's own share." },
      { guest: "theodor", share: "trade", line: "Three of your 1925 “accidents” were runners who carried messages for the Veil; the last drowned in the river and the coroner said accident. The girl who ran with them was never found." },
      { guest: "erika", share: "paid", line: "You hid on the river road that winter and watched the Veil's runners go one by one; the last was thrown off the steps, and the girl who ran with him ran." },
    ],
    exhibits: ["receipts"],
  },
];

export const factById = new Map(facts.map((fact) => [fact.id, fact]));
