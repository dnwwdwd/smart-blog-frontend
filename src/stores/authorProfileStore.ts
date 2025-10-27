import { create } from "zustand";
import { getPublicAuthorProfile } from "@/api/userController";

interface AuthorProfileState {
  profile: API.PublicUserVO | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<API.PublicUserVO | null>;
  setProfile: (profile: Partial<API.PublicUserVO> | null) => void;
}

export const useAuthorProfileStore = create<AuthorProfileState>()((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    if (get().loading) {
      return get().profile;
    }
    set({ loading: true, error: null });
    try {
      const res = (await getPublicAuthorProfile()) as API.BaseResponsePublicUserVO;
      if (res?.code === 0) {
        const profile = (res.data ?? null) as API.PublicUserVO | null;
        set({ profile, loading: false });
        return profile;
      }
      set({ error: res?.message || "获取作者信息失败", loading: false });
      return null;
    } catch (e: any) {
      set({ error: e?.message || "获取作者信息异常", loading: false });
      return null;
    }
  },

  setProfile: (profile) => {
    if (profile === null) {
      set({ profile: null });
      return;
    }
    set({
      profile: { ...(get().profile || {}), ...profile },
    });
  },
}));

export const useAuthorProfile = () => useAuthorProfileStore((state) => state.profile);
export const useAuthorProfileLoading = () => useAuthorProfileStore((state) => state.loading);
export const useFetchAuthorProfile = () => useAuthorProfileStore((state) => state.fetchProfile);
