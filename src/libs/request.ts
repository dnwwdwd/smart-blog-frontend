import axios from "axios";
import { message } from "antd";

const isServer = typeof window === "undefined";
const isProd = process.env.NODE_ENV === "production";

let clientBaseURL: string;
if (isProd) {
  clientBaseURL = "http://localhost:8888/api";
} else {
  clientBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
}

const serverTarget = (
  isProd
    ? "http://localhost:8888"
    : process.env.INTERNAL_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_TARGET ||
      "http://localhost:8888"
).replace(/\/$/, "");
const serverBaseURL = `${serverTarget}/api`;

const myAxios = axios.create({
  baseURL: isServer ? serverBaseURL : clientBaseURL,
  timeout: 10000,
  withCredentials: true,
});

myAxios.defaults.withCredentials = true;

// 登录/注册白名单（永不自动跳转）
const authWhitelist = ["/login", "/register"];

if (!isServer) {
  try {
    const t = window.localStorage.getItem("satoken");
    if (t) {
      (myAxios as any).defaults.headers.common = {
        ...(myAxios as any).defaults.headers.common,
        satoken: t,
      };
    }
  } catch {}
}

myAxios.interceptors.request.use(
  (config) => {
    // 为每次请求附加 satoken（仅客户端）
    if (!isServer) {
      try {
        const t = window.localStorage.getItem("satoken");
        if (t) {
          config.headers = config.headers || {};
          (config.headers as any)["satoken"] = t;
        }
      } catch {}
    }
    return config;
  },
  (error) => Promise.reject(error)
);

myAxios.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data && typeof data === "object" && "code" in data) {
      if (data.code !== 0) {
        if (isServer) {
          console.log("API Error:", (data as any).message);
        } else {
          try {
            const path = window.location.pathname;
            const shouldNotify = data.code === 40100 && path.includes("/admin");
            if (shouldNotify) {
              message.error((data as any).message || "未登录");
            }
          } catch (notifyError) {
            console.warn("Failed to resolve client route for auth notice", notifyError);
          }
        }
        // 仅在后台管理路径下遇到 401 才自动跳登录，前台页面（含 FrontNavigation）不强制登录
        if (data.code === 40100 && !isServer && typeof window !== "undefined") {
          const path = window.location.pathname;
          const isAdminPath = path.startsWith("/admin");
          if (isAdminPath && !authWhitelist.includes(path)) {
            window.location.href = "/login";
          }
        }
      }
    }
    return data;
  },
  (error) => Promise.reject(error)
);

export default myAxios;
