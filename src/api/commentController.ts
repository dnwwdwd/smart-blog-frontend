// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** 此处后端没有提供注释 GET /comment/get/${param0} */
export async function getComment(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getCommentParams,
  options?: { [key: string]: any }
) {
  const { articleId: param0, ...queryParams } = params;
  return request<API.BaseResponseListCommentVo>(`/comment/get/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /comment/submit */
export async function submitComment(
  body: API.CommentDto,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseVoid>("/comment/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /comment/delete/${param0} */
export async function deleteComment(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteCommentParams,
  options?: { [key: string]: any }
) {
  const { commentId: param0, ...queryParams } = params;
  return request<API.BaseResponseVoid>(`/comment/delete/${param0}`, {
    method: "POST",
    params: { ...queryParams },
    ...(options || {}),
  });
}
