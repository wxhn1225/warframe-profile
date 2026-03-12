import { createResource, For, Show } from "solid-js";
import type { ProfileResult } from "../../types/profile";
import { loadExport, type ExportSyndicate, type ExportNightwave } from "../../lib/exportData";
import { t } from "../../lib/dict";
import { toTitleCase } from "../../lib/utils";
import { peColourToHex, peColourToRgb } from "../../lib/utils";

interface Props {
  result: ProfileResult;
  dict: Record<string, string>;
}

const SYNDICATE_TAGS = [
  "ArbitersSyndicate",
  "CephalonSudaSyndicate",
  "PerrinSyndicate",
  "NewLokaSyndicate",
  "RedVeilSyndicate",
  "SteelMeridianSyndicate",
  "CetusSyndicate",
  "QuillsSyndicate",
  "SolarisSyndicate",
  "VentKidsSyndicate",
  "VoxSyndicate",
  "ZarimanSyndicate",
  "EntratiSyndicate",
  "NecraloidSyndicate",
  "EntratiLabSyndicate",
  "HexSyndicate",
  "KahlSyndicate",
  "NIGHTWAVE",
  "LibrarySyndicate",
  "ConclaveSyndicate",
  "EventSyndicate",
];

export default function Syndicates(props: Props) {
  const [exports] = createResource(async () => {
    const [syndicates, nightwave] = await Promise.all([
      loadExport<Record<string, ExportSyndicate>>("ExportSyndicates"),
      loadExport<ExportNightwave>("ExportNightwave"),
    ]);
    const tags = SYNDICATE_TAGS.map((tag) =>
      tag === "NIGHTWAVE" ? nightwave.affiliationTag : tag
    );
    return { syndicates, tags };
  });

  return (
    <Show when={exports()} fallback={<p class="text-sm text-[#a89880]">加载中...</p>}>
      {(data) => (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <For each={data().tags}>
            {(tag) => {
              const syndicate = data().syndicates[tag];
              if (!syndicate) return null;
              const affiliation = props.result.Affiliations?.find(
                (a) => a.Tag === tag
              );
              const level = affiliation?.Title ?? 0;
              const standing = affiliation?.Standing ?? 0;
              const titleEntry = syndicate.titles?.find(
                (tt) => tt.level === level
              );
              const minStanding = level < 0
                ? (titleEntry?.maxStanding ?? 0)
                : (titleEntry?.minStanding ?? 0);

              const bgHex = peColourToHex(syndicate.backgroundColour);
              const [r, g, b] = peColourToRgb(syndicate.colour);
              const iconFilter = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="a"><feColorMatrix color-interpolation-filters="sRGB" in="SourceGraphic" type="matrix" values="${r / 255} 0 0 0 0 0 ${g / 255} 0 0 0 0 0 ${b / 255} 0 0 0 0 0 1 0"/></filter></svg>#a')`;

              return (
                <div class="flex rounded-lg border border-[#e0d0bc] overflow-hidden">
                  {/* 图标区 */}
                  <div
                    class="w-16 shrink-0 flex items-center justify-center p-2"
                    style={{ "background-color": bgHex }}
                  >
                    <img
                      src={`https://browse.wf${syndicate.icon}`}
                      class="w-10 h-10 object-contain"
                      style={{ filter: iconFilter }}
                      alt=""
                    />
                  </div>
                  {/* 信息区 */}
                  <div class="flex-1 px-3 py-2 min-w-0">
                    <p class="text-sm font-medium text-[#2a1f14] truncate">
                      {t(props.dict, syndicate.name)}
                    </p>
                    <p class="text-xs text-[#8a7060] mt-0.5">
                      等级 {level}
                      {titleEntry && (
                        <span> · {toTitleCase(t(props.dict, titleEntry.name))}</span>
                      )}
                    </p>
                    <p class="text-xs text-[#a89880] mt-0.5">
                      声望: {(standing - minStanding).toLocaleString()}
                      {minStanding !== 0 && (
                        <span>（累计 {standing.toLocaleString()}）</span>
                      )}
                    </p>
                    {(() => {
                      const dailyMap: Record<string, keyof typeof props.result> = {
                        ArbitersSyndicate: "DailyAffiliation",
                        ConclaveSyndicate: "DailyAffiliationPvp",
                        LibrarySyndicate: "DailyAffiliationLibrary",
                        CetusSyndicate: "DailyAffiliationCetus",
                        QuillsSyndicate: "DailyAffiliationQuills",
                        SolarisSyndicate: "DailyAffiliationSolaris",
                        VentKidsSyndicate: "DailyAffiliationVentkids",
                        VoxSyndicate: "DailyAffiliationVox",
                        EntratiSyndicate: "DailyAffiliationEntrati",
                        NecraloidSyndicate: "DailyAffiliationNecraloid",
                        ZarimanSyndicate: "DailyAffiliationZariman",
                        KahlSyndicate: "DailyAffiliationKahl",
                        EntratiLabSyndicate: "DailyAffiliationCavia",
                        HexSyndicate: "DailyAffiliationHex",
                      };
                      const key = dailyMap[tag];
                      const remaining = key ? (props.result[key] as number | undefined) : undefined;
                      if (remaining == null) return null;
                      return (
                        <p class="text-xs text-[#a89880] mt-0.5">
                          每日声望剩余: {remaining.toLocaleString()}
                        </p>
                      );
                    })()}
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      )}
    </Show>
  );
}
