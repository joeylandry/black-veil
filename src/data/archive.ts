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
  provenance: ArchiveProvenance;
  featured?: boolean;
  anomaly?: boolean;
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
    format: "photograph",
    excerpt: "An unnumbered service door photographed near the Manchester mill district; three catalog cards give three different locations.",
    body: [
      "The photograph arrived without a negative or photographer’s mark. The earliest catalog card places the passage near the Amoskeag works. A later hand wrote ‘off Elm’ above it. A third note gives only: river side.",
      "No surviving city directory lists The Black Veil. By autumn 1921, however, black envelopes were being delivered to mill clerks, attorneys, merchants, reporters, and persons who did not ordinarily share a table.",
    ],
    image: {
      src: "/archive/fictional/black-veil-passage.png",
      alt: "Fictional black-and-white photograph of a wet service passage between Manchester mill buildings",
      caption: "UNIDENTIFIED MILL PASSAGE · Manchester, N.H. · location disputed",
      width: 1536,
      height: 1024,
    },
    markings: ["LOCATION DISPUTED", "Received without negative"],
    provenance: {
      classification: "generated-historical-fiction",
      label: "Generated historical-fiction image",
      fictional: true,
      sourceInstitution: "The Black Veil creative archive",
      sourceTitle: "A Door Without an Address",
      rights: "Original generated image for this project",
      notes: "Fictional scene informed by Manchester’s brick millyard architecture. It is not an authentic historical photograph.",
    },
  },
  {
    slug: "miss-castello-receives",
    catalogNumber: "BV–21–008",
    date: "December 3, 1921",
    year: 1921,
    title: "Miss Castello Receives",
    deck: "The name Cassandra Castello appears for the first time in a damaged society clipping.",
    format: "newspaper",
    masthead: "The Manchester Saturday Review",
    edition: "Society & Amusements · Page Eight",
    excerpt: "Cassie Castello is mentioned almost incidentally among the proprietors of a private Manchester supper club.",
    body: [
      "Miss Cassandra Castello received a small company Thursday evening at a private dining room whose location the invitations omitted. The gathering included representatives of the cloth trade, the law, and the evening press.",
      "The hostess, known to her friends as Cassie, declined to identify her partners in the enterprise. She allowed only that the rooms were called The Black Veil and that membership was a matter of introduction, not application.",
    ],
    image: {
      src: "/archive/fictional/cassandra-society-cigarette-holder.png",
      alt: "Fictional 1920s society portrait of Cassandra Castello holding a long cigarette holder",
      caption: "MISS CASSANDRA CASTELLO · photograph supplied to the society desk",
      width: 1122,
      height: 1402,
      focalPoint: "58% 20%",
    },
    neighboringCopy: ["Street railway winter timetable revised", "Cold weather settles over Merrimack Valley"],
    markings: ["Name underlined in blue pencil", "Clipping lacks page corner"],
    provenance: fictionalArtifact("The newspaper, article, and Cassandra Castello are fictional. The portrait is generated from a privately supplied likeness reference."),
  },
  {
    slug: "amoskeag-strike-nine-months",
    catalogNumber: "MH–22–014",
    date: "February–November 1922",
    year: 1922,
    title: "Nine Months at the Mill Gates",
    deck: "A real Manchester labor crisis changed the city surrounding The Black Veil.",
    format: "newspaper",
    masthead: "Manchester Historical Context File",
    edition: "Editorial reconstruction · not a period clipping",
    excerpt: "Amoskeag workers struck after a 20 percent wage cut and an increase from 48 to 54 hours per week.",
    body: [
      "In February 1922 the Amoskeag Manufacturing Company announced a twenty percent wage reduction while lengthening the work week from forty-eight to fifty-four hours. Thousands of workers left the mills. The strike continued for nine months.",
      "The event strained households and businesses across Manchester and marked a decisive break in the relationship between Amoskeag and its workforce. Later Black Veil papers place laborers, supervisors, and businessmen in the same private rooms during this period; those claims belong to the fictional record, not to documented strike history.",
    ],
    image: {
      src: "/archive/real/amoskeag-strike-picket-1922.jpg",
      alt: "Weavers picketing outside an Amoskeag mill entrance on March 13, 1922",
      caption: "PICKET LINE AT AMOSKEAG MILL · Manchester, N.H. · March 13, 1922",
      width: 1200,
      height: 952,
    },
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
    featured: true,
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
    excerpt: "A printer’s proof announces supper at midnight and instructs guests to leave their names outside.",
    body: [
      "THE BLACK VEIL requests the pleasure of its members on All Hallows’ Eve. Masks after ten. Supper at twelve. Admission by black envelope only.",
      "The proof gives no street number. In the printer’s margin, three location lines were set and struck: near the works; off Elm; river entrance.",
    ],
    markings: ["PROOF — DO NOT CIRCULATE", "Location plate removed"],
    provenance: fictionalArtifact("Fictional 1924 invitation proof created for The Black Veil."),
  },
  {
    slug: "last-photograph-at-the-masquerade",
    catalogNumber: "BV–24–044",
    date: "October 31, 1924 · time unknown",
    year: 1924,
    title: "Last Photograph at the Masquerade",
    deck: "Cassandra Castello, photographed inside The Black Veil on the night she disappeared.",
    format: "newspaper",
    masthead: "The Manchester Evening Chronicle",
    edition: "Special Photograph Feature · Page Three",
    excerpt: "The print was recovered without its negative. The clock, window, and face at the right edge have all been cited as evidence.",
    body: [
      "The photograph is believed to show Cassandra Castello during the 1924 masquerade. No reliable time accompanies the print. One witness said she had already left by eleven; another recalled speaking with her after midnight.",
      "The reverse bears two different annotations: ‘last photograph of Cassie’ in pencil and ‘not the last’ in darker ink. Neither hand has been identified.",
    ],
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
      alt: "Fictional 1920s newspaper portrait of Cassandra Castello",
      caption: "CASSANDRA CASTELLO · proprietress of The Black Veil · photograph date uncertain",
      width: 1122,
      height: 1402,
      focalPoint: "50% 25%",
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
    markings: ["Later edition removes ‘fled’", "No warrant located"],
    provenance: fictionalArtifact(),
  },
  {
    slug: "witnesses-give-conflicting-accounts",
    catalogNumber: "MPD–24–118",
    date: "November 5, 1924",
    year: 1924,
    title: "Witnesses Give Conflicting Accounts",
    format: "police",
    excerpt: "Four unsigned summaries disagree about the time, the number of guests, and whether officers entered the club.",
    body: [
      "STATEMENT A: music ceased at 11:47 P.M.; two persons left by the river side. STATEMENT B: music continued beyond midnight; no river entrance existed. STATEMENT C: an officer entered before twelve. STATEMENT D: police were not summoned until morning.",
      "The original statements are missing. This summary carries no officer’s signature and no station seal. A typed line naming Castello as ‘complainant’ has been crossed out and replaced with ‘person sought.’",
    ],
    markings: ["COPY — ORIGINAL NOT FOUND", "STATUS: OPEN / CLOSED"],
    provenance: fictionalArtifact("Fictional police-record prop. It is not a real Manchester Police Department document."),
  },
  {
    slug: "black-veil-closed-indefinitely",
    catalogNumber: "BV–24–061",
    date: "November 8, 1924",
    year: 1924,
    title: "The Black Veil Closed Indefinitely",
    format: "notice",
    excerpt: "A management notice confirms the closure but names no proprietor and acknowledges no casualty.",
    body: [
      "By order of management, The Black Veil is closed indefinitely. Memberships are suspended. Correspondence concerning the All Hallows’ Eve engagement will be returned unopened.",
      "The notice is unsigned. The type differs from the club’s 1921 stationery. A city clerk later recorded that no business under this name could be located at any Manchester address offered by investigators.",
    ],
    markings: ["POSTED IN THREE LOCATIONS", "Locations not recorded"],
    provenance: fictionalArtifact("Fictional management notice and fictional archival annotation."),
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
    markings: ["Reporter’s notes unavailable", "No trace of missing woman"],
    provenance: fictionalArtifact("Fictional retrospective and generated Cassandra photograph."),
    featured: true,
  },
  {
    slug: "no-confirmed-activity",
    catalogNumber: "BV–25–011",
    date: "December 31, 1925",
    year: 1925,
    title: "No Confirmed Activity",
    format: "memorandum",
    excerpt: "A nearly blank catalog sheet records a closed house, sparse files, and rumors that cannot be verified.",
    body: [
      "Premises: unknown. Proprietress: missing. Correspondence: none confirmed. Police action: none recorded. Public activity: none confirmed.",
      "Someone has added in pencil beneath the final line: ‘The rent is still paid.’ The notation is undated.",
    ],
    markings: ["DORMANT", "Do not destroy empty file"],
    provenance: fictionalArtifact("Fictional archive memorandum."),
  },
  {
    slug: "a-house-remembered-imperfectly",
    catalogNumber: "BV–25–014",
    date: "Undated · filed with the 1925 papers",
    year: 1925,
    title: "A House Remembered Imperfectly",
    deck: "The surviving Manchester record kept on hand for anyone who asks after the house.",
    format: "memorandum",
    excerpt: "A records-office reference note, kept for public inquiries, on a house whose address was never quite agreed upon.",
    body: [
      "Somewhere between Elm Street, the Merrimack, and the brick mass of the Amoskeag works, The Black Veil offered illegal drink and uncommon privacy to people who did not ordinarily share a table.",
      "Correspondence addressed to the house is still collected, though by whom is not recorded. Those who ask after The Black Veil are told, politely, that it closed in 1924. Those who know the old words are not told this.",
    ],
    markings: ["Kept for public inquiries", "Address unconfirmed"],
    provenance: fictionalArtifact("Fictional records-office reference note, kept on file to answer routine public inquiries about the house."),
  },
  {
    slug: "black-envelopes-appear",
    catalogNumber: "BV–26–016",
    date: "October 7, 1926",
    year: 1926,
    title: "Black Envelopes Appear",
    format: "telegram",
    excerpt: "Invitations bearing the old insignia circulate two years after the club closed and its proprietress vanished.",
    body: [
      "BLACK ENVELOPES DELIVERED ELM STREET AND WEST SIDE STOP RECIPIENTS DECLINE NAMES STOP SEAL MATCHES CASTELLO STATIONERY STOP PRINTER UNKNOWN STOP",
      "IF CASTELLO HAS BEEN MISSING SINCE 1924 STOP WHO PREPARED THE LIST STOP",
    ],
    markings: ["ORIGIN UNAVAILABLE", "Filed before receipt"],
    provenance: fictionalArtifact("Fictional telegram created for The Black Veil."),
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
    body: [
      "THE BLACK VEIL requests your company at an All Hallows’ Eve masquerade, October 31, 1926, Manchester, New Hampshire. The location will be disclosed to confirmed guests.",
      "The invitation carries no signature. Microscopic comparison has not established whether the hand resembles Cassandra Castello’s. The envelope was cataloged before the archive records receiving it.",
    ],
    markings: ["THE VEIL HAS LIFTED", "SENDER UNKNOWN"],
    provenance: fictionalArtifact("Fictional 1926 invitation. The sender is intentionally unresolved."),
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
