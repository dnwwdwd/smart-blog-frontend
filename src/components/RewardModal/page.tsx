"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  Spin,
  Tabs,
  Typography,
} from "antd";
import {
  AlipayOutlined,
  GiftOutlined,
  HeartOutlined,
  WechatOutlined,
} from "@ant-design/icons";
import "./styles.css";
import { useSiteSettings } from "@/stores/siteSettingsStore";
import {
  getRewardPayConfig,
  submitRewardMessage,
} from "@/api/rewardController";
import { useRewardMessageStore } from "@/stores/rewardMessageStore";

const { Text } = Typography;
const { TextArea } = Input;

interface RewardFormData {
  nickname: string;
  email: string;
  website?: string;
  message?: string;
  amount: number;
}

const RewardModal: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("wechat");
  const [loadingPayConfig, setLoadingPayConfig] = useState(false);
  const [payConfig, setPayConfig] = useState<API.RewardPayConfigVo>({});
  const [form] = Form.useForm<RewardFormData>();
  const fetchApprovedMessages = useRewardMessageStore(
    (state) => state.fetchApproved
  );

  const settings = useSiteSettings();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setActiveTab("wechat");
    form.resetFields();
  };

  useEffect(() => {
    if (!isModalVisible) {
      return;
    }
    let mounted = true;
    const loadConfig = async () => {
      setLoadingPayConfig(true);
      try {
        const res: any = await getRewardPayConfig();
        if (res?.code === 0 && mounted) {
          setPayConfig(res?.data || {});
        } else if (res?.code !== 0) {
          message.error(res?.message || "获取打赏配置失败");
        }
      } catch {
        message.error("获取打赏配置失败，请稍后再试。");
      } finally {
        if (mounted) {
          setLoadingPayConfig(false);
        }
      }
    };
    loadConfig();
    return () => {
      mounted = false;
    };
  }, [isModalVisible]);

  const wechatPayQrValue =
    payConfig?.wechatPayQrUrl || settings?.wechatPayQrUrl || "";
  const alipayQrValue = payConfig?.alipayQrUrl || settings?.alipayQrUrl || "";
  const hasWechatQr = Boolean(wechatPayQrValue);
  const hasAlipayQr = Boolean(alipayQrValue);

  const handleSubmit = async (values: RewardFormData) => {
    setSubmitting(true);
    try {
      const res: any = await submitRewardMessage(values);
      if (res?.code !== 0) {
        message.error(res?.message || "提交失败，请稍后重试");
        return;
      }
      message.success("感谢您的打赏支持！留言将待审核后展示。");
      await fetchApprovedMessages();
      setIsModalVisible(false);
      setActiveTab("wechat");
      form.resetFields();
    } catch {
      message.error("提交失败，请重试。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<HeartOutlined />}
        onClick={showModal}
        className="reward-button"
        size="large"
      >
        打赏支持
      </Button>

      <Modal
        title={
          <Space>
            <GiftOutlined />
            支持作者
          </Space>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnHidden
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "wechat",
              label: (
                <Space>
                  <WechatOutlined style={{ color: "#07c160" }} />
                  微信支付
                </Space>
              ),
              children: (
                <div className="payment-tab">
                  <div className="qr-container">
                    {loadingPayConfig ? (
                      <Spin />
                    ) : hasWechatQr ? (
                      <Image
                        alt="微信收款码"
                        src={wechatPayQrValue}
                        height={400}
                      />
                    ) : (
                      <Empty
                        description="暂无微信收款码"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
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
              label: (
                <Space>
                  <AlipayOutlined style={{ color: "#1677ff" }} />
                  支付宝
                </Space>
              ),
              children: (
                <div className="payment-tab">
                  <div className="qr-container">
                    {loadingPayConfig ? (
                      <Spin />
                    ) : hasAlipayQr ? (
                      <Image
                        alt="支付宝收款码"
                        src={alipayQrValue}
                        height={400}
                      />
                    ) : (
                      <Empty
                        description="暂无支付宝收款码"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
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
              label: (
                <Space>
                  <GiftOutlined style={{ color: "#ff4d4f" }} />
                  留言支持
                </Space>
              ),
              children: (
                <div className="message-tab">
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                  >
                    <Form.Item
                      name="nickname"
                      label="昵称"
                      rules={[{ required: true, message: "请输入您的昵称" }]}
                    >
                      <Input placeholder="请输入您的昵称" />
                    </Form.Item>
                    <Form.Item
                      name="email"
                      label="邮箱"
                      rules={[
                        { required: true, message: "请输入邮箱" },
                        {
                          type: "email",
                          message: "请输入有效的邮箱地址",
                        },
                      ]}
                    >
                      <Input placeholder="请输入您的邮箱" />
                    </Form.Item>
                    <Form.Item name="website" label="网站（可选）">
                      <Input placeholder="请输入您的网站" />
                    </Form.Item>
                    <Form.Item
                      name="amount"
                      label="打赏金额"
                      rules={[
                        { required: true, message: "请输入打赏金额" },
                        { type: "number", min: 0.01, message: "金额需大于0" },
                      ]}
                    >
                      <InputNumber
                        min={0.01}
                        precision={2}
                        prefix="¥"
                        placeholder="请输入金额"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="message"
                      label="留言"
                      rules={[{ required: true, message: "请输入留言内容" }]}
                    >
                      <TextArea
                        rows={4}
                        placeholder="写下您的支持和鼓励..."
                        showCount
                        maxLength={200}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                        block
                        size="large"
                      >
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
