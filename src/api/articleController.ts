// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** 此处后端没有提供注释 POST /article/column/get/vo/${param0} */
export async function getArticlePageByColumnId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getArticlePageByColumnIdParams,
  body: API.ArticleRequest,
  options?: { [key: string]: any }
) {
  const { columnId: param0, ...queryParams } = params;
  return request<API.BaseResponsePageArticleVo>(
    `/article/column/get/vo/${param0}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 GET /article/get/vo/${param0} */
export async function getArticleVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getArticleVoByIdParams,
  options?: { [key: string]: any }
) {
  const { articleId: param0, ...queryParams } = params;
  return request<API.BaseResponseArticleVo>(`/article/get/vo/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /article/list/all */
export async function getAllArticles(
  body: API.ArticleRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageArticle>("/article/list/all", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

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

/** 此处后端没有提供注释 POST /article/tag/get/vo/${param0} */
export async function getArticlePageByTagId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getArticlePageByTagIdParams,
  body: API.ArticleRequest,
  options?: { [key: string]: any }
) {
  const { tagId: param0, ...queryParams } = params;
  return request<API.BaseResponsePageArticleVo>(
    `/article/tag/get/vo/${param0}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    }
  );
}
