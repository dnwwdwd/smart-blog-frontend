"use client";
import React, { useEffect, useState } from "react";
import type { UploadFile, UploadProps } from "antd";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Space,
  Typography,
  Upload,
  Popconfirm,
} from "antd";
import {
  PictureOutlined,
  SendOutlined,
  SmileOutlined,
  UserOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { getComment, submitComment, deleteComment } from "@/api/commentController";
import { useAuthStore } from "@/stores/authStore";
import dayjs from "dayjs";
import "./styles.css";

const { TextArea } = Input;
const { Title, Text } = Typography;

interface CommentSectionProps {
  articleId: string;
}

interface Comment {
  id: string;
  author: string;
  email: string;
  website?: string;
  content: string;
  createTime: string;
  avatar?: string;
  replies?: Comment[]; // 嵌套的回复评论
}

// 统计某条评论的所有子回复数量（递归）
const countDescendants = (c: Comment): number => {
  if (!c.replies || c.replies.length === 0) return 0;
  return c.replies.reduce((sum, r) => sum + 1 + countDescendants(r), 0);
};

// 统计包含回复在内的总评论数
const countAllComments = (list: Comment[]) =>
  list.reduce((sum, c) => sum + 1 + countDescendants(c), 0);

// 扩展的评论类型，包含回复对象信息
interface FlatComment extends Comment {
  replyTo?: {
    id: string;
    author: string;
  };
  isReply: boolean;
}

// 将嵌套的评论结构转换为扁平的列表，带有回复关系
const flattenComments = (comments: Comment[]): FlatComment[] => {
  const result: FlatComment[] = [];

  const processComment = (
    comment: Comment,
    isReply: boolean = false,
    replyTo?: Comment
  ): void => {
    const flatComment: FlatComment = {
      ...comment,
      isReply,
      replyTo: replyTo ? { id: replyTo.id, author: replyTo.author } : undefined,
    };

    result.push(flatComment);

    // 递归处理回复，每个回复都直接回复当前评论
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.forEach((reply) => {
        processComment(reply, true, comment);
      });
    }
  };

  // 处理所有顶级评论
  comments.forEach((comment) => processComment(comment));
  return result;
};

// 常用表情
const emojis = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😛",
  "😝",
  "😜",
  "🤪",
  "🤨",
  "🧐",
  "🤓",
  "😎",
  "🤩",
  "🥳",
  "😏",
  "😒",
  "😞",
  "😔",
  "😟",
  "😕",
  "🙁",
  "☹️",
  "😣",
  "😖",
  "😫",
  "😩",
  "🥺",
  "😢",
  "😭",
  "😤",
  "😠",
  "😡",
  "🤬",
  "🤯",
  "😳",
  "🥵",
  "🥶",
  "😱",
  "😨",
  "😰",
  "😥",
  "😓",
  "🤗",
  "🤔",
  "🤭",
  "🤫",
  "🤥",
  "😶",
  "😐",
  "😑",
  "😬",
  "🙄",
  "😯",
  "😦",
  "😧",
  "😮",
  "😲",
  "🥱",
  "😴",
  "🤤",
  "😪",
  "😵",
  "🤐",
  "🥴",
  "🤢",
  "🤮",
  "🤧",
  "😷",
  "🤒",
  "🤕",
];

const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
  const [form] = Form.useForm();
  const [replyForm] = Form.useForm();
  // 从后端加载，初始为空
  const [comments, setComments] = useState<Comment[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  // 回复相关状态
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyFileList, setReplyFileList] = useState<UploadFile[]>([]);
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState(false);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  // 计算包含回复在内的总评论数
  const totalComments = countAllComments(comments);

  // 处理文件上传
  const handleUpload: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 插入表情
  const insertEmoji = (emoji: string) => {
    const currentValue = form.getFieldValue("content") || "";
    form.setFieldsValue({
      content: currentValue + emoji,
    });
    setShowEmojiPicker(false);
  };

  // 插入回复表情
  const insertReplyEmoji = (emoji: string) => {
    const currentValue = replyForm.getFieldValue("content") || "";
    replyForm.setFieldsValue({
      content: currentValue + emoji,
    });
    setShowReplyEmojiPicker(false);
  };

  // 开始回复评论
  const startReply = (commentId: string) => {
    // 如果点击的是当前正在回复的评论，则关闭回复框
    if (replyingTo === commentId) {
      setReplyingTo(null);
      replyForm.resetFields();
      setReplyFileList([]);
    } else {
      // 否则切换到新的回复目标
      setReplyingTo(commentId);
      replyForm.resetFields();
      setReplyFileList([]);
    }
    setShowReplyEmojiPicker(false);
  };

  // 取消回复
  const cancelReply = () => {
    setReplyingTo(null);
    replyForm.resetFields();
    setReplyFileList([]);
    setShowReplyEmojiPicker(false);
  };

  // 将后端 VO 映射为前端 Comment 类型（递归处理回复）
  const mapVoToComment = (vo: API.CommentVo): Comment => ({
    id: vo.id?.toString() ?? Math.floor(Math.random() * 1e9).toString(),
    author: vo.author || "匿名",
    email: vo.email || "",
    website: vo.website,
    content: vo.content || "",
    createTime: vo.createTime ? (typeof vo.createTime === 'string' ? vo.createTime : vo.createTime.toString()) : "",
    avatar: vo.avatar,
    replies: vo.replies ? vo.replies.map(mapVoToComment) : [],
  });

  // 获取评论列表
  const fetchComments = async () => {
    setListLoading(true);
    try {
      const res: any = await getComment({ articleId });
      // 兼容 AxiosResponse 和 已被拦截器解包的数据
      const list: API.CommentVo[] = Array.isArray(res?.data)
        ? (res.data as API.CommentVo[])
        : (res?.data?.data as API.CommentVo[]) ?? [];
      setComments((list || []).map(mapVoToComment));
    } catch (error) {
      message.error("获取评论失败，请稍后重试");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  // 提交评论
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload: API.CommentDto = {
        articleId,
        nickname: values.author,
        email: values.email,
        content: values.content,
        website: values.website,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.author}`,
      };

      const res: any = await submitComment(payload);
      const code = res?.code ?? res?.data?.code;
      if (code === 0) {
        message.success("评论发布成功！");
        form.resetFields();
        setFileList([]);
        await fetchComments();
      } else {
        const errMsg =
          res?.message || res?.data?.message || "评论发布失败，请重试";
        message.error(errMsg);
      }
    } catch (error) {
      message.error("评论发布失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 提交回复
  const handleReplySubmit = async (values: any) => {
    if (!replyingTo) return;

    setReplyLoading(true);
    try {
      const payload: API.CommentDto = {
        articleId,
        nickname: values.author,
        email: values.email,
        content: values.content,
        website: values.website,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.author}`,
        parentId: replyingTo, // 直接使用被回复评论的ID作为父级ID
      };

      const res: any = await submitComment(payload);
      const code = res?.code ?? res?.data?.code;
      if (code === 0) {
        message.success("回复发布成功！");
        replyForm.resetFields();
        setReplyFileList([]);
        setReplyingTo(null);
        await fetchComments();
      } else {
        const errMsg =
          res?.message || res?.data?.message || "回复发布失败，请重试";
        message.error(errMsg);
      }
    } catch (error) {
      message.error("回复发布失败，请重试");
    } finally {
      setReplyLoading(false);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId: string) => {
    console.log("id:" , commentId)
    try {
      await deleteComment({ commentId });
      message.success("评论删除成功");
      await fetchComments();
    } catch (error) {
      message.error("删除评论失败");
    }
  };

  // 处理回复文件上传
  const handleReplyUpload: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setReplyFileList(newFileList);
  };

  return (
    <div className="comment-section">
      <Title level={3} style={{ marginBottom: 24 }}>
        评论区
      </Title>

      {/* 评论表单 */}
      <Card className="comment-form-card" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <Form.Item
              name="author"
              label="昵称"
              rules={[{ required: true, message: "请输入昵称" }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入您的昵称" />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: "请输入邮箱" },
                { type: "email", message: "请输入有效的邮箱地址" },
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入您的邮箱" />
            </Form.Item>

            <Form.Item
              name="website"
              label="网站（可选）"
              rules={[
                {
                  pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                  message: '请输入有效的网站地址（允许http://或https://）'
                }
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入您的网站" />
            </Form.Item>
          </div>

          <Form.Item
            name="content"
            label="评论内容"
            rules={[{ required: true, message: "请输入评论内容" }]}
          >
            <TextArea rows={4} placeholder="友善发言，理性讨论" />
          </Form.Item>

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
                multiple
                showUploadList={false}
              >
                <Button type="text" icon={<PictureOutlined />}>
                  图片
                </Button>
              </Upload>
            </Space>

            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={loading}
            >
              发布评论
            </Button>
          </div>

          {/* 表情选择器 */}
          {showEmojiPicker && (
            <div className="emoji-picker">
              {emojis.map((emoji) => (
                <span
                  key={emoji}
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
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </Form>
      </Card>

      {/* 评论列表 */}
      <div className="comment-list">
        <Title level={4} style={{ marginBottom: 16 }}>
          全部评论 ({totalComments})
        </Title>

        {listLoading ? (
          <div className="no-comments">
            <Text type="secondary">加载中...</Text>
          </div>
        ) : comments.length === 0 ? (
          <div className="no-comments">
            <Text type="secondary">暂无评论，快来抢沙发吧！</Text>
          </div>
        ) : (
          <>
            {comments.map((topComment, topIndex) => {
              const flatComments = flattenComments([topComment]);
              return (
                <div key={topComment.id} className="comment-group">
                  {flatComments.map((comment, index) => (
                    <div key={comment.id}>
                      {renderFlatComment(comment, {
                        replyingTo,
                        startReply,
                        cancelReply,
                        replyForm,
                        handleReplySubmit,
                        replyLoading,
                        replyFileList,
                        handleReplyUpload,
                        showReplyEmojiPicker,
                        setShowReplyEmojiPicker,
                        insertReplyEmoji,
                        emojis,
                        isLoggedIn,
                        handleDeleteComment,
                      })}
                    </div>
                  ))}
                  {topIndex < comments.length - 1 && <Divider />}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default CommentSection;

// 渲染嵌套评论结构
const renderNestedComment = (comment: Comment, replyProps?: any) => {
  const {
    replyingTo,
    startReply,
    cancelReply,
    replyForm,
    handleReplySubmit,
    replyLoading,
    replyFileList,
    handleReplyUpload,
    showReplyEmojiPicker,
    setShowReplyEmojiPicker,
    insertReplyEmoji,
    emojis,
    isLoggedIn,
    handleDeleteComment,
  } = replyProps || {};

  const isReplying = replyingTo === comment.id;

  return (
    <div className="comment-item">
      <div className="comment-main">
        <Avatar
          src={comment.avatar}
          icon={<UserOutlined />}
          size={40}
          className="comment-avatar"
        />

        <div className="comment-content">
          <div className="comment-header">
            <div className="comment-author-info">
              <Text strong>{comment.author}</Text>

              {/* 用户信息 */}
              <div className="user-details">
                {comment.email && (
                  <Text type="secondary" className="user-email">
                    📧 {comment.email}
                  </Text>
                )}
                {comment.website && (
                  <a
                    href={
                      comment.website.startsWith("http")
                        ? comment.website
                        : `https://${comment.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="user-website"
                    title={`访问 ${comment.author} 的网站`}
                  >
                    🌐 {comment.website}
                  </a>
                )}
                <Text type="secondary" className="comment-createTime">
                  🕰️ {dayjs(comment.createTime).format('YYYY-MM-DD HH:mm')}
                </Text>
                {isLoggedIn && (
                  <Popconfirm
                    title="确定要删除这条评论吗？"
                    onConfirm={() => handleDeleteComment(comment.id!)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      className="comment-delete-btn"
                      size="small"
                      style={{ color: 'red', marginLeft: '8px' }}
                    />
                  </Popconfirm>
                )}
              </div>
            </div>
          </div>

          <div className="comment-text">{comment.content}</div>

          <div className="comment-actions">
            {startReply && (
              <Button
                type="text"
                size="small"
                onClick={() => startReply(comment.id)}
              >
                {isReplying ? "取消回复" : "回复"}
              </Button>
            )}
          </div>

          {/* 回复表单 */}
          {isReplying && replyForm && (
            <div className="reply-form" style={{ marginTop: 16 }}>
              <Card size="small" className="reply-form-card">
                <Form
                  form={replyForm}
                  layout="vertical"
                  onFinish={handleReplySubmit}
                  autoComplete="off"
                  size="small"
                >
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <Form.Item
                      name="author"
                      label="昵称"
                      rules={[{ required: true, message: "请输入昵称" }]}
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <Input placeholder="请输入您的昵称" size="small" />
                    </Form.Item>

                    <Form.Item
                      name="email"
                      label="邮箱"
                      rules={[
                        { required: true, message: "请输入邮箱" },
                        { type: "email", message: "请输入有效的邮箱地址" },
                      ]}
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <Input placeholder="请输入您的邮箱" size="small" />
                    </Form.Item>

                    <Form.Item
                      name="website"
                      label="网站（可选）"
                      rules={[
                        {
                          pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                          message: '请输入有效的网站地址（允许http://或https://）'
                        }
                      ]}
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <Input placeholder="请输入您的网站" size="small" />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="content"
                    label="回复内容"
                    rules={[{ required: true, message: "请输入回复内容" }]}
                    style={{ marginBottom: 12 }}
                  >
                    <TextArea
                      rows={3}
                      placeholder={`回复 @${comment.author}`}
                    />
                  </Form.Item>

                  <div className="reply-toolbar">
                    <Space>
                      <Button
                        type="text"
                        icon={<SmileOutlined />}
                        size="small"
                        onClick={() =>
                          setShowReplyEmojiPicker(!showReplyEmojiPicker)
                        }
                      >
                        表情
                      </Button>
                      <Upload
                        fileList={replyFileList}
                        onChange={handleReplyUpload}
                        beforeUpload={() => false}
                        multiple
                        showUploadList={false}
                      >
                        <Button
                          type="text"
                          icon={<PictureOutlined />}
                          size="small"
                        >
                          图片
                        </Button>
                      </Upload>
                    </Space>

                    <Space>
                      <Button size="small" onClick={cancelReply}>
                        取消
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SendOutlined />}
                        loading={replyLoading}
                        size="small"
                      >
                        发布回复
                      </Button>
                    </Space>
                  </div>

                  {/* 回复表情选择器 */}
                  {showReplyEmojiPicker && (
                    <div className="emoji-picker" style={{ marginTop: 12 }}>
                      {emojis.map((emoji: string) => (
                        <span
                          key={emoji}
                          className="emoji-item"
                          onClick={() => insertReplyEmoji(emoji)}
                        >
                          {emoji}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 回复上传的图片预览 */}
                  {replyFileList.length > 0 && (
                    <div className="upload-preview" style={{ marginTop: 12 }}>
                      {replyFileList.map((file: UploadFile, index: number) => (
                        <div key={index} className="upload-item">
                          <img
                            src={URL.createObjectURL(file.originFileObj!)}
                            alt="preview"
                            style={{
                              width: 80,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Form>
              </Card>
            </div>
          )}

          {/* 回复列表 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="reply-list" style={{ marginTop: 16 }}>
              {comment.replies.map((reply, index) => (
                <div key={reply.id} className="reply-item">
                  <div className="reply-indicator">
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      回复 @{comment.author}:
                    </Text>
                  </div>
                  {renderNestedComment(reply, replyProps)}
                  {index < comment.replies!.length - 1 && (
                    <Divider style={{ margin: "8px 0" }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 渲染扇平化评论（显示"某某回复某某"而不是缩进）
const renderFlatComment = (comment: FlatComment, replyProps?: any) => {
  const { isLoggedIn, handleDeleteComment } = replyProps || {};
  const {
    replyingTo,
    startReply,
    cancelReply,
    replyForm,
    handleReplySubmit,
    replyLoading,
    replyFileList,
    handleReplyUpload,
    showReplyEmojiPicker,
    setShowReplyEmojiPicker,
    insertReplyEmoji,
    emojis,
  } = replyProps || {};

  const isReplying = replyingTo === comment.id;

  return (
    <div className="comment-item-flat">
      <div className="comment-main">
        <Avatar
          src={comment.avatar}
          icon={<UserOutlined />}
          size={40}
          className="comment-avatar"
        />

        <div className="comment-content-flat">
          <div className="comment-header-flat">
            <div className="comment-author-info">
              {/* 显示回复关系 */}
              {comment.replyTo ? (
                <div className="reply-indicator">
                  <Text strong style={{ color: "#1890ff" }}>
                    {comment.author}
                  </Text>
                  <Text type="secondary" style={{ margin: "0 6px" }}>
                    回复
                  </Text>
                  <Text strong style={{ color: "#52c41a" }}>
                    {comment.replyTo.author}
                  </Text>
                </div>
              ) : (
                <Text strong style={{ fontSize: "16px" }}>
                  {comment.author}
                </Text>
              )}

              {/* 用户信息 */}
              <div className="user-details">
                {comment.email && (
                  <Text type="secondary" className="user-email">
                    📧 {comment.email}
                  </Text>
                )}
                {comment.website && (
                  <a
                    href={
                      comment.website.startsWith("http")
                        ? comment.website
                        : `https://${comment.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="user-website"
                    title={`访问 ${comment.author} 的网站: ${comment.website}`}
                  >
                    🌐 {comment.website}
                  </a>
                )}
                <Text type="secondary" className="comment-createTime">
                  🕰️ {dayjs(comment.createTime).format('YYYY-MM-DD HH:mm')}
                </Text>
                {isLoggedIn && (
                  <Popconfirm
                    title="确定要删除这条评论吗？"
                    onConfirm={() => handleDeleteComment(comment.id!)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      className="comment-delete-btn"
                      size="small"
                      style={{ color: 'red', marginLeft: '8px' }}
                    />
                  </Popconfirm>
                )}
              </div>
            </div>
          </div>

          <div className="comment-text-flat">{comment.content}</div>

          <div className="comment-actions-flat">
            {startReply && (
              <Button
                type="text"
                size="small"
                onClick={() => startReply(comment.id)}
              >
                {isReplying ? "取消回复" : "回复"}
              </Button>
            )}
          </div>

          {/* 回复表单 */}
          {isReplying && replyForm && (
            <div className="reply-form-flat" style={{ marginTop: 16 }}>
              <Card size="small" className="reply-form-card">
                <Form
                  form={replyForm}
                  layout="vertical"
                  onFinish={handleReplySubmit}
                  autoComplete="off"
                  size="small"
                >
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <Form.Item
                      name="author"
                      label="昵称"
                      rules={[{ required: true, message: "请输入昵称" }]}
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <Input placeholder="请输入您的昵称" size="small" />
                    </Form.Item>

                    <Form.Item
                      name="email"
                      label="邮箱"
                      rules={[
                        { required: true, message: "请输入邮箱" },
                        { type: "email", message: "请输入有效的邮箱地址" },
                      ]}
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <Input placeholder="请输入您的邮箱" size="small" />
                    </Form.Item>

                    <Form.Item
                      name="website"
                      label="网站（可选）"
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <Input placeholder="请输入您的网站" size="small" />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="content"
                    label="回复内容"
                    rules={[{ required: true, message: "请输入回复内容" }]}
                    style={{ marginBottom: 12 }}
                  >
                    <TextArea
                      rows={3}
                      placeholder={`回复 @${comment.author}`}
                    />
                  </Form.Item>

                  <div className="reply-toolbar">
                    <Space>
                      <Button
                        type="text"
                        icon={<SmileOutlined />}
                        size="small"
                        onClick={() =>
                          setShowReplyEmojiPicker(!showReplyEmojiPicker)
                        }
                      >
                        表情
                      </Button>
                      <Upload
                        fileList={replyFileList}
                        onChange={handleReplyUpload}
                        beforeUpload={() => false}
                        multiple
                        showUploadList={false}
                      >
                        <Button
                          type="text"
                          icon={<PictureOutlined />}
                          size="small"
                        >
                          图片
                        </Button>
                      </Upload>
                    </Space>

                    <Space>
                      <Button size="small" onClick={cancelReply}>
                        取消
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SendOutlined />}
                        loading={replyLoading}
                        size="small"
                      >
                        发布回复
                      </Button>
                    </Space>
                  </div>

                  {/* 回复表情选择器 */}
                  {showReplyEmojiPicker && (
                    <div className="emoji-picker" style={{ marginTop: 12 }}>
                      {emojis.map((emoji: string) => (
                        <span
                          key={emoji}
                          className="emoji-item"
                          onClick={() => insertReplyEmoji(emoji)}
                        >
                          {emoji}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 回复上传的图片预览 */}
                  {replyFileList.length > 0 && (
                    <div className="upload-preview" style={{ marginTop: 12 }}>
                      {replyFileList.map((file: UploadFile, index: number) => (
                        <div key={index} className="upload-item">
                          <img
                            src={URL.createObjectURL(file.originFileObj!)}
                            alt="preview"
                            style={{
                              width: 80,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Form>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
