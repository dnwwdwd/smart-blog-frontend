declare namespace API {
  type Article = {
    id?: number;
    title?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string;
    status?: number;
    readTime?: number;
    views?: number;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    publishedTime?: string;
    createTime?: string;
    updateTime?: string;
  };

  type ArticlePublishRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    title?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    tags?: string[];
    columnIds?: number[];
  };

  type ArticleRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    title?: string;
  };

  type ArticleVo = {
    id?: number;
    title?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string;
    status?: number;
    readTime?: number;
    views?: number;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    tags?: string[];
    comments?: Comment[];
    publishedTime?: string;
    createTime?: string;
    updateTime?: string;
  };

  type BaseResponseBoolean = {
    code?: number;
    data?: boolean;
    message?: string;
  };

  type BaseResponseColumnVo = {
    code?: number;
    data?: ColumnVo;
    message?: string;
  };

  type BaseResponseListColumn = {
    code?: number;
    data?: Column[];
    message?: string;
  };

  type BaseResponseListTag = {
    code?: number;
    data?: Tag[];
    message?: string;
  };

  type BaseResponseLoginUserVO = {
    code?: number;
    data?: LoginUserVO;
    message?: string;
  };

  type BaseResponsePageArticleVo = {
    code?: number;
    data?: PageArticleVo;
    message?: string;
  };

  type BaseResponseTagVo = {
    code?: number;
    data?: TagVo;
    message?: string;
  };

  type BaseResponseVoid = {
    code?: number;
    data?: Record<string, any>;
    message?: string;
  };

  type Column = {
    id?: number;
    name?: string;
    description?: string;
    cover?: string;
    categoryId?: number;
    createTime?: string;
    updateTime?: string;
  };

  type ColumnVo = {
    id?: number;
    name?: string;
    description?: string;
    cover?: string;
    categoryId?: number;
    createTime?: string;
    updateTime?: string;
    articles?: Article[];
    articleCount?: number;
  };

  type Comment = {
    id?: number;
    articleId?: number;
    parentId?: number;
    nickname?: string;
    userEmail?: string;
    userWebsite?: string;
    userAvatar?: string;
    content?: string;
    ipAddress?: Record<string, any>;
    userAgent?: string;
    createTime?: string;
    updateTime?: string;
  };

  type getParams = {
    columnId: number;
  };

  type getTagParams = {
    tagId: number;
  };

  type LoginUserVO = {
    id?: number;
    username?: string;
    userAvatar?: string;
    token?: string;
    userRole?: string;
    createTime?: string;
    updateTime?: string;
  };

  type OrderItem = {
    column?: string;
    asc?: boolean;
  };

  type PageArticleVo = {
    records?: ArticleVo[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageArticleVo;
    searchCount?: PageArticleVo;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type Tag = {
    id?: number;
    name?: string;
    description?: string;
    color?: string;
    createTime?: string;
    updateTime?: string;
  };

  type TagVo = {
    id?: number;
    name?: string;
    description?: string;
    color?: string;
    createTime?: string;
    updateTime?: string;
    articles?: Article[];
    articleCount?: number;
  };

  type UserLoginRequest = {
    userAccount: string;
    userPassword: string;
  };
}
