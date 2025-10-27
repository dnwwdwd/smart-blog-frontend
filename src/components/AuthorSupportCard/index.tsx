"use client";

import React from "react";
import { Avatar, Card, Typography } from "antd";
import RewardModal from "@/components/RewardModal";
import { useSiteSettings } from "@/stores/siteSettingsStore";
import {
  useAuthorProfile,
  useAuthorProfileLoading,
  useFetchAuthorProfile,
} from "@/stores/authorProfileStore";

const { Title, Paragraph } = Typography;

const AuthorSupportCard: React.FC = () => {
  const settings = useSiteSettings();
  const authorProfile = useAuthorProfile();
  const authorLoading = useAuthorProfileLoading();
  const fetchAuthorProfile = useFetchAuthorProfile();

  React.useEffect(() => {
    if (!authorProfile) {
      fetchAuthorProfile();
    }
  }, [authorProfile, fetchAuthorProfile]);

  const authorName = authorProfile?.username || settings?.siteName || "站点作者";
  const authorAvatar =
    authorProfile?.userAvatar ||
    settings?.aboutImage ||
    "/assets/avatar.svg";
  const authorBio =
    authorProfile?.profile || settings?.siteDescription || "感谢阅读，欢迎交流。";

  return (
    <Card className="author-support-card" variant={false} style={{ textAlign: "center" }}>
      <Avatar src={authorAvatar} size={96} style={{ marginBottom: 16 }} />
      <Title level={4}>{authorLoading && !authorProfile ? "加载中..." : authorName}</Title>
      <Paragraph type="secondary" style={{ minHeight: 48 }}>
        {authorLoading && !authorProfile ? "即将展示作者信息" : authorBio}
      </Paragraph>
      <RewardModal />
    </Card>
  );
};

export default AuthorSupportCard;
