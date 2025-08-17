// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** 此处后端没有提供注释 POST /tag/add */
export async function addTag(
  body: API.TagDto,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseVoid>("/tag/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /tag/delete/${param0} */
export async function deleteTag(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteTagParams,
  options?: { [key: string]: any }
) {
  const { tagId: param0, ...queryParams } = params;
  return request<API.BaseResponseVoid>(`/tag/delete/${param0}`, {
    method: "POST",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /tag/get/vo/${param0} */
export async function getTag(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTagParams,
  options?: { [key: string]: any }
) {
  const { tagId: param0, ...queryParams } = params;
  return request<API.BaseResponseTagVo>(`/tag/get/vo/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /tag/page */
export async function getTagPage(
  body: API.TagRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageTagVo>("/tag/page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /tag/update */
export async function updateTag(
  body: API.TagDto,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseVoid>("/tag/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
