import { useState, useCallback, useEffect } from "react";
import { message } from "antd";
import { getFriendLinkPage } from "@/api/friendLinkController";
import "@ant-design/v5-patch-for-react-19";

// 友情链接数据类型（基于后端API）
interface FriendLink {
  id: number;
  name: string;
  description: string;
  avatar: string;
  url: string;
  isSpecial?: boolean;
  statusLabel?: string;
  socialIcons?: {
    type: "qq" | "wechat" | "heart" | "star";
    url?: string;
  }[];
}

// 分页信息类型（基于后端API）
interface Pagination {
  current: number;
  pageSize: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

// Hook返回类型
interface UseFriendLinksReturn {
  friendLinks: FriendLink[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  pagination: Pagination | null;
}

// 自定义Hook：友情链接分页管理
export const useFriendLinks = (
  initialPageSize: number = 8
): UseFriendLinksReturn => {
  const [friendLinks, setFriendLinks] = useState<FriendLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);

  // 获取友情链接数据
  const fetchFriendLinks = useCallback(
    async (page: number = 1, search: string = "", append: boolean = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        // 构建请求参数
        const requestBody: API.FriendLinkRequest = {
          current: page,
          pageSize: initialPageSize,
          ...(search && { searchKeyword: search }),
        };

        const response = await getFriendLinkPage(requestBody) as any;

        if (response.code !== 0) {
          message.error(response.message || "获取友链数据失败");
          return;
        }

        const pageData = response.data;
        if (!pageData) {
          message.error("响应数据格式错误");
          return;
        }

        // 转换数据格式
        const friendLinksData =
          pageData.records?.map((item: any) => ({
            id: item.id || 0,
            name: item.name || "",
            description: item.description || "",
            avatar: item.avatar || "",
            url: item.url || "",
            isSpecial: item.isSpecial || false,
            statusLabel: item.statusLabel || "",
            socialIcons:
              item.socialLinks?.map((link: any) => ({
                type: (link.iconType as "qq" | "wechat" | "heart" | "star") || "heart",
                url: link.iconUrl,
              })) || [],
          })) || [];

        if (append) {
          // 追加数据（加载更多）
          setFriendLinks((prev) => [...prev, ...friendLinksData]);
        } else {
          // 替换数据（首次加载或搜索）
          setFriendLinks(friendLinksData);
        }

        // 设置分页信息
        const paginationInfo: Pagination = {
          current: pageData.current || 1,
          pageSize: pageData.size || initialPageSize,
          total: pageData.total || 0,
          pages: pageData.pages || 1,
          hasMore: (pageData.current || 1) < (pageData.pages || 1),
        };

        setPagination(paginationInfo);
        setCurrentPage(page);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "获取友情链接失败";
        message.error(errorMessage);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [initialPageSize]
  );

  // 加载更多
  const loadMore = useCallback(async () => {
    if (!pagination?.hasMore || loadingMore) {
      return;
    }

    const nextPage = currentPage + 1;
    await fetchFriendLinks(nextPage, searchKeyword, true);
  }, [
    pagination?.hasMore,
    loadingMore,
    currentPage,
    searchKeyword,
    fetchFriendLinks,
  ]);

  // 刷新数据
  const refresh = useCallback(async () => {
    setCurrentPage(1);
    await fetchFriendLinks(1, searchKeyword, false);
  }, [searchKeyword, fetchFriendLinks]);

  // 搜索处理
  const handleSearchChange = useCallback(
    (keyword: string) => {
      setSearchKeyword(keyword);
      setCurrentPage(1);
    },
    []
  );

  // 初始化加载
  useEffect(() => {
    fetchFriendLinks(1, "", false).then(() => {
      setIsInitialized(true);
    });
  }, [fetchFriendLinks]);

  // 搜索关键词变化时重新搜索
  useEffect(() => {
    if (!isInitialized) return;
    
    fetchFriendLinks(1, searchKeyword, false);
  }, [searchKeyword, fetchFriendLinks, isInitialized]);

  return {
    friendLinks,
    loading,
    loadingMore,
    hasMore: pagination?.hasMore || false,
    searchKeyword,
    setSearchKeyword,
    loadMore,
    refresh,
    pagination,
  };
};

// 无限滚动Hook
export const useInfiniteScroll = (
  loadMore: () => Promise<void>,
  hasMore: boolean,
  loading: boolean
) => {
  useEffect(() => {
    const handleScroll = () => {
      // 检查是否滚动到底部
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight =
        document.documentElement.clientHeight || window.innerHeight;

      // 距离底部100px时开始加载
      const threshold = 100;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;

      if (isNearBottom && hasMore && !loading) {
        loadMore();
      }
    };

    // 节流处理
    let timeoutId: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener("scroll", throttledHandleScroll);

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loadMore, hasMore, loading]);
};

export type { FriendLink, Pagination, UseFriendLinksReturn };
