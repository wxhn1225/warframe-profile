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

  const applyParsed = (result: ParsedLogin) => {
    props.setAccountId(result.account_id);
    props.setDetectedName(result.display_name);
  };

  const handleAutoDetect = async () => {
    setLogLoading(true);
    setLogError(null);
    props.setDetectedName("");
    props.setAccountId("");
    try {
      const content = await invoke<string>("auto_detect_log");
      const result = await invoke<ParsedLogin>("parse_account_id", { content });
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
    // 先清除上一次的检测结果
    props.setDetectedName("");
    props.setAccountId("");
    try {
      const content = await file.text();
      const result = await invoke<ParsedLogin>("parse_account_id", { content });
      applyParsed(result);
    } catch (e) {
      setLogError(e instanceof Error ? e.message : String(e));
    }
    // 重置 input value，允许再次选择同一文件
    (e.currentTarget as HTMLInputElement).value = "";
  };

  return (
    <div class="max-w-xl mx-auto mt-10">
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 pt-6 pb-4 border-b border-slate-100">
          <h1 class="text-lg font-semibold text-slate-800">查询个人档案</h1>
          <p class="text-sm text-slate-500 mt-1">
            此工具仅适用于 Warframe 国际服账号
          </p>
        </div>

        <div class="px-6 py-5 space-y-5">
          {/* 平台选择 */}
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              平台
            </label>
            <div class="flex gap-2 flex-wrap">
              {PLATFORMS.map((p) => (
                <button
                  onClick={() => props.setPlatform(p.id)}
                  class={`px-4 py-1.5 rounded-md text-sm border transition-colors ${
                    props.platform === p.id
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* EE.log 区域 */}
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              账号
              <span class="ml-1.5 font-normal text-slate-400">
                — 从 EE.log 自动提取
              </span>
            </label>
            <div class="flex gap-2 mb-2">
              <button
                onClick={handleAutoDetect}
                disabled={logLoading()}
                class="px-3 py-1.5 text-sm rounded-md border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600 transition-colors disabled:opacity-60"
              >
                {logLoading() ? "读取中..." : "自动检测"}
              </button>
              <label class="px-3 py-1.5 text-sm rounded-md border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600 transition-colors cursor-pointer">
                选择文件
                <input
                  type="file"
                  accept=".log"
                  class="hidden"
                  onChange={handleFileUpload}
                />
              </label>
              <span class="text-xs text-slate-400 self-center">
                %LOCALAPPDATA%\Warframe\EE.log
              </span>
            </div>

            <Show when={logError()}>
              <p class="text-xs text-red-500 mb-2">{logError()}</p>
            </Show>

            {/* 检测到昵称时显示昵称，否则显示 ID 输入框 */}
            <Show
              when={props.detectedName}
              fallback={
                <input
                  type="text"
                  value={props.accountId}
                  onInput={(e) => props.setAccountId(e.currentTarget.value)}
                  placeholder="输入或粘贴账号 ID（24位十六进制）"
                  class="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 font-mono placeholder:text-slate-400"
                />
              }
            >
              <div class="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
                <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-sm font-medium text-slate-800">{props.detectedName}</span>
                <button
                  onClick={() => { props.setDetectedName(""); props.setAccountId(""); }}
                  class="ml-auto text-xs text-slate-400 hover:text-slate-600"
                >
                  清除
                </button>
              </div>
            </Show>
          </div>

          {/* 错误提示 */}
          <Show when={props.error}>
            <div class="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {props.error}
            </div>
          </Show>

          <button
            onClick={props.onFetch}
            disabled={props.loading || !props.accountId.trim()}
            class="w-full py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {props.loading ? "查询中..." : "查询个人档案"}
          </button>
        </div>
      </div>
    </div>
  );
}
