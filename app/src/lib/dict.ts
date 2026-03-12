// 所有语言信息（来自 languages.csv）
export interface LangInfo {
  code: string;
  native: string;
  english: string;
}

export const ALL_LANGUAGES: LangInfo[] = [
  { code: "zh", native: "简体中文", english: "Simplified Chinese" },
  { code: "en", native: "English", english: "English" },
  { code: "de", native: "Deutsch", english: "German" },
  { code: "es", native: "Español", english: "Spanish" },
  { code: "fr", native: "Français", english: "French" },
  { code: "it", native: "Italiano", english: "Italian" },
  { code: "ja", native: "日本語", english: "Japanese" },
  { code: "ko", native: "한국어", english: "Korean" },
  { code: "pl", native: "Polski", english: "Polish" },
  { code: "pt", native: "Português", english: "Portuguese" },
  { code: "ru", native: "Русский", english: "Russian" },
  { code: "tr", native: "Türkçe", english: "Turkish" },
  { code: "uk", native: "Українська", english: "Ukrainian" },
  { code: "tc", native: "繁體中文", english: "Traditional Chinese" },
  { code: "th", native: "แบบไทย", english: "Thai" },
];

let manifestCache: string[] | null = null;

export async function getAvailableLanguages(): Promise<LangInfo[]> {
  if (!manifestCache) {
    try {
      const r = await fetch("/data/lang/manifest.json");
      manifestCache = r.ok ? await r.json() : ["zh"];
    } catch {
      manifestCache = ["zh"];
    }
  }
  return ALL_LANGUAGES.filter((l) => manifestCache!.includes(l.code));
}

const dictCache = new Map<string, Record<string, string>>();

export async function loadDict(code: string): Promise<Record<string, string>> {
  if (dictCache.has(code)) return dictCache.get(code)!;
  try {
    const r = await fetch(`/data/lang/${code}.json`);
    if (!r.ok) throw new Error("not found");
    const data: Record<string, string> = await r.json();
    dictCache.set(code, data);
    return data;
  } catch {
    // 找不到则回退到中文
    if (code !== "zh") return loadDict("zh");
    return {};
  }
}

export function t(dict: Record<string, string>, key: string): string {
  return dict[key] ?? key;
}
