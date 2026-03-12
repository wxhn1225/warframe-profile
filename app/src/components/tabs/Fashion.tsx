import { createResource, createSignal, For, Show } from "solid-js";
import type { ProfileResult, LoadOutConfig, ColorSet } from "../../types/profile";
import { loadExport, type ExportFlavour } from "../../lib/exportData";
import { t } from "../../lib/dict";
import { parseRgbaInt, toHexString, peColourToRgb } from "../../lib/utils";

interface Props {
  result: ProfileResult;
  dict: Record<string, string>;
}

type Category = "Suits" | "LongGuns" | "Pistols" | "Melee";
const CATEGORIES: { key: Category; label: string; presetKey: "s" | "l" | "p" | "m" }[] = [
  { key: "Suits", label: "战甲", presetKey: "s" },
  { key: "LongGuns", label: "主要武器", presetKey: "l" },
  { key: "Pistols", label: "次要武器", presetKey: "p" },
  { key: "Melee", label: "近战武器", presetKey: "m" },
];

const COLOR_SLOTS = [
  { key: "t0" as const, label: "主要" },
  { key: "t1" as const, label: "次要" },
  { key: "t2" as const, label: "第三色彩" },
  { key: "t3" as const, label: "高亮色彩" },
  { key: "m0" as const, label: "放射色彩" },
  { key: "m1" as const, label: "次要放射色彩" },
  { key: "en" as const, label: "能量" },
  { key: "e1" as const, label: "次要能量" },
];

// 皮肤槽位索引含义
const SUIT_SKIN_SLOTS: Record<number, string> = {
  0: "头盔",
  7: "外观",
  5: "动作集",
  8: "胸甲",
  1: "左肩",
  9: "右肩",
  16: "残影",
  2: "左腿",
  10: "右腿",
  11: "辅助",
  25: "武器特效",
  3: "左徽",
  4: "右徽",
  12: "前徽",
  13: "后徽",
  6: "背饰",
};
const WEAPON_SKIN_SLOTS: Record<number, string> = { 0: "外观" };
const MELEE_SKIN_SLOTS: Record<number, string> = { 0: "外观", 2: "收刀方式" };

export default function Fashion(props: Props) {
  const [exports] = createResource(async () => {
    const [warframes, weapons, sentinels, customs, flavours] = await Promise.all([
      loadExport<Record<string, { name: string }>>("ExportWarframes"),
      loadExport<Record<string, { name: string }>>("ExportWeapons"),
      loadExport<Record<string, { name: string }>>("ExportSentinels"),
      loadExport<Record<string, { name: string; icon?: string }>>("ExportCustoms"),
      loadExport<Record<string, ExportFlavour>>("ExportFlavour"),
    ]);
    return { warframes, weapons, sentinels, customs, flavours };
  });

  const findPalette = (r: number, g: number, b: number): string => {
    const ex = exports();
    if (!ex) return "";
    for (const flavour of Object.values(ex.flavours)) {
      for (const colour of flavour.hexColours ?? []) {
        const [r2, g2, b2] = peColourToRgb(colour);
        if (r === r2 && g === g2 && b === b2)
          return t(props.dict, flavour.name);
      }
      for (const colour of flavour.legacyColours ?? []) {
        const [r2, g2, b2] = peColourToRgb(colour);
        if (r === r2 && g === g2 && b === b2)
          return t(props.dict, flavour.name) + " (旧)";
      }
    }
    return "";
  };

  return (
    <Show when={exports()} fallback={<p class="text-sm text-slate-400">加载中...</p>}>
      {(ex) => (
        <div class="space-y-6">
          <For each={CATEGORIES}>
            {({ key, label, presetKey }) => {
              const inventory = props.result.LoadOutInventory;
              const items = inventory?.[key];
              if (!items?.length && key !== "Suits") return null;

              const item = items?.[0];
              const presetSlot = props.result.LoadOutPreset?.[presetKey];
              const defaultConfig = presetSlot?.cus ?? 0;
              const [configIdx, setConfigIdx] = createSignal(defaultConfig);
              const config = () => item?.Configs?.[configIdx()] as LoadOutConfig | undefined;

              const itemName = () => {
                if (!item?.ItemType) return label;
                const nameKey =
                  ex().warframes[item.ItemType]?.name ??
                  ex().weapons[item.ItemType]?.name ??
                  ex().sentinels[item.ItemType]?.name;
                const base = nameKey ? (t(props.dict, nameKey) || nameKey) : item.ItemType.split("/").pop() ?? item.ItemType;
                if (item.ItemName && !item.ItemName.includes("|") && item.ItemName !== base)
                  return `${base} ("${item.ItemName}")`;
                return base;
              };

              const skinSlots = key === "Suits"
                ? SUIT_SKIN_SLOTS
                : key === "Melee"
                ? MELEE_SKIN_SLOTS
                : WEAPON_SKIN_SLOTS;

              const renderSkin = (idx: number, slotLabel: string) => {
                const skinPath = config()?.Skins?.[idx];
                if (!skinPath || skinPath === "" || skinPath.includes("EmptyCustomization"))
                  return null;
                const custom = ex().customs[skinPath];
                const name = custom
                  ? (t(props.dict, custom.name) || custom.name || skinPath)
                  : skinPath;
                return (
                  <div class="flex items-center gap-1.5 text-xs text-slate-600">
                    <span class="text-slate-400 w-14 shrink-0">{slotLabel}</span>
                    <span>{name}</span>
                  </div>
                );
              };

              const renderColorSection = (
                sectionKey: keyof LoadOutConfig,
                sectionLabel: string
              ) => {
                const colorSet = config()?.[sectionKey] as ColorSet | undefined;
                return (
                  <div>
                    <p class="text-xs font-medium text-slate-500 mb-1">{sectionLabel}</p>
                    <div class="grid grid-cols-2 gap-x-4 gap-y-0.5">
                      <For each={COLOR_SLOTS}>
                        {({ key: ck, label: cl }) => {
                          const raw = colorSet?.[ck];
                          if (raw === undefined) {
                            return (
                              <div class="flex items-center gap-1.5 text-xs text-slate-400 py-0.5">
                                <span class="w-12 shrink-0">{cl}</span>
                                <span class="w-4 h-4 rounded border border-slate-200 bg-slate-50 inline-block" />
                                <span>默认</span>
                              </div>
                            );
                          }
                          const [r, g, b] = parseRgbaInt(raw);
                          const hex = toHexString(r, g, b);
                          const palette = findPalette(r, g, b);
                          return (
                            <div class="flex items-center gap-1.5 text-xs text-slate-600 py-0.5">
                              <span class="w-12 shrink-0 text-slate-400">{cl}</span>
                              <span
                                class="w-4 h-4 rounded border border-slate-200 inline-block shrink-0"
                                style={{ "background-color": hex }}
                              />
                              <span class="font-mono text-slate-500">{hex}</span>
                              {palette && (
                                <span class="text-slate-400 truncate">{palette}</span>
                              )}
                            </div>
                          );
                        }}
                      </For>
                    </div>
                  </div>
                );
              };

              return (
                <div class="border border-slate-200 rounded-lg p-4">
                  {/* 标题行 */}
                  <div class="flex items-center gap-3 mb-3">
                    <h3 class="text-sm font-semibold text-slate-700">
                      {label}：{itemName()}
                    </h3>
                    <select
                      value={configIdx()}
                      onChange={(e) => setConfigIdx(+e.currentTarget.value)}
                      class="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-600 focus:outline-none"
                    >
                      <For each={item?.Configs ?? []}>
                        {(_, i) => (
                          <option value={i()}>
                            Config {String.fromCharCode(65 + i())}
                            {i() === defaultConfig ? " (当前)" : ""}
                          </option>
                        )}
                      </For>
                    </select>
                  </div>

                  {/* 皮肤 */}
                  <div class="mb-3 space-y-0.5">
                    <For each={Object.entries(skinSlots)}>
                      {([idx, slotLabel]) => renderSkin(+idx, slotLabel)}
                    </For>
                  </div>

                  {/* 颜色 */}
                  <div class="space-y-3">
                    {renderColorSection("pricol", "主体颜色")}
                    <Show when={key === "Suits" && config()?.Skins?.[6]}>
                      {renderColorSection("syancol", "背饰颜色")}
                    </Show>
                    <Show when={key === "Suits" && config()?.attcol}>
                      {renderColorSection("attcol", "附件颜色")}
                    </Show>
                    <Show when={key === "Melee" && config()?.attcol}>
                      {renderColorSection("attcol", "附件颜色")}
                    </Show>
                    <Show when={config()?.sigcol}>
                      {renderColorSection("sigcol", "徽章颜色")}
                    </Show>
                  </div>
                </div>
              );
            }}
          </For>

          <Show when={props.result.OperatorLoadOuts?.length}>
            <div class="border border-slate-200 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-slate-700 mb-3">指挥官外观</h3>
              <For each={props.result.OperatorLoadOuts ?? []}>
                {(op, i) => {
                  const OPERATOR_SLOTS: Record<number, string> = {
                    0: "头部",
                    1: "体型",
                    2: "发型",
                    3: "面部印记",
                    5: "头罩",
                    6: "传识套服",
                    7: "袖件",
                    8: "束腰",
                    9: "声音",
                    10: "站姿",
                    30: "妆容",
                  };
                  return (
                    <div class={i() > 0 ? "mt-3 pt-3 border-t border-slate-100" : ""}>
                      <p class="text-xs text-slate-400 mb-1.5">套装 {i() + 1}</p>
                      <div class="space-y-0.5">
                        <For each={Object.entries(OPERATOR_SLOTS)}>
                          {([idx, label]) => {
                            const skinPath = op.Skins?.[+idx];
                            if (!skinPath || skinPath === "") return null;
                            const custom = ex().customs[skinPath];
                            const name = custom
                              ? (t(props.dict, custom.name) || custom.name)
                              : skinPath.split("/").pop() ?? skinPath;
                            return (
                              <div class="flex items-center gap-1.5 text-xs text-slate-600">
                                <span class="text-slate-400 w-16 shrink-0">{label}</span>
                                <span>{name}</span>
                              </div>
                            );
                          }}
                        </For>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
        </div>
      )}
    </Show>
  );
}
