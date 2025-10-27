import React from "react";
import { Button, Input, List, Select } from "antd";

export interface SocialLinkItem {
  iconType: string;
  iconUrl: string;
}

interface SocialLinksEditorProps {
  value?: SocialLinkItem[];
  onChange?: (links: SocialLinkItem[]) => void;
}

const iconOptions = [
  { value: "github", label: "GitHub" },
  { value: "wechat", label: "微信" },
  { value: "qq", label: "QQ" },
  { value: "x", label: "X (Twitter)" },
  { value: "website", label: "网站" },
  { value: "email", label: "Email" },
];

const SocialLinksEditor: React.FC<SocialLinksEditorProps> = ({
  value,
  onChange,
}) => {
  const links = value || [];

  const triggerChange = (next: SocialLinkItem[]) => {
    onChange?.(next);
  };

  const handleAdd = () => {
    triggerChange([...links, { iconType: "github", iconUrl: "" }]);
  };

  const handleUpdate = (index: number, key: keyof SocialLinkItem, val: string) => {
    const next = [...links];
    next[index] = { ...next[index], [key]: val };
    triggerChange(next);
  };

  const handleRemove = (index: number) => {
    triggerChange(links.filter((_, i) => i !== index));
  };

  return (
    <div className="social-links-editor">
      <List
        dataSource={links}
        locale={{ emptyText: "暂无社交链接" }}
        renderItem={(link, index) => (
          <List.Item className="social-link-item">
            <div className="social-link-form">
              <Select
                value={link.iconType}
                onChange={(val) => handleUpdate(index, "iconType", val)}
                style={{ width: 140, marginRight: 8 }}
                options={iconOptions}
                placeholder="平台"
              />
              <Input
                value={link.iconUrl}
                onChange={(e) => handleUpdate(index, "iconUrl", e.target.value)}
                placeholder="请输入链接地址"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button danger onClick={() => handleRemove(index)}>
                删除
              </Button>
            </div>
          </List.Item>
        )}
      />
      <Button type="dashed" onClick={handleAdd} block style={{ marginTop: 8 }}>
        添加社交链接
      </Button>
    </div>
  );
};

export default SocialLinksEditor;
