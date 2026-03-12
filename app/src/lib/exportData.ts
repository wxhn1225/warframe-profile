// 懒加载 + 内存缓存，避免重复请求
const cache = new Map<string, unknown>();

export async function loadExport<T>(name: string): Promise<T> {
  if (cache.has(name)) return cache.get(name) as T;
  const r = await fetch(`/data/export/${name}.json`);
  if (!r.ok) throw new Error(`Failed to load ${name}.json`);
  const data = await r.json();
  cache.set(name, data);
  return data as T;
}

// 类型定义（只取 profile viewer 用到的字段）

export interface ExportSyndicateTitle {
  level: number;
  name: string;
  minStanding?: number;
  maxStanding?: number;
}

export interface ExportSyndicate {
  name: string;
  icon: string;
  colour: { value: string };
  backgroundColour: { value: string };
  titles?: ExportSyndicateTitle[];
}

export interface ExportWarframe {
  name: string;
}

export interface ExportWeapon {
  name: string;
}

export interface ExportSentinel {
  name: string;
}

export interface ExportCustom {
  name: string;
  icon?: string;
}

export interface ExportFlavour {
  name: string;
  hexColours?: { value: string }[];
  legacyColours?: { value: string }[];
}

export interface ExportAchievement {
  name: string;
  description?: string;
  icon?: string;
  hidden?: boolean;
  requiredCount?: number;
}

export interface ExportRegion {
  name: string;
  systemName?: string;
  systemIndex?: number;
  nodeType?: number;
  missionType?: string;
  missionName?: string;
  faction?: string;
  masteryExp?: number;
}

export interface ExportFaction {
  name: string;
}

export interface ExportNightwave {
  affiliationTag: string;
}
