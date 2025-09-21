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
  Tag,
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
  userId?: number;
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
  const currentUser = useAuthStore((state) => state.user);

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
    createTime: vo.createTime || "",
    avatar: vo.avatar,
    replies: [],
    userId: (vo as any).userId ? String((vo as any).userId) : undefined,
  });

  // 获取评论列表
  const fetchComments = async () => {
    setListLoading(true);
    try {
      const res: any = await getComment({ articleId: articleId as any }); // 直接传递字符串，避免精度丢失
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
      const nickname = isLoggedIn ? (currentUser?.username || "") : values.author;
      const email = isLoggedIn ? "" : values.email;
      const website = isLoggedIn ? undefined : values.website;
      const avatarSeed = isLoggedIn ? (currentUser?.username || "user") : values.author;

      const payload: API.CommentDto = {
        articleId: articleId as any, // 直接传递字符串，避免精度丢失
        nickname,
        email: email as any, // 登录用户无需填写邮箱，后端可根据会话识别
        content: values.content,
        website,
        avatar: currentUser?.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`,
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
      const nickname = isLoggedIn ? (currentUser?.username || "") : values.author;
      const email = isLoggedIn ? "" : values.email;
      const website = isLoggedIn ? undefined : values.website;
      const avatarSeed = isLoggedIn ? (currentUser?.username || "user") : values.author;

      const payload: API.CommentDto = {
        articleId: articleId as any, // 直接传递字符串，避免精度丢失
        nickname,
        email: email as any,
        content: values.content,
        website,
        avatar: currentUser?.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`,
        parentId: Number(replyingTo), // 直接使用被回复评论的ID作为父级ID
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
    try {
      await deleteComment({ id: Number(commentId) });
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
          {!isLoggedIn && (
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
                    pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
                    message: '请输入有效的网站地址（允许http://或https://）'
                  }
                ]}
                style={{ flex: 1 }}
              >
                <Input placeholder="请输入您的网站" />
              </Form.Item>
            </div>
          )}

          <Form.Item
            name="content"
            label="评论内容"
            rules={[{ required: true, message: "请输入评论内容" }]}
          >
            <TextArea rows={4} placeholder={isLoggedIn ? `以 ${currentUser?.username || '已登录用户'} 身份发表评论` : "友善发言，理性讨论"} />
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

          {showEmojiPicker && (
            <div style={{ marginTop: 12 }}>
              <Space wrap size={[8, 8]}>
                {emojis.map((emoji) => (
                  <Button
                    key={emoji}
                    size="small"
                    onClick={() => insertEmoji(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </Space>
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

  const isAuthor = comment.userId && comment.userId !== 0;

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
              <div className="comment-author-row">
                <Text strong>
                  {comment.author}
                </Text>
                {isAuthor && (
                  <Tag color="blue">作者</Tag>
                )}
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
                      style={{ color: 'red' }}
                    />
                  </Popconfirm>
                )}
              </div>

              {/* 用户信息 - 在同一行显示 */}
              <div className="comment-info-row">
                <Text type="secondary" className="comment-createTime">
                  🕰️ {dayjs(comment.createTime).format('YYYY-MM-DD HH:mm')}
                </Text>
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
              </div>
            </div>
          </div>

          {/* 评论内容 - 另起一行 */}
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
            <div className="reply-form-flat" style={{ marginTop: 16 }}>
              <Card size="small" className="reply-form-card">
                <Form
                  form={replyForm}
                  layout="vertical"
                  onFinish={handleReplySubmit}
                  autoComplete="off"
                  size="small"
                >
                  {!isLoggedIn && (
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
                            pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
                            message: '请输入有效的网站地址（允许http://或https://）'
                          }
                        ]}
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Input placeholder="请输入您的网站" size="small" />
                      </Form.Item>
                    </div>
                  )}

                  <Form.Item
                    name="content"
                    label={`回复 @${comment.author}`}
                    rules={[{ required: true, message: "请输入回复内容" }]}
                    style={{ marginBottom: 8 }}
                  >
                    <TextArea rows={3} placeholder={useAuthStore.getState().isLoggedIn ? `以 ${useAuthStore.getState().user?.username || '已登录用户'} 身份回复` : `回复 @${comment.author}`} />
                  </Form.Item>

                  <div className="reply-toolbar">
                    <Space>
                      <Button
                        type="text"
                        size="small"
                        icon={<SmileOutlined />}
                        onClick={() => setShowReplyEmojiPicker(!showReplyEmojiPicker)}
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
                        <Button type="text" size="small" icon={<PictureOutlined />}>
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
                        size="small"
                        htmlType="submit"
                        icon={<SendOutlined />}
                        loading={replyLoading}
                      >
                        发表回复
                      </Button>
                    </Space>
                  </div>

                  {showReplyEmojiPicker && (
                    <div style={{ marginTop: 8 }}>
                      <Space wrap size={[6, 6]}>
                        {emojis.map((emoji: any) => (
                          <Button
                            key={emoji}
                            size="small"
                            onClick={() => insertReplyEmoji(emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </Space>
                    </div>
                  )}

                  {replyFileList.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <Space wrap size={[6, 6]}>
                        {replyFileList.map((file: UploadFile, index: number) => (
                          <Button key={index} size="small" type="dashed">
                            {file.name}
                          </Button>
                        ))}
                      </Space>
                    </div>
                  )}
                </Form>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* 嵌套回复列表 ... 保持不变 */}
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
  const currentUser = useAuthStore.getState().user;
  const isAuthor = currentUser && comment.userId && String(currentUser.id) === String(comment.userId);

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
              {comment.replyTo ? (
                <div className="reply-indicator">
                  <Text strong style={{ fontSize: "16px" }}>
                    {comment.author}
                  </Text>
                  {isAuthor && (
                    <Tag color="blue">作者</Tag>
                  )}
                  <Text type="secondary">回复</Text>
                  <Text strong>@{comment.replyTo.author}</Text>
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
                        style={{ color: 'red' }}
                      />
                    </Popconfirm>
                  )}
                </div>
              ) : (
                <div className="comment-author-row">
                  <Text strong style={{ fontSize: "16px" }}>
                    {comment.author}
                  </Text>
                  {isAuthor && (
                    <Tag color="blue">作者</Tag>
                  )}
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
                        style={{ color: 'red' }}
                      />
                    </Popconfirm>
                  )}
                </div>
              )}

              {/* 用户信息 - 在同一行显示 */}
              <div className="comment-info-row">
                <Text type="secondary" className="comment-createTime">
                  🕰️ {dayjs(comment.createTime).format('YYYY-MM-DD HH:mm')}
                </Text>
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
              </div>
            </div>
          </div>

          {/* 评论内容 - 另起一行 */}
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
                  {!isLoggedIn && (
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
                            pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
                            message: '请输入有效的网站地址（允许http://或https://）'
                          }
                        ]}
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Input placeholder="请输入您的网站" size="small" />
                      </Form.Item>
                    </div>
                  )}

                  <Form.Item
                    name="content"
                    label={`回复 @${comment.author}`}
                    rules={[{ required: true, message: "请输入回复内容" }]}
                    style={{ marginBottom: 8 }}
                  >
                    <TextArea rows={3} placeholder={useAuthStore.getState().isLoggedIn ? `以 ${useAuthStore.getState().user?.username || '已登录用户'} 身份回复` : `回复 @${comment.author}`} />
                  </Form.Item>

                  <div className="reply-toolbar">
                    <Space>
                      <Button
                        type="text"
                        size="small"
                        icon={<SmileOutlined />}
                        onClick={() => setShowReplyEmojiPicker(!showReplyEmojiPicker)}
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
                        <Button type="text" size="small" icon={<PictureOutlined />}>
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
                        size="small"
                        htmlType="submit"
                        icon={<SendOutlined />}
                        loading={replyLoading}
                      >
                        发表回复
                      </Button>
                    </Space>
                  </div>

                  {showReplyEmojiPicker && (
                    <div style={{ marginTop: 8 }}>
                      <Space wrap size={[6, 6]}>
                        {emojis.map((emoji) => (
                          <Button
                            key={emoji}
                            size="small"
                            onClick={() => insertReplyEmoji(emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </Space>
                    </div>
                  )}

                  {replyFileList.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <Space wrap size={[6, 6]}>
                        {replyFileList.map((file: UploadFile, index: number) => (
                          <Button key={index} size="small" type="dashed">
                            {file.name}
                          </Button>
                        ))}
                      </Space>
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
