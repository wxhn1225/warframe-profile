import { createResource, For, Show } from "solid-js";
import type { ProfileResult } from "../../types/profile";
import { loadExport } from "../../lib/exportData";
import { t } from "../../lib/dict";
import { formatHours, formatNumber } from "../../lib/utils";

interface Props {
  result: ProfileResult;
  dict: Record<string, string>;
}

export default function Stats(props: Props) {
  const s = () => props.result.Stats;

  const [exports] = createResource(async () => {
    const [warframes, weapons, sentinels, enemies] = await Promise.all([
      loadExport<Record<string, { name: string }>>("ExportWarframes"),
      loadExport<Record<string, { name: string }>>("ExportWeapons"),
      loadExport<Record<string, { name: string }>>("ExportSentinels"),
      loadExport<{ avatars: Record<string, { name: string }> }>("ExportEnemies"),
    ]);
    return { warframes, weapons, sentinels, avatars: enemies.avatars };
  });

  const resolveName = (type: string) => {
    const ex = exports();
    if (!ex) return type;
    const nameKey =
      ex.warframes[type]?.name ??
      ex.weapons[type]?.name ??
      ex.sentinels[type]?.name;
    if (nameKey) return t(props.dict, nameKey) || nameKey;
    return type.split("/").pop()?.replace(/([A-Z])/g, " $1").trim() ?? type;
  };

  const resolveEnemyName = (type: string) => {
    const ex = exports();
    if (!ex) return type;
    const nameKey = ex.avatars[type]?.name;
    if (nameKey) return t(props.dict, nameKey) || nameKey;
    return type.split("/").pop()?.replace(/([A-Z])/g, " $1").trim() ?? type;
  };

  const cipherAvg = () => {
    const stats = s();
    if (stats?.CipherTime && stats?.CiphersSolved)
      return (stats.CipherTime / stats.CiphersSolved).toFixed(1) + " s";
    return "0 s";
  };

  return (
    <Show when={s()} fallback={<p class="text-sm text-slate-400">暂无统计数据</p>}>
      {(stats) => (
        <div class="space-y-6">
          {/* 总览 */}
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              ["游玩时长", formatHours(stats().TimePlayedSec ?? 0)],
              ["完成任务", formatNumber(stats().MissionsCompleted ?? 0)],
              ["任务失败", formatNumber(stats().MissionsFailed ?? 0)],
              ["主动退出", formatNumber(stats().MissionsQuit ?? 0)],
              ["总收入", formatNumber(stats().Income ?? 0) + " cr"],
              ["死亡次数", formatNumber(stats().Deaths ?? 0)],
              ["复活次数", formatNumber(stats().ReviveCount ?? 0)],
              ["治疗次数", formatNumber(stats().HealCount ?? 0)],
              ["密码解出", formatNumber(stats().CiphersSolved ?? 0)],
              ["平均解密", cipherAvg()],
            ].map(([label, value]) => (
              <div class="bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-200">
                <p class="text-xs text-slate-500">{label}</p>
                <p class="text-base font-semibold text-slate-800 mt-0.5 tabular-nums">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* 装备统计 */}
          <Show when={exports() && stats().Weapons?.length}>
            <div>
              <h3 class="text-sm font-semibold text-slate-700 mb-2">装备统计</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-left text-xs text-slate-500 border-b border-slate-200">
                      <th class="pb-2 pr-3 font-medium">装备</th>
                      <th class="pb-2 pr-3 font-medium text-right">时长</th>
                      <th class="pb-2 pr-3 font-medium text-right">击杀</th>
                      <th class="pb-2 pr-3 font-medium text-right">爆头</th>
                      <th class="pb-2 pr-3 font-medium text-right">助攻</th>
                      <th class="pb-2 font-medium text-right">经验值</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For
                      each={[...(stats().Weapons ?? [])].sort(
                        (a, b) => (b.equipTime ?? 0) - (a.equipTime ?? 0)
                      )}
                    >
                      {(w) => (
                        <tr class="border-b border-slate-100 hover:bg-slate-50">
                          <td class="py-1.5 pr-3 text-slate-700">
                            {resolveName(w.type)}
                          </td>
                          <td class="py-1.5 pr-3 text-right tabular-nums text-slate-500">
                            {formatHours(w.equipTime ?? 0)}
                          </td>
                          <td class="py-1.5 pr-3 text-right tabular-nums text-slate-600">
                            {formatNumber(w.kills ?? 0)}
                          </td>
                          <td class="py-1.5 pr-3 text-right tabular-nums text-slate-500">
                            {formatNumber(w.headshots ?? 0)}
                          </td>
                          <td class="py-1.5 pr-3 text-right tabular-nums text-slate-500">
                            {formatNumber(w.assists ?? 0)}
                          </td>
                          <td class="py-1.5 text-right tabular-nums text-slate-500">
                            {formatNumber(w.xp ?? 0)}
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </div>
          </Show>

          {/* 敌人统计 */}
          <Show when={exports() && stats().Enemies?.length}>
            <div>
              <h3 class="text-sm font-semibold text-slate-700 mb-2">敌人统计</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-left text-xs text-slate-500 border-b border-slate-200">
                      <th class="pb-2 pr-3 font-medium">敌人</th>
                      <th class="pb-2 pr-3 font-medium text-right">击杀</th>
                      <th class="pb-2 pr-3 font-medium text-right">爆头</th>
                      <th class="pb-2 pr-3 font-medium text-right">助攻</th>
                      <th class="pb-2 pr-3 font-medium text-right">处决</th>
                      <th class="pb-2 font-medium text-right">扫描</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For
                      each={[...(stats().Enemies ?? [])]
                        .filter((e) => exports()?.avatars[e.type])
                        .sort((a, b) => (b.kills ?? 0) - (a.kills ?? 0))}
                    >
                      {(e) => {
                        const scan = stats().Scans?.find(
                          (s) => s.type === e.type
                        )?.scans ?? 0;
                        return (
                          <tr class="border-b border-slate-100 hover:bg-slate-50">
                            <td class="py-1.5 pr-3 text-slate-700">
                              {resolveEnemyName(e.type)}
                            </td>
                            <td class="py-1.5 pr-3 text-right tabular-nums text-slate-600">
                              {formatNumber(e.kills ?? 0)}
                            </td>
                            <td class="py-1.5 pr-3 text-right tabular-nums text-slate-500">
                              {formatNumber(e.headshots ?? 0)}
                            </td>
                            <td class="py-1.5 pr-3 text-right tabular-nums text-slate-500">
                              {formatNumber(e.assists ?? 0)}
                            </td>
                            <td class="py-1.5 pr-3 text-right tabular-nums text-slate-500">
                              {formatNumber(e.executions ?? 0)}
                            </td>
                            <td class="py-1.5 text-right tabular-nums text-slate-500">
                              {formatNumber(scan)}
                            </td>
                          </tr>
                        );
                      }}
                    </For>
                  </tbody>
                </table>
              </div>
            </div>
          </Show>
        </div>
      )}
    </Show>
  );
}
