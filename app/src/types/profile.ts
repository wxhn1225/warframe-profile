export interface ProfileData {
  Results: [ProfileResult];
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
  Affiliations?: Affiliation[];
  ChallengeProgress?: ChallengeProgress[];
  Missions?: Mission[];
  LoadOutPreset?: LoadOutPreset;
  LoadOutInventory?: LoadOutInventory;
  OperatorLoadOuts?: OperatorLoadOut[];
  Accolades?: { Heirloom?: boolean };
  Stats?: Stats;
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
}

export interface OperatorLoadOut {
  Skins?: string[];
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
  CipherTime?: number;
  ReviveCount?: number;
  HealCount?: number;
  Deaths?: number;
  Weapons?: WeaponStat[];
  Enemies?: EnemyStat[];
  Scans?: ScanEntry[];
  Abilities?: AbilityEntry[];
}

export interface WeaponStat {
  type: string;
  equipTime?: number;
  kills?: number;
  headshots?: number;
  assists?: number;
  xp?: number;
  fired?: number;
}

export interface EnemyStat {
  type: string;
  kills?: number;
  headshots?: number;
  assists?: number;
  executions?: number;
  deaths?: number;
}

export interface ScanEntry {
  type: string;
  scans: number;
}

export interface AbilityEntry {
  type: string;
  used: number;
}
