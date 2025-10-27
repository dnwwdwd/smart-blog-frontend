"use client";
import React, { useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Input,
  message,
  Row,
  Spin,
} from "antd";
import Image from "next/image";
import { SearchOutlined } from "@ant-design/icons";
import FriendLinkCard from "@/components/FriendLinkCard/page";
import { useFriendLinks, useInfiniteScroll } from "@/hooks/useFriendLinks";
import "./styles.css";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import FriendLinkApplyModal from "@/components/FriendLinkApplyModal";

export default function FriendsPage() {
  const {
    friendLinks,
    loading,
    loadingMore,
    hasMore,
    searchKeyword,
    setSearchKeyword,
    loadMore,
  } = useFriendLinks(8);

  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [checkedRequirements, setCheckedRequirements] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ]);

  // 启用无限滚动
  useInfiniteScroll(loadMore, hasMore, loadingMore);

  // 搜索处理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  // 处理复选框变化
  const handleRequirementChange = (index: number, checked: boolean) => {
    const newChecked = [...checkedRequirements];
    newChecked[index] = checked;
    setCheckedRequirements(newChecked);
  };

  // 检查所有要求是否都已勾选
  const allRequirementsChecked = checkedRequirements.every(Boolean);

  // 显示申请友链弹窗
  const showApplyModal = () => {
    if (!allRequirementsChecked) {
      message.warning("请先勾选所有申请要求");
      return;
    }
    setApplyModalVisible(true);
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
          <Input
            placeholder="搜索友链...（支持搜索名称）"
            value={searchKeyword}
            onChange={handleSearchChange}
            prefix={<SearchOutlined />}
            size="large"
            className="search-input-antd"
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
          <Card className="apply-card-modern">
            <div className="apply-card-header">
              <Image
                src={"/assets/apply_link.svg"}
                alt="申请友链图标"
                width={24}
                height={24}
              />
              <Title level={3} className="apply-title-modern">
                申请友链
              </Title>
            </div>

            <Paragraph className="apply-description-modern">
              如果你也有优质的技术博客或网站，欢迎与我交换友链！
              让我们一起分享知识，共同成长。
            </Paragraph>

            <div className="apply-requirements-modern">
              <div className="requirements-header">
                <h4>申请要求</h4>
                <span className="requirements-count">
                  {checkedRequirements.filter(Boolean).length}/5
                </span>
              </div>

              <div className="requirement-list">
                <div className="requirement-item-modern">
                  <Checkbox
                    checked={checkedRequirements[0]}
                    onChange={(e) =>
                      handleRequirementChange(0, e.target.checked)
                    }
                  >
                    <span className="requirement-text">
                      网站内容积极向上，无违法违规内容
                    </span>
                  </Checkbox>
                </div>
                <div className="requirement-item-modern">
                  <Checkbox
                    checked={checkedRequirements[1]}
                    onChange={(e) =>
                      handleRequirementChange(1, e.target.checked)
                    }
                  >
                    <span className="requirement-text">
                      技术类博客或个人网站优先
                    </span>
                  </Checkbox>
                </div>
                <div className="requirement-item-modern">
                  <Checkbox
                    checked={checkedRequirements[2]}
                    onChange={(e) =>
                      handleRequirementChange(2, e.target.checked)
                    }
                  >
                    <span className="requirement-text">
                      网站访问稳定，更新频率较高
                    </span>
                  </Checkbox>
                </div>
                <div className="requirement-item-modern">
                  <Checkbox
                    checked={checkedRequirements[3]}
                    onChange={(e) =>
                      handleRequirementChange(3, e.target.checked)
                    }
                  >
                    <span className="requirement-text">支持 HTTPS 访问</span>
                  </Checkbox>
                </div>
                <div className="requirement-item-modern">
                  <Checkbox
                    checked={checkedRequirements[4]}
                    onChange={(e) =>
                      handleRequirementChange(4, e.target.checked)
                    }
                  >
                    <span className="requirement-text">
                      我已添加站主的博客作为我的友情链接
                    </span>
                  </Checkbox>
                </div>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              onClick={showApplyModal}
              disabled={!allRequirementsChecked}
              className="apply-button-modern"
              block
            >
              {allRequirementsChecked ? "立即申请" : "请先勾选所有要求"}
            </Button>

            <div className="apply-note">
              <span>申请提交后需等待审核，审核通过后会显示在友链列表中</span>
            </div>
          </Card>
        </div>
      </div>

      {/* 申请友链弹窗 */}
      <FriendLinkApplyModal
        open={applyModalVisible}
        onClose={() => setApplyModalVisible(false)}
        onSuccess={() => setCheckedRequirements([false, false, false, false, false])}
      />
    </div>
  );
}
