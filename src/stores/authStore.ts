import { create } from "zustand";
import { getLoginUser, userLogout } from "@/api/userController";
import { message } from "antd";

// 用户信息接口
export interface UserInfo {
  id: string;
  username: string;
  userAvatar: string;
  token: string;
  userRole: string;
  createTime: string;
  updateTime: string;
}

// 认证状态接口
interface AuthState {
  user: UserInfo | null;
  isLoggedIn: boolean;
  login: (userInfo: UserInfo) => void;
  logout: () => void;
  updateUser: (userInfo: Partial<UserInfo>) => void;
  checkLogin: () => Promise<boolean>;
}

// 创建zustand store
export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoggedIn: false,

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
  checkLogin: async () => {
    try {
      const res = (await getLoginUser()) as any;
      console.log("check login" + JSON.stringify(res));
      if (res?.code === 0 && res?.data) {
        set({ user: res.data as UserInfo, isLoggedIn: true });
        return true;
      }
      set({ user: null, isLoggedIn: false });
      return false;
    } catch (e) {
      set({ user: null, isLoggedIn: false });
      return false;
    }
  },
}));

// 便捷的hooks
export const useAuth = () => useAuthStore();
export const useIsLoggedIn = () => useAuthStore((state) => state.isLoggedIn);
export const useCurrentUser = () => useAuthStore((state) => state.user);
