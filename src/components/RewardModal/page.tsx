"use client";
import React, { useState } from "react";
import { Button, Modal, Tabs, QRCode, Form, Input, Space, Typography, message } from "antd";
import { HeartOutlined, WechatOutlined, AlipayOutlined, GiftOutlined } from "@ant-design/icons";
import "./styles.css";
import { useSiteSettings, useSiteSettingsLoading } from "@/stores/siteSettingsStore";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface RewardFormData {
  nickname: string;
  email: string;
  website?: string;
  message?: string;
}

const RewardModal: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("wechat");

  const settings = useSiteSettings();
  const loading = useSiteSettingsLoading();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFormResetKey((k) => k + 1);
    setActiveTab("wechat");
  };

  const handleSubmit = async (values: RewardFormData) => {
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("感谢您的打赏支持！");
      setIsModalVisible(false);
      setFormResetKey((k) => k + 1);
      setActiveTab("wechat");
    } catch (error) {
      message.error("提交失败，请重试。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button type="primary" icon={<HeartOutlined />} onClick={showModal} className="reward-button" size="large">
        打赏支持
      </Button>

      <Modal
        title={<Space><GiftOutlined />支持作者</Space>}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}
          items={[
            {
              key: "wechat",
              label: <Space><WechatOutlined style={{ color: "#07c160" }} />微信支付</Space>,
              children: (
                <div className="payment-tab">
                  <div className="qr-container">
                    {activeTab === "wechat" && (
                      <QRCode value={settings?.wechatPayQrUrl || "wxp://f2f0abcdefghijklmnopqrstuvwxyz123456789"} size={200} style={{ margin: "0 auto" }} />
                    )}
                  </div>
                  <div className="payment-tips">
                    <Text type="secondary">请使用微信扫描二维码进行打赏</Text>
                  </div>
                </div>
              ),
            },
            {
              key: "alipay",
              label: <Space><AlipayOutlined style={{ color: "#1677ff" }} />支付宝</Space>,
              children: (
                <div className="payment-tab">
                  <div className="qr-container">
                    {activeTab === "alipay" && (
                      <QRCode value={settings?.alipayQrUrl || "https://qr.alipay.com/fkx123456789abcdefghijklmnop"} size={200} style={{ margin: "0 auto" }} />
                    )}
                  </div>
                  <div className="payment-tips">
                    <Text type="secondary">请使用支付宝扫描二维码进行打赏</Text>
                  </div>
                </div>
              ),
            },
            {
              key: "message",
              label: <Space><GiftOutlined style={{ color: "#ff4d4f" }} />留言支持</Space>,
              children: (
                <div className="message-tab">
                  <Form key={formResetKey} layout="vertical" onFinish={handleSubmit} autoComplete="off">
                    <Form.Item name="nickname" label="昵称" rules={[{ required: true, message: "请输入您的昵称" }]}>
                      <Input placeholder="请输入您的昵称" />
                    </Form.Item>
                    <Form.Item name="email" label="邮箱" rules={[{ required: true, message: "请输入邮箱" }, { type: "email", message: "请输入有效的邮箱地址" }]}>
                      <Input placeholder="请输入您的邮箱" />
                    </Form.Item>
                    <Form.Item name="website" label="网站（可选）">
                      <Input placeholder="请输入您的网站" />
                    </Form.Item>
                    <Form.Item name="message" label="留言" rules={[{ required: true, message: "请输入留言内容" }]}>
                      <TextArea rows={4} placeholder="写下您的支持和鼓励..." showCount maxLength={200} />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={submitting} block size="large">
                        发送支持
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </>
  );
};

export default RewardModal;
