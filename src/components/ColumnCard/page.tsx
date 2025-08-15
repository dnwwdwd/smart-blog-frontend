import React from "react";
import { Card } from "antd";
import { CalendarOutlined, EyeOutlined, UserOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import "./styles.css";
import { formatDate } from "@/utils";

export default function ColumnCard({ column }: any) {
  return (
    <Link href={`/column/${column.id}`} style={{ textDecoration: "none" }}>
      <Card
        className="column-card"
        hoverable
        cover={
          <div className="column-cover">
            <Image
              src={column.coverImage}
              alt={column.name}
              width={400}
              height={250}
              style={{ objectFit: "cover" }}
              unoptimized
            />
          </div>
        }
      >
        <div className="column-content">
          <Title level={4} className="column-title">
            {column.name}
          </Title>

          <Paragraph className="column-description">
            {column.description}
          </Paragraph>

          <div className="column-meta">
            <div className="meta-item">
              <CalendarOutlined />
              <span>{formatDate(column.createTime)}</span>
            </div>
            <div className="meta-item">
              <span>{column.articleCount} 篇文章</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
