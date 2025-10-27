"use client";

import React, { useState } from "react";
import { Form, Input, Modal, message } from "antd";
import SocialLinksEditor from "@/components/SocialLinksEditor";
import { applyFriendLink } from "@/api/friendLinkController";

interface FriendLinkApplyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const FriendLinkApplyModal: React.FC<FriendLinkApplyModalProps> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm<API.FriendLinkDto>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload: API.FriendLinkDto = {
        ...values,
        socialLinks: values.socialLinks || [],
        sortOrder: 0,
        status: 0,
      } as API.FriendLinkDto;

      const res: any = await applyFriendLink(payload);
      if (res?.code === 0) {
        message.success("友链申请已提交，等待审核");
        form.resetFields();
        onSuccess?.();
        onClose();
      } else {
        message.error(res?.message || "申请提交失败");
      }
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      message.error("申请提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="申请友链"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText="提交申请"
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="网站名称"
          rules={[{ required: true, message: "请输入网站名称" }]}
        >
          <Input placeholder="请输入网站名称" />
        </Form.Item>
        <Form.Item
          name="url"
          label="网站地址"
          rules={[{ required: true, message: "请输入网站地址" }, { type: "url", message: "请输入有效的 URL" }]}
        >
          <Input placeholder="https://example.com" />
        </Form.Item>
        <Form.Item
          name="avatar"
          label="网站头像"
          rules={[{ required: true, message: "请输入头像链接" }, { type: "url", message: "请输入有效的 URL" }]}
        >
          <Input placeholder="https://example.com/avatar.jpg" />
        </Form.Item>
        <Form.Item
          name="description"
          label="网站描述"
          rules={[{ required: true, message: "请输入网站描述" }]}
        >
          <Input.TextArea rows={3} showCount maxLength={200} placeholder="请输入网站描述" />
        </Form.Item>
        <Form.Item name="statusLabel" label="状态标签">
          <Input placeholder="例如 VIP、PREMIUM（可选）" />
        </Form.Item>
        <Form.Item name="socialLinks" label="社交链接">
          <SocialLinksEditor />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FriendLinkApplyModal;
