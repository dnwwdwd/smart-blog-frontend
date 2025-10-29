// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** 用户提交打赏留言 POST /reward/message */
export async function submitRewardMessage(
  body: API.RewardMessageCreateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/reward/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 管理端分页查询留言 POST /reward/message/page */
export async function getRewardMessagePage(
  body: API.RewardMessageQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageRewardMessage>("/reward/message/page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 审核打赏留言 POST /reward/message/review/${param0} */
export async function reviewRewardMessage(
  params: API.reviewRewardMessageParams,
  body: API.RewardMessageReviewRequest,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean>(`/reward/message/review/${param0}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 获取审核通过的打赏留言 GET /reward/message/approved */
export async function listApprovedRewardMessages(
  params: API.listApprovedRewardMessagesParams = {},
  options?: { [key: string]: any }
) {
  const { limit, ...queryParams } = params || {};
  return request<API.BaseResponseListRewardMessageVo>(
    "/reward/message/approved",
    {
      method: "GET",
      params: { limit, ...queryParams },
      ...(options || {}),
    }
  );
}

/** 获取打赏支付二维码配置 GET /reward/pay/config */
export async function getRewardPayConfig(options?: { [key: string]: any }) {
  return request<API.BaseResponseRewardPayConfigVo>("/reward/pay/config", {
    method: "GET",
    ...(options || {}),
  });
}
