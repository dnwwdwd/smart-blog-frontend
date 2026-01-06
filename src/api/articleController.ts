// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** 此处后端没有提供注释 POST /article/batch/upload */
export async function batchUpload(
  files: File[],
  options?: { [key: string]: any }
) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  return request<API.BaseResponseUploadBatchResponse>("/article/batch/upload", {
    method: "POST",
    data: formData,
    ...(options || {}),
  });
}

/** 轮询上传状态 GET /article/upload/status?ids=1&ids=2 */
export async function getUploadStatuses(
  ids: number[],
  options?: { [key: string]: any }
) {
  const params = new URLSearchParams();
  ids.forEach(id => params.append('ids', String(id)));
  return request<API.BaseResponseMapLongInteger>(`/article/upload/status?${params.toString()}` , {
    method: "GET",
    ...(options || {}),
  });
}

/** 重试上传 POST /article/upload/retry/{id} */
export async function retryUpload(
  id: number,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseVoid>(`/article/upload/retry/${id}`, {
    method: "POST",
    ...(options || {}),
  });
}

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
  params: Omit<API.getArticleVoByIdParams, 'articleId'> & { articleId: string | number },
  options?: { [key: string]: any }
) {
  const { articleId: param0, ...queryParams } = params;
  return request<API.BaseResponseArticleVo>(`/article/get/vo/${encodeURIComponent(String(param0))}`, {
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
  return request<API.BaseResponsePageArticleVo>("/article/list/all", {
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
  body: API.ArticleDto,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/article/publish", {
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

/** 此处后端没有提供注释 POST /article/update */
export async function updateArticle(
  body: API.ArticleDto,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseVoid>("/article/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

// 新增：删除文章接口，兼容后端按路径参数或请求体两种风格
export async function deleteArticle(
    id: number,
    options?: Record<string, any>
) {
  return request<API.BaseResponseVoid>(`/article/delete/${id}`, {
    method: 'POST',
    ...(options || {}),
  });
}

/** 推荐文章 GET /article/recommend/${param0} */
export async function getRecommendArticles(
  params: API.getRecommendArticlesParams,
  options?: { [key: string]: any }
) {
  const { articleId, limit } = params;
  const query = typeof limit !== "undefined" ? `?limit=${limit}` : "";
  return request<API.BaseResponseListArticleVo>(`/article/recommend/${articleId}${query}`, {
    method: "GET",
    ...(options || {}),
  });
}
