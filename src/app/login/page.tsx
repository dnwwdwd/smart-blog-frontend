"use client";
import React, { useState } from "react";
import { Button, Card, Form, Input, message } from "antd";
import { LockOutlined, LoginOutlined, UserOutlined } from "@ant-design/icons";
import "./styles.css";
import Title from "antd/es/typography/Title";
import "@ant-design/v5-patch-for-react-19";
import {userLogin } from "@/api/userController";
import { useRouter } from "next/navigation";
import { useAuth, useCurrentUser } from "@/stores/authStore";

interface LoginForm {
  userAccount: string;
  userPassword: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);

    try {
      const res = await userLogin(values) as any;
      console.log("login: " + JSON.stringify(res));
      if (res.code == 0) {
        // 保存用户信息到全局状态
        login(res.data);
        message.success("登录成功");
        router.push("/");
      }
    } catch (error) {
      message.error("登录失败，请稍后重试！");
    } finally {
      setLoading(false);
    }
  };

  const handleFormFailed = (errorInfo: any) => {
    console.log("表单验证失败:", errorInfo);
    message.warning("请检查输入信息！");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Card className="login-card">
          <div className="login-header">
            <div className="logo-section">
              <div className="logo-icon">
                <LoginOutlined />
              </div>
              <Title level={2} className="login-title">
                系统登录
              </Title>
              <span className="login-subtitle">请输入您的账号和密码</span>
            </div>
          </div>

          <Form
            form={form}
            name="login"
            className="login-form"
            onFinish={handleLogin}
            onFinishFailed={handleFormFailed}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="userAccount"
              rules={[
                { required: true, message: "请输入账号！" },
                { min: 3, message: "账号至少3个字符！" },
                { max: 20, message: "账号不能超过20个字符！" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="input-icon" />}
                placeholder="请输入账号"
                className="login-input"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="userPassword"
              rules={[
                { required: true, message: "请输入密码！" },
                { min: 6, message: "密码至少6个字符！" },
                { max: 20, message: "密码不能超过20个字符！" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="请输入密码"
                className="login-input"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item className="login-button-item">
              <Button
                type="primary"
                htmlType="submit"
                className="login-button"
                loading={loading}
                block
              >
                {loading ? "登录中..." : "立即登录"}
              </Button>
            </Form.Item>
          </Form>

          <div className="login-footer">
            <span className="demo-info">演示账号：admin / admin123</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
