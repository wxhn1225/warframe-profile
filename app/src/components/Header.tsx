import { Show, For } from "solid-js";
import type { LangInfo } from "../lib/dict";

interface Props {
  lang: string;
  setLang: (l: string) => void;
  availableLangs: LangInfo[];
  updateVersion: string | null;
  updateLoading: boolean;
  onUpdate: () => void;
}

export default function Header(props: Props) {
  return (
    <header class="bg-[#2a1f14] sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 shrink-0">
          <span class="font-semibold text-[#e8ddd0] text-sm tracking-wide">
            Warframe Profile
          </span>
          <span class="text-[#6b5a4a] text-xs">|</span>
          <span class="text-[#8a7060] text-xs">仅限国际服</span>
        </div>

        <div class="flex items-center gap-3">
          <Show when={props.updateVersion}>
            <button
              onClick={props.onUpdate}
              disabled={props.updateLoading}
              class="flex items-center gap-1.5 text-xs px-3 py-1 rounded bg-[#3d2e1e] text-[#d4b080] border border-[#5a4030] hover:bg-[#4a3824] transition-colors disabled:opacity-60"
            >
              <Show when={props.updateLoading} fallback={<span>↑ v{props.updateVersion} 有更新</span>}>
                <span>下载中...</span>
              </Show>
            </button>
          </Show>

          <Show when={props.availableLangs.length > 1}>
            <select
              value={props.lang}
              onChange={(e) => props.setLang(e.currentTarget.value)}
              class="text-xs border border-[#4a3824] rounded px-2 py-1 bg-[#3d2e1e] text-[#c8b8a0] focus:outline-none cursor-pointer"
            >
              <For each={props.availableLangs}>
                {(l) => <option value={l.code}>{l.native}</option>}
              </For>
            </select>
          </Show>
        </div>
      </div>
    </header>
  );
}
