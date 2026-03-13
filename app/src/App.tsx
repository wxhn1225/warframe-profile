import {
  createSignal,
  createResource,
  onMount,
  onCleanup,
  Show,
  type Accessor,
} from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import type { ProfileData } from "./types/profile";
import { loadDict, getAvailableLanguages, type LangInfo } from "./lib/dict";
import Header from "./components/Header";
import SetupPanel from "./components/SetupPanel";
import ProfileView from "./components/ProfileView";

export default function App() {
  const [lang, setLang] = createSignal("zh");
  const [platform, setPlatform] = createSignal("pc");
  const [accountId, setAccountId] = createSignal("");
  const [detectedName, setDetectedName] = createSignal("");
  const [profile, setProfile] = createSignal<ProfileData | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [fetchError, setFetchError] = createSignal<string | null>(null);
  const [availableLangs, setAvailableLangs] = createSignal<LangInfo[]>([]);
  const [updateVersion, setUpdateVersion] = createSignal<string | null>(null);
  const [updateLoading, setUpdateLoading] = createSignal(false);
  const [updateError, setUpdateError] = createSignal<string | null>(null);
  const [showBackTop, setShowBackTop] = createSignal(false);

  const [dict] = createResource(lang, (code) => loadDict(code));

  onMount(async () => {
    const langs = await getAvailableLanguages();
    setAvailableLangs(langs);

    const onScroll = () => setShowBackTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    onCleanup(() => window.removeEventListener("scroll", onScroll));

    // 静默检测更新
    try {
      console.log("[updater] checking for updates...");
      const update = await check();
      console.log("[updater] check result:", update);
      if (update?.available) {
        console.log("[updater] update available:", update.version);
        setUpdateVersion(update.version);
      } else {
        console.log("[updater] no update available (current is latest)");
      }
    } catch (e) {
      console.error("[updater] check failed:", e);
    }
  });

  const handleUpdate = async () => {
    setUpdateLoading(true);
    setUpdateError(null);
    try {
      const update = await check();
      if (update?.available) {
        await update.downloadAndInstall();
        await relaunch();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Update failed:", msg);
      setUpdateError(msg);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleFetch = async () => {
    const id = accountId().trim();
    if (!id) {
      setFetchError("请输入账号 ID");
      return;
    }
    setLoading(true);
    setFetchError(null);
    try {
      const raw = await invoke<string>("fetch_profile", {
        accountId: id,
        platform: platform(),
      });
      const data = JSON.parse(raw) as ProfileData;
      if (!data.Results?.[0]?.DisplayName) {
        throw new Error("未找到账号数据，请检查账号 ID 是否正确");
      }
      setProfile(data);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const currentDict: Accessor<Record<string, string>> = () => dict() ?? {};

  return (
    <div class="min-h-screen bg-[#f2ebe2]">
      <Header
        lang={lang()}
        setLang={setLang}
        availableLangs={availableLangs()}
        updateVersion={updateVersion()}
        updateLoading={updateLoading()}
        updateError={updateError()}
        onUpdate={handleUpdate}
      />
      <main class="max-w-6xl mx-auto px-4 py-6">
        <Show
          when={profile()}
          fallback={
            <SetupPanel
              platform={platform()}
              setPlatform={setPlatform}
              accountId={accountId()}
              setAccountId={setAccountId}
              detectedName={detectedName()}
              setDetectedName={setDetectedName}
              onFetch={handleFetch}
              loading={loading()}
              error={fetchError()}
            />
          }
        >
          {(p) => (
            <ProfileView
              profile={p()}
              dict={currentDict()}
              onBack={() => {
                setProfile(null);
                setFetchError(null);
                setDetectedName("");
                setAccountId("");
              }}
            />
          )}
        </Show>
      </main>

      {/* 回到顶部按钮 */}
      <Show when={showBackTop()}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          class="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-[#2a1f14] text-[#e8ddd0] shadow-lg flex items-center justify-center hover:bg-[#4a3525] transition-colors"
          title="回到顶部"
        >
          ↑
        </button>
      </Show>
    </div>
  );
}
