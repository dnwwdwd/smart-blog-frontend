// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** 此处后端没有提供注释 GET /image/generate */
export async function image(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.imageParams,
  options?: { [key: string]: any }
) {
  return request<string>("/image/generate", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /image/generate */
export async function image3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.image3Params,
  options?: { [key: string]: any }
) {
  return request<string>("/image/generate", {
    method: "PUT",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /image/generate */
export async function image2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.image2Params,
  options?: { [key: string]: any }
) {
  return request<string>("/image/generate", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /image/generate */
export async function image5(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.image5Params,
  options?: { [key: string]: any }
) {
  return request<string>("/image/generate", {
    method: "DELETE",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /image/generate */
export async function image4(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.image4Params,
  options?: { [key: string]: any }
) {
  return request<string>("/image/generate", {
    method: "PATCH",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /image/upload */
export async function uploadImage(
  body: FormData | { file: File },
  options?: { [key: string]: any }
) {
  const data =
    body instanceof FormData
      ? body
      : (() => {
          const formData = new FormData();
          if (body?.file) {
            formData.append("file", body.file);
          }
          return formData;
        })();
  return request<API.BaseResponseString>("/image/upload", {
    method: "POST",
    data,
    ...(options || {}),
  });
}
