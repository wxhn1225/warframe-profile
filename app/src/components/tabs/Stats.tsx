import { createResource, createSignal, For, Show } from "solid-js";
import type { ProfileResult, Stats as StatsType } from "../../types/profile";
import { loadExport } from "../../lib/exportData";
import { t } from "../../lib/dict";
import { formatHours, formatNumber } from "../../lib/utils";

interface Props {
  result: ProfileResult;
  stats?: StatsType;
  dict: Record<string, string>;
}

// Keys not present in ExportIntrinsics.json — sourced from zh.json
const PLAYER_SKILL_FALLBACK: Record<string, string> = {
  // Railjack intrinsics cumulative value
  LPP_SPACE: "内源之力",
  // Duviri / Drifter intrinsics cumulative value
  LPP_DRIFTER: "漂泊者内源之力",
  // Duviri / Drifter intrinsic categories (rank 0–10)
  LPS_DRIFT_COMBAT: "战斗",
  LPS_DRIFT_ENDURANCE: "韧性",
  LPS_DRIFT_HEROICS: "英勇无畏",
  LPS_DRIFT_OPPORTUNITY: "机遇",
  LPS_DRIFT_RIDING: "骑术",
  LPS_DRIFT_SKILL: "战斗技巧",
  LPS_DRIFT_SURVIVABILITY: "生存本能",
};

const STAT_TABS = [
  { id: "overview", label: "总览" },
  { id: "abilities", label: "技能" },
  { id: "weapons", label: "武器" },
  { id: "enemies", label: "敌人" },
  { id: "scans", label: "扫描" },
  { id: "nodes", label: "节点" },
  { id: "races", label: "赛道" },
  { id: "pvp", label: "PvP" },
  { id: "mastery", label: "精通" },
] as const;

type StatTabId = (typeof STAT_TABS)[number]["id"];

export default function Stats(props: Props) {
  const [statTab, setStatTab] = createSignal<StatTabId>("overview");
  const s = () => props.stats;

  const [exports] = createResource(async () => {
    const [
      warframesRaw, weapons, sentinels, enemies, regions,
      intrinsics, keys, animals, resources,
    ] = await Promise.all([
      loadExport<Record<string, { name: string; abilities?: Array<{ uniqueName: string; name: string }> }>>("ExportWarframes"),
      loadExport<Record<string, { name: string }>>("ExportWeapons"),
      loadExport<Record<string, { name: string }>>("ExportSentinels"),
      loadExport<{ avatars: Record<string, { name: string }> }>("ExportEnemies"),
      loadExport<Record<string, { name: string; systemName?: string; missionName?: string; factionName?: string }>>("ExportRegions"),
      loadExport<Record<string, { name: string }>>("ExportIntrinsics"),
      loadExport<Record<string, { name: string }>>("ExportKeys"),
      loadExport<Record<string, { name: string }>>("ExportAnimals"),
      loadExport<Record<string, { name: string }>>("ExportResources"),
    ]);

    const warframes: Record<string, { name: string }> = {};
    const abilityMap: Record<string, string> = {};
    for (const [k, wf] of Object.entries(warframesRaw)) {
      warframes[k] = { name: wf.name };
      for (const ab of wf.abilities ?? []) {
        if (ab.uniqueName && ab.name) abilityMap[ab.uniqueName] = ab.name;
      }
    }

    return { warframes, weapons, sentinels, avatars: enemies.avatars, regions, intrinsics, keys, animals, resources, abilityMap };
  });

  const resolveName = (type: string) => {
    const ex = exports();
    if (!ex) return type;
    const nameKey =
      ex.warframes[type]?.name ??
      ex.weapons[type]?.name ??
      ex.sentinels[type]?.name ??
      ex.resources[type]?.name;
    if (nameKey) return t(props.dict, nameKey) || nameKey;
    return type.split("/").pop()?.replace(/([A-Z])/g, " $1").trim() ?? type;
  };

  const resolveNodeName = (type: string) => {
    const ex = exports();
    if (!ex) return type;

    if (type.startsWith("/Lotus/Types/Keys/")) {
      const entry = ex.keys[type];
      if (entry?.name) return t(props.dict, entry.name) || entry.name;
      return type.split("/").pop()?.replace(/([A-Z])/g, " $1").trim() ?? type;
    }

    const node = ex.regions[type];
    if (!node) return type.split("/").pop()?.replace(/([A-Z])/g, " $1").trim() ?? type;

    const name = t(props.dict, node.name) || node.name;
    const sys = node.systemName ? (t(props.dict, node.systemName) || node.systemName) : "";
    const mission = node.missionName ? (t(props.dict, node.missionName) || "") : "";
    const faction = node.factionName ? (t(props.dict, node.factionName) || "") : "";

    const details = [mission, faction].filter(Boolean).join(" · ");
    const loc = sys ? `${name} · ${sys}` : name;
    return details ? `${loc} · ${details}` : loc;
  };

  const resolveEnemyOrScanName = (type: string) => {
    const ex = exports();
    if (!ex) return type;
    const nameKey =
      ex.avatars[type]?.name ??
      ex.animals[type]?.name ??
      ex.resources[type]?.name;
    if (nameKey) return t(props.dict, nameKey) || nameKey;
    return type.split("/").pop()?.replace(/([A-Z])/g, " $1").trim() ?? type;
  };

  const resolveAbilityName = (type: string) => {
    const ex = exports();
    const nameKey = ex?.abilityMap[type];
    if (nameKey) return t(props.dict, nameKey) || nameKey;
    return type.split("/").pop()?.replace(/Ability$/, "").replace(/([A-Z])/g, " $1").trim() ?? type;
  };

  const resolvePlayerSkillName = (key: string) => {
    const ex = exports();
    const entry = ex?.intrinsics[key];
    if (entry?.name) return t(props.dict, entry.name) || entry.name;
    return PLAYER_SKILL_FALLBACK[key] ?? key;
  };


  const StatCard = (label: string, value: string) => (
    <div class="bg-[#fdf5ec] rounded-lg px-3 py-2.5 border border-[#e0d0bc]">
      <p class="text-xs text-[#8a7060]">{label}</p>
      <p class="text-base font-semibold text-[#2a1f14] mt-0.5 tabular-nums">{value}</p>
    </div>
  );

  return (
    <Show when={s()} fallback={<p class="text-sm text-[#a89880]">暂无统计数据</p>}>
      {(stats) => (
        <div class="space-y-4">

          {/* 二级标签页 */}
          <div class="flex flex-wrap gap-1 border-b border-[#e0d0bc]">
            {STAT_TABS.map((tab) => (
              <button
                onClick={() => setStatTab(tab.id)}
                class={`px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  statTab() === tab.id
                    ? "border-[#9b6030] text-[#2a1f14]"
                    : "border-transparent text-[#8a7060] hover:text-[#2a1f14]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── 总览 ── */}
          <Show when={statTab() === "overview"}>
            <div class="space-y-4">
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {([
                  ["总游戏时间", formatHours(stats().TimePlayedSec ?? 0)],
                  ["任务完成", formatNumber(stats().MissionsCompleted ?? 0)],
                  ["任务失败", formatNumber(stats().MissionsFailed ?? 0)],
                  ["任务放弃", formatNumber(stats().MissionsQuit ?? 0)],
                  ["任务中断", formatNumber(stats().MissionsInterrupted ?? 0)],
                  ["任务转移", formatNumber(stats().MissionsDumped ?? 0)],
                  ["现金", formatNumber(stats().Income ?? 0)],
                  ["死亡次数", formatNumber(stats().Deaths ?? 0)],
                  ["复活", formatNumber(stats().ReviveCount ?? 0)],
                  ["治疗", formatNumber(stats().HealCount ?? 0)],
                  ["近战击杀", formatNumber(stats().MeleeKills ?? 0)],
                  ["拾取物品", formatNumber(stats().PickupCount ?? 0)],
                  ["破解成功", formatNumber(stats().CiphersSolved ?? 0)],
                  ...(stats().CiphersFailed != null ? [["破解失败", formatNumber(stats().CiphersFailed!)]] as [string,string][] : []),
                  ["总破解时间", (stats().CipherTime ?? 0).toFixed(1) + " s"],
                  ["PvP 积分", formatNumber(stats().Rating ?? 0)],
                  ...(stats().DojoObstacleScore != null ? [["自定义障碍赛", formatNumber(stats().DojoObstacleScore!)]] as [string,string][] : []),
                  ...(stats().FomorianEventScore != null ? [["弹弓行动", formatNumber(stats().FomorianEventScore!)]] as [string,string][] : []),
                  ...(stats().FlotillaEventScore != null ? [["猩红之矛", formatNumber(stats().FlotillaEventScore!)]] as [string,string][] : []),
                  ...(stats().FlotillaGroundBadgesTier1 != null ? [["猩红之矛·影 I", formatNumber(stats().FlotillaGroundBadgesTier1!)]] as [string,string][] : []),
                  ...(stats().FlotillaGroundBadgesTier2 != null ? [["猩红之矛·影 II", formatNumber(stats().FlotillaGroundBadgesTier2!)]] as [string,string][] : []),
                  ...(stats().FlotillaGroundBadgesTier3 != null ? [["猩红之矛·影 III", formatNumber(stats().FlotillaGroundBadgesTier3!)]] as [string,string][] : []),
                  ...(stats().FlotillaSpaceBadgesTier1 != null ? [["猩红之矛·行动 I", formatNumber(stats().FlotillaSpaceBadgesTier1!)]] as [string,string][] : []),
                  ...(stats().FlotillaSpaceBadgesTier2 != null ? [["猩红之矛·行动 II", formatNumber(stats().FlotillaSpaceBadgesTier2!)]] as [string,string][] : []),
                  ...(stats().FlotillaSpaceBadgesTier3 != null ? [["猩红之矛·行动 III", formatNumber(stats().FlotillaSpaceBadgesTier3!)]] as [string,string][] : []),
                  ...(stats().SentinelGameScore != null ? [["哨兵游戏", formatNumber(stats().SentinelGameScore!)]] as [string,string][] : []),
                  ...(stats().ZephyrScore != null ? [["天马活动", formatNumber(stats().ZephyrScore!)]] as [string,string][] : []),
                  ...(props.result.DailyFocus != null
                    ? [["今日剩余专精", formatNumber(props.result.DailyFocus)]] as [string, string][]
                    : []),
                  ...Object.entries(props.result.PlayerSkills ?? {}).map(([k, v]) => {
                    return [resolvePlayerSkillName(k), String(v)] as [string, string];
                  }),
                ] as [string, string][]).map(([label, value]) => StatCard(label, value))}
              </div>
            </div>
          </Show>

          {/* ── 技能 ── */}
          <Show when={statTab() === "abilities"}>
            <Show when={stats().Abilities?.length} fallback={<p class="text-sm text-[#a89880]">暂无数据</p>}>
              <div class="overflow-auto max-h-[70vh] pr-2">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-left text-xs text-[#8a7060] border-b border-[#e0d0bc]">
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-4 font-medium">技能</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 font-medium text-right">使用次数</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={[...(stats().Abilities ?? [])].sort((a, b) => b.used - a.used)}>
                      {(ab) => (
                        <tr class="border-b border-[#ede4d8] hover:bg-[#fdf5ec]">
                          <td class="py-1.5 pr-4 text-[#3d2e1e]">{resolveAbilityName(ab.type)}</td>
                          <td class="py-1.5 text-right tabular-nums text-[#5a4030]">{formatNumber(ab.used)}</td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </Show>

          {/* ── 武器 ── */}
          <Show when={statTab() === "weapons"}>
            <Show when={exports() && stats().Weapons?.length} fallback={<p class="text-sm text-[#a89880]">暂无数据</p>}>
              <div class="overflow-auto max-h-[70vh] pr-2">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-left text-xs text-[#8a7060] border-b border-[#e0d0bc]">
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-3 font-medium">装备</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-3 font-medium text-right">时长</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-3 font-medium text-right">击杀</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-3 font-medium text-right">爆头</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-3 font-medium text-right">命中</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-3 font-medium text-right">射击</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-3 font-medium text-right">协助</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-3 font-medium text-right">死亡</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 font-medium text-right">经验值</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={[...(stats().Weapons ?? [])].sort((a, b) => (b.equipTime ?? 0) - (a.equipTime ?? 0))}>
                      {(w) => (
                        <tr class="border-b border-[#ede4d8] hover:bg-[#fdf5ec]">
                          <td class="py-1.5 pr-3 text-[#3d2e1e]">{resolveName(w.type)}</td>
                          <td class="py-1.5 pr-3 text-right tabular-nums text-[#8a7060]">{formatHours(w.equipTime ?? 0)}</td>
                          <td class="py-1.5 pr-3 text-right tabular-nums text-[#5a4030]">{formatNumber(w.kills ?? 0)}</td>
                          <td class="py-1.5 pr-3 text-right tabular-nums text-[#8a7060]">{formatNumber(w.headshots ?? 0)}</td>
                          <td class="py-1.5 pr-3 text-right tabular-nums text-[#8a7060]">{w.hits != null ? formatNumber(w.hits) : "—"}</td>
                          <td class="py-1.5 pr-3 text-right tabular-nums text-[#8a7060]">{w.fired != null ? formatNumber(w.fired) : "—"}</td>
                          <td class="py-1.5 pr-3 text-right tabular-nums text-[#8a7060]">{formatNumber(w.assists ?? 0)}</td>
                          <td class="py-1.5 pr-3 text-right tabular-nums text-[#8a7060]">{w.deaths != null ? formatNumber(w.deaths) : "—"}</td>
                          <td class="py-1.5 text-right tabular-nums text-[#8a7060]">{w.xp != null ? formatNumber(w.xp) : "—"}</td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </Show>

          {/* ── 敌人 ── */}
          <Show when={statTab() === "enemies"}>
            <Show when={exports() && stats().Enemies?.length} fallback={<p class="text-sm text-[#a89880]">暂无数据</p>}>
              <div class="overflow-auto max-h-[70vh] pr-2">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-left text-xs text-[#8a7060] border-b border-[#e0d0bc]">
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-3 font-medium">敌人</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-3 font-medium text-right">击杀</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-3 font-medium text-right">爆头</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-3 font-medium text-right">协助</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-3 font-medium text-right">处决</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-3 font-medium text-right">死亡</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-3 font-medium text-right">捕获</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 font-medium text-right">扫描</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={[...(stats().Enemies ?? [])].sort((a, b) => (b.kills ?? 0) - (a.kills ?? 0))}>
                      {(e) => {
                        const scan = stats().Scans?.find((sc) => sc.type === e.type)?.scans ?? 0;
                        return (
                          <tr class="border-b border-[#ede4d8] hover:bg-[#fdf5ec]">
                            <td class="py-1.5 pr-3 text-[#3d2e1e]">{resolveEnemyOrScanName(e.type)}</td>
                            <td class="py-1.5 pr-3 text-right tabular-nums text-[#5a4030]">{formatNumber(e.kills ?? 0)}</td>
                            <td class="py-1.5 pr-3 text-right tabular-nums text-[#8a7060]">{formatNumber(e.headshots ?? 0)}</td>
                            <td class="py-1.5 pr-3 text-right tabular-nums text-[#8a7060]">{formatNumber(e.assists ?? 0)}</td>
                            <td class="py-1.5 pr-3 text-right tabular-nums text-[#8a7060]">{e.executions != null ? formatNumber(e.executions) : "—"}</td>
                            <td class="py-1.5 pr-3 text-right tabular-nums text-[#8a7060]">{e.deaths != null ? formatNumber(e.deaths) : "—"}</td>
                            <td class="py-1.5 pr-3 text-right tabular-nums text-[#8a7060]">{e.captures != null ? formatNumber(e.captures) : "—"}</td>
                            <td class="py-1.5 text-right tabular-nums text-[#8a7060]">{scan > 0 ? formatNumber(scan) : "—"}</td>
                          </tr>
                        );
                      }}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </Show>

          {/* ── 扫描 ── */}
          <Show when={statTab() === "scans"}>
            <Show when={stats().Scans?.some((sc) => !stats().Enemies?.find((e) => e.type === sc.type))} fallback={<p class="text-sm text-[#a89880]">暂无数据</p>}>
              <div class="overflow-auto max-h-[70vh] pr-2">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-left text-xs text-[#8a7060] border-b border-[#e0d0bc]">
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-4 font-medium">目标</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 font-medium text-right">扫描次数</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={(stats().Scans ?? []).filter((sc) => !stats().Enemies?.find((e) => e.type === sc.type)).sort((a, b) => b.scans - a.scans)}>
                      {(sc) => (
                        <tr class="border-b border-[#ede4d8] hover:bg-[#fdf5ec]">
                          <td class="py-1.5 pr-4 text-[#3d2e1e]">{resolveEnemyOrScanName(sc.type)}</td>
                          <td class="py-1.5 text-right tabular-nums text-[#5a4030]">{formatNumber(sc.scans)}</td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </Show>

          {/* ── 节点 ── */}
          <Show when={statTab() === "nodes"}>
            <Show when={exports() && stats().Missions?.length} fallback={<p class="text-sm text-[#a89880]">暂无数据</p>}>
              <div class="overflow-auto max-h-[70vh] pr-2">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-left text-xs text-[#8a7060] border-b border-[#e0d0bc]">
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-4 font-medium">节点</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 font-medium text-right">最高分</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={[...(stats().Missions ?? [])].sort((a, b) => b.highScore - a.highScore)}>
                      {(m) => (
                        <tr class="border-b border-[#ede4d8] hover:bg-[#fdf5ec]">
                          <td class="py-1.5 pr-4 text-[#3d2e1e]">{resolveNodeName(m.type)}</td>
                          <td class="py-1.5 text-right tabular-nums text-[#5a4030]">{formatNumber(m.highScore)}</td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </Show>

          {/* ── 赛道 ── */}
          <Show when={statTab() === "races"}>
            <Show when={stats().Races && Object.keys(stats().Races!).length > 0} fallback={<p class="text-sm text-[#a89880]">暂无数据</p>}>
              <div class="overflow-auto max-h-[70vh] pr-2">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-left text-xs text-[#8a7060] border-b border-[#e0d0bc]">
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-4 font-medium">赛道</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 font-medium text-right">最高分</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={Object.entries(stats().Races!).sort((a, b) => b[1].highScore - a[1].highScore)}>
                      {([key, val]) => (
                        <tr class="border-b border-[#ede4d8] hover:bg-[#fdf5ec]">
                          <td class="py-1.5 pr-4 text-[#3d2e1e]">
                            {t(props.dict, `/Lotus/Language/Races/${key}`) || key}
                          </td>
                          <td class="py-1.5 text-right tabular-nums text-[#5a4030]">{formatNumber(val.highScore)}</td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </Show>

          {/* ── PvP ── */}
          <Show when={statTab() === "pvp"}>
            <Show when={stats().PVP?.length} fallback={<p class="text-sm text-[#a89880]">暂无数据</p>}>
              <div class="overflow-auto max-h-[70vh] pr-2">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-left text-xs text-[#8a7060] border-b border-[#e0d0bc]">
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-4 font-medium">装备</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-3 font-medium text-right">击杀</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 font-medium text-right">死亡</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={stats().PVP!}>
                      {(p) => (
                        <tr class="border-b border-[#ede4d8] hover:bg-[#fdf5ec]">
                          <td class="py-1.5 pr-4 text-[#3d2e1e]">{resolveName(p.type)}</td>
                          <td class="py-1.5 pr-3 text-right tabular-nums text-[#5a4030]">
                            {formatNumber((p.suitKills ?? 0) + (p.weaponKills ?? 0))}
                          </td>
                          <td class="py-1.5 text-right tabular-nums text-[#8a7060]">
                            {p.suitDeaths != null ? formatNumber(p.suitDeaths) : "—"}
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </Show>

          {/* ── 精通 ── */}
          <Show when={statTab() === "mastery"}>
            <Show when={exports() && props.result.LoadOutInventory?.XPInfo?.length} fallback={<p class="text-sm text-[#a89880]">暂无数据</p>}>
              <div class="overflow-auto max-h-[70vh] pr-2">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-left text-xs text-[#8a7060] border-b border-[#e0d0bc]">
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 pr-4 font-medium">装备</th>
                      <th class="sticky top-0 bg-[#fdf8f2] z-10 pb-2 font-medium text-right">经验值</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={[...(props.result.LoadOutInventory!.XPInfo!)].sort((a, b) => b.XP - a.XP)}>
                      {(item) => (
                        <tr class="border-b border-[#ede4d8] hover:bg-[#fdf5ec]">
                          <td class="py-1.5 pr-4 text-[#3d2e1e]">{resolveName(item.ItemType)}</td>
                          <td class="py-1.5 text-right tabular-nums text-[#5a4030]">{formatNumber(item.XP)}</td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </Show>

        </div>
      )}
    </Show>
  );
}
