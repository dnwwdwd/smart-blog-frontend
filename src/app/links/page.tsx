"use client";
import React from "react";
import { Button, Card, Col, Empty, Row, Spin } from "antd";
import FriendLinkCard from "@/components/FriendLinkCard/page";
import { useFriendLinks, useInfiniteScroll } from "@/hooks/useFriendLinks";
import "./styles.css";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";

export default function FriendsPage() {
  const {
    friendLinks,
    loading,
    loadingMore,
    hasMore,
    searchKeyword,
    setSearchKeyword,
    loadMore,
    refresh,
    pagination,
  } = useFriendLinks(8);

  // 启用无限滚动
  useInfiniteScroll(loadMore, hasMore, loadingMore);

  // 搜索处理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  return (
    <div className="friends-page">
      <div className="links-container">
        {/* 页面头部 */}
        <div className="page-header">
          <Title level={1} className="page-title">
            友情链接
          </Title>
          <Paragraph className="page-description">
            这里是我的朋友们，感谢他们在技术路上的陪伴与分享。
            如果你也想加入我们，欢迎与我联系！
          </Paragraph>
        </div>

        {/* 搜索框区域 */}
        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="搜索友链...（支持搜索名称）"
              className="search-input"
              value={searchKeyword}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* 友链卡片网格 */}
        <div className="friends-grid">
          {loading && friendLinks.length === 0 ? (
            <div className="loading-section">
              <Spin size="large" />
              <p style={{ textAlign: "center", marginTop: 16 }}>加载中...</p>
            </div>
          ) : friendLinks.length === 0 ? (
            <Empty
              description={
                searchKeyword
                  ? `没有找到包含 "${searchKeyword}" 的友链`
                  : "暂无友链数据"
              }
              style={{ margin: "40px 0" }}
            />
          ) : (
            <>
              <Row gutter={[24, 24]}>
                {friendLinks.map((friend) => (
                  <Col
                    key={friend.id}
                    xs={24}
                    sm={12}
                    md={8}
                    lg={6}
                    className="friend-col"
                  >
                    <FriendLinkCard
                      id={friend.id || 0}
                      name={friend.name || ""}
                      description={friend.description || ""}
                      avatar={friend.avatar || ""}
                      url={friend.url || ""}
                      isSpecial={friend.isSpecial}
                      statusLabel={friend.statusLabel}
                      socialIcons={friend.socialIcons?.map((icon) => ({
                        type: icon.type as "qq" | "wechat" | "heart" | "star",
                        url: icon.url,
                      }))}
                    />
                  </Col>
                ))}
              </Row>

              {/* 加载更多指示器 */}
              {loadingMore && (
                <div className="load-more-section">
                  <Spin size="default" />
                  <p style={{ textAlign: "center", marginTop: 8 }}>
                    加载更多...
                  </p>
                </div>
              )}

              {/* 没有更多数据提示 */}
              {!hasMore && friendLinks.length > 0 && (
                <div className="no-more-section">
                  <p
                    style={{
                      textAlign: "center",
                      color: "#999",
                      margin: "20px 0",
                    }}
                  >
                    已经到底了哦~
                  </p>
                </div>
              )}

              {/* 手动加载更多按钮（备用） */}
              {hasMore && !loadingMore && (
                <div className="manual-load-more">
                  <Button
                    onClick={loadMore}
                    type="dashed"
                    block
                    style={{ margin: "20px 0" }}
                  >
                    点击加载更多
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 申请友链区域 */}
        <div className="apply-section">
          <Card className="apply-card">
            <Title level={3} className="apply-title">
              申请友链
            </Title>
            <Paragraph className="apply-description">
              如果你也有优质的技术博客或网站，欢迎与我交换友链！
            </Paragraph>
            <div className="apply-requirements">
              <h4>申请要求：</h4>
              <ul>
                <li>网站内容积极向上，无违法违规内容</li>
                <li>技术类博客或个人网站优先</li>
                <li>网站访问稳定，更新频率较高</li>
                <li>支持 HTTPS 访问</li>
              </ul>
            </div>
            <div className="contact-info">
              <p>
                <strong>联系方式：</strong>
              </p>
              <p>📧 邮箱：admin@example.com</p>
              <p>💬 QQ：123456789</p>
              <p>🐦 微博：@技术博主</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
