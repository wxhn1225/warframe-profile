import { createResource, For, Show, createSignal } from "solid-js";
import type { ProfileResult } from "../../types/profile";
import { loadExport, type ExportRegion, type ExportFaction } from "../../lib/exportData";
import { t } from "../../lib/dict";
import { toTitleCase } from "../../lib/utils";

interface Props {
  result: ProfileResult;
  dict: Record<string, string>;
}

export default function Missions(props: Props) {
  const [search, setSearch] = createSignal("");

  const [exports] = createResource(async () => {
    const [regions, factions] = await Promise.all([
      loadExport<Record<string, ExportRegion>>("ExportRegions"),
      loadExport<Record<string, ExportFaction>>("ExportFactions"),
    ]);
    return { regions, factions };
  });

  const missions = () => {
    const raw = props.result.Missions ?? [];
    const data = exports();
    if (!data) return [];

    // 补全未完成的节点
    const completed = new Set(raw.map((m) => m.Tag));
    const all = [...raw];
    for (const tag of Object.keys(data.regions)) {
      if (tag !== "EventNode763" && !completed.has(tag)) {
        all.push({ Tag: tag, Completes: 0 });
      }
    }

    return all
      .map((m) => {
        const node = data.regions[m.Tag];
        return { ...m, node };
      })
      .filter(({ Tag, node, Completes }) => {
        if (node?.nodeType === 3 && Completes === 0) return false; // NT_HUB
        if (node?.nodeType === 6) return false; // NT_SHORTCUT
        return true;
      })
      .sort((a, b) => b.Completes - a.Completes);
  };

  const filtered = () => {
    const q = search().toLowerCase();
    if (!q) return missions();
    return missions().filter(({ Tag, node }) => {
      const name = node ? t(props.dict, node.name) : Tag;
      return name.toLowerCase().includes(q) || Tag.toLowerCase().includes(q);
    });
  };

  return (
    <Show when={exports()} fallback={<p class="text-sm text-slate-400">加载中...</p>}>
      {(data) => (
        <div>
          <input
            type="text"
            placeholder="搜索节点..."
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
            class="mb-3 w-full max-w-xs px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-400"
          />
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs text-slate-500 border-b border-slate-200">
                  <th class="pb-2 pr-4 font-medium">节点</th>
                  <th class="pb-2 pr-4 font-medium text-right">完成次数</th>
                  <th class="pb-2 pr-4 font-medium text-center">钢铁之路</th>
                  <th class="pb-2 font-medium">掌握度备注</th>
                </tr>
              </thead>
              <tbody>
                <For each={filtered()}>
                  {({ Tag, Completes, Tier, node }) => {
                    const nodeName = () => {
                      if (!node) return Tag;
                      let name = t(props.dict, node.name);
                      if (node.systemName && node.systemIndex !== 19) {
                        name += `, ${t(props.dict, node.systemName) || node.systemName}`;
                        if (node.missionType !== "MT_PVP") {
                          name += ` (${toTitleCase(t(props.dict, node.missionName ?? ""))}`;
                          if (node.faction && node.systemIndex !== 21) {
                            const faction = data().factions[node.faction];
                            if (faction) {
                              name += ` - ${toTitleCase(t(props.dict, faction.name))}`;
                            }
                          }
                          name += ")";
                        }
                      }
                      return name;
                    };

                    const masteryNote = () => {
                      if (!node?.masteryExp) return "";
                      if (Completes === 0)
                        return `缺少 ${node.masteryExp * 2} 掌握度`;
                      if (!Tier) return `缺少 ${node.masteryExp} 掌握度`;
                      return "";
                    };

                    return (
                      <tr class="border-b border-slate-100 hover:bg-slate-50">
                        <td class="py-1.5 pr-4 text-slate-700">{nodeName()}</td>
                        <td class="py-1.5 pr-4 text-right tabular-nums text-slate-600">
                          {Completes.toLocaleString()}
                        </td>
                        <td class="py-1.5 pr-4 text-center text-slate-500">
                          {Tier ? "✓" : ""}
                        </td>
                        <td class="py-1.5 text-xs text-amber-600">{masteryNote()}</td>
                      </tr>
                    );
                  }}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Show>
  );
}
