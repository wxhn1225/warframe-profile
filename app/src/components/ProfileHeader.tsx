import { Show, For } from "solid-js";
import type { ProfileResult } from "../types/profile";
import { sanitiseName, formatNumber } from "../lib/utils";
import { t } from "../lib/dict";

interface Props {
  result: ProfileResult;
  dict: Record<string, string>;
}

const FOUNDER_TIERS = ["", "Disciple", "Hunter", "Master", "Grand Master"];
const GUIDE_TIERS = ["", "Guide of Lotus (Junior)", "Guide of Lotus (Senior)"];
const CLAN_TIERS = ["", "幽灵", "暗影", "风暴", "山脉", "月亮"];

export default function ProfileHeader(props: Props) {
  const r = () => props.result;

  const accolades = () => {
    const list: string[] = [];
    if (r().Staff) {
      list.push("Staff");
      return list;
    }
    if (r().Founder) list.push(`创始人 (${FOUNDER_TIERS[r().Founder!]})`);
    if (r().Guide) list.push(GUIDE_TIERS[r().Guide!]);
    if (r().Moderator) list.push("Moderator");
    if (r().Partner) list.push("Partner");
    if (r().Accolades?.Heirloom) list.push("Heirloom");
    return list;
  };

  const regDate = () => {
    const ts = r().Created?.$date?.$numberLong;
    if (!ts) return null;
    return new Date(parseInt(ts)).toLocaleDateString();
  };

  const alignmentLabel = () => {
    const a = r().Alignment?.Alignment ?? 0;
    if (a > 0) return `慈悲 +${a}`;
    if (a < 0) return `牺牲 ${a}`;
    return "中立";
  };

  const deathMarkNames = () =>
    (r().DeathMarks ?? []).map((key) => t(props.dict, key) || key.split("/").pop() || key);

  return (
    <div class="bg-[#fdf8f2] rounded-xl border border-[#e0d4c4] shadow-sm px-6 py-5 mb-4">
      <div class="flex items-start gap-4">
        {/* MR 徽章 */}
        <div class="shrink-0 w-14 h-14 rounded-lg bg-[#2a1f14] flex flex-col items-center justify-center text-[#e8ddd0]">
          <span class="text-[10px] font-medium opacity-60 leading-none tracking-wider">MR</span>
          <span class="text-2xl font-bold leading-none mt-0.5">{r().PlayerLevel ?? 0}</span>
        </div>

        <div class="min-w-0 flex-1">
          {/* 用户名 + 指挥官状态 */}
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-xl font-semibold text-[#2a1f14] leading-tight truncate">
              {sanitiseName(r().DisplayName)}
            </h2>
            <Show when={r().UnlockedOperator}>
              <span class="text-xs px-2 py-0.5 rounded bg-[#f0e8d8] text-[#8a6840] border border-[#d4c0a0] shrink-0">
                指挥官已解锁
              </span>
            </Show>
          </div>

          {/* 注册日期 */}
          <Show when={regDate()}>
            <p class="text-sm text-[#8a7060] mt-0.5">注册于 {regDate()}</p>
          </Show>

          {/* 对齐值 */}
          <Show when={r().Alignment !== undefined}>
            <p class="text-xs text-[#9a8878] mt-0.5">
              对齐：{alignmentLabel()}
              <Show when={(r().Alignment?.Wisdom ?? 0) > 0}>
                <span class="ml-1 text-[#b0a090]">·</span>
                <span class="ml-1">智慧 {r().Alignment!.Wisdom}</span>
              </Show>
            </p>
          </Show>

          {/* 荣誉成员 */}
          <Show when={accolades().length > 0}>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <For each={accolades()}>
                {(a) => (
                  <span class="text-xs px-2 py-0.5 rounded bg-[#fdf5e4] text-[#7a5820] border border-[#e0c888]">
                    {a}
                  </span>
                )}
              </For>
            </div>
          </Show>

          {/* 称号 */}
          <Show when={r().TitleType}>
            <p class="text-xs text-[#9a8878] mt-0.5">
              {t(props.dict, r().TitleType!) || r().TitleType!.split("/").pop()?.replace(/([A-Z])/g, " $1").trim()}
            </p>
          </Show>

          {/* 氏族 */}
          <Show when={r().GuildName}>
            <p class="text-sm text-[#5a4632] mt-1.5">
              <span class="text-[#9a8474] mr-1">氏族</span>
              {r().GuildName}
              <Show when={r().GuildTier}>
                <span class="text-[#9a8474] text-xs ml-2">
                  {CLAN_TIERS[r().GuildTier!]} · 等级 {r().GuildClass}
                </span>
              </Show>
              <Show when={r().GuildXp != null}>
                <span class="text-[#9a8474] text-xs ml-2">· 贡献 {formatNumber(r().GuildXp!)} XP</span>
              </Show>
            </p>
          </Show>

          {/* 死亡标记 */}
          <Show when={deathMarkNames().length > 0}>
            <div class="mt-2 flex flex-wrap items-center gap-1.5">
              <span class="text-xs text-[#9a8474]">死亡标记</span>
              <For each={deathMarkNames()}>
                {(name) => (
                  <span class="text-xs px-2 py-0.5 rounded bg-[#fdf0e8] text-[#b05030] border border-[#e8c8b0]">
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
