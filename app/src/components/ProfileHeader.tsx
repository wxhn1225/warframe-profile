import { Show, For } from "solid-js";
import type { ProfileResult } from "../types/profile";
import { sanitiseName, oidToDate } from "../lib/utils";
import { t } from "../lib/dict";

interface Props {
  result: ProfileResult;
  dict: Record<string, string>;
}

const FOUNDER_TIERS = ["", "Disciple", "Hunter", "Master", "Grand Master"];
const GUIDE_TIERS = ["", "Junior Guide of the Lotus", "Senior Guide of the Lotus"];
const CLAN_TIERS = ["", "Ghost", "Shadow", "Storm", "Mountain", "Moon"];

export default function ProfileHeader(props: Props) {
  const r = () => props.result;

  const accolades = () => {
    const list: string[] = [];
    if (r().Staff) {
      list.push("Digital Extremes Staff");
      return list;
    }
    if (r().Founder) list.push(`Founder (${FOUNDER_TIERS[r().Founder!]})`);
    if (r().Guide) list.push(GUIDE_TIERS[r().Guide!]);
    if (r().Moderator) list.push("Moderator");
    if (r().Partner) list.push("Warframe Creator");

    const oid = r().AccountId.$oid;
    const ts = parseInt(oid.substring(0, 8), 16);
    if (ts < 1363651200) list.push("Closed Beta Player");
    if (r().Accolades?.Heirloom) list.push("Ten Year Supporter");
    return list;
  };

  const regDate = () => oidToDate(r().AccountId.$oid).toLocaleDateString();

  const alignmentLabel = () => {
    const a = r().Alignment?.Alignment ?? 0;
    if (a > 0) return `慈悲 +${a}`;
    if (a < 0) return `牺牲 ${a}`;
    return "对齐：中立";
  };

  const deathMarkNames = () =>
    (r().DeathMarks ?? []).map((key) => t(props.dict, key) || key.split("/").pop() || key);

  return (
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5 mb-5">
      <div class="flex items-start gap-4">
        {/* MR 徽章 */}
        <div class="shrink-0 w-14 h-14 rounded-xl bg-blue-600 flex flex-col items-center justify-center text-white">
          <span class="text-[10px] font-medium opacity-80 leading-none">MR</span>
          <span class="text-2xl font-bold leading-none">{r().PlayerLevel ?? 0}</span>
        </div>

        <div class="min-w-0 flex-1">
          {/* 用户名 + 指挥官状态 */}
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-semibold text-slate-800 leading-tight truncate">
              {sanitiseName(r().DisplayName)}
            </h2>
            <Show when={r().UnlockedOperator}>
              <span class="text-xs px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200 shrink-0">
                指挥官已解锁
              </span>
            </Show>
          </div>

          {/* 注册日期 */}
          <p class="text-sm text-slate-500 mt-0.5">注册于 {regDate()}</p>

          {/* 对齐值 */}
          <Show when={r().Alignment !== undefined}>
            <p class="text-xs text-slate-400 mt-0.5">
              {alignmentLabel()}
              <Show when={(r().Alignment?.Wisdom ?? 0) > 0}>
                <span class="ml-2">智慧 {r().Alignment!.Wisdom}</span>
              </Show>
            </p>
          </Show>

          {/* 荣誉称号 */}
          <Show when={accolades().length > 0}>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <For each={accolades()}>
                {(a) => (
                  <span class="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {a}
                  </span>
                )}
              </For>
            </div>
          </Show>

          {/* 氏族 */}
          <Show when={r().GuildName}>
            <p class="text-sm text-slate-600 mt-1.5">
              <span class="text-slate-400 mr-1">氏族</span>
              {r().GuildName}
              <Show when={r().GuildTier}>
                <span class="text-slate-400 text-xs ml-2">
                  {CLAN_TIERS[r().GuildTier!]} · 等级 {r().GuildClass}
                </span>
              </Show>
            </p>
          </Show>

          {/* 死亡标记 */}
          <Show when={deathMarkNames().length > 0}>
            <div class="mt-2 flex flex-wrap items-center gap-1.5">
              <span class="text-xs text-slate-400">死亡标记</span>
              <For each={deathMarkNames()}>
                {(name) => (
                  <span class="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                    {name}
                  </span>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
