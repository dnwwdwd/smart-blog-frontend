import { create } from "zustand";
import { getSiteSettings, updateSiteSettings } from "@/api/settingController";

interface SiteSettingsState {
  settings: API.SettingConfig | null;
  loading: boolean;
  error: string | null;
  // actions
  fetchSiteSettings: () => Promise<API.SettingConfig | null>;
  saveSiteSettings: (data: API.SettingConfig) => Promise<boolean>;
  setSettings: (data: Partial<API.SettingConfig> | null) => void;
}

export const useSiteSettingsStore = create<SiteSettingsState>()((set, get) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSiteSettings: async () => {
    if (get().loading) return get().settings;
    set({ loading: true, error: null });
    try {
      const res = (await getSiteSettings()) as any;
      if (res?.code === 0 && res?.data) {
        set({ settings: res.data as API.SettingConfig, loading: false });
        return res.data as API.SettingConfig;
      }
      set({ error: res?.message || "获取站点设置失败", loading: false });
      return null;
    } catch (e: any) {
      set({ error: e?.message || "获取站点设置异常", loading: false });
      return null;
    }
  },

  saveSiteSettings: async (data: API.SettingConfig) => {
    try {
      const res = (await updateSiteSettings(data)) as any;
      if (res?.code === 0) {
        set({ settings: { ...(get().settings || {} as any), ...data } as API.SettingConfig });
        return true;
      }
      set({ error: res?.message || "保存站点设置失败" });
      return false;
    } catch (e: any) {
      set({ error: e?.message || "保存站点设置异常" });
      return false;
    }
  },

  setSettings: (data) => {
    if (data === null) {
      set({ settings: null });
    } else {
      set({ settings: { ...(get().settings || {} as any), ...data } as API.SettingConfig });
    }
  },
}));

// 便捷 hooks
export const useSiteSettings = () => useSiteSettingsStore((s) => s.settings);
export const useSiteSettingsLoading = () => useSiteSettingsStore((s) => s.loading);
export const useFetchSiteSettings = () => useSiteSettingsStore((s) => s.fetchSiteSettings);
export const useSaveSiteSettings = () => useSiteSettingsStore((s) => s.saveSiteSettings);
export interface SiteSettings {
  aiChatShortcut?: string;
}