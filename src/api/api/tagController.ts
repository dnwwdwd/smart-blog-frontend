// @ts-ignore
/* eslint-disable */
import request from "@/libs/libs";

/** 此处后端没有提供注释 GET /tag/get/${param0} */
export async function getTag(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTagParams,
  options?: { [key: string]: any }
) {
  const { tagId: param0, ...queryParams } = params;
  return request<API.BaseResponseTagVo>(`/tag/get/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /tag/list */
export async function getTags(options?: { [key: string]: any }) {
  return request<API.BaseResponseListTag>("/tag/list", {
    method: "GET",
    ...(options || {}),
  });
}
