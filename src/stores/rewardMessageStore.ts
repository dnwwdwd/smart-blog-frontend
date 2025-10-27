import { create } from "zustand";
import {
  listApprovedRewardMessages,
  getRewardMessagePage,
  reviewRewardMessage,
} from "@/api/rewardController";

interface RewardMessageState {
  messages: API.RewardMessageVo[];
  loading: boolean;
  error: string | null;
  fetchApproved: (limit?: number) => Promise<API.RewardMessageVo[]>;
  review: (
    id: number,
    payload: API.RewardMessageReviewRequest
  ) => Promise<boolean>;
  fetchPage: (
    payload: API.RewardMessageQueryRequest
  ) => Promise<API.PageRewardMessage | null>;
}

export const useRewardMessageStore = create<RewardMessageState>()((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  async fetchApproved(limit = 5) {
    set({ loading: true, error: null });
    try {
      const res = (await listApprovedRewardMessages({ limit })) as any;
      if (res?.code === 0 && Array.isArray(res.data)) {
        set({ messages: res.data, loading: false });
        return res.data;
      }
      const errorMsg = res?.message || "获取打赏留言失败";
      set({ error: errorMsg, loading: false });
      return [];
    } catch (error: any) {
      set({ error: error?.message || "获取打赏留言异常", loading: false });
      return [];
    }
  },
  async review(id, payload) {
    try {
      const res = (await reviewRewardMessage({ id }, payload)) as any;
      if (res?.code === 0) {
        await get().fetchApproved();
        return true;
      }
      set({ error: res?.message || "审核失败" });
      return false;
    } catch (error: any) {
      set({ error: error?.message || "审核异常" });
      return false;
    }
  },
  async fetchPage(payload) {
    try {
      const res = (await getRewardMessagePage(payload)) as any;
      if (res?.code === 0) {
        return res.data as API.PageRewardMessage;
      }
      set({ error: res?.message || "获取留言列表失败" });
      return null;
    } catch (error: any) {
      set({ error: error?.message || "获取留言列表异常" });
      return null;
    }
  },
}));

export const useRewardMessages = () => useRewardMessageStore((s) => s.messages);
export const useRewardMessageLoading = () =>
  useRewardMessageStore((s) => s.loading);
