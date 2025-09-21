// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** 此处后端没有提供注释 POST /friend/link/add */
export async function addFriendLink(
  body: API.FriendLinkDto,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseVoid>("/friend/link/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 申请友链 POST /friend/link/apply */
export async function applyFriendLink(
  body: API.FriendLinkDto,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseVoid>("/friend/link/apply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /friend/link/delete/${param0} */
export async function deleteFriendLink(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteFriendLinkParams,
  options?: { [key: string]: any }
) {
  const { friendLinkId: param0, ...queryParams } = params;
  return request<API.BaseResponseVoid>(`/friend/link/delete/${param0}`, {
    method: "POST",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /friend/link/page */
export async function getFriendLinkPage(
  body: API.FriendLinkRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageFriendLinkVo>("/friend/link/page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /friend/link/update */
export async function updateFriendLink(
  body: API.FriendLinkDto,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseVoid>("/friend/link/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}