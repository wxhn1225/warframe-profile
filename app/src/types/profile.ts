export interface ProfileData {
  Results: [ProfileResult];
  Stats?: Stats;
}

export interface ProfileResult {
  AccountId: { $oid: string };
  DisplayName: string;
  PlayerLevel?: number;
  Created?: { $date: { $numberLong: string } };
  Staff?: boolean;
  Founder?: number;
  Guide?: number;
  Moderator?: boolean;
  Partner?: boolean;
  GuildName?: string;
  GuildTier?: number;
  GuildClass?: number;
  GuildXp?: number;
  GuildEmblem?: boolean;
  TitleType?: string;
  Wishlist?: string[];
  Affiliations?: Affiliation[];
  ChallengeProgress?: ChallengeProgress[];
  Missions?: Mission[];
  LoadOutPreset?: LoadOutPreset;
  LoadOutInventory?: LoadOutInventory;
  OperatorLoadOuts?: OperatorLoadOut[];
  Accolades?: { Heirloom?: boolean };
  PlayerSkills?: Record<string, number>;
  DeathMarks?: string[];
  MigratedToConsole?: boolean;
  UnlockedOperator?: boolean;
  UnlockedAlignment?: boolean;
  Alignment?: { Alignment: number; Wisdom: number };
  DailyFocus?: number;
  DailyAffiliation?: number;
  DailyAffiliationPvp?: number;
  DailyAffiliationLibrary?: number;
  DailyAffiliationCetus?: number;
  DailyAffiliationQuills?: number;
  DailyAffiliationSolaris?: number;
  DailyAffiliationVentkids?: number;
  DailyAffiliationVox?: number;
  DailyAffiliationEntrati?: number;
  DailyAffiliationNecraloid?: number;
  DailyAffiliationZariman?: number;
  DailyAffiliationKahl?: number;
  DailyAffiliationCavia?: number;
  DailyAffiliationHex?: number;
}

export interface Affiliation {
  Tag: string;
  Title?: number;
  Standing?: number;
}

export interface ChallengeProgress {
  Name: string;
  Progress: number;
}

export interface Mission {
  Tag: string;
  Completes: number;
  Tier?: boolean;
}

export interface LoadOutPreset {
  s?: SlotRef;
  p?: SlotRef;
  l?: SlotRef;
  m?: SlotRef;
  a?: SlotRef;
}

export interface SlotRef {
  ItemId?: { $oid: string };
  cus?: number;
  mod?: number;
  hide?: boolean;
}

export interface LoadOutItem {
  ItemType: string;
  ItemName?: string;
  Configs: LoadOutConfig[];
  XP?: number;
  FocusLens?: string;
}

export interface XPInfo {
  ItemType: string;
  XP: number;
}

export interface LoadOutConfig {
  Skins?: string[];
  pricol?: ColorSet;
  attcol?: ColorSet;
  syancol?: ColorSet;
  sigcol?: ColorSet;
}

export interface ColorSet {
  t0?: number;
  t1?: number;
  t2?: number;
  t3?: number;
  m0?: number;
  m1?: number;
  en?: number;
  e1?: number;
}

export interface LoadOutInventory {
  Suits?: LoadOutItem[];
  LongGuns?: LoadOutItem[];
  Pistols?: LoadOutItem[];
  Melee?: LoadOutItem[];
  WeaponSkins?: { ItemType: string }[];
  XPInfo?: XPInfo[];
}

export interface OperatorLoadOut {
  Skins?: string[];
}

export interface PvpStat {
  type: string;
  suitKills?: number;
  suitDeaths?: number;
  weaponKills?: number;
}

export interface Stats {
  TimePlayedSec?: number;
  Income?: number;
  MissionsCompleted?: number;
  MissionsFailed?: number;
  MissionsQuit?: number;
  MissionsInterrupted?: number;
  MissionsDumped?: number;
  MeleeKills?: number;
  CiphersSolved?: number;
  CiphersFailed?: number;
  CipherTime?: number;
  ReviveCount?: number;
  HealCount?: number;
  Deaths?: number;
  PickupCount?: number;
  Rating?: number;
  Rank?: number;
  DojoObstacleScore?: number;
  FomorianEventScore?: number;
  FlotillaEventScore?: number;
  FlotillaGroundBadgesTier1?: number;
  FlotillaGroundBadgesTier2?: number;
  FlotillaGroundBadgesTier3?: number;
  FlotillaSpaceBadgesTier1?: number;
  FlotillaSpaceBadgesTier2?: number;
  FlotillaSpaceBadgesTier3?: number;
  SentinelGameScore?: number;
  ZephyrScore?: number;
  Races?: Record<string, { highScore: number }>;
  PVP?: PvpStat[];
  Tutorial?: Record<string, { stage: number }>;
  Weapons?: WeaponStat[];
  Enemies?: EnemyStat[];
  Scans?: ScanEntry[];
  Abilities?: AbilityEntry[];
  Missions?: MissionHighScore[];
  PlayerLevel?: number;
}

export interface WeaponStat {
  type: string;
  equipTime?: number;
  kills?: number;
  headshots?: number;
  assists?: number;
  xp?: number;
  fired?: number;
  hits?: number;
  deaths?: number;
}

export interface EnemyStat {
  type: string;
  kills?: number;
  headshots?: number;
  assists?: number;
  executions?: number;
  deaths?: number;
  captures?: number;
}

export interface ScanEntry {
  type: string;
  scans: number;
}

export interface AbilityEntry {
  type: string;
  used: number;
}

export interface MissionHighScore {
  type: string;
  highScore: number;
}
