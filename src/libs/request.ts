import axios from "axios";
import { message } from "antd";

const isServer = typeof window === "undefined";
const isProd = process.env.NODE_ENV === "production";

let clientBaseURL: string;
if (isProd) {
  clientBaseURL = "http://blogbackend.hejiajun.icu/api";
} else {
  clientBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
}

const serverTarget = (
  isProd
    ? "http://blogbackend.hejiajun.icu"
    : (process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_TARGET || "http://localhost:8888")
).replace(/\/$/, "");
const serverBaseURL = `${serverTarget}/api`;

const myAxios = axios.create({
  baseURL: isServer ? serverBaseURL : clientBaseURL,
  timeout: 10000,
  withCredentials: true,
});

const authWhitelist = ["/login", "/register"];

myAxios.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

myAxios.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data && typeof data === "object" && "code" in data) {
      if (data.code !== 0) {
        if (!isServer) {
          message.error((data as any).message);
        } else {
          console.log("API Error:", (data as any).message);
        }
        if (
          data.code === 40100 &&
          !isServer &&
          !authWhitelist.includes(window.location.pathname)
        ) {
          window.location.href = "/login";
        }
      }
    }
    return data;
  },
  (error) => Promise.reject(error)
);

export default myAxios;
