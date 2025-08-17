// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** 此处后端没有提供注释 POST /column/add */
export async function addColumn(
  body: API.ColumnDto,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseVoid>("/column/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /column/delete/${param0} */
export async function deleteColumn(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteColumnParams,
  options?: { [key: string]: any }
) {
  const { columnId: param0, ...queryParams } = params;
  return request<API.BaseResponseVoid>(`/column/delete/${param0}`, {
    method: "POST",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /column/get/${param0} */
export async function getColumnById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getColumnByIdParams,
  options?: { [key: string]: any }
) {
  const { columnId: param0, ...queryParams } = params;
  return request<API.BaseResponseColumnVo>(`/column/get/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /column/page */
export async function getColumnPage(
  body: API.ColumnRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageColumnVo>("/column/page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /column/update */
export async function updateColumn(
  body: API.ColumnDto,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseVoid>("/column/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
