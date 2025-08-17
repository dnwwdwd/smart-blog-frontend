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
    columns?: Column[];
    publishedTime?: string;
    createTime?: string;
    updateTime?: string;
  };

  type BaseResponseArticleVo = {
    code?: number;
    data?: ArticleVo;
    message?: string;
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

  type BaseResponseListComment = {
    code?: number;
    data?: Comment[];
    message?: string;
  };

  type BaseResponseLoginUserVO = {
    code?: number;
    data?: LoginUserVO;
    message?: string;
  };

  type BaseResponsePageArticle = {
    code?: number;
    data?: PageArticle;
    message?: string;
  };

  type BaseResponsePageArticleVo = {
    code?: number;
    data?: PageArticleVo;
    message?: string;
  };

  type BaseResponsePageColumnVo = {
    code?: number;
    data?: PageColumnVo;
    message?: string;
  };

  type BaseResponsePageFriendLinkVo = {
    code?: number;
    data?: PageFriendLinkVo;
    message?: string;
  };

  type BaseResponsePageTagVo = {
    code?: number;
    data?: PageTagVo;
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
    coverImage?: string;
    createTime?: string;
    updateTime?: string;
  };

  type ColumnDto = {
    id?: number;
    name: string;
    description: string;
    coverImage: string;
  };

  type ColumnRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    columnName?: string;
  };

  type ColumnVo = {
    id?: number;
    name?: string;
    description?: string;
    coverImage?: string;
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

  type CommentSubmitDto = {
    articleId: number;
    parentId?: number;
    nickname: string;
    userEmail: string;
    content: string;
    userWebsite?: string;
  };

  type deleteColumnParams = {
    columnId: number;
  };

  type deleteFriendLinkParams = {
    friendLinkId: number;
  };

  type deleteTagParams = {
    tagId: number;
  };

  type FriendLinkDto = {
    id?: number;
    name: string;
    description: string;
    avatar: string;
    url: string;
    socialLinks: SocialLinkAddDto[];
    sortOrder?: number;
    status?: number;
  };

  type FriendLinkRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    id?: number;
    name?: string;
    description?: string;
    avatar?: string;
    url?: string;
    isSpecial?: boolean;
    statusLabel?: string;
    sortOrder?: number;
    searchKeyword?: string;
  };

  type FriendLinkVo = {
    id?: number;
    name?: string;
    description?: string;
    avatar?: string;
    url?: string;
    isSpecial?: boolean;
    statusLabel?: string;
    sortOrder?: number;
    status?: number;
    createdTime?: string;
    updatedTime?: string;
    socialLinks?: SocialLink[];
  };

  type getArticlePageByColumnIdParams = {
    columnId: number;
  };

  type getArticlePageByTagIdParams = {
    tagId: number;
  };

  type getArticleVoByIdParams = {
    articleId: number;
  };

  type getColumnByIdParams = {
    columnId: number;
  };

  type getCommentParams = {
    articleId: number;
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

  type PageArticle = {
    records?: Article[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageArticle;
    searchCount?: PageArticle;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
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

  type PageColumnVo = {
    records?: ColumnVo[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageColumnVo;
    searchCount?: PageColumnVo;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PageFriendLinkVo = {
    records?: FriendLinkVo[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageFriendLinkVo;
    searchCount?: PageFriendLinkVo;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PageTagVo = {
    records?: TagVo[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageTagVo;
    searchCount?: PageTagVo;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type SocialLink = {
    id?: number;
    friendLinkId?: number;
    iconType?: string;
    iconUrl?: string;
    sortOrder?: number;
    createdTime?: string;
    updatedTime?: string;
  };

  type SocialLinkAddDto = {
    id?: number;
    friendLinkId?: number;
    iconType: string;
    iconUrl: string;
    sortOrder?: number;
  };

  type TagDto = {
    id?: number;
    name: string;
    description: string;
    color: string;
  };

  type TagRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    tagName?: string;
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

  type UserRegisterRequest = {
    userAccount: string;
    userPassword: string;
    checkPassword: string;
  };
}
