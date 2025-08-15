"use server";
import React from "react";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import Sidebar from "@/components/Sidebar/page";
import ColumnCard, { Column } from "@/components/ColumnCard/page";
import "./styles.css";
import { getColumnPage } from "@/api/columnController";

export default async function ColumnsPage() {
  let columns = [];

  const res = await getColumnPage({
    current: 1,
    pageSize: -1,
  });
  columns = res.data?.records ?? [];

  return (
    <div className="columns-page">
      <div className="container">
        <div className="columns-header mb-6">
          <Title level={2}>📚 专栏列表</Title>
          <Paragraph type="secondary">系统化学习，深度掌握技术</Paragraph>
        </div>

        <div className="page-layout">
          {/* 主内容区 */}
          <div className="main-content">
            <div className="columns-grid">
              {columns &&
                columns.map((column) => (
                  <ColumnCard key={column.id} column={column} />
                ))}
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="sidebar-content">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
