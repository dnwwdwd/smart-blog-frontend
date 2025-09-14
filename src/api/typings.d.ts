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

  type ArticleDto = {
    id?: number;
    title: string;
    content: string;
    excerpt?: string;
    coverImage: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
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

  type BaseResponseListChatConversation = {
    code?: number;
    data?: ChatConversation[];
    message?: string;
  };

  type BaseResponseListChatMessage = {
    code?: number;
    data?: ChatMessage[];
    message?: string;
  };

  type BaseResponseListCommentVo = {
    code?: number;
    data?: CommentVo[];
    message?: string;
  };

  // 新增：后端返回 Long 列表
  type BaseResponseListLong = {
    code?: number;
    data?: number[];
    message?: string;
  };

  // 新增：后端返回 Map<Long, Integer>（TS 表示为 Record<number, number>）
  type BaseResponseMapLongInteger = {
    code?: number;
    data?: Record<number, number>;
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

  type batchUploadParams = {
    files: string[];
  };

  type ChatConversation = {
    id?: number;
    name?: string;
    createBy?: number;
    createTime?: string;
    updateTime?: string;
  };

  type ChatMessage = {
    id?: number;
    conversationId?: number;
    role?: string;
    metadata?: string;
    content?: string;
    createTime?: string;
    updateTime?: string;
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
    articleId: number;
    nickname: string;
    email: string;
    content: string;
    website?: string;
    parentId?: number;
    avatar?: string;
  };

  type CommentVo = {
    id?: number;
    author?: string;
    email?: string;
    website?: string;
    content?: string;
    avatar?: string;
    createTime?: string;
  };

  type completionParams = {
    message: string;
    conversationId: number;
  };

  type deleteChatConversationParams = {
    conversationId: number;
  };

  type deleteColumnParams = {
    columnId: number;
  };

  type deleteCommentParams = {
    id: number;
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

  type getChatHistoryParams = {
    conversationId: number;
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

  type image2Params = {
    input: string;
  };

  type image3Params = {
    input: string;
  };

  type image4Params = {
    input: string;
  };

  type image5Params = {
    input: string;
  };

  type imageParams = {
    input: string;
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
