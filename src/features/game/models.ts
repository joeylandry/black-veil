export type AttendanceStatus = "potential" | "invited" | "confirmed" | "declined" | "waitlisted";

export type CharacterFaction =
  | "amoskeag-labor"
  | "business-society"
  | "black-veil-trade"
  | "law-city"
  | "press-medicine-professions"
  | "masquerade-1924";

export type EvidenceKind =
  | "key"
  | "letter"
  | "photograph"
  | "receipt"
  | "matchbook"
  | "telegram"
  | "newspaper"
  | "note"
  | "liquor-label"
  | "invitation"
  | "business-card";

/** Admin identity. This belongs in future server-side storage, never public content. */
export type RealIdentity = {
  id: string;
  realName: string;
  email: string;
  attendanceStatus: AttendanceStatus;
};

/** Information safe to reveal to all players after assignments are finalized. */
export type PublicCharacterProfile = {
  characterName: string;
  occupation: string;
  publicBiography: string;
  factions: CharacterFaction[];
};

/** Private game data. No instances of this type belong in client bundles. */
export type PrivateCharacterDossier = {
  realIdentityId: string;
  character: PublicCharacterProfile;
  privateBiography: string;
  secrets: string[];
  objectives: string[];
  relationshipIds: string[];
  knowledge: string[];
  evidenceIds: string[];
  knowsAbout1924: boolean;
  connectionToCassandra?: string;
  connectionTo1926Victim?: string;
  murderer: boolean;
  victim: boolean;
  active: boolean;
};

export type GameEvidence = {
  id: string;
  kind: EvidenceKind;
  title: string;
  publicDescription?: string;
  privateDescription: string;
  digitalArchiveSlug?: string;
  physicalPropId?: string;
  ownerCharacterIds: string[];
  mysteryLinks: Array<"1924-cassandra" | "1926-murder">;
};

export type InvestigationResult = {
  primary1926Theory?: string;
  cassandra1924Theory?: string;
  invitationSenderTheory?: string;
  connectionTheory?: string;
};
