// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** 聊天 POST /chat/completion */
export async function completion(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.completionParams,
  options?: { [key: string]: any }
) {
  return request<string[]>("/chat/completion", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新增聊天会话 POST /chat/conversation/add */
export async function addChatConversation(options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>("/chat/conversation/add", {
    method: "POST",
    ...(options || {}),
  });
}

/** 删除聊天会话 POST /chat/conversation/delete/${param0} */
export async function deleteChatConversation(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteChatConversationParams,
  options?: { [key: string]: any }
) {
  const { conversationId: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean>(
    `/chat/conversation/delete/${param0}`,
    {
      method: "POST",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 获取聊天会话列表 GET /chat/conversation/list */
export async function getChatConversationList(options?: {
  [key: string]: any;
}) {
  return request<API.BaseResponseListChatConversation>(
    "/chat/conversation/list",
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

/** 更新聊天会话 POST /chat/conversation/update */
export async function updateChatConversation(
  body: API.ChatConversation,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/chat/conversation/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取聊天历史 GET /chat/history/${param0} */
export async function getChatHistory(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getChatHistoryParams,
  options?: { [key: string]: any }
) {
  const { conversationId: param0, ...queryParams } = params;
  return request<API.BaseResponseListChatMessage>(`/chat/history/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}
