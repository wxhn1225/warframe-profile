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
      <button
        onClick={props.onBack}
        class="mb-4 text-sm text-[#8a7060] hover:text-[#2a1f14] transition-colors flex items-center gap-1"
      >
        ← 返回查询
      </button>

      <ProfileHeader result={result()} dict={props.dict} />

      <div class="bg-[#fdf8f2] rounded-xl border border-[#e0d4c4] shadow-sm overflow-hidden">
        <div class="flex border-b border-[#e0d4c4] overflow-x-auto">
          {TABS.map((tab) => (
            <button
              onClick={() => setActiveTab(tab.id)}
              class={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab() === tab.id
                  ? "border-[#9b6030] text-[#2a1f14]"
                  : "border-transparent text-[#8a7060] hover:text-[#2a1f14]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div class="p-5">
          <Suspense
            fallback={
              <div class="py-10 text-center text-[#a09080] text-sm">加载中...</div>
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
              <Stats result={result()} stats={props.profile.Stats} dict={props.dict} />
            </Show>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
