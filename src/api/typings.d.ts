declare namespace API {
  type Article = {
    id?: string;
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
    title: string;
    content: string;
    excerpt?: string;
    coverImage: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string[];
    tags: string[];
    columnIds: number[];
    status: number;
  };

  type ArticleRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    title?: string;
  };

  type ArticleVo = {
    id?: string;
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
    comments?: CommentVo[];
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

  type BaseResponseListCommentVo = {
    code?: number;
    data?: CommentVo[];
    message?: string;
  };

  type BaseResponseLoginUserVO = {
    code?: number;
    data?: LoginUserVO;
    message?: string;
  };

  type BaseResponseLong = {
    code?: number;
    data?: number;
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

  type BaseResponseString = {
    code?: number;
    data?: string;
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

  type CommentDto = {
    articleId: string;
    nickname: string;
    email: string;
    content: string;
    website?: string;
    parentId?: string;
    avatar?: string;
  };

  type CommentVo = {
    id?: string;
    author?: string;
    email?: string;
    website?: string;
    content?: string;
    createTime?: Date;
    avatar?: string;
    replies?: CommentVo[];
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

  type deleteCommentParams = {
    commentId: string;
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
    articleId: string;
  };

  type getColumnByIdParams = {
    columnId: number;
  };

  type getCommentParams = {
    articleId: string;
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
