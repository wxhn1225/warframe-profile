import { createSignal, Show, lazy, Suspense } from "solid-js";
import type { ProfileData } from "../types/profile";
import ProfileHeader from "./ProfileHeader";

const Fashion = lazy(() => import("./tabs/Fashion"));
const Syndicates = lazy(() => import("./tabs/Syndicates"));
const Missions = lazy(() => import("./tabs/Missions"));
const Achievements = lazy(() => import("./tabs/Achievements"));
const Stats = lazy(() => import("./tabs/Stats"));

const TABS = [
  { id: "fashion", label: "配置" },
  { id: "syndicates", label: "集团" },
  { id: "missions", label: "任务" },
  { id: "achievements", label: "成就" },
  { id: "stats", label: "统计" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  profile: ProfileData;
  dict: Record<string, string>;
  onBack: () => void;
}

export default function ProfileView(props: Props) {
  const [activeTab, setActiveTab] = createSignal<TabId>("fashion");
  const result = () => props.profile.Results[0];

  return (
    <div>
      {/* 返回按钮 */}
      <button
        onClick={props.onBack}
        class="mb-4 text-sm text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
      >
        &larr; 返回查询
      </button>

      {/* 个人信息头部 */}
      <ProfileHeader result={result()} />

      {/* 标签页导航 */}
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="flex border-b border-slate-200 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              onClick={() => setActiveTab(tab.id)}
              class={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab() === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 标签页内容 */}
        <div class="p-5">
          <Suspense
            fallback={
              <div class="py-10 text-center text-slate-400 text-sm">
                加载中...
              </div>
            }
          >
            <Show when={activeTab() === "fashion"}>
              <Fashion result={result()} dict={props.dict} />
            </Show>
            <Show when={activeTab() === "syndicates"}>
              <Syndicates result={result()} dict={props.dict} />
            </Show>
            <Show when={activeTab() === "missions"}>
              <Missions result={result()} dict={props.dict} />
            </Show>
            <Show when={activeTab() === "achievements"}>
              <Achievements result={result()} dict={props.dict} />
            </Show>
            <Show when={activeTab() === "stats"}>
              <Stats result={result()} dict={props.dict} />
            </Show>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
