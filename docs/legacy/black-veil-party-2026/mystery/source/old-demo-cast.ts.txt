/**
 * The cast: one 1926 character per person in the program, each a pun on their own
 * name so the room recognises them at a glance. `npm run demo:seed` writes these into
 * `characters` unassigned, and `npm run demo:clear` takes them out again (matched by
 * name). Nothing here settles what happened in 1924; the one murderer/victim pair is
 * what staff see on /admin.
 *
 * Every character is based on a real person, so the copy refers to each one by name
 * and never by a gendered pronoun or title. Keep it that way when editing.
 */
export type DemoCharacter = {
  characterName: string;
  /**
   * The person in the program this character is based on: their name as it goes on the
   * register first, then nicknames a guest might RSVP under. Assigning characters
   * deals a guest whose name matches one of these the character based on them.
   */
  playedBy: string[];
  occupation: string;
  publicBiography: string;
  factions: string[];
  privateBiography: string;
  secrets: string[];
  objectives: string[];
  murderer?: boolean;
  victim?: boolean;
};

export const demoCharacters: DemoCharacter[] = [
  {
    characterName: "Adam “Holds Fire” Ouldsfiya",
    playedBy: ["Adam Ouldsfiya"],
    occupation: "Gunsmith, West Side",
    publicBiography: "Makes the finest revolvers in Hillsborough County and has famously never fired one. Adam's motto: a good gun, like a good argument, works best when it stays holstered.",
    factions: ["The River Trade"],
    privateBiography: "Adam sold a pearl-handled pistol in October 1924 and has been waiting two years for it to turn up in a police report.",
    secrets: ["You sold the pistol that was missing from the 1924 raid inventory.", "You keep a ledger of every gun you've sold, and to whom."],
    objectives: ["Find out who is carrying one of your pistols tonight.", "Don't let anyone talk you into firing anything."],
  },
  {
    characterName: "Dr. Aidan “The Leech” Leach",
    playedBy: ["Aidan Leach"],
    occupation: "Physician and bloodletter",
    publicBiography: "The last doctor in New England who still swears by leeches. Patients say Dr. Leach bleeds them twice: once with the leeches, once with the bill.",
    factions: ["Elm Street Society"],
    privateBiography: "Aidan signed a death certificate in November 1924 without ever seeing a body. The fee paid for a new jar of leeches.",
    secrets: ["The 1924 death certificate in your name is a fake.", "Half your patients are in debt to you."],
    objectives: ["Find out who knows about the certificate.", "Collect at least one overdue bill tonight."],
  },
  {
    characterName: "Aimee “Dead Aim” Hong",
    playedBy: ["Aimee Hong"],
    occupation: "Sharpshooter, travelling Wild West revue",
    publicBiography: "Can shoot the ash off a cigarette at forty paces. Has been asked, politely, to leave the rifle at the coat check.",
    factions: ["The Orchestra"],
    privateBiography: "Aimee was hired to perform at the 1924 masquerade. The act was cancelled at 11:40 that night, and nobody ever said why.",
    secrets: ["Your rifle is not at the coat check.", "You saw someone signal from the river door at 11:46."],
    objectives: ["Learn who cancelled your 1924 act.", "Win a bet on a feat of marksmanship."],
  },
  {
    characterName: "Ananya “The Code-Ruler” Koduru",
    playedBy: ["Ananya Koduru"],
    occupation: "Cipher clerk, Western Union",
    publicBiography: "Reads Morse faster than most people read English. Every telegram in Manchester passes under Ananya's pencil.",
    factions: ["The Press"],
    privateBiography: "Ananya decoded a telegram in 1924 and was told to forget it. Ananya wrote it down instead.",
    secrets: ["You have a decoded 1924 telegram tucked in your glove.", "You've been reading Judge Li's private wires for a year."],
    objectives: ["Decode the message hidden somewhere at this party.", "Find out who sent the black envelopes."],
  },
  {
    characterName: "Andrew “Cup of” Joffe",
    playedBy: ["Andrew Joffe", "Andy Joffe"],
    occupation: "Proprietor, Joffe's Coffee House",
    publicBiography: "Serves the best cup of joe on Elm Street. Regulars know to ask for it 'with a little Irish' and to pay double.",
    factions: ["The River Trade"],
    privateBiography: "Joffe's Coffee House is a front. The back room has the second-best bar in Manchester, after this one.",
    secrets: ["Your coffee is mostly rye.", "You owe Timothy McGinley for three crates of gin."],
    objectives: ["Poach this club's bartender for your back room.", "Settle your gin debt without paying it."],
  },
  {
    characterName: "Angelos “Bowled Over” Boules",
    playedBy: ["Angelos Boules"],
    occupation: "Lawn-bowls hustler",
    publicBiography: "Has never lost a game of boules with money on it. Has lost several without, on purpose, to raise the stakes.",
    factions: ["The River Trade"],
    privateBiography: "Angelos won the deed to Joffe's Coffee House off Andrew Joffe in a single game. Andrew wants it back.",
    secrets: ["You won Andrew Joffe's coffee house in a rigged game.", "Your lucky boule is weighted."],
    objectives: ["Lure someone into a high-stakes wager.", "Keep the coffee-house deed out of Andrew's hands."],
  },
  {
    characterName: "Anika Mahns of Mahns Manor",
    playedBy: ["Anika Mahns"],
    occupation: "Heir to the Mahns fortune, and host",
    publicBiography: "Lives in the largest house in the North End and reminds everyone of it. The Mahns Manor garden party is the only invitation harder to get than this one.",
    factions: ["Elm Street Society", "Mill Families"],
    privateBiography: "Mahns Manor is mortgaged to the rafters. The garden parties are paid for on credit.",
    secrets: ["You are broke.", "You let Molly Daniel run a still in the Mahns Manor cellar, for a cut."],
    objectives: ["Find a rich match before the bank finds you.", "Get invited to whatever happens after this party."],
  },
  {
    characterName: "Anthony “Hung Jury” Huang",
    playedBy: ["Anthony Huang", "Tony Huang"],
    occupation: "Defence attorney",
    publicBiography: "Has never won an acquittal and never lost a conviction, because every jury Anthony faces deadlocks. Clients pay for juries that argue.",
    factions: ["The Law"],
    privateBiography: "Anthony defended the club's doorman after the 1924 raid. The jury hung, of course, and the doorman vanished the next day.",
    secrets: ["Your doorman client told you where he was going.", "You were paid in cash by someone who never gave a name."],
    objectives: ["Find out who paid for the 1924 defence.", "Talk at least two people out of an accusation tonight."],
  },
  {
    characterName: "Arjun “The Bat” Bhat",
    playedBy: ["Arjun Bhat"],
    occupation: "Slugger, Manchester Textiles baseball club",
    publicBiography: "Hit .412 last season and wants a word with anyone who mentions the Babe. Brought the bat to the party for 'sentimental reasons'.",
    factions: ["Mill Workers"],
    privateBiography: "Arjun was offered five hundred dollars to strike out in the 1925 mill championship, and still hasn't decided whether that money was taken.",
    secrets: ["You took money to throw a game.", "The bat isn't sentimental. It's for protection."],
    objectives: ["Find whoever paid you and give the money back, or don't.", "Get someone to admit the Babe is overrated."],
  },
  {
    characterName: "Diwakar “Sandbag” Sandhu",
    playedBy: ["Diwakar Sandhu"],
    occupation: "Prizefighter",
    publicBiography: "Undefeated in every fight Diwakar was supposed to win. Mysteriously knocked out in every fight with real money on it.",
    factions: ["The River Trade"],
    privateBiography: "Diwakar throws fights for Mihir Nagarkatti's book, and would like to win one, just once, for real.",
    secrets: ["You've thrown eleven fights.", "You're planning to win the next one and double-cross the bookies."],
    objectives: ["Arrange your next fight with someone here.", "Keep Mihir from finding out about the double-cross."],
  },
  {
    characterName: "Emmanuel “The Con” Kon",
    playedBy: ["Emmanuel Kon"],
    occupation: "Person of independent means (confidence artist)",
    publicBiography: "Has sold the Amoskeag Mills twice and the Merrimack River once. Charming, generous, and holding your wallet.",
    factions: ["The River Trade"],
    privateBiography: "Emmanuel's latest mark is someone at this party. The money is already spent.",
    secrets: ["You've sold the same Florida swampland to three people in this room.", "Your name isn't Emmanuel Kon. It's even better."],
    objectives: ["Close one more sale before midnight.", "Leave before your three buyers compare notes."],
  },
  {
    characterName: "Emre “Sooner or Later” Sunar",
    playedBy: ["Emre Sunar"],
    occupation: "Clockmaker",
    publicBiography: "Repairs every clock in Manchester and is always, without fail, early. Emre's motto: it happens sooner or later.",
    factions: ["Elm Street Society"],
    privateBiography: "Emre repaired the club's great clock in October 1924 and noticed someone had set it eleven minutes fast.",
    secrets: ["The club's clock read 11:47 when it was really 11:36.", "You know who asked you not to fix it."],
    objectives: ["Prove the 1924 timeline is wrong.", "Arrive first and leave last."],
  },
  {
    characterName: "Judge Eric “Leeway” Li",
    playedBy: ["Eric Li"],
    occupation: "Municipal court judge",
    publicBiography: "The most lenient bench in New Hampshire: anyone with a good excuse can get a lot of leeway in Judge Li's court.",
    factions: ["The Law"],
    privateBiography: "Eric dismissed every case brought against the club between 1921 and 1924. Not one was ever heard.",
    secrets: ["You were paid to dismiss the club's cases.", "You still have the envelopes, unopened."],
    objectives: ["Find out who has been paying the court since 1924.", "Grant someone a pardon tonight, officially or not."],
  },
  {
    characterName: "Erika “On the” Lam",
    playedBy: ["Erika Lam"],
    occupation: "Fugitive",
    publicBiography: "Says 'between addresses' when asked. Wanted in three states for crimes Erika describes, with a smile, as misunderstandings.",
    factions: ["The River Trade"],
    privateBiography: "Erika has been on the lam since 1924, after walking out of the club's back door with something that belonged to someone else.",
    secrets: ["You took a satchel from the club in 1924.", "The police poster in Concord has your face on it."],
    objectives: ["Find a buyer for what's in the satchel.", "Keep Judge Eric Li from getting a good look at you."],
  },
  {
    characterName: "Ivan “Chew” Chiu",
    playedBy: ["Ivan Chiu"],
    occupation: "Chewing-gum magnate",
    publicBiography: "Spearmint, Peppermint, and the bestselling Black Licorice Twist. Offers everyone a stick and is offended by a refusal.",
    factions: ["Mill Families"],
    privateBiography: "Ivan's gum wrappers carry coded messages for the River Trade. Ivan has never read one.",
    secrets: ["Your gum wrappers are used to smuggle messages.", "You've bitten off more than you can chew: your factory is failing."],
    objectives: ["Find out what your wrappers have been saying.", "Get someone to invest in Black Licorice Twist."],
  },
  {
    characterName: "Jack “Cello” Marcello",
    playedBy: ["Jack Marcello"],
    occupation: "Cellist, the house orchestra",
    publicBiography: "Plays every night and never misses a note. The cello case is suspiciously heavy for something that only holds a cello.",
    factions: ["The Orchestra"],
    privateBiography: "Jack was playing at 11:47 on the night of the masquerade. The music did not stop when the papers say it did.",
    secrets: ["Your cello case has a false bottom.", "You saw who left by the river door in 1924."],
    objectives: ["Make a delivery from your cello case before the last dance.", "Find out who wants the 1924 timeline kept quiet."],
  },
  {
    characterName: "John “Jack” Hudson (no relation to the motorcar)",
    playedBy: ["Jack Hudson", "John Hudson"],
    occupation: "Automobile dealer",
    publicBiography: "Sells Hudson motorcars and insists on being no relation to the company. Nobody has ever believed it, and it has sold a lot of cars.",
    factions: ["Elm Street Society"],
    privateBiography: "Jack sold the getaway car that left the club on the night of the masquerade, and remembers the buyer.",
    secrets: ["You sold the 1924 getaway car.", "You are, in fact, a very distant relation."],
    objectives: ["Sell a car to someone at this party.", "Find the buyer of the 1924 car and ask for a referral."],
  },
  {
    characterName: "Joseph “Laundry” Landry",
    playedBy: ["Joseph Landry", "Joey Landry", "Joe Landry"],
    occupation: "Proprietor, Landry's Laundry",
    publicBiography: "Runs the cleanest laundry on the West Side. Gets out every stain. Some of them were on banknotes.",
    factions: ["The River Trade"],
    privateBiography: "Joseph launders money for half the people in this room, and knows exactly how dirty every one of them is.",
    secrets: ["You launder the River Trade's money through your shop.", "Timothy McGinley was about to turn you in."],
    objectives: ["Make sure Timothy McGinley doesn't talk.", "Leave tonight with your books still clean."],
    murderer: true,
  },
  {
    characterName: "Joshua “Chimney Sweep” Kaminsky",
    playedBy: ["Joshua Kaminsky", "Josh Kaminsky"],
    occupation: "Chimney sweep",
    publicBiography: "Has been up every chimney in Manchester and down a few that were off limits. Finds the most interesting things in the soot.",
    factions: ["Mill Workers"],
    privateBiography: "Joshua swept the club's chimneys in November 1924 and found half-burned ledger pages in the flue.",
    secrets: ["You have half-burned pages from the club's ledger.", "You can get into any house in Manchester through the roof."],
    objectives: ["Sell the ledger pages to whoever pays the most.", "Find out whose handwriting is on them."],
  },
  {
    characterName: "Krrish “Vermouth” Verma",
    playedBy: ["Krrish Verma"],
    occupation: "Head bartender",
    publicBiography: "Invented a martini so dry the Volstead Act doesn't apply to it. Remembers every guest's drink and every guest's secret.",
    factions: ["House Staff"],
    privateBiography: "Krrish poured the last drink of the 1924 masquerade, and noticed whose glass came back untouched.",
    secrets: ["You know who didn't drink their last glass in 1924.", "You water the gin when Timothy McGinley isn't looking."],
    objectives: ["Find out who's been poaching your regulars.", "Get every guest a drink before midnight."],
  },
  {
    characterName: "Kyle “Harbor” Erhabor",
    playedBy: ["Kyle Erhabor"],
    occupation: "Harbourmaster and rum-runner",
    publicBiography: "Runs the Merrimack docks and knows every boat that comes in by night. Swears the river door is just for deliveries.",
    factions: ["The River Trade"],
    privateBiography: "Kyle's boats brought in every bottle this club ever served, on the promise of a share of the club when it closed.",
    secrets: ["You were the club's silent supplier.", "You know the river door is still unlocked."],
    objectives: ["Collect the share of the club you were promised.", "Keep the river door a secret."],
  },
  {
    characterName: "Leon “Gee-Whiz” Ge",
    playedBy: ["Leon Ge"],
    occupation: "Radio announcer, WFEA",
    publicBiography: "The voice of Manchester's first radio station. Says 'gee whiz' on air, nightly, and the town loves it.",
    factions: ["The Press"],
    privateBiography: "Leon read a coded message on air in 1924 without knowing it. Someone has asked for another one to be read tonight.",
    secrets: ["You've been reading coded messages on the radio.", "You've never actually been to Boston, despite the accent."],
    objectives: ["Figure out what the message you were given means.", "Get someone to say 'gee whiz' unprompted."],
  },
  {
    characterName: "Luke “Shell Game” Sheldon",
    playedBy: ["Luke Sheldon"],
    occupation: "Carnival barker",
    publicBiography: "Runs the shell game at every county fair in New England. Follow the pea. Lose your money. Thank Luke for the lesson.",
    factions: ["The River Trade"],
    privateBiography: "Luke's shell game is how the River Trade pays its debts in public without anyone noticing.",
    secrets: ["Your shell game is a payment drop.", "There's no pea under any of the shells. There never was."],
    objectives: ["Run one game of shells tonight.", "Find out who owes the River Trade money."],
  },
  {
    characterName: "Mihir “Nag” Nagarkatti",
    playedBy: ["Mihir Nagarkatti"],
    occupation: "Racetrack bookmaker",
    publicBiography: "Takes bets on the nags at Rockingham Park, and on anything else. Will give you odds on who leaves the party first.",
    factions: ["The River Trade"],
    privateBiography: "Mihir runs the book on Diwakar Sandhu's fights, and suspects a double-cross is coming.",
    secrets: ["You fix fights and horse races.", "You've taken bets on who will die tonight."],
    objectives: ["Take bets from at least three people.", "Find out whether Diwakar is planning to win."],
  },
  {
    characterName: "Molly “Old No. 7” Daniel",
    playedBy: ["Molly Daniel"],
    occupation: "Distiller (no relation to the Tennessee Daniels, officially)",
    publicBiography: "The family whiskey was legal until 1920. Molly insists it still is, in spirit.",
    factions: ["The River Trade"],
    privateBiography: "Molly's still is in the cellar of Mahns Manor, and Anika Mahns takes a cut.",
    secrets: ["Your still is in Anika Mahns's cellar.", "Your whiskey is the only thing in this bar that isn't watered."],
    objectives: ["Get your whiskey into this club's bar.", "Find out who's been watering the gin."],
  },
  {
    characterName: "Rebecca “Chow” Chou",
    playedBy: ["Rebecca Chou", "Becca Chou"],
    occupation: "Head chef",
    publicBiography: "The supper menu is the real reason anyone comes. Rebecca once threw a cleaver at a food critic and would do it again.",
    factions: ["House Staff"],
    privateBiography: "Rebecca cooked the 1924 masquerade supper. One plate came back with a note under it.",
    secrets: ["You kept the note from under the plate.", "You know where the club's cellar door leads."],
    objectives: ["Find out who wrote the note.", "Get a compliment on the supper from everyone present."],
  },
  {
    characterName: "Rhea “Emporium” Mallya",
    playedBy: ["Rhea Mallya"],
    occupation: "Owner, Mallya's Department Emporium",
    publicBiography: "Mallya's on Elm Street sells everything from silk gloves to tractor parts. If Mallya's doesn't stock it, it doesn't exist.",
    factions: ["Elm Street Society"],
    privateBiography: "Rhea sold the identical masquerade gowns worn at the 1924 party. Two were ordered under the same name.",
    secrets: ["Two identical gowns were bought for the 1924 masquerade.", "You know who paid for the second."],
    objectives: ["Find out who is wearing a gown you sold in 1924.", "Open an account for someone new tonight."],
  },
  {
    characterName: "Robert “Win” Winfield",
    playedBy: ["Robert Winfield", "Rob Winfield", "Bob Winfield"],
    occupation: "College football hero",
    publicBiography: "Scored the winning touchdown for Dartmouth in 1923 and hasn't stopped talking about it. Robert wins at everything, including conversations.",
    factions: ["Elm Street Society"],
    privateBiography: "Robert's famous winning game was fixed, and Robert only found out last week.",
    secrets: ["The 1923 game was fixed by Mihir Nagarkatti.", "You've been offered money to keep quiet."],
    objectives: ["Find out whether your touchdown was real.", "Win something tonight, anything."],
  },
  {
    characterName: "Shadi “Shady” Soufan",
    playedBy: ["Shadi Soufan"],
    occupation: "Dealer in rare goods",
    publicBiography: "Sells antiques, maps, and 'heirlooms', no questions asked. The shop is open only at night, which is suspicious.",
    factions: ["The River Trade"],
    privateBiography: "Shadi bought the club's silverware when it closed. One of the spoons is engraved with a name that shouldn't be there.",
    secrets: ["You have an engraved spoon from the club.", "Half your antiques are from last Tuesday."],
    objectives: ["Sell the engraved spoon to the person it would ruin.", "Buy something valuable for less than it's worth."],
  },
  {
    characterName: "Siddarth “Air-Wind” Arvind",
    playedBy: ["Siddarth Arvind", "Sid Arvind"],
    occupation: "Aviator and barnstormer",
    publicBiography: "Flies loop-the-loops over the Merrimack every Sunday. Lands wherever the wind blows, which is rarely where Siddarth aimed.",
    factions: ["Elm Street Society"],
    privateBiography: "Siddarth flew someone out of Manchester on November 1, 1924, was paid in gold, and never asked the passenger's name.",
    secrets: ["You flew a mystery passenger out of town in 1924.", "You've crashed twice and told no one."],
    objectives: ["Find out who your 1924 passenger was.", "Book a joyride with someone here."],
  },
  {
    characterName: "Silas “Palm Reader” Palmer",
    playedBy: ["Silas Palmer"],
    occupation: "Fortune-teller and medium",
    publicBiography: "Reads palms, tea leaves and tarot. Correctly predicted the 1924 raid, which the police found suspicious.",
    factions: ["The Orchestra"],
    privateBiography: "Silas knew about the raid because a police sergeant mentioned it over tea. Most of the 'visions' are police gossip.",
    secrets: ["Your predictions come from police informants.", "You genuinely saw something in the cards last night and it frightened you."],
    objectives: ["Read three palms and tell each person something true.", "Find out what the cards were warning you about."],
  },
  {
    characterName: "Theodor “Farrago” Farag",
    playedBy: ["Theodor Farag", "Theo Farag"],
    occupation: "Editor, Manchester Evening Farrago",
    publicBiography: "Runs the town's least reliable newspaper. Every story is half true; readers argue over which half.",
    factions: ["The Press"],
    privateBiography: "Theodor printed the only true story the Farrago has ever run, in 1924, and was paid to retract it.",
    secrets: ["Your retracted 1924 story was true.", "You still have the original notes."],
    objectives: ["Get a front-page scoop by midnight.", "Find out who paid for the retraction."],
  },
  {
    characterName: "Tiffany Liu, of the Lamps",
    playedBy: ["Tiffany Liu"],
    occupation: "Stained-glass artisan",
    publicBiography: "Makes Tiffany lamps. Not those Tiffany lamps. Yes, Tiffany has heard the joke. No, there is no discount.",
    factions: ["Elm Street Society"],
    privateBiography: "Tiffany made the club's stained-glass rose window. There's a message hidden in the glass that only shows by lamplight.",
    secrets: ["You hid a message in the club's rose window.", "Your lamps are better than the real Tiffany's and you know it."],
    objectives: ["Get the rose window lit so the message shows.", "Take a commission from someone tonight."],
  },
  {
    characterName: "Timothy “Gin” McGinley",
    playedBy: ["Timothy McGinley", "Tim McGinley"],
    occupation: "Bathtub-gin baron",
    publicBiography: "Supplies half the speakeasies in Manchester from a bathtub in Goffstown. Calls it 'botanical'. Generous with samples.",
    factions: ["The River Trade"],
    privateBiography: "Timothy has decided to go straight, and to take down everyone who ever crossed the McGinley gin business on the way out.",
    secrets: ["You're planning to give the River Trade's books to the court.", "Joseph Landry launders your money, and you know too much about it."],
    objectives: ["Meet Judge Eric Li alone before midnight.", "Collect what Andrew Joffe owes you first."],
    victim: true,
  },
  {
    characterName: "Victor “Victrola” Liu",
    playedBy: ["Ting Shing “Victor” Liu", "Victor Liu", "Ting Shing Liu"],
    occupation: "Gramophone dealer",
    publicBiography: "Ting Shing Liu on the birth certificate, Victor to friends, and Victrola to the whole of Elm Street after selling one to every house on it.",
    factions: ["The Orchestra"],
    privateBiography: "Victor recorded the 1924 masquerade on a portable machine, and has never dared to play it back.",
    secrets: ["You have a recording of the night of the masquerade.", "There's a voice on it you'd recognise."],
    objectives: ["Find a gramophone at this party and play your record.", "Sell a Victrola to someone here."],
  },
];

/** Names from earlier versions of the demo cast, so demo:clear still removes them from a database seeded before. */
export const retiredDemoCharacterNames = [
  "Vivienne Marlowe", "Silas Brennan", "Augustine Pell", "Sergeant Thomas Halloran", "Lena Duquette",
  "Dr. Ambrose Whitcombe", "Rosalind Fairweather", "Jack 'Lucky' Moreau", "Constance Abernathy", "Eamon Kilbride",
  "Marguerite Leclair", "Professor Linus Okonkwo", "Beatrice 'Bea' Calloway", "Gideon Ashcroft", "Odette Vance",
  "Harold Pemberton", "Ines Castellano", "Father Declan Rourke", "Clara Whitlock", "Mortimer Graves",
  "Pearl Hastings", "Walter Sinclair", "Sylvie Montague", "Reginald Thorne",
];

/** "Ting Shing “Victor” Liu" → "ting shing victor liu": lowercase, letters and spaces only. */
export function normalizePersonName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The cast member based on this person, if any: an exact (normalised) match on one of
 * their names, or failing that the same first and last name, so "Joey Landry" and
 * "Joseph A. Landry" both find Joseph “Laundry” Landry.
 */
export function castMemberFor(fullName: string): DemoCharacter | undefined {
  const name = normalizePersonName(fullName);
  if (!name) return undefined;
  const exact = demoCharacters.find((character) => character.playedBy.some((alias) => normalizePersonName(alias) === name));
  if (exact) return exact;
  const parts = name.split(" ");
  if (parts.length < 2) return undefined;
  const [first, last] = [parts[0], parts[parts.length - 1]];
  return demoCharacters.find((character) =>
    character.playedBy.some((alias) => {
      const aliasParts = normalizePersonName(alias).split(" ");
      return aliasParts[0] === first && aliasParts[aliasParts.length - 1] === last;
    }),
  );
}
