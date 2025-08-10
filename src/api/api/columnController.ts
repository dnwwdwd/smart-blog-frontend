// @ts-ignore
/* eslint-disable */
import request from "@/libs/libs";

/** 此处后端没有提供注释 GET /column/get/${param0} */
export async function get(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getParams,
  options?: { [key: string]: any }
) {
  const { columnId: param0, ...queryParams } = params;
  return request<API.BaseResponseColumnVo>(`/column/get/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /column/list */
export async function list(options?: { [key: string]: any }) {
  return request<API.BaseResponseListColumn>("/column/list", {
    method: "GET",
    ...(options || {}),
  });
}
