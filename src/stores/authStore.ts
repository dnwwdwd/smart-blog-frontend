import { create } from "zustand";
import { getLoginUser, userLogout } from "@/api/userController";
import { message } from "antd";

// 用户信息接口
export interface UserInfo {
  id: string | number;
  userAccount?: string;
  username?: string;
  userAvatar?: string;
  profile?: string;
  token?: string;
  userRole?: string;
  createTime?: string;
  updateTime?: string;
}

// 认证状态接口
interface AuthState {
  user: UserInfo | null;
  isLoggedIn: boolean;
  hasCheckedLogin: boolean;
  login: (userInfo: UserInfo) => void;
  logout: () => void;
  updateUser: (userInfo: Partial<UserInfo>) => void;
  checkLogin: (force?: boolean) => Promise<boolean>;
}

let pendingLoginCheck: Promise<boolean> | null = null;

// 创建zustand store
export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoggedIn: false,
  hasCheckedLogin: false,

  // 登录方法
  login: (userInfo: UserInfo) => {
    set({ user: userInfo, isLoggedIn: true });
  },

  // 登出方法
  logout: async () => {
    set({ user: null, isLoggedIn: false });
    const res = (await userLogout()) as any;
    if (res.code == 0) {
      message.success("退出成功");
    }
  },

  getUserInfo: async () => {
    return get().user;
  },

  // 更新用户信息
  updateUser: (userInfo: Partial<UserInfo>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userInfo };
      set({ user: updatedUser });
    }
  },

  // 从后端检查登录状态（会话）
  checkLogin: async (force = false) => {
    if (!force) {
      if (pendingLoginCheck) {
        return pendingLoginCheck;
      }
      if (get().hasCheckedLogin) {
        return get().isLoggedIn;
      }
    }

    pendingLoginCheck = (async () => {
      try {
        const res = (await getLoginUser()) as any;
        if (res?.code === 0 && res?.data) {
          const currentToken = get().user?.token;
          const nextUser: UserInfo = {
            ...(res.data as Record<string, unknown>),
          } as UserInfo;
          if (!nextUser.token && currentToken) {
            nextUser.token = currentToken;
          }
          set({ user: nextUser, isLoggedIn: true, hasCheckedLogin: true });
          return true;
        }
        set({ user: null, isLoggedIn: false, hasCheckedLogin: true });
        return false;
      } catch (e) {
        set({ user: null, isLoggedIn: false, hasCheckedLogin: true });
        return false;
      } finally {
        pendingLoginCheck = null;
      }
    })();

    return pendingLoginCheck;
  },
}));

// 便捷的hooks
export const useAuth = () => useAuthStore();
export const useIsLoggedIn = () => useAuthStore((state) => state.isLoggedIn);
export const useCurrentUser = () => useAuthStore((state) => state.user);
