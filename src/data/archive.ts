export type ArchiveFormat =
  | "front-page"
  | "newspaper"
  | "photograph"
  | "police"
  | "telegram"
  | "notice"
  | "invitation"
  | "memorandum";

export type ArchiveClassification =
  | "historical-context"
  | "fictional-artifact"
  | "generated-historical-fiction";

export type ArchiveProvenance = {
  classification: ArchiveClassification;
  label: string;
  fictional: boolean;
  sourceInstitution?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  rights?: string;
  notes?: string;
};

export type ArchiveImage = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  /** CSS object-position, so a cropped thumbnail still centers on the subject's face. */
  focalPoint?: string;
  /** Additional copy set directly beneath the caption, e.g. a note following up on the photograph. */
  note?: string[];
};

export type ArchiveRecord = {
  slug: string;
  catalogNumber: string;
  date: string;
  year: 1921 | 1922 | 1923 | 1924 | 1925 | 1926;
  title: string;
  deck?: string;
  format: ArchiveFormat;
  masthead?: string;
  edition?: string;
  excerpt: string;
  body: string[];
  image?: ArchiveImage;
  markings?: string[];
  neighboringCopy?: (string | { headline: string; body: string })[];
  continuedArticle?: { headline: string; body: string[] };
  /** Short filler notice set beneath the "Continued on page N" jump line, when the lead column runs short. */
  columnFiller?: { headline: string; body: string };
  provenance: ArchiveProvenance;
  featured?: boolean;
  /** Renders at the small (span-4) card size on the archive grid, regardless of format. */
  compact?: boolean;
  anomaly?: boolean;
  /** Record is presented as nothing but its image — no title, deck, excerpt, body, or markings rendered around it. */
  imageOnly?: boolean;
};

const fictionalArtifact = (notes?: string): ArchiveProvenance => ({
  classification: "fictional-artifact",
  label: "Fictional Black Veil artifact",
  fictional: true,
  notes: notes ?? "Created for The Black Veil historical-fiction experience. The publication and report are fictional.",
});

export const archiveRecords: ArchiveRecord[] = [
  {
    slug: "a-door-without-an-address",
    catalogNumber: "BV–21–001",
    date: "September 18, 1921",
    year: 1921,
    title: "A Door Without an Address",
    deck: "A private house begins receiving callers somewhere between Elm Street and the river.",
    format: "newspaper",
    masthead: "The Manchester Morning Courier",
    edition: "City and Vicinity · Page Four",
    excerpt: "Neighbors along three different streets each insist a private house receiving evening callers stands on their own block; no directory records it and no sign marks the door.",
    body: [
      "A curious item reaches this desk from the mill district, where a private house has lately taken to receiving callers by invitation only, and where no two residents can agree on which door it uses. A clerk at the Amoskeag counting-house places the entrance hard by the mill gates. A milliner on Elm Street insists the same house opens onto her own alley. A bargeman working the towpath allows only that it fronts the river side, and would say nothing further.",
      "No city directory carries any establishment under the name given to this reporter in confidence: The Black Veil. Yet since the first frost, black envelopes have gone out to mill clerks, attorneys, merchants, and at least one member of the evening press, each bearing an invitation to call at a door that, by every account so far collected, does not officially exist.",
    ],
    image: {
      src: "/archive/fictional/black-veil-passage.png",
      alt: "Fictional black-and-white photograph of a wet service passage between Manchester mill buildings",
      caption: "UNIDENTIFIED MILL PASSAGE · Manchester, N.H. · location disputed",
      width: 1536,
      height: 1024,
      note: [
        "The photograph accompanying this item arrived at the paper without a negative or photographer’s mark. A clerk’s hand has since annotated it three times: the earliest note places the passage near the Amoskeag works; a later hand wrote ‘off Elm’ above it; a third gives only: river side.",
      ],
    },
    neighboringCopy: [
      "Elm Street awning blown down in Tuesday's gale",
      {
        headline: "Amoskeag Gatehouse Reports Missing Ledger Page",
        body: "A clerk at the counting-house said a single page had gone missing from the visitors' register, though he could not say when, or who had last signed it. The gatehouse superintendent declined to speculate on the matter, saying only that the book would be re-bound before the week was out.",
      },
    ],
    markings: ["LOCATION DISPUTED", "Received without negative"],
    provenance: {
      classification: "generated-historical-fiction",
      label: "Generated historical-fiction image",
      fictional: true,
      sourceInstitution: "The Black Veil creative archive",
      sourceTitle: "A Door Without an Address",
      rights: "Original generated image for this project",
      notes: "Fictional scene informed by Manchester’s brick millyard architecture. It is not an authentic historical photograph. The newspaper item is fictional.",
    },
  },
  {
    slug: "miss-castello-receives",
    catalogNumber: "BV–21–008",
    date: "December 3, 1921",
    year: 1921,
    title: "A Stranger of Means Comes to Manchester",
    deck: "Newly arrived and evidently well provided for, Miss Cassandra Castello hosts a lavish small company at an unnamed dining room, declining to name her partners in a new club called The Black Veil.",
    format: "newspaper",
    masthead: "The Manchester Saturday Review",
    edition: "Society & Amusements · Page Eight",
    excerpt: "New to the city and comfortably fixed, Cassie Castello is mentioned almost incidentally among the proprietors of a private Manchester supper club.",
    body: [
      "Miss Cassandra Castello, newly arrived in Manchester and said to want for nothing, received a small company Thursday evening at a private dining room whose location the invitations omitted. Guests remarked on the hostess's furs and on a diamond bar pin unfamiliar to the city's older families. The gathering included representatives of the cloth trade, the law, and the evening press.",
      "Neither her people nor the source of her evident comfort could be traced by inquiries at the city directory office. The hostess, known to her friends as Cassie, declined to identify her partners in the enterprise. She allowed only that the rooms were called The Black Veil and that membership was a matter of introduction, not application.",
    ],
    image: {
      src: "/archive/fictional/cassandra-arrival-by-carriage.png",
      alt: "Fictional 1920s photograph of Cassandra Castello in furs and jewels arriving by carriage in a Manchester square, greeted by a companion in a top hat as photographers' flashes go off",
      caption: "MISS CASSANDRA CASTELLO · arriving before the society desk's cameras",
      width: 1024,
      height: 1536,
      focalPoint: "50% 30%",
    },
    neighboringCopy: [
      "Street railway winter timetable revised",
      "Cold weather settles over Merrimack Valley",
      {
        headline: "Coal Deliveries Running Behind Schedule",
        body: "Dealers along Canal Street reported orders backed up nearly a week, with teamsters blaming the early cold snap and a shortage of wagons.",
      },
    ],
    markings: ["Name underlined in blue pencil", "Clipping lacks page corner"],
    provenance: fictionalArtifact("The newspaper, article, and Cassandra Castello are fictional. The portrait is generated from a privately supplied likeness reference."),
  },
  {
    slug: "amoskeag-strike-nine-months",
    catalogNumber: "MH–22–014",
    date: "February–November 1922",
    year: 1922,
    title: "Nine Months at the Mill Gates",
    deck: "A Manchester labor crisis emptied the mills and reshaped the city around The Black Veil.",
    format: "newspaper",
    masthead: "Manchester Historical Context File",
    edition: "Editorial reconstruction · not a period clipping",
    excerpt: "Fifteen thousand Amoskeag workers struck after a fresh 20 percent wage cut and an increase from 48 to 54 hours a week.",
    body: [
      "On February 13, 1922, the Amoskeag Manufacturing Company posted a new wage schedule cutting pay by twenty percent — on top of a twenty-two-and-a-half percent reduction taken the year before — and lengthening the work week from forty-eight to fifty-four hours. Fifteen thousand operatives walked out of the Manchester mills within the day, and workers in Allenstown, Suncook, Nashua, Dover, Somersworth, and Newmarket followed within the week.",
      "The strike held for nine months. Amoskeag's directors would not restore the shorter week, and by November the company agreed only to leave wages where they had stood before the February cut; the fifty-four-hour week stayed in place. Production and payrolls alike lost millions before it ended, and a great many operatives who had walked out never came back to the looms — the first sign of the slow exodus that would empty the mill yard within a generation.",
      "Manchester's private clubs kept their doors open through the walkout. Mill agents and superintendents were seen dining at several of them through the spring and summer, often within a few blocks of the picket lines, and at least one account has union men at the same tables in the later months, working out settlement terms well before anything was announced publicly. Whose rooms hosted those conversations, and on what nights, is not a thing the mill's own ledgers ever wrote down.",
    ],
    image: {
      src: "/archive/real/amoskeag-strike-picket-1922.jpg",
      alt: "Weavers picketing outside an Amoskeag mill entrance on March 13, 1922",
      caption: "PICKET LINE AT AMOSKEAG MILL · Manchester, N.H. · March 13, 1922",
      width: 1200,
      height: 952,
    },
    neighboringCopy: [
      { headline: "Street Railway Notice", body: "Local notices and ordinary city news continued inside this edition." },
      { headline: "Relief Baskets Distributed on the West Side", body: "Strike relief committees reported longer lines at the West Side depot as the walkout entered its sixth month." },
      { headline: "City Council Declines Special Session", body: "Aldermen voted against convening early to discuss the mill closures, citing ongoing negotiations between Amoskeag and union representatives." },
      { headline: "Mill Yard Churches Report Full Pews", body: "West Side congregations noted heavier Sunday attendance through the strike, with several pastors devoting sermons to the walkout." },
      { headline: "Boarding Houses Feel the Pinch", body: "Landladies along Canal Street said rent collections had slowed considerably since the mills went idle in February." },
    ],
    markings: ["HISTORICAL CONTEXT", "Fiction separated in transcript"],
    provenance: {
      classification: "historical-context",
      label: "Real Manchester history",
      fictional: false,
      sourceInstitution: "Manchester Historic Association / Wikimedia Commons",
      sourceTitle: "Picket line at Amoskeag mill, March 13, 1922",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Picket_line_at_Amoskeag_mill_March_13,_1922.jpg",
      rights: "Public domain in the United States (published before 1930)",
      notes: "Historical context cross-checked with the New Hampshire Historical Society primary-source set on Amoskeag.",
    },
    featured: false,
  },
  {
    slug: "whispers-along-the-merrimack",
    catalogNumber: "BV–23–019",
    date: "June 9, 1923",
    year: 1923,
    title: "Whispers Along the Merrimack",
    deck: "Federal agents watch the north road while Manchester’s private rooms remain undisturbed.",
    format: "newspaper",
    masthead: "The Granite State Evening Dispatch",
    edition: "Late City Edition · Two Cents",
    excerpt: "A fictional clipping links Canadian liquor, river landings, and a protected private club without proving any of them.",
    body: [
      "Cases bearing Canadian marks were seized north of the city yesterday, renewing talk that imported spirits have been moving through Manchester by motor and rail. Officials declined to connect the seizure to any establishment within the city.",
      "Three informants nevertheless named a private club called The Black Veil. One placed it near the river, another behind a Canal Street warehouse, and a third above an Elm Street business. None agreed on the entrance.",
    ],
    image: {
      src: "/archive/real/elm-street-manchester-c1908.jpg",
      alt: "Historical black-and-white photograph looking along Elm Street in Manchester, New Hampshire, circa 1908",
      caption: "ELM STREET · Manchester, N.H., circa 1908 · this image does not depict The Black Veil",
      width: 1024,
      height: 819,
    },
    neighboringCopy: ["Streetcar repairs ordered at Hanover crossing", "River level falls after three days of rain"],
    markings: ["Source names removed", "Location claims conflict"],
    provenance: {
      classification: "fictional-artifact",
      label: "Fictional article with real historical photograph",
      fictional: true,
      sourceInstitution: "Library of Congress, Prints & Photographs Division",
      sourceTitle: "Elm Street, Manchester, N.H.",
      sourceUrl: "https://www.loc.gov/item/2016814350/",
      rights: "No known restrictions on publication; Detroit Publishing Company Collection",
      notes: "The photograph is genuine and dates to circa 1908. The newspaper and Black Veil story are fictional; the image is used only as Manchester context.",
    },
  },
  {
    slug: "masquerade-announcement-1924",
    catalogNumber: "BV–24–031",
    date: "October 11, 1924",
    year: 1924,
    title: "All Hallows’ Eve Masquerade",
    format: "invitation",
    excerpt: "The surviving proof of the black envelope, printed entire.",
    body: [],
    image: {
      src: "/archive/fictional/black-veil-masquerade-invitation-1924.png",
      alt: "Fictional 1924 printed invitation for The Black Veil's All Hallows’ Eve Masquerade, Manchester, N.H.",
      caption: "THE BLACK VEIL · All Hallows’ Eve Masquerade · October 31, 1924",
      width: 1024,
      height: 1536,
    },
    provenance: fictionalArtifact("Fictional 1924 invitation proof created for The Black Veil."),
    imageOnly: true,
  },
  {
    slug: "terror-at-the-black-veil",
    catalogNumber: "BV–24–046",
    date: "November 1, 1924",
    year: 1924,
    title: "The Black Veil Masquerade Massacre",
    deck: "Officials privately concede a massacre took place at the All Hallows' Eve masquerade; no bodies and no toll have been released.",
    format: "front-page",
    masthead: "The Manchester Evening Chronicle",
    edition: "Vol. LXVIII · No. 263 · Final City Edition · Two Cents",
    excerpt: "No official count of the dead has been released. Whatever bodies the scene once held were gone before police arrived — yet investigators now privately concede that a massacre took place inside The Black Veil.",
    image: {
      src: "/archive/fictional/terror-at-the-black-veil-raid.png",
      alt: "Fictional evidence photograph of two patrolmen surveying the overturned, emptied Black Veil supper club",
      caption: "PATROLMEN INSIDE THE BLACK VEIL · overturned furniture, no remains recovered · November 1924",
      width: 1448,
      height: 1086,
      focalPoint: "50% 55%",
    },
    body: [
      "Detectives arrived at the shuttered premises of The Black Veil this morning, opening an inquiry into what officials now privately concede was a massacre at the club's All Hallows' Eve masquerade overnight. No official count of the dead has been released.",
      "The precise number of dead remains unknown. Whatever bodies the scene once held were gone before police arrived, leaving no remains to count and no official toll to publish. Investigators maintain, nonetheless, that a massacre did take place inside the club that night.",
      "The department has offered no further statement. The Black Veil remains sealed, and its address is still absent from public record.",
    ],
    columnFiller: {
      headline: "Readers with information",
      body: "This paper's city desk will receive, in strict confidence, any account from those who attended the masquerade or who can otherwise speak to the events of that night.",
    },
    neighboringCopy: [
      {
        headline: "Neighbors report sleepless night on the West Side",
        body: "Several households along the nearest streets told this paper they remained awake past three o'clock, uncertain whether to summon police themselves.",
      },
      {
        headline: "Coroner's office declines early statement",
        body: "A clerk said no request for the coroner's services had been logged as of press time, though the line had been busy since sunrise.",
      },
      {
        headline: "All Hallows' Eve trolley service called uneventful elsewhere",
        body: "Aside from the disturbance reported near the mill district, the Manchester Street Railway described the holiday's late service as routine.",
      },
    ],
    markings: ["No death toll confirmed", "Second paragraph reset before printing"],
    provenance: fictionalArtifact("Signature fictional front page, filed the morning after the 1924 masquerade once investigators privately conceded a massacre had occurred. The newspaper, the report, and The Black Veil are fictional."),
    compact: true,
  },
  {
    slug: "murderer-or-murdered",
    catalogNumber: "BV–24–047",
    date: "November 2, 1924",
    year: 1924,
    title: "Murdered or Murderer?",
    deck: "Cassandra Castello Missing After Black Veil Masquerade Massacre",
    format: "front-page",
    masthead: "The Manchester Evening Chronicle",
    edition: "Vol. LXVIII · No. 262 · Final City Edition · Two Cents",
    excerpt: "A death inquiry, a vanished proprietress, and no two witnesses telling the same story.",
    body: [
      "Cassandra ‘Cassie’ Castello, proprietress of the private club known as The Black Veil, has not been seen by family or associates since the establishment’s All Hallows’ Eve masquerade. Police would not say whether they believe Miss Castello fled, was harmed, or remains within Manchester.",
      "Authorities are investigating an unconfirmed death connected with a disturbance at the club. The dead person’s name—if a death occurred—has not been released. One official described Castello as a witness sought for questioning. Another refused to say whether she is considered a suspect.",
      "Guests leaving the affair supplied irreconcilable accounts. Some heard an argument shortly before midnight. Others insist the orchestra never stopped. A driver reported taking Castello toward Elm Street; the driver later withdrew the statement.",
      "No body has been found. No charge has been filed. The Black Veil is shuttered, and its precise address remains absent from public record.",
    ],
    image: {
      src: "/archive/fictional/cassandra-castello-portrait.png",
      alt: "Fictional aged 1920s photograph of Cassandra Castello in a fur-trimmed coat, the print worn and cracked at the edges",
      caption: "CASSANDRA CASTELLO · proprietress of The Black Veil · photograph date uncertain",
      width: 1100,
      height: 1430,
      focalPoint: "50% 22%",
    },
    continuedArticle: {
      headline: "Inquiry continues into masquerade massacre",
      body: [
        "Detectives returned to the shuttered premises of The Black Veil this week, continuing an inquiry into what officials now privately concede was a massacre at the club’s All Hallows’ Eve masquerade two nights past. No official count of the dead has been released.",
        "Cassandra Castello, the club’s proprietress, was reported missing that same night. Police will not say whether her disappearance is connected to the killings, or whether she is to be considered a victim, a witness, or a suspect.",
        "The precise number of dead remains unknown. Whatever bodies the scene once held were gone before police arrived, leaving no remains to count and no official toll to publish. Investigators maintain, nonetheless, that a massacre did take place inside the club that night.",
        "The department has offered no further statement. The Black Veil remains sealed, and its address is still absent from public record.",
      ],
    },
    neighboringCopy: [
      {
        headline: "Authorities refuse comment as inquiry widens",
        body: "The city solicitor’s office declined three separate requests for a statement, referring all questions to the coroner.",
      },
      {
        headline: "Street railway announces cold-weather schedule",
        body: "The Manchester Street Railway will run reduced service after 9 p.m. beginning Monday, weather permitting.",
      },
      {
        headline: "River fog delays early freight traffic",
        body: "A heavy fog off the Merrimack held morning freight cars at the Amoskeag yard until past seven o’clock.",
      },
    ],
    markings: ["Clipped from library binding", "Question mark circled in red pencil"],
    provenance: fictionalArtifact("Signature fictional front page. The newspaper, reports, death inquiry, Cassandra Castello, and The Black Veil are fictional."),
    compact: true,
  },
  {
    slug: "last-photograph-at-the-masquerade",
    catalogNumber: "BV–24–050",
    date: "November 3, 1924",
    year: 1924,
    title: "Last Photograph at the Masquerade",
    deck: "A photograph from the night of the masquerade surfaces three days after Cassandra Castello’s disappearance.",
    format: "newspaper",
    masthead: "The Manchester Evening Chronicle",
    edition: "Special Photograph Feature · Page Three",
    excerpt: "The print, showing Castello on the night she vanished, was recovered without its negative. The clock, window, and face at the right edge have all been cited as evidence.",
    body: [
      "This print, taken during the October 31 masquerade and only now made public, is believed to show Cassandra Castello on the night of her disappearance. No reliable time accompanies the photograph. One witness said she had already left by eleven; another recalled speaking with her after midnight.",
      "The reverse bears two different annotations: ‘last photograph of Cassie’ in pencil and ‘not the last’ in darker ink. Neither hand has been identified.",
    ],
    columnFiller: {
      headline: "Have you seen this negative?",
      body: "The print reproduced above was recovered without its negative. This paper will forward, unopened, any negative or additional print to the family through counsel.",
    },
    image: {
      src: "/archive/fictional/cassandra-masquerade-evidence.png",
      alt: "Fictional candid photograph of Cassandra Castello among masked guests in a brick mill room",
      caption: "CASSANDRA CASTELLO · Black Veil masquerade · October 31, 1924 · time unverified",
      width: 1448,
      height: 1086,
      focalPoint: "54% 25%",
    },
    neighboringCopy: [
      {
        headline: "Amoskeag Mills Announce Holiday Schedule",
        body: "The corporation confirmed reduced shifts through the first week of November for seasonal inventory.",
      },
      {
        headline: "Frost Warning Issued for River Valley",
        body: "The weather bureau posted an early frost warning for low-lying farms along the Merrimack.",
      },
      {
        headline: "Trolley Line Adds Late Service for Holiday",
        body: "Extra cars ran past midnight on All Hallows’ Eve to accommodate late gatherings across the city.",
      },
    ],
    markings: ["EVIDENCE PRINT 6", "TIME UNVERIFIED", "not the last"],
    provenance: {
      classification: "generated-historical-fiction",
      label: "Generated historical-fiction image",
      fictional: true,
      sourceInstitution: "The Black Veil creative archive",
      sourceTitle: "Last Photograph at the Masquerade",
      rights: "Original generated image for this project",
      notes: "Cassandra and the pictured event are fictional. The image uses the project’s canonical Cassandra likeness reference.",
    },
    featured: true,
  },
  {
    slug: "police-seek-proprietress",
    catalogNumber: "BV–24–052",
    date: "November 4, 1924",
    year: 1924,
    title: "Police Seek Proprietress for Questioning",
    deck: "Officials stop short of naming Cassandra Castello a suspect.",
    format: "newspaper",
    masthead: "The Merrimack Morning Record",
    edition: "Morning Edition · Page One",
    excerpt: "A second newspaper treats Cassandra as a fugitive while conceding that no warrant exists.",
    body: [
      "Police renewed their request that Cassandra Castello present herself for an interview concerning the Black Veil disturbance. The department confirmed that no warrant has been issued and declined to identify the person reportedly killed.",
      "A porter at the Boston & Maine station believed he saw Castello board a northbound train. A boarding-house keeper on the West Side insists Castello spent the same hour in her parlor. Both accounts are unsupported.",
    ],
    columnFiller: {
      headline: "Have you seen Miss Castello?",
      body: "This paper's city desk will forward, in strict confidence, any sighting or account of Cassandra Castello's present whereabouts to the investigating officers named in the department's bulletin.",
    },
    image: {
      src: "/archive/fictional/cassandra-person-of-interest-poster.png",
      alt: "Fictional 1924 City of Manchester Police Department person-of-interest bulletin for Cassandra Castello, proprietress of The Black Veil",
      caption: "PERSON OF INTEREST · department bulletin reproduced with this report · no warrant accompanies it",
      width: 1122,
      height: 1402,
      focalPoint: "50% 20%",
    },
    neighboringCopy: [
      {
        headline: "Cold fog expected along the river",
        body: "The Weather Bureau calls for a heavy fog to settle over the Merrimack by nightfall, lifting only after sunrise. Boatmen were advised to keep running lights through the morning watch.",
      },
      {
        headline: "Street railway notice",
        body: "The Manchester Street Railway will run a reduced winter timetable beginning this week, with the last West Side car departing promptly at eleven.",
      },
    ],
    markings: ["Later edition removes ‘fled’", "No warrant located"],
    provenance: {
      classification: "generated-historical-fiction",
      label: "Generated historical-fiction image",
      fictional: true,
      sourceInstitution: "The Black Veil creative archive",
      sourceTitle: "Police Seek Proprietress for Questioning",
      rights: "Original generated image for this project",
      notes: "The Manchester Police Department bulletin, Cassandra Castello, and The Black Veil are fictional. The image uses the project’s canonical Cassandra likeness reference.",
    },
  },
  {
    slug: "the-platform-photograph",
    catalogNumber: "BV–24–053",
    date: "November 5, 1924",
    year: 1924,
    title: "The Platform Photograph",
    deck: "A print said to have been taken at the Boston & Maine depot revives the porter's account, but confirms nothing.",
    format: "newspaper",
    masthead: "The Manchester Evening Chronicle",
    edition: "Evidence Photograph · Page Two",
    excerpt: "The print shows a northbound train idling at the platform and a single indistinct figure near the rear car. No feature is clear enough to confirm an identity.",
    body: [
      "A print reached this desk purporting to show the Boston & Maine platform at the hour the porter says he saw Cassandra Castello board a northbound train. The photograph shows the train idling with steam drifting from the engine, the boards wet under a newly lit station lamp, and a single figure in a dark coat and cloche hat standing near the rear car with her back to the camera.",
      "No face is visible. The paper's editors decline to state that the figure is Castello, or that it is anyone in particular. The porter, shown the print, would say only that it 'could be her coat.' The boarding-house keeper who places Castello in her parlor at the same hour has not been shown the photograph.",
      "The negative's origin is not recorded. This paper holds the print but cannot vouch for the date, the hour, or the photographer.",
    ],
    markings: ["FACE NOT IDENTIFIABLE", "PRINT UNDATED", "Porter's account unconfirmed"],
    image: {
      src: "/archive/fictional/boston-maine-depot-evidence.png",
      alt: "Fictional evidence photograph of a Boston & Maine depot platform at dusk, a northbound train idling with steam drifting from the engine, and a distant, unidentifiable figure in a dark coat and cloche hat near the rear car",
      caption: "BOSTON & MAINE DEPOT · northbound platform · figure unidentified",
      width: 1448,
      height: 1086,
      focalPoint: "70% 55%",
    },
    provenance: {
      classification: "generated-historical-fiction",
      label: "Generated historical-fiction image",
      fictional: true,
      sourceInstitution: "The Black Veil creative archive",
      sourceTitle: "The Platform Photograph",
      rights: "Original generated image for this project",
      notes: "The depot scene, the pictured figure, and the sighting are fictional. No identity is asserted or ascertainable from the image; it is consistent with an unverified witness account, not evidence of one.",
    },
    neighboringCopy: [
      "Cold fog expected along the river",
      "Street railway notice",
      {
        headline: "Witnesses Give Conflicting Accounts",
        body: "An unsigned police summary circulating this week says music at the club ceased at 11:47 P.M. and two persons left by the river side. A second statement insists the music continued beyond midnight and that no river entrance ever existed. A third places an officer inside before twelve; a fourth says police were not summoned until morning. The original statements could not be produced.",
      },
    ],
  },
  {
    slug: "black-veil-closed-indefinitely",
    catalogNumber: "BV–24–061",
    date: "November 8, 1924",
    year: 1924,
    title: "The Black Veil Closed Indefinitely",
    deck: "An unsigned notice posted in three locations ends the club's memberships; the city can find no address to match it.",
    format: "newspaper",
    masthead: "The Manchester Evening Chronicle",
    edition: "City and Vicinity · Page Three",
    excerpt: "A management notice confirms the closure but names no proprietor and acknowledges no casualty.",
    body: [
      "A notice posted about the city yesterday declares The Black Veil closed indefinitely by order of management. Memberships are suspended, the notice states, and any correspondence concerning the All Hallows’ Eve engagement will be returned unopened.",
      "The notice is unsigned. This paper's examination finds the type does not match the club’s 1921 stationery, leaving open the question of who ordered it set and printed. A city clerk, asked to confirm the closure against the address given by investigators pursuing the masquerade inquiry, could locate no business under the name Black Veil at any Manchester address so offered.",
      "Where the notice was posted has not been recorded by this paper's sources, beyond an assurance that it went up in three locations. Readers who have seen the notice, or who can identify the printer's type, are asked to communicate with the city desk.",
    ],
    columnFiller: {
      headline: "Have you seen this notice posted?",
      body: "This paper's city desk will receive, in strict confidence, any account of where or when the notice appeared, or of the type used to print it.",
    },
    image: {
      src: "/archive/fictional/black-veil-closure-notice.png",
      alt: "Fictional evidence photograph of a weathered closure notice pinned to a wooden mill door in Manchester, New Hampshire, reading THE BLACK VEIL, CLOSED INDEFINITELY, CRIME SCENE, by order of the Manchester Police Department, with a shadowed figure passing in the foreground",
      caption: "NOTICE OF CLOSURE · one of three postings · location not recorded",
      width: 1371,
      height: 1148,
      focalPoint: "70% 45%",
    },
    neighboringCopy: [
      "Cold fog expected along the river",
      "Street railway notice",
      {
        headline: "Printers Along Elm Street Report No Order",
        body: "Three job-printing shops canvassed by this paper said they had taken no order for a notice matching the one now posted, and none could identify the type from a rubbing supplied by a reader.",
      },
    ],
    markings: ["POSTED IN THREE LOCATIONS", "Locations not recorded", "Type does not match 1921 stationery"],
    provenance: {
      classification: "generated-historical-fiction",
      label: "Generated historical-fiction image",
      fictional: true,
      sourceInstitution: "The Black Veil creative archive",
      sourceTitle: "The Black Veil Closed Indefinitely",
      rights: "Original generated image for this project",
      notes: "Fictional management notice recast as a newspaper report, with fictional archival annotation. The photograph was supplied by the project owner; see GENERATION-NOTES.md for details.",
    },
  },
  {
    slug: "where-is-cassandra-castello",
    catalogNumber: "BV–25–003",
    date: "October 25, 1925",
    year: 1925,
    title: "Where Is Cassandra Castello?",
    deck: "One year later, there is no body, no arrest, and no agreement that a murder occurred.",
    format: "newspaper",
    masthead: "The Manchester Sunday Chronicle",
    edition: "Sunday Feature · Page Five",
    excerpt: "A retrospective gathers sightings, denials, and the unanswered question of whether Castello was victim or suspect.",
    body: [
      "A year after the Black Veil masquerade, Cassandra Castello remains missing. Police files available to this paper contain no warrant, death certificate, or named victim. The department now calls the matter inactive.",
      "One acquaintance believes Castello left New Hampshire. Another says she would never abandon the club. A third claims to have received a Christmas card in her handwriting, postmarked Manchester but mailed without a return address.",
      "The shuttered rooms have not reopened. Their rent, according to a ledger shown to this paper, remains paid by an unidentified party.",
    ],
    image: {
      src: "/archive/fictional/cassandra-society-cigarette-holder.png",
      alt: "Fictional photograph of Cassandra Castello seated with a long cigarette holder",
      caption: "CASSIE CASTELLO · photograph published before her disappearance",
      width: 1122,
      height: 1402,
      focalPoint: "58% 20%",
    },
    neighboringCopy: [
      {
        headline: "Anniversary Notices Withdrawn",
        body: "Two memorial notices submitted to this paper for the week of All Hallows’ Eve were withdrawn before press time by the parties who placed them. Neither gave a reason.",
      },
      {
        headline: "Rents Paid on Empty Rooms",
        body: "A downtown agent confirmed that leases on at least two shuttered premises in the mill district remain in good standing, the rent arriving by draft each quarter from an account he declined to name.",
      },
      {
        headline: "Winter Coal Prices Hold Steady",
        body: "Dealers along Canal Street expect no advance before December, citing full yards and an open river.",
      },
    ],
    markings: ["Reporter’s notes unavailable", "No trace of missing woman"],
    provenance: fictionalArtifact("Fictional retrospective and generated Cassandra photograph."),
    featured: true,
  },
  {
    slug: "black-envelopes-appear",
    catalogNumber: "BV–26–016",
    date: "October 7, 1926",
    year: 1926,
    title: "Black Envelopes Appear",
    deck: "A wire beats any local account to the city desk as the old insignia turns up two years after the club closed and its proprietress vanished.",
    format: "newspaper",
    masthead: "The Manchester Evening Chronicle",
    edition: "City and Vicinity · Page Four",
    excerpt: "A telegram reporting black envelopes bearing the old insignia reaches this desk two years after the club closed and its proprietress vanished.",
    body: [
      "Black envelopes bearing the old Black Veil seal have begun arriving at addresses on Elm Street and the West Side, and not one recipient so far will give this paper a name. A wire reached the city desk ahead of any local account, its language terse enough to have come from the telegraph office rather than any hand: BLACK ENVELOPES DELIVERED ELM STREET AND WEST SIDE STOP RECIPIENTS DECLINE NAMES STOP SEAL MATCHES CASTELLO STATIONERY STOP PRINTER UNKNOWN STOP",
      "No printer in the city will claim the type, and the seal is reported to match stationery once used by Cassandra Castello, missing since the 1924 masquerade. If Miss Castello has been gone two years, this paper can only put the wire's own question to its readers: IF CASTELLO HAS BEEN MISSING SINCE 1924 STOP WHO PREPARED THE LIST STOP",
    ],
    image: {
      src: "/archive/fictional/black-envelopes-doorstep-evidence.png",
      alt: "Fictional evidence photograph of a single black wax-sealed envelope resting on a wet stone curb beside an iron post on a Manchester street corner",
      caption: "BLACK ENVELOPE · left without a hand seen · West Side, Manchester, N.H.",
      width: 1402,
      height: 1122,
    },
    neighboringCopy: [
      {
        headline: "Telegraph Office Reports Heavy Night Traffic",
        body: "The Elm Street office logged an unusual volume of local wires between eleven and one o’clock, several of them filed without a sender's name and paid in coin.",
      },
      {
        headline: "Printers Canvassed Again",
        body: "No shop in the city will claim the type used on the envelopes, and two masters who examined a rubbing said the face is not one sold in New England.",
      },
      {
        headline: "Postal Inspector Declines Inquiry",
        body: "Since the envelopes passed through no mail, the inspector's office said the matter lies outside its authority and referred this paper to the police.",
      },
    ],
    markings: ["ORIGIN UNAVAILABLE", "Filed before receipt"],
    provenance: {
      classification: "generated-historical-fiction",
      label: "Generated historical-fiction image",
      fictional: true,
      sourceInstitution: "The Black Veil creative archive",
      sourceTitle: "Black Envelopes Appear",
      rights: "Original generated image for this project",
      notes: "Fictional newspaper report and evidence photograph created for The Black Veil. The photograph was supplied by the project owner; see GENERATION-NOTES.md for details.",
    },
    anomaly: true,
  },
  {
    slug: "the-veil-has-lifted",
    catalogNumber: "BV–26–031",
    date: "October 31, 1926",
    year: 1926,
    title: "The Veil Has Lifted",
    format: "invitation",
    excerpt: "The Black Veil summons its guests back to Manchester on All Hallows’ Eve.",
    body: [],
    image: {
      src: "/archive/fictional/black-veil-veil-has-lifted-flyer-1926.png",
      alt: "Fictional 1926 printed flyer for The Black Veil's All Hallows’ Eve Masquerade, Manchester, N.H., reading THE VEIL HAS LIFTED",
      caption: "THE VEIL HAS LIFTED · All Hallows’ Eve Masquerade · October 31, 1926",
      width: 1024,
      height: 1536,
    },
    provenance: fictionalArtifact("Fictional 1926 flyer. The sender is intentionally unresolved."),
    imageOnly: true,
    anomaly: true,
  },
];

export const archiveYears = [1921, 1922, 1923, 1924, 1925, 1926] as const;

export function getArchiveRecord(slug: string) {
  return archiveRecords.find((record) => record.slug === slug);
}

export function getArchiveRecordsByYear(year: number) {
  return archiveRecords.filter((record) => record.year === year);
}
