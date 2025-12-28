"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Row,
  Space,
  Typography,
  Upload,
} from "antd";
import type { UploadProps } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { uploadImage } from "@/api/imageController";
import { updateCurrentUserProfile } from "@/api/userController";
import { useCurrentUser, useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import "./styles.css";

const { Title, Paragraph, Text } = Typography;

interface ProfileFormValues {
  username?: string;
  userAvatar?: string;
  profile?: string;
}

interface SecurityFormValues {
  userAccount?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

const AccountSettingsPage: React.FC = () => {
  const currentUser = useCurrentUser();
  const updateUser = useAuthStore((state) => state.updateUser);
  const [profileForm] = Form.useForm<ProfileFormValues>();
  const [securityForm] = Form.useForm<SecurityFormValues>();
  const router = useRouter();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const watchedAvatar = Form.useWatch("userAvatar", profileForm);
  const avatarPreview =
    watchedAvatar || currentUser?.userAvatar || "/assets/avatar.svg";

  const avatarUploadProps = useMemo<UploadProps>(() => {
    return {
      showUploadList: false,
      accept: "image/*",
      customRequest: async (options) => {
        const { file, onError, onSuccess } = options;
        setAvatarUploading(true);
        const formData = new FormData();
        formData.append("file", file as File);
        try {
          const res: any = await uploadImage(formData);
          if (res?.code === 0) {
            onSuccess?.(res, file);
            const url = res.data;
            if (url) {
              profileForm.setFieldsValue({ userAvatar: url });
              message.info("头像上传成功，请点击“保存资料”后生效");
            }
          } else {
            const errMsg = res?.message || "上传失败";
            onError?.(new Error(errMsg));
            message.error(errMsg);
          }
        } catch (error: any) {
          onError?.(error);
          message.error(error?.message || "上传失败，请重试");
        } finally {
          setAvatarUploading(false);
        }
      },
    };
  }, [profileForm]);

  useEffect(() => {
    profileForm.setFieldsValue({
      username: currentUser?.username ?? "",
      userAvatar: currentUser?.userAvatar ?? "",
      profile: currentUser?.profile ?? "",
    });
    securityForm.setFieldsValue({
      userAccount: currentUser?.userAccount ?? "",
    });
    securityForm.resetFields(["currentPassword", "newPassword", "confirmNewPassword"]);
  }, [currentUser, profileForm, securityForm]);

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    const payload: API.UserUpdateRequest = {
      username: values.username?.trim(),
      userAvatar: values.userAvatar?.trim(),
      profile: values.profile ?? "",
    };
    try {
      const res = (await updateCurrentUserProfile(payload)) as API.BaseResponseUserUpdateResponse;
      if (res?.code === 0) {
        message.success("资料更新成功");
        updateUser({
          username: values.username,
          userAvatar: values.userAvatar,
          profile: values.profile,
        });
      } else {
        message.error(res?.message || "资料更新失败");
      }
    } catch (error: any) {
      message.error(error?.message || "资料更新异常");
    }
  };

  const handleSecuritySubmit = async (values: SecurityFormValues) => {
    const payload: API.UserUpdateRequest = {
      userAccount:
        values.userAccount && values.userAccount !== currentUser?.userAccount
          ? values.userAccount
          : undefined,
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    };
    if (!payload.userAccount && !payload.newPassword) {
      message.info("请修改账号或密码后再提交");
      return;
    }
    try {
      const res = (await updateCurrentUserProfile(payload)) as API.BaseResponseUserUpdateResponse;
      if (res?.code === 0) {
        const needLogout = Boolean(res?.data?.needLogout);
        if (needLogout) {
          message.success("账号信息更新成功，请重新登录");
          useAuthStore.setState({ user: null, isLoggedIn: false });
          router.push("/login");
        } else {
          message.success("账号信息更新成功");
          updateUser({
            userAccount: values.userAccount,
          });
          securityForm.resetFields(["currentPassword", "newPassword", "confirmNewPassword"]);
        }
      } else {
        message.error(res?.message || "账号信息更新失败");
      }
    } catch (error: any) {
      message.error(error?.message || "账号信息更新异常");
    }
  };

  return (
    <div className="admin-page account-settings-page">
      <Title level={3} className="account-page-title">
        账号设置
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="个人资料" className="account-card" variant={false}>
            <Space direction="vertical" size={20} style={{ width: "100%" }}>
              <div className="account-profile-header">
                <Avatar
                  size={72}
                  src={avatarPreview}
                  alt={currentUser?.username || "用户头像"}
                />
                <div>
                  <Title level={4} className="account-username">
                    {currentUser?.username || "未命名用户"}
                  </Title>
                  <Paragraph type="secondary" className="account-user-account">
                    登录账号：{currentUser?.userAccount || "未设置"}
                  </Paragraph>
                </div>
              </div>
              <Form
                layout="vertical"
                form={profileForm}
                onFinish={handleProfileSubmit}
                initialValues={{
                  username: currentUser?.username ?? "",
                  userAvatar: currentUser?.userAvatar ?? "",
                  profile: currentUser?.profile ?? "",
                }}
              >
                <Form.Item
                  label="昵称"
                  name="username"
                  rules={[
                    { required: true, message: "请输入昵称" },
                    { max: 50, message: "昵称长度不能超过 50 个字符" },
                  ]}
                >
                  <Input placeholder="请输入昵称" />
                </Form.Item>
                <Form.Item
                  label="头像链接"
                  name="userAvatar"
                  rules={[
                    { type: "url", message: "请输入有效的图片链接", warningOnly: true },
                    { max: 500, message: "链接长度不要超过 500 个字符" },
                  ]}
                >
                  <Input placeholder="https://example.com/avatar.png" />
                </Form.Item>
                <div className="avatar-upload-actions">
                  <Upload {...avatarUploadProps}>
                    <Button
                      icon={<UploadOutlined />}
                      loading={avatarUploading}
                    >
                      上传头像
                    </Button>
                  </Upload>
                  <Text type="secondary" className="avatar-upload-tip">
                    上传成功后请点击“保存资料”以生效
                  </Text>
                </div>
                <Form.Item label="个人简介" name="profile">
                  <TextArea rows={4} placeholder="向读者介绍一下自己，支持换行" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    保存资料
                  </Button>
                </Form.Item>
              </Form>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="账号与安全" className="account-card" variant={false}>
            <Form
              layout="vertical"
              form={securityForm}
              onFinish={handleSecuritySubmit}
              initialValues={{
                userAccount: currentUser?.userAccount ?? "",
              }}
            >
              <Form.Item
                label="登录账号"
                name="userAccount"
                rules={[
                  { required: true, message: "请输入账号" },
                  { min: 4, message: "账号至少 4 个字符" },
                  { max: 64, message: "账号最长 64 个字符" },
                ]}
              >
                <Input placeholder="请输入新的登录账号" />
              </Form.Item>
              <Form.Item
                label="新密码"
                name="newPassword"
                rules={[
                  { min: 6, message: "新密码至少 6 个字符" },
                  { max: 64, message: "密码最长 64 个字符" },
                ]}
                hasFeedback
              >
                <Input.Password
                  placeholder="不修改可留空"
                  autoComplete="new-password"
                />
              </Form.Item>
              <Form.Item
                label="确认新密码"
                name="confirmNewPassword"
                dependencies={["newPassword"]}
                hasFeedback
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("两次输入的密码不一致"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="再次输入新密码"
                  autoComplete="new-password"
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  保存账号设置
                </Button>
              </Form.Item>
              <Paragraph type="secondary" className="account-tips">
                修改账号或密码后需要重新登录。当前密码用于验证身份，请谨慎保管。
              </Paragraph>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AccountSettingsPage;
