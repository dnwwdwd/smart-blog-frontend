"use server";
import React from "react";
import { Col, Row, Statistic } from "antd";
import { CalendarOutlined, FileTextOutlined } from "@ant-design/icons";
import ArticleList from "@/components/ArticleList/page";
import Sidebar from "@/components/Sidebar/page";
import "./styles.css";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import Image from "next/image";
import { getColumnById } from "@/api/columnController";
import { formatDate } from "@/utils";
import { getArticlePageByColumnId } from "@/api/articleController";

interface Props {
  params: Promise<{
    columnId: string;
  }>;
}

export default async function ColumnDetailPage({ params }: Props) {
  const { columnId } = await params;
  let column = {};
  let columnArticles = [];
  try {
    const res = await getColumnById({ columnId });
    column = res.data;
  } catch (e) {
    console.log(e);
  }

  try {
    const res = await getArticlePageByColumnId(
      { columnId: columnId },
      { pageNum: 1, pageSize: 5 }
    );
    columnArticles = res.data.records ?? [];
  } catch (e) {
    console.log(e);
  }

  if (!column) {
    return (
      <div className="column-detail-container">
        <div className="column-not-found">
          <Title level={2}>专栏不存在</Title>
          <Paragraph>抱歉，您访问的专栏不存在或已被删除。</Paragraph>
        </div>
      </div>
    );
  }

  return (
    <div className="column-detail-container">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={18}>
          {/* 专栏信息 */}
          <div className="column-header">
            <div className="column-cover">
              <Image
                width={200}
                height={120}
                src={column.coverImage}
                alt={column.name}
                unoptimized
              />
            </div>
            <div className="column-info">
              <Title level={1} className="column-title">
                {column.title}
              </Title>
              <Paragraph className="column-description">
                {column.description}
              </Paragraph>

              <div className="column-meta">
                <div className="column-stats">
                  <Statistic
                    title="文章数"
                    value={column.articleCount}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ fontSize: "16px" }}
                  />
                  <Statistic
                    title="创建时间"
                    value={formatDate(column.createTime)}
                    prefix={<CalendarOutlined />}
                    valueStyle={{ fontSize: "16px" }}
                  />
                  {/*<Statistic*/}
                  {/*  title="阅读量"*/}
                  {/*  value={column.viewCount}*/}
                  {/*  prefix={<EyeOutlined />}*/}
                  {/*  valueStyle={{ fontSize: "16px" }}*/}
                  {/*/>*/}
                </div>
              </div>
            </div>
          </div>

          {/* 专栏文章列表 */}
          <div className="column-articles">
            <Title level={3}>专栏文章</Title>
            <ArticleList
              showPagination={true}
              pageSize={10}
              articles={columnArticles}
            />
          </div>
        </Col>

        <Col xs={24} lg={6}>
          <Sidebar />
        </Col>
      </Row>
    </div>
  );
}
