// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** 上传图片到后端，使用MultipartFile格式 POST /image/upload */
export async function uploadImage(body: FormData, options?: { [key: string]: any }) {
  return request<API.BaseResponseString>("/image/upload", {
    method: "POST",
    data: body,
    ...(options || {}),
  });
}
