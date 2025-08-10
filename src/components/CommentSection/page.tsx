'use client';
import React, { useState } from 'react';
import { Card, Form, Input, Button, Upload, Space, Avatar, Typography, Divider, message } from 'antd';
import { SmileOutlined, PictureOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import './styles.css';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface CommentSectionProps {
  articleId: number;
}

interface Comment {
  id: number;
  author: string;
  email: string;
  website?: string;
  content: string;
  date: string;
  avatar?: string;
}

// Mock 评论数据
const mockComments: Comment[] = [
  {
    id: 1,
    author: '小明',
    email: 'xiaoming@example.com',
    website: 'https://xiaoming.com',
    content: '这篇文章写得很好，学到了很多！',
    date: '2025-01-02 10:30',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming'
  },
  {
    id: 2,
    author: '技术爱好者',
    email: 'tech@example.com',
    content: '感谢分享，正好需要这方面的知识。',
    date: '2025-01-02 14:20'
  }
];

// 常用表情
const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'];

const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
  const [form] = Form.useForm();
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // 处理文件上传
  const handleUpload: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 插入表情
  const insertEmoji = (emoji: string) => {
    const currentValue = form.getFieldValue('content') || '';
    form.setFieldsValue({
      content: currentValue + emoji
    });
    setShowEmojiPicker(false);
  };

  // 提交评论
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newComment: Comment = {
        id: Date.now(),
        author: values.author,
        email: values.email,
        website: values.website,
        content: values.content,
        date: new Date().toLocaleString('zh-CN'),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.author}`
      };
      
      setComments([newComment, ...comments]);
      form.resetFields();
      setFileList([]);
      message.success('评论发布成功！');
    } catch (error) {
      message.error('评论发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comment-section">
      <Title level={3} style={{ marginBottom: 24 }}>评论区</Title>
      
      {/* 评论表单 */}
      <Card className="comment-form-card" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <Form.Item
              name="author"
              label="昵称"
              rules={[{ required: true, message: '请输入昵称' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入您的昵称" />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入您的邮箱" />
            </Form.Item>
            
            <Form.Item
              name="website"
              label="网站（可选）"
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入您的网站" />
            </Form.Item>
          </div>
          
          <Form.Item
            name="content"
            label="评论内容"
            rules={[{ required: true, message: '请输入评论内容' }]}
          >
            <TextArea
              rows={4}
              placeholder="写下您的评论..."
              showCount
              maxLength={500}
            />
          </Form.Item>
          
          {/* 工具栏 */}
          <div className="comment-toolbar">
            <Space>
              <Button
                type="text"
                icon={<SmileOutlined />}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                表情
              </Button>
              
              <Upload
                fileList={fileList}
                onChange={handleUpload}
                beforeUpload={() => false}
                showUploadList={false}
                accept="image/*"
              >
                <Button type="text" icon={<PictureOutlined />}>
                  图片
                </Button>
              </Upload>
            </Space>
            
            <Button
              type="primary"
              icon={<SendOutlined />}
              htmlType="submit"
              loading={loading}
            >
              发布评论
            </Button>
          </div>
          
          {/* 表情选择器 */}
          {showEmojiPicker && (
            <div className="emoji-picker">
              {emojis.map((emoji, index) => (
                <span
                  key={index}
                  className="emoji-item"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </span>
              ))}
            </div>
          )}
          
          {/* 上传的图片预览 */}
          {fileList.length > 0 && (
            <div className="upload-preview">
              {fileList.map((file, index) => (
                <div key={index} className="upload-item">
                  <img
                    src={URL.createObjectURL(file.originFileObj!)}
                    alt="preview"
                    style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                  />
                </div>
              ))}
            </div>
          )}
        </Form>
      </Card>
      
      {/* 评论列表 */}
      <div className="comment-list">
        <Title level={4} style={{ marginBottom: 16 }}>全部评论 ({comments.length})</Title>
        
        {comments.length === 0 ? (
          <div className="no-comments">
            <Text type="secondary">暂无评论，快来抢沙发吧！</Text>
          </div>
        ) : (
          comments.map((comment, index) => (
            <div key={comment.id}>
              <div className="comment-item">
                <Avatar
                  src={comment.avatar}
                  icon={<UserOutlined />}
                  size={40}
                  className="comment-avatar"
                />
                
                <div className="comment-content">
                  <div className="comment-header">
                    <Space>
                      <Text strong>{comment.author}</Text>
                      <Text type="secondary" className="comment-date">
                        {comment.date}
                      </Text>
                    </Space>
                  </div>
                  
                  <div className="comment-text">
                    {comment.content}
                  </div>
                  
                  <div className="comment-actions">
                    <Button type="text" size="small">
                      回复
                    </Button>
                  </div>
                </div>
              </div>
              
              {index < comments.length - 1 && <Divider />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;