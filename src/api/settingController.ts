// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/**
 * 获取网站设置
 */
export async function getSiteSettings(options?: { [key: string]: any }) {
  return request<API.BaseResponseSettingConfig>("/api/setting/site/get", {
    method: "GET",
    ...(options || {}),
  });
}

/**
 * 更新网站设置
 */
export async function updateSiteSettings(
  body: API.SettingConfig,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/setting/site/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
