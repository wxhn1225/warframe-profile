import { createSignal, Show } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

interface ParsedLogin {
  account_id: string;
  display_name: string;
}

interface Props {
  platform: string;
  setPlatform: (p: string) => void;
  accountId: string;
  setAccountId: (id: string) => void;
  detectedName: string;
  setDetectedName: (name: string) => void;
  onFetch: () => void;
  onClearError: () => void;
  loading: boolean;
  error: string | null;
}

const PLATFORMS = [
  { id: "pc", label: "PC" },
  { id: "ps4", label: "PlayStation" },
  { id: "xb1", label: "Xbox" },
  { id: "swi", label: "Switch" },
  { id: "mob", label: "Mobile" },
] as const;

export default function SetupPanel(props: Props) {
  const [logError, setLogError] = createSignal<string | null>(null);
  const [logLoading, setLogLoading] = createSignal(false);
  const [showGuofu, setShowGuofu] = createSignal(false);

  const applyParsed = (result: ParsedLogin) => {
    props.setAccountId(result.account_id);
    props.setDetectedName(result.display_name);
  };

  const handleAutoDetect = async () => {
    setLogLoading(true);
    setLogError(null);
    props.onClearError();
    props.setDetectedName("");
    props.setAccountId("");
    try {
      const result = await invoke<ParsedLogin>("auto_detect_log");
      applyParsed(result);
    } catch (e) {
      setLogError(e instanceof Error ? e.message : String(e));
    } finally {
      setLogLoading(false);
    }
  };

  const handleFileUpload = async (e: Event) => {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    setLogError(null);
    props.onClearError();
    props.setDetectedName("");
    props.setAccountId("");
    try {
      const slice = file.slice(0, 2 * 1024 * 1024);
      const content = await slice.text();
      const result = await invoke<ParsedLogin>("parse_account_id", { content });
      applyParsed(result);
    } catch (e) {
      setLogError(e instanceof Error ? e.message : String(e));
    }
    (e.currentTarget as HTMLInputElement).value = "";
  };

  return (
    <div class="max-w-md mx-auto mt-12">
      <div class="bg-[#fdf8f2] rounded-xl border border-[#e0d4c4] shadow-sm overflow-hidden">
        <div class="px-6 pt-6 pb-4 border-b border-[#ede4d8]">
          <h1 class="text-lg font-semibold text-[#2a1f14]">查询个人档案</h1>
          <p class="text-sm text-[#8a7060] mt-1">
            此工具仅适用于 Warframe 国际服账号
          </p>
        </div>

        <div class="px-6 py-5 space-y-5">
          {/* 平台选择 */}
          <div>
            <label class="block text-sm font-medium text-[#4a3824] mb-2">平台</label>
            <div class="flex gap-2 flex-wrap">
              {PLATFORMS.map((p) => (
                <button
                  onClick={() => props.setPlatform(p.id)}
                  class={`px-4 py-1.5 rounded text-sm border transition-colors ${
                    props.platform === p.id
                      ? "bg-[#2a1f14] text-[#f0e8dc] border-[#2a1f14]"
                      : "bg-transparent text-[#5a4632] border-[#d4c4b0] hover:border-[#9b7050] hover:text-[#2a1f14]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* EE.log */}
          <div>
            <label class="block text-sm font-medium text-[#4a3824] mb-2">
              账号
              <span class="ml-1.5 font-normal text-[#9a8474]">— 从 EE.log 提取</span>
            </label>
            <div class="flex gap-2 mb-2">
              <button
                onClick={handleAutoDetect}
                disabled={logLoading()}
                class="px-3 py-1.5 text-sm rounded border border-[#d4c4b0] bg-transparent text-[#5a4632] hover:border-[#9b7050] hover:text-[#2a1f14] transition-colors disabled:opacity-50"
              >
                {logLoading() ? "读取中..." : "自动检测"}
              </button>
              <label class="px-3 py-1.5 text-sm rounded border border-[#d4c4b0] bg-transparent text-[#5a4632] hover:border-[#9b7050] hover:text-[#2a1f14] transition-colors cursor-pointer">
                选择文件
                <input type="file" accept=".log" class="hidden" onChange={handleFileUpload} />
              </label>
              <span class="text-xs text-[#a09080] self-center">%LOCALAPPDATA%\Warframe\EE.log</span>
            </div>

            <Show when={logError()}>
              <p class="text-xs text-[#b05030] mb-2">{logError()}</p>
            </Show>

            <Show
              when={props.detectedName}
              fallback={
                <input
                  type="text"
                  value={props.accountId}
                  onInput={(e) => props.setAccountId(e.currentTarget.value)}
                  placeholder="输入账号 ID（24位十六进制）"
                  class="w-full px-3 py-2 text-sm border border-[#d4c4b0] rounded bg-[#fdf8f2] text-[#2a1f14] focus:outline-none focus:border-[#9b7050] font-mono placeholder:text-[#b8a898]"
                />
              }
            >
              <div class="flex items-center gap-2 px-3 py-2 bg-[#f5f0e8] border border-[#d4c8a8] rounded">
                <svg class="w-4 h-4 text-[#7a9050] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-sm font-medium text-[#2a1f14]">{props.detectedName}</span>
                <button
                  onClick={() => { props.setDetectedName(""); props.setAccountId(""); }}
                  class="ml-auto text-xs text-[#9a8474] hover:text-[#4a3824]"
                >
                  清除
                </button>
              </div>
            </Show>
          </div>

          <Show when={props.error}>
            <div class="text-sm text-[#b05030] bg-[#fdf0e8] border border-[#e8c8b0] rounded px-3 py-2">
              {props.error}
            </div>
          </Show>

          <button
            onClick={props.onFetch}
            disabled={props.loading || !props.accountId.trim()}
            class="w-full py-2.5 rounded text-sm font-medium bg-[#2a1f14] text-[#f0e8dc] hover:bg-[#3d2e1e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {props.loading ? "查询中..." : "查询个人档案"}
          </button>

          {/* 国服入口 */}
          <p class="text-center">
            <button
              onClick={() => setShowGuofu(true)}
              class="text-xs text-[#b0a090] hover:text-[#7a6050] transition-colors underline-offset-2 hover:underline"
            >
              国服玩家查询入口
            </button>
          </p>
        </div>
      </div>

      {/* 国服二维码弹窗 */}
      <Show when={showGuofu()}>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowGuofu(false)}
        >
          <div
            class="bg-[#fdf8f2] rounded-xl p-6 shadow-xl max-w-xs w-full mx-4 flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <p class="text-sm font-medium text-[#2a1f14]">国服个人档案查询</p>
            <p class="text-xs text-[#8a7060] text-center">扫描二维码前往国服个人档案查询页面</p>
            <img src="/guofu.webp" alt="国服查询二维码" class="w-48 h-48 object-contain rounded" />
            <button
              onClick={() => setShowGuofu(false)}
              class="text-xs text-[#8a7060] hover:text-[#2a1f14] transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
}
