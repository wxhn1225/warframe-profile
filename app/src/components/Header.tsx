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
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        {/* Logo + 标题 */}
        <div class="flex items-center gap-2 shrink-0">
          <span class="font-semibold text-slate-800 text-sm tracking-wide">
            Warframe Profile
          </span>
          <span class="text-slate-300 text-xs">|</span>
          <span class="text-slate-400 text-xs">仅限国际服</span>
        </div>

        {/* 右侧操作区 */}
        <div class="flex items-center gap-3">
          {/* 更新提示 */}
          <Show when={props.updateVersion}>
            <button
              onClick={props.onUpdate}
              disabled={props.updateLoading}
              class="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-60"
            >
              <Show when={props.updateLoading} fallback={<span>v{props.updateVersion} 有更新</span>}>
                <span>下载中...</span>
              </Show>
            </button>
          </Show>

          {/* 语言选择器 */}
          <Show when={props.availableLangs.length > 1}>
            <select
              value={props.lang}
              onChange={(e) => props.setLang(e.currentTarget.value)}
              class="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none focus:border-blue-400 cursor-pointer"
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
