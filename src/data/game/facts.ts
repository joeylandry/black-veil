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
      { guest: "luke", share: "trade", line: "In October 1924 you built stage blood, trick bottles and a rack of breakaway furniture for a “private masquerade,” billed to a post-office box. Nobody told you the show would be called a massacre." },
      { guest: "adam", share: "trade", line: "That October you sold six boxes of blank cartridges to a lady's agent, cash, no name. Blanks. Never a ball." },
      { guest: "emre", share: "free", line: "That night you were called to a fainting guest, not a wound: the “blood” on the glove smelled of beet and sugar. No coroner was ever summoned and you signed no certificate." },
      { guest: "molly", share: "free", line: "The Farrago ran “massacre” on 1 November 1924 and, in your hearing, the city desk admitted that not one coroner, ambulance or undertaker had been called." },
    ],
    exhibits: ["clipping"],
  },
  {
    id: "exit-plan",
    kind: "old",
    truth: "The exit was Cassie's own plan: the Veil's members were to die publicly, take new names and be paid from the vault.",
    holders: [
      { guest: "rebecca", share: "trade", line: "In the first days of November 1924 your boarding house filled with people who arrived with cash, new papers and the same nervous story: they had been told to be dead for a season, and been paid for it." },
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
      { guest: "josh", share: "trade", line: "In the flue of an empty room above the river you swept up half-burned pages: “C. is out. K. holds the books. Place them as I wrote.” You still have a torn register page." },
      { guest: "leon", share: "trade", line: "Cassie trusted nobody with the books but the Keeper. You know the books changed hands the night she vanished, and that she called it a betrayal in a note you were never meant to keep." },
      { guest: "tim", share: "secret", line: "You ran the launch at the foot of the river steps that night. Two passengers went down the stairs; one came back alone with blood on his cuff and told you to forget the second. You have not forgotten." },
      { guest: "rebecca", share: "secret", line: "Your boarding-house register still has a page for Room 3 on 31 October 1924: a lady with a bandaged shoulder, and a margin note that “Mr. K.” paid you $200 to forget her." },
    ],
    exhibits: ["register", "boarding"],
  },
  {
    id: "hitman",
    kind: "old",
    truth: "Kit hired a hitman, Augustus Quill, who settled seventeen members of the Veil over eleven months.",
    holders: [
      { guest: "jack", share: "trade", line: "In November 1924 you sold a grey Hudson to a man called Quill, paid by a draft on a Boston account signed K. Kessler. The car turned up wrecked in the Merrimack that March." },
      { guest: "adam", share: "trade", line: "A man called Quill bought a short-barrel revolver from you, billed to “K. Kessler, c/o Fitch & Fitch, Boston.” You remember because nobody ever questioned the invoice." },
      { guest: "theodor", share: "free", line: "Between December 1924 and September 1925 seventeen people with no records and no families died in “accidents” in your county: a fire, a fall, a drowning, an aeroplane. You never found a link." },
      { guest: "emre", share: "trade", line: "You reviewed several of those “accidents” and noticed the same thing in each: a small number sewn inside the coat lining, running from 1 to 17 and never beyond." },
    ],
    exhibits: ["quill"],
  },
  {
    id: "forged",
    kind: "old",
    truth: "The kill orders blamed on Cassie were forged. Her real hand dots its i's plainly; the forger dots every i with a ring.",
    holders: [
      { guest: "rebecca", share: "trade", line: "You keep Cassie's Christmas card from 1925. She dots every i with a plain dot, never a ring." },
      { guest: "anthony", share: "trade", line: "In 1925 the court showed you three “orders in Cassie's hand.” You noticed the i's were dotted with tiny rings and the signature was too neat to be hers." },
      { guest: "ananya", share: "trade", line: "The telegram said to carry Cassie's orders was filed at Boston North Station in a clerk's block capitals, paid by a Boston account, on a day Cassie was last seen in Manchester." },
      { guest: "leon", share: "free", line: "Cassie signed with a plain “C.” and never a ring. She called anyone who dotted an i with a ring a show-off." },
    ],
    exhibits: ["forged", "card"],
  },
  {
    id: "cassie-alive",
    kind: "old",
    truth: "Cassie is alive and in hiding in Montreal.",
    holders: [
      { guest: "leon", share: "secret", line: "Every other Sunday you read an innocent “I am well” item on WFEA, a code Cassie arranged to say she lives. The signature phrase is her old scat call." },
      { guest: "rebecca", share: "secret", line: "Cassie hid in your boarding house on the night of 31 October with a bandaged shoulder. She lived. A Christmas card came the next year." },
      { guest: "ananya", share: "trade", line: "Every “I am well” item Leon airs was filed from Montreal. You have seen the stamp on the telegram slip." },
    ],
    exhibits: ["card", "wire"],
  },
  {
    id: "vault",
    kind: "old",
    truth: "A vault in the Merrimack Room holds the Veil's real books. It opens to three keys and a dial only Cassie can set.",
    holders: [
      { guest: "anika", share: "secret", line: "You inherited your father's brass key on a ribbon. He called it “the Silent Partner's tooth” and would never say what it opens." },
      { guest: "adam", share: "trade", line: "In 1921 you sold the Veil a vault lock with three keyways and a dial. The combination was set in your shop by one person, a lady, alone." },
      { guest: "josh", share: "trade", line: "The flue of the Merrimack Room runs behind a brick wall that is too thick on the inside. A safe lives there." },
      { guest: "arjun", share: "free", line: "As a boy you hauled bricks for a wall in the Merrimack Room in 1921, double-thick behind the window. Nobody told you why." },
    ],
    exhibits: ["vault", "books"],
  },

  // ======================= THE NEW MYSTERY: 1926 =======================
  {
    id: "dead-kit",
    kind: "new",
    truth: "The man in the Merrimack Room is Kit Kessler, the Veil's Keeper and bookkeeper, who was thought dead in 1924.",
    holders: [
      { guest: "rebecca", share: "trade", line: "You knew him the moment he came to the river door on the 22nd: Kit Kessler, the Keeper. He asked for the Merrimack Room, and a rye at half past eight." },
      { guest: "anika", share: "trade", line: "“K.K.” endorsed every Mahns draft for three years: an old man with a white beard and a watch he never reset." },
      { guest: "anthony", share: "trade", line: "Fitch & Fitch of Boston, who sent you “K. Kessler's” instructions, had one client of that name: the old keeper of a supper club." },
      { guest: "tiffany", share: "free", line: "You cut the brass plate on the Veil's register: “KEEPER · K.K.” You know whose initials those are: Kit Kessler's." },
    ],
    exhibits: ["watch", "drafts", "ticket"],
  },
  {
    id: "nightcap",
    kind: "new",
    truth: "Kit takes a rye nightcap, one finger, with honey, at half past eight every night.",
    holders: [
      { guest: "rebecca", share: "trade", line: "His order for tonight: rye, one finger, a spoon of honey, half past eight sharp, in the Merrimack Room. You were to bring it." },
      { guest: "mihir", share: "free", line: "You once lost a bet with him. His terms: “I will be drinking my rye at half past eight, with honey in it, wherever I am.”" },
      { guest: "molly", share: "free", line: "The Farrago's 1924 society column called it “the Keeper's half-past-eight rye with honey.”" },
      { guest: "anika", share: "free", line: "Your father used to mock him: “Half past eight, honey in the rye, as if the clock needed him.”" },
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
      { guest: "theodor", share: "trade", line: "You hold the Coroner's Folder, sealed until the body is found. Inside is the physician's printed report." },
      { guest: "rhea", share: "trade", line: "Your emporium's druggist sold the House the last bottle of nux vomica in September. The signature on the poison book: R. Chow." },
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
      { guest: "rebecca", share: "trade", line: "Every marker carries the number of its owner on the Keeper's List. Markers 18 to 22 never came back to the House." },
      { guest: "leon", share: "trade", line: "Cassie's own roll names the five who may still live: Ballard, Crane, Lyle, Marek and Pike. Markers 18 to 22 are theirs." },
      { guest: "josh", share: "trade", line: "The burned sign-out slips from the flue all carried marker numbers. The unburned five, 18 to 22, were never signed back." },
    ],
    exhibits: ["list", "roll"],
  },

  // ======================= THE CONNECTION =======================
  {
    id: "list-prepared",
    kind: "connection",
    truth: "Kit prepared the List of twenty-two members to be placed and settled.",
    holders: [
      { guest: "ananya", share: "trade", line: "Cassie's wire asked only WHO PREPARED THE LIST. The List is in the binder on the Keeper's table; you did not understand the wire until you saw the name at the top." },
      { guest: "molly", share: "trade", line: "Two memorial notices ran and were withdrawn in the Farrago on the same day: for “Bertrand Crane” and “Sylvester Ballard,” names nobody could trace. You kept the proofs." },
      { guest: "rebecca", share: "secret", line: "You saw the List once: Kit's handwriting, column after column, with a tick beside most of the names." },
    ],
    exhibits: ["list", "wire", "memorials"],
  },
  {
    id: "survivors-exist",
    kind: "connection",
    truth: "Five of the twenty-two survived: the five marked unsettled on the List.",
    holders: [
      { guest: "theodor", share: "trade", line: "You counted seventeen “accidents.” A clerk's note you found says “twenty-two to be placed.” Five are unaccounted for." },
      { guest: "emre", share: "trade", line: "The numbers sewn into the coat linings ran 1 to 17. Never 18 to 22." },
      { guest: "molly", share: "trade", line: "The two memorial notices in the Farrago both named people with no grave, for names that later turned up on nobody's census." },
      { guest: "leon", share: "trade", line: "Cassie's roll lists twenty-two names and puts a star beside five. “Bring them,” she wrote." },
    ],
    exhibits: ["roll", "memorials", "list"],
  },
  {
    id: "invites-cassie",
    kind: "connection",
    truth: "Cassie, from Montreal, sent the invitations and the wire.",
    holders: [
      { guest: "ananya", share: "trade", line: "The black-envelope wire was filed, and paid for, in Montreal before the envelopes existed." },
      { guest: "molly", share: "free", line: "No Manchester printer made the envelopes. The type is Cuthbert's Old Face, which is only sold in Montreal." },
      { guest: "luke", share: "free", line: "Your own carnival handbills come from Cuthbert & Sons of Montreal, the same face and the same black ink. You would know it anywhere." },
      { guest: "leon", share: "trade", line: "The invitation's closing phrase, “The veil lifts,” is the same one Cassie ends every note with. Nobody else writes it that way." },
    ],
    exhibits: ["wire", "invite", "roll"],
  },
  {
    id: "kit-why",
    kind: "connection",
    truth: "Kit came to the party for Cassie and the dial. The vault's books expose him.",
    holders: [
      { guest: "anika", share: "secret", line: "In 1925 he asked you in writing, three times, for your father's brass key. You never answered." },
      { guest: "josh", share: "trade", line: "In 1925 an old man hired you to sweep the Merrimack Room flue and asked, more than once, how thick the wall was behind the window." },
      { guest: "adam", share: "trade", line: "An old man came to your shop in 1925 and asked whether a safe could be drilled if the dial's combination were lost. You said no, not without the lady who set it." },
    ],
    exhibits: ["books", "vault", "drafts", "invite"],
  },

  // ======================= WHO THE FIVE REALLY ARE =======================
  // 18 · the Teller, in the guise of the prizefighter Diwakar Sandhu
  {
    id: "tell-18",
    kind: "identity",
    truth: "No. 18, the Teller, counts imaginary bills with his thumb whenever money comes up.",
    holders: [
      { guest: "angelos", share: "free", line: "Sandbag counts a pot faster than any dealer, thumb across the fingertips, even when there is nothing in his hand." },
      { guest: "arjun", share: "free", line: "In the clubhouse the prizefighter rubs thumb across fingers whenever anyone says “purse.”" },
      { guest: "jack", share: "free", line: "When you quote a price he fingers the air like a bank teller counting, before you have finished the number." },
    ],
    exhibits: ["list", "memorials"],
  },
  {
    id: "crack-18",
    kind: "identity",
    truth: "The prizefighter's record does not fit a prizefighter; it fits a banker.",
    holders: [
      { guest: "mihir", share: "trade", line: "“Sandbag” has dropped eleven bouts and every drop landed exactly on a favourable line. No fighter is that precise. A banker might be." },
      { guest: "emre", share: "free", line: "His hands carry no scarring a fighter of his record should have. There are clerk's calluses on the right thumb." },
      { guest: "arjun", share: "free", line: "No ring register in Manchester has ever listed a Sandhu bout. He only fights in the river towns." },
    ],
  },
  {
    id: "vouch-mihir",
    kind: "decoy",
    truth: "Mihir's money-counting is a bookmaker's habit, not a teller's. Mihir has been a bookmaker since 1919.",
    holders: [
      { guest: "angelos", share: "free", line: "Mihir counts money left-handed with a flick of the thumb, the way every bookmaker at Rockingham Park does. He has done it since 1919." },
      { guest: "tim", share: "free", line: "You have sold gin to Mihir since 1919. The way he flicks bills is just the bookmaker's trade." },
      { guest: "anthony", share: "free", line: "You drew up Mihir's racetrack lease in 1919. He has been a bookmaker ever since; the paperwork is real." },
    ],
  },
  {
    id: "motive-18",
    kind: "motive",
    truth: "Kit paid the hitman out of the Teller's own share of the exit money.",
    holders: [
      { guest: "jack", share: "trade", line: "The draft that bought Quill's Hudson was drawn on an account stubbed “Crane, advance.” The money was somebody's own share." },
      { guest: "adam", share: "trade", line: "Quill's revolver was paid for out of the same “Crane, advance” stub. It struck you as bitter that a man's own money should pay for his own funeral." },
      { guest: "tim", share: "trade", line: "The launch fare for the vault advance was paid out of “the Teller's share.” Later you learned that same share paid the hitman." },
    ],
    exhibits: ["quill"],
  },

  // 19 · the Notary, in the guise of the bandleader Silas Palmer
  {
    id: "tell-19",
    kind: "identity",
    truth: "No. 19, the Notary, rings every i and taps the pen twice when signing.",
    holders: [
      { guest: "rhea", share: "free", line: "Every signature on the band's account at the emporium has a tiny ring over each i, and two taps of the pen afterward, as if sealing it." },
      { guest: "molly", share: "free", line: "The bandleader's autographs for the fans are all copperplate, rings over every i, two taps of the pen." },
      { guest: "mihir", share: "free", line: "The bandleader signed your betting slip with a tiny ring over every i and tapped his pen twice, like a notary sealing a deed." },
    ],
    exhibits: ["forged", "register", "list"],
  },
  {
    id: "crack-19",
    kind: "identity",
    truth: "The bandleader is a notary and forger; the band is a cover.",
    holders: [
      { guest: "luke", share: "free", line: "Palmer's band can't play a Charleston. But the bandleader spotted a forged bill at ten paces and refused three of yours." },
      { guest: "anika", share: "free", line: "He corrected the statute number on a lease amendment of yours without being asked. A bandleader should not know that." },
      { guest: "angelos", share: "trade", line: "At your table he forged a bar-bill signature perfectly to win a bet, then burned it. A hand like that is a trade, not a hobby." },
    ],
  },
  {
    id: "vouch-anthony",
    kind: "decoy",
    truth: "Anthony's flourish is a lawyer's; his bar admission is genuine.",
    holders: [
      { guest: "theodor", share: "free", line: "Anthony's signature flourish is the lawyer's kind, and you have seen his bar card. It is genuine." },
      { guest: "emre", share: "free", line: "You have treated Anthony for ink-cramp every winter since 1920. The flourish is just habit." },
      { guest: "rhea", share: "free", line: "Anthony's signature on the emporium's lease has a flourish, but it was witnessed by three other lawyers." },
    ],
  },
  {
    id: "motive-19",
    kind: "motive",
    truth: "Kit forced the Notary to sign the kill orders as Cassie's, then listed him for death.",
    holders: [
      { guest: "anthony", share: "trade", line: "The three forged orders carry the smudge of a notary's embossing seal, as if a notary had been made to sign them against his will." },
      { guest: "ananya", share: "trade", line: "A telegraph slip once passed under your pencil: “Notary to sign forged orders under duress; if he refuses, he joins the List.”" },
      { guest: "josh", share: "trade", line: "You swept a half-burned notary's seal out of the flue, ringed with the letters E.L., together with scraps of forged orders signed in Cassie's name." },
    ],
    exhibits: ["forged", "register"],
  },

  // 20 · the Maestro, in the guise of Judge Eric Li
  {
    id: "tell-20",
    kind: "identity",
    truth: "No. 20, the Maestro, conducts four-four time with two fingers whenever music or rhythm is in the room.",
    holders: [
      { guest: "theodor", share: "free", line: "On the bench the judge beats four-four with two fingers while a witness testifies, and his gavel lands on the beat." },
      { guest: "anthony", share: "free", line: "In chambers the judge conducts the court reporter's typing with two fingers, and has never once cited a precedent." },
      { guest: "emre", share: "free", line: "At the club, when the gramophone plays, the judge conducts it with two fingers and does not notice he is doing it." },
    ],
    exhibits: ["list", "memorials"],
  },
  {
    id: "crack-20",
    kind: "identity",
    truth: "The judge cannot recite law but knows every record in the catalogue; he is a musician.",
    holders: [
      { guest: "anthony", share: "trade", line: "The judge cannot name a precedent but can hum every Victor record. He dismissed all your cases on “form” after listening to four bars." },
      { guest: "luke", share: "free", line: "A carnival bandsman recognised the judge's upbeat: “That's a bandleader's downbeat, not a bench's.”" },
      { guest: "angelos", share: "free", line: "The judge once bet you he could name any Victor record from its first four bars. He named all twelve, and conducted the last of them with two fingers." },
    ],
  },
  {
    id: "vouch-molly",
    kind: "decoy",
    truth: "Molly's rhythmic chanting is the newsie's cry she has used since 1919.",
    holders: [
      { guest: "leon", share: "free", line: "Molly chants her headlines in a steady four-four every evening on your air. She has done it since 1919." },
      { guest: "tim", share: "free", line: "Molly's newsie chant has been the same four-beat cry at the same corner for years." },
      { guest: "arjun", share: "free", line: "Molly sold you your first newspaper in 1919, with the same chant. It is a newsie's rhythm, nothing more." },
    ],
  },
  {
    id: "motive-20",
    kind: "motive",
    truth: "Kit's hitman killed the Maestro's band: the drummer, the singer and the pianist.",
    holders: [
      { guest: "molly", share: "trade", line: "Within six months in 1925 the Farrago reported three members of one small band dead: a drummer in a motor-bus, a singer from a window, a pianist from a stove flue. All three died." },
      { guest: "emre", share: "trade", line: "You certified the pianist, Clem Rourke, as carbon monoxide from a stove. He had no flue to blame, and his whole band died within six months." },
      { guest: "luke", share: "free", line: "Carnival bandsmen talked: all three players from one band died inside six months, none with a family." },
    ],
  },

  // 21 · the Doorman, in the guise of the aviator Siddarth Arvind
  {
    id: "tell-21",
    kind: "identity",
    truth: "No. 21, the Doorman, will not sit with his back to a door and always counts the exits.",
    holders: [
      { guest: "erika", share: "free", line: "The aviator never sits with his back to a door and always counts the exits. You recognise it because you do it too." },
      { guest: "jack", share: "free", line: "In your showroom he refused the armchair with its back to the door, and took a stool where he could see both entrances." },
      { guest: "tiffany", share: "free", line: "He moved his chair twice tonight, until he could see the door." },
    ],
    exhibits: ["list"],
  },
  {
    id: "crack-21",
    kind: "identity",
    truth: "The aviator's logbook is not an aviator's; his knuckles and memory are a doorman's.",
    holders: [
      { guest: "jack", share: "trade", line: "His aeroplane logbook lists no airfield in New England. You asked; he changed the subject." },
      { guest: "emre", share: "free", line: "His knuckles are split-scarred the way a doorman's get, not rope-burned the way a flyer's do." },
      { guest: "molly", share: "free", line: "He knew every name in the room after one introduction, like a man trained to remember who he lets through a door." },
    ],
  },
  {
    id: "vouch-theodor",
    kind: "decoy",
    truth: "The Sheriff checks exits because he is a lawman.",
    holders: [
      { guest: "tiffany", share: "free", line: "The Sheriff counts the windows and the doors of every room before he sits. You hung his office windows; he checked them for exits first." },
      { guest: "leon", share: "free", line: "On his radio feud, the Sheriff always asks where the exits are before he agrees to a broadcast." },
      { guest: "erika", share: "free", line: "You have watched the Sheriff check every exit in every room for a year. It's habit, not guilt." },
    ],
  },
  {
    id: "motive-21",
    kind: "motive",
    truth: "Kit's hitman killed the Doorman's partner, Ignatius Bell, who held the second door.",
    holders: [
      { guest: "theodor", share: "trade", line: "On 15 September 1925 a man named Ignatius Bell was shot in a “brawl” at a Granite Street shed. Nobody claimed his body." },
      { guest: "adam", share: "trade", line: "The revolver that killed Ignatius Bell came from your shop. Quill's invoice, again." },
      { guest: "angelos", share: "trade", line: "Ignatius Bell, who held the second door at the Veil, owed you twenty dollars. He was shot in a Granite Street shed, and the big man who worked the other door was never found." },
    ],
  },

  // 22 · the Wren, in the guise of the oil tycoon J. Bruce Wayne
  {
    id: "tell-22",
    kind: "identity",
    truth: "No. 22, the Wren, tests the wind with a wet finger even indoors.",
    holders: [
      { guest: "tiffany", share: "free", line: "In the middle of the room he wets a fingertip and lifts it, as if testing the wind." },
      { guest: "rhea", share: "free", line: "The tycoon wets a finger and holds it up when he is thinking, indoors, where there is no wind." },
      { guest: "anika", share: "free", line: "He does it over the canapés: wets a finger, lifts it, nods. You have seen it three times." },
    ],
    exhibits: ["list"],
  },
  {
    id: "crack-22",
    kind: "identity",
    truth: "The oil tycoon has no oil: he is a pilot.",
    holders: [
      { guest: "mihir", share: "trade", line: "Wayne Petroleum's derricks are in a Texas county with no oil. You checked the county survey." },
      { guest: "jack", share: "trade", line: "He diagnosed a Packard's engine by ear and called it “a Liberty twelve, an aeroplane motor.” Nobody told him what it was." },
      { guest: "rhea", share: "free", line: "He ordered a wind-gauge and a barometer at the Emporium and asked for the upper-air readings, not the street weather. Only pilots ask for those." },
    ],
  },
  {
    id: "vouch-arjun",
    kind: "decoy",
    truth: "Arjun wets his finger to read the wind because he is a batter.",
    holders: [
      { guest: "josh", share: "free", line: "Arjun wets a finger and checks the wind before every pitch. He did it when he was twelve. It is a batter's habit." },
      { guest: "adam", share: "free", line: "On the Textiles diamond, Arjun wets a finger and holds it up before every at-bat. Everyone has seen it." },
      { guest: "tim", share: "free", line: "Arjun checks the wind off the river with a wet finger. A slugger's trick, nothing more." },
    ],
  },
  {
    id: "motive-22",
    kind: "motive",
    truth: "Kit had the Wren's co-pilot Cal Yates's fuel line cut. The aeroplane fell into Lake Massabesic in March 1925.",
    holders: [
      { guest: "tim", share: "trade", line: "The mechanic they called Lefty bragged in the gin cellar that he had been paid to cut a fuel line on a plane that fell into Lake Massabesic in March 1925, killing the co-pilot, Cal Yates." },
      { guest: "jack", share: "trade", line: "That spring the same mechanic walked into your showroom and paid cash for a motorcar the week after the crash that killed the co-pilot, Cal Yates. The money came from a Boston account." },
      { guest: "theodor", share: "trade", line: "On 3 March 1925 an aeroplane called the Wren's Nest fell into Lake Massabesic. The co-pilot, C. Yates, drowned; the pilot was never found." },
    ],
    exhibits: ["quill"],
  },
];

export const factById = new Map(facts.map((fact) => [fact.id, fact]));
