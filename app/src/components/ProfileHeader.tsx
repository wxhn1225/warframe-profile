import { Show, For } from "solid-js";
import type { ProfileResult } from "../types/profile";
import { sanitiseName, oidToDate } from "../lib/utils";

interface Props {
  result: ProfileResult;
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

  const regDate = () => {
    const oid = r().AccountId.$oid;
    return oidToDate(oid).toLocaleDateString();
  };

  return (
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5 mb-5">
      <div class="flex items-start gap-4">
        {/* MR 徽章 */}
        <div class="shrink-0 w-14 h-14 rounded-xl bg-blue-600 flex flex-col items-center justify-center text-white">
          <span class="text-[10px] font-medium opacity-80 leading-none">MR</span>
          <span class="text-2xl font-bold leading-none">{r().PlayerLevel ?? 0}</span>
        </div>

        <div class="min-w-0 flex-1">
          {/* 用户名 */}
          <h2 class="text-xl font-semibold text-slate-800 leading-tight truncate">
            {sanitiseName(r().DisplayName)}
          </h2>

          {/* 注册日期 */}
          <p class="text-sm text-slate-500 mt-0.5">注册于 {regDate()}</p>

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

          {/* 战队 */}
          <Show when={r().GuildName}>
            <p class="text-sm text-slate-600 mt-1.5">
              <span class="text-slate-400 mr-1">战队</span>
              {r().GuildName}
              <Show when={r().GuildTier}>
                <span class="text-slate-400 text-xs ml-2">
                  {CLAN_TIERS[r().GuildTier!]} · Rank {r().GuildClass}
                </span>
              </Show>
            </p>
          </Show>
        </div>
      </div>
    </div>
  );
}
