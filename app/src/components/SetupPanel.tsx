import { createSignal, Show } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

interface Props {
  platform: string;
  setPlatform: (p: string) => void;
  accountId: string;
  setAccountId: (id: string) => void;
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

  const handleAutoDetect = async () => {
    setLogLoading(true);
    setLogError(null);
    try {
      const content = await invoke<string>("auto_detect_log");
      const id = await invoke<string>("parse_account_id", { content });
      props.setAccountId(id);
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
    try {
      const content = await file.text();
      const id = await invoke<string>("parse_account_id", { content });
      props.setAccountId(id);
    } catch (e) {
      setLogError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div class="max-w-xl mx-auto mt-10">
      {/* 卡片 */}
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* 标题区 */}
        <div class="px-6 pt-6 pb-4 border-b border-slate-100">
          <h1 class="text-lg font-semibold text-slate-800">查询个人资料</h1>
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
              账号 ID
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

            <input
              type="text"
              value={props.accountId}
              onInput={(e) => props.setAccountId(e.currentTarget.value)}
              placeholder="输入或粘贴账号 ID (24位十六进制)"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 font-mono placeholder:text-slate-400"
            />
          </div>

          {/* 错误提示 */}
          <Show when={props.error}>
            <div class="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {props.error}
            </div>
          </Show>

          {/* 查询按钮 */}
          <button
            onClick={props.onFetch}
            disabled={props.loading || !props.accountId.trim()}
            class="w-full py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {props.loading ? "查询中..." : "查询资料"}
          </button>
        </div>
      </div>
    </div>
  );
}
