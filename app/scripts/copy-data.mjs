/**
 * 将 submodule 的 JSON 文件复制到 public/data/
 * 用法: node scripts/copy-data.mjs [zh|full]
 */
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, "../..");
const OUT_EXPORT = resolve(__dir, "../public/data/export");
const OUT_LANG = resolve(__dir, "../public/data/lang");
const EXPORT_SRC = resolve(ROOT, "warframe-public-export-plus");
const LANG_SRC = resolve(ROOT, "warframe-languages-bin-data");

const mode = process.argv[2] ?? "zh";

// 全部 Export 文件（一次打包进去，按需加载）
const NEEDED_EXPORTS = [
  "ExportAbilities",
  "ExportAchievements",
  "ExportAnimals",
  "ExportArcanes",
  "ExportAvionics",
  "ExportBoosters",
  "ExportBoosterPacks",
  "ExportBounties",
  "ExportBundles",
  "ExportChallenges",
  "ExportCodex",
  "ExportCreditBundles",
  "ExportCustoms",
  "ExportDrones",
  "ExportEnemies",
  "ExportEmailItems",
  "ExportFactions",
  "ExportFlavour",
  "ExportFocusUpgrades",
  "ExportFusionBundles",
  "ExportGear",
  "ExportImages",
  "ExportIntrinsics",
  "ExportKeys",
  "ExportMisc",
  "ExportMissionTypes",
  "ExportModSet",
  "ExportNightwave",
  "ExportRailjackWeapons",
  "ExportRecipes",
  "ExportRegions",
  "ExportRelics",
  "ExportResources",
  "ExportSentinels",
  "ExportSystems",
  "ExportSyndicates",
  "ExportTextIcons",
  "ExportTilesets",
  "ExportUpgrades",
  "ExportVirtuals",
  "ExportWarframes",
  "ExportWeapons",
];

// 语言代码列表
const ALL_LANGS = ["en","de","es","fr","it","ja","ko","pl","pt","ru","tr","uk","zh","tc","th"];
const ZH_ONLY = ["zh"];

mkdirSync(OUT_EXPORT, { recursive: true });
mkdirSync(OUT_LANG, { recursive: true });

// 复制 Export 文件
console.log("Copying export data...");
for (const name of NEEDED_EXPORTS) {
  const src = resolve(EXPORT_SRC, `${name}.json`);
  const dst = resolve(OUT_EXPORT, `${name}.json`);
  if (!existsSync(src)) {
    console.warn(`  skip: ${name}.json not found`);
    continue;
  }
  copyFileSync(src, dst);
  console.log(`  ok: ${name}.json`);
}

// 复制语言文件
const langs = mode === "full" ? ALL_LANGS : ZH_ONLY;
console.log(`\nCopying language files (${mode}: ${langs.join(", ")})...`);
const copiedLangs = [];
for (const code of langs) {
  const src = resolve(LANG_SRC, `${code}.json`);
  const dst = resolve(OUT_LANG, `${code}.json`);
  if (!existsSync(src)) {
    console.warn(`  skip: ${code}.json not found`);
    continue;
  }
  copyFileSync(src, dst);
  copiedLangs.push(code);
  console.log(`  ok: ${code}.json`);
}

// 生成语言清单
import { writeFileSync } from "fs";
writeFileSync(
  resolve(OUT_LANG, "manifest.json"),
  JSON.stringify(copiedLangs)
);

console.log("\nDone.");
