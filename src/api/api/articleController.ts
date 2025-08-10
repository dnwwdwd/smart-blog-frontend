// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** 此处后端没有提供注释 POST /article/page */
export async function getArticlePage(
  body: API.ArticleRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageArticleVo>("/article/page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /article/publish */
export async function publishArticle(
  body: API.ArticlePublishRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseVoid>("/article/publish", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
