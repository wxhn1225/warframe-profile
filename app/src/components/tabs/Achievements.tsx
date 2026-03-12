import { createResource, For, Show } from "solid-js";
import type { ProfileResult } from "../../types/profile";
import { loadExport, type ExportAchievement } from "../../lib/exportData";
import { t } from "../../lib/dict";

interface Props {
  result: ProfileResult;
  dict: Record<string, string>;
}

export default function Achievements(props: Props) {
  const [exportAchievements] = createResource(() =>
    loadExport<Record<string, ExportAchievement>>("ExportAchievements")
  );

  const getProgress = (tag: string) =>
    props.result.ChallengeProgress?.find((c) => c.Name === tag)?.Progress ?? 0;

  return (
    <Show
      when={exportAchievements()}
      fallback={<p class="text-sm text-[#a89880]">加载中...</p>}
    >
      {(achievements) => {
        const entries = Object.entries(achievements()).filter(
          ([, a]) => a.icon || a.hidden
        );
        // 有图标的在前，隐藏成就在后
        entries.sort(([, a], [, b]) => (a.hidden ? 1 : 0) - (b.hidden ? 1 : 0));

        return (
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <For each={entries}>
              {([tag, achievement]) => {
                const progress = getProgress(tag);
                const required = achievement.requiredCount ?? 1;
                const pct = Math.min((progress / required) * 100, 100);
                const done = progress >= required;

                return (
                  <div class="flex gap-3 rounded-lg border border-[#e0d0bc] p-3">
                    {/* 图标 */}
                    <Show when={achievement.icon}>
                      <img
                        src={`https://browse.wf${achievement.icon}`}
                        class="w-12 h-12 object-contain shrink-0 rounded"
                        alt=""
                      />
                    </Show>

                    <div class="flex-1 min-w-0">
                      <p class={`text-sm font-medium truncate ${done ? "text-[#2a1f14]" : "text-[#8a7060]"}`}>
                        {t(props.dict, achievement.name) || tag}
                      </p>
                      <Show when={achievement.description}>
                        <p class="text-xs text-[#a89880] mt-0.5 line-clamp-2">
                          {t(props.dict, achievement.description!)}
                        </p>
                      </Show>
                      {/* 进度条 */}
                      <div class="mt-1.5 flex items-center gap-2">
                        <div class="flex-1 h-1.5 bg-[#fdf5ec] rounded-full overflow-hidden">
                          <div
                            class={`h-full rounded-full transition-all ${done ? "bg-green-500" : "bg-blue-400"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span class="text-xs tabular-nums text-[#a89880] shrink-0">
                          {progress.toLocaleString()}/{required.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        );
      }}
    </Show>
  );
}
