'use client';
import React, {useState} from 'react';
import {Button, Card, Form, Input, message} from 'antd';
import {LockOutlined, LoginOutlined, UserOutlined} from '@ant-design/icons';
import './styles.css';
import Title from "antd/es/typography/Title";

interface LoginForm {
  userAccount: string;
  userPassword: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    
    try {
      // 模拟登录API调用
      console.log('登录信息:', values);
      
      // 这里应该调用实际的登录API
      // const response = await loginAPI(values);
      
      // 模拟登录延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟登录成功
      if (values.userAccount === 'admin' && values.userPassword === 'admin123') {
        message.success('登录成功！');
        // 这里应该保存token并跳转到管理后台
        // localStorage.setItem('token', response.token);
        // router.push('/admin');
        console.log('登录成功，跳转到管理后台');
      } else {
        message.error('账号或密码错误！');
      }
    } catch (error) {
      console.error('登录失败:', error);
      message.error('登录失败，请稍后重试！');
    } finally {
      setLoading(false);
    }
  };

  const handleFormFailed = (errorInfo: any) => {
    console.log('表单验证失败:', errorInfo);
    message.warning('请检查输入信息！');
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
              <span className="login-subtitle">
                请输入您的账号和密码
              </span>
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
                { required: true, message: '请输入账号！' },
                { min: 3, message: '账号至少3个字符！' },
                { max: 20, message: '账号不能超过20个字符！' }
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
                { required: true, message: '请输入密码！' },
                { min: 6, message: '密码至少6个字符！' },
                { max: 20, message: '密码不能超过20个字符！' }
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
                {loading ? '登录中...' : '立即登录'}
              </Button>
            </Form.Item>
          </Form>
          
          <div className="login-footer">
            <span className="demo-info">
              演示账号：admin / admin123
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}